from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    ForeignKey,
    Boolean,
    DateTime,
    func
)

from database import Base

class PoliceRequest(Base):

    __tablename__ = "police_requests"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    category = Column(String(100))

    request_type = Column(String(100))

    description = Column(Text)

    status = Column(String(50))
    citizen_confirmation_pending = Column(Boolean, default=False)
    is_archived = Column(Boolean, default=False)
    resolved_at = Column(DateTime, nullable=True)
    
    area = Column(String(100))