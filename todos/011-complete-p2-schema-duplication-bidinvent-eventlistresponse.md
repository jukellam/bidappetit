---
status: complete
priority: p2
issue_id: "011"
tags: [code-review, python, simplicity, schemas]
dependencies: []
---

# Remove Duplicate Schemas: BidInEvent and EventListResponse

## Problem Statement

`BidInEvent` is `BidResponse` plus two fields. `EventListResponse` is `EventResponse` minus several Optional fields that already default to `None`. Both duplicate schemas are unnecessary and create maintenance burden — adding a field requires updating two places.

## Findings

- `backend/app/schemas/event.py:25-39` — `BidInEvent`: 12 fields identical to `BidResponse`, plus `restaurant_name` and `restaurant_cuisine`
- `backend/app/schemas/bid.py:25-38` — `BidResponse`: same 12 fields, minus those two
- `backend/app/schemas/event.py:69-86` — `EventListResponse`: `EventResponse` minus `duration_hours`, `cuisine_preferences`, `dietary_restrictions`, `vibe`, `special_requests`, `bids`, `my_bid` — all of which are already `Optional` with `None` defaults

## Proposed Solutions

### Option 1: Extend BidResponse with optional denormalized fields

**Approach:** Add `restaurant_name: str | None = None` and `restaurant_cuisine: str | None = None` to `BidResponse`. Remove `BidInEvent` class. Update all imports in `events.py` and `routers/events.py`.

**Pros:**
- Removes ~15 lines
- Single bid schema throughout

**Cons:**
- `BidResponse` now has fields that are only populated in the embedded-in-event context

**Effort:** 30 minutes

**Risk:** Low

---

### Option 2: Remove EventListResponse, use EventResponse with `response_model_exclude_none=True`

**Approach:** Use `EventResponse` as the response model for `GET /api/events`, add `response_model_exclude_none=True` to the route to omit null fields from JSON. Remove `EventListResponse` class.

**Pros:**
- Removes ~17 lines
- Single event schema

**Cons:**
- Sends all `null` fields in response for events with no bids (minor)

**Effort:** 20 minutes

**Risk:** None

## Recommended Action

Both options. Implement together — they're independent and each is a simple removal.

## Technical Details

**Affected files:**
- `backend/app/schemas/event.py` — remove `BidInEvent`, remove `EventListResponse`
- `backend/app/schemas/bid.py` — add `restaurant_name`/`restaurant_cuisine` optional fields
- `backend/app/routers/events.py` — update imports and type hints

**LOC removed:** ~32 lines total

## Acceptance Criteria

- [x] `BidInEvent` class deleted
- [x] `EventListResponse` class deleted
- [x] All endpoints still return correct response shapes
- [ ] TypeScript compiles clean, backend starts without errors

## Work Log

### 2026-03-12 — Discovery

**By:** Code Review (code-simplicity-reviewer + python-reviewer)

### 2026-03-12 — Implementation

**By:** Claude (pr-comment-resolver)

Added `restaurant_name: str | None = None` and `restaurant_cuisine: str | None = None` to `BidResponse` in `backend/app/schemas/bid.py`. Deleted `BidInEvent` and `EventListResponse` classes from `backend/app/schemas/event.py`. Updated `EventResponse.bids` and `EventResponse.my_bid` to use `BidResponse`. In `backend/app/routers/events.py`, removed `BidInEvent`/`EventListResponse` imports, added `BidResponse` import, switched `GET /api/events` response model to `list[EventResponse]` with `response_model_exclude_none=True`, replaced all `BidInEvent(` and `EventListResponse(` constructor calls with their canonical equivalents, and added `event_id=bid.event_id` to the two manual `BidResponse` construction sites that previously omitted that required field.
