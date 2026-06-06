from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
import os, uuid

from models.tender_model import Tender
from models.contractor_model import Contractor
from models.user_model import User
from models.notification_model import Notification
from models.tender_bid_model import TenderBid
from schemas.tender_schema import TenderCreate
from schemas.tender_bid_schema import TenderBidCreate
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


@router.get("/tenders/{tender_id}")
def get_tender(tender_id: int, db: Session = Depends(get_db)):
    t = db.query(Tender).filter(Tender.id == tender_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Tender not found")
    return t


@router.post("/tenders/{tender_id}/apply")
async def apply_tender(
    tender_id: int,
    contractor_user_id: int = Form(...),
    bid_amount: float = Form(...),
    completion_days: int = Form(...),
    proposal_text: str = Form(None),
    file: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")

    # find contractor record
    contractor = db.query(Contractor).filter(Contractor.user_id == contractor_user_id).first()
    if not contractor:
        raise HTTPException(status_code=404, detail="Contractor not found")

    proposal_path = None
    if file:
        UPLOAD_DIR = os.path.join(os.getcwd(), "uploads", "tender_proposals")
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        orig_name = file.filename or "proposal"
        _, ext = os.path.splitext(orig_name)
        unique_name = f"{uuid.uuid4().hex}{ext}"
        dest_path = os.path.join(UPLOAD_DIR, unique_name)
        contents = await file.read()
        try:
            with open(dest_path, "wb") as f:
                f.write(contents)
            proposal_path = os.path.relpath(dest_path, os.getcwd())
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to save file: {e}")

    bid = TenderBid(
        tender_id=tender_id,
        contractor_id=contractor.id,
        bid_amount=bid_amount,
        completion_days=completion_days,
        proposal_text=proposal_text,
        proposal_document=proposal_path,
        status="pending"
    )
    db.add(bid)
    db.commit()
    db.refresh(bid)

    return {"message": "Bid submitted", "bid_id": bid.id}


@router.get("/tenders/{tender_id}/bids")
def tender_bids(tender_id: int, db: Session = Depends(get_db)):
    bids = db.query(TenderBid).filter(TenderBid.tender_id == tender_id).order_by(TenderBid.bid_amount.asc()).all()
    out = []
    for b in bids:
        contractor = db.query(Contractor).filter(Contractor.id == b.contractor_id).first()
        user = db.query(User).filter(User.id == contractor.user_id).first() if contractor else None
        out.append({
            "id": b.id,
            "tender_id": b.tender_id,
            "contractor_id": b.contractor_id,
            "contractor_name": user.name if user else None,
            "company_name": contractor.company if contractor else None,
            "bid_amount": float(b.bid_amount) if b.bid_amount is not None else None,
            "completion_days": b.completion_days,
            "proposal_text": b.proposal_text,
            "proposal_document": b.proposal_document,
            "status": b.status,
            "created_at": getattr(b, 'created_at', None)
        })
    return out


@router.post("/tenders/{tender_id}/award")
def award_tender(tender_id: int, bid_id: int, db: Session = Depends(get_db)):
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    bid = db.query(TenderBid).filter(TenderBid.id == bid_id, TenderBid.tender_id == tender_id).first()
    if not tender or not bid:
        raise HTTPException(status_code=404, detail="Tender or bid not found")

    # mark tender awarded and set contractor
    tender.status = "awarded"
    tender.contractor_id = bid.contractor_id
    db.add(tender)

    # update bids: awarded for winner, rejected for others
    all_bids = db.query(TenderBid).filter(TenderBid.tender_id == tender_id).all()
    for b in all_bids:
        if b.id == bid.id:
            b.status = "awarded"
        else:
            b.status = "rejected"
        db.add(b)

    # create notification for winning contractor (find user)
    contractor = db.query(Contractor).filter(Contractor.id == bid.contractor_id).first()
    if contractor:
        user = db.query(User).filter(User.id == contractor.user_id).first()
        if user:
            note = Notification(user_id=user.id, message=f"You were awarded tender #{tender.id}: {tender.title}", req_id=tender.id)
            db.add(note)

    db.commit()

    return {"message": "Tender awarded"}