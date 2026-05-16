from typing import Optional
from pydantic import BaseModel


class NIDVerify(BaseModel):

    user_id: int

    nid: str

    dob: str

    address: Optional[str] = ""