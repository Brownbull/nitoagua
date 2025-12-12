# Story 6.6: Orders Management

Status: ready-for-dev

## Story

As an **admin**,
I want **to view all orders and their offer history**,
so that **I can monitor the marketplace and intervene if needed**.

## Acceptance Criteria

1. **AC6.6.1:** Orders page shows filterable table of all orders
2. **AC6.6.2:** Filters: status, date range, service area
3. **AC6.6.3:** Clicking order shows detail view with offer history
4. **AC6.6.4:** Detail shows timeline: Created → Offers → Selected → Delivered
5. **AC6.6.5:** Admin can view consumer and provider contact info
6. **AC6.6.6:** Admin can cancel order with reason
7. **AC6.6.7:** Offer analytics shown: offers received, time to first offer

## Tasks / Subtasks

- [ ] **Task 1: Orders Page Route** (AC: 1)
  - [ ] Create `src/app/(admin)/orders/page.tsx`
  - [ ] Add "Pedidos" link to sidebar
  - [ ] Query all water_requests

- [ ] **Task 2: Orders Table Component** (AC: 1, 2)
  - [ ] Create `src/components/admin/orders-table.tsx`
  - [ ] Columns: ID, Consumer, Amount, Status, Offers Count, Provider, Created
  - [ ] Status badges with colors
  - [ ] Pagination

- [ ] **Task 3: Filters** (AC: 2)
  - [ ] Status filter: all, pending, offers_pending, assigned, en_route, delivered, cancelled
  - [ ] Date range picker
  - [ ] Service area filter (comunas)
  - [ ] Apply filters to query

- [ ] **Task 4: Order Detail View** (AC: 3, 4, 5)
  - [ ] Create `src/app/(admin)/orders/[id]/page.tsx`
  - [ ] Full request details: amount, address, urgency, payment method
  - [ ] Consumer contact info (name, phone, email)
  - [ ] Provider contact (if assigned)
  - [ ] Order timeline visualization

- [ ] **Task 5: Offer History Section** (AC: 3, 7)
  - [ ] List all offers for this request
  - [ ] Each offer: provider name, delivery window, status, created time
  - [ ] Highlight accepted offer
  - [ ] Show expired/cancelled offers
  - [ ] Analytics: count, time to first offer, time to selection

- [ ] **Task 6: Cancel Order Action** (AC: 6)
  - [ ] "Cancelar Pedido" button
  - [ ] Reason required modal
  - [ ] Update water_requests.status = 'cancelled'
  - [ ] Notify consumer and provider (if assigned)

- [ ] **Task 7: Real-time Updates** (AC: 1)
  - [ ] Subscribe to water_requests changes
  - [ ] Subscribe to offers changes for open orders
  - [ ] Update table/detail view in real-time

- [ ] **Task 8: Testing** (AC: All)
  - [ ] E2E test: View orders table
  - [ ] E2E test: Filter by status and date
  - [ ] E2E test: View order detail with offer history
  - [ ] E2E test: Cancel order with reason

## Dev Notes

### Architecture Context

- Orders are `water_requests` table
- Offers are `offers` table linked by request_id
- Real-time via Supabase Realtime subscriptions
- Join water_requests with offers for offer history

### UX Mockups & Design References

**CRITICAL: Review these mockups before implementing UI components**

| Document | Location | Relevant Sections |
|----------|----------|-------------------|
| **Admin Mockups** | [docs/ux-mockups/02-admin-dashboard.html](docs/ux-mockups/02-admin-dashboard.html) | Section 6: Pedidos (Live Orders), Section 8: Historial |
| **Admin Flow Requirements** | [docs/ux-audit/admin-flow-requirements.md](docs/ux-audit/admin-flow-requirements.md) | Section 3: Order/Request Management |
| **Admin Mockup Updates** | [docs/ux-audit/admin-mockup-updates-2025-12-11.md](docs/ux-audit/admin-mockup-updates-2025-12-11.md) | Section 6C: Map View, Section 8: Order History |

**Key UX Guidelines from Mockups:**

1. **Table Layout:** ID column truncated, status badge, offers count chip
2. **Status Badges:** Color-coded per status
3. **Filters:** Date tabs (Hoy/Semana/Mes) + calendar picker
4. **Detail View:** Two-column layout - info left, timeline right
5. **Timeline:** Vertical timeline with status dots and timestamps
6. **Offer History:** Cards with provider info, delivery window, status
7. **Contact Info:** Phone/email with click-to-action (WhatsApp link for phone)

### Prerequisites

- Story 6.1 (Admin Authentication) must be complete

### Relevant Files to Create

| File | Purpose |
|------|---------|
| `src/app/(admin)/orders/page.tsx` | Orders list page |
| `src/app/(admin)/orders/[id]/page.tsx` | Order detail page |
| `src/components/admin/orders-table.tsx` | Table component |
| `src/components/admin/order-timeline.tsx` | Timeline visualization |
| `src/hooks/use-realtime-orders.ts` | Real-time hook |

### References

- [Source: docs/sprint-artifacts/tech-spec-epic-6.md#Story-6.6]
- [Source: docs/epics.md#Story-6.6]
- [Source: docs/ux-mockups/02-admin-dashboard.html] - Sections 6, 8
- [Source: docs/ux-audit/admin-flow-requirements.md] - Order Management

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
