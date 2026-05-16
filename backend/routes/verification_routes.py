from fastapi import (
    APIRouter,
    Depends
)

from sqlalchemy.orm import Session

from random import randint

from models.user_profile_model import (
    UserProfile
)

from models.user_verification_model import (
    UserVerification
)

from schemas.user_profile_schema import (
    UserProfileCreate
)

from utils.db import get_db

from schemas.otp_schema import OTPVerify

from schemas.nid_schema import NIDVerify

from models.demo_nid_model import (
    DemoNIDData
)



router = APIRouter()

# @router.post("/complete-profile")
# def complete_profile(
#     profile: UserProfileCreate,
#     db: Session = Depends(get_db)
# ):

#     # USER PROFILE
#     new_profile = UserProfile(
#         user_id=profile.user_id,
#         phone=profile.phone,
#         address=profile.address
#     )

#     db.add(new_profile)

#     db.commit()

#     # OTP GENERATE
#     otp = str(
#         randint(100000, 999999)
#     )

#     # USER VERIFICATION
#     verification = UserVerification(
#         user_id=profile.user_id,
#         nid=profile.nid,
#         dob=profile.dob,
#         otp_code=otp
#     )

#     db.add(verification)

#     db.commit()

#     return {
#         "message":
#         "Profile Completed",

#         "demo_otp": otp
#     }

@router.post("/verify-otp")
def verify_otp(
    data: OTPVerify,
    db: Session = Depends(get_db)
):

    verification = db.query(
        UserVerification
    ).filter(
        UserVerification.user_id == data.user_id
    ).first()

    if not verification:

        return {
            "message":
            "Verification record not found"
        }

    if verification.otp_code != data.otp_code:

        return {
            "message":
            "Invalid OTP"
        }

    verification.phone_verified = True

    db.commit()

    return {
        "message":
        "Phone Verification Successful"
    }
@router.post("/verify-nid")
def verify_nid(
    data: NIDVerify,
    db: Session = Depends(get_db)
):

    demo_nid = db.query(
        DemoNIDData
    ).filter(
        DemoNIDData.nid == data.nid,
        DemoNIDData.dob == data.dob
    ).first()

    if not demo_nid:

        return {
            "message":
            "NID Verification Failed"
        }

    verification = db.query(
        UserVerification
    ).filter(
        UserVerification.user_id == data.user_id
    ).first()

    if verification:
        verification.nid = data.nid

        verification.dob = data.dob

        verification.nid_verified = True

        verification.verification_completed = True

        # update user profile address if provided
        profile = db.query(
            UserProfile
        ).filter(
            UserProfile.user_id == data.user_id
        ).first()

        if profile and data.address:

            profile.address = data.address

        db.commit()

        return {
            "message":
            "NID Verification Successful"
        }

    return {
        "message": "Verification record not found"
    }
