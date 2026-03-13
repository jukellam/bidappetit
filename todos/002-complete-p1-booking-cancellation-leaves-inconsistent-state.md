---
status: complete
priority: p1
issue_id: "002"
tags: [code-review, architecture, state-machine]
dependencies: []
---

# Fix Booking Cancellation Leaving Event and Bid in Inconsistent State

## Problem Statement

When `PATCH /api/bookings/{id}/cancel` is called, only `booking.status` is updated to `"cancelled"`. The parent `Event` stays permanently `"booked"` and the accepted `Bid` stays `"accepted"`. The event cannot re-open for bids — the planner has no recovery path and the state machine is broken.

## Findings

- `backend/app/routers/bookings.py:79-105` — only sets `booking.status = "cancelled"`, does not touch event or bid
- `Event.status` remains `"booked"` forever after booking cancellation
- `Bid.status` (the accepted bid) remains `"accepted"` forever after booking cancellation
- No state machine transition defined for this path in the spec

## Proposed Solutions

### Option 1: Reset event to "open" and bid to "pending"

**Approach:** In `cancel_booking`, within the same transaction: set `event.status = "open"` and `bid.status = "pending"` alongside `booking.status = "cancelled"`.

**Pros:**
- Event fully recoverable — can receive new bids again
- Preserves the bid so restaurant can see it was once accepted

**Cons:**
- Cancelling a booking and re-opening to bids may not be desired business behavior (restaurants may have already planned for the event)

**Effort:** 30 minutes

**Risk:** Low

---

### Option 2: Set event to "cancelled" when booking is cancelled

**Approach:** Cancel the event outright when its booking is cancelled, rejecting all bids.

**Pros:**
- Simpler state — event has a clear terminal state
- No ambiguity about bidding re-opening

**Cons:**
- Planner loses the ability to re-solicit bids
- More destructive

**Effort:** 30 minutes

**Risk:** Low

---

### Option 3: Add a "cancellation_pending" state (complex)

**Approach:** Introduce an intermediate state requiring both parties to confirm before full cancellation.

**Pros:**
- More realistic marketplace behavior

**Cons:**
- Significant scope expansion, new UI needed, overkill for prototype

**Effort:** Large

**Risk:** Medium

## Recommended Action

Implement Option 1. Re-open the event to allow new bids — this is the most useful recovery path for a planner. Also cascade: reject all other previously-rejected bids should stay rejected (don't re-open them), but the cancelled booking's bid returns to "pending".

## Technical Details

**Affected files:**
- `backend/app/routers/bookings.py:79-105`
- Must also load `booking.event` and `booking.bid` within the transaction

## Resources

- **Related finding:** 001 (race condition in accept_bid)

## Acceptance Criteria

- [ ] Cancelling a booking sets `event.status = "open"`
- [ ] Cancelling a booking sets the previously-accepted `bid.status = "pending"`
- [ ] Event appears as open in GET /api/events after booking cancellation
- [ ] Restaurant can submit a new bid on the re-opened event
- [ ] Tests pass

## Work Log

### 2026-03-12 — Discovery

**By:** Code Review (architecture-strategist)

**Actions:**
- Identified state machine gap in booking cancellation handler
- Confirmed event and bid statuses are not updated on cancellation

### 2026-03-12 — Resolution

**By:** pr-comment-resolver

**Actions:**
- Implemented Option 1: within the same transaction in `cancel_booking`, set `booking.event.status = "open"` and `booking.bid.status = "pending"` alongside `booking.status = "cancelled"`
- Both related objects were already loaded via `joinedload` so no additional query was needed
- Committed as: `fix: reset event and bid state on booking cancellation (todo 002)`
