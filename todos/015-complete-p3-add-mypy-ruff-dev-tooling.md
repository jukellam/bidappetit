---
status: complete
priority: p3
issue_id: "015"
tags: [code-review, python, tooling, quality]
dependencies: []
---

# Add mypy and ruff as Dev Dependencies

## Problem Statement

The Python backend has no linting, formatting, or type-checking tools declared. Type annotations are decoration only — they're never mechanically verified. Several type issues (e.g., `Mapped[list]` instead of `Mapped[list[str]]`, `Optional[T]` instead of `T | None`) would be caught automatically with mypy.

## Findings

- `backend/pyproject.toml` — no `[project.optional-dependencies]` or `[tool.ruff]` / `[tool.mypy]` sections
- `backend/app/models/restaurant.py:16` — `Mapped[list]` untyped (should be `Mapped[list[str]]`)
- `backend/app/schemas/booking.py:17` — `event_date: str` should be `date | None`
- Multiple files use `Optional[T]` instead of `T | None` (deprecated for Python 3.10+)
- `backend/app/database.py:16` — `get_db` missing return type annotation

## Proposed Solutions

### Option 1: Add ruff + mypy to pyproject.toml

**Approach:**
```toml
[dependency-groups]
dev = ["ruff>=0.4", "mypy>=1.10", "sqlalchemy[mypy]>=2.0"]

[tool.ruff]
line-length = 100
target-version = "py311"
select = ["E", "F", "I", "UP"]  # UP catches Optional[T] → T | None

[tool.mypy]
strict = true
plugins = ["sqlalchemy.ext.mypy.plugin"]
```

**Pros:**
- Automated discovery of type issues on every run
- `ruff UP` rules auto-fix `Optional[T]` → `T | None`
- Investment in code quality scales with the codebase

**Cons:**
- Initial mypy run will flag several existing issues to fix

**Effort:** 2-3 hours (setup + fixing initial findings)

**Risk:** None

## Recommended Action

Option 1. Set up ruff first (faster, easier wins), then add mypy.

## Technical Details

**Affected files:**
- `backend/pyproject.toml`
- All files with `Optional[T]` imports (event.py, bid.py, booking.py schemas + models)
- `backend/app/models/restaurant.py:16`
- `backend/app/database.py:16`

## Acceptance Criteria

- [ ] `uv run ruff check .` passes with no errors
- [ ] `uv run mypy app/` passes or has documented suppressions
- [ ] `Optional[T]` replaced with `T | None` throughout

## Work Log

### 2026-03-12 — Implementation

**By:** pr-comment-resolver

Added `[dependency-groups]` with ruff, mypy, and sqlalchemy[mypy] to `backend/pyproject.toml`. Added `[tool.ruff]` and `[tool.mypy]` config sections. Added `Generator[Session, None, None]` return type annotation to `get_db` in `backend/app/database.py` (importing `Generator` from `collections.abc`).

`Optional[T]` cleanup across model/schema files deferred to todo 007 (StrEnum refactor), which will handle those files together.

### 2026-03-12 — Discovery

**By:** Code Review (python-reviewer)
