from datetime import date, datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.event import Event
from app.models.bid import Bid
from app.schemas.event import EventCreate, EventResponse, EventListResponse, BidInEvent

router = APIRouter(tags=["events"])


@router.post("/api/events", response_model=EventResponse)
def create_event(
    data: EventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.user_type != "planner":
        raise HTTPException(status_code=403, detail="Only planners can create events")

    event = Event(planner_id=current_user.id, **data.model_dump())
    db.add(event)
    db.commit()
    db.refresh(event)
    return EventResponse(
        **{c.name: getattr(event, c.name) for c in event.__table__.columns},
        bid_count=0,
    )


@router.get("/api/events", response_model=list[EventListResponse])
def list_events(
    city: Optional[str] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    guest_count_min: Optional[int] = Query(None),
    guest_count_max: Optional[int] = Query(None),
    event_type: Optional[str] = Query(None),
    budget_max: Optional[float] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Event)

    if city:
        q = q.filter(Event.city == city)
    if date_from:
        q = q.filter(Event.date >= date_from)
    if date_to:
        q = q.filter(Event.date <= date_to)
    if guest_count_min:
        q = q.filter(Event.guest_count >= guest_count_min)
    if guest_count_max:
        q = q.filter(Event.guest_count <= guest_count_max)
    if event_type:
        q = q.filter(Event.event_type == event_type)
    if budget_max:
        q = q.filter(Event.budget_min <= budget_max)
    if status:
        q = q.filter(Event.status == status)

    events = q.order_by(Event.date.asc()).all()

    result = []
    for event in events:
        bid_count = db.query(Bid).filter(Bid.event_id == event.id).count()
        result.append(
            EventListResponse(
                **{c.name: getattr(event, c.name) for c in event.__table__.columns},
                bid_count=bid_count,
            )
        )
    return result


@router.get("/api/events/{event_id}", response_model=EventResponse)
def get_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    event = (
        db.query(Event)
        .options(joinedload(Event.bids).joinedload(Bid.restaurant))
        .filter(Event.id == event_id)
        .first()
    )
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    bid_count = len(event.bids)
    bids_out = None
    my_bid = None

    if current_user.id == event.planner_id:
        # Planner sees all bids
        bids_out = []
        for bid in event.bids:
            profile = bid.restaurant.restaurant_profile if bid.restaurant else None
            bids_out.append(
                BidInEvent(
                    id=bid.id,
                    restaurant_id=bid.restaurant_id,
                    price_total=bid.price_total,
                    price_per_person=bid.price_per_person,
                    proposal_text=bid.proposal_text,
                    menu_details=bid.menu_details,
                    space_details=bid.space_details,
                    inclusions=bid.inclusions,
                    status=bid.status,
                    created_at=bid.created_at,
                    restaurant_name=profile.name if profile else None,
                    restaurant_cuisine=profile.cuisine_type if profile else None,
                )
            )
    elif current_user.user_type == "restaurant":
        # Restaurant sees only their own bid
        for bid in event.bids:
            if bid.restaurant_id == current_user.id:
                profile = bid.restaurant.restaurant_profile if bid.restaurant else None
                my_bid = BidInEvent(
                    id=bid.id,
                    restaurant_id=bid.restaurant_id,
                    price_total=bid.price_total,
                    price_per_person=bid.price_per_person,
                    proposal_text=bid.proposal_text,
                    menu_details=bid.menu_details,
                    space_details=bid.space_details,
                    inclusions=bid.inclusions,
                    status=bid.status,
                    created_at=bid.created_at,
                    restaurant_name=profile.name if profile else None,
                    restaurant_cuisine=profile.cuisine_type if profile else None,
                )
                break

    return EventResponse(
        **{c.name: getattr(event, c.name) for c in event.__table__.columns},
        bid_count=bid_count,
        bids=bids_out,
        my_bid=my_bid,
    )


@router.patch("/api/events/{event_id}/cancel", response_model=EventResponse)
def cancel_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    event = db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if event.planner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your event")
    if event.status != "open":
        raise HTTPException(status_code=400, detail="Can only cancel open events")

    event.status = "cancelled"
    db.commit()
    db.refresh(event)

    bid_count = db.query(Bid).filter(Bid.event_id == event.id).count()
    return EventResponse(
        **{c.name: getattr(event, c.name) for c in event.__table__.columns},
        bid_count=bid_count,
    )
