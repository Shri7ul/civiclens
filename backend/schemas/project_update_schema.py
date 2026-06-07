from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ProjectUpdateCreate(BaseModel):
    contractor_user_id: int
    progress_percent: int
    update_text: Optional[str]

class ProjectUpdateOut(BaseModel):
    id: int
    tender_id: int
    contractor_id: int
    progress_percent: int
    update_text: Optional[str]
    created_at: Optional[datetime]

    class Config:
        orm_mode = True
