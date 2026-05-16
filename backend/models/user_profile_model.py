from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey
)

from database import Base

class UserProfile(Base):

    __tablename__ = "user_profiles"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    phone = Column(String(20))

    address = Column(String(255))