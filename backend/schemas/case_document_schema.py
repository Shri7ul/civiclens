from pydantic import BaseModel
from typing import Optional


class CaseDocumentOut(BaseModel):
    id: int
    police_request_id: int
    officer_id: Optional[int]
    file_name: str
    file_path: str
    uploaded_at: Optional[str]

    class Config:
        orm_mode = True
