from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.booking import Booking
from app.schemas.booking import BookingResponse

router = APIRouter(tags=["bookings"])


def _booking_response(booking: Booking) -> BookingResponse:
    event = booking.event
    bid = booking.bid
    restaurant_user = booking.restaurant_user
    profile = restaurant_user.restaurant_profile if restaurant_user else None

    return BookingResponse(
        id=booking.id,
        event_id=booking.event_id,
        bid_id=booking.bid_id,
        planner_id=booking.planner_id,
        restaurant_id=booking.restaurant_id,
        status=booking.status,
        confirmed_at=booking.confirmed_at,
        event_title=event.title if event else None,
        restaurant_name=profile.name if profile else None,
        event_date=str(event.date) if event else None,
        bid_price=bid.price_total if bid else None,
    )


@router.get("/api/bookings", response_model=list[BookingResponse])
def list_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = (
        db.query(Booking)
        .options(
            joinedload(Booking.event),
            joinedload(Booking.bid),
            joinedload(Booking.restaurant_user).joinedload(User.restaurant_profile),
        )
    )
    if current_user.user_type == "planner":
        q = q.filter(Booking.planner_id == current_user.id)
    else:
        q = q.filter(Booking.restaurant_id == current_user.id)

    bookings = q.all()
    return [_booking_response(b) for b in bookings]


@router.get("/api/bookings/{booking_id}", response_model=BookingResponse)
def get_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = (
        db.query(Booking)
        .options(
            joinedload(Booking.event),
            joinedload(Booking.bid),
            joinedload(Booking.restaurant_user).joinedload(User.restaurant_profile),
        )
        .filter(Booking.id == booking_id)
        .first()
    )
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.planner_id != current_user.id and booking.restaurant_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your booking")
    return _booking_response(booking)


@router.patch("/api/bookings/{booking_id}/cancel", response_model=BookingResponse)
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = (
        db.query(Booking)
        .options(
            joinedload(Booking.event),
            joinedload(Booking.bid),
            joinedload(Booking.restaurant_user).joinedload(User.restaurant_profile),
        )
        .filter(Booking.id == booking_id)
        .first()
    )
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.planner_id != current_user.id and booking.restaurant_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your booking")
    if booking.status != "confirmed":
        raise HTTPException(status_code=400, detail="Can only cancel confirmed bookings")

    booking.status = "cancelled"
    db.commit()
    db.refresh(booking)
    return _booking_response(booking)
