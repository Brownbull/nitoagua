# Story 11-3: Provider Visibility (Local)

| Field | Value |
|-------|-------|
| **Story ID** | 11-3 |
| **Epic** | Epic 11 - Playwright Workflow Validation |
| **Title** | Provider Visibility (Local) |
| **Status** | done |
| **Points** | 3 |
| **Priority** | P1 - High |
| **Depends On** | Story 11-1 |

---

## User Story

**As a** provider (Don Pedro),
**I want** to track my offers and see delivery details,
**So that** I know the status of my work without uncertainty.

---

## Workflows Covered

| ID | Workflow | Success Criteria |
|----|----------|------------------|
| P7 | Track My Offers | See all offers with status |
| P8 | Receive Acceptance Notification | Know when offer accepted |
| P9 | View Delivery Details | See full request info |

---

## Tasks

### Task 1: Extend Seed Data

- [x] 1.1 Update seed to create offers in various states:
  - Pending offer
  - Accepted offer
  - Expired offer
  - Completed delivery
- [x] 1.2 Verify seed creates notification data

### Task 2: Write Playwright Tests

- [x] 2.1 Create `tests/e2e/provider-visibility.spec.ts`
- [x] 2.2 Test P7: Provider can view "Mis Ofertas" with status
- [x] 2.3 Test P8: Notification appears for accepted offer
- [x] 2.4 Test P9: Provider can view delivery details

### Task 3: Run and Fix

- [x] 3.1 Run tests locally
- [x] 3.2 Fix any issues
- [x] 3.3 All tests passing

---

## Acceptance Criteria

### AC 11-3.1: P7 - Track My Offers
- [x] Provider sees list of their offers
- [x] Each offer shows status (pending/accepted/expired)
- [x] Status updates reflect correctly

### AC 11-3.2: P8 - Acceptance Notification
- [x] Notification created when offer accepted
- [x] Provider can see notification in UI

### AC 11-3.3: P9 - Delivery Details
- [x] Provider can view full request details
- [x] Contact info visible for accepted deliveries

---

## Definition of Done

- [x] Seed data extended for offer states
- [x] Playwright tests created
- [x] All tests passing locally
- [x] Story status updated to `review`

---

## Dev Agent Record

### Implementation Plan
- Extended `scripts/local/seed-offer-tests.ts` with notification data for P8 workflow
- Created `tests/e2e/provider-visibility.spec.ts` with 8 tests covering P7, P8, P9 workflows
- Tests use mobile viewport (360x780) and dev login mode

### Completion Notes
- **8/8 tests passing** on local Supabase
- Added `OFFER_TEST_NOTIFICATIONS` to seed script with valid UUIDs
- Added `PROVIDER_NOTIFICATIONS_TEST_DATA` to test fixtures
- Tests cover:
  - P7.1: Offers list page visible
  - P7.2: Offers grouped by status (pending/accepted/expired)
  - P7.3: Status updates reflect correctly (countdown, buttons)
  - P8.1: Notification system working
  - P8.2: Notification UI verified
  - P9.1: Full request details visible
  - P9.2: Contact info visible for accepted deliveries
  - INT: Full navigation flow (offers → details → back)

### File List

**New Files:**
- `tests/e2e/provider-visibility.spec.ts` - 8 Playwright tests for P7/P8/P9 workflows

**Modified Files:**
- `scripts/local/seed-offer-tests.ts` - Added notification seeding (Story 11-3: P8)
- `tests/fixtures/test-data.ts` - Added PROVIDER_NOTIFICATIONS_TEST_DATA, fixed comuna_id references
- `_bmad/agents/atlas/atlas-sidecar/knowledge/05-testing.md` - Added Epic 11 workflow validation patterns

### Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-23 | Story implementation complete | Claude |
| 2025-12-23 | Atlas code review: Fixed 5 issues (2 HIGH selector mismatches, 1 HIGH test pattern, 1 MEDIUM data mismatch, 1 MEDIUM missing file doc) | Claude |
