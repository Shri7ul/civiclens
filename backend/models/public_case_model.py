from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    Boolean,
    ForeignKey,
    func
)

from database import Base


class PublicCase(Base):

    __tablename__ = "public_cases"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    title = Column(String(255))
    description = Column(Text)
    area = Column(String(100))
    status = Column(String(100))
    source_name = Column(String(255))
    source_url = Column(String(512))
    assigned_officer_id = Column(Integer, ForeignKey("officers.id"), nullable=True)
    created_by_admin_id = Column(Integer, nullable=True)
    is_featured = Column(Boolean, default=False)
    cover_image = Column(String(500), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
