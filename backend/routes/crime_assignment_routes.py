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
        assigned_by_authority_id=None
    )

    db.add(new_assignment)
    db.commit()

    return {"message": "Officer assigned to case successfully"}


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
        out.append({
            "id": officer.id,
            "name": user.name,
            "designation": officer.designation,
            "area": officer.area
        })

    return out
