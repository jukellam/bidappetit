---
status: complete
priority: p2
issue_id: "012"
tags: [code-review, python, simplicity, pydantic]
dependencies: [011]
---

# Replace Manual Column Dict Comprehension With model_validate

## Problem Statement

Four locations in `routers/events.py` manually iterate `event.__table__.columns` to unpack an ORM object into a Pydantic schema. This bypasses Pydantic's `model_validate` path, accesses SQLAlchemy internal metadata, and misses any Pydantic validators or aliases.

## Findings

- `backend/app/routers/events.py:31` — `EventResponse({c.name: getattr(event, c.name) for c in event.__table__.columns}, bid_count=0)`
- `backend/app/routers/events.py:75` — same pattern in list_events
- `backend/app/routers/events.py:144` — same in get_event
- `backend/app/routers/events.py:171` — same in cancel_event
- All schemas already have `model_config = {"from_attributes": True}` which makes `model_validate` work directly

## Proposed Solutions

### Option 1: Use model_validate with update

**Approach:** Replace each occurrence with:
```python
EventResponse.model_validate(event, update={"bid_count": bid_count})
# or for create_event where bid_count is always 0:
EventResponse.model_validate(event, update={"bid_count": 0})
```

Note: Pydantic v2's `model_validate` doesn't accept `update` directly — use `model_copy`:
```python
EventResponse.model_validate(event).model_copy(update={"bid_count": bid_count})
```

**Pros:**
- Clean, idiomatic Pydantic v2
- Automatically includes new fields when added to model
- No SQLAlchemy internals accessed

**Cons:**
- `model_copy` is a two-step call

**Effort:** 30 minutes

**Risk:** Low

## Recommended Action

Option 1. Four-line change across 4 call sites.

## Technical Details

**Affected files:**
- `backend/app/routers/events.py:31, 75, 144, 171`

## Acceptance Criteria

- [ ] No `__table__.columns` references in routers
- [ ] All EventResponse returns still correct
- [ ] `npx tsc --noEmit` passes, backend starts without errors

## Work Log

### 2026-03-12 — Implementation

**By:** Claude (pr-comment-resolver)

Replaced all four `__table__.columns` dict comprehension occurrences in `backend/app/routers/events.py` with `EventResponse.model_validate(event).model_copy(update={...})`. `EventResponse` already had `model_config = {"from_attributes": True}`. No other files required changes.

- `create_event` (line 31): replaced with `model_validate + model_copy(update={"bid_count": 0})`
- `list_events` (line 72): replaced with `model_validate + model_copy(update={"bid_count": bid_count})`
- `get_event` (line 140): replaced with `model_validate + model_copy(update={"bid_count": bid_count, "bids": bids_out, "my_bid": my_bid})`
- `cancel_event` (line 164): replaced with `model_validate + model_copy(update={"bid_count": bid_count})`

### 2026-03-12 — Discovery

**By:** Code Review (python-reviewer + code-simplicity-reviewer)
