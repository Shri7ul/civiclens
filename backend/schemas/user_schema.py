from typing import Optional
from pydantic import (
    BaseModel,
    EmailStr
)


class UserCreate(BaseModel):

    name: str

    email: EmailStr

    password: str

    confirm_password: Optional[str] = None

    phone: Optional[str] = None

    role: str


class UserLogin(BaseModel):

    email: EmailStr

    password: str