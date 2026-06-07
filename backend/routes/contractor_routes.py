from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File,
    Form
)

from sqlalchemy.orm import Session
import os, uuid

from models.user_model import User

from models.contractor_model import Contractor

from schemas.contractor_schema import (
    ContractorRegister
)

from utils.db import get_db

from auth.hashing import hash_password

router = APIRouter()

@router.post("/register-contractor")
def register_contractor(
    contractor: ContractorRegister,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.email == contractor.email
    ).first()

    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    hashed_password = hash_password(
        contractor.password
    )

    # USERS TABLE
    new_user = User(
        name=contractor.name,
        email=contractor.email,
        password=hashed_password,
        role="contractor",
        is_approved=False,
        is_rejected=False
    )

    db.add(new_user)

    db.commit()

    db.refresh(new_user)

    # CONTRACTORS TABLE
    new_contractor = Contractor(
        user_id=new_user.id,
        company=contractor.company,
        license_no=contractor.license_no,
        contact_info=contractor.contact_info
    )

    db.add(new_contractor)

    db.commit()

    return {
        "message":
        "Contractor Registration Submitted"
    }


@router.get("/contractor/my-bids")
def my_bids(contractor_user_id: int, db: Session = Depends(get_db)):
    contractor = db.query(Contractor).filter(Contractor.user_id == contractor_user_id).first()
    if not contractor:
        raise HTTPException(status_code=404, detail="Contractor not found")

    from models.tender_bid_model import TenderBid
    from models.tender_model import Tender

    results = []
    # Temporary debug logs to verify mapping from session user -> contractor -> bids
    print("incoming_user_id:", contractor_user_id)
    print("contractor.id:", contractor.id)
    bids = db.query(TenderBid).filter(TenderBid.contractor_id == contractor.id).order_by(TenderBid.created_at.desc()).all()
    print("bids:", bids)
    for b in bids:
        tender = db.query(Tender).filter(Tender.id == b.tender_id).first()
        results.append({
            "id": b.id,
            "tender_id": b.tender_id,
            "tender_title": tender.title if tender else None,
            "area": tender.area if tender else None,
            "bid_amount": float(b.bid_amount) if b.bid_amount is not None else None,
            "completion_days": b.completion_days,
            "status": b.status,
            "created_at": getattr(b, 'created_at', None)
        })

    return results


@router.get("/contractor/my-bids/{bid_id}")
def my_bid_detail(bid_id: int, contractor_user_id: int, db: Session = Depends(get_db)):
    from models.tender_bid_model import TenderBid
    from models.tender_model import Tender

    contractor = db.query(Contractor).filter(Contractor.user_id == contractor_user_id).first()
    if not contractor:
        raise HTTPException(status_code=404, detail="Contractor not found")

    bid = db.query(TenderBid).filter(TenderBid.id == bid_id, TenderBid.contractor_id == contractor.id).first()
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")

    tender = db.query(Tender).filter(Tender.id == bid.tender_id).first()

    return {
        "id": bid.id,
        "tender": {
            "id": tender.id if tender else None,
            "title": tender.title if tender else None,
            "area": tender.area if tender else None,
            "budget": float(tender.budget) if tender and tender.budget is not None else None,
            "deadline": getattr(tender, 'deadline', None),
            "status": tender.status if tender else None
        },
        "bid": {
            "bid_amount": float(bid.bid_amount) if bid.bid_amount is not None else None,
            "completion_days": bid.completion_days,
            "proposal_text": bid.proposal_text,
            "proposal_document": bid.proposal_document,
            "status": bid.status,
            "created_at": getattr(bid, 'created_at', None)
        }
    }


@router.put("/contractor/my-bids/{bid_id}")
async def update_my_bid(
    bid_id: int,
    contractor_user_id: int = Form(...),
    bid_amount: float = Form(None),
    completion_days: int = Form(None),
    proposal_text: str = Form(None),
    file: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    from models.tender_bid_model import TenderBid
    from models.tender_model import Tender

    contractor = db.query(Contractor).filter(Contractor.user_id == contractor_user_id).first()
    if not contractor:
        raise HTTPException(status_code=404, detail="Contractor not found")

    bid = db.query(TenderBid).filter(TenderBid.id == bid_id, TenderBid.contractor_id == contractor.id).first()
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")

    tender = db.query(Tender).filter(Tender.id == bid.tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")

    # Only allow edits while tender status is OPEN
    if tender.status and tender.status.lower() != "open":
        raise HTTPException(status_code=400, detail="This tender is no longer accepting bid modifications.")

    # handle file upload
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

    # apply edits
    if bid_amount is not None:
        bid.bid_amount = bid_amount
    if completion_days is not None:
        bid.completion_days = completion_days
    if proposal_text is not None:
        bid.proposal_text = proposal_text
    if proposal_path:
        bid.proposal_document = proposal_path

    db.add(bid)
    db.commit()
    db.refresh(bid)

    return {"message": "Bid updated", "bid_id": bid.id}


@router.get("/contractor/dashboard-stats")
def contractor_dashboard_stats(contractor_user_id: int, db: Session = Depends(get_db)):
    from models.tender_bid_model import TenderBid
    from models.tender_model import Tender

    contractor = db.query(Contractor).filter(Contractor.user_id == contractor_user_id).first()
    if not contractor:
        raise HTTPException(status_code=404, detail="Contractor not found")

    # Available Tenders: tenders with status 'open'
    available_tenders = db.query(Tender).filter(Tender.status != None).filter(Tender.status.ilike('open')).count()

    # My Applications: count of bids by this contractor
    my_applications = db.query(TenderBid).filter(TenderBid.contractor_id == contractor.id).count()

    # Awarded Projects: bids for this contractor with status 'awarded' OR tenders assigned to contractor and tender.status='awarded'
    awarded_bids = db.query(TenderBid).filter(TenderBid.contractor_id == contractor.id, TenderBid.status.ilike('awarded')).count()
    awarded_tenders = db.query(Tender).filter(Tender.contractor_id == contractor.id, Tender.status.ilike('awarded')).count()
    awarded_projects = max(awarded_bids, awarded_tenders)

    # Completed Projects: tenders assigned to contractor with status 'completed'
    completed_projects = db.query(Tender).filter(Tender.contractor_id == contractor.id, Tender.status.ilike('completed')).count()

    return {
        "available_tenders": available_tenders,
        "my_applications": my_applications,
        "awarded_projects": awarded_projects,
        "completed_projects": completed_projects
    }