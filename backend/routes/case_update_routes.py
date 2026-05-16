from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from utils.db import get_db

from models.case_update_model import (
    CaseUpdate
)

from models.police_model import (
    PoliceRequest
)

from schemas.case_update_schema import (
    CaseUpdateCreate
)

router = APIRouter()


@router.post("/add-case-update")
def add_case_update(
    payload: CaseUpdateCreate,
    db: Session = Depends(get_db)
):

    police_req = db.query(PoliceRequest).filter(
        PoliceRequest.id == payload.police_request_id
    ).first()

    if not police_req:
        raise HTTPException(status_code=404, detail="Police request not found")

    new_update = CaseUpdate(
        police_request_id=payload.police_request_id,
        update_message=payload.update_message,
        case_status=payload.case_status
    )

    db.add(new_update)

    # update the police request status
    police_req.status = payload.case_status

    db.commit()

    return {"message": "Case update added successfully"}


@router.get("/case-updates/{police_request_id}")
def get_case_updates(
    police_request_id: int,
    db: Session = Depends(get_db)
):

    updates = db.query(CaseUpdate).filter(
        CaseUpdate.police_request_id == police_request_id
    ).order_by(
        CaseUpdate.updated_at.desc()
    ).all()

    return updates
