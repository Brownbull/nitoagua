# Story 11-5: Consumer Status Tracking (Local)

| Field | Value |
|-------|-------|
| **Story ID** | 11-5 |
| **Epic** | Epic 11 - Playwright Workflow Validation |
| **Title** | Consumer Status Tracking (Local) |
| **Status** | drafted |
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

- [ ] 1.1 Create requests in various states:
  - Pending (no offers)
  - Has offers (pending selection)
  - Accepted (awaiting delivery)
  - Delivered (completed)
- [ ] 1.2 Include provider contact info

### Task 2: Write Playwright Tests

- [ ] 2.1 Create `tests/e2e/consumer-status-tracking.spec.ts`
- [ ] 2.2 Test C3: Consumer sees correct status at each stage
- [ ] 2.3 Test C4: Contact driver button visible when accepted

### Task 3: Run and Fix

- [ ] 3.1 Run tests locally
- [ ] 3.2 Fix issues (especially tracking page RLS)
- [ ] 3.3 All tests passing

---

## Acceptance Criteria

### AC 11-5.1: C3 - Status Tracking
- [ ] Status page shows current request state
- [ ] Timeline/progress indicator works
- [ ] Status updates when offer accepted

### AC 11-5.2: C4 - Contact Driver
- [ ] Contact button appears after offer accepted
- [ ] Phone number or WhatsApp link available

---

## Definition of Done

- [ ] Seed data extended
- [ ] Playwright tests created
- [ ] All tests passing locally
- [ ] Story status updated to `review`
