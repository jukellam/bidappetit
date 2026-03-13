---
status: complete
priority: p2
issue_id: "008"
tags: [code-review, architecture, state-machine]
dependencies: []
---

# Cancel Event Should Cascade to Reject All Pending Bids

## Problem Statement

When `PATCH /api/events/{id}/cancel` is called, only `event.status` is updated to `"cancelled"`. All pending bids on that event remain indefinitely in `"pending"` status. Restaurants see these bids with pending styling against a cancelled event, and receive no state feedback.

## Findings

- `backend/app/routers/events.py:151-173` — sets `event.status = "cancelled"` only
- Restaurants viewing `MyBids` will see pending bids on a cancelled event indefinitely
- State machine contract violated: bids should reach a terminal state when their event is cancelled

## Proposed Solutions

### Option 1: Bulk-update all pending bids to "rejected" within the same transaction

**Approach:** After setting `event.status = "cancelled"`, add:
```python
db.query(Bid).filter(Bid.event_id == event_id, Bid.status == "pending").update({"status": "rejected"})
```

**Pros:**
- Clean terminal state for all bids
- Single extra query in the transaction

**Cons:**
- None

**Effort:** 15 minutes

**Risk:** None

---

### Option 2: New "event_cancelled" bid status

**Approach:** Add a distinct `"event_cancelled"` bid status to differentiate from a planner-rejected bid.

**Pros:**
- More informative to restaurants

**Cons:**
- Requires updating StrEnum (depends on todo 007), frontend types, badge styles

**Effort:** 1-2 hours

**Risk:** Low

## Recommended Action

Option 1. Simple and correct. Use "rejected" for consistency.

## Technical Details

**Affected files:**
- `backend/app/routers/events.py:151-173`

## Acceptance Criteria

- [ ] Cancelling an event sets all pending bids to "rejected" in the same transaction
- [ ] GET /api/events/{id}/bids shows rejected bids after event cancellation
- [ ] Restaurant's MyBids page shows correct bid state

## Work Log

### 2026-03-12 — Discovery

**By:** Code Review (architecture-strategist)

### 2026-03-12 — Resolution

**By:** pr-comment-resolver

Added bulk update in `cancel_event` handler (`backend/app/routers/events.py`) to reject all pending bids when an event is cancelled. The query `db.query(Bid).filter(Bid.event_id == event_id, Bid.status == "pending").update({"status": "rejected"})` runs in the same transaction before `db.commit()`, ensuring atomicity. Implemented Option 1 from the proposed solutions.
