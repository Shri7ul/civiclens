from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from utils.db import get_db

from models.crime_assignment_model import (
    CrimeAssignment
)

from models.police_model import (
    PoliceRequest
)

from models.officer_model import (
    Officer
)

from models.user_model import (
    User
)

from models.audit_log_model import (
    AuditLog
)
from schemas.crime_assignment_schema import (
    CrimeAssignmentCreate
)

router = APIRouter()


@router.post("/assign-case")
def assign_case(
    payload: CrimeAssignmentCreate,
    db: Session = Depends(get_db)
):

    # Ensure police request exists
    police_req = db.query(PoliceRequest).filter(
        PoliceRequest.id == payload.police_request_id
    ).first()

    if not police_req:
        raise HTTPException(status_code=404, detail="Police request not found")

    # prevent duplicate assignment
    existing = db.query(CrimeAssignment).filter(
        CrimeAssignment.police_request_id == payload.police_request_id
    ).first()

    if existing:
        return {"message": "Case already assigned"}

    new_assignment = CrimeAssignment(
        police_request_id=payload.police_request_id,
        officer_id=payload.officer_id,
        assigned_by_authority_id=payload.assigned_by_authority_id if hasattr(payload, 'assigned_by_authority_id') else None
    )

    db.add(new_assignment)

    # audit log for assignment if authority id provided
    if getattr(payload, 'assigned_by_authority_id', None):
        log = AuditLog(user_id=payload.assigned_by_authority_id, action=f"Assigned case #{payload.police_request_id} to officer {payload.officer_id}")
        db.add(log)

    db.commit()

    return {"message": "Officer assigned to case successfully"}


@router.post("/reassign-case")
def reassign_case(payload: CrimeAssignmentCreate, db: Session = Depends(get_db)):
    # payload should include police_request_id, officer_id (new), assigned_by_authority_id
    assignment = db.query(CrimeAssignment).filter(CrimeAssignment.police_request_id == payload.police_request_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found for given police_request_id")

    old_officer = assignment.officer_id
    assignment.officer_id = payload.officer_id
    assignment.assigned_by_authority_id = getattr(payload, 'assigned_by_authority_id', None)
    db.add(assignment)

    if getattr(payload, 'assigned_by_authority_id', None):
        log = AuditLog(user_id=payload.assigned_by_authority_id, action=f"Reassigned case #{payload.police_request_id} to officer {payload.officer_id}")
        db.add(log)

    db.commit()
    return {"message": "Case reassigned successfully"}


@router.patch("/update-case-status")
def update_case_status(payload: dict, db: Session = Depends(get_db)):
    police_request_id = payload.get('police_request_id')
    status = payload.get('status')
    authority_id = payload.get('authority_id')

    if not police_request_id or status is None:
        raise HTTPException(status_code=400, detail="police_request_id and status are required")

    pr = db.query(PoliceRequest).filter(PoliceRequest.id == police_request_id).first()
    if not pr:
        raise HTTPException(status_code=404, detail="Police request not found")

    pr.status = status
    db.add(pr)

    if authority_id:
        # create appropriate action message
        if str(status).lower() in ["resolved", "closed"]:
            action = f"Marked case #{police_request_id} as resolved"
        else:
            action = f"Updated case #{police_request_id} status to {status}"
        log = AuditLog(user_id=authority_id, action=action)
        db.add(log)

    db.commit()
    return {"message": "Case status updated"}


@router.get("/assigned-cases/{officer_id}")
def get_assigned_cases(
    officer_id: int,
    db: Session = Depends(get_db)
):

    requests = db.query(PoliceRequest).join(
        CrimeAssignment,
        CrimeAssignment.police_request_id == PoliceRequest.id
    ).filter(
        CrimeAssignment.officer_id == officer_id
    ).all()

    return requests



@router.get("/unassigned-police-requests")
def get_unassigned_police_requests(
    db: Session = Depends(get_db)
):

    # left outer join PoliceRequest -> CrimeAssignment and filter where CrimeAssignment.id is None
    from sqlalchemy import outerjoin

    q = db.query(PoliceRequest).outerjoin(
        CrimeAssignment,
        CrimeAssignment.police_request_id == PoliceRequest.id
    ).filter(
        CrimeAssignment.id == None
    ).all()

    results = []
    for r in q:
        results.append({
            "id": r.id,
            "category": r.category,
            "request_type": r.request_type,
            "description": r.description,
            "area": getattr(r, 'area', None),
            "status": r.status,
            "created_at": getattr(r, 'created_at', None)
        })

    return results


@router.get("/all-officers")
def get_all_officers(
    db: Session = Depends(get_db)
):

    # join officers with users to get name and only approved users
    results = db.query(Officer, User).join(
        User, Officer.user_id == User.id
    ).filter(
        User.is_approved == True
    ).all()

    out = []
    for officer, user in results:
        # compute workload: active and resolved counts for officer
        active_count = db.query(CrimeAssignment).join(PoliceRequest, CrimeAssignment.police_request_id == PoliceRequest.id).filter(
            CrimeAssignment.officer_id == officer.id,
            PoliceRequest.status.notin_(['Resolved', 'Closed'])
        ).count()

        resolved_count = db.query(CrimeAssignment).join(PoliceRequest, CrimeAssignment.police_request_id == PoliceRequest.id).filter(
            CrimeAssignment.officer_id == officer.id,
            PoliceRequest.status.in_(['Resolved', 'Closed'])
        ).count()

        out.append({
            "id": officer.id,
            "name": user.name,
            "designation": officer.designation,
            "area": officer.area,
            "specialization": getattr(officer, 'specialization', None),
            "active_cases": active_count,
            "resolved_cases": resolved_count
        })

    return out


@router.get("/assigned-cases")
def get_all_assigned_cases(
    db: Session = Depends(get_db)
):
    # Return one active assignment per police request (latest assignment)
    from sqlalchemy import func

    # subquery to get latest assignment id for each police_request_id
    subq = db.query(func.max(CrimeAssignment.id).label("max_id")).group_by(CrimeAssignment.police_request_id).subquery()

    # join CrimeAssignment (latest) -> PoliceRequest -> Officer
    results = db.query(CrimeAssignment, PoliceRequest, Officer).join(
        subq, CrimeAssignment.id == subq.c.max_id
    ).join(
        PoliceRequest, CrimeAssignment.police_request_id == PoliceRequest.id
    ).join(
        Officer, CrimeAssignment.officer_id == Officer.id
    ).all()

    out = []
    for assign, pr, officer in results:
        # try to get officer's user name
        from models.user_model import User
        from models.case_update_model import CaseUpdate
        user = db.query(User).filter(User.id == officer.user_id).first()

        # fetch latest case update timestamp if exists
        latest_update = db.query(CaseUpdate).filter(CaseUpdate.police_request_id == pr.id).order_by(CaseUpdate.updated_at.desc()).first()
        last_update_ts = latest_update.updated_at if latest_update else (getattr(pr, 'updated_at', None) or getattr(pr, 'created_at', None))

        out.append({
            "assignment_id": assign.id,
            "police_request_id": pr.id,
            "category": pr.category,
            "request_type": pr.request_type,
            "status": pr.status,
            "assigned_officer_id": officer.id,
            "assigned_officer_name": user.name if user else None,
            "designation": officer.designation,
            "area": officer.area,
            "last_update": last_update_ts
        })

    return out
