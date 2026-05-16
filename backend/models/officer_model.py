from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey
)

from database import Base

class Officer(Base):

    __tablename__ = "officers"

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

    designation = Column(String(100))

    address = Column(String(255))

    area = Column(String(100))

    created_by_admin_id = Column(Integer)