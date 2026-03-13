from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse, LoginRequest

router = APIRouter(tags=["auth"])


@router.get("/api/users", response_model=list[UserResponse])
def list_users(db: Session = Depends(get_db)):
    users = (
        db.query(User)
        .options(joinedload(User.restaurant_profile))
        .order_by(User.id)
        .all()
    )
    return users


@router.post("/api/auth/login", response_model=UserResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = (
        db.query(User)
        .options(joinedload(User.restaurant_profile))
        .filter(User.id == req.user_id)
        .first()
    )
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
