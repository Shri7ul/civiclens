from fastapi import (
    APIRouter,
    Depends
)

from sqlalchemy.orm import Session

from models.police_model import (
    PoliceRequest
)

from models.user_verification_model import (
    UserVerification
)

from schemas.police_schema import (
    PoliceRequestCreate
)

from utils.db import get_db

router = APIRouter()

# GET ALL POLICE REQUESTS
@router.get("/police-requests")
def get_police_requests(
    db: Session = Depends(get_db)
):

    requests = db.query(
        PoliceRequest
    ).all()

    return requests


# ADD GD / POLICE REQUEST
@router.post("/add-police-request")
def add_police_request(
    request: PoliceRequestCreate,
    db: Session = Depends(get_db)
):

    verification = db.query(
        UserVerification
    ).filter(
        UserVerification.user_id == request.user_id
    ).first()

    if not verification:

        return {
            "message":
            "Verification Required"
        }

    if verification.phone_verified == False:

        return {
            "message":
            "Please Verify OTP First"
        }


    new_request = PoliceRequest(
        user_id=request.user_id,
        category=request.category,
        request_type=request.request_type,
        description=request.description,
        status="Pending"
    )

    db.add(new_request)

    db.commit()

    return {
        "message":
        "GD Submitted Successfully"
    }


@router.get("/my-police-requests/{user_id}")
def get_my_police_requests(
    user_id: int,
    db: Session = Depends(get_db)
):

    requests_q = db.query(PoliceRequest).filter(
        PoliceRequest.user_id == user_id
    ).order_by(
        PoliceRequest.id.desc()
    ).all()

    # Serialize created_at if present on model instances
    results = []
    for r in requests_q:
        results.append({
            "id": r.id,
            "category": r.category,
            "request_type": r.request_type,
            "description": r.description,
            "status": r.status,
            "created_at": getattr(r, 'created_at', None)
        })

    return results