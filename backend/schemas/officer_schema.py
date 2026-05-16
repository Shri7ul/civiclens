from pydantic import BaseModel
from pydantic import EmailStr

class OfficerRegister(BaseModel):

    name: str

    email: EmailStr

    password: str

    nid: str

    designation: str

    address: str

    area: str