from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from models.tender_model import Tender
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