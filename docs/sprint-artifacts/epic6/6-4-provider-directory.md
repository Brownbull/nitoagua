# Story 6.4: Provider Directory

Status: ready-for-dev

## Story

As an **admin**,
I want **to view and manage all providers**,
so that **I can handle suspensions, status changes, and support issues**.

## Acceptance Criteria

1. **AC6.4.1:** Admin can view searchable table of all providers
2. **AC6.4.2:** Table columns: Name, Phone, Status, Deliveries, Commission Owed, Joined
3. **AC6.4.3:** Table supports filtering by status and service area
4. **AC6.4.4:** Clicking provider shows detail panel
5. **AC6.4.5:** Admin can suspend provider (with reason)
6. **AC6.4.6:** Admin can unsuspend provider
7. **AC6.4.7:** Admin can ban provider (requires confirmation)
8. **AC6.4.8:** Admin can adjust commission rate per provider

## Tasks / Subtasks

- [ ] **Task 1: Provider Directory Page** (AC: 1)
  - [ ] Create `src/app/(admin)/providers/page.tsx`
  - [ ] Add "Proveedores" link to sidebar
  - [ ] Query all profiles WHERE role = 'provider'

- [ ] **Task 2: Provider Directory Component** (AC: 1, 2)
  - [ ] Create `src/components/admin/provider-directory.tsx`
  - [ ] Table with columns: Name, Phone, Status, Deliveries, Commission Owed, Joined
  - [ ] Status badges with colors (approved=green, suspended=orange, banned=red)
  - [ ] Pagination with 25 per page

- [ ] **Task 3: Search and Filters** (AC: 1, 3)
  - [ ] Search bar with debounce (name, phone)
  - [ ] Status filter dropdown (all, pending, approved, suspended, banned)
  - [ ] Service area filter (multi-select comunas)
  - [ ] Column sorting

- [ ] **Task 4: Provider Detail Panel** (AC: 4)
  - [ ] Create slide-out panel or modal for provider details
  - [ ] Profile info and documents link
  - [ ] Delivery statistics summary
  - [ ] Commission ledger summary (total owed)
  - [ ] Service areas list
  - [ ] Account standing section

- [ ] **Task 5: Suspend/Unsuspend Actions** (AC: 5, 6)
  - [ ] "Suspender" button with reason input and duration
  - [ ] Update profiles.verification_status = 'suspended'
  - [ ] "Reactivar" button for suspended providers
  - [ ] Trigger notification to provider

- [ ] **Task 6: Ban Action** (AC: 7)
  - [ ] "Banear" button with confirmation dialog
  - [ ] Warning: "Esta acción es permanente"
  - [ ] Update profiles.verification_status = 'banned'
  - [ ] Trigger notification to provider

- [ ] **Task 7: Commission Rate Override** (AC: 8)
  - [ ] Commission rate input field in detail panel
  - [ ] Update profiles.commission_override column
  - [ ] Display: "10% (predeterminado)" or "8% (personalizado)"

- [ ] **Task 8: Testing** (AC: All)
  - [ ] E2E test: View provider directory
  - [ ] E2E test: Search and filter providers
  - [ ] E2E test: View provider details
  - [ ] E2E test: Suspend and unsuspend flow
  - [ ] E2E test: Ban provider with confirmation

## Dev Notes

### Architecture Context

- Provider status in `profiles.verification_status`
- Commission override in `profiles.commission_override` (NULL = use default)
- Default commission rate from `admin_settings`
- Delivery count aggregated from completed `water_requests`

### UX Mockups & Design References

**CRITICAL: Review these mockups before implementing UI components**

| Document | Location | Relevant Sections |
|----------|----------|-------------------|
| **Admin Mockups** | [docs/ux-mockups/02-admin-dashboard.html](docs/ux-mockups/02-admin-dashboard.html) | Section 4: Proveedores (Directory) |
| **Admin Flow Requirements** | [docs/ux-audit/admin-flow-requirements.md](docs/ux-audit/admin-flow-requirements.md) | Section 1.2: Provider Directory |
| **Admin Mockup Updates** | [docs/ux-audit/admin-mockup-updates-2025-12-11.md](docs/ux-audit/admin-mockup-updates-2025-12-11.md) | Component patterns |

**Key UX Guidelines from Mockups:**

1. **Table Layout:** Dense data table with sortable columns
2. **Status Badges:** Color-coded (green=active, orange=suspended, red=banned)
3. **Search Bar:** Full-width with icon, placeholder "Buscar por nombre o teléfono"
4. **Filters:** Dropdown chips for status and service area
5. **Detail Panel:** Slide-out from right side
6. **Action Buttons:** "Suspender" (orange), "Banear" (red danger), "Reactivar" (green)

### Prerequisites

- Story 6.1 (Admin Authentication) must be complete
- Story 6.3 (Verification Queue) for context

### Relevant Files to Create

| File | Purpose |
|------|---------|
| `src/app/(admin)/providers/page.tsx` | Directory page |
| `src/components/admin/provider-directory.tsx` | Table component |
| `src/components/admin/provider-detail-panel.tsx` | Detail panel |

### References

- [Source: docs/sprint-artifacts/tech-spec-epic-6.md#Story-6.4]
- [Source: docs/epics.md#Story-6.4]
- [Source: docs/ux-mockups/02-admin-dashboard.html] - Section 4
- [Source: docs/ux-audit/admin-flow-requirements.md] - Provider Directory

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
