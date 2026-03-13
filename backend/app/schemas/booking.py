from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class BookingResponse(BaseModel):
    id: int
    event_id: int
    bid_id: int
    planner_id: int
    restaurant_id: int
    status: str
    confirmed_at: datetime
    event_title: Optional[str] = None
    restaurant_name: Optional[str] = None
    event_date: Optional[str] = None
    bid_price: Optional[float] = None

    model_config = {"from_attributes": True}
