from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from models.user_model import User
from models.officer_model import Officer
from models.authority_model import Authority
from models.contractor_model import Contractor
from random import randint

from schemas.user_schema import (
    UserCreate,
    UserLogin
)

from utils.db import get_db

from auth.hashing import (
    hash_password,
    verify_password
)

from auth.jwt_handler import (
    create_access_token
)

from models.user_profile_model import (
    UserProfile
)

from models.user_verification_model import (
    UserVerification
)
from models.user_verification_model import (
    UserVerification
)
from utils.admin_utils import resolve_admin_id


router = APIRouter()

# GET USERS
@router.get("/users")
def get_users(
    db: Session = Depends(get_db)
):

    users = db.query(User).all()

    return users


# REGISTER
@router.post("/register")
def register_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    # confirm password validation (if provided)
    if getattr(user, "confirm_password", None) is not None:
        if user.confirm_password != user.password:
            raise HTTPException(
                status_code=400,
                detail="Passwords do not match"
            )

    hashed_password = hash_password(
        user.password
    )

    approved = True

    if user.role in [
        "officer",
        "authority",
        "contractor"
    ]:
        approved = False
        

    new_user = User(
        name=user.name,
        email=user.email,
        password=hashed_password,
        role=user.role,
        is_approved=approved,
        is_rejected=False
    )

    db.add(new_user)

    db.flush()

    if approved:

        message = "Registration Successful"

    else:

        message = "Registration Successful. Waiting for Admin Approval"

    # GENERATE OTP
    otp = str(
        randint(100000, 999999)
    )

    # CREATE USER PROFILE
    new_profile = UserProfile(
        user_id=new_user.id,
        phone=user.phone,
        address=""
    )

    db.add(new_profile)

    # CREATE VERIFICATION RECORD
    verification = UserVerification(
        user_id=new_user.id,
        otp_code=otp,
        phone_verified=False,
        nid_verified=False,
        verification_completed=False
    )

    db.add(verification)

    db.commit()

    db.refresh(new_user)

    return {
        "message": message,
        "user_id": new_user.id,
        "demo_otp": otp
    }


# LOGIN
@router.post("/login")
def login_user(
    user: UserLogin,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if not existing_user:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    
    if existing_user.is_rejected:

        raise HTTPException(
            status_code=403,
            detail="Account Rejected By Admin"
        )
    
    if not existing_user.is_approved:

        raise HTTPException(
            status_code=403,
            detail="Account Pending Admin Approval"
        )

    valid_password = verify_password(
        user.password,
        existing_user.password
    )

    if not valid_password:

        raise HTTPException(
            status_code=401,
            detail="Invalid password"
        )

    access_token = create_access_token(
        data={
            "user_id": existing_user.id,
            "role": existing_user.role
        }
    )

    return {
        "message": "Login Successful",
        "access_token": access_token,
        "role": existing_user.role,
        "user_id": existing_user.id
    }


# VERIFICATION STATUS
@router.get("/verification-status/{user_id}")
def verification_status(
    user_id: int,
    db: Session = Depends(get_db)
):

    verification = db.query(
        UserVerification
    ).filter(
        UserVerification.user_id == user_id
    ).first()

    if not verification:

        return {
            "verified": False,
            "nid_verified": False,
            "verification_completed": False
        }

    return {
        "verified":
        verification.phone_verified,

        "nid_verified":
        verification.nid_verified,

        "verification_completed":
        verification.verification_completed
    }
# GET PENDING USERS
@router.get("/pending-users")
def get_pending_users(
    db: Session = Depends(get_db)
):

    users = db.query(User).filter(
        User.is_approved == False,
        User.is_rejected == False
    ).all()

    return users


# APPROVE USER
@router.put("/approve-user/{user_id}")
def approve_user(
    user_id: int,
    payload: dict = None,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    user.is_approved = True

    # determine admin id (resolve admin.id from provided identifier)
    raw_admin = payload.get('admin_id') if payload else None
    resolved_admin = resolve_admin_id(db, raw_admin) if raw_admin is not None else None

    # OFFICER
    if user.role == "officer":

        officer = db.query(Officer).filter(
            Officer.user_id == user.id
        ).first()

        if officer and resolved_admin:
            officer.created_by_admin_id = resolved_admin

    # AUTHORITY
    elif user.role == "authority":

        authority = db.query(Authority).filter(
            Authority.user_id == user.id
        ).first()

        if authority and resolved_admin:
            authority.created_by_admin_id = resolved_admin

    # CONTRACTOR
    elif user.role == "contractor":

        contractor = db.query(Contractor).filter(
            Contractor.user_id == user.id
        ).first()

        if contractor and resolved_admin:
            contractor.created_by_admin_id = resolved_admin

    # create audit log entry
    try:
        from models.audit_log_model import AuditLog

        if resolved_admin:
            audit_log = AuditLog(user_id=resolved_admin, action=f"Approved {user.role} user {user_id}")
            db.add(audit_log)
        else:
            # no admin mapping found; log without admin reference
            audit_log = AuditLog(user_id=None, action=f"Approved {user.role} user {user_id} (admin mapping missing)")
            db.add(audit_log)
        print("CREATING AUDIT LOG")
    except Exception as e:
        print("Failed to create audit log", e)

    db.commit()
    print("AUDIT LOG SAVED")

    return {
        "message": "User Approved Successfully"
    }

# REJECT USER
@router.put("/reject-user/{user_id}")
def reject_user(
    user_id: int,
    payload: dict = None,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    user.is_rejected = True

    # create audit log entry
    try:
        from models.audit_log_model import AuditLog

        raw_admin = payload.get('admin_id') if payload else None
        resolved_admin = resolve_admin_id(db, raw_admin) if raw_admin is not None else None
        if resolved_admin:
            audit_log = AuditLog(user_id=resolved_admin, action=f"Rejected {user.role} user {user_id}")
            db.add(audit_log)
        else:
            audit_log = AuditLog(user_id=None, action=f"Rejected {user.role} user {user_id} (admin mapping missing)")
            db.add(audit_log)
        print("CREATING AUDIT LOG")
    except Exception as e:
        print("Failed to create audit log", e)

    db.commit()
    print("AUDIT LOG SAVED")

    return {
        "message": "User Rejected"
    }