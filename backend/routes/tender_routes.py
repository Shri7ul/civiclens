from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from models.tender_model import Tender
from models.contractor_model import Contractor
from schemas.tender_schema import TenderCreate
from utils.db import get_db

router = APIRouter()

@router.get("/tenders")
def get_tenders(db: Session = Depends(get_db)):

    tenders = db.query(Tender).all()

    return tenders

@router.post("/add-tender")
def add_tender(
    tender: TenderCreate,
    db: Session = Depends(get_db)
):

    new_tender = Tender(
        title=tender.title,
        area=tender.area,
        budget=tender.budget,
        deadline=tender.deadline,
        status=tender.status
    )

    db.add(new_tender)
    db.commit()
    db.refresh(new_tender)

    return {
        "message": "Tender Added Successfully"
    }


@router.get("/tender-participation-status/{user_id}")
def tender_participation_status(user_id: int, db: Session = Depends(get_db)):
    """Return participation / assignment records for a contractor identified by user_id.

    This uses the existing `contractors` and `tenders` tables. If the user is not a
    contractor or no assignments exist, returns an empty list.
    """
    # find contractor record by user_id
    contractor = db.query(Contractor).filter(Contractor.user_id == user_id).first()
    if not contractor:
        return []

    # assigned / awarded tenders where tender.contractor_id == contractor.id
    assigned = db.query(Tender).filter(Tender.contractor_id == contractor.id).all()

    out = []
    for t in assigned:
        out.append({
            "id": t.id,
            "tender_id": t.id,
            "tender_title": t.title,
            "status": t.status or "assigned",
            "submitted_at": None,
            "remarks": None,
        })

    return out