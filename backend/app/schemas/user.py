from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class RestaurantProfileBrief(BaseModel):
    id: int
    name: str
    city: str
    cuisine_type: str
    price_range: str

    model_config = {"from_attributes": True}


class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    user_type: str
    created_at: datetime
    restaurant_profile: Optional[RestaurantProfileBrief] = None

    model_config = {"from_attributes": True}


class LoginRequest(BaseModel):
    user_id: int
