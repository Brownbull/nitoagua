# Story 6.3: Provider Verification Queue

Status: ready-for-dev

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

- [ ] **Task 1: Verification Queue Page** (AC: 1, 2, 3)
  - [ ] Create `src/app/(admin)/providers/verification/page.tsx`
  - [ ] Add "Verificación" link to sidebar with badge count
  - [ ] Query providers WHERE verification_status = 'pending'
  - [ ] Sort by created_at ASC (oldest first)

- [ ] **Task 2: Verification Queue Component** (AC: 1, 2, 3)
  - [ ] Create `src/components/admin/verification-queue.tsx`
  - [ ] Application card: Name, photo, phone, submission date, status badge
  - [ ] Count badge in header: "5 pendientes"
  - [ ] Empty state: "No hay solicitudes pendientes"

- [ ] **Task 3: Application Detail View** (AC: 4)
  - [ ] Create `src/app/(admin)/providers/verification/[id]/page.tsx`
  - [ ] Show personal info section
  - [ ] Show service areas selected
  - [ ] Show bank account info (masked)
  - [ ] Internal notes textarea field

- [ ] **Task 4: Document Viewer Component** (AC: 5)
  - [ ] Create `src/components/admin/document-viewer.tsx`
  - [ ] List of documents: Cédula, Permiso sanitario, Vehicle photos, Certifications
  - [ ] Zoom controls (fit, 100%, 200%)
  - [ ] Download button per document
  - [ ] Use Supabase Storage signed URLs

- [ ] **Task 5: Approval Action** (AC: 6, 9)
  - [ ] Create "Aprobar" button with confirmation dialog
  - [ ] Update profiles.verification_status = 'approved'
  - [ ] Trigger notification to provider (email + in-app)
  - [ ] Show success toast

- [ ] **Task 6: Rejection Action** (AC: 7, 9)
  - [ ] Create "Rechazar" button with reason dropdown
  - [ ] Reason required: Select from predefined list
  - [ ] Update profiles.verification_status = 'rejected'
  - [ ] Store rejection reason
  - [ ] Trigger notification with reason

- [ ] **Task 7: Request More Info Action** (AC: 8, 9)
  - [ ] Create "Solicitar Info" button
  - [ ] Checkboxes for missing documents
  - [ ] Update profiles.verification_status = 'more_info_needed'
  - [ ] Trigger notification with specific requests

- [ ] **Task 8: Testing** (AC: All)
  - [ ] E2E test: View verification queue with pending applications
  - [ ] E2E test: Open application detail view
  - [ ] E2E test: Approve application flow
  - [ ] E2E test: Reject application with reason
  - [ ] E2E test: Request more info flow

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

### Relevant Files to Create

| File | Purpose |
|------|---------|
| `src/app/(admin)/providers/verification/page.tsx` | Queue page |
| `src/app/(admin)/providers/verification/[id]/page.tsx` | Detail page |
| `src/components/admin/verification-queue.tsx` | Queue component |
| `src/components/admin/document-viewer.tsx` | Document viewer |

### References

- [Source: docs/sprint-artifacts/tech-spec-epic-6.md#Story-6.3]
- [Source: docs/architecture.md#Supabase-Storage-Buckets]
- [Source: docs/epics.md#Story-6.3]
- [Source: docs/ux-mockups/02-admin-dashboard.html] - Section 3
- [Source: docs/ux-audit/admin-flow-requirements.md] - Verification Queue

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
