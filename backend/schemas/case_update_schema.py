from pydantic import BaseModel


class CaseUpdateCreate(BaseModel):

    police_request_id: int

    officer_id: int

    update_message: str

    case_status: str

    class Config:
        orm_mode = True
