from pydantic import BaseModel
from datetime import date

class TenderCreate(BaseModel):
    title: str
    area: str
    budget: float
    deadline: date
    status: str