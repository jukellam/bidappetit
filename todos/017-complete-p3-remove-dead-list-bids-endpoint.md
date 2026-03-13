---
status: complete
priority: p3
issue_id: "017"
tags: [code-review, simplicity, python]
dependencies: []
---

# Remove Unused list_bids Endpoint

## Problem Statement

`GET /api/events/{event_id}/bids` exists in `bids.py` but is never called from the frontend. The events detail endpoint already embeds bids in its response. This endpoint also has no `response_model` and returns a shape-shifting dict.

## Findings

- `backend/app/routers/bids.py:53-74` — `list_bids` endpoint, 22 lines, no `response_model`
- Returns `{"bids": [...], "count": N}` for planner or `{"my_bid": ..., "count": N}` for restaurant — two shapes
- No frontend caller: `PlannerEventDetail` uses `GET /api/events/{id}` (bids embedded), `BrowseEvents`/`MyBids` use `GET /api/events`
- Would cause confusion if an agent tries to use it and gets different shapes per role

## Proposed Solutions

### Option 1: Delete the endpoint

**Approach:** Remove lines 53-74 from `bids.py`.

**Pros:**
- -22 lines
- Eliminates shape-shifting API surface

**Cons:**
- If an agent or future consumer was relying on it, they'd get 404

**Effort:** 5 minutes

**Risk:** None (confirmed no callers)

---

### Option 2: Keep but fix (add response_model, document)

**Approach:** Add a proper union response model and document the role-based difference.

**Pros:**
- Preserves the endpoint for future use

**Cons:**
- More code for an endpoint nobody calls

**Effort:** 1 hour

**Risk:** None

## Recommended Action

Option 1. Confirmed dead code.

## Technical Details

**Affected files:**
- `backend/app/routers/bids.py:53-74`

## Acceptance Criteria

- [x] `list_bids` function deleted from bids.py
- [x] No 500-level errors from removal
- [x] Backend starts and all other endpoints still work

## Work Log

### 2026-03-12 — Discovery

**By:** Code Review (code-simplicity-reviewer + python-reviewer)

### 2026-03-12 — Completed

**By:** pr-comment-resolver agent

Deleted the `list_bids` function and its route decorator (lines 53-74) from `backend/app/routers/bids.py`. All imports previously used by `list_bids` are also used by other endpoints in the file, so no imports were removed. Committed as `refactor: remove unused list_bids endpoint (todo 017)`.
