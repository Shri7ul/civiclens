from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from utils.db import get_db

from models.user_model import User
from models.officer_model import Officer
from models.authority_model import Authority
from models.contractor_model import Contractor
from models.police_model import PoliceRequest
from models.audit_log_model import AuditLog

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
    admin_id = payload.get('admin_id')
    if not admin_id:
        raise HTTPException(status_code=400, detail="admin_id is required in body")

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

    log = AuditLog(user_id=admin_id, action=f"Rejected {user.role} user {user.id}")
    db.add(log)

    db.commit()

    return {"message": f"User {user.id} rejected"}


@router.get("/system-stats")
def system_stats(db: Session = Depends(get_db)):
    total_users = db.query(User).count()
    total_officers = db.query(Officer).count()
    total_authorities = db.query(Authority).count()
    total_contractors = db.query(Contractor).count()
    total_police_requests = db.query(PoliceRequest).count()

    # active investigations: police requests not closed
    active_investigations = db.query(PoliceRequest).filter(PoliceRequest.status != 'Closed').count()

    return {
        'total_users': total_users,
        'total_officers': total_officers,
        'total_authorities': total_authorities,
        'total_contractors': total_contractors,
        'total_police_requests': total_police_requests,
        'total_active_investigations': active_investigations
    }
