---
status: complete
priority: p1
issue_id: "003"
tags: [code-review, performance, database, sqlalchemy]
dependencies: []
---

# Fix N+1 Query in GET /api/events List Endpoint

## Problem Statement

`GET /api/events` fetches all events then runs a separate `SELECT COUNT(*) FROM bids WHERE event_id = ?` for each event. With N events this issues N+1 database queries per request. This endpoint is called from 3 pages: PlannerDashboard, BrowseEvents, and MyBidsPage.

## Findings

- `backend/app/routers/events.py:68-78` — the loop with per-event COUNT query
- At seed scale (6 events): 7 queries per request. At 500 events: 501 queries
- 3 frontend pages call this endpoint, multiplying impact
- Known pattern from dynasty-app solutions: use bulk query + dict index approach

## Proposed Solutions

### Option 1: SQLAlchemy func.count with GROUP BY subquery

**Approach:** Replace the per-event count loop with a single aggregated query:

```python
from sqlalchemy import func

bid_counts = dict(
    db.query(Bid.event_id, func.count(Bid.id))
    .filter(Bid.event_id.in_([e.id for e in events]))
    .group_by(Bid.event_id)
    .all()
)
# Then: bid_counts.get(event.id, 0) per event
```

**Pros:**
- Single query regardless of event count
- O(N) → O(1) queries

**Cons:**
- Requires collecting event IDs first

**Effort:** 30 minutes

**Risk:** Low

---

### Option 2: Joined subquery alongside main events query

**Approach:** Use a correlated subquery on `select(func.count()).where(Bid.event_id == Event.id).scalar_subquery()` added to the main events query as a column.

**Pros:**
- Single round-trip, very clean

**Cons:**
- Slightly more complex SQLAlchemy syntax

**Effort:** 1 hour

**Risk:** Low

## Recommended Action

Option 1 is simplest and follows the pattern documented in dynasty-app solutions (`docs/solutions/refactoring-patterns/sqlalchemy-pydantic-model-consolidation.md`). Collect event IDs, run one bulk COUNT+GROUP BY, zip into a dict.

## Technical Details

**Affected files:**
- `backend/app/routers/events.py:68-78`

**Related components:**
- `frontend/src/pages/planner/Dashboard.tsx` — calls GET /api/events
- `frontend/src/pages/restaurant/BrowseEvents.tsx` — calls GET /api/events
- `frontend/src/pages/restaurant/MyBids.tsx` — calls GET /api/events

## Resources

- **Past solution:** `/Users/justin.kellam/Repos/dynasty-app/docs/solutions/refactoring-patterns/sqlalchemy-pydantic-model-consolidation.md`

## Acceptance Criteria

- [ ] GET /api/events issues exactly 1 query (or 2 at most) regardless of event count
- [ ] `bid_count` values are still correct in response
- [ ] Tests pass

## Work Log

### 2026-03-12 — Discovery

**By:** Code Review (performance-oracle + python-reviewer + architecture-strategist)

**Actions:**
- Identified N+1 pattern in list_events handler
- Confirmed 3 frontend callers of this endpoint
- Found matching past solution in dynasty-app

### 2026-03-12 — Implementation

**By:** pr-comment-resolver (todo 003)

**Actions:**
- Added `func` import from `sqlalchemy` to `backend/app/routers/events.py`
- Replaced per-event `db.query(Bid).filter(...).count()` loop with a single bulk `COUNT+GROUP BY` query using `func.count(Bid.id)` grouped by `Bid.event_id`
- Results zipped into a `bid_counts` dict; each event response uses `bid_counts.get(event.id, 0)`
- GET /api/events now issues 2 queries (fetch events + bulk count) regardless of event count, down from N+1
