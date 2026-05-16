from fastapi import FastAPI

from database import Base, engine

from models.user_model import User
from models.tender_model import Tender
from models.police_model import PoliceRequest
from models.officer_model import Officer
from models.authority_model import Authority
from models.contractor_model import Contractor
from models.crime_assignment_model import (
    CrimeAssignment
)

from models.case_update_model import (
    CaseUpdate
)

from routes.user_routes import router as user_router
from routes.tender_routes import router as tender_router
from routes.police_routes import router as police_router
from routes.officer_routes import (
    router as officer_router
)
from routes.authority_routes import (
    router as authority_router
)
from routes.contractor_routes import (
    router as contractor_router
)

from routes.verification_routes import (
    router as verification_router
)
from routes.crime_assignment_routes import (
    router as crime_assignment_router
)
from routes.case_update_routes import (
    router as case_update_router
)

from models.user_profile_model import (
    UserProfile
)

from models.user_verification_model import (
    UserVerification
)
from models.demo_nid_model import (
    DemoNIDData
)


app = FastAPI(
    title="CivicLens API",
    version="1.0.0"
)

Base.metadata.create_all(bind=engine)

app.include_router(user_router)
app.include_router(tender_router)
app.include_router(police_router)
app.include_router(officer_router)
app.include_router(authority_router)
app.include_router(contractor_router)
app.include_router(
    verification_router
)
app.include_router(crime_assignment_router)
app.include_router(case_update_router)

@app.get("/")
def home():

    return {
        "message": "CivicLens MVP Backend Running"
    }