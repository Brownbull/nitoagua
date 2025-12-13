# Story 6.6: Orders Management

Status: done

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

- [x] **Task 1: Orders Page Route** (AC: 1)
  - [x] Create `src/app/admin/orders/page.tsx`
  - [x] Add "Pedidos" link to sidebar and bottom nav
  - [x] Query all water_requests with provider/consumer joins

- [x] **Task 2: Orders Table Component** (AC: 1, 2)
  - [x] Create `src/components/admin/orders-table.tsx`
  - [x] Columns: ID, Consumer, Amount, Status, Offers Count, Provider, Created
  - [x] Status badges with colors
  - [x] Pagination (client-side with configurable page size)

- [x] **Task 3: Filters** (AC: 2)
  - [x] Status filter: all, pending, offers_pending, assigned, en_route, delivered, cancelled
  - [x] Date range picker (from/to date inputs)
  - [x] Service area filter (comunas extracted from address)
  - [x] Apply filters via URL search params

- [x] **Task 4: Order Detail View** (AC: 3, 4, 5)
  - [x] Create `src/app/admin/orders/[id]/page.tsx`
  - [x] Full request details: amount, address, urgency, notes
  - [x] Consumer contact info (name, phone, email with WhatsApp links)
  - [x] Provider contact (if assigned) with WhatsApp link
  - [x] Order timeline visualization (vertical timeline with status dots)

- [x] **Task 5: Offer History Section** (AC: 3, 7)
  - [x] Create `src/components/admin/order-offer-history.tsx`
  - [x] List all offers for this request with provider name, price, delivery window
  - [x] Highlight accepted offer with green badge
  - [x] Show expired/cancelled offers with appropriate badges
  - [x] Analytics: total offers, time to first offer, time to selection

- [x] **Task 6: Cancel Order Action** (AC: 6)
  - [x] Create `src/components/admin/cancel-order-button.tsx`
  - [x] "Cancelar Pedido" button with modal dialog
  - [x] Reason required (minimum length validation)
  - [x] Server action at `src/lib/actions/admin-orders.ts`
  - [x] Updates water_requests.status and cancellation fields

- [x] **Task 7: Real-time Updates** (AC: 1)
  - [x] Create `src/hooks/use-realtime-orders.ts`
  - [x] Subscribe to water_requests changes
  - [x] Subscribe to offers changes for open orders
  - [x] Auto-refresh page via router.refresh() on changes

- [x] **Task 8: Testing** (AC: All)
  - [x] E2E test: View orders table and navigation
  - [x] E2E test: Filter by status and date
  - [x] E2E test: View order detail with offer history
  - [x] E2E test: Cancel order with reason
  - [x] E2E test: Mobile responsiveness

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
- Context file: 6-6-orders-management.context.xml
- Tech spec: docs/sprint-artifacts/epic6/tech-spec-epic-6.md
- UX mockups: docs/ux-mockups/02-admin-dashboard.html (Section 6: Pedidos, Section 8: Historial)

### Agent Model Used
claude-opus-4-5-20251101

### Debug Log References
**2025-12-13 - Implementation Plan:**
1. Task 1: Create orders page route at src/app/admin/orders/page.tsx, enable "Pedidos" link in sidebar
2. Task 2: Create orders-table.tsx with columns: ID, Consumer, Amount, Status, Offers Count, Provider, Created
3. Task 3: Add filters - status dropdown, date range picker, service area (comuna) filter
4. Task 4: Create order detail page with consumer/provider contact info and timeline
5. Task 5: Add offer history section with analytics (count, time to first offer)
6. Task 6: Implement cancel order action with reason modal
7. Task 7: Add real-time subscriptions for orders and offers
8. Task 8: Write E2E tests for all acceptance criteria

**Note:** The offers table doesn't exist yet in the database. Will create migration for offers table as part of this story since it's needed for offer history display.

### Completion Notes List

**2025-12-13 - Implementation Complete:**
1. Created offers table migration since it didn't exist yet (needed for offer history)
2. Orders page route at `/admin/orders` with server-side filtering
3. Orders table with search, filters (status, date range, comuna), pagination
4. Real-time indicator shows connection status and last update time
5. Order detail page with timeline, contact info (WhatsApp links), offer history
6. Offer analytics: total offers, time to first offer, time to selection
7. Cancel order action with required reason, updates order and marks offers as cancelled
8. Comprehensive E2E tests covering all 7 acceptance criteria
9. Mobile-responsive design with bottom nav integration

### File List

| File | Purpose |
|------|---------|
| `supabase/migrations/20251213141113_add_offers_table.sql` | Migration for offers table with RLS |
| `src/app/admin/orders/page.tsx` | Orders list page with server-side data fetching |
| `src/app/admin/orders/[id]/page.tsx` | Order detail page with timeline and contact info |
| `src/components/admin/orders-table.tsx` | Table component with search, filters, pagination |
| `src/components/admin/order-offer-history.tsx` | Offer history with analytics |
| `src/components/admin/cancel-order-button.tsx` | Cancel order modal dialog |
| `src/lib/actions/admin-orders.ts` | Server action for canceling orders |
| `src/hooks/use-realtime-orders.ts` | Real-time subscription hooks |
| `tests/e2e/admin-orders.spec.ts` | E2E tests for all acceptance criteria |

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-12 | Story drafted from tech spec and epics | SM Agent |
| 2025-12-12 | Added UX mockup references | SM Agent |
| 2025-12-13 | Implementation complete, status → review | Dev Agent |
| 2025-12-13 | Code review APPROVED - all 7 ACs validated, status → done | Dev Agent |
