---
status: complete
priority: p1
issue_id: "001"
tags: [code-review, architecture, concurrency, security]
dependencies: []
---

# Fix Race Condition in accept_bid That Allows Double-Booking

## Problem Statement

`POST /api/bids/{bid_id}/accept` performs a read-then-write without any row-level locking. Two concurrent requests can both read `event.status == "open"` before either commits, resulting in two bookings for the same event and multiple bids being incorrectly accepted.

## Findings

- `backend/app/routers/bids.py:107-143` — handler checks `event.status == "open"` then sets `event.status = "booked"` with no lock between
- SQLite's serialized writes give partial protection in single-process, single-worker mode, but nothing prevents two Uvicorn workers from racing
- Also: `accept_bid` at line 107 does not check `bid.status == "pending"` before accepting — a previously rejected bid could be re-accepted

## Proposed Solutions

### Option 1: Optimistic locking with rowcount check

**Approach:** Replace the status read + separate write with a single `UPDATE events SET status='booked' WHERE id=:id AND status='open'` and verify `rowcount == 1` before proceeding.

**Pros:**
- Works with SQLite and all other engines
- No additional dependencies

**Cons:**
- Requires raw SQL or SQLAlchemy `update()` expression instead of ORM attribute assignment

**Effort:** 1-2 hours

**Risk:** Low

---

### Option 2: `SELECT ... FOR UPDATE` (Postgres-ready)

**Approach:** Use `.with_for_update()` on the event query to acquire a row lock before the status check.

**Pros:**
- Standard pattern, correct on Postgres
- Works perfectly when migrating away from SQLite

**Cons:**
- SQLite ignores `FOR UPDATE` — no actual protection in current setup

**Effort:** 30 minutes

**Risk:** Low (but SQLite-ineffective)

---

### Option 3: Add bid.status == "pending" guard (parallel fix)

**Approach:** Add `if bid.status != "pending": raise HTTPException(400, "Bid is not pending")` at `bids.py:109`, immediately after fetching the bid.

**Pros:**
- Prevents accepting already-rejected or accepted bids
- One-line fix

**Cons:**
- Does not solve the concurrency race, only a subset of it

**Effort:** 15 minutes

**Risk:** None

## Recommended Action

Implement Option 1 (optimistic rowcount check) + Option 3 (bid.status guard) together. Option 1 is the concurrency fix, Option 3 is a correctness guard that should exist regardless.

## Technical Details

**Affected files:**
- `backend/app/routers/bids.py:107-143`

**Related components:**
- `Booking` model — second booking row created on race
- `Bid` model — multiple bids incorrectly "accepted"

## Resources

- **PR:** N/A (on main)
- **Related finding:** 002 (booking cancellation state inconsistency)

## Acceptance Criteria

- [ ] Concurrent accept_bid calls for the same event result in exactly one booking
- [ ] Second concurrent call returns HTTP 400 "Event is not open"
- [ ] `bid.status == "pending"` guard added before accept logic
- [ ] Tests pass

## Work Log

### 2026-03-12 — Discovery

**By:** Code Review (architecture-strategist + code review)

**Actions:**
- Identified race condition via architecture review
- Confirmed no row-locking in accept_bid handler
- Found secondary bug: bid.status not checked before accepting

### 2026-03-12 — Resolution

**By:** pr-comment-resolver

**Actions:**
- Added `bid.status != "pending"` guard in `accept_bid` immediately after fetching the bid
- Replaced separate `event.status == "open"` check + `event.status = "booked"` assignment with a single atomic `UPDATE events SET status='booked' WHERE id=:id AND status='open'` using SQLAlchemy `update()` expression
- Added `rowcount == 0` check to return HTTP 400 if the event was already booked by a concurrent request
- Added `from sqlalchemy import update as sa_update` import
- Committed: `fix: fix race condition in accept_bid with optimistic locking and bid status guard (todo 001)`
