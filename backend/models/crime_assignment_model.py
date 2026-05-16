from sqlalchemy import (
    Column,
    Integer,
    DateTime,
    ForeignKey,
    func
)

from database import Base


class CrimeAssignment(Base):

    __tablename__ = "crime_assignments"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    police_request_id = Column(
        Integer,
        ForeignKey("police_requests.id")
    )

    officer_id = Column(
        Integer,
        ForeignKey("officers.id")
    )

    assigned_by_authority_id = Column(Integer)

    assigned_at = Column(
        DateTime,
        server_default=func.now()
    )
