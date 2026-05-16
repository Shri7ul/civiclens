from pydantic import (
    BaseModel,
    EmailStr
)

class ContractorRegister(BaseModel):

    name: str

    email: EmailStr

    password: str

    company: str

    license_no: str

    contact_info: str