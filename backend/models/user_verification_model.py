from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    ForeignKey
)

from database import Base

class UserVerification(Base):

    __tablename__ = "user_verification"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    nid = Column(String(100))

    dob = Column(String(100))

    

    otp_code = Column(String(10))

    phone_verified = Column(
        Boolean,
        default=False
    )

    nid_verified = Column(
        Boolean,
        default=False
    )

    verification_completed = Column(
        Boolean,
        default=False
    )