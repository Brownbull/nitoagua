# Epic 11A: Testing-Discovered Gaps

| Field | Value |
|-------|-------|
| **Epic ID** | 11A |
| **Title** | Testing-Discovered Gaps |
| **Priority** | P0 - Critical |
| **Origin** | Discovered during Epic 11 Playwright testing |
| **Created** | 2025-12-22 |

---

## Overview

This epic captures **gaps discovered during Epic 11 Playwright workflow validation**. These are features that should work according to the PRD/FR requirements but are either missing, broken, or incomplete in the current implementation.

### Discovery Context

During CHAIN-1 testing (Story 11-1), we discovered that the **P10 - Provider Completes Delivery** workflow is broken. The feature was originally implemented in Epic 3 (Story 3-6) but was not migrated when the provider UI was redesigned in Epic 7-8.

---

## Gap Analysis

### GAP-1: P10 - Delivery Completion (Critical)

| Attribute | Value |
|-----------|-------|
| **FR Reference** | FR31: Suppliers can mark an accepted request as delivered |
| **Original Implementation** | Epic 3, Story 3-6 |
| **Current State** | Button disabled with placeholder text |
| **Location** | `src/app/provider/deliveries/[id]/delivery-detail-client.tsx:221-228` |
| **Impact** | Cannot complete CHAIN-1 flow, no deliveries can be marked complete |

**Evidence:**
```typescript
// Current code (delivery-detail-client.tsx:221-228)
<Button
  className="w-full bg-green-500 hover:bg-green-600 h-12"
  disabled  // <-- DISABLED
  title="Funcionalidad próximamente"
>
  <CheckCircle2 className="h-5 w-5 mr-2" />
  Marcar como Entregado
</Button>
```

**Root Cause:**
- Epic 3 implemented delivery via old dashboard at `/supplier/dashboard`
- Epic 7-8 redesigned provider UI with new flow: `/provider/offers` → `/provider/deliveries/[id]`
- Delivery completion action was not migrated to new UI

---

## Stories

| Story | Title | Priority | Points | Status |
|-------|-------|----------|--------|--------|
| 11A-1 | P10 Delivery Completion | P0 | 3 | ready-for-dev |
| 11A-2 | (Reserved for future gaps) | - | - | - |

---

## Story 11A-1: P10 Delivery Completion

### User Story

**As a** provider (aguatero),
**I want** to mark an accepted delivery as complete from the delivery detail page,
**So that** the customer is notified, my earnings are recorded, and the transaction is finalized.

### Acceptance Criteria

#### AC 11A-1.1: Enable Delivery Completion Button
- [ ] "Marcar como Entregado" button is enabled (not disabled)
- [ ] Button is only visible for accepted deliveries (not pending/expired)

#### AC 11A-1.2: Confirmation Dialog
- [ ] Clicking button shows confirmation dialog
- [ ] Dialog shows delivery summary (customer, address, amount)
- [ ] "Confirmar" and "Cancelar" buttons present

#### AC 11A-1.3: Server Action
- [ ] Create `completeDelivery` server action
- [ ] Updates `water_requests.status` to `delivered`
- [ ] Sets `water_requests.delivered_at` to current timestamp
- [ ] Records commission in earnings/settlement system

#### AC 11A-1.4: UI Feedback
- [ ] Success toast: "¡Entrega completada!"
- [ ] Redirects to `/provider/offers` (or earnings page)
- [ ] Error handling for failed completion

#### AC 11A-1.5: Consumer Notification
- [ ] Consumer receives status update (existing notification system)
- [ ] Email sent for guest consumers (existing system)

#### AC 11A-1.6: Playwright Test Passes
- [ ] P10 test in `chain1-happy-path.spec.ts` passes
- [ ] Full CHAIN-1 flow completes end-to-end

### Technical Implementation

#### 1. Server Action (new file)
```typescript
// src/lib/actions/delivery.ts
'use server'

export async function completeDelivery(offerId: string): Promise<ActionResult> {
  // 1. Verify user is the provider for this offer
  // 2. Verify offer status is 'accepted'
  // 3. Update water_requests.status = 'delivered', delivered_at = now()
  // 4. Update offers.status = 'completed' (if tracking)
  // 5. Record commission in settlement system
  // 6. Return success/error
}
```

#### 2. Enable Button
```typescript
// delivery-detail-client.tsx - Remove disabled prop, add onClick
<Button
  className="w-full bg-green-500 hover:bg-green-600 h-12"
  onClick={() => setShowConfirmDialog(true)}
>
  <CheckCircle2 className="h-5 w-5 mr-2" />
  Marcar como Entregado
</Button>
```

#### 3. Confirmation Dialog
- Use existing `AlertDialog` pattern from Epic 3
- Show delivery summary
- Call `completeDelivery` action on confirm

### Definition of Done

- [ ] Button enabled and functional
- [ ] Confirmation dialog works
- [ ] Server action completes delivery
- [ ] Commission recorded
- [ ] Consumer notified
- [ ] P10 test passes
- [ ] Code review complete

---

## Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Settlement system | Exists | From Epic 8 |
| Notification system | Exists | From Epic 5 |
| AlertDialog component | Exists | From Epic 3 |

---

## Testing

After implementing 11A-1, run:

```bash
# Full CHAIN-1 test (should now pass all 5 tests)
NEXT_PUBLIC_DEV_LOGIN=true DISPLAY= npx playwright test tests/e2e/chain1-happy-path.spec.ts --project=mobile --workers=1 --reporter=list
```

Expected result: 5 passed, 0 skipped

---

## Future Gaps

As Epic 11 testing continues, additional gaps may be discovered and added here:

- 11A-2: (TBD based on 11-2 production testing)
- 11A-3: (TBD based on 11-3 provider visibility testing)
- etc.

---

## References

- [Story 3-6: Mark Request as Delivered](../epic3/3-6-mark-request-as-delivered.md) - Original implementation
- [Story 11-1: CHAIN-1 Local](../epic11/11-1-chain1-local.md) - Gap discovery
- [FR31](../../prd.md) - Suppliers can mark an accepted request as delivered
