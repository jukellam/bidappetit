from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.restaurant import RestaurantProfile
from app.schemas.restaurant import RestaurantProfileResponse

router = APIRouter(tags=["restaurants"])


# WARNING: PROTOTYPE ONLY — This endpoint is unauthenticated. Any anonymous caller
# can retrieve restaurant profile data by ID. MUST be secured before production deployment.
@router.get("/api/restaurants/{profile_id}", response_model=RestaurantProfileResponse)
def get_restaurant(profile_id: int, db: Session = Depends(get_db)):
    profile = db.get(RestaurantProfile, profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return profile
