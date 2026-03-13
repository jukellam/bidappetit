---
status: complete
priority: p3
issue_id: "016"
tags: [code-review, security, configuration]
dependencies: []
---

# Add database.db to .gitignore and Externalize CORS Origin

## Problem Statement

The SQLite database file lives in the backend working directory as `backend/database.db` and is not gitignored — if committed it would expose all seed data (and any real data) in git history. The CORS origin (`"http://localhost:5173"`) is also hardcoded rather than read from an env variable.

## Findings

- `backend/app/database.py:4` — `sqlite:///./database.db` (relative to cwd)
- `backend/database.db` — likely exists on disk
- `.gitignore` — `database.db` may not be listed
- `backend/app/main.py:34` — `allow_origins=["http://localhost:5173"]` hardcoded

## Proposed Solutions

### Option 1: Update .gitignore + add settings

**Approach:**
1. Add `backend/database.db` to root `.gitignore`
2. Create `backend/.env` (also gitignored) with `CORS_ORIGIN=http://localhost:5173`
3. Read in `main.py`: `cors_origin = os.getenv("CORS_ORIGIN", "http://localhost:5173")`

**Effort:** 20 minutes

**Risk:** None

## Recommended Action

Option 1. Quick, essential hygiene.

## Technical Details

**Affected files:**
- `.gitignore` at repo root
- `backend/app/main.py:34`
- New: `backend/.env.example`

## Acceptance Criteria

- [x] `database.db` in .gitignore
- [x] CORS origin read from environment variable with localhost default
- [x] `.env.example` documents the available variables

## Work Log

### 2026-03-12 — Discovery

**By:** Code Review (security-sentinel)

### 2026-03-12 — Implementation

**By:** pr-comment-resolver

- Added `backend/database.db` to `.gitignore` (alongside existing `*.db` wildcard)
- Added `import os` and `cors_origin = os.getenv("CORS_ORIGIN", "http://localhost:5173")` to `backend/app/main.py`; replaced hardcoded string in `allow_origins` with `[cors_origin]`
- Created `backend/.env.example` documenting the `CORS_ORIGIN` variable
- Committed as `chore: gitignore database.db and externalize CORS origin (todo 016)`
