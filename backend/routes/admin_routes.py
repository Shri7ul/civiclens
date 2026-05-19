from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from utils.db import get_db

from models.user_model import User
from models.officer_model import Officer
from models.authority_model import Authority
from models.contractor_model import Contractor
from models.police_model import PoliceRequest
from models.audit_log_model import AuditLog
from models.admin_model import Admin
from utils.admin_utils import resolve_admin_id
from auth.hashing import hash_password
from models.user_model import User

router = APIRouter()


@router.get("/pending-officers")
def pending_officers(db: Session = Depends(get_db)):
    results = db.query(User, Officer).join(Officer, Officer.user_id == User.id).filter(
        User.role == 'officer',
        User.is_approved == False,
        User.is_rejected == False
    ).all()

    out = []
    for user, officer in results:
        out.append({
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'designation': officer.designation,
            'area': officer.area
        })

    return out


@router.get("/pending-authorities")
def pending_authorities(db: Session = Depends(get_db)):
    results = db.query(User, Authority).join(Authority, Authority.user_id == User.id).filter(
        User.role == 'authority',
        User.is_approved == False,
        User.is_rejected == False
    ).all()

    out = []
    for user, auth in results:
        out.append({
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'nid': auth.nid,
            'address': auth.address
        })

    return out


@router.get("/pending-contractors")
def pending_contractors(db: Session = Depends(get_db)):
    results = db.query(User, Contractor).join(Contractor, Contractor.user_id == User.id).filter(
        User.role == 'contractor',
        User.is_approved == False,
        User.is_rejected == False
    ).all()

    out = []
    for user, c in results:
        out.append({
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'company': c.company,
            'contact_info': c.contact_info
        })

    return out


@router.put("/approve-user/{user_id}")
def approve_user(user_id: int, payload: dict, db: Session = Depends(get_db)):
    raw_admin_id = payload.get('admin_id')
    if not raw_admin_id:
        raise HTTPException(status_code=400, detail="admin_id is required in body")

    # resolve provided identifier (could be admin.id or user.id)
    admin_id = resolve_admin_id(db, raw_admin_id)
    if not admin_id:
        raise HTTPException(status_code=400, detail="Admin record not found for given admin id or user id")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_approved = True
    db.add(user)

    # set created_by_admin_id in related table
    if user.role == 'officer':
        officer = db.query(Officer).filter(Officer.user_id == user.id).first()
        if officer:
            officer.created_by_admin_id = admin_id
            db.add(officer)

    if user.role == 'authority':
        auth = db.query(Authority).filter(Authority.user_id == user.id).first()
        if auth:
            auth.created_by_admin_id = admin_id
            db.add(auth)

    if user.role == 'contractor':
        cont = db.query(Contractor).filter(Contractor.user_id == user.id).first()
        if cont:
            cont.created_by_admin_id = admin_id
            db.add(cont)

    # audit log
    log = AuditLog(user_id=admin_id, action=f"Approved {user.role} user {user.id}")
    db.add(log)

    db.commit()
    print("AUDIT LOG SAVED")

    return {"message": f"User {user.id} approved"}


@router.put("/reject-user/{user_id}")
def reject_user(user_id: int, payload: dict, db: Session = Depends(get_db)):
    admin_id = payload.get('admin_id')
    if not admin_id:
        raise HTTPException(status_code=400, detail="admin_id is required in body")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_rejected = True
    db.add(user)

    # resolve admin identifier to admins.id if needed
    resolved_admin = resolve_admin_id(db, admin_id)
    if not resolved_admin:
        raise HTTPException(status_code=400, detail="Admin record not found for given admin id or user id")

    log = AuditLog(user_id=resolved_admin, action=f"Rejected {user.role} user {user.id}")
    db.add(log)

    db.commit()
    print("AUDIT LOG SAVED")

    return {"message": f"User {user.id} rejected"}


@router.get("/system-stats")
def system_stats(db: Session = Depends(get_db)):
    total_users = db.query(User).count()
    total_officers = db.query(Officer).count()
    total_authorities = db.query(Authority).count()
    total_contractors = db.query(Contractor).count()
    total_police_requests = db.query(PoliceRequest).count()
    # Unassigned cases: police_requests where no CrimeAssignment and not Closed and not archived
    from models.crime_assignment_model import CrimeAssignment
    from sqlalchemy import outerjoin, func, or_, and_

    subq_assigned = db.query(CrimeAssignment.police_request_id).subquery()
    total_unassigned = db.query(PoliceRequest).filter(~PoliceRequest.id.in_(subq_assigned), PoliceRequest.status != 'Closed', PoliceRequest.is_archived == False).count()

    # Active investigations: statuses in the active set and not archived
    active_statuses = ['Under Investigation', 'Evidence Collected', 'Suspect Identified', 'Solved']
    total_active_investigations = db.query(PoliceRequest).filter(PoliceRequest.status.in_(active_statuses), PoliceRequest.is_archived == False).count()

    # Assigned officers: distinct officer ids assigned to active cases
    distinct_officers_q = db.query(func.count(func.distinct(CrimeAssignment.officer_id))).join(PoliceRequest, CrimeAssignment.police_request_id == PoliceRequest.id).filter(PoliceRequest.is_archived == False, PoliceRequest.status != 'Closed')
    total_assigned_officers = distinct_officers_q.scalar() or 0

    # Resolved cases: status = Closed OR is_archived = True
    total_resolved_cases = db.query(PoliceRequest).filter(or_(PoliceRequest.status == 'Closed', PoliceRequest.is_archived == True)).count()

    # Active assignments: latest assignment per request for active (not archived/closed) cases
    from models.crime_assignment_model import CrimeAssignment as CA
    from models.case_update_model import CaseUpdate
    from models.user_model import User as UserModel

    # subquery: latest assignment id per police_request
    latest_subq = db.query(func.max(CA.id).label('max_id')).group_by(CA.police_request_id).subquery()

    assigned_results = db.query(CA, PoliceRequest, Officer, UserModel).join(latest_subq, CA.id == latest_subq.c.max_id).join(PoliceRequest, CA.police_request_id == PoliceRequest.id).join(Officer, CA.officer_id == Officer.id).join(UserModel, Officer.user_id == UserModel.id).filter(PoliceRequest.is_archived == False, PoliceRequest.status != 'Closed').all()

    active_assignments = []
    for assign, pr, officer, user in assigned_results:
        # last update
        last_update = db.query(CaseUpdate).filter(CaseUpdate.police_request_id == pr.id).order_by(CaseUpdate.updated_at.desc()).first()
        last_update_ts = last_update.updated_at if last_update else (getattr(pr, 'updated_at', None) or getattr(pr, 'created_at', None))
        # workload: active cases for officer
        active_workload = db.query(CA).join(PoliceRequest, CA.police_request_id == PoliceRequest.id).filter(CA.officer_id == officer.id, PoliceRequest.is_archived == False, PoliceRequest.status != 'Closed').count()
        active_assignments.append({
            'police_request_id': pr.id,
            'officer_name': user.name,
            'designation': officer.designation,
            'area': officer.area,
            'status': pr.status,
            'last_update': last_update_ts,
            'active_workload': active_workload
        })

    # Recent authority activity: filter audit logs for assignment, reassign, solved confirm, archive
    recent = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(50).all()
    recent_activity = []
    for r in recent:
        text = r.action or ''
        if any(k in text for k in ['Assigned case', 'Reassigned case', 'confirmed solved', 'rejected solved', 'archived', 'Marked case']):
            recent_activity.append({'user_id': r.user_id, 'action': text, 'timestamp': r.timestamp})

    return {
        'total_users': total_users,
        'total_officers': total_officers,
        'total_authorities': total_authorities,
        'total_contractors': total_contractors,
        'total_police_requests': total_police_requests,
        'total_unassigned_cases': total_unassigned,
        'total_active_investigations': total_active_investigations,
        'total_assigned_officers': total_assigned_officers,
        'total_resolved_cases': total_resolved_cases,
        'active_assignments': active_assignments,
        'recent_activity': recent_activity
    }


@router.get("/audit-logs")
def audit_logs(db: Session = Depends(get_db)):
    results = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(50).all()
    out = []
    for r in results:
        out.append({
            'user_id': r.user_id,
            'action': r.action
        })
    return out


@router.get("/admin-by-user/{user_id}")
def admin_by_user(user_id: int, db: Session = Depends(get_db)):
    """Find admin record mapped to a user id.

    Returns {"admin_id": id} or 404 if not found.
    """
    admin = db.query(Admin).filter(Admin.user_id == user_id).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin record not found for given user_id")
    return {"admin_id": admin.id}


@router.post("/register-admin")
def register_admin(payload: dict, db: Session = Depends(get_db)):
    """Register an admin using a server-side invitation code.

    Body: { invitation_code, name, email, phone, password }
    """
    invite = payload.get('invitation_code')
    name = payload.get('name')
    email = payload.get('email')
    phone = payload.get('phone')
    password = payload.get('password')

    if invite != "8899":
        return {"message": "Invalid Invitation Code"}

    if not (name and email and password):
        raise HTTPException(status_code=400, detail="name, email and password are required")

    # check existing user
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    hashed = hash_password(password)

    user = User(
        name=name,
        email=email,
        password=hashed,
        role="admin",
        is_approved=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # create admins table entry
    admin = Admin(
        user_id=user.id,
        name=name,
        email=email,
        phone=phone
    )
    db.add(admin)
    db.commit()

    return {"message": "Admin Registered Successfully"}
