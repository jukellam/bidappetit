---
status: complete
priority: p1
issue_id: "005"
tags: [code-review, typescript, error-handling, react]
dependencies: []
---

# Add Error Handling to Fetch Calls That Currently Swallow Errors Silently

## Problem Statement

Multiple frontend components fetch data or perform mutations with no `.catch()` handler. When these fail, `loading` resets to `false`, the UI shows incorrect states (e.g., "Event not found" instead of "Network error"), and mutations like cancellation give no feedback on failure.

## Findings

- `frontend/src/pages/restaurant/EventDetail.tsx:12` — `.then(setEvent).finally(...)` with no `.catch()` — failure shows "Event not found" instead of an error message
- `frontend/src/pages/planner/MyBookings.tsx:10-11` — `fetchBookings` has no `.catch()`; `handleCancel` at line 17 also has no try/catch — cancel failure is invisible to user
- `frontend/src/pages/restaurant/Dashboard.tsx:13-19` — `Promise.all(...).then(...)` has no `.catch()`
- `frontend/src/pages/LoginPage.tsx:13` — `api.get<User[]>('/api/users')` has no `.catch()`; `handleSelect` at line 17 has no try/catch
- Pattern is inconsistent: `PlannerEventDetail`, `CreateEvent`, `SubmitBid` all handle errors correctly with `catch (e: unknown)` pattern

## Proposed Solutions

### Option 1: Apply the existing error pattern consistently

**Approach:** For each affected component, add `setError()` state if not present, and apply the pattern already used in the codebase:

```typescript
.catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load'))
.finally(() => setLoading(false))
```

For mutation handlers (`handleCancel` etc.), wrap in try/catch:
```typescript
try {
  await api.patch(...)
} catch (e: unknown) {
  setError(e instanceof Error ? e.message : 'Failed to cancel')
}
```

**Pros:**
- Consistent with existing error pattern in the codebase
- Minimal changes

**Cons:**
- None

**Effort:** 1 hour

**Risk:** None

## Recommended Action

Option 1. Apply across all 4 affected files. Each fix is a one-line addition.

## Technical Details

**Affected files:**
- `frontend/src/pages/restaurant/EventDetail.tsx:12`
- `frontend/src/pages/planner/MyBookings.tsx:10-11, 17`
- `frontend/src/pages/restaurant/Dashboard.tsx:13`
- `frontend/src/pages/LoginPage.tsx:13, 17`

## Acceptance Criteria

- [x] Every `api.get()` / `api.post()` / `api.patch()` call has error handling
- [x] Failed fetches show an error message, not incorrect empty state
- [x] Failed mutations (cancel) show an error message
- [x] TypeScript compiles clean

## Work Log

### 2026-03-12 — Discovery

**By:** Code Review (typescript-reviewer)

**Actions:**
- Identified 4 files with missing error handlers
- Confirmed correct pattern exists in PlannerEventDetail, CreateEvent, SubmitBid

### 2026-03-12 — Implementation

**By:** Claude (pr-comment-resolver)

**Actions:**
- Added `const [error, setError] = useState<string | null>(null)` to all 4 components
- Added `.catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load'))` to fetch chains in EventDetail, MyBookings, Dashboard, and LoginPage
- Wrapped `handleCancel` in MyBookings with try/catch surfacing errors via `setError`
- Wrapped `handleSelect` in LoginPage with try/catch surfacing errors via `setError`
- Added `if (error) return <div className="error-message">{error}</div>` guards in all 4 components
- Committed as: `fix: add error handling to fetch calls missing catch handlers (todo 005)`
