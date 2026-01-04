# Live Multi-Device Testing - Round 2 Bug Report

**Date:** 2026-01-04
**Tester:** Manual
**Version:** 2.7.0
**URL:** https://nitoagua.vercel.app
**Test Plan:** [live-multi-device-test-plan-round2.md](../plans/live-multi-device-test-plan-round2.md)

---

## Bug Summary

| ID | Title | Severity | Test | Status |
|----|-------|----------|------|--------|
| BUG-R2-001 | Provider delivery screen - action buttons hidden below fold | Medium | 2.7 | **Fixed** |
| BUG-R2-002 | "Iniciar Entrega" fails - missing in_transit status in DB | Critical | 2.7 | **Fixed** |

---

## Session Log

| Time | Test | Step | Result | Notes |
|------|------|------|--------|-------|
| - | Test 1 | 1.1 | PASS | Consumer login works |
| - | Test 1 | 1.2 | PASS | "Pedir Agua" opens request form |
| - | Test 1 | 1.3 | PASS | Location pinpoint screen appears |
| - | Test 1 | 1.4 | PASS | Map tiles render correctly (BUG-001 fix verified) |
| - | Test 1 | 1.5 | PASS | Can drag/tap to set location |
| - | Test 1 | 1.6 | PASS | All steps completed |
| - | Test 1 | 1.7 | PASS | Full-screen overlay appears (BUG-019 fix verified) |
| - | Test 1 | 1.8 | PASS | No flash to Step 1, smooth transition |
| - | **CHECKPOINT 1** | - | **PASS** | Map works, request submits cleanly |

---

## Detailed Bug Reports

### BUG-R2-001: Provider delivery screen - action buttons hidden below fold

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Priority** | P2 |
| **Device** | Mobile (Provider view) |
| **Test Step** | 2.7 |
| **URL/Route** | Provider delivery detail screen |

**Description:**

On the provider's active delivery screen, the critical action buttons ("En Camino" / "Marcar como Entregado") are hidden below the fold and require scrolling to access. There's a large empty space between the "Instrucciones especiales" card and the action buttons that could be used to make these buttons visible without scrolling.

For drivers who need to quickly glance at their screen, the most important action should be immediately visible.

**Steps to Reproduce:**

1. Log in as Provider (supplier@nitoagua.cl)
2. Have an active delivery assigned
3. Open the delivery detail screen
4. Observe the layout - action buttons are not visible without scrolling

**Expected Behavior:**

- "En Camino" button should be prominently visible without scrolling
- Either in the top section or immediately after the delivery info cards
- The large empty space should be removed or the buttons should be moved up
- Driver should see the action button within 2 seconds of opening the screen

**Actual Behavior:**

- Large empty space between "Instrucciones especiales" and the action buttons
- Must scroll down to see "Entregar antes de X" and action buttons
- Not driver-friendly - requires extra interaction to access primary action

**Screenshot:** Provided - shows empty space between instructions card and bottom nav

**Proposed Fix:**

Move the delivery deadline and action buttons directly below the instruction card, eliminating the empty space. Consider:
1. Sticky action button at bottom (above nav)
2. Or move buttons immediately after the info cards

**Resolution:**

Fixed by excluding delivery detail page from provider layout's header/nav/padding. The page now uses its own full-screen layout with fixed footer containing the action buttons. See `src/app/provider/layout.tsx`.

---

### BUG-R2-002: "Iniciar Entrega" fails - missing in_transit status in DB

| Field | Value |
|-------|-------|
| **Severity** | Critical |
| **Priority** | P0 (Blocker) |
| **Device** | All |
| **Test Step** | 2.7 |
| **URL/Route** | /provider/deliveries/[id] |

**Description:**

Clicking "Iniciar Entrega" (En Camino button) throws "Error al actualizar estado". The database check constraint on `water_requests.status` only allows `['pending', 'accepted', 'delivered', 'cancelled', 'no_offers']` but the En Camino feature (Story 12.7-11) tries to set status to `in_transit`.

**Steps to Reproduce:**

1. Log in as Provider (supplier@nitoagua.cl)
2. Have an active delivery with status "accepted"
3. Click "Iniciar Entrega" button
4. Error toast appears: "Error al actualizar estado"

**Expected Behavior:**

- Status updates to "in_transit"
- Toast shows "¡Estás en camino!"
- Button changes to "Marcar como Entregado"

**Actual Behavior:**

- PostgreSQL error: `new row for relation "water_requests" violates check constraint "water_requests_status_check"`
- Toast shows: "Error al actualizar estado"

**Root Cause:**

Database migration was missing when En Camino feature was implemented. The check constraint needed to include `in_transit`.

**Resolution:**

Applied migration `add_in_transit_status_to_water_requests` to add `in_transit` to the allowed status values:

```sql
ALTER TABLE water_requests DROP CONSTRAINT IF EXISTS water_requests_status_check;
ALTER TABLE water_requests ADD CONSTRAINT water_requests_status_check
  CHECK (status = ANY (ARRAY['pending', 'accepted', 'in_transit', 'delivered', 'cancelled', 'no_offers']));
```

---

### BUG-R2-003: [Title]

| Field | Value |
|-------|-------|
| **Severity** | |
| **Priority** | |
| **Device** | |
| **Test Step** | |
| **URL/Route** | |

**Description:**

**Steps to Reproduce:**

1.

**Expected Behavior:**

**Actual Behavior:**

**Screenshot:** (if applicable)

---

*Document created: 2026-01-04*
*Last updated: 2026-01-04*
