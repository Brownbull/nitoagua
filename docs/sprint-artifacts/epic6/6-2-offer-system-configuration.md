# Story 6.2: Offer System Configuration

Status: ready-for-dev

## Story

As an **admin**,
I want **to configure offer validity and request timeout settings**,
so that **the marketplace operates with appropriate time constraints**.

## Acceptance Criteria

1. **AC6.2.1:** Admin can navigate to "Configuración" from sidebar
2. **AC6.2.2:** Settings page shows offer validity fields: default, min, max (in minutes)
3. **AC6.2.3:** Settings page shows request timeout field (in hours)
4. **AC6.2.4:** Changes require confirmation before saving
5. **AC6.2.5:** Changes take effect immediately for new offers
6. **AC6.2.6:** Invalid values show validation error (min > 0, max >= default >= min)

## Tasks / Subtasks

- [ ] **Task 1: Settings Page Route** (AC: 1)
  - [ ] Create `src/app/(admin)/settings/page.tsx`
  - [ ] Add "Configuración" link to admin sidebar
  - [ ] Verify auth guard protects route

- [ ] **Task 2: Settings Form Component** (AC: 2, 3)
  - [ ] Create `src/components/admin/settings-form.tsx`
  - [ ] Offer Validity section with three inputs (default, min, max)
  - [ ] Request Timeout section with hours input
  - [ ] Preview text showing current configuration

- [ ] **Task 3: Validation Logic** (AC: 6)
  - [ ] Create Zod schema for settings validation
  - [ ] min > 0 validation
  - [ ] max >= default >= min validation
  - [ ] Timeout hours > 0 validation
  - [ ] Display validation errors inline

- [ ] **Task 4: Confirmation Dialog** (AC: 4)
  - [ ] Create confirmation modal before saving
  - [ ] Show what's changing
  - [ ] Cancel and Confirm buttons

- [ ] **Task 5: Server Action for Settings** (AC: 5)
  - [ ] Create `src/lib/actions/admin.ts` with `updateSettings()` action
  - [ ] Update `admin_settings` table for each setting key
  - [ ] Log change with admin user and timestamp
  - [ ] Return success/error response

- [ ] **Task 6: Load Current Settings** (AC: 2, 3)
  - [ ] Query `admin_settings` on page load
  - [ ] Pre-fill form with current values
  - [ ] Handle missing settings (use defaults)

- [ ] **Task 7: Testing** (AC: All)
  - [ ] E2E test: Navigate to settings from sidebar
  - [ ] E2E test: Update settings with valid values
  - [ ] E2E test: Validation errors for invalid values
  - [ ] E2E test: Confirmation dialog appears

## Dev Notes

### Architecture Context

- Settings stored in `admin_settings` table as key-value pairs with JSONB values
- Keys: `offer_validity_default`, `offer_validity_min`, `offer_validity_max`, `request_timeout_hours`
- Default values defined in architecture: default=30, min=15, max=120, timeout=4

### UX Mockups & Design References

**CRITICAL: Review these mockups before implementing UI components**

| Document | Location | Relevant Sections |
|----------|----------|-------------------|
| **Admin Mockups** | [docs/ux-mockups/02-admin-dashboard.html](docs/ux-mockups/02-admin-dashboard.html) | Section 11: Config (Configuración) |
| **Admin Flow Requirements** | [docs/ux-audit/admin-flow-requirements.md](docs/ux-audit/admin-flow-requirements.md) | Section 6: System Configuration |
| **Admin Mockup Updates** | [docs/ux-audit/admin-mockup-updates-2025-12-11.md](docs/ux-audit/admin-mockup-updates-2025-12-11.md) | Section 11: System Settings |

**Key UX Guidelines from Mockups:**

1. **Settings Layout:** Settings rows with label + description + value chip pattern
2. **Input Style:** Numeric inputs with unit labels (minutes, hours)
3. **Section Headers:** Clear section titles (e.g., "Configuración de Ofertas")
4. **Validation:** Inline error messages below inputs
5. **Action Buttons:** Primary dark button for "Guardar Cambios"

### Relevant Files to Create

| File | Purpose |
|------|---------|
| `src/app/(admin)/settings/page.tsx` | Settings page |
| `src/components/admin/settings-form.tsx` | Form component |
| `src/lib/actions/admin.ts` | Admin server actions |
| `src/lib/validations/admin.ts` | Zod schemas for admin inputs |

### Prerequisites

- Story 6.1 (Admin Authentication) must be complete

### References

- [Source: docs/sprint-artifacts/tech-spec-epic-6.md#Story-6.2]
- [Source: docs/architecture.md#Default-Admin-Settings]
- [Source: docs/epics.md#Story-6.2]
- [Source: docs/ux-mockups/02-admin-dashboard.html] - Section 11
- [Source: docs/ux-audit/admin-flow-requirements.md] - System Configuration

## Dev Agent Record

### Context Reference

- [6-2-offer-system-configuration.context.xml](./6-2-offer-system-configuration.context.xml)

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
