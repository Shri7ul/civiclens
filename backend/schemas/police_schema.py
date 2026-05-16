from pydantic import BaseModel

class PoliceRequestCreate(BaseModel):

    user_id: int

    category: str

    request_type: str

    description: str