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


class PublicCaseUpdate(Base):

    __tablename__ = "public_case_updates"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    public_case_id = Column(
        Integer,
        ForeignKey("public_cases.id")
    )

    officer_id = Column(
        Integer,
        ForeignKey("officers.id"),
        nullable=True
    )

    update_message = Column(Text)

    case_status = Column(String(100))

    updated_at = Column(DateTime, server_default=func.now())
