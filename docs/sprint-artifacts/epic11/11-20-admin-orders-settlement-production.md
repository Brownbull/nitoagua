# Story 11-20: Admin Orders & Settlement (Production)

| Field | Value |
|-------|-------|
| **Story ID** | 11-20 |
| **Epic** | Epic 11 - Playwright Workflow Validation |
| **Title** | Admin Orders & Settlement (Production) |
| **Status** | drafted |
| **Points** | 2 |
| **Priority** | P1 - High |
| **Depends On** | Story 11-19 |

---

## User Story

**As a** platform owner,
**I want** to verify admin orders and settlement works on production,
**So that** real admin operations work correctly.

---

## Tasks

### Task 1: Run Production Tests

- [ ] 1.1 Verify production has orders and settlement data
- [ ] 1.2 Run admin-orders-settlement-workflow tests against production
- [ ] 1.3 Document failures

### Task 2: Fix or Backlog

- [ ] 2.1 Analyze each failure
- [ ] 2.2 Apply critical fixes
- [ ] 2.3 Backlog non-critical issues to Epic 11A

---

## Acceptance Criteria

### AC 11-20.1: Tests Pass on Production
- [ ] A5, A6, A7, A8, A9 tests pass
- [ ] Or: Failures documented and actioned

---

## Definition of Done

- [ ] Tests run against production
- [ ] Issues documented and actioned
- [ ] Story status updated to `review`

---

## Dev Agent Record

### Test Results
**Production Test Run (TBD):**

| Test File | Tests | Passed | Failed |
|-----------|-------|--------|--------|
| admin-orders-settlement-workflow.spec.ts | TBD | TBD | TBD |

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-23 | Story created | SM |
