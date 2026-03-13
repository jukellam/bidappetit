---
status: complete
priority: p3
issue_id: "018"
tags: [code-review, typescript, simplicity]
dependencies: []
---

# Extract Duplicated CITIES and EVENT_TYPES Constants to Shared File

## Problem Statement

`CITIES` and `EVENT_TYPES` arrays are defined identically in two frontend files. Adding a city or event type requires editing both files.

## Findings

- `frontend/src/pages/restaurant/BrowseEvents.tsx:6-7` — defines EVENT_TYPES and CITIES arrays
- `frontend/src/pages/planner/CreateEvent.tsx:6-7` — defines identical arrays (CITIES differs by empty-string sentinel)

## Proposed Solutions

### Option 1: Extract to frontend/src/constants.ts

**Approach:**
```typescript
export const EVENT_TYPES = ['corporate', 'wedding', 'birthday', 'cocktail', 'holiday', 'fundraiser', 'other']
export const CITIES = ['San Francisco', 'Chicago']
```

BrowseEvents adds `''` (All Cities) locally. CreateEvent imports CITIES directly.

**Effort:** 15 minutes

**Risk:** None

## Recommended Action

Option 1. Quick housekeeping.

## Technical Details

**Affected files:**
- New: `frontend/src/constants.ts`
- `frontend/src/pages/restaurant/BrowseEvents.tsx:6-7`
- `frontend/src/pages/planner/CreateEvent.tsx:6-7`

## Acceptance Criteria

- [x] Single CITIES and EVENT_TYPES definition
- [x] Both pages import from constants.ts
- [x] TypeScript compiles clean

## Work Log

### 2026-03-12 — Discovery

**By:** Code Review (code-simplicity-reviewer)

### 2026-03-12 — Implementation

**By:** Claude (pr-comment-resolver)

Created `frontend/src/constants.ts` with shared `EVENT_TYPES` and `CITIES` exports. Updated `BrowseEvents.tsx` to import from constants and use a local `cityOptions = ['', ...CITIES]` for the "All Cities" sentinel. Updated `CreateEvent.tsx` to import from constants and removed local array definitions from both files.
