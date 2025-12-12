# Story 6.5: Cash Settlement Tracking

Status: ready-for-dev

## Story

As an **admin**,
I want **to track and verify commission payments from providers**,
so that **cash settlements are properly recorded**.

## Acceptance Criteria

1. **AC6.5.1:** Settlement page shows summary cards: total pending, overdue, pending verifications
2. **AC6.5.2:** Pending payments table shows: provider, amount, receipt, date, actions
3. **AC6.5.3:** Provider balances table shows: provider, total owed, days outstanding
4. **AC6.5.4:** Admin can view uploaded receipt image
5. **AC6.5.5:** Admin can enter bank reference and confirm payment
6. **AC6.5.6:** Confirmation creates commission_paid entry in ledger
7. **AC6.5.7:** Admin can reject payment with reason
8. **AC6.5.8:** Provider notified of payment verification result

## Tasks / Subtasks

- [ ] **Task 1: Settlement Page Route** (AC: 1)
  - [ ] Create `src/app/(admin)/settlement/page.tsx`
  - [ ] Add "Liquidaciones" link to sidebar
  - [ ] Verify auth guard protects route

- [ ] **Task 2: Summary Cards** (AC: 1)
  - [ ] Total pending card: Sum all commission_owed not yet paid
  - [ ] Overdue card (>7 days): Filter by age
  - [ ] Pending verifications card: Count withdrawal_requests with status='pending'

- [ ] **Task 3: Pending Payments Table** (AC: 2, 4)
  - [ ] Create `src/components/admin/settlement-table.tsx`
  - [ ] Query withdrawal_requests WHERE status = 'pending'
  - [ ] Columns: Provider, Amount, Receipt thumbnail, Date, Actions
  - [ ] Receipt thumbnail opens image viewer

- [ ] **Task 4: Provider Balances Table** (AC: 3)
  - [ ] Aggregate commission_ledger by provider
  - [ ] Calculate days outstanding from oldest unpaid entry
  - [ ] Columns: Provider, Total Owed, Days Outstanding, Last Payment
  - [ ] "Ver Detalle" link per provider

- [ ] **Task 5: Payment Verification Flow** (AC: 4, 5, 6, 8)
  - [ ] "Verificar" button opens modal
  - [ ] Receipt image viewer
  - [ ] Bank reference input (optional)
  - [ ] "Confirmar Pago" button
  - [ ] Insert commission_paid entry in ledger
  - [ ] Update withdrawal_request status = 'completed'
  - [ ] Notify provider: "Pago confirmado"

- [ ] **Task 6: Payment Rejection Flow** (AC: 7, 8)
  - [ ] "Rechazar" button opens modal
  - [ ] Reason required (dropdown or text)
  - [ ] Update withdrawal_request status = 'rejected'
  - [ ] Notify provider with reason

- [ ] **Task 7: Provider Balance Detail** (AC: 3)
  - [ ] Create detail view for individual provider
  - [ ] Show full ledger history
  - [ ] Aging buckets: Current (<7d), Week (7-14d), Overdue (>14d)

- [ ] **Task 8: Testing** (AC: All)
  - [ ] E2E test: View settlement dashboard
  - [ ] E2E test: Verify payment with bank reference
  - [ ] E2E test: Reject payment with reason
  - [ ] E2E test: View provider balance detail

## Dev Notes

### Architecture Context

- Commission tracking uses `commission_ledger` table with types: 'commission_owed', 'commission_paid', 'adjustment'
- Provider payment requests in `withdrawal_requests` table
- Balance = SUM(commission_owed) - SUM(commission_paid + adjustment)
- Aging calculated from ledger entry created_at

### UX Mockups & Design References

**CRITICAL: Review these mockups before implementing UI components**

| Document | Location | Relevant Sections |
|----------|----------|-------------------|
| **Admin Mockups** | [docs/ux-mockups/02-admin-dashboard.html](docs/ux-mockups/02-admin-dashboard.html) | Section 10: Finanzas (Financial Reports) |
| **Admin Flow Requirements** | [docs/ux-audit/admin-flow-requirements.md](docs/ux-audit/admin-flow-requirements.md) | Section 2.3: Financial Overview, Section 5: Settlement |
| **Admin Mockup Updates** | [docs/ux-audit/admin-mockup-updates-2025-12-11.md](docs/ux-audit/admin-mockup-updates-2025-12-11.md) | Financial Reports section |

**Key UX Guidelines from Mockups:**

1. **Summary Cards:** Stats cards with icon, label, value, secondary info
2. **Revenue Display:** Full CLP amounts ($480,000 not $480k)
3. **Table Layout:** Provider name, amount, date columns
4. **Action Buttons:** "Verificar" (green), "Rechazar" (red outline)
5. **Receipt Viewer:** Modal with zoom, download options
6. **Aging Colors:** Green (<7d), Yellow (7-14d), Red (>14d)

### Prerequisites

- Story 6.1 (Admin Authentication) must be complete
- Story 8.7 (Provider Earnings) creates commission entries

### Relevant Files to Create

| File | Purpose |
|------|---------|
| `src/app/(admin)/settlement/page.tsx` | Settlement page |
| `src/components/admin/settlement-table.tsx` | Tables component |
| `src/components/admin/receipt-viewer.tsx` | Receipt image modal |
| `src/lib/utils/commission.ts` | Commission calculation helpers |

### References

- [Source: docs/sprint-artifacts/tech-spec-epic-6.md#Story-6.5]
- [Source: docs/architecture.md#Pattern-2-Cash-Settlement-Tracking]
- [Source: docs/epics.md#Story-6.5]
- [Source: docs/ux-mockups/02-admin-dashboard.html] - Section 10
- [Source: docs/ux-audit/admin-flow-requirements.md] - Financial Overview

## Dev Agent Record

### Context Reference

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-12 | Story drafted from tech spec and epics | SM Agent |
| 2025-12-12 | Added UX mockup references | SM Agent |
