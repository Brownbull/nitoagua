# Story 11-11: Provider Earnings (Local)

| Field | Value |
|-------|-------|
| **Story ID** | 11-11 |
| **Epic** | Epic 11 - Playwright Workflow Validation |
| **Title** | Provider Earnings (Local) |
| **Status** | ready-for-dev |
| **Points** | 3 |
| **Priority** | P1 - High |
| **Depends On** | Story 11-1 |

---

## User Story

**As a** provider (Don Pedro),
**I want** to view my earnings and request settlement,
**So that** I can track my income and get paid.

---

## Workflows Covered

| ID | Workflow | Success Criteria |
|----|----------|------------------|
| P11 | View Earnings Dashboard | See earnings summary, completed deliveries |
| P12 | Request Settlement | Request payout of accumulated earnings |

---

## Tasks

### Task 1: Seed Data Preparation

- [ ] 1.1 Verify provider user exists with completed deliveries
- [ ] 1.2 Verify commission ledger has entries
- [ ] 1.3 Create various earning states:
  - Pending settlement (unsettled commissions)
  - In settlement (withdrawal requested)
  - Settled (paid out)

### Task 2: Write Playwright Tests

- [ ] 2.1 Create `tests/e2e/provider-earnings-workflow.spec.ts`
- [ ] 2.2 Test P11: Earnings page shows total earnings
- [ ] 2.3 Test P11: Earnings breakdown by period (weekly/monthly)
- [ ] 2.4 Test P11: Completed deliveries list shows details
- [ ] 2.5 Test P11: Commission calculations are correct
- [ ] 2.6 Test P12: Settlement request button visible when balance > 0
- [ ] 2.7 Test P12: Can submit settlement request
- [ ] 2.8 Test P12: Settlement history shows past requests

### Task 3: Run and Fix

- [ ] 3.1 Run tests locally with `npm run seed:earnings`
- [ ] 3.2 Document any failures
- [ ] 3.3 Fix issues or create Epic 11A stories
- [ ] 3.4 All tests passing locally

---

## Acceptance Criteria

### AC 11-11.1: P11 - View Earnings
- [ ] Earnings page loads with summary card
- [ ] Total earnings, pending, settled amounts shown
- [ ] Delivery history displays correctly
- [ ] Commission percentage shown correctly (10% default)

### AC 11-11.2: P12 - Request Settlement
- [ ] Settlement button visible when balance > $0
- [ ] Settlement request creates withdrawal record
- [ ] Provider sees confirmation
- [ ] Status updates to "pending_admin_approval"

---

## Definition of Done

- [ ] Seed data includes commission ledger entries
- [ ] Playwright tests created for P11-P12 workflows
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
- `tests/e2e/provider-earnings-workflow.spec.ts`

**Modified Files:**
- _TBD_

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-23 | Story created | SM |
