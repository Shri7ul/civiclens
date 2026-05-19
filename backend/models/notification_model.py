from sqlalchemy import Column, Integer, Text, Boolean
from database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    message = Column(Text)
    is_read = Column(Boolean, default=False)
    req_id = Column(Integer)
