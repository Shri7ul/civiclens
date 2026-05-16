from sqlalchemy import Column, Integer, String, DECIMAL, Date
from database import Base
from sqlalchemy import Text

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    email = Column(String(100))
    password = Column(String(255))
    role = Column(String(50))

class Tender(Base):
    __tablename__ = "tenders"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255))
    area = Column(String(100))
    budget = Column(DECIMAL(12,2))
    deadline = Column(Date)
    status = Column(String(50))



class PoliceRequest(Base):
    __tablename__ = "police_requests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    request_type = Column(String(100))
    description = Column(Text)
    status = Column(String(50))