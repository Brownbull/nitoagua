# Story 11-16: Consumer Cancellation (Production)

| Field | Value |
|-------|-------|
| **Story ID** | 11-16 |
| **Epic** | Epic 11 - Playwright Workflow Validation |
| **Title** | Consumer Cancellation (Production) |
| **Status** | drafted |
| **Points** | 2 |
| **Priority** | P1 - High |
| **Depends On** | Story 11-15 |

---

## User Story

**As a** platform owner,
**I want** to verify consumer cancellation works on production,
**So that** real consumers can cancel orders properly.

---

## Tasks

### Task 1: Run Production Tests

- [ ] 1.1 Seed cancellable requests in production
- [ ] 1.2 Run consumer-cancellation-workflow tests against production
- [ ] 1.3 Document failures

### Task 2: Fix or Backlog

- [ ] 2.1 Analyze each failure
- [ ] 2.2 Apply critical fixes
- [ ] 2.3 Backlog non-critical issues to Epic 11A

---

## Acceptance Criteria

### AC 11-16.1: Tests Pass on Production
- [ ] C8, C9, C10, C11 tests pass
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
| consumer-cancellation-workflow.spec.ts | TBD | TBD | TBD |

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-23 | Story created | SM |
