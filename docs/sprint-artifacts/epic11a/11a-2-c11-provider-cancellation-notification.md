# Story 11A-2: C11 Provider Cancellation Notification

| Field | Value |
|-------|-------|
| **Story ID** | 11A-2 |
| **Epic** | Epic 11A - Testing-Discovered Gaps |
| **Title** | Provider Notification on Consumer Cancel |
| **Status** | done |
| **Points** | 3 |
| **Priority** | P1 - High |
| **Discovered In** | Story 11-15 |

---

## Discovery Context

During **Story 11-15 (Consumer Cancellation Local)** Playwright workflow validation, we discovered that **C11: Provider Notification** is not implemented.

### Current Behavior

When a consumer cancels a pending request that has active offers:
1. ✅ Request status updates to "cancelled"
2. ❌ Providers with active offers are NOT notified
3. ❌ Offers are NOT automatically invalidated
4. ❌ No warning shown to consumer about existing offers

### Code Location

The gap exists in `src/app/api/requests/[id]/route.ts`:

```typescript
// Line ~283 in handleCancelAction function
// TODO: Epic 5 - Send notification about cancellation
```

### Evidence from Testing

```
✓ C11.1: [GAP] Consumer cancellation notification not implemented @gap
```

The test documents the gap but passes because it's a gap-detection test, not a feature test.

---

## User Story

**As a** provider (aguatero),
**I want** to be notified when a consumer cancels a request I made an offer on,
**So that** I can stop waiting for acceptance and find other opportunities.

---

## Acceptance Criteria

### AC 11A-2.1: Offer Invalidation

When consumer cancels a pending request with active offers:
- [x] All `active` offers on the request are updated to `request_cancelled` status
- [x] Expired/cancelled offers are not touched
- [x] Operation is atomic (part of cancel transaction)

### AC 11A-2.2: Provider Notification (In-App)

For each affected provider:
- [x] In-app notification created with type `offer_request_cancelled`
- [x] Notification title: "Solicitud cancelada"
- [x] Notification message: "El cliente canceló la solicitud para [amount]L en [address]"
- [x] Notification includes `request_id` and `offer_id` in data

### AC 11A-2.3: Cancellation Warning (Consumer UX)

When consumer has active offers and clicks cancel:
- [x] Dialog shows warning: "Hay [N] ofertas activas de repartidores"
- [x] Warning text: "Al cancelar, serán notificados"
- [x] Buttons remain "Volver" and "Cancelar Solicitud"

### AC 11A-2.4: Offer Count Badge (Optional Enhancement)

On consumer tracking page for pending requests:
- [x] Show badge/count of active offers on cancel button (already implemented via offer-count-badge)
- [x] Badge shows "N ofertas disponibles" in status card

### AC 11A-2.5: Playwright Tests Pass

- [x] Update `consumer-cancellation-workflow.spec.ts` C11 tests to validate
- [x] C11.1: Verify warning shown when cancelling with offers
- [x] C11.2: Verify no warning when no offers
- [x] Remove `@gap` tag from tests when implemented

---

## Technical Implementation

### 1. Update Cancel API Route

```typescript
// src/app/api/requests/[id]/route.ts - handleCancelAction function

// After successful status update, handle offers:

// 1. Get affected offers
const { data: activeOffers } = await supabase
  .from("offers")
  .select("id, provider_id")
  .eq("request_id", requestId)
  .eq("status", "active");

// 2. Invalidate offers (if any)
if (activeOffers && activeOffers.length > 0) {
  await supabase
    .from("offers")
    .update({ status: "request_cancelled" })
    .eq("request_id", requestId)
    .eq("status", "active");

  // 3. Notify providers (fire and forget)
  notifyProvidersOfRequestCancellation(requestId, activeOffers).catch(err => {
    console.error("[Cancel] Failed to notify providers:", err);
  });
}
```

### 2. Create Notification Function

```typescript
// src/lib/actions/offers.ts (or new file)

async function notifyProvidersOfRequestCancellation(
  requestId: string,
  offers: { id: string; provider_id: string }[]
): Promise<void> {
  const adminClient = createAdminClient();

  // Get request details for notification
  const { data: request } = await adminClient
    .from("water_requests")
    .select("amount, address")
    .eq("id", requestId)
    .single();

  // Create notifications
  const notifications = offers.map((offer) => ({
    user_id: offer.provider_id,
    type: "offer_request_cancelled",
    title: "Solicitud cancelada",
    message: `El cliente canceló la solicitud para ${request?.amount || ""}L en ${request?.address || "la dirección"}`,
    data: {
      offer_id: offer.id,
      request_id: requestId,
    },
    read: false,
  }));

  await adminClient.from("notifications").insert(notifications);
}
```

### 3. Database: New Offer Status

Add `request_cancelled` to offer status enum (if not already):

```sql
-- Migration: add_request_cancelled_offer_status.sql
ALTER TYPE offer_status ADD VALUE IF NOT EXISTS 'request_cancelled';
```

Or use existing `cancelled` status with different `data.reason`.

### 4. Update Consumer Cancel Dialog

```typescript
// src/components/consumer/cancel-request-button.tsx

// Add offer count prop and warning
interface CancelRequestButtonProps {
  requestId: string;
  trackingToken: string;
  variant?: "default" | "danger";
  activeOfferCount?: number; // New prop
}

// In dialog:
{activeOfferCount > 0 && (
  <div className="text-sm text-amber-600 mt-2">
    ⚠️ Hay {activeOfferCount} ofertas activas de repartidores.
    Al cancelar, serán notificados.
  </div>
)}
```

---

## Tasks

### Task 1: Database & API

- [x] 1.1 Add `request_cancelled` offer status (or use existing with reason)
- [x] 1.2 Update `handleCancelAction` to invalidate offers
- [x] 1.3 Create notification function for cancelled offers
- [x] 1.4 Test API endpoint manually

### Task 2: Consumer UX

- [x] 2.1 Add `activeOfferCount` prop to CancelRequestButton
- [x] 2.2 Pass offer count from tracking page
- [x] 2.3 Add warning message to cancel dialog
- [x] 2.4 Test consumer flow manually

### Task 3: Update Playwright Tests

- [x] 3.1 Update C11 tests in `consumer-cancellation-workflow.spec.ts`
- [x] 3.2 Remove `@gap` tag
- [x] 3.3 Add assertion for notification creation
- [x] 3.4 Run full test suite: 19/20 tests passing (1 skipped expected)

---

## Definition of Done

- [x] Offers invalidated when consumer cancels
- [x] Providers receive in-app notification
- [x] Consumer sees warning about active offers
- [x] All Playwright tests pass (no `@gap` tags)
- [x] Code review complete

---

## Related PRD/FR References

- **C9**: Cancel With Offers - Providers notified
- **C11**: Provider Notification - Notification when offer cancelled
- **FR27**: Consumer can cancel pending request
- **FR28**: Provider receives notifications about offer status

---

## File List

**Modified Files:**
- `src/app/api/requests/[id]/route.ts` - Add offer invalidation and notification
- `src/components/consumer/cancel-dialog.tsx` - Add activeOfferCount warning message
- `src/components/consumer/cancel-request-button.tsx` - Pass activeOfferCount prop to CancelDialog
- `src/app/track/[token]/page.tsx` - Pass activeOfferCount prop
- `tests/e2e/consumer-cancellation-workflow.spec.ts` - Update C11 tests

**New Files:**
- `supabase/migrations/20251224114656_add_request_cancelled_offer_status.sql` - Add request_cancelled status to offers

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-23 | Story created from 11-15 gap discovery | Claude |
| 2025-12-24 | Implementation complete - all ACs met, tests passing | Claude |
| 2025-12-24 | Atlas code review passed - 0 HIGH, 1 MEDIUM (docs fix), 2 LOW (permissions, console.log) | Claude |
