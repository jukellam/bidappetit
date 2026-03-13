import enum


class EventStatus(str, enum.Enum):
    OPEN = "open"
    BOOKED = "booked"
    CANCELLED = "cancelled"


class BidStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"


class BookingStatus(str, enum.Enum):
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"


class UserType(str, enum.Enum):
    PLANNER = "planner"
    RESTAURANT = "restaurant"
