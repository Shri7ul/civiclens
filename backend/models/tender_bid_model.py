from sqlalchemy import Column, Integer, ForeignKey, DECIMAL, Text, String, DateTime
from database import Base
from sqlalchemy.sql import func


class TenderBid(Base):
    __tablename__ = "tender_bids"

    id = Column(Integer, primary_key=True, index=True)
    tender_id = Column(Integer, ForeignKey("tenders.id"))
    contractor_id = Column(Integer, ForeignKey("contractors.id"))
    bid_amount = Column(DECIMAL(14, 2))
    completion_days = Column(Integer)
    proposal_text = Column(Text)
    proposal_document = Column(String(255))
    status = Column(String(50), default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
