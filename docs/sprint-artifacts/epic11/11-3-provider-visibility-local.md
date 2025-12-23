# Story 11-3: Provider Visibility (Local)

| Field | Value |
|-------|-------|
| **Story ID** | 11-3 |
| **Epic** | Epic 11 - Playwright Workflow Validation |
| **Title** | Provider Visibility (Local) |
| **Status** | drafted |
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

- [ ] 1.1 Update seed to create offers in various states:
  - Pending offer
  - Accepted offer
  - Expired offer
  - Completed delivery
- [ ] 1.2 Verify seed creates notification data

### Task 2: Write Playwright Tests

- [ ] 2.1 Create `tests/e2e/provider-visibility.spec.ts`
- [ ] 2.2 Test P7: Provider can view "Mis Ofertas" with status
- [ ] 2.3 Test P8: Notification appears for accepted offer
- [ ] 2.4 Test P9: Provider can view delivery details

### Task 3: Run and Fix

- [ ] 3.1 Run tests locally
- [ ] 3.2 Fix any issues
- [ ] 3.3 All tests passing

---

## Acceptance Criteria

### AC 11-3.1: P7 - Track My Offers
- [ ] Provider sees list of their offers
- [ ] Each offer shows status (pending/accepted/expired)
- [ ] Status updates reflect correctly

### AC 11-3.2: P8 - Acceptance Notification
- [ ] Notification created when offer accepted
- [ ] Provider can see notification in UI

### AC 11-3.3: P9 - Delivery Details
- [ ] Provider can view full request details
- [ ] Contact info visible for accepted deliveries

---

## Definition of Done

- [ ] Seed data extended for offer states
- [ ] Playwright tests created
- [ ] All tests passing locally
- [ ] Story status updated to `review`
