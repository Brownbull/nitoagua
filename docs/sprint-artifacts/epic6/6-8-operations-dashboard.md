# Story 6.8: Operations Dashboard

Status: ready-for-dev

## Story

As an **admin**,
I want **to see platform metrics including offer analytics**,
so that **I can monitor marketplace health**.

## Acceptance Criteria

1. **AC6.8.1:** Dashboard shows period selector: Hoy / Esta Semana / Este Mes
2. **AC6.8.2:** Request metrics: total, with offers %, avg offers/request, timeout rate
3. **AC6.8.3:** Offer metrics: total, acceptance rate, avg time to first, expiration rate
4. **AC6.8.4:** Financial: transaction volume, commission earned, pending settlements
5. **AC6.8.5:** Provider: active count, online now, new applications
6. **AC6.8.6:** Metrics show trend vs previous period (↑ ↓)
7. **AC6.8.7:** Clicking metric drills down to filtered view

## Tasks / Subtasks

- [ ] **Task 1: Dashboard Page Enhancement** (AC: 1)
  - [ ] Update `src/app/(admin)/dashboard/page.tsx`
  - [ ] Add period selector: Hoy / Esta Semana / Este Mes
  - [ ] Pass period to metric queries

- [ ] **Task 2: Request Metrics Section** (AC: 2)
  - [ ] Create metrics cards component
  - [ ] Total requests in period
  - [ ] Requests with offers % (at least one offer)
  - [ ] Avg offers per request
  - [ ] Timeout rate % (requests that hit 4hr timeout)

- [ ] **Task 3: Offer Metrics Section** (AC: 3)
  - [ ] Total offers submitted
  - [ ] Acceptance rate % (accepted / total)
  - [ ] Avg time to first offer (minutes)
  - [ ] Expiration rate % (expired / total)

- [ ] **Task 4: Financial Metrics** (AC: 4)
  - [ ] Transaction volume (sum of delivered orders)
  - [ ] Commission earned (sum of commission_owed in period)
  - [ ] Pending settlements (current outstanding balance)
  - [ ] Currency formatting: $480,000 (not $480k)

- [ ] **Task 5: Provider Metrics** (AC: 5)
  - [ ] Active providers (approved status)
  - [ ] Online now (is_available = true)
  - [ ] New applications (pending this period)

- [ ] **Task 6: Trend Indicators** (AC: 6)
  - [ ] Calculate previous period values
  - [ ] Show ↑ or ↓ with percentage change
  - [ ] Color: green for positive, red for negative

- [ ] **Task 7: Drill-down Navigation** (AC: 7)
  - [ ] Make metric cards clickable
  - [ ] Navigate to filtered orders/providers page
  - [ ] Pass period and filter params in URL

- [ ] **Task 8: Data Caching** (AC: All)
  - [ ] Cache metrics with 5-minute refresh
  - [ ] Show "Actualizado hace X min" timestamp
  - [ ] Manual refresh button

- [ ] **Task 9: Testing** (AC: All)
  - [ ] E2E test: Period selector changes data
  - [ ] E2E test: Metrics render correctly
  - [ ] E2E test: Drill-down navigation works
  - [ ] Unit test: Metric calculations

## Dev Notes

### Architecture Context

- Aggregate queries on water_requests, offers, profiles, commission_ledger
- Use date filters based on period selector
- Cache results client-side or server-side with revalidation

### UX Mockups & Design References

**CRITICAL: Review these mockups before implementing UI components**

| Document | Location | Relevant Sections |
|----------|----------|-------------------|
| **Admin Mockups** | [docs/ux-mockups/02-admin-dashboard.html](docs/ux-mockups/02-admin-dashboard.html) | Section 2: Dashboard |
| **Admin Flow Requirements** | [docs/ux-audit/admin-flow-requirements.md](docs/ux-audit/admin-flow-requirements.md) | Section 5: Analytics & Reporting |
| **Admin Mockup Updates** | [docs/ux-audit/admin-mockup-updates-2025-12-11.md](docs/ux-audit/admin-mockup-updates-2025-12-11.md) | Section 10: Financial Reports |

**Key UX Guidelines from Mockups:**

1. **Period Selector:** Tabs at top: Hoy / Esta Semana / Este Mes
2. **Metrics Grid:** 2x2 or 3x2 grid of metric cards
3. **Metric Card Pattern:**
   - Icon (top-left)
   - Label (below icon)
   - Value (large, bold)
   - Trend indicator (↑ 12% in green or ↓ 5% in red)
   - Secondary info (e.g., "vs semana pasada")
4. **Section Headers:** "Solicitudes", "Ofertas", "Finanzas", "Proveedores"
5. **Revenue Card:** Dark gradient background for primary financial metric
6. **Click Affordance:** Subtle hover effect on clickable cards

### Prerequisites

- Story 6.1 (Admin Dashboard Shell) provides base layout
- Story 6.6 (Orders Management) for orders data
- Other stories provide data to aggregate

### Relevant Files to Create/Update

| File | Purpose |
|------|---------|
| `src/app/(admin)/dashboard/page.tsx` | Update with full dashboard |
| `src/components/admin/metrics-card.tsx` | Reusable metric card |
| `src/components/admin/dashboard-metrics.tsx` | Metrics sections |
| `src/lib/queries/admin-metrics.ts` | Metric calculation queries |

### References

- [Source: docs/sprint-artifacts/tech-spec-epic-6.md#Story-6.8]
- [Source: docs/epics.md#Story-6.8]
- [Source: docs/ux-mockups/02-admin-dashboard.html] - Section 2
- [Source: docs/ux-audit/admin-flow-requirements.md] - Analytics & Reporting

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
