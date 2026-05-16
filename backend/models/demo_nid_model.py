from sqlalchemy import (
    Column,
    Integer,
    String,
    Date
)

from database import Base

class DemoNIDData(Base):

    __tablename__ = "demo_nid_data"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    full_name = Column(String(100))

    nid = Column(String(100))

    dob = Column(Date)

    phone = Column(String(20))