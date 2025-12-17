# Story 8.6: Earnings Dashboard

| Field | Value |
|-------|-------|
| **Story ID** | 8-6 |
| **Epic** | Epic 8: Provider Offer System |
| **Title** | Earnings Dashboard |
| **Status** | review |
| **Priority** | P1 (High) |
| **Points** | 4 |
| **Sprint** | TBD |

---

## User Story

As a **provider**,
I want **to see my earnings summary with commission breakdown**,
So that **I understand my income and any outstanding commission payments**.

---

## Background

Providers need visibility into their earnings from completed deliveries. This dashboard shows gross income, commission deductions, and net earnings. For cash payments, it also tracks commission owed to the platform that must be settled via bank transfer.

---

## Acceptance Criteria

| AC# | Criterion | Notes |
|-----|-----------|-------|
| AC8.6.1 | Period selector: Hoy / Esta Semana / Este Mes | Filter earnings by time period |
| AC8.6.2 | Summary cards show: Total Entregas, Ingreso Bruto, Comisión (%), Ganancia Neta | Core financial metrics |
| AC8.6.3 | Cash payment section shows: Efectivo Recibido, Comisión Pendiente | Track outstanding commission |
| AC8.6.4 | "Pagar Comisión" button visible when pending > 0 | Links to Story 8.7 |
| AC8.6.5 | Delivery history list shows: date, amount, payment method, commission | Individual delivery breakdown |

---

## Tasks / Subtasks

- [x] **Task 1: Database Migration - Commission Ledger** (AC: 8.6.3)
  - [x] Create `commission_ledger` table with schema from tech spec
  - [x] Add index: `idx_ledger_provider`
  - [x] Create RLS policies (provider sees own entries only)
  - [x] Test migration locally
  - Note: Table already exists from Epic 6-5 migration (20251213010552_add_cash_settlement_tables.sql)

- [x] **Task 2: Server Action - getEarningsSummary** (AC: 8.6.1, 8.6.2, 8.6.3)
  - [x] Create `src/lib/actions/settlement.ts`
  - [x] Implement `getEarningsSummary(period)` function
  - [x] Calculate date range for 'today' | 'week' | 'month'
  - [x] Query completed deliveries in period
  - [x] Aggregate: total_deliveries, gross_income, commission_amount, net_earnings
  - [x] Calculate cash_received and commission_pending from ledger

- [x] **Task 3: Server Action - getDeliveryHistory** (AC: 8.6.5)
  - [x] Add `getDeliveryHistory(limit)` function
  - [x] Query completed deliveries with commission breakdown
  - [x] Include: date, amount, payment_method, commission
  - [x] Sort by date descending
  - [x] Pagination support

- [x] **Task 4: Earnings Dashboard Page** (AC: ALL)
  - [x] Create `src/app/provider/earnings/page.tsx`
  - [x] Period selector tabs: Hoy | Esta Semana | Este Mes
  - [x] Re-fetch data on period change
  - [x] Display summary cards
  - [x] Display delivery history list
  - Note: Combined with client component in earnings-dashboard-client.tsx

- [x] **Task 5: Summary Cards Component** (AC: 8.6.2)
  - [x] Create `EarningsSummaryCards` component in earnings-dashboard-client.tsx
  - [x] Total Entregas card with count
  - [x] Ingreso Bruto card with gross amount
  - [x] Comision card showing percentage and amount
  - [x] Ganancia Neta card (highlighted) with net earnings
  - [x] Format all amounts in CLP using formatCLP utility

- [x] **Task 6: Cash Payment Section** (AC: 8.6.3, 8.6.4)
  - [x] Separate section for cash-based earnings
  - [x] "Efectivo Recibido" showing total cash received
  - [x] "Comision Pendiente" showing outstanding commission
  - [x] "Pagar Comision" button when pending > 0
  - [x] Button links to `/provider/earnings/withdraw`

- [x] **Task 7: Delivery History List** (AC: 8.6.5)
  - [x] Create `DeliveryHistoryList` component in earnings-dashboard-client.tsx
  - [x] Columns: Fecha, Monto, Pago, Comision
  - [x] Payment method badge (Efectivo/Transferencia)
  - [x] "Ver mas" pagination link

- [x] **Task 8: Testing** (AC: ALL)
  - [x] Unit: Period date range calculation (tests/unit/earnings-summary.test.ts - 26 tests)
  - [x] Unit: Commission calculation for earnings
  - [x] Unit: Commission pending calculation from ledger
  - [x] E2E: Page access and authentication (tests/e2e/provider-earnings.spec.ts)
  - [x] E2E: Period selector changes displayed data
  - [x] E2E: Summary cards display correctly
  - [x] E2E: Cash payment section with Pagar Comision button
  - [x] E2E: Delivery history list
  - [x] E2E: Navigation via bottom nav (21 tests total)

---

## Dev Notes

### Architecture Alignment

Per tech spec:
- Page: `src/app/(provider)/earnings/page.tsx`
- Actions: `src/lib/actions/settlement.ts`

### Commission Ledger Schema

```sql
CREATE TABLE commission_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  request_id UUID REFERENCES water_requests(id),
  type TEXT NOT NULL CHECK (type IN ('commission_owed', 'commission_paid', 'adjustment')),
  amount INTEGER NOT NULL,  -- CLP, positive = owed to platform
  description TEXT,
  bank_reference TEXT,
  receipt_path TEXT,
  admin_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ledger_provider ON commission_ledger(provider_id, created_at DESC);
```

### Earnings Calculation Logic

```typescript
// For a given period:
const summary: EarningsSummary = {
  period: 'month',
  total_deliveries: count(completed_requests),
  gross_income: sum(request_amounts),
  commission_amount: gross_income * (commission_percent / 100),
  net_earnings: gross_income - commission_amount,
  // For cash payments only:
  cash_received: sum(cash_request_amounts),
  commission_pending: sum(ledger.commission_owed) - sum(ledger.commission_paid)
};
```

### Period Date Ranges

```typescript
const getPeriodRange = (period: 'today' | 'week' | 'month') => {
  const now = new Date();
  switch (period) {
    case 'today':
      return { start: startOfDay(now), end: endOfDay(now) };
    case 'week':
      return { start: startOfWeek(now), end: endOfWeek(now) };
    case 'month':
      return { start: startOfMonth(now), end: endOfMonth(now) };
  }
};
```

### Project Structure Notes

- Creates foundation for commission settlement (Story 8.7)
- Integrates with existing delivery completion flow
- Uses date-fns for date calculations

### References

- [Source: docs/sprint-artifacts/epic8/tech-spec-epic-8.md#Story-8.6]
- [Source: docs/epics.md#Story-8.6-Earnings-Dashboard]

---

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

N/A

### Completion Notes List

- Database migration already existed from Epic 6-5 (commission_ledger, withdrawal_requests)
- Server actions added to existing settlement.ts with getEarningsSummary and getDeliveryHistory
- Dashboard page created at src/app/provider/earnings/ with server and client components
- Used date-fns for period calculations (startOfDay, startOfWeek, startOfMonth)
- Provider nav already had /provider/earnings link from previous story
- All 26 unit tests pass, all 21 E2E tests pass

### File List

**New Files:**
- `src/app/provider/earnings/page.tsx` - Server component page
- `src/app/provider/earnings/earnings-dashboard-client.tsx` - Client component with period selector and all UI
- `tests/e2e/provider-earnings.spec.ts` - E2E tests (21 tests)
- `tests/unit/earnings-summary.test.ts` - Unit tests (26 tests)

**Modified Files:**
- `src/lib/actions/settlement.ts` - Added getEarningsSummary and getDeliveryHistory functions

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-16 | Story drafted from tech spec and epics | Claude |
| 2025-12-17 | Story implemented - all tasks complete | Claude Opus 4.5 |
