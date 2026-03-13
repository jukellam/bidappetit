---
status: complete
priority: p2
issue_id: "014"
tags: [code-review, typescript, react, simplicity]
dependencies: []
---

# Extract renderBidCard/renderBidFull as Proper React Components

## Problem Statement

`renderBidCard` and `renderBidFull` are plain functions defined inside the `PlannerEventDetail` component body that return JSX. They're recreated on every render, defeat React reconciliation, can't be memoized, and `renderBidFull` closes over `setAcceptingId` in a hidden dependency. They share ~80% of markup and could be a single `BidCard` component.

## Findings

- `frontend/src/pages/planner/EventDetail.tsx:145-186` — two inner render functions
- `renderBidFull` closes over `setAcceptingId` at line 181 — untestable in isolation
- Both functions share outer div, header, badge, price, bid-card-body structure
- Only differences: (a) renderBidFull shows `restaurant_cuisine`, (b) renderBidFull omits `<strong>Proposal:</strong>` label, (c) renderBidFull has Accept button

## Proposed Solutions

### Option 1: Single BidCard component with variant prop

**Approach:** Create `frontend/src/components/BidCard.tsx`:
```tsx
interface Props {
  bid: Bid
  compact?: boolean
  onAccept?: (bidId: number) => void
}
export function BidCard({ bid, compact = false, onAccept }: Props) { ... }
```

**Pros:**
- Single component, no duplication
- Proper React reconciliation
- Testable in isolation

**Cons:**
- Slightly more props/complexity vs inline

**Effort:** 1-2 hours

**Risk:** Low

---

### Option 2: Two separate components (BidCardCompact, BidCardFull)

**Approach:** Two separate files for the compact (compare mode) and full views.

**Pros:**
- No conditional logic inside component

**Cons:**
- Still some duplication

**Effort:** 1-2 hours

**Risk:** Low

## Recommended Action

Option 1. The overlap is significant enough to justify a single component with an `onAccept` optional callback and `compact` boolean.

## Technical Details

**Affected files:**
- `frontend/src/pages/planner/EventDetail.tsx:145-186` — remove inner functions
- New file: `frontend/src/components/BidCard.tsx`

## Acceptance Criteria

- [x] No render functions defined inside component bodies
- [x] BidCard component renders correctly in both compact and full modes
- [x] Accept button only appears when `onAccept` prop is provided
- [x] TypeScript compiles clean

## Work Log

### 2026-03-12 — Discovery

**By:** Code Review (typescript-reviewer + code-simplicity-reviewer)

### 2026-03-12 — Implementation

**By:** pr-comment-resolver

Created `frontend/src/components/BidCard.tsx` with a single `BidCard` component accepting `bid`, `compact`, and `onAccept` props. The `compact` flag controls whether `restaurant_cuisine` and the "Proposal:" label are shown. `onAccept` controls whether the Accept button renders. Removed `renderBidCard` and `renderBidFull` inner functions from `EventDetail.tsx` and replaced call sites with `<BidCard>` JSX. TypeScript compiles clean with `npx tsc --noEmit`.
