# Story 11-15: Consumer Cancellation (Local)

| Field | Value |
|-------|-------|
| **Story ID** | 11-15 |
| **Epic** | Epic 11 - Playwright Workflow Validation |
| **Title** | Consumer Cancellation (Local) |
| **Status** | drafted |
| **Points** | 3 |
| **Priority** | P1 - High |
| **Depends On** | Story 11-1 |

---

## User Story

**As a** consumer (Dona Maria),
**I want** to cancel my water request,
**So that** I can stop the order if I no longer need it.

---

## Workflows Covered

| ID | Workflow | Success Criteria |
|----|----------|------------------|
| C8 | Cancel Pending Request | Cancel before any offers received |
| C9 | Cancel With Offers | Cancel after offers submitted (providers notified) |
| C10 | Cancellation Confirmation | Consumer sees confirmation |
| C11 | Provider Notification | Provider notified their offer was cancelled |

---

## Tasks

### Task 1: Seed Data Preparation

- [ ] 1.1 Create pending request (cancellable)
- [ ] 1.2 Create request with offers (cancellable, will notify providers)
- [ ] 1.3 Create already cancelled request (for status display)

### Task 2: Write Playwright Tests

- [ ] 2.1 Create `tests/e2e/consumer-cancellation-workflow.spec.ts`
- [ ] 2.2 Test C8: Cancel button visible on pending request
- [ ] 2.3 Test C8: Can cancel pending request
- [ ] 2.4 Test C8: Status changes to "cancelled"
- [ ] 2.5 Test C9: Can cancel request with offers
- [ ] 2.6 Test C9: Confirmation dialog warns about offers
- [ ] 2.7 Test C10: Cancelled status page shows correct message
- [ ] 2.8 Test C11: Provider notification created on cancellation
- [ ] 2.9 Test: Cannot cancel already delivered request
- [ ] 2.10 Test: Cannot cancel already cancelled request

### Task 3: Run and Fix

- [ ] 3.1 Run tests locally
- [ ] 3.2 Document any failures
- [ ] 3.3 Fix issues or create Epic 11A stories
- [ ] 3.4 All tests passing locally

---

## Acceptance Criteria

### AC 11-15.1: C8 - Cancel Pending
- [ ] Cancel button visible on pending request
- [ ] Clicking cancel shows confirmation
- [ ] Request status updates to cancelled

### AC 11-15.2: C9 - Cancel With Offers
- [ ] Cancel button visible on request with offers
- [ ] Warning shown about existing offers
- [ ] All offers invalidated on cancel

### AC 11-15.3: C10 - Confirmation
- [ ] Cancelled page shows "Solicitud cancelada"
- [ ] Shows cancellation timestamp
- [ ] Shows option to create new request

### AC 11-15.4: C11 - Provider Notification
- [ ] Provider receives notification when their offer cancelled
- [ ] Notification shows reason (consumer cancelled)

---

## Definition of Done

- [ ] Seed data includes cancellable requests
- [ ] Playwright tests created for C8-C11 workflows
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
- `tests/e2e/consumer-cancellation-workflow.spec.ts`

**Modified Files:**
- _TBD_

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-23 | Story created | SM |
