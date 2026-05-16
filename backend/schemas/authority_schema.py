from pydantic import (
    BaseModel,
    EmailStr
)

from datetime import date

class AuthorityRegister(BaseModel):

    name: str

    email: EmailStr

    password: str

    nid: str

    dob: date

    address: str