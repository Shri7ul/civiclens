from sqlalchemy import Column, Integer, ForeignKey, String, DateTime, Text
from database import Base
from sqlalchemy.sql import func

class ProjectUpdate(Base):
    __tablename__ = "project_updates"

    id = Column(Integer, primary_key=True, index=True)
    tender_id = Column(Integer, ForeignKey("tenders.id"))
    contractor_id = Column(Integer, ForeignKey("contractors.id"))
    progress_percent = Column(Integer)
    update_text = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
