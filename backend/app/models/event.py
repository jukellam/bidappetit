from datetime import datetime, date, time, timezone
from typing import Optional

from sqlalchemy import String, Integer, Float, Date, Time, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.enums import EventStatus


class Event(Base):
    __tablename__ = "events"

    id: Mapped[int] = mapped_column(primary_key=True)
    planner_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(String(2000))
    city: Mapped[str] = mapped_column(String(100))
    date: Mapped[date] = mapped_column(Date)
    time: Mapped[time] = mapped_column(Time)
    duration_hours: Mapped[Optional[float]] = mapped_column(
        Float, nullable=True, default=3.0
    )
    guest_count: Mapped[int] = mapped_column(Integer)
    budget_min: Mapped[float] = mapped_column(Float)
    budget_max: Mapped[float] = mapped_column(Float)
    bid_deadline: Mapped[datetime] = mapped_column(DateTime)
    status: Mapped[str] = mapped_column(String(20), default=EventStatus.OPEN)
    event_type: Mapped[str] = mapped_column(String(50))
    cuisine_preferences: Mapped[Optional[str]] = mapped_column(
        String(500), nullable=True
    )
    dietary_restrictions: Mapped[Optional[str]] = mapped_column(
        String(500), nullable=True
    )
    vibe: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    special_requests: Mapped[Optional[str]] = mapped_column(
        String(1000), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )

    planner: Mapped["User"] = relationship("User")
    bids: Mapped[list["Bid"]] = relationship("Bid", back_populates="event")
    booking: Mapped[Optional["Booking"]] = relationship(
        "Booking", back_populates="event", uselist=False
    )
