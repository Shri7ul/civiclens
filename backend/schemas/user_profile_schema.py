from pydantic import BaseModel

class UserProfileCreate(BaseModel):

    user_id: int

    phone: str

    address: str

    nid: str

    dob: str