from datetime import date, time, datetime, timezone
from typing import Optional

from pydantic import BaseModel, Field, model_validator

from app.schemas.bid import BidResponse


class EventCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str = Field(min_length=1, max_length=2000)
    city: str = Field(min_length=1, max_length=100)
    date: date
    time: time
    duration_hours: Optional[float] = Field(default=3.0, gt=0)
    guest_count: int = Field(gt=0)
    budget_min: float = Field(gt=0)
    budget_max: float = Field(gt=0)
    bid_deadline: datetime
    event_type: str = Field(min_length=1, max_length=100)
    cuisine_preferences: Optional[str] = Field(default=None, max_length=500)
    dietary_restrictions: Optional[str] = Field(default=None, max_length=500)
    vibe: Optional[str] = Field(default=None, max_length=500)
    special_requests: Optional[str] = Field(default=None, max_length=2000)

    @model_validator(mode="after")
    def validate_ranges(self) -> "EventCreate":
        if self.budget_min > self.budget_max:
            raise ValueError("budget_min must be <= budget_max")
        deadline = self.bid_deadline
        if deadline.tzinfo is None:
            deadline = deadline.replace(tzinfo=timezone.utc)
        if deadline <= datetime.now(timezone.utc):
            raise ValueError("bid_deadline must be in the future")
        return self


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
