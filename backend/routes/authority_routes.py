from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from models.user_model import User

from models.authority_model import Authority

from schemas.authority_schema import (
    AuthorityRegister
)

from utils.db import get_db

from auth.hashing import hash_password

router = APIRouter()

@router.post("/register-authority")
def register_authority(
    authority: AuthorityRegister,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.email == authority.email
    ).first()

    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    hashed_password = hash_password(
        authority.password
    )

    # USERS TABLE
    new_user = User(
        name=authority.name,
        email=authority.email,
        password=hashed_password,
        role="authority",
        is_approved=False,
        is_rejected=False
    )

    db.add(new_user)

    db.commit()

    db.refresh(new_user)

    # AUTHORITIES TABLE
    new_authority = Authority(
        user_id=new_user.id,
        nid=authority.nid,
        address=authority.address
    )

    db.add(new_authority)

    db.commit()

    return {
        "message":
        "Authority Registration Submitted"
    }