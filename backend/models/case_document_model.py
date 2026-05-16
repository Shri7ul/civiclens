from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    func
)

from database import Base


class CaseDocument(Base):

    __tablename__ = "case_documents"

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

    file_name = Column(
        String(255)
    )

    file_path = Column(
        String(500)
    )

    uploaded_at = Column(
        DateTime,
        server_default=func.now()
    )
