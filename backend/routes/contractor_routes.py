from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

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