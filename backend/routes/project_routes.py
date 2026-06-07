from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List

from models.tender_model import Tender
from models.contractor_model import Contractor
from models.user_model import User
from models.project_update_model import ProjectUpdate
from models.tender_bid_model import TenderBid
from utils.db import get_db

router = APIRouter()

@router.get("/contractor/awarded-projects")
def awarded_projects(contractor_user_id: int, db: Session = Depends(get_db)):
    contractor = db.query(Contractor).filter(Contractor.user_id == contractor_user_id).first()
    if not contractor:
        raise HTTPException(status_code=404, detail="Contractor not found")

    # tenders assigned to contractor where status is awarded or in progress or completed
    tenders = db.query(Tender).filter(Tender.contractor_id == contractor.id).filter(Tender.status.in_(["awarded", "in_progress", "completed", "closed"])) .all()

    out = []
    for t in tenders:
        # find awarded bid
        bid = db.query(TenderBid).filter(TenderBid.tender_id == t.id, TenderBid.status.ilike('awarded')).first()
        authority = db.query(User).filter(User.id == t.contractor_id).first() if t.contractor_id else None

        # latest progress
        latest = db.query(ProjectUpdate).filter(ProjectUpdate.tender_id == t.id).order_by(ProjectUpdate.created_at.desc()).first()
        progress = latest.progress_percent if latest else 0

        # timeline (latest 10)
        updates = db.query(ProjectUpdate).filter(ProjectUpdate.tender_id == t.id).order_by(ProjectUpdate.created_at.desc()).limit(20).all()
        updates_out = []
        for u in updates:
            updates_out.append({
                "id": u.id,
                "progress_percent": u.progress_percent,
                "update_text": u.update_text,
                "created_at": u.created_at
            })

        out.append({
            "tender_id": t.id,
            "title": t.title,
            "area": t.area,
            "authority_name": None,
            "award_date": getattr(t, 'awarded_at', None),
            "awarded_bid_amount": float(bid.bid_amount) if bid and bid.bid_amount is not None else None,
            "awarded_completion_days": bid.completion_days if bid else None,
            "progress_percent": progress,
            "status": t.status,
            "updates": updates_out
        })

    return out


@router.get("/projects/{tender_id}/updates")
def project_updates(tender_id: int, db: Session = Depends(get_db)):
    updates = db.query(ProjectUpdate).filter(ProjectUpdate.tender_id == tender_id).order_by(ProjectUpdate.created_at.desc()).all()
    out = []
    for u in updates:
        out.append({
            "id": u.id,
            "tender_id": u.tender_id,
            "contractor_id": u.contractor_id,
            "progress_percent": u.progress_percent,
            "update_text": u.update_text,
            "created_at": u.created_at
        })
    return out


@router.post("/projects/{tender_id}/updates")
def add_project_update(tender_id: int, contractor_user_id: int, progress_percent: int, update_text: str = None, db: Session = Depends(get_db)):
    contractor = db.query(Contractor).filter(Contractor.user_id == contractor_user_id).first()
    if not contractor:
        raise HTTPException(status_code=404, detail="Contractor not found")

    tender = db.query(Tender).filter(Tender.id == tender_id, Tender.contractor_id == contractor.id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found or not assigned to contractor")

    # get latest progress
    latest = db.query(ProjectUpdate).filter(ProjectUpdate.tender_id == tender_id).order_by(ProjectUpdate.created_at.desc()).first()
    last_progress = latest.progress_percent if latest else 0

    if progress_percent < last_progress:
        raise HTTPException(status_code=400, detail="Progress percent cannot decrease")
    if progress_percent > 100:
        raise HTTPException(status_code=400, detail="Progress percent cannot exceed 100")

    pu = ProjectUpdate(
        tender_id=tender_id,
        contractor_id=contractor.id,
        progress_percent=progress_percent,
        update_text=update_text
    )
    db.add(pu)

    # if reached 100, mark tender completed
    if progress_percent == 100:
        tender.status = "completed"
        db.add(tender)

    db.commit()
    db.refresh(pu)

    return {"message": "Update saved", "update_id": pu.id}
