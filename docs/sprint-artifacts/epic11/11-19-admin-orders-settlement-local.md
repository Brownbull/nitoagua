# Story 11-19: Admin Orders & Settlement (Local)

| Field | Value |
|-------|-------|
| **Story ID** | 11-19 |
| **Epic** | Epic 11 - Playwright Workflow Validation |
| **Title** | Admin Orders & Settlement (Local) |
| **Status** | done |
| **Points** | 3 |
| **Priority** | P1 - High |
| **Depends On** | Story 11-7 |

---

## User Story

**As an** admin,
**I want** to view all orders and manage provider settlements,
**So that** I can monitor platform activity and pay providers.

---

## Workflows Covered

| ID | Workflow | Success Criteria |
|----|----------|------------------|
| A5 | View All Orders | See orders dashboard with filters |
| A6 | Order Details | View full order information |
| A7 | Settlement Queue | See pending settlement requests |
| A8 | Approve Settlement | Process provider payout |
| A9 | Reject Settlement | Reject with reason |

---

## Tasks

### Task 1: Seed Data Preparation

- [x] 1.1 Create orders in various states (pending, accepted, delivered, cancelled)
- [x] 1.2 Create commission ledger entries
- [x] 1.3 Create pending withdrawal requests
- [x] 1.4 Create processed withdrawal (approved/rejected)

### Task 2: Write Playwright Tests

- [x] 2.1 Create `tests/e2e/admin-orders-seeded.spec.ts`
- [x] 2.2 Test A5: Orders page loads with order list
- [x] 2.3 Test A5: Can filter orders by status
- [x] 2.4 Test A5: Can search orders by customer name
- [x] 2.5 Test A6: Clicking order shows full details
- [x] 2.6 Test A6: Order shows timeline/history
- [x] 2.7 Test A7: Settlement page shows pending requests
- [x] 2.8 Test A7: Shows provider info and amount
- [x] 2.9 Test A8: Can approve settlement request (modal tests)
- [x] 2.10 Test A8: Bank reference optional for verification
- [x] 2.11 Test A9: Can reject with reason
- [x] 2.12 Test A9: Custom reason input for "otro"

### Task 3: Run and Fix

- [x] 3.1 Run tests locally
- [x] 3.2 Document any failures
- [x] 3.3 Fix issues (locator fixes for strict mode violations)
- [x] 3.4 All tests passing locally (22/22)

---

## Acceptance Criteria

### AC 11-19.1: A5 - View Orders
- [x] Orders dashboard loads with pagination
- [x] Status filters work (pending, accepted, delivered, cancelled)
- [x] Search by customer works
- [x] Shows order count by status

### AC 11-19.2: A6 - Order Details
- [x] Order detail page shows all info
- [x] Shows customer info, provider info, timeline
- [x] Shows commission amount

### AC 11-19.3: A7 - Settlement Queue
- [x] Settlement page shows pending requests
- [x] Shows provider name, amount, date requested
- [x] Can sort by date or amount

### AC 11-19.4: A8 - Approve Settlement
- [x] Approve button works (verify modal opens)
- [x] Bank reference input optional
- [x] Modal can be cancelled

### AC 11-19.5: A9 - Reject Settlement
- [x] Reject requires reason (button disabled without)
- [x] Custom reason input for "otro" option
- [x] Modal can be cancelled

---

## Definition of Done

- [x] Seed data includes orders and settlements
- [x] Playwright tests created for A5-A9 workflows
- [x] All tests passing locally (22/22)
- [x] Story status updated to `review`

---

## Dev Agent Record

### Implementation Plan
1. Created seed script `scripts/local/seed-admin-orders-tests.ts` for test data
2. Added npm scripts for seeding (`npm run seed:admin-orders`)
3. Created comprehensive Playwright test file `tests/e2e/admin-orders-seeded.spec.ts`
4. Tests cover all A5-A9 workflows with 22 test cases

### Debug Log
- Fixed status constraint error: DB only allows 'pending', 'accepted', 'delivered', 'cancelled', 'no_offers'
- Fixed special_instructions NOT NULL constraint by providing default values
- Fixed locator strict mode violations by using more specific selectors (e.g., `getByRole("heading")`)

### File List
**New Files:**
- `scripts/local/seed-admin-orders-tests.ts` - Seed script for admin orders test data
- `tests/e2e/admin-orders-seeded.spec.ts` - Playwright tests for A5-A9 workflows

**Modified Files:**
- `package.json` - Added `seed:admin-orders` and `seed:admin-orders:clean` scripts

### Test Results
```
Running 22 tests using 1 worker
  22 passed (1.3m)
```

**Test Breakdown:**
- A5: Admin Orders Dashboard (5 tests)
- A6: Order Detail View (4 tests)
- A7: Settlement Queue (4 tests)
- A8: Approve Settlement (3 tests)
- A9: Reject Settlement (4 tests)
- Settlement UI Features (2 tests)

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-23 | Story created | SM |
| 2025-12-24 | Implementation complete, 22/22 tests passing | Dev Agent |
| 2025-12-24 | Atlas code review passed - 5 issues fixed | Code Review |

---

## Code Review Notes (Atlas-Enhanced)

### Issues Found and Fixed

| Severity | Issue | Fix Applied |
|----------|-------|-------------|
| HIGH | Missing `export const dynamic = "force-dynamic"` on admin pages (Atlas Section 4 violation) | Added to orders/page.tsx, orders/[id]/page.tsx, settlement/page.tsx |
| HIGH | Missing `assertNoErrorState` after page navigations (Atlas Section 5 violation) | Added 22 assertions throughout test file |
| MEDIUM | Arbitrary `waitForTimeout(500)` in test A5.4 | Replaced with element-based wait pattern |
| LOW | Unused `SEEDED_WITHDRAWAL` constant | Removed from test file |
| LOW | Import path wrong for assertNoErrorState | Fixed to use `../fixtures/error-detection` |

### Files Modified in Code Review
- `src/app/admin/orders/page.tsx` - Added force-dynamic
- `src/app/admin/orders/[id]/page.tsx` - Added force-dynamic
- `src/app/admin/settlement/page.tsx` - Added force-dynamic
- `tests/e2e/admin-orders-seeded.spec.ts` - Fixed import, added assertNoErrorState, removed waitForTimeout
