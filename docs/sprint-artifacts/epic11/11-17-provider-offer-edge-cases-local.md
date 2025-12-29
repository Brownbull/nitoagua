# Story 11-17: Provider Offer Edge Cases (Local)

| Field | Value |
|-------|-------|
| **Story ID** | 11-17 |
| **Epic** | Epic 11 - Playwright Workflow Validation |
| **Title** | Provider Offer Edge Cases (Local) |
| **Status** | done |
| **Points** | 3 |
| **Priority** | P1 - High |
| **Depends On** | Story 11-1 |

---

## User Story

**As a** provider (Don Pedro),
**I want** to handle offer edge cases properly,
**So that** I understand what happens when offers expire or get cancelled.

---

## Workflows Covered

| ID | Workflow | Success Criteria |
|----|----------|------------------|
| P13 | Offer Expires | Offer countdown reaches zero |
| P14 | Withdraw Offer | Provider cancels their own offer |
| P15 | Consumer Cancels | Provider's offer invalidated by consumer |
| P16 | Another Offer Accepted | Provider's offer rejected when competitor wins |

---

## Tasks

### Task 1: Seed Data Preparation

- [x] 1.1 Create offer about to expire (short countdown) - `88888888-8888-8888-8888-888888888886`
- [x] 1.2 Create active offer (for withdrawal test) - already existed
- [x] 1.3 Create request with multiple offers (for competition test) - `77777777-7777-7777-7777-777777777776`
- [x] 1.4 Create expired offer (already timed out) - `88888888-8888-8888-8888-888888888885`
- [x] 1.5 Create request cancelled by consumer with offer - `77777777-7777-7777-7777-777777777775`
- [x] 1.6 Create request_filled offer (competitor wins) - `88888888-8888-8888-8888-888888888888`

### Task 2: Write Playwright Tests

- [x] 2.1 Create `tests/e2e/provider-offer-edge-cases.spec.ts`
- [x] 2.2 Test P13: Expired offer shows "Expirada" status
- [x] 2.3 Test P13: Cannot interact with expired offer (no cancel button)
- [x] 2.4 Test P14: Withdrawn offers show 'Cancelada' status in history
- [x] 2.5 Test P15: Offer shows "Cancelada" when consumer cancels request
- [x] 2.6 Test P15: Consumer-cancelled offer appears in history section
- [x] 2.7 Test P16: Offer shows "No seleccionada" when competitor wins
- [x] 2.8 Test P16: Cannot interact with request_filled offer

### Task 3: Run and Fix

- [x] 3.1 Run tests locally
- [x] 3.2 All 12 tests passing locally
- [x] 3.3 No issues requiring Epic 11A stories

---

## Acceptance Criteria

### AC 11-17.1: P13 - Offer Expiration
- [x] Expired offers show correct status ("Expirada")
- [x] Expired offers appear in history section
- [x] Cannot cancel expired offers

### AC 11-17.2: P14 - Withdraw Offer
- [x] Withdrawn offers show "Cancelada" status
- [x] Withdrawn offers appear in history section
- Note: Full P14 tests in `provider-withdraw-offer.spec.ts`

### AC 11-17.3: P15 - Consumer Cancellation Impact
- [x] Provider's offer shows "Cancelada" when consumer cancels
- [x] Consumer-cancelled offers appear in history section
- Note: Consumer notification tested in `consumer-cancellation-workflow.spec.ts`

### AC 11-17.4: P16 - Competitor Wins
- [x] When another offer accepted, provider sees "No seleccionada" status
- [x] Request_filled offers appear in history section
- [x] Cannot cancel request_filled offers

---

## Definition of Done

- [x] Seed data includes various offer states
- [x] Playwright tests created for P13-P16 workflows
- [x] All 12 tests passing locally
- [x] Story status updated to `review`

---

## Dev Agent Record

### Implementation Plan

1. Extended `scripts/local/seed-offer-tests.ts` with new edge case data:
   - P15: Consumer-cancelled request with provider offer
   - P16: Request where competitor won (request_filled status)
   - P13: Offer about to expire (2 min countdown)
2. Created comprehensive test file with 12 tests covering all edge cases
3. Used existing patterns from `provider-withdraw-offer.spec.ts` and `provider-active-offers.spec.ts`

### Debug Log

- Initial test run failed due to `waitForLoadState("networkidle")` timeout - realtime connections prevent network idle
- Fixed by waiting for specific elements per Atlas 05-testing.md patterns
- One test failed due to incorrect section header text ("Aceptadas" vs "Entregas Activas")
- Fixed to match actual Spanish labels in the UI
- Code review: Replaced `.catch(() => false)` patterns with `.count()` checks per Atlas testing standards

### File List
**New Files:**
- `tests/e2e/provider-offer-edge-cases.spec.ts` - 12 tests for P13-P16 workflows

**Modified Files:**
- `scripts/local/seed-offer-tests.ts` - Added edge case seed data

### Test Results

```
Running 12 tests using 1 worker

  ✓ P13.1: Expired offers show 'Expirada' status badge
  ✓ P13.2: Expired offers appear in history section
  ✓ P13.3: Expired offers cannot be cancelled
  ✓ P14.1: Withdrawn offers show 'Cancelada' status in history
  ✓ P15.1: Offer shows 'Cancelada' when consumer cancels request
  ✓ P15.2: Consumer-cancelled offer appears in history section
  ✓ P16.1: Offer shows 'No seleccionada' when competitor wins
  ✓ P16.2: 'No seleccionada' offers appear in history section
  ✓ P16.3: 'No seleccionada' offer cannot be cancelled
  ✓ History section groups all non-active statuses
  ✓ Active offers show countdown timer
  ✓ All offer status labels are in Spanish

  12 passed (1.0m)
```

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-23 | Story created | SM |
| 2025-12-24 | Implementation complete, 12/12 tests passing | Dev Agent |
