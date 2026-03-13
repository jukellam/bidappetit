---
status: pending
priority: p1
issue_id: "004"
tags: [code-review, architecture, react, typescript]
dependencies: []
---

# Replace Dual Auth State With React Context

## Problem Statement

User identity is stored in two separate places: a module-level `let currentUser` in `api/client.ts` and React `useState` in `App.tsx`. React cannot track the module variable, so components reading `getCurrentUser()!` (both dashboards) get stale values on any auth state change without a re-render. The `!` non-null assertion is required precisely because TypeScript can't prove it's set.

## Findings

- `frontend/src/api/client.ts:3` — `let currentUser: User | null = null` (module variable)
- `frontend/src/App.tsx:18-28` — separate React `useState<User | null>(null)`
- `frontend/src/pages/planner/Dashboard.tsx:10` — `const user = getCurrentUser()!`
- `frontend/src/pages/restaurant/Dashboard.tsx:10` — same pattern
- Sync maintained only by discipline of calling both `setUser` + `setCurrentUser` in `handleLogin`/`handleLogout` — will break with any new logout path (e.g., 401 auto-logout)
- Polling effect dependency `[event?.status, fetchEvent]` at `EventDetail.tsx:28` resets interval timer on every successful poll because state update triggers re-evaluation

## Proposed Solutions

### Option 1: React Context (AuthContext)

**Approach:** Create `frontend/src/context/AuthContext.tsx` with a `UserContext` providing `user`, `login`, `logout`. The API client reads the user ID from context on each request rather than from a module variable. Components consume `useAuth()` hook.

**Pros:**
- Single source of truth, React tracks changes automatically
- Eliminates all `getCurrentUser()!` non-null assertions
- Fixes the polling interval reset bug as a side effect
- Standard React pattern

**Cons:**
- Requires threading context through the app
- Moderate refactor (all pages + client.ts)

**Effort:** 2-3 hours

**Risk:** Low

---

### Option 2: Delete module variable, pass user as prop

**Approach:** Remove `client.ts` module variable entirely. Pass `user` prop from `App.tsx` down to `Layout`, which passes to each page. `api/client.ts` accepts `userId` as an argument to `request()`.

**Pros:**
- No context boilerplate
- Explicit data flow

**Cons:**
- Prop drilling through Layout → every page
- `api` object can no longer be imported without plumbing the user through

**Effort:** 2-3 hours

**Risk:** Low

## Recommended Action

Option 1 (AuthContext). It's the idiomatic React solution and scales to additional auth-aware components. Start by creating `AuthContext.tsx`, wrapping `App` in the provider, updating both dashboards to `useAuth()`, and removing the module variable from `client.ts`.

## Technical Details

**Affected files:**
- `frontend/src/api/client.ts` — remove module variable, accept user from context or parameter
- `frontend/src/App.tsx` — wrap in AuthProvider
- `frontend/src/pages/planner/Dashboard.tsx:10`
- `frontend/src/pages/restaurant/Dashboard.tsx:10`
- New file: `frontend/src/context/AuthContext.tsx`

## Acceptance Criteria

- [ ] No `getCurrentUser()` or `setCurrentUser()` calls anywhere except inside AuthContext
- [ ] Both dashboards re-render correctly when user changes
- [ ] Logout clears auth state in one place
- [ ] TypeScript compiles clean with `npx tsc --noEmit`

## Work Log

### 2026-03-12 — Discovery

**By:** Code Review (typescript-reviewer + architecture-strategist)

**Actions:**
- Identified dual state pattern
- Confirmed non-null assertion risk in both dashboards
- Found polling interval reset as secondary consequence
