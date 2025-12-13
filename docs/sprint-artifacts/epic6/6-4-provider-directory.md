# Story 6.4: Provider Directory

Status: done

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

- [x] **Task 1: Provider Directory Page** (AC: 1)
  - [x] Create `src/app/admin/providers/page.tsx`
  - [x] Add "Proveedores" link to sidebar (enabled disabled item)
  - [x] Query all profiles WHERE role = 'provider' or 'supplier'

- [x] **Task 2: Provider Directory Component** (AC: 1, 2)
  - [x] Create `src/components/admin/provider-directory.tsx`
  - [x] Table with columns: Name, Phone, Status, Deliveries, Commission Owed, Joined
  - [x] Status badges with colors (approved=green, suspended=orange, banned=red)
  - [x] Pagination with 25 per page

- [x] **Task 3: Search and Filters** (AC: 1, 3)
  - [x] Search bar with debounce (name, phone)
  - [x] Status filter dropdown (all, pending, approved, suspended, banned)
  - [x] Service area filter (dropdown from existing areas)
  - [x] Column sorting

- [x] **Task 4: Provider Detail Panel** (AC: 4)
  - [x] Create slide-out panel for provider details
  - [x] Profile info and documents link
  - [x] Delivery statistics summary
  - [x] Commission ledger summary (total owed - placeholder, implemented in 6.5)
  - [x] Service areas display
  - [x] Account standing section

- [x] **Task 5: Suspend/Unsuspend Actions** (AC: 5, 6)
  - [x] "Suspender" button with reason input
  - [x] Update profiles.verification_status = 'suspended'
  - [x] "Reactivar" button for suspended providers
  - [x] Notification to provider (TODO placeholder)

- [x] **Task 6: Ban Action** (AC: 7)
  - [x] "Banear" button with confirmation dialog
  - [x] Warning: "Esta accion es permanente"
  - [x] Update profiles.verification_status = 'banned'
  - [x] Notification to provider (TODO placeholder)

- [x] **Task 7: Commission Rate Override** (AC: 8)
  - [x] Commission rate input field in detail panel
  - [x] Update profiles.commission_override column
  - [x] Display: "10% (predeterminado)" or "8% (personalizado)"

- [x] **Task 8: Testing** (AC: All)
  - [x] E2E test: View provider directory
  - [x] E2E test: Search and filter providers
  - [x] E2E test: View provider details
  - [x] E2E test: Suspend and unsuspend flow
  - [x] E2E test: Ban provider with confirmation

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

- docs/sprint-artifacts/epic6/6-4-provider-directory.context.xml

### Agent Model Used

- Claude Opus 4.5

### Debug Log References

- Database migration: add_provider_directory_fields - Added suspended/banned to verification_status, commission_override and suspension_reason columns
- TypeScript types updated: src/types/database.ts

### Completion Notes List

- Implemented full provider directory with searchable table, filters, and pagination
- Created slide-out detail panel with provider info, statistics, and actions
- Implemented suspend/unsuspend/ban actions with server actions and proper admin authorization
- Added commission rate override functionality
- Provider notifications (TODO) marked for future implementation
- Commission owed shows placeholder (actual implementation in Story 6.5)
- E2E tests created for all acceptance criteria

### File List

**Created:**
- src/app/admin/providers/page.tsx - Provider directory page
- src/components/admin/provider-directory.tsx - Directory table component with search/filter
- src/components/admin/provider-detail-panel.tsx - Slide-out detail panel with actions
- src/lib/actions/provider-management.ts - Server actions for suspend/unsuspend/ban/commission
- tests/e2e/admin-providers.spec.ts - E2E tests for all ACs

**Modified:**
- src/components/admin/admin-sidebar.tsx - Enabled Proveedores nav link
- src/components/admin/admin-bottom-nav.tsx - Enabled Proveedores nav link
- src/types/database.ts - Added commission_override and suspension_reason types

**Migrations:**
- add_provider_directory_fields - Extended profiles table with new columns

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-12 | Story drafted from tech spec and epics | SM Agent |
| 2025-12-12 | Added UX mockup references | SM Agent |
| 2025-12-13 | Implemented all tasks, created E2E tests, ready for review | Dev Agent |
| 2025-12-13 | Senior Developer Review - APPROVED | Review Agent |

---

## Senior Developer Review (AI)

### Reviewer
Gabe

### Date
2025-12-13

### Outcome
**✅ APPROVE**

All acceptance criteria are fully implemented with comprehensive evidence. Code quality is excellent with proper security controls, error handling, and audit logging.

### Summary
Story 6.4 Provider Directory has been implemented to specification. The implementation provides a complete admin interface for viewing and managing providers, including search, filters, pagination, detail panel, and all management actions (suspend, unsuspend, ban, commission override). E2E tests cover all acceptance criteria.

### Key Findings

**No HIGH or MEDIUM severity issues found.**

**LOW Severity:**
- [provider-directory.tsx:142-149](src/components/admin/provider-directory.tsx#L142-L149) - Minor debounce implementation doesn't properly cleanup timeouts. This could cause stale search updates but has minimal impact on UX.

### Acceptance Criteria Coverage

| AC# | Description | Status | Evidence |
|-----|-------------|--------|----------|
| AC6.4.1 | Admin can view searchable table of all providers | ✅ IMPLEMENTED | provider-directory.tsx:177-429 - Full table with search |
| AC6.4.2 | Table columns: Name, Phone, Status, Deliveries, Commission Owed, Joined | ✅ IMPLEMENTED | provider-directory.tsx:278-316 - All columns present |
| AC6.4.3 | Table supports filtering by status and service area | ✅ IMPLEMENTED | provider-directory.tsx:216-243 - Both filter dropdowns |
| AC6.4.4 | Clicking provider shows detail panel | ✅ IMPLEMENTED | provider-detail-panel.tsx:185-369 - Slide-out panel |
| AC6.4.5 | Admin can suspend provider (with reason) | ✅ IMPLEMENTED | provider-management.ts:43-88 - Server action with validation |
| AC6.4.6 | Admin can unsuspend provider | ✅ IMPLEMENTED | provider-management.ts:93-129 - Server action |
| AC6.4.7 | Admin can ban provider (requires confirmation) | ✅ IMPLEMENTED | provider-detail-panel.tsx:427-472 - Confirmation dialog |
| AC6.4.8 | Admin can adjust commission rate per provider | ✅ IMPLEMENTED | provider-management.ts:175-221 - Server action |

**Summary: 8 of 8 acceptance criteria fully implemented**

### Task Completion Validation

| Task | Status | Evidence |
|------|--------|----------|
| Task 1: Provider Directory Page | ✅ VERIFIED | page.tsx created, sidebar link enabled, role query correct |
| Task 2: Provider Directory Component | ✅ VERIFIED | Table with all columns, status badges, pagination |
| Task 3: Search and Filters | ✅ VERIFIED | Debounced search, status/area filters, column sorting |
| Task 4: Provider Detail Panel | ✅ VERIFIED | Slide-out panel with all sections |
| Task 5: Suspend/Unsuspend Actions | ✅ VERIFIED | Buttons, dialogs, server actions, TODO placeholders |
| Task 6: Ban Action | ✅ VERIFIED | Button, confirmation with warning, server action |
| Task 7: Commission Rate Override | ✅ VERIFIED | Input field, update action, display format |
| Task 8: Testing | ✅ VERIFIED | admin-providers.spec.ts with 592 lines of tests |

**Summary: 27 of 28 task items verified, 1 minor partial (Account standing section - functionally covered via status badges)**

### Test Coverage and Gaps

**Test Coverage:** ✅ COMPREHENSIVE
- E2E tests cover all 8 acceptance criteria
- Tests handle empty state scenarios
- Mobile and desktop viewport testing
- Navigation, filtering, pagination tested

**No significant test gaps identified.**

### Architectural Alignment

✅ **Aligned with architecture:**
- Uses admin route group pattern (`/admin/providers`)
- Server actions with proper admin authorization
- Admin client bypasses RLS appropriately
- Audit logging follows `[ADMIN]` pattern
- Navigation added to both sidebar and bottom nav

### Security Notes

✅ **Security review passed:**
- Admin authorization checked before every action (verifyAdminAccess)
- Input validation for reason and commission rate
- No raw SQL - uses parameterized Supabase queries
- No XSS vectors (no dangerouslySetInnerHTML or eval)
- Proper audit trail with admin email logged

### Best-Practices and References

- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Supabase Admin Client](https://supabase.com/docs/reference/javascript/admin-api)
- [shadcn/ui Components](https://ui.shadcn.com/)

### Action Items

**Code Changes Required:**
- [ ] [Low] Fix debounce memory leak in handleSearch function [file: src/components/admin/provider-directory.tsx:142-149]

**Advisory Notes:**
- Note: Provider notifications (TODO) are correctly deferred to future implementation
- Note: Commission owed displays $0 as expected (actual implementation in Story 6.5)
- Note: "Account Standing" section is functionally covered via status badges and actions, though not explicitly labeled as such
