from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey
)

from database import Base

class Contractor(Base):

    __tablename__ = "contractors"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    company = Column(String(100))

    license_no = Column(String(100))

    contact_info = Column(String(255))

    created_by_admin_id = Column(Integer)