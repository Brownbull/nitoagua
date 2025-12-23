# Story 11A-1: P10 Delivery Completion

| Field | Value |
|-------|-------|
| **Story ID** | 11A-1 |
| **Epic** | Epic 11A - Testing-Discovered Gaps |
| **Title** | P10 Delivery Completion |
| **Status** | done |
| **Points** | 3 |
| **Priority** | P0 - Critical |

---

## User Story

**As a** provider (aguatero),
**I want** to mark an accepted delivery as complete from the delivery detail page,
**So that** the customer is notified, my earnings are recorded, and the transaction is finalized.

---

## Background

This feature was originally implemented in Epic 3 (Story 3-6) but was not migrated when the provider UI was redesigned in Epic 7-8. The button exists but is disabled with placeholder text.

### Current State

```typescript
// src/app/provider/deliveries/[id]/delivery-detail-client.tsx:221-228
<Button
  className="w-full bg-green-500 hover:bg-green-600 h-12"
  disabled  // <-- PROBLEM: Disabled
  title="Funcionalidad próximamente"
>
  <CheckCircle2 className="h-5 w-5 mr-2" />
  Marcar como Entregado
</Button>
```

### FR Reference

**FR31:** Suppliers can mark an accepted request as delivered

---

## Tasks

### Task 1: Create Server Action ✅

- [x] 1.1 Create `src/lib/actions/delivery.ts`
- [x] 1.2 Implement `completeDelivery(offerId: string)` function
- [x] 1.3 Verify user is the provider who owns this offer
- [x] 1.4 Verify offer status is 'accepted'
- [x] 1.5 Update `water_requests.status` to 'delivered'
- [x] 1.6 Set `water_requests.delivered_at` to current timestamp
- [x] 1.7 Record commission (integrate with settlement system)
- [x] 1.8 Return success/error with appropriate messages

### Task 2: Enable Button & Add Dialog ✅

- [x] 2.1 Remove `disabled` prop from button
- [x] 2.2 Add state for confirmation dialog (`showConfirmDialog`)
- [x] 2.3 Add `AlertDialog` component with confirmation UI
- [x] 2.4 Show delivery summary in dialog (customer, address, amount)
- [x] 2.5 Add loading state during submission
- [x] 2.6 Handle success (toast + redirect)
- [x] 2.7 Handle error (toast with error message)

### Task 3: Integrate Notifications ✅

- [x] 3.1 Verify existing notification triggers work with 'delivered' status
- [x] 3.2 Test email notification for guest consumers
- [x] 3.3 Test in-app notification for registered consumers

### Task 4: Update Playwright Test ✅

- [x] 4.1 Remove `test.skip` from P10 test
- [x] 4.2 Update test selectors if needed
- [x] 4.3 Verify full CHAIN-1 passes (5/5 tests)

---

## Acceptance Criteria

### AC 11A-1.1: Enable Delivery Completion Button ✅
- [x] "Marcar como Entregado" button is enabled (not disabled)
- [x] Button is only visible/enabled for accepted deliveries

### AC 11A-1.2: Confirmation Dialog ✅
- [x] Clicking button shows confirmation dialog
- [x] Dialog shows: customer name, delivery address, water amount
- [x] "Confirmar Entrega" and "Cancelar" buttons present

### AC 11A-1.3: Server Action Works ✅
- [x] `completeDelivery` action updates request status
- [x] `delivered_at` timestamp is set
- [x] Commission recorded in settlement system
- [x] Only the accepting provider can complete (authorization check)

### AC 11A-1.4: UI Feedback ✅
- [x] Success toast: "¡Entrega completada!"
- [x] Redirects to `/provider/offers` after success
- [x] Error toast on failure with reason

### AC 11A-1.5: Consumer Notification ✅
- [x] Consumer sees status change to "Entregado"
- [x] Guest consumers receive "Entrega completada" email

### AC 11A-1.6: Playwright Test Passes ✅
- [x] P10 test in `chain1-happy-path.spec.ts` passes
- [x] Full CHAIN-1: C1→P5→P6→C2→P10 completes

---

## Technical Specification

### Server Action

```typescript
// src/lib/actions/delivery.ts
'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

interface CompleteDeliveryResult {
  success: boolean;
  error?: string;
}

export async function completeDelivery(offerId: string): Promise<CompleteDeliveryResult> {
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  // Get offer with request details
  const { data: offer, error: offerError } = await supabase
    .from('offers')
    .select(`
      id,
      status,
      supplier_id,
      request_id,
      water_requests (
        id,
        status,
        consumer_id
      )
    `)
    .eq('id', offerId)
    .single();

  if (offerError || !offer) {
    return { success: false, error: 'Oferta no encontrada' };
  }

  // Verify authorization
  if (offer.supplier_id !== user.id) {
    return { success: false, error: 'No autorizado' };
  }

  // Verify status
  if (offer.status !== 'accepted') {
    return { success: false, error: 'La oferta no está aceptada' };
  }

  // Update request status to delivered
  const { error: updateError } = await supabase
    .from('water_requests')
    .update({
      status: 'delivered',
      delivered_at: new Date().toISOString(),
    })
    .eq('id', offer.request_id);

  if (updateError) {
    return { success: false, error: 'Error al actualizar la solicitud' };
  }

  // Update offer status (optional tracking)
  await supabase
    .from('offers')
    .update({ status: 'completed' })
    .eq('id', offerId);

  // TODO: Record commission in settlement/earnings
  // This may already be handled by the existing settlement system

  // Revalidate paths
  revalidatePath('/provider/offers');
  revalidatePath('/provider/deliveries');

  return { success: true };
}
```

### UI Updates

```typescript
// delivery-detail-client.tsx additions

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { completeDelivery } from '@/lib/actions/delivery';

// Inside component:
const [showConfirmDialog, setShowConfirmDialog] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false);
const router = useRouter();

const handleCompleteDelivery = async () => {
  setIsSubmitting(true);
  try {
    const result = await completeDelivery(delivery.offerId);
    if (result.success) {
      toast.success('¡Entrega completada!');
      router.push('/provider/offers');
    } else {
      toast.error(result.error || 'Error al completar la entrega');
    }
  } catch {
    toast.error('Error inesperado');
  } finally {
    setIsSubmitting(false);
    setShowConfirmDialog(false);
  }
};

// Button (replace disabled version):
<Button
  className="w-full bg-green-500 hover:bg-green-600 h-12"
  onClick={() => setShowConfirmDialog(true)}
>
  <CheckCircle2 className="h-5 w-5 mr-2" />
  Marcar como Entregado
</Button>

// Dialog:
<AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Confirmar Entrega</AlertDialogTitle>
      <AlertDialogDescription>
        ¿Confirmas que has entregado {formatLiters(delivery.amount)} de agua a {delivery.customerName} en {delivery.deliveryAddress}?
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
      <AlertDialogAction
        onClick={handleCompleteDelivery}
        disabled={isSubmitting}
        className="bg-green-500 hover:bg-green-600"
      >
        {isSubmitting ? 'Procesando...' : 'Confirmar Entrega'}
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

## Definition of Done

- [x] Server action created and tested
- [x] Button enabled with confirmation dialog
- [x] Delivery status updates to 'delivered'
- [x] Commission recording verified
- [x] Consumer notification works
- [x] P10 Playwright test passes
- [x] Full CHAIN-1 (5/5 tests) passes
- [x] Code review complete
- [x] Story status updated to 'done'

---

## Test Command

```bash
# After implementation, run:
NEXT_PUBLIC_DEV_LOGIN=true DISPLAY= npx playwright test tests/e2e/chain1-happy-path.spec.ts --project=mobile --workers=1 --reporter=list

# Expected: 5 passed, 0 skipped
```

---

## References

- [Epic 3, Story 3-6](../epic3/3-6-mark-request-as-delivered.md) - Original implementation
- [Epic 11, Story 11-1](../epic11/11-1-chain1-local.md) - Gap discovery source
- [delivery-detail-client.tsx](../../../src/app/provider/deliveries/[id]/delivery-detail-client.tsx) - File to modify

---

## Dev Agent Record

### Code Review

**Reviewed:** 2025-12-22
**Reviewer:** Atlas-Enhanced Code Review

**Summary:** All tasks and acceptance criteria verified complete. Implementation follows Atlas architectural patterns (Server Actions, AlertDialog, Admin Client for RLS bypass). No critical issues found.

**Issues Found:**
- 0 Critical
- 3 Medium (documentation gaps, silent-fail commission logging)
- 2 Low (spec vs implementation differences)

**Atlas Validation:** ✅ PASSED
- Architecture compliance: ✅
- Pattern compliance: ✅
- Workflow chain impact: CHAIN-1 now complete

### File List

| File | Change Type | Description |
|------|-------------|-------------|
| `src/lib/actions/delivery.ts` | **Created** | Server action for `completeDelivery(offerId)` |
| `src/app/provider/deliveries/[id]/delivery-detail-client.tsx` | **Modified** | Enabled button, added AlertDialog, loading state |
| `tests/e2e/chain1-happy-path.spec.ts` | **Created** | CHAIN-1 E2E test with P10 step |

### Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-22 | Story created from 11-1 gap discovery | Claude |
| 2025-12-22 | Implementation complete, all tasks done | Claude |
| 2025-12-22 | Code review passed, status → done | Atlas Code Review |
