from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    func
)

from database import Base


class AuditLog(Base):

    __tablename__ = "audit_logs"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(Integer)

    action = Column(String(255))

    timestamp = Column(DateTime, server_default=func.now())
