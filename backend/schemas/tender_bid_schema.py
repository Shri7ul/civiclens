from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TenderBidCreate(BaseModel):
    contractor_user_id: int
    bid_amount: float
    completion_days: int
    proposal_text: Optional[str]


class TenderBidOut(BaseModel):
    id: int
    tender_id: int
    contractor_id: int
    bid_amount: float
    completion_days: int
    proposal_text: Optional[str]
    proposal_document: Optional[str]
    status: str
    created_at: Optional[datetime]

    class Config:
        orm_mode = True
