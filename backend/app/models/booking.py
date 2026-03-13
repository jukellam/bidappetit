from datetime import datetime, timezone

from sqlalchemy import String, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.enums import BookingStatus


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[int] = mapped_column(primary_key=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id"))
    bid_id: Mapped[int] = mapped_column(ForeignKey("bids.id"))
    planner_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    restaurant_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    status: Mapped[str] = mapped_column(String(20), default=BookingStatus.CONFIRMED)
    confirmed_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )

    event: Mapped["Event"] = relationship("Event", back_populates="booking")
    bid: Mapped["Bid"] = relationship("Bid")
    planner: Mapped["User"] = relationship("User", foreign_keys=[planner_id])
    restaurant_user: Mapped["User"] = relationship("User", foreign_keys=[restaurant_id])
