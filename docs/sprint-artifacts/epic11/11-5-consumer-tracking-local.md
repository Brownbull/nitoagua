# Story 11-5: Consumer Status Tracking (Local)

| Field | Value |
|-------|-------|
| **Story ID** | 11-5 |
| **Epic** | Epic 11 - Playwright Workflow Validation |
| **Title** | Consumer Status Tracking (Local) |
| **Status** | done |
| **Points** | 3 |
| **Priority** | P1 - High |
| **Depends On** | Story 11-1 |

---

## User Story

**As a** consumer (Dona Maria),
**I want** to track my delivery status and contact the driver,
**So that** I know when my water is arriving.

---

## Workflows Covered

| ID | Workflow | Success Criteria |
|----|----------|------------------|
| C3 | Track Delivery Status | See real-time status updates |
| C4 | Contact Driver | One-tap call/WhatsApp |

---

## Tasks

### Task 1: Extend Seed Data

- [x] 1.1 Create requests in various states:
  - Pending (no offers) - `seed-token-pending`
  - Has offers (pending selection) - via `seed:offers` consumer-facing offers
  - Accepted (awaiting delivery) - `seed-token-accepted`
  - Delivered (completed) - `seed-token-delivered`
- [x] 1.2 Include provider contact info - TEST_SUPPLIER with phone +56911111111

### Task 2: Write Playwright Tests

- [x] 2.1 Create `tests/e2e/consumer-status-tracking.spec.ts`
- [x] 2.2 Test C3: Consumer sees correct status at each stage (10 tests)
- [x] 2.3 Test C4: Contact driver button visible when accepted (6 tests)

### Task 3: Run and Fix

- [x] 3.1 Run tests locally
- [x] 3.2 Fix issues (fixed strict mode violation in cancelled test)
- [x] 3.3 All tests passing (19/19 Chromium)

### Task 4: Atlas Code Review Fixes

- [x] 4.1 Replace `.isVisible().catch()` pattern with `.count()` (Atlas Testing-1B pattern)
- [x] 4.2 Add explicit phone link assertion in C4.4 delivered test
- [x] 4.3 Add `no_offers` status test (C3.6)
- [x] 4.4 Add `data-testid` attributes to TimelineTracker for robust timeline testing
- [x] 4.5 Strengthen timeline tests with data-status attribute validation
- [x] 4.6 Update seed script to include `no_offers` request data

---

## Acceptance Criteria

### AC 11-5.1: C3 - Status Tracking
- [x] Status page shows current request state
- [x] Timeline/progress indicator works
- [x] Status updates when offer accepted

### AC 11-5.2: C4 - Contact Driver
- [x] Contact button appears after offer accepted
- [x] Phone number or WhatsApp link available

---

## Definition of Done

- [x] Seed data extended (existing seed scripts cover all states, including no_offers)
- [x] Playwright tests created (19 tests in consumer-status-tracking.spec.ts)
- [x] All tests passing locally (19/19 Chromium)
- [x] Atlas code review completed with fixes applied
- [x] Story status updated to `done`

---

## Dev Agent Record

### Implementation Plan
- Verified existing seed data in `seed-test-data.ts` covers required states
- Verified `seed-offer-tests.ts` creates consumer-facing offers for pending with offers state
- Created dedicated `consumer-status-tracking.spec.ts` for C3/C4 workflow validation

### Debug Log
- Initial test run: 17/18 passed, 1 failed (strict mode violation on cancelled test)
- Fixed: Changed `/cancelad/i` regex to exact match `"Cancelada"`
- Firefox initially failed due to `isMobile: true` not supported - removed mobile-specific settings

### Completion Notes
- All 19 tests passing on Chromium
- Tests validate C3 (Track Delivery Status) with 10 status tracking tests
- Tests validate C4 (Contact Driver) with 6 contact button tests
- Additional 3 tests for accessibility and Spanish language verification

### Atlas Code Review Fixes Applied
- Replaced `.isVisible().catch()` anti-pattern with `.count()` pattern (Testing-1B)
- Added explicit assertion in C4.4 test for phone link NOT visible on delivered
- Added C3.6 test for `no_offers` status (previously missing)
- Added `data-testid="timeline"` and `data-testid="timeline-step-{n}"` with `data-status` attributes
- Updated seed script to include `no_offers` request data

### File List
**New Files:**
- `tests/e2e/consumer-status-tracking.spec.ts` - 19 E2E tests for C3/C4 workflows

**Modified Files:**
- `docs/sprint-artifacts/sprint-status.yaml` - status: ready-for-dev → in-progress → review → done
- `docs/sprint-artifacts/epic11/11-5-consumer-tracking-local.md` - task checkboxes, Dev Agent Record
- `src/components/consumer/timeline-tracker.tsx` - added testids for timeline testing
- `scripts/local/seed-test-data.ts` - added no_offers seed request

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-23 | Story created | SM |
| 2025-12-23 | Implementation complete - 18/18 tests passing | Dev Agent |
| 2025-12-23 | Atlas code review: 4 issues fixed, 19/19 tests passing | Code Review |
