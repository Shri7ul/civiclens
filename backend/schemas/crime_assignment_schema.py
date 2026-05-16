from pydantic import BaseModel


class CrimeAssignmentCreate(BaseModel):

    police_request_id: int

    officer_id: int

    class Config:
        orm_mode = True
