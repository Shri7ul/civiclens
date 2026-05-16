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

    # OFFICER
    if user.role == "officer":

        officer = db.query(Officer).filter(
            Officer.user_id == user.id
        ).first()

        if officer:

            # try to use provided admin id, fall back to 1
            admin_id = payload.get('admin_id') if payload else 1
            officer.created_by_admin_id = admin_id

    # AUTHORITY
    elif user.role == "authority":

        authority = db.query(Authority).filter(
            Authority.user_id == user.id
        ).first()

        if authority:

            admin_id = payload.get('admin_id') if payload else 1
            authority.created_by_admin_id = admin_id

    # CONTRACTOR
    elif user.role == "contractor":

        contractor = db.query(Contractor).filter(
            Contractor.user_id == user.id
        ).first()

        if contractor:

            admin_id = payload.get('admin_id') if payload else 1
            contractor.created_by_admin_id = admin_id

    # create audit log entry
    try:
        from models.audit_log_model import AuditLog

        admin_id = payload.get('admin_id') if payload else 1
        print("CREATING AUDIT LOG")
        audit_log = AuditLog(user_id=admin_id, action=f"Approved {user.role} user {user_id}")
        print(audit_log.user_id)
        print(audit_log.action)
        db.add(audit_log)
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

        admin_id = payload.get('admin_id') if payload else 1
        print("CREATING AUDIT LOG")
        audit_log = AuditLog(user_id=admin_id, action=f"Rejected {user.role} user {user_id}")
        print(audit_log.user_id)
        print(audit_log.action)
        db.add(audit_log)
    except Exception as e:
        print("Failed to create audit log", e)

    db.commit()
    print("AUDIT LOG SAVED")

    return {
        "message": "User Rejected"
    }