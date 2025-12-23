# Story 11-17: Provider Offer Edge Cases (Local)

| Field | Value |
|-------|-------|
| **Story ID** | 11-17 |
| **Epic** | Epic 11 - Playwright Workflow Validation |
| **Title** | Provider Offer Edge Cases (Local) |
| **Status** | ready-for-dev |
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

- [ ] 1.1 Create offer about to expire (short countdown)
- [ ] 1.2 Create active offer (for withdrawal test)
- [ ] 1.3 Create request with multiple offers (for competition test)
- [ ] 1.4 Create expired offer (already timed out)

### Task 2: Write Playwright Tests

- [ ] 2.1 Create `tests/e2e/provider-offer-edge-cases.spec.ts`
- [ ] 2.2 Test P13: Expired offer shows "Expirada" status
- [ ] 2.3 Test P13: Cannot interact with expired offer
- [ ] 2.4 Test P14: Withdraw button visible on active offer
- [ ] 2.5 Test P14: Can withdraw offer before acceptance
- [ ] 2.6 Test P14: Withdrawn offer shows in history
- [ ] 2.7 Test P15: Offer shows "Cancelada por cliente" when consumer cancels
- [ ] 2.8 Test P16: Offer shows "No seleccionada" when another wins
- [ ] 2.9 Test: Provider notification on offer status change

### Task 3: Run and Fix

- [ ] 3.1 Run tests locally
- [ ] 3.2 Document any failures
- [ ] 3.3 Fix issues or create Epic 11A stories
- [ ] 3.4 All tests passing locally

---

## Acceptance Criteria

### AC 11-17.1: P13 - Offer Expiration
- [ ] Expired offers show correct status
- [ ] Countdown shows "Expirada" when zero
- [ ] Cannot submit new offer to expired request

### AC 11-17.2: P14 - Withdraw Offer
- [ ] Withdraw button visible on pending offers
- [ ] Confirmation dialog before withdrawal
- [ ] Offer status updates to withdrawn

### AC 11-17.3: P15 - Consumer Cancellation Impact
- [ ] Provider's offer invalidated when consumer cancels
- [ ] Provider notified of cancellation
- [ ] Offer history shows reason

### AC 11-17.4: P16 - Competitor Wins
- [ ] When another offer accepted, this one marked as rejected
- [ ] Provider sees "No seleccionada" status
- [ ] Notification sent to losing providers

---

## Definition of Done

- [ ] Seed data includes various offer states
- [ ] Playwright tests created for P13-P16 workflows
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
- `tests/e2e/provider-offer-edge-cases.spec.ts`

**Modified Files:**
- _TBD_

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-23 | Story created | SM |
