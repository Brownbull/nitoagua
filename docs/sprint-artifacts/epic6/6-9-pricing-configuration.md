# Story 6.9: Pricing Configuration

| Field | Value |
|-------|-------|
| **Story ID** | 6-9 |
| **Epic** | Epic 6: Admin Operations Panel |
| **Title** | Pricing Configuration |
| **Status** | done |
| **Priority** | P1 (High) |
| **Points** | 3 |
| **Sprint** | TBD |

---

## User Story

As an **admin**,
I want **to configure platform-wide water prices and commission rates**,
So that **pricing is consistent across all providers and the platform earns sustainable commission**.

---

## Acceptance Criteria

1. **AC6.9.1:** Admin can navigate to pricing configuration from admin sidebar/bottom nav
2. **AC6.9.2:** Pricing form displays 4 water tier price inputs (100L, 1000L, 5000L, 10000L) in CLP
3. **AC6.9.3:** Urgency surcharge input displays as percentage (default: 10%)
4. **AC6.9.4:** Platform commission input displays as percentage (default: 10%)
5. **AC6.9.5:** Commission preview shows example calculation (e.g., "En un pedido de $20,000, la plataforma gana $3,000")
6. **AC6.9.6:** All inputs require positive integers/valid percentages
7. **AC6.9.7:** Changes require confirmation dialog before saving
8. **AC6.9.8:** Changes take effect immediately for new requests
9. **AC6.9.9:** Success toast confirms "Precios actualizados"

---

## Tasks

- [x] **Task 1: Add Pricing Route to Navigation** (AC: 1)
  - [x] Add "Precios" item to admin sidebar (`src/components/admin/admin-sidebar.tsx`)
  - [x] Add "Precios" item to admin bottom nav (`src/components/admin/admin-bottom-nav.tsx`) - N/A: Uses 5-slot layout with hamburger menu
  - [x] Icon: CreditCard from lucide-react

- [x] **Task 2: Create Pricing Page** (AC: 1, 2, 3, 4)
  - [x] Create `src/app/admin/pricing/page.tsx`
  - [x] Use `requireAdmin()` guard
  - [x] Load current settings via `getPricingSettings()` action
  - [x] Render `PricingForm` component

- [x] **Task 3: Create Pricing Form Component** (AC: 2, 3, 4, 5)
  - [x] Create `src/components/admin/pricing-form.tsx`
  - [x] Water tier section with 4 price inputs (100L, 1000L, 5000L, 10000L)
  - [x] Urgency surcharge section with percentage input
  - [x] Commission section with percentage input
  - [x] Commission preview calculation (updates live)
  - [x] Use react-hook-form with Zod resolver

- [x] **Task 4: Create Pricing Validation Schema** (AC: 6)
  - [x] Add to `src/lib/validations/admin.ts`:
    - `price_100l`: positive integer
    - `price_1000l`: positive integer
    - `price_5000l`: positive integer
    - `price_10000l`: positive integer
    - `urgency_surcharge_percent`: integer 0-100
    - `default_commission_percent`: integer 1-100
  - [x] Add default values for pricing settings

- [x] **Task 5: Implement Confirmation Dialog** (AC: 7)
  - [x] Use AlertDialog from shadcn/ui
  - [x] Show before/after comparison for changed values
  - [x] "Confirmar Cambios" / "Cancelar" buttons

- [x] **Task 6: Create Pricing Server Actions** (AC: 8, 9)
  - [x] Add `getPricingSettings()` to `src/lib/actions/admin.ts`
  - [x] Add `updatePricingSettings()` to `src/lib/actions/admin.ts`
  - [x] Store in `admin_settings` table with keys:
    - `price_100l`, `price_1000l`, `price_5000l`, `price_10000l`
    - `urgency_surcharge_percent`
    - `default_commission_percent`
  - [x] Log changes with timestamp

- [x] **Task 7: Create E2E Tests** (All ACs)
  - [x] Create `tests/e2e/admin-pricing.spec.ts`
  - [x] Test: Admin can navigate to pricing page
  - [x] Test: Form loads with current values
  - [x] Test: Price inputs accept valid positive integers
  - [x] Test: Price inputs reject negative/non-integer values
  - [x] Test: Commission preview updates dynamically
  - [x] Test: Confirmation dialog appears on save
  - [x] Test: Settings persist after save
  - [x] Test: Success toast displays

---

## Technical Notes

### Database Schema

Settings stored in `admin_settings` table (already exists):

```sql
-- Keys for pricing configuration
INSERT INTO admin_settings (key, value) VALUES
  ('price_100l', '{"value": 5000}'),
  ('price_1000l', '{"value": 20000}'),
  ('price_5000l', '{"value": 75000}'),
  ('price_10000l', '{"value": 140000}'),
  ('urgency_surcharge_percent', '{"value": 10}'),
  ('default_commission_percent', '{"value": 10}');
```

### Default Values (from mockups)

| Setting | Default Value | Unit |
|---------|---------------|------|
| price_100l | 5,000 | CLP |
| price_1000l | 20,000 | CLP |
| price_5000l | 75,000 | CLP |
| price_10000l | 140,000 | CLP |
| urgency_surcharge_percent | 10 | % |
| default_commission_percent | 10-15 | % |

### TypeScript Types

```typescript
// src/lib/validations/admin.ts
export const pricingSettingsSchema = z.object({
  price_100l: z.number().int().positive("El precio debe ser mayor a 0"),
  price_1000l: z.number().int().positive("El precio debe ser mayor a 0"),
  price_5000l: z.number().int().positive("El precio debe ser mayor a 0"),
  price_10000l: z.number().int().positive("El precio debe ser mayor a 0"),
  urgency_surcharge_percent: z.number().int().min(0).max(100),
  default_commission_percent: z.number().int().min(1).max(100),
});

export type PricingSettings = z.infer<typeof pricingSettingsSchema>;

export const defaultPricingSettings: PricingSettings = {
  price_100l: 5000,
  price_1000l: 20000,
  price_5000l: 75000,
  price_10000l: 140000,
  urgency_surcharge_percent: 10,
  default_commission_percent: 10,
};
```

### Commission Preview Logic

```typescript
// Calculate preview: "En un pedido de $20,000, la plataforma gana $3,000"
const exampleAmount = price_1000l; // Use 1000L as example
const commissionAmount = Math.round(exampleAmount * default_commission_percent / 100);
const previewText = `En un pedido de ${formatCLP(exampleAmount)}, la plataforma gana ${formatCLP(commissionAmount)}`;
```

### Component Structure

```
src/
├── app/admin/pricing/
│   └── page.tsx              # Pricing configuration page
├── components/admin/
│   └── pricing-form.tsx      # Pricing form with all sections
└── lib/
    ├── actions/admin.ts      # Add getPricingSettings, updatePricingSettings
    └── validations/admin.ts  # Add pricingSettingsSchema
```

---

## UX Mockup Reference

**Mockup:** `docs/ux-mockups/02-admin-dashboard.html` - Section 5 (5A: Configuracion de Precios)

Key design elements:
- Water pricing section with tier labels (100L, 1000L, 5000L, 10000L)
- Price inputs with "$" prefix and "CLP" suffix
- Urgency surcharge section with "%" suffix
- Commission section with "%" suffix and example calculation
- Gray info box showing commission preview
- "Guardar Cambios" primary button

---

## Dependencies

- **Requires:** Story 6.1 (Admin Authentication) - Admin must be authenticated
- **Requires:** Story 6.2 (Offer System Configuration) - Establishes settings pattern
- **Used by:** Epic 8 (Provider Offer System) - Offers use platform pricing
- **Used by:** Epic 9 (Consumer Offer Selection) - Consumers see prices
- **Used by:** Epic 10 Story 10.4 (Urgency Pricing Display) - Uses urgency surcharge

---

## FR Coverage

| FR | Description | Coverage |
|----|-------------|----------|
| FR87 | Admins can set platform-wide water prices per tier | AC 2 |
| FR88 | Admins can configure urgency surcharge percentage | AC 3 |
| FR92 | Price changes take effect immediately for new requests | AC 8 |

---

## File List

| Action | File |
|--------|------|
| Created | `src/app/admin/pricing/page.tsx` |
| Created | `src/components/admin/pricing-form.tsx` |
| Modified | `src/components/admin/admin-sidebar.tsx` |
| Modified | `src/lib/validations/admin.ts` |
| Modified | `src/lib/actions/admin.ts` |
| Created | `tests/e2e/admin-pricing.spec.ts` |

---

## Dev Agent Record

### Debug Log

- **2025-12-14**: Started story implementation
- Found most implementation already completed (Tasks 1-6 were pre-implemented)
- Only Task 7 (E2E Tests) needed to be created
- Created comprehensive E2E test suite with 19 tests covering all ACs
- Fixed 2 test issues (strict mode violation for text match, dynamic value comparison)
- All 19 admin-pricing tests pass
- Build successful

### Completion Notes

- All pricing configuration functionality was already implemented in prior work
- Added comprehensive E2E test coverage:
  - AC6.9.1: Navigation test (sidebar desktop)
  - AC6.9.2-4: Form input visibility tests
  - AC6.9.5: Commission preview calculation tests
  - AC6.9.6: Validation tests (positive integers, percentage ranges)
  - AC6.9.7: Confirmation dialog test
  - AC6.9.8: Persistence test (values saved to database)
  - AC6.9.9: Success toast test
- Bottom nav: Pricing accessible via sidebar only (bottom nav uses hamburger menu pattern)

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-12 | Story created from UX mockups and PRD V2 | Dev Agent |
| 2025-12-14 | Story implementation completed (all ACs verified via E2E tests) | Dev Agent |
| 2025-12-14 | Senior Developer Review notes appended - APPROVED | Gabe |

---

## Senior Developer Review (AI)

### Reviewer
Gabe

### Date
2025-12-14

### Outcome
**APPROVE**

All acceptance criteria implemented, all tasks verified complete, comprehensive test coverage, no blocking issues.

---

### Summary

Story 6.9 (Pricing Configuration) implements a fully functional admin pricing configuration page that allows platform administrators to set water prices, urgency surcharges, and commission rates. The implementation follows established patterns from previous admin stories (6.2, 6.8) and includes robust validation, confirmation dialogs, and real-time preview functionality.

---

### Key Findings

#### HIGH Severity Issues
*None found*

#### MEDIUM Severity Issues
*None found*

#### LOW Severity Issues

| Issue | Location | Description |
|-------|----------|-------------|
| Documentation mismatch | Story AC6.9.4 vs `admin.ts:118` | Story specifies default commission as 10%, but code uses 15%. Both are valid business values - clarify with stakeholder if change needed. |
| Unused import | `pricing-form.tsx:4` | `useEffect` is imported but not used. Minor cleanup opportunity. |

---

### Acceptance Criteria Coverage

| AC# | Description | Status | Evidence |
|-----|-------------|--------|----------|
| AC6.9.1 | Admin can navigate to pricing from sidebar | IMPLEMENTED | `admin-sidebar.tsx:49-54` |
| AC6.9.2 | 4 water tier price inputs (100L, 1000L, 5000L, 10000L) in CLP | IMPLEMENTED | `pricing-form.tsx:113-191` |
| AC6.9.3 | Urgency surcharge input as percentage | IMPLEMENTED | `pricing-form.tsx:195-225` |
| AC6.9.4 | Platform commission input as percentage | IMPLEMENTED | `pricing-form.tsx:227-263` |
| AC6.9.5 | Commission preview with example calculation | IMPLEMENTED | `pricing-form.tsx:255-262` |
| AC6.9.6 | Positive integers/valid percentages validation | IMPLEMENTED | `admin.ts:75-102` |
| AC6.9.7 | Confirmation dialog before saving | IMPLEMENTED | `pricing-form.tsx:286-303` |
| AC6.9.8 | Changes take effect immediately | IMPLEMENTED | `admin.ts:301-429` |
| AC6.9.9 | Success toast "Precios actualizados" | IMPLEMENTED | `pricing-form.tsx:77` |

**Summary: 9 of 9 acceptance criteria fully implemented**

---

### Task Completion Validation

| Task | Marked As | Verified As | Evidence |
|------|-----------|-------------|----------|
| Task 1: Add Pricing Route to Navigation | Complete | VERIFIED | `admin-sidebar.tsx:49-54` - CreditCard icon, href="/admin/pricing" |
| Task 2: Create Pricing Page | Complete | VERIFIED | `src/app/admin/pricing/page.tsx` - requireAdmin guard, getPricingSettings |
| Task 3: Create Pricing Form Component | Complete | VERIFIED | `pricing-form.tsx` - react-hook-form, Zod, 4 tiers, preview |
| Task 4: Create Pricing Validation Schema | Complete | VERIFIED | `admin.ts:75-119` - pricingSettingsSchema with all fields |
| Task 5: Implement Confirmation Dialog | Complete | VERIFIED | `pricing-form.tsx:286-303` - AlertDialog |
| Task 6: Create Pricing Server Actions | Complete | VERIFIED | `admin.ts:223-430` - get/update with logging |
| Task 7: Create E2E Tests | Complete | VERIFIED | `admin-pricing.spec.ts` - 19 tests covering all ACs |

**Summary: 7 of 7 completed tasks verified, 0 questionable, 0 false completions**

---

### Test Coverage and Gaps

**E2E Test Coverage:**
- `tests/e2e/admin-pricing.spec.ts` - 19 tests
- All 9 ACs have corresponding test cases
- Tests cover: navigation, form inputs, validation, preview, dialog, persistence, toast

**Test Quality:**
- Proper test setup with admin login beforeEach
- Tests clean up after themselves (restore original values)
- Uses data-testid attributes for reliable selectors
- Appropriate timeouts and wait conditions

**Gaps:**
- None identified - comprehensive coverage for a configuration page

---

### Architectural Alignment

| Check | Status | Notes |
|-------|--------|-------|
| Uses requireAdmin() guard | PASS | `page.tsx:13` |
| Uses admin_settings table | PASS | Follows pattern from Story 6.2 |
| Uses server actions | PASS | `getPricingSettings`, `updatePricingSettings` |
| Desktop-first admin layout | PASS | Page structure matches other admin pages |
| Gray theme | PASS | Uses gray gradient header, neutral styling |

**Note:** Story 6.9 is not defined in the Epic 6 Tech Spec (which only covers Stories 6.1-6.8). This is likely a late addition based on UX mockups. The implementation correctly follows established patterns.

---

### Security Notes

| Check | Status |
|-------|--------|
| Admin authentication required | PASS |
| Server-side validation | PASS |
| Admin allowlist verification | PASS |
| No client-side secrets | PASS |
| Input sanitization | PASS |

---

### Best-Practices and References

- **React Hook Form**: https://react-hook-form.com/get-started
- **Zod Validation**: https://zod.dev/
- **shadcn/ui AlertDialog**: https://ui.shadcn.com/docs/components/alert-dialog
- **Sonner Toast**: https://sonner.emilkowal.ski/

---

### Action Items

**Code Changes Required:**
*None required - approved for merge*

**Advisory Notes:**
- Note: Consider updating story documentation AC6.9.4 to reflect actual default commission of 15% (or change code if 10% is correct business value)
- Note: Optional cleanup - remove unused `useEffect` import from `pricing-form.tsx:4`
- Note: Story 6.9 should be added to Epic 6 Tech Spec for documentation completeness

