from sqlalchemy import String, Integer, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class RestaurantProfile(Base):
    __tablename__ = "restaurant_profiles"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True)
    name: Mapped[str] = mapped_column(String(255))
    city: Mapped[str] = mapped_column(String(100))
    cuisine_type: Mapped[str] = mapped_column(String(100))
    description: Mapped[str] = mapped_column(String(1000))
    photo_urls: Mapped[list] = mapped_column(JSON, default=list)
    total_capacity: Mapped[int] = mapped_column(Integer)
    private_dining_capacity: Mapped[int] = mapped_column(Integer)
    price_range: Mapped[str] = mapped_column(String(10))  # $ | $$ | $$$ | $$$$
    hours: Mapped[str] = mapped_column(String(255))

    user: Mapped["User"] = relationship(back_populates="restaurant_profile")
