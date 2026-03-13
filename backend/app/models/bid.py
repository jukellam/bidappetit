from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import String, Float, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Bid(Base):
    __tablename__ = "bids"
    __table_args__ = (
        UniqueConstraint("event_id", "restaurant_id"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id"))
    restaurant_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    price_total: Mapped[float] = mapped_column(Float)
    price_per_person: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    proposal_text: Mapped[str] = mapped_column(String(2000))
    menu_details: Mapped[Optional[str]] = mapped_column(String(2000), nullable=True)
    space_details: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    inclusions: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="pending")
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )

    event: Mapped["Event"] = relationship("Event", back_populates="bids")
    restaurant: Mapped["User"] = relationship("User")
