# Story 11-9: Consumer Request Submission (Local)

| Field | Value |
|-------|-------|
| **Story ID** | 11-9 |
| **Epic** | Epic 11 - Playwright Workflow Validation |
| **Title** | Consumer Request Submission (Local) |
| **Status** | done |
| **Points** | 3 |
| **Priority** | P1 - High |
| **Depends On** | Story 11-1 |

---

## User Story

**As a** consumer (Dona Maria),
**I want** to submit a water request,
**So that** I can get water delivered to my home.

---

## Workflows Covered

| ID | Workflow | Success Criteria |
|----|----------|------------------|
| C1 | Fill Request Form | Enter address, volume, urgency |
| C2 | Submit Request | Get confirmation and tracking link |

---

## Tasks

### Task 1: Seed Data Preparation

- [x] 1.1 Verify consumer test user exists
- [x] 1.2 Verify guest flow works (no auth required)
- [x] 1.3 Verify comunas are seeded for address selection

### Task 2: Write Playwright Tests

- [x] 2.1 Create `tests/e2e/consumer-request-workflow.spec.ts`
- [x] 2.2 Test C1: Form loads with all required fields
- [x] 2.3 Test C1: Address input with comuna selection
- [x] 2.4 Test C1: Volume selection (100L, 1000L, 5000L, 10000L+)
- [x] 2.5 Test C1: Urgency toggle
- [x] 2.6 Test C2: Guest can submit request
- [x] 2.7 Test C2: Registered user can submit request
- [x] 2.8 Test C2: Confirmation page shows tracking info
- [x] 2.9 Test C2: Email field validation for guests

### Task 3: Run and Fix

- [x] 3.1 Run tests locally
- [x] 3.2 Document any failures
- [x] 3.3 Fix issues or create Epic 11A stories
- [x] 3.4 All tests passing locally

---

## Acceptance Criteria

### AC 11-9.1: C1 - Request Form
- [x] Form shows all required fields (address, volume, contact)
- [x] Address input works with comuna dropdown
- [x] Volume selector shows pricing tiers
- [x] Urgency option toggles correctly
- [x] Form validates required fields

### AC 11-9.2: C2 - Submit Request
- [x] Guest can submit with email (for tracking link)
- [x] Registered user can submit (auto-fills contact)
- [x] Confirmation page shows request details
- [x] Tracking token is generated
- [ ] Email is sent with tracking link (or notification created) - Not tested (requires email service)

---

## Definition of Done

- [x] Seed data verified (comunas, test users)
- [x] Playwright tests created for C1-C2 workflows
- [x] All tests passing locally
- [x] Story status updated to `review`

---

## Dev Agent Record

### Implementation Plan

1. Verified seed data exists (test users, comunas)
2. Created comprehensive E2E tests for C1-C2 workflows
3. Tests validate REAL database operations (no mocks)
4. 11 tests covering all workflow steps

### Debug Log

- Initial test run: 9/11 passed
- Fixed `C2.2` test: Dev login uses `dev-login-button` not `dev-login-section`
- Fixed `C2.2` test: Registered users get pre-filled form, adjusted test to handle auto-fill
- Fixed integration test: Home page CTA is button with `request-water-button` testid
- Final run: 11/11 passed

### File List
**New Files:**
- `tests/e2e/consumer-request-workflow.spec.ts`

**Modified Files (Code Review Fix):**
- `src/lib/validations/request.ts` - Fixed pricing DRY violation, now uses `getDeliveryPrice()`
- `tests/e2e/consumer-request-workflow.spec.ts` - Updated price assertions to match correct pricing tiers

### Test Results (Local)

```
Running 11 tests using 1 worker

  ✓ C1.1: Form shows all required fields (1.0s)
  ✓ C1.2: Address input works with comuna dropdown (1.3s)
  ✓ C1.3: Volume selection shows pricing tiers (1.5s)
  ✓ C1.4: Urgency toggle works correctly (1.5s)
  ✓ C1.5: Form validates required fields (973ms)
  ✓ C2.1: Guest can submit request with email (1.8s)
  ✓ C2.2: Registered user can submit request (3.1s)
  ✓ C2.3: Confirmation page shows request details (1.8s)
  ✓ C2.4: Tracking token is generated (2.1s)
  ✓ C2.5: Email field validation for guests (1.2s)
  ✓ Full workflow: Guest request from home to confirmation (2.2s)

  11 passed (19.6s)
```

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-23 | Story created | SM |
| 2025-12-23 | All tasks completed, 11/11 tests passing | Dev Agent |
| 2025-12-23 | Atlas code review: Fixed pricing DRY violation (M1), 11/11 tests passing | Code Review |
