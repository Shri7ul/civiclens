from pydantic import (
    BaseModel,
    EmailStr
)


class AuthorityRegister(BaseModel):

    name: str

    email: EmailStr

    password: str

    nid: str

    address: str