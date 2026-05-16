from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    ForeignKey
)

from database import Base

class Authority(Base):

    __tablename__ = "authorities"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    nid = Column(String(100))

    dob = Column(Date)

    address = Column(String(255))

    created_by_admin_id = Column(Integer)