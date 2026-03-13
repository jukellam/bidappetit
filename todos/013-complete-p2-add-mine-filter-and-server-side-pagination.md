---
status: complete
priority: p2
issue_id: "013"
tags: [code-review, performance, architecture, agent-native]
dependencies: []
---

# Add Server-Side Filters for Planner Events and Restaurant Bids (Fix O(N) Client-Side Fetches)

## Problem Statement

Three frontend components fetch all events from the database and filter client-side, downloading far more data than needed. This will become a scalability problem as event count grows and breaks agent-native parity (agents can't efficiently find their own resources).

## Findings

- `frontend/src/pages/planner/Dashboard.tsx:14-18` — fetches all events, filters to `planner_id === user.id`
- `frontend/src/pages/restaurant/MyBids.tsx:11-13` — fetches all events, filters to `e.my_bid` truthy
- `frontend/src/pages/restaurant/Dashboard.tsx:25` — fetches all open events, filters to matching city
- Backend `GET /api/events` supports `city`, `status` filters already, but no `planner_id` or `has_bid` filter
- Agent-native review: agents acting as planners or restaurants cannot efficiently find their own resources

## Proposed Solutions

### Option 1: Add planner_id filter + dedicated restaurant bids endpoint

**Approach:**
1. Add `planner_id: Optional[int] = Query(None)` filter to `GET /api/events` handler
2. Add `GET /api/users/me/bids` or use `GET /api/events?has_bid=true` (auto-filtered by auth)

```python
# In list_events:
if planner_id:
    q = q.filter(Event.planner_id == planner_id)
```

Frontend updates:
- `PlannerDashboard`: `GET /api/events?planner_id={user.id}`
- `RestaurantDashboard`: already uses `?city=` but bypasses it — fix to use the filter
- `MyBidsPage`: call `GET /api/events?has_bid=true`

**Pros:**
- Backend does the filtering
- Agent-accessible via query parameters
- Fixes O(N) data download

**Cons:**
- Small backend addition

**Effort:** 1-2 hours

**Risk:** Low

---

### Option 2: Add pagination as well

**Approach:** Add `limit` (max 100) and `offset` params to all list endpoints alongside the filters.

**Pros:**
- Hard cap prevents unbounded responses

**Cons:**
- Frontend needs pagination UI or infinite scroll

**Effort:** 2-3 hours additional

**Risk:** Low

## Recommended Action

Option 1 first (filters), Option 2 as a follow-on. The `planner_id` filter is one line in `events.py`. The `has_bid` filter requires checking if the current user has a bid on each event — can be implemented as a subquery.

## Technical Details

**Affected files:**
- `backend/app/routers/events.py:36-79` — add planner_id and has_bid query params
- `frontend/src/pages/planner/Dashboard.tsx:14`
- `frontend/src/pages/restaurant/MyBids.tsx:11`
- `frontend/src/pages/restaurant/Dashboard.tsx:25`

## Acceptance Criteria

- [x] GET /api/events?planner_id={id} returns only that planner's events
- [x] GET /api/events?has_bid=true returns only events where caller has a bid
- [x] PlannerDashboard uses the filter instead of client-side filter
- [x] MyBidsPage uses the filter instead of client-side filter

## Work Log

### 2026-03-12 — Discovery

**By:** Code Review (performance-oracle + agent-native-reviewer + architecture-strategist + code-simplicity-reviewer)

### 2026-03-12 — Implementation

**By:** Claude (todo 013)

**Changes:**
- `backend/app/routers/events.py` — added `planner_id: int | None` and `has_bid: bool | None` query parameters to `list_events`; `planner_id` filters by `Event.planner_id`, `has_bid` uses a subquery on `Bid.event_id` filtered by `current_user.id`
- `frontend/src/pages/planner/Dashboard.tsx` — changed API call to `GET /api/events?planner_id=${user.id}`, removed client-side `.filter(e => e.planner_id === user.id)`
- `frontend/src/pages/restaurant/MyBids.tsx` — changed API call to `GET /api/events?has_bid=true`, removed client-side `.filter(e => e.my_bid)`
- `frontend/src/pages/restaurant/Dashboard.tsx` — added `city` query parameter to API call (`GET /api/events?status=open&city=...`), removed client-side `.filter(e => e.city === city)`
