from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey
)

from database import Base


class Admin(Base):

    __tablename__ = "admins"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # link to users table (optional in older DBs)
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )

    name = Column(String(100))

    email = Column(String(100))

    phone = Column(String(20))
