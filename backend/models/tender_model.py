from sqlalchemy import (
    Column,
    Integer,
    String,
    DECIMAL,
    Date,
    ForeignKey
)

from database import Base

class Tender(Base):

    __tablename__ = "tenders"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    title = Column(String(255))

    area = Column(String(100))

    budget = Column(
        DECIMAL(12, 2)
    )

    deadline = Column(Date)

    status = Column(String(50))

    contractor_id = Column(
        Integer,
        ForeignKey("contractors.id"),
        nullable=True
    )