from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
    func
)

from database import Base


class CaseUpdate(Base):

    __tablename__ = "case_updates"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # existing DB table uses the following column names (request_id, note, status)
    police_request_id = Column(
        'request_id',
        Integer,
        ForeignKey("police_requests.id")
    )

    # officer_id is not present in the existing table schema; omit it to match DB

    update_message = Column(
        'note',
        Text
    )

    case_status = Column(
        'status',
        String(50)
    )

    updated_at = Column(
        DateTime,
        server_default=func.now()
    )
