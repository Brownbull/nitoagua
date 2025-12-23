# Story 11-13: Request Timeout Flow (Local)

| Field | Value |
|-------|-------|
| **Story ID** | 11-13 |
| **Epic** | Epic 11 - Playwright Workflow Validation |
| **Title** | Request Timeout Flow (Local) |
| **Status** | done |
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

- [x] 1.1 Create request in `no_offers` status (already exists)
- [x] 1.2 Verify timeout cron job logic exists
- [x] 1.3 Create registered consumer `no_offers` request (for C6/C7 tests)

### Task 2: Write Playwright Tests

- [x] 2.1 Create `tests/e2e/request-timeout-workflow.spec.ts`
- [x] 2.2 Test C5: Timed out request shows correct status (C5.1)
- [x] 2.3 Test C5: Status page shows timeout message in Spanish (C5.2)
- [x] 2.4 Test C5: Timeline shows appropriate state (C5.3)
- [x] 2.5 Test C6: Notification contains helpful next steps (C6.2)
- [x] 2.6 Test C7: "Nueva Solicitud" button visible on timeout page (C7.1)
- [x] 2.7 Test C7: Clicking retry navigates to request form (C7.2)
- [x] 2.8 Integration: Full timeout flow end-to-end

### Task 3: Run and Fix

- [x] 3.1 Run tests locally
- [x] 3.2 Fixed strict mode selector violations (getByText matching multiple elements)
- [x] 3.3 Fixed URL pattern matching for home page navigation
- [x] 3.4 All tests passing locally: 7 passed, 2 skipped (expected)

---

## Acceptance Criteria

### AC 11-13.1: C5 - Timeout Status
- [x] Request with `no_offers` status shows timeout message (C5.1)
- [x] Message is in Spanish ("Lo sentimos..." / "No recibimos ofertas") (C5.2)
- [x] Timeline shows appropriate state (step 1 completed, steps 2-4 pending) (C5.3)

### AC 11-13.2: C6 - Timeout Notification
- [x] Consumer receives notification on timeout (cron job tested in request-timeout.spec.ts)
- [x] Email sent via Resend (existing cron job implementation)
- [x] Notification contains helpful next steps (C6.2)

### AC 11-13.3: C7 - Retry Flow
- [x] "Nueva Solicitud" button visible (C7.1)
- [x] Button navigates to request form / home page (C7.2)
- [~] Previous address pre-filled (if registered user) - skipped when dev login unavailable

---

## Definition of Done

- [x] Seed data includes timed out request (guest + consumer)
- [x] Playwright tests created for C5-C7 workflows (9 tests)
- [x] All tests passing locally (7 passed, 2 skipped as expected)
- [x] Story status updated to `review`

---

## Dev Agent Record

### Implementation Plan
1. Verified existing `no_offers` seed data in `scripts/local/seed-test-data.ts`
2. Added `SEEDED_CONSUMER_NO_OFFERS_REQUEST` for registered consumer tests
3. Created `request-timeout-workflow.spec.ts` with 9 tests covering C5-C7
4. Fixed strict mode selector violations and URL pattern matching

### Debug Log
- Initial run: 3 failed due to `getByText("Sin Ofertas")` matching 4 elements
- Fixed by using `.first()` selector
- Second run: Integration test failed due to URL regex not matching `http://localhost:3005/`
- Fixed by updating regex to properly match trailing slash
- Final run: 7 passed, 2 skipped (consumer login tests skip when dev login unavailable)

### File List
**New Files:**
- `tests/e2e/request-timeout-workflow.spec.ts` - 9 tests for C5-C7 workflows

**Modified Files:**
- `tests/fixtures/test-data.ts` - Added `SEEDED_CONSUMER_NO_OFFERS_REQUEST`
- `scripts/local/seed-test-data.ts` - Added consumer no_offers request to seed

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-23 | Story created | SM |
| 2025-12-23 | Implementation complete, 7/9 tests passing | Dev Agent |
