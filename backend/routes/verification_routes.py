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
import logging
from datetime import datetime, date

from PIL import Image

# initialize logger
logger = logging.getLogger("verification")
logger.setLevel(logging.DEBUG)

# initialize EasyOCR reader once at module import (server startup)
reader = None
try:
    import easyocr
    logger.debug("Initializing EasyOCR reader (bn,en)")
    reader = easyocr.Reader(["bn", "en"], gpu=False)
    logger.debug("EasyOCR reader initialized")
except Exception as e:
    logger.exception("Failed to initialize EasyOCR reader: %s", e)

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

    logger.debug("Received upload-nid-image request for user_id=%s", user_id)

    # ensure uploads dir exists
    uploads_dir = os.path.join("uploads", "nid")
    os.makedirs(uploads_dir, exist_ok=True)

    filename = f"{user_id}_{int(time.time())}_{file.filename}"
    file_path = os.path.join(uploads_dir, filename)

    # save uploaded file to disk
    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)
    logger.debug("Saved uploaded NID image to %s", file_path)

    # optimize / resize large images before OCR
    try:
        with Image.open(file_path) as img:
            max_dim = max(img.size)
            if max_dim > 1600:
                scale = 1600 / float(max_dim)
                new_size = (int(img.size[0] * scale), int(img.size[1] * scale))
                img = img.resize(new_size, Image.LANCZOS)
                img.save(file_path)
                logger.debug("Resized image to %s for OCR", new_size)
    except Exception as e:
        logger.exception("Image resize failed: %s", e)

    # run OCR using global reader
    if reader is None:
        logger.error("OCR reader not available")
        return {"message": "OCR engine not available"}

    try:
        logger.debug("Starting OCR on %s", file_path)
        result = reader.readtext(file_path, detail=0)
        logger.debug("OCR completed, found %d text blocks", len(result))
    except Exception as e:
        logger.exception("OCR failed: %s", e)
        return {"message": "OCR failed", "error": str(e)}

    text = " ".join(result)
    logger.debug("OCR text length=%d", len(text))

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

    logger.debug("Extracted fields: %s", extracted)

    verification = db.query(
        UserVerification
    ).filter(
        UserVerification.user_id == user_id
    ).first()

    if not verification:
        verification = UserVerification(user_id=user_id)

    # save image path to DB
    try:
        verification.nid_image_path = file_path
    except Exception as e:
        logger.exception("Failed to set nid_image_path on verification object: %s", e)

    # attempt to parse DOB into date object for DB match
    def parse_dob(dob_str: str):
        if not dob_str:
            return None
        dob_str = dob_str.strip()
        formats = ["%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%d %b %Y", "%d %B %Y", "%d %m %Y"]
        for fmt in formats:
            try:
                dt = datetime.strptime(dob_str, fmt).date()
                return dt
            except Exception:
                continue
        # try to extract numbers and reformat
        m = re.search(r"(\d{2})\s([A-Za-z]{3})\s(\d{4})", dob_str)
        if m:
            try:
                dt = datetime.strptime(m.group(0), "%d %b %Y").date()
                return dt
            except Exception:
                pass
        return None

    parsed_dob = parse_dob(extracted.get("dob"))

    # check demo_nid_data for match
    demo_nid = None
    if extracted.get("nid") and parsed_dob:
        try:
            demo_nid = db.query(
                DemoNIDData
            ).filter(
                DemoNIDData.nid == extracted.get("nid"),
                DemoNIDData.dob == parsed_dob
            ).first()
            logger.debug("Demo NID DB query executed for nid=%s dob=%s", extracted.get("nid"), parsed_dob)
        except Exception as e:
            logger.exception("Demo NID DB query failed: %s", e)

    def safe_save(verif_obj):
        try:
            db.add(verif_obj)
            db.commit()
            return True
        except Exception as e:
            logger.exception("DB commit failed, will write metadata instead: %s", e)
            try:
                import json
                meta = {
                    "user_id": user_id,
                    "image_path": file_path,
                    "extracted": extracted,
                    "timestamp": int(time.time()),
                    "error": str(e)
                }
                meta_path = os.path.join(uploads_dir, f"{user_id}_{int(time.time())}_meta.json")
                with open(meta_path, "w", encoding="utf-8") as mf:
                    json.dump(meta, mf, ensure_ascii=False, indent=2)
                logger.debug("Wrote metadata to %s", meta_path)
            except Exception:
                logger.exception("Failed to write metadata fallback file")
            return False

    if demo_nid:
        verification.nid = extracted.get("nid")
        verification.dob = parsed_dob and parsed_dob.isoformat()
        verification.nid_verified = True
        verification.verification_completed = True
        saved = safe_save(verification)
        logger.debug("DB matched demo_nid for user_id=%s, verification updated saved=%s", user_id, saved)
        return {"message": "NID OCR and verification successful", "extracted": extracted}

    # partial/failed parsing: save partial data but do not verify
    if extracted.get("nid"):
        verification.nid = extracted.get("nid")
    if extracted.get("dob"):
        verification.dob = extracted.get("dob")

    verification.nid_verified = False
    verification.verification_completed = False
    safe_save(verification)

    logger.debug("OCR parsing incomplete or DB not matched for user_id=%s", user_id)

    return {"message": "OCR parsing incomplete or NID not found in DB", "extracted": extracted}
