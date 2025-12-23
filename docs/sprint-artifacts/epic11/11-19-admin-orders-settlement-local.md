# Story 11-19: Admin Orders & Settlement (Local)

| Field | Value |
|-------|-------|
| **Story ID** | 11-19 |
| **Epic** | Epic 11 - Playwright Workflow Validation |
| **Title** | Admin Orders & Settlement (Local) |
| **Status** | ready-for-dev |
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

- [ ] 1.1 Create orders in various states (pending, accepted, delivered, cancelled)
- [ ] 1.2 Create commission ledger entries
- [ ] 1.3 Create pending withdrawal requests
- [ ] 1.4 Create processed withdrawal (approved/rejected)

### Task 2: Write Playwright Tests

- [ ] 2.1 Create `tests/e2e/admin-orders-settlement-workflow.spec.ts`
- [ ] 2.2 Test A5: Orders page loads with order list
- [ ] 2.3 Test A5: Can filter orders by status
- [ ] 2.4 Test A5: Can search orders by customer name
- [ ] 2.5 Test A6: Clicking order shows full details
- [ ] 2.6 Test A6: Order shows timeline/history
- [ ] 2.7 Test A7: Settlement page shows pending requests
- [ ] 2.8 Test A7: Shows provider info and amount
- [ ] 2.9 Test A8: Can approve settlement request
- [ ] 2.10 Test A8: Provider notified on approval
- [ ] 2.11 Test A9: Can reject with reason
- [ ] 2.12 Test A9: Provider notified on rejection

### Task 3: Run and Fix

- [ ] 3.1 Run tests locally
- [ ] 3.2 Document any failures
- [ ] 3.3 Fix issues or create Epic 11A stories
- [ ] 3.4 All tests passing locally

---

## Acceptance Criteria

### AC 11-19.1: A5 - View Orders
- [ ] Orders dashboard loads with pagination
- [ ] Status filters work (pending, accepted, delivered, cancelled)
- [ ] Search by customer works
- [ ] Shows order count by status

### AC 11-19.2: A6 - Order Details
- [ ] Order detail page shows all info
- [ ] Shows customer info, provider info, timeline
- [ ] Shows commission amount

### AC 11-19.3: A7 - Settlement Queue
- [ ] Settlement page shows pending requests
- [ ] Shows provider name, amount, date requested
- [ ] Can sort by date or amount

### AC 11-19.4: A8 - Approve Settlement
- [ ] Approve button works
- [ ] Creates settlement record
- [ ] Provider notification created

### AC 11-19.5: A9 - Reject Settlement
- [ ] Reject requires reason
- [ ] Provider notified with reason
- [ ] Can resubmit after rejection

---

## Definition of Done

- [ ] Seed data includes orders and settlements
- [ ] Playwright tests created for A5-A9 workflows
- [ ] All tests passing locally
- [ ] Story status updated to `review`

---

## Dev Agent Record

### Implementation Plan
_To be filled during implementation_

### Debug Log
_To be filled during implementation_

### File List
**New Files:**
- `tests/e2e/admin-orders-settlement-workflow.spec.ts`

**Modified Files:**
- _TBD_

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-23 | Story created | SM |
