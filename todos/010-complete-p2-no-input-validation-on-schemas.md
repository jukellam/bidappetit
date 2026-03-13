---
status: complete
priority: p2
issue_id: "010"
tags: [code-review, security, validation, pydantic]
dependencies: []
---

# Add Pydantic Field Validation to EventCreate and BidCreate

## Problem Statement

`EventCreate` and `BidCreate` accept all fields as plain types with no length limits, sign constraints, or cross-field validation. A caller can submit `price_total: -999999`, `guest_count: 0`, `budget_min > budget_max`, or a `bid_deadline` in the past. The frontend also sends `NaN` when numeric inputs are left empty.

## Findings

- `backend/app/schemas/event.py:7-22` — no `Field(gt=0)`, no `max_length`, no cross-field validators
- `backend/app/schemas/bid.py:7-13` — `price_total: float` with no constraints
- `frontend/src/pages/planner/CreateEvent.tsx:13` — form state all strings, `parseInt`/`parseFloat` on empty string = `NaN`, sent to API
- `frontend/src/pages/restaurant/SubmitBid.tsx:12` — same pattern
- DB column lengths (e.g. `String(2000)`) not enforced at schema layer

## Proposed Solutions

### Option 1: Pydantic Field() with constraints + model_validator

**Approach:**
```python
from pydantic import Field, model_validator

class EventCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    guest_count: int = Field(gt=0)
    budget_min: float = Field(gt=0)
    budget_max: float = Field(gt=0)
    bid_deadline: datetime
    price_total: float = Field(gt=0)  # in BidCreate

    @model_validator(mode="after")
    def validate_budget_range(self) -> "EventCreate":
        if self.budget_min > self.budget_max:
            raise ValueError("budget_min must be <= budget_max")
        if self.bid_deadline <= datetime.now(timezone.utc):
            raise ValueError("bid_deadline must be in the future")
        return self
```

**Pros:**
- FastAPI returns 422 with clear field errors automatically
- Prevents nonsensical data in DB

**Cons:**
- Small amount of boilerplate

**Effort:** 1-2 hours

**Risk:** None

### Option 2: Frontend validation only

**Approach:** Add form validation in CreateEvent.tsx and SubmitBid.tsx before submit.

**Pros:**
- Better UX (inline errors)

**Cons:**
- Doesn't prevent direct API calls; backend still unprotected

**Effort:** 1-2 hours

**Risk:** None

## Recommended Action

Both options should be implemented. Backend validation (Option 1) for correctness; frontend validation for UX. Do Option 1 first.

## Technical Details

**Affected files:**
- `backend/app/schemas/event.py`
- `backend/app/schemas/bid.py`
- `frontend/src/pages/planner/CreateEvent.tsx` (numeric parseFloat on empty string)
- `frontend/src/pages/restaurant/SubmitBid.tsx` (same)

## Acceptance Criteria

- [ ] POST /api/events returns 422 for guest_count <= 0
- [ ] POST /api/events returns 422 for budget_min > budget_max
- [ ] POST /api/events returns 422 for bid_deadline in the past
- [ ] POST /api/events/{id}/bids returns 422 for price_total <= 0
- [ ] Frontend does not send NaN for empty numeric fields

## Work Log

### 2026-03-12 — Implemented

**By:** Claude (todo 010)

Added `Field()` constraints to `EventCreate` (min/max lengths on strings, `gt=0` on numeric fields, `max_length` on optional text fields) and a `model_validator` that rejects `budget_min > budget_max` and `bid_deadline` in the past. Added `Field(gt=0)` to `BidCreate.price_total`. Replaced `parseInt`/`parseFloat` in `CreateEvent.tsx` and `SubmitBid.tsx` with `Number(...) || fallback` to prevent NaN from being sent to the API.

### 2026-03-12 — Discovery

**By:** Code Review (security-sentinel + typescript-reviewer)
