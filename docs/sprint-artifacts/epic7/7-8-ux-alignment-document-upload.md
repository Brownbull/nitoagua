# Story 7.8: UX Alignment - Document Upload Screen

| Field | Value |
|-------|-------|
| **Story ID** | 7-8 |
| **Epic** | Epic 7: Provider Onboarding |
| **Title** | UX Alignment - Document Upload Screen |
| **Status** | done |
| **Priority** | P2 (Medium) |
| **Points** | 3 |
| **Sprint** | TBD |

---

## User Story

As a **provider uploading documents**,
I want **the document step to match the UX mockups**,
So that **I see the correct document requirements per the approved design**.

---

## Background

The current implementation differs from the UX mockups (Section 13.3):
- Missing "Licencia de conducir" document type
- "Permiso sanitario" is required (should be optional per mockup)
- Document card styling differs

This story aligns the document upload step with the approved UX design.

**Note:** The 6-step flow established in Story 7-7 is: Personal → Documentos → Vehículo → Áreas → Banco → Revisión

---

## Acceptance Criteria

1. **AC7.8.1**: Progress shows "Paso 2 de 6" with document step active
2. **AC7.8.2**: Document list shows 4 document types with icons:
   - Cédula de identidad (required) - ID card icon
   - Licencia de conducir (required if motorized) - license icon
   - Fotos del vehículo (required) - vehicle icon
   - Permiso sanitario (optional - dashed border) - document icon
3. **AC7.8.3**: Each document shows upload status (✓ Subido / Pendiente)
4. **AC7.8.4**: Each document shows "Cambiar" or "Subir" button based on status
5. **AC7.8.5**: Optional documents have dashed border styling
6. **AC7.8.6**: Info box: "Documentos seguros - Tus documentos están protegidos..."
7. **AC7.8.7**: Continue button disabled until required docs uploaded
8. **AC7.8.8**: Continue button enabled when optional docs skipped

---

## Tasks / Subtasks

- [x] **Task 1: Add License Document Type** ✅
  - [x] Add `licencia_conducir` to document types enum
  - [x] Update database constraint (migration created)
  - [x] Add to REQUIRED_DOCUMENTS array
  - [x] Create migration for new document type

- [x] **Task 2: Make Permiso Sanitario Optional** ✅
  - [x] Move `permiso_sanitario` from REQUIRED to OPTIONAL array
  - [x] Update form validation
  - [x] Update styling for optional documents (dashed border)

- [x] **Task 3: Update Document Cards Styling** ✅
  - [x] Add icons for each document type
  - [x] Add upload status badge (✓ Subido / Pendiente)
  - [x] Update button text (Subir → Cambiar after upload)
  - [x] Style optional docs with dashed border

- [x] **Task 4: Update Progress Indicator** ✅
  - [x] Show "Paso 2 de 6" for documents step (6-step flow from Story 7-7)
  - [x] Integrate with progress indicator component

- [x] **Task 5: Update Info Box** ✅
  - [x] Add security info box below documents
  - [x] Match mockup copy and styling

- [x] **Task 6: Update E2E Tests** ✅
  - [x] Add tests for license document
  - [x] Update tests for optional permiso sanitario
  - [x] Test continue button enable/disable logic

---

## Technical Notes

### Document Types (Updated)

```typescript
export const REQUIRED_DOCUMENTS = [
  "cedula",
  "licencia_conducir", // NEW
  "vehiculo",
] as const;

export const OPTIONAL_DOCUMENTS = [
  "permiso_sanitario", // MOVED from required
  "certificacion",
] as const;
```

### Migration

```sql
-- Add license document type to enum
ALTER TYPE document_type ADD VALUE IF NOT EXISTS 'licencia_conducir';
```

### Files to Modify
- `src/lib/validations/provider-registration.ts`
- `src/components/provider/onboarding/documents-form.tsx`
- `src/app/provider/onboarding/documents/page.tsx`
- `tests/e2e/provider-registration.spec.ts`

### Mockup Reference
`docs/ux-mockups/01-consolidated-provider-flow.html` Section 13.3

---

## Dependencies

- **Requires:** Story 7.7 (progress indicator component)
- **Enables:** Story 7.9 (vehicle information)

---

## File List

| Action | File |
|--------|------|
| Modify | src/lib/validations/provider-registration.ts |
| Modify | src/components/provider/onboarding/document-upload.tsx |
| Modify | src/components/provider/onboarding/review-summary.tsx |
| Modify | src/components/supplier/document-list.tsx |
| Modify | src/hooks/use-onboarding-progress.ts |
| Create | supabase/migrations/20251216100000_add_licencia_conducir_document_type.sql |
| Modify | tests/e2e/provider-registration.spec.ts |

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-15 | Story created for UX alignment | Claude |
| 2025-12-16 | Implementation complete - All 6 tasks done | Claude |
| 2025-12-16 | **APPROVED** - Senior Dev Review passed, all 8 ACs verified | Claude |

---

## Senior Developer Review

**Date:** 2025-12-16
**Reviewer:** Claude (Senior Dev Agent)
**Verdict:** ✅ **APPROVED**

### AC Verification

| AC | Status | Evidence |
|----|--------|----------|
| AC7.8.1 | ✅ | Progress shows "Paso 2 de 6" - `document-upload.tsx:259` |
| AC7.8.2 | ✅ | 4 document types displayed with correct icons |
| AC7.8.3 | ✅ | Status shows "✓ Subido" / description |
| AC7.8.4 | ✅ | Button text changes "Subir" → "Cambiar" |
| AC7.8.5 | ✅ | Optional docs have dashed border styling |
| AC7.8.6 | ✅ | Info box shows "Documentos seguros" message |
| AC7.8.7 | ✅ | Continue disabled until 3 required docs uploaded |
| AC7.8.8 | ✅ | Continue enabled even if optional skipped |

### Test Results

- **Build:** ✅ Passes
- **E2E Tests:** ✅ 81/81 pass
- **Story 7-8 Tests:** ✅ 4 dedicated tests pass

### Notes

Implementation correctly aligns Document Upload screen with UX mockup Section 13.3. The 6-step flow established in Story 7-7 is properly propagated.
