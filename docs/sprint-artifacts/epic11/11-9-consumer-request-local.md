# Story 11-9: Consumer Request Submission (Local)

| Field | Value |
|-------|-------|
| **Story ID** | 11-9 |
| **Epic** | Epic 11 - Playwright Workflow Validation |
| **Title** | Consumer Request Submission (Local) |
| **Status** | ready-for-dev |
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

- [ ] 1.1 Verify consumer test user exists
- [ ] 1.2 Verify guest flow works (no auth required)
- [ ] 1.3 Verify comunas are seeded for address selection

### Task 2: Write Playwright Tests

- [ ] 2.1 Create `tests/e2e/consumer-request-workflow.spec.ts`
- [ ] 2.2 Test C1: Form loads with all required fields
- [ ] 2.3 Test C1: Address input with comuna selection
- [ ] 2.4 Test C1: Volume selection (100L, 1000L, 5000L, 10000L+)
- [ ] 2.5 Test C1: Urgency toggle
- [ ] 2.6 Test C2: Guest can submit request
- [ ] 2.7 Test C2: Registered user can submit request
- [ ] 2.8 Test C2: Confirmation page shows tracking info
- [ ] 2.9 Test C2: Email field validation for guests

### Task 3: Run and Fix

- [ ] 3.1 Run tests locally
- [ ] 3.2 Document any failures
- [ ] 3.3 Fix issues or create Epic 11A stories
- [ ] 3.4 All tests passing locally

---

## Acceptance Criteria

### AC 11-9.1: C1 - Request Form
- [ ] Form shows all required fields (address, volume, contact)
- [ ] Address input works with comuna dropdown
- [ ] Volume selector shows pricing tiers
- [ ] Urgency option toggles correctly
- [ ] Form validates required fields

### AC 11-9.2: C2 - Submit Request
- [ ] Guest can submit with email (for tracking link)
- [ ] Registered user can submit (auto-fills contact)
- [ ] Confirmation page shows request details
- [ ] Tracking token is generated
- [ ] Email is sent with tracking link (or notification created)

---

## Definition of Done

- [ ] Seed data verified (comunas, test users)
- [ ] Playwright tests created for C1-C2 workflows
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
- `tests/e2e/consumer-request-workflow.spec.ts`

**Modified Files:**
- _TBD_

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-23 | Story created | SM |
