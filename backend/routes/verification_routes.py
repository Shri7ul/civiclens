from fastapi import (
    APIRouter,
    Depends,
    UploadFile,
    File,
    Form
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

import os
import time
import re

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


@router.post("/upload-nid-image")
async def upload_nid_image(
    user_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    # ensure uploads dir exists
    uploads_dir = os.path.join("uploads", "nid_images")
    os.makedirs(uploads_dir, exist_ok=True)

    filename = f"{user_id}_{int(time.time())}_{file.filename}"
    file_path = os.path.join(uploads_dir, filename)

    # save uploaded file
    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    # run OCR (lazy import so server can still start without OCR installed)
    try:
        import easyocr
    except Exception as e:
        return {"message": "OCR engine not available", "error": str(e)}

    try:
        reader = easyocr.Reader(["bn", "en"], gpu=False)
        result = reader.readtext(file_path, detail=0)
    except Exception as e:
        return {"message": "OCR failed", "error": str(e)}

    text = " ".join(result)

    # extract NID, DOB, Name using regex heuristics
    nid_match = re.search(r"\b\d{8,17}\b", text)

    dob_match = None
    dob_patterns = [r"\d{2}[-/]\d{2}[-/]\d{4}", r"\d{4}[-/]\d{2}[-/]\d{2}", r"\d{2}\s[A-Za-z]{3}\s\d{4}"]
    for p in dob_patterns:
        m = re.search(p, text)
        if m:
            dob_match = m
            break

    name_match = re.search(r'নাম[:ঃ]?\s*([^\n]+)', text)
    if not name_match:
        name_match = re.search(r'Name[:\s]\s*([^\n]+)', text)

    extracted = {
        "name": name_match.group(1).strip() if name_match else None,
        "dob": dob_match.group() if dob_match else None,
        "nid": nid_match.group() if nid_match else None,
    }

    verification = db.query(
        UserVerification
    ).filter(
        UserVerification.user_id == user_id
    ).first()

    if not verification:
        verification = UserVerification(user_id=user_id)

    # save metadata (image path + extracted data) to a JSON file alongside the image
    try:
        import json
        meta = {
            "user_id": user_id,
            "image_path": file_path,
            "extracted": extracted,
            "timestamp": int(time.time())
        }
        meta_path = os.path.join(uploads_dir, f"{user_id}_{int(time.time())}_meta.json")
        with open(meta_path, "w", encoding="utf-8") as mf:
            json.dump(meta, mf, ensure_ascii=False, indent=2)
    except Exception:
        # non-fatal if metadata write fails
        pass

    # if core fields found, mark verified
    if extracted["nid"] and extracted["dob"]:
        verification.nid = extracted["nid"]
        verification.dob = extracted["dob"]
        verification.nid_verified = True
        verification.verification_completed = True
        db.add(verification)
        db.commit()

        return {"message": "NID OCR and verification successful", "extracted": extracted}

    # partial/failed parsing: save partial data but do not verify
    if extracted["nid"]:
        verification.nid = extracted["nid"]
    if extracted["dob"]:
        verification.dob = extracted["dob"]

    verification.nid_verified = False
    verification.verification_completed = False
    db.add(verification)
    db.commit()

    return {"message": "OCR parsing incomplete", "extracted": extracted}
