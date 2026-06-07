from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.database import Base, engine

from backend.models.user_model import User
from backend.models.tender_model import Tender
from backend.models.police_model import PoliceRequest
from backend.models.officer_model import Officer
from backend.models.authority_model import Authority
from backend.models.contractor_model import Contractor
from backend.models.crime_assignment_model import (
    CrimeAssignment
)

from backend.models.case_update_model import (
    CaseUpdate
)

from backend.routes.user_routes import router as user_router
from backend.routes.tender_routes import router as tender_router
from backend.routes.police_routes import router as police_router
from backend.routes.officer_routes import (
    router as officer_router
)
from backend.routes.authority_routes import (
    router as authority_router
)
from backend.routes.contractor_routes import (
    router as contractor_router
)
from backend.routes.project_routes import (
    router as project_router
)

from backend.routes.verification_routes import (
    router as verification_router
)
from backend.routes.crime_assignment_routes import (
    router as crime_assignment_router
)
from backend.routes.case_update_routes import (
    router as case_update_router
)
from backend.routes.case_document_routes import (
    router as case_document_router
)
from backend.routes.admin_routes import (
    router as admin_router
)
from backend.routes.public_routes import (
    router as public_router
)

from backend.models.user_profile_model import (
    UserProfile
)

from backend.models.user_verification_model import (
    UserVerification
)
from backend.models.demo_nid_model import (
    DemoNIDData
)
from backend.models.public_case_model import PublicCase


app = FastAPI(
    title="CivicLens API",
    version="1.0.0"
)

# CORS settings to allow Next.js frontend during development
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(user_router)
app.include_router(tender_router)
app.include_router(police_router)
app.include_router(officer_router)
app.include_router(authority_router)
app.include_router(contractor_router)
app.include_router(project_router)
app.include_router(
    verification_router
)
app.include_router(crime_assignment_router)
app.include_router(case_update_router)
app.include_router(case_document_router)
app.include_router(admin_router)
app.include_router(public_router)

@app.get("/")
def home():

    return {
        "message": "CivicLens MVP Backend Running"
    }