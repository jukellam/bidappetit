---
status: complete
priority: p2
issue_id: "009"
tags: [code-review, security, correctness]
dependencies: []
---

# PUT /api/bids/{id} Must Check Bid Deadline Before Allowing Update

## Problem Statement

`POST /api/events/{event_id}/bids` (create bid) correctly enforces the bid deadline. However, `PUT /api/bids/{bid_id}` (update bid) has no deadline check. A restaurant can submit a bid before deadline, then freely update price and proposal text after the deadline closes, undermining the fairness of the sealed-bid auction.

## Findings

- `backend/app/routers/bids.py:77-98` — `update_bid` checks `bid.status == "pending"` but not deadline
- `backend/app/routers/bids.py:33` — `submit_bid` correctly does: `event.bid_deadline.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc)`
- The event must be fetched to check the deadline (not currently fetched in `update_bid`)

## Proposed Solutions

### Option 1: Add deadline check to update_bid

**Approach:** After fetching the bid, fetch the event and apply the same deadline guard:
```python
event = db.get(Event, bid.event_id)
if event.bid_deadline.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
    raise HTTPException(status_code=400, detail="Bid deadline has passed")
```

**Pros:**
- Consistent behavior between create and update
- One-time fix

**Cons:**
- Adds one extra DB lookup per update call

**Effort:** 15 minutes

**Risk:** None

## Recommended Action

Option 1. Straightforward fix.

## Technical Details

**Affected files:**
- `backend/app/routers/bids.py:77-98`

## Acceptance Criteria

- [x] PUT /api/bids/{id} returns HTTP 400 if bid deadline has passed
- [x] PUT /api/bids/{id} still works normally before deadline

## Work Log

### 2026-03-12 — Discovery

**By:** Code Review (security-sentinel)

### 2026-03-12 — Resolution

**By:** pr-comment-resolver

Added deadline check to `update_bid` in `backend/app/routers/bids.py`. After fetching the bid and verifying ownership/status, the endpoint now fetches the associated event and raises HTTP 400 if `event.bid_deadline` has passed. Both `Event` model and `datetime`/`timezone` were already imported, so no additional import changes were required. Committed as part of the todo 009 resolution.
