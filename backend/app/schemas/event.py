from datetime import date, time, datetime
from typing import Optional

from pydantic import BaseModel

from app.schemas.bid import BidResponse


class EventCreate(BaseModel):
    title: str
    description: str
    city: str
    date: date
    time: time
    duration_hours: Optional[float] = 3.0
    guest_count: int
    budget_min: float
    budget_max: float
    bid_deadline: datetime
    event_type: str
    cuisine_preferences: Optional[str] = None
    dietary_restrictions: Optional[str] = None
    vibe: Optional[str] = None
    special_requests: Optional[str] = None


class EventResponse(BaseModel):
    id: int
    planner_id: int
    title: str
    description: str
    city: str
    date: date
    time: time
    duration_hours: Optional[float] = None
    guest_count: int
    budget_min: float
    budget_max: float
    bid_deadline: datetime
    status: str
    event_type: str
    cuisine_preferences: Optional[str] = None
    dietary_restrictions: Optional[str] = None
    vibe: Optional[str] = None
    special_requests: Optional[str] = None
    created_at: datetime
    bid_count: int = 0
    bids: Optional[list[BidResponse]] = None
    my_bid: Optional[BidResponse] = None

    model_config = {"from_attributes": True}
