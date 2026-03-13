from pydantic import BaseModel


class RestaurantProfileResponse(BaseModel):
    id: int
    user_id: int
    name: str
    city: str
    cuisine_type: str
    description: str
    photo_urls: list[str]
    total_capacity: int
    private_dining_capacity: int
    price_range: str
    hours: str

    model_config = {"from_attributes": True}
