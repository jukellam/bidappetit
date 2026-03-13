---
status: complete
priority: p1
issue_id: "006"
tags: [code-review, security, authentication]
dependencies: []
---

# Restrict Unauthenticated User Enumeration Endpoint

## Problem Statement

`GET /api/users` has no authentication dependency. Any anonymous caller can enumerate all user IDs, names, and email addresses. Combined with the mock auth login endpoint, this enables trivial impersonation of any user without any credential.

## Findings

- `backend/app/routers/auth.py:11` — `list_users` has no `Depends(get_current_user)`
- Returns `UserResponse` including email for all users
- Used by `LoginPage.tsx` for the demo login picker — intentional for prototype UX
- Combined with `POST /api/auth/login` (which accepts any user_id), enables full impersonation chain: enumerate IDs → POST login → set X-User-ID header
- `GET /api/restaurants/{profile_id}` at `routers/restaurants.py:11` is also unauthenticated

## Proposed Solutions

### Option 1: Gate behind auth + document as prototype-only

**Approach:** Add `current_user: User = Depends(get_current_user)` to `list_users`. The frontend already sets `X-User-ID` after login, so this breaks the bootstrap problem — add a dedicated unauthenticated `/api/dev/users` endpoint gated behind an env var (`SEED_AUTH_ENABLED=true`) for dev only.

**Pros:**
- Correct production posture
- Dev UX preserved via env-gated endpoint

**Cons:**
- LoginPage.tsx needs updating to call the dev endpoint

**Effort:** 1 hour

**Risk:** Low

---

### Option 2: Add a prominent warning comment + README note

**Approach:** Keep the endpoint unauthenticated (prototype intent) but add a large warning comment in `auth.py` and README noting this must be secured before any production deployment.

**Pros:**
- Zero code changes
- Honest about prototype limitations

**Cons:**
- Does not change the security posture

**Effort:** 15 minutes

**Risk:** None (prototype only)

## Recommended Action

For a prototype, Option 2 is acceptable. Add the warning prominently. When moving toward production, implement Option 1. Also add authentication to `GET /api/restaurants/{profile_id}` for consistency.

## Technical Details

**Affected files:**
- `backend/app/routers/auth.py:11`
- `backend/app/routers/restaurants.py:11`
- `backend/database.db` — verify this is in `.gitignore`

## Resources

- **Security review finding:** auth.py unauthenticated endpoints

## Acceptance Criteria

- [x] Either auth added to `GET /api/users` OR prominent warning comment + README note added
- [ ] `database.db` confirmed in `.gitignore`
- [x] Decision documented

## Work Log

### 2026-03-12 — Discovery

**By:** Code Review (security-sentinel)

**Actions:**
- Identified unauthenticated user enumeration endpoint
- Confirmed impersonation chain (enumerate → login → set header)
- Found database.db gitignore gap

### 2026-03-12 — Resolution

**By:** pr-comment-resolver

**Decision:** Option 2 (prototype warning approach)

**Actions:**
- Added prominent warning comment above `list_users` in `backend/app/routers/auth.py` describing the unauthenticated exposure, the full impersonation chain, and the requirement to secure before production
- Added warning comment above `get_restaurant` in `backend/app/routers/restaurants.py` for consistency
- Added "Prototype Limitations / Security Notes" section to `README.md` documenting all three unauthenticated surfaces and pointing to todos/006 for remediation options
- Committed as: `docs: add security warnings to unauthenticated endpoints (todo 006)`
