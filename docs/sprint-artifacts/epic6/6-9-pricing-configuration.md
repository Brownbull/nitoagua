# Story 6.9: Pricing Configuration

| Field | Value |
|-------|-------|
| **Story ID** | 6-9 |
| **Epic** | Epic 6: Admin Operations Panel |
| **Title** | Pricing Configuration |
| **Status** | draft |
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

- [ ] **Task 1: Add Pricing Route to Navigation** (AC: 1)
  - [ ] Add "Precios" item to admin sidebar (`src/components/admin/admin-sidebar.tsx`)
  - [ ] Add "Precios" item to admin bottom nav (`src/components/admin/admin-bottom-nav.tsx`)
  - [ ] Icon: DollarSign or CreditCard from lucide-react

- [ ] **Task 2: Create Pricing Page** (AC: 1, 2, 3, 4)
  - [ ] Create `src/app/admin/pricing/page.tsx`
  - [ ] Use `requireAdmin()` guard
  - [ ] Load current settings via `getPricingSettings()` action
  - [ ] Render `PricingForm` component

- [ ] **Task 3: Create Pricing Form Component** (AC: 2, 3, 4, 5)
  - [ ] Create `src/components/admin/pricing-form.tsx`
  - [ ] Water tier section with 4 price inputs (100L, 1000L, 5000L, 10000L)
  - [ ] Urgency surcharge section with percentage input
  - [ ] Commission section with percentage input
  - [ ] Commission preview calculation (updates live)
  - [ ] Use react-hook-form with Zod resolver

- [ ] **Task 4: Create Pricing Validation Schema** (AC: 6)
  - [ ] Add to `src/lib/validations/admin.ts`:
    - `price_100l`: positive integer
    - `price_1000l`: positive integer
    - `price_5000l`: positive integer
    - `price_10000l`: positive integer
    - `urgency_surcharge_percent`: integer 0-100
    - `default_commission_percent`: integer 1-100
  - [ ] Add default values for pricing settings

- [ ] **Task 5: Implement Confirmation Dialog** (AC: 7)
  - [ ] Use AlertDialog from shadcn/ui
  - [ ] Show before/after comparison for changed values
  - [ ] "Confirmar Cambios" / "Cancelar" buttons

- [ ] **Task 6: Create Pricing Server Actions** (AC: 8, 9)
  - [ ] Add `getPricingSettings()` to `src/lib/actions/admin.ts`
  - [ ] Add `updatePricingSettings()` to `src/lib/actions/admin.ts`
  - [ ] Store in `admin_settings` table with keys:
    - `price_100l`, `price_1000l`, `price_5000l`, `price_10000l`
    - `urgency_surcharge_percent`
    - `default_commission_percent`
  - [ ] Log changes with timestamp

- [ ] **Task 7: Create E2E Tests** (All ACs)
  - [ ] Create `tests/e2e/admin-pricing.spec.ts`
  - [ ] Test: Admin can navigate to pricing page
  - [ ] Test: Form loads with current values
  - [ ] Test: Price inputs accept valid positive integers
  - [ ] Test: Price inputs reject negative/non-integer values
  - [ ] Test: Commission preview updates dynamically
  - [ ] Test: Confirmation dialog appears on save
  - [ ] Test: Settings persist after save
  - [ ] Test: Success toast displays

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

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-12 | Story created from UX mockups and PRD V2 | Dev Agent |

