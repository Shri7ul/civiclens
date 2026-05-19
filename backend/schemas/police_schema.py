from pydantic import BaseModel

class PoliceRequestCreate(BaseModel):

    user_id: int

    category: str

    request_type: str

    description: str

    area: str | None = None

    location: str | None = None