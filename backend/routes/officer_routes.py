from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from models.user_model import User
from models.officer_model import Officer

from schemas.officer_schema import (
    OfficerRegister
)

from utils.db import get_db

from auth.hashing import hash_password

router = APIRouter()

@router.post("/register-officer")
def register_officer(
    officer: OfficerRegister,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.email == officer.email
    ).first()

    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    hashed_password = hash_password(
        officer.password
    )

    # USERS TABLE
    new_user = User(
        name=officer.name,
        email=officer.email,
        password=hashed_password,
        role="officer",
        is_approved=False,
        is_rejected=False
    )

    db.add(new_user)

    db.commit()

    db.refresh(new_user)

    # OFFICERS TABLE
    new_officer = Officer(
        user_id=new_user.id,
        nid=officer.nid,
        designation=officer.designation,
        address=officer.address,
        area=officer.area
    )

    # optional specialization
    if hasattr(officer, 'specialization') and officer.specialization:
        new_officer.specialization = officer.specialization

    db.add(new_officer)

    db.commit()

    return {
        "message":
        "Officer Registration Submitted For Approval"
    }


@router.get("/officer-by-user/{user_id}")
def get_officer_by_user(
    user_id: int,
    db: Session = Depends(get_db)
):

    officer = db.query(Officer).filter(
        Officer.user_id == user_id
    ).first()

    if not officer:
        raise HTTPException(status_code=404, detail="Officer record not found")

    return {"officer_id": officer.id}