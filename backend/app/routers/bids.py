from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.event import Event
from app.models.bid import Bid
from app.models.booking import Booking
from app.schemas.bid import BidCreate, BidUpdate, BidResponse
from app.schemas.booking import BookingResponse

router = APIRouter(tags=["bids"])


@router.post("/api/events/{event_id}/bids", response_model=BidResponse)
def submit_bid(
    event_id: int,
    data: BidCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.user_type != "restaurant":
        raise HTTPException(status_code=403, detail="Only restaurants can submit bids")

    event = db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if event.status != "open":
        raise HTTPException(status_code=400, detail="Event is not open for bids")
    if event.bid_deadline.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Bid deadline has passed")

    existing = (
        db.query(Bid)
        .filter(Bid.event_id == event_id, Bid.restaurant_id == current_user.id)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=400, detail="You already have a bid on this event"
        )

    bid = Bid(event_id=event_id, restaurant_id=current_user.id, **data.model_dump())
    db.add(bid)
    db.commit()
    db.refresh(bid)
    return bid


@router.get("/api/events/{event_id}/bids")
def list_bids(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    event = db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    bids = db.query(Bid).filter(Bid.event_id == event_id).all()

    if current_user.id == event.planner_id:
        return {"bids": [BidResponse.model_validate(b) for b in bids], "count": len(bids)}

    # Restaurant: own bid + count
    my_bid = None
    for b in bids:
        if b.restaurant_id == current_user.id:
            my_bid = BidResponse.model_validate(b)
            break
    return {"my_bid": my_bid, "count": len(bids)}


@router.put("/api/bids/{bid_id}", response_model=BidResponse)
def update_bid(
    bid_id: int,
    data: BidUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    bid = db.get(Bid, bid_id)
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")
    if bid.restaurant_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your bid")
    if bid.status != "pending":
        raise HTTPException(status_code=400, detail="Can only update pending bids")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(bid, key, value)

    db.commit()
    db.refresh(bid)
    return bid


@router.post("/api/bids/{bid_id}/accept", response_model=BookingResponse)
def accept_bid(
    bid_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    bid = db.get(Bid, bid_id)
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")

    event = db.get(Event, bid.event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if event.planner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your event")
    if event.status != "open":
        raise HTTPException(status_code=400, detail="Event is not open")

    # Accept this bid
    bid.status = "accepted"

    # Reject all other bids on the same event
    other_bids = (
        db.query(Bid)
        .filter(Bid.event_id == event.id, Bid.id != bid.id)
        .all()
    )
    for other in other_bids:
        other.status = "rejected"

    # Update event status
    event.status = "booked"

    # Create booking
    booking = Booking(
        event_id=event.id,
        bid_id=bid.id,
        planner_id=current_user.id,
        restaurant_id=bid.restaurant_id,
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)

    # Get restaurant name for response
    restaurant_profile = bid.restaurant.restaurant_profile if bid.restaurant else None

    return BookingResponse(
        id=booking.id,
        event_id=booking.event_id,
        bid_id=booking.bid_id,
        planner_id=booking.planner_id,
        restaurant_id=booking.restaurant_id,
        status=booking.status,
        confirmed_at=booking.confirmed_at,
        event_title=event.title,
        restaurant_name=restaurant_profile.name if restaurant_profile else None,
        event_date=str(event.date),
        bid_price=bid.price_total,
    )
