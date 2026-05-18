from pydantic import BaseModel


class CrimeAssignmentCreate(BaseModel):

    police_request_id: int

    officer_id: int
    
    assigned_by_authority_id: int | None = None

    class Config:
        orm_mode = True
