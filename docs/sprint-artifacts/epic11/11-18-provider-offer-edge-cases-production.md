# Story 11-18: Provider Offer Edge Cases (Production)

| Field | Value |
|-------|-------|
| **Story ID** | 11-18 |
| **Epic** | Epic 11 - Playwright Workflow Validation |
| **Title** | Provider Offer Edge Cases (Production) |
| **Status** | drafted |
| **Points** | 2 |
| **Priority** | P1 - High |
| **Depends On** | Story 11-17 |

---

## User Story

**As a** platform owner,
**I want** to verify provider offer edge cases work on production,
**So that** real providers have proper offer handling.

---

## Tasks

### Task 1: Run Production Tests

- [ ] 1.1 Seed various offer states in production
- [ ] 1.2 Run provider-offer-edge-cases tests against production
- [ ] 1.3 Document failures

### Task 2: Fix or Backlog

- [ ] 2.1 Analyze each failure
- [ ] 2.2 Apply critical fixes
- [ ] 2.3 Backlog non-critical issues to Epic 11A

---

## Acceptance Criteria

### AC 11-18.1: Tests Pass on Production
- [ ] P13, P14, P15, P16 tests pass
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
| provider-offer-edge-cases.spec.ts | TBD | TBD | TBD |

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-23 | Story created | SM |
