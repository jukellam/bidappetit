from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class BidCreate(BaseModel):
    price_total: float
    price_per_person: Optional[float] = None
    proposal_text: str
    menu_details: Optional[str] = None
    space_details: Optional[str] = None
    inclusions: Optional[str] = None


class BidUpdate(BaseModel):
    price_total: Optional[float] = None
    price_per_person: Optional[float] = None
    proposal_text: Optional[str] = None
    menu_details: Optional[str] = None
    space_details: Optional[str] = None
    inclusions: Optional[str] = None


class BidResponse(BaseModel):
    id: int
    event_id: int
    restaurant_id: int
    price_total: float
    price_per_person: Optional[float] = None
    proposal_text: str
    menu_details: Optional[str] = None
    space_details: Optional[str] = None
    inclusions: Optional[str] = None
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}
