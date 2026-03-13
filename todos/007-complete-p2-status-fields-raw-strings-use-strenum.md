---
status: complete
priority: p2
issue_id: "007"
tags: [code-review, python, type-safety, architecture]
dependencies: []
---

# Replace Raw String Status Fields With StrEnum

## Problem Statement

`Event.status`, `Bid.status`, `Booking.status`, and `User.user_type` are all `Mapped[str]` with no validation, no autocomplete, and no DB-level constraint. Valid values live only in scattered `if x != "open"` checks in routers. Frontend type unions (`EventStatus`, `BidStatus`) already diverge from the backend (frontend has `"expired"` and `"withdrawn"` which have no backend implementation).

## Findings

- `backend/app/models/event.py:27` — `status: Mapped[str] = mapped_column(String(20), default="open")`
- `backend/app/models/bid.py:25` — same pattern
- `backend/app/models/booking.py:17` — same pattern
- `backend/app/models/user.py:15` — `user_type: Mapped[str]`
- `frontend/src/types/index.ts:3` — `BidStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn'` — `withdrawn` has no backend endpoint
- `frontend/src/types/index.ts:2` — `EventStatus` includes `'expired'` — has no backend meaning

## Proposed Solutions

### Option 1: Python StrEnum (Python 3.11+)

**Approach:** Define enums and use in models:
```python
import enum

class EventStatus(str, enum.Enum):
    OPEN = "open"
    BOOKED = "booked"
    CANCELLED = "cancelled"
```
Column: `status: Mapped[EventStatus] = mapped_column(String(20), default=EventStatus.OPEN)`
Comparisons: `event.status != EventStatus.OPEN`

**Pros:**
- Type safety throughout
- Prevents typos (e.g., `"Open"` vs `"open"`)
- Aligns frontend and backend valid values

**Cons:**
- Requires updating all router comparisons
- SQLite doesn't enforce CHECK constraints via SQLAlchemy String — use `Enum` type for that

**Effort:** 2-3 hours

**Risk:** Low

---

### Option 2: SQLAlchemy Enum type

**Approach:** Use `Enum(EventStatus)` column type, which emits a CHECK constraint.

**Pros:**
- DB-level constraint in addition to Python type safety

**Cons:**
- Requires schema migration (currently using `create_all` so just a table drop/recreate in dev)

**Effort:** 3-4 hours

**Risk:** Low (dev only, no Alembic)

## Recommended Action

Option 2 (SQLAlchemy Enum). Also update `frontend/src/types/index.ts` to remove `'expired'` from `EventStatus` and `'withdrawn'` from `BidStatus` (or implement the corresponding backend endpoints — see todo 023).

## Technical Details

**Affected files:**
- `backend/app/models/event.py`
- `backend/app/models/bid.py`
- `backend/app/models/booking.py`
- `backend/app/models/user.py`
- All routers using string comparisons

## Acceptance Criteria

- [x] All status fields use StrEnum or SQLAlchemy Enum
- [x] No bare string literals for status values in routers
- [x] Frontend type unions match backend valid values
- [x] App still seeds and runs correctly

## Work Log

### 2026-03-12 — Discovery

**By:** Code Review (python-reviewer + architecture-strategist)

### 2026-03-12 — Implementation

**By:** Claude (pr-comment-resolver)

Created `backend/app/models/enums.py` with four StrEnum classes: `EventStatus`, `BidStatus`, `BookingStatus`, `UserType`. Updated all four model files to import and use enum defaults. Replaced every bare string status/user_type comparison and assignment across `events.py`, `bids.py`, `bookings.py` routers and `seed.py`. Removed `'expired'` from frontend `EventStatus`, `'withdrawn'` from `BidStatus`, and `'completed'` from `BookingStatus` to align with backend enum values. Column types remain `String(20)` for SQLite compatibility.
