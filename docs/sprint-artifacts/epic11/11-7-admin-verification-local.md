# Story 11-7: Admin Verification (Local)

| Field | Value |
|-------|-------|
| **Story ID** | 11-7 |
| **Epic** | Epic 11 - Playwright Workflow Validation |
| **Title** | Admin Verification (Local) |
| **Status** | drafted |
| **Points** | 3 |
| **Priority** | P0 - Critical |
| **Depends On** | Story 11-1 |

---

## User Story

**As a** platform admin,
**I want** to verify pending providers,
**So that** only legitimate providers can deliver water.

---

## Workflows Covered

| ID | Workflow | Success Criteria |
|----|----------|------------------|
| A1 | View Verification Queue | See list of pending providers |
| A2 | Review Provider Documents | View carnet, truck photos |
| A3 | Approve/Reject Provider | Update verification status |
| A4 | Provider Notification | Provider receives email on status change |

---

## Tasks

### Task 1: Seed Data Preparation

- [ ] 1.1 Verify admin user exists in seed data
- [ ] 1.2 Create/verify pending providers with documents
- [ ] 1.3 Create providers in various verification states:
  - pending (awaiting review)
  - approved (verified)
  - rejected (with rejection reason)

### Task 2: Write Playwright Tests

- [ ] 2.1 Create `tests/e2e/admin-verification-workflow.spec.ts`
- [ ] 2.2 Test A1: Admin can view verification queue
- [ ] 2.3 Test A2: Admin can review provider documents
- [ ] 2.4 Test A3: Admin can approve provider
- [ ] 2.5 Test A3: Admin can reject provider with reason
- [ ] 2.6 Test A4: Verify notification triggered (check API or email mock)

### Task 3: Run and Fix

- [ ] 3.1 Run tests locally with `npm run seed:test && npm run test:e2e`
- [ ] 3.2 Document any failures
- [ ] 3.3 Fix issues or create Epic 11A stories for broken components
- [ ] 3.4 All tests passing locally

---

## Acceptance Criteria

### AC 11-7.1: A1 - View Queue
- [ ] Admin sees list of pending providers
- [ ] Queue shows provider count correctly
- [ ] Provider cards show name, email, submitted date

### AC 11-7.2: A2 - Review Documents
- [ ] Admin can view uploaded carnet image
- [ ] Admin can view truck photo
- [ ] Documents are viewable (not broken images)

### AC 11-7.3: A3 - Approve/Reject
- [ ] Approve button updates provider status to verified
- [ ] Reject button shows reason input modal
- [ ] Rejection reason is saved
- [ ] Provider status updates correctly in database

### AC 11-7.4: A4 - Notification
- [ ] Provider receives email on approval (or notification created)
- [ ] Provider receives email on rejection with reason

---

## Definition of Done

- [ ] Seed data includes pending providers with documents
- [ ] Playwright tests created for A1-A4 workflows
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
- `tests/e2e/admin-verification-workflow.spec.ts`

**Modified Files:**
- _TBD_

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-23 | Story created | SM |
