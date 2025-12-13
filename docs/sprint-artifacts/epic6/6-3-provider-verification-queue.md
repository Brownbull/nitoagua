# Story 6.3: Provider Verification Queue

Status: review

## Story

As an **admin**,
I want **to review and approve/reject provider applications**,
so that **only qualified providers can operate on the platform**.

## Acceptance Criteria

1. **AC6.3.1:** Admin can view queue of pending provider applications
2. **AC6.3.2:** Queue shows count badge of pending applications
3. **AC6.3.3:** Applications sorted by submission date (oldest first)
4. **AC6.3.4:** Clicking application opens detail view with documents
5. **AC6.3.5:** Document viewer supports zoom and download
6. **AC6.3.6:** Admin can approve application (status → 'approved')
7. **AC6.3.7:** Admin can reject application (reason required, status → 'rejected')
8. **AC6.3.8:** Admin can request more info (select missing docs, status → 'more_info_needed')
9. **AC6.3.9:** Action triggers notification to applicant

## Tasks / Subtasks

- [x] **Task 1: Verification Queue Page** (AC: 1, 2, 3)
  - [x] Create `src/app/admin/verification/page.tsx`
  - [x] Add "Verificación" link to sidebar with badge count
  - [x] Query providers WHERE verification_status IN ('pending', 'more_info_needed')
  - [x] Sort by created_at ASC (oldest first)

- [x] **Task 2: Verification Queue Component** (AC: 1, 2, 3)
  - [x] Create `src/components/admin/verification-queue.tsx`
  - [x] Application card: Name, photo, phone, submission date, status badge
  - [x] Count badge in header: "X solicitudes en cola"
  - [x] Empty state: "No hay solicitudes pendientes"

- [x] **Task 3: Application Detail View** (AC: 4)
  - [x] Create `src/app/admin/verification/[id]/page.tsx`
  - [x] Show personal info section
  - [x] Show service area
  - [x] Show bank account info (masked)
  - [x] Internal notes textarea field

- [x] **Task 4: Document Viewer Component** (AC: 5)
  - [x] Create `src/components/admin/document-viewer.tsx`
  - [x] List of documents: Cédula, Licencia, Permiso sanitario, Vehicle photos, Certifications
  - [x] Zoom controls (50%, 100%, 150%, 200%, 250%, 300%)
  - [x] Download button per document
  - [x] Use Supabase Storage signed URLs

- [x] **Task 5: Approval Action** (AC: 6, 9)
  - [x] Create "Aprobar" button with confirmation dialog
  - [x] Update profiles.verification_status = 'approved'
  - [ ] Trigger notification to provider (TODO: notification system in future story)
  - [x] Show success toast

- [x] **Task 6: Rejection Action** (AC: 7, 9)
  - [x] Create "Rechazar" button with reason textarea
  - [x] Reason required validation
  - [x] Update profiles.verification_status = 'rejected'
  - [x] Store rejection reason
  - [ ] Trigger notification with reason (TODO: notification system in future story)

- [x] **Task 7: Request More Info Action** (AC: 8, 9)
  - [x] Create "Más Info" button
  - [x] Checkboxes for missing documents
  - [x] Update profiles.verification_status = 'more_info_needed'
  - [ ] Trigger notification with specific requests (TODO: notification system in future story)

- [x] **Task 8: Testing** (AC: All)
  - [x] E2E test: View verification queue with pending applications
  - [x] E2E test: Open application detail view
  - [x] E2E test: Action buttons visible for pending applications
  - [x] E2E test: Approve flow with confirmation
  - [x] E2E test: Reject requires reason
  - [x] E2E test: Request more info requires doc selection
  - [x] E2E test: Navigation links work (sidebar, dashboard quick action, bottom nav)

## Dev Notes

### Architecture Context

- Provider verification status in `profiles.verification_status`: 'pending', 'approved', 'rejected', 'more_info_needed'
- Documents stored in Supabase Storage bucket `provider-documents`
- Document metadata in `provider_documents` table

### UX Mockups & Design References

**CRITICAL: Review these mockups before implementing UI components**

| Document | Location | Relevant Sections |
|----------|----------|-------------------|
| **Admin Mockups** | [docs/ux-mockups/02-admin-dashboard.html](docs/ux-mockups/02-admin-dashboard.html) | Section 3: Verificación (3A: Queue, 3B: Detail) |
| **Admin Flow Requirements** | [docs/ux-audit/admin-flow-requirements.md](docs/ux-audit/admin-flow-requirements.md) | Section 1.1: Verification Queue |
| **Admin Mockup Updates** | [docs/ux-audit/admin-mockup-updates-2025-12-11.md](docs/ux-audit/admin-mockup-updates-2025-12-11.md) | Component patterns |

**Key UX Guidelines from Mockups:**

1. **Queue Layout:** List with application cards, count badge in header
2. **Application Card:** Avatar, name, phone, date, status badge, chevron
3. **Detail View:** Side-by-side layout - info left, documents right
4. **Document Viewer:** Grid of thumbnails with zoom/download actions
5. **Action Buttons:** "Aprobar" (green), "Rechazar" (red), "Más Info" (outline)
6. **Internal Notes:** Textarea at bottom of detail view

### Prerequisites

- Story 6.1 (Admin Authentication) must be complete
- Story 7.1 (Provider Registration) creates providers to verify

### Relevant Files Created

| File | Purpose |
|------|---------|
| `src/app/admin/verification/page.tsx` | Queue page |
| `src/app/admin/verification/[id]/page.tsx` | Detail page |
| `src/components/admin/verification-queue.tsx` | Queue component |
| `src/components/admin/document-viewer.tsx` | Document viewer |
| `src/components/admin/verification-actions.tsx` | Approve/Reject/More Info actions |
| `src/lib/actions/verification.ts` | Server actions for verification |
| `tests/e2e/admin-verification.spec.ts` | E2E tests |

### Database Migration

Migration `add_provider_verification` applied:
- Added `verification_status` column to profiles (pending/approved/rejected/more_info_needed)
- Added `email`, `internal_notes`, `rejection_reason`, `bank_name`, `bank_account` columns to profiles
- Created `provider_documents` table for document storage
- Added RLS policies for provider documents
- Created indexes for verification queue queries

### References

- [Source: docs/sprint-artifacts/tech-spec-epic-6.md#Story-6.3]
- [Source: docs/architecture.md#Supabase-Storage-Buckets]
- [Source: docs/epics.md#Story-6.3]
- [Source: docs/ux-mockups/02-admin-dashboard.html] - Section 3
- [Source: docs/ux-audit/admin-flow-requirements.md] - Verification Queue

## Dev Agent Record

### Context Reference
- Story context file: `docs/sprint-artifacts/epic6/6-3-provider-verification-queue.context.xml`

### Agent Model Used
- Claude Opus 4.5

### Debug Log References
- Build successful
- E2E tests: 20/20 passed

### Completion Notes List
- AC6.3.9 (notifications) partially implemented - server action logs the decision but actual notification delivery requires the notification system (to be implemented in future story)
- Document viewer requires `provider-documents` Supabase Storage bucket to be created and populated with provider documents
- Empty queue state displayed when no pending providers exist

### File List
- src/app/admin/verification/page.tsx
- src/app/admin/verification/[id]/page.tsx
- src/components/admin/verification-queue.tsx
- src/components/admin/document-viewer.tsx
- src/components/admin/verification-actions.tsx
- src/lib/actions/verification.ts
- tests/e2e/admin-verification.spec.ts
- src/types/database.ts (updated with new columns)
- src/components/admin/admin-sidebar.tsx (enabled verification link)
- src/components/admin/admin-bottom-nav.tsx (added verification link)
- src/app/admin/dashboard/page.tsx (enabled verification quick action)

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-12 | Story drafted from tech spec and epics | SM Agent |
| 2025-12-12 | Added UX mockup references | SM Agent |
| 2025-12-12 | Implementation complete - all tasks done | Dev Agent |
