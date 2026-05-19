from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from utils.db import get_db

from models.case_update_model import (
    CaseUpdate
)

from models.police_model import (
    PoliceRequest
)

from models.notification_model import (
    Notification
)

from models.crime_assignment_model import (
    CrimeAssignment
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

from datetime import datetime

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

    # if officer marks as Solved, set citizen confirmation pending and notify the case owner
    try:
        if str(payload.case_status).strip().lower() == "solved":
            police_req.citizen_confirmation_pending = True
            # keep assignments intact until citizen responds
            note = f"Officer marked your case #{police_req.id} as Solved. Please confirm if the issue is resolved or mark Not Solved."
            notif = Notification(user_id=police_req.user_id, message=note, req_id=police_req.id)
            db.add(notif)
            # add explicit timeline log entry for officer marking solved
            solved_log = CaseUpdate(police_request_id=payload.police_request_id, update_message="Officer marked case as Solved", case_status="Solved")
            db.add(solved_log)
    except Exception:
        # do not block the main flow if notification fails
        pass

    db.commit()

    return {"message": "Case update added successfully"}


@router.post("/case/confirm-solved")
def confirm_solved(payload: dict, db: Session = Depends(get_db)):
    police_request_id = payload.get("police_request_id")
    user_id = payload.get("user_id")

    if not police_request_id or not user_id:
        raise HTTPException(status_code=400, detail="police_request_id and user_id are required")

    pr = db.query(PoliceRequest).filter(PoliceRequest.id == police_request_id).first()
    if not pr:
        raise HTTPException(status_code=404, detail="Police request not found")

    if pr.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to confirm this case")

    # set closed state, clear pending flag, archive and set resolved time
    pr.status = "Closed"
    pr.citizen_confirmation_pending = False
    pr.is_archived = True
    pr.resolved_at = datetime.utcnow()
    db.add(pr)

    # add case update log
    cu = CaseUpdate(police_request_id=police_request_id, update_message="Citizen confirmed case as solved", case_status="Closed")
    db.add(cu)
    # archived log entry
    arch = CaseUpdate(police_request_id=police_request_id, update_message="Case archived after confirmation", case_status="Closed")
    db.add(arch)

    # fetch assignments first so we can notify officers and increment counters, then remove assignments
    assigns = db.query(CrimeAssignment).filter(CrimeAssignment.police_request_id == police_request_id).all()

    # remove any assignments for the case
    db.query(CrimeAssignment).filter(CrimeAssignment.police_request_id == police_request_id).delete()
    for a in assigns:
        officer = db.query(Officer).filter(Officer.id == a.officer_id).first()
        if officer:
            # increment resolved counter
            try:
                officer.resolved_cases = (officer.resolved_cases or 0) + 1
                db.add(officer)
            except Exception:
                pass
            # try get the user's id for officer
            user = db.query(User).filter(User.id == officer.user_id).first()
            if user:
                msg = f"Citizen confirmed case #{police_request_id} as solved. Case is now closed."
                db.add(Notification(user_id=user.id, message=msg, req_id=police_request_id))

    # audit log
    db.add(AuditLog(user_id=user_id, action=f"Citizen confirmed solved for case #{police_request_id}"))

    db.commit()

    return {"message": "Case confirmed closed"}


@router.post("/case/reject-solved")
def reject_solved(payload: dict, db: Session = Depends(get_db)):
    police_request_id = payload.get("police_request_id")
    user_id = payload.get("user_id")

    if not police_request_id or not user_id:
        raise HTTPException(status_code=400, detail="police_request_id and user_id are required")

    pr = db.query(PoliceRequest).filter(PoliceRequest.id == police_request_id).first()
    if not pr:
        raise HTTPException(status_code=404, detail="Police request not found")

    if pr.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to reject this case")

    # set back to under investigation
    pr.status = "Under Investigation"
    pr.citizen_confirmation_pending = False
    db.add(pr)

    # add case update log
    cu = CaseUpdate(police_request_id=police_request_id, update_message="Citizen rejected solved status", case_status="Under Investigation")
    db.add(cu)

    # notify assigned officers about rejection
    assigns = db.query(CrimeAssignment).filter(CrimeAssignment.police_request_id == police_request_id).all()
    for a in assigns:
        officer = db.query(Officer).filter(Officer.id == a.officer_id).first()
        if officer:
            user = db.query(User).filter(User.id == officer.user_id).first()
            if user:
                msg = f"Citizen marked case #{police_request_id} as Not Solved. Please review and continue investigation."
                db.add(Notification(user_id=user.id, message=msg, req_id=police_request_id))

    db.add(AuditLog(user_id=user_id, action=f"Citizen rejected solved for case #{police_request_id}"))

    db.commit()

    return {"message": "Case marked as not solved"}


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
