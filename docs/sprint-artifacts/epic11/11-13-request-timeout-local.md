# Story 11-13: Request Timeout Flow (Local)

| Field | Value |
|-------|-------|
| **Story ID** | 11-13 |
| **Epic** | Epic 11 - Playwright Workflow Validation |
| **Title** | Request Timeout Flow (Local) |
| **Status** | ready-for-dev |
| **Points** | 3 |
| **Priority** | P1 - High |
| **Depends On** | Story 11-1 |

---

## User Story

**As a** consumer (Dona Maria),
**I want** to be notified when my request times out with no offers,
**So that** I know to try again or contact support.

---

## Workflows Covered

| ID | Workflow | Success Criteria |
|----|----------|------------------|
| C5 | Request Timeout | Request expires after 24h with no offers |
| C6 | Timeout Notification | Consumer receives email/notification |
| C7 | Retry Request | Consumer can submit new request |

---

## Tasks

### Task 1: Seed Data Preparation

- [ ] 1.1 Create request in `no_offers` status (already exists)
- [ ] 1.2 Verify timeout cron job logic exists
- [ ] 1.3 Create request about to timeout (edge case)

### Task 2: Write Playwright Tests

- [ ] 2.1 Create `tests/e2e/request-timeout-workflow.spec.ts`
- [ ] 2.2 Test C5: Timed out request shows correct status
- [ ] 2.3 Test C5: Status page shows timeout message in Spanish
- [ ] 2.4 Test C6: Notification exists for timeout (check notifications table)
- [ ] 2.5 Test C7: "Try Again" button visible on timeout page
- [ ] 2.6 Test C7: Clicking retry navigates to request form
- [ ] 2.7 Test: Consumer history shows timed out request

### Task 3: Run and Fix

- [ ] 3.1 Run tests locally
- [ ] 3.2 Document any failures
- [ ] 3.3 Fix issues or create Epic 11A stories
- [ ] 3.4 All tests passing locally

---

## Acceptance Criteria

### AC 11-13.1: C5 - Timeout Status
- [ ] Request with `no_offers` status shows timeout message
- [ ] Message is in Spanish ("No recibimos ofertas")
- [ ] Timeline shows appropriate state

### AC 11-13.2: C6 - Timeout Notification
- [ ] Consumer receives notification on timeout
- [ ] Email sent (or notification created in DB)
- [ ] Notification contains helpful next steps

### AC 11-13.3: C7 - Retry Flow
- [ ] "Intentar de nuevo" button visible
- [ ] Button navigates to request form
- [ ] Previous address pre-filled (if registered user)

---

## Definition of Done

- [ ] Seed data includes timed out request
- [ ] Playwright tests created for C5-C7 workflows
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
- `tests/e2e/request-timeout-workflow.spec.ts`

**Modified Files:**
- _TBD_

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-23 | Story created | SM |
