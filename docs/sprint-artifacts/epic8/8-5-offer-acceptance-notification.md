# Story 8.5: Offer Acceptance Notification

| Field | Value |
|-------|-------|
| **Story ID** | 8-5 |
| **Epic** | Epic 8: Provider Offer System |
| **Title** | Offer Acceptance Notification |
| **Status** | done |
| **Priority** | P0 (Critical) |
| **Points** | 3 |
| **Sprint** | TBD |

---

## User Story

As a **provider whose offer was accepted**,
I want **to receive instant notification with customer details**,
So that **I can prepare for and complete the delivery**.

---

## Background

When a consumer selects a provider's offer (implemented in Epic 9), the provider needs to be notified immediately with all information needed to fulfill the delivery. This includes customer contact info, exact address (now revealed), and the agreed delivery window.

This story implements the provider-side notification; Epic 9 handles the consumer selection action.

---

## Acceptance Criteria

| AC# | Criterion | Notes |
|-----|-----------|-------|
| AC8.5.1 | Provider receives in-app notification: "¡Tu oferta fue aceptada!" | Via notifications table |
| AC8.5.2 | Email notification sent with delivery details | Via Resend |
| AC8.5.3 | Notification includes: customer name, phone, full address, amount, delivery window | All info needed for delivery |
| AC8.5.4 | "Ver Detalles" button links to delivery page | Navigate to active delivery |
| AC8.5.5 | Offer moves to "Entregas Activas" section | In provider offers list |

---

## Tasks / Subtasks

- [x] **Task 1: Notification Trigger Function** (AC: 8.5.1) ✅
  - [x] Create `notifyProviderOfferAccepted(offerId, providerId)` function
  - [x] Fetch offer details with request and customer info
  - [x] Create notification record in `notifications` table
  - [x] Set notification type: 'offer_accepted'
  - [x] Include relevant metadata (offer_id, request_id)

- [x] **Task 2: Email Template** (AC: 8.5.2, 8.5.3) ✅
  - [x] Create `emails/offer-accepted.tsx` (React Email format)
  - [x] Use React Email format (established in Epic 5)
  - [x] Include: customer name, phone number
  - [x] Include: full delivery address (comuna + street)
  - [x] Include: water amount, delivery window
  - [x] Include: "Ver Detalles" button linking to delivery

- [x] **Task 3: Email Send Integration** (AC: 8.5.2) ✅
  - [x] Add `sendOfferAcceptedEmail(providerId, offerDetails)` function
  - [x] Use Resend client from Epic 5
  - [x] Handle email send failures gracefully
  - [x] Log email send status (dev mode logging)

- [x] **Task 4: In-App Notification Display** (AC: 8.5.1, 8.5.4) ✅
  - [x] Ensure notification bell shows new notification
  - [x] Format: "¡Tu oferta fue aceptada! Solicitud de X L en [Comuna]"
  - [x] Click navigates to `/provider/deliveries/[id]`
  - [x] Mark as read on click

- [x] **Task 5: Active Deliveries Section** (AC: 8.5.5) ✅
  - [x] Update offers list to show "Entregas Activas" section
  - [x] Move accepted offer to this section
  - [x] Show delivery details: customer, address, time window
  - [x] "Ver Entrega" button → delivery page

- [x] **Task 6: Delivery Detail Page** (AC: 8.5.3, 8.5.4) ✅
  - [x] Create `src/app/provider/deliveries/[id]/page.tsx`
  - [x] Display full customer contact info
  - [x] Display complete delivery address
  - [x] Display water amount and delivery window
  - [x] Show Google Maps link (external navigation)
  - [x] "Marcar como Entregado" button (placeholder for future)

- [x] **Task 7: Testing** (AC: ALL) ✅
  - [x] E2E: Notification bell visible in provider header
  - [x] E2E: Notification popover opens and shows content
  - [x] E2E: Delivery page requires authentication
  - [x] E2E: Navigation flow from offers to delivery detail
  - [x] E2E: Back button returns to offers list

---

## Dev Notes

### Architecture Alignment

Per tech spec:
- Notification: Uses existing `notifications` table
- Email: `src/lib/email/templates/offer-accepted.tsx`
- Delivery page: `src/app/(provider)/deliveries/[id]/page.tsx`

### Notification Data Structure

```typescript
// notifications table entry
{
  id: uuid,
  user_id: provider_id,
  type: 'offer_accepted',
  title: '¡Tu oferta fue aceptada!',
  message: 'Solicitud de 5,000L en Quilicura',
  metadata: {
    offer_id: string,
    request_id: string,
    customer_name: string,
    delivery_address: string
  },
  read: false,
  created_at: timestamp
}
```

### Email Content

```
Subject: ¡Tu oferta fue aceptada! - NitoAgua

Hola [Provider Name],

¡Buenas noticias! Tu oferta ha sido aceptada.

DETALLES DE LA ENTREGA:
------------------------
Cliente: [Customer Name]
Teléfono: [Phone]
Dirección: [Full Address]
Cantidad: [Amount] litros
Ventana de entrega: [Start Time] - [End Time]

[Ver Detalles de Entrega] (button)

Gracias por usar NitoAgua.
```

### Integration with Epic 9

Epic 9 (Story 9.2) implements the consumer selection action. When consumer selects an offer:
1. Offer status → 'accepted'
2. Other offers on request → 'request_filled'
3. **This story's notification is triggered**
4. Request status → 'assigned'

### Project Structure Notes

- Builds on notification system from Epic 5
- Reuses email templates pattern from Epic 5
- Creates foundation for delivery tracking (future epic)

### References

- [Source: docs/sprint-artifacts/epic8/tech-spec-epic-8.md#Story-8.5]
- [Source: docs/epics.md#Story-8.5-Offer-Acceptance-Notification]
- [Source: docs/sprint-artifacts/epic5/5-2-guest-email-notifications.md] (email patterns)

---

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

N/A

### Completion Notes List

- All 7 tasks completed successfully
- 10 E2E tests created and passing
- Notification system integrates with existing email patterns from Epic 5
- `acceptOffer()` function created for Epic 9 integration
- Email template uses React Email format with Spanish language content
- Dev mode logging for email sending (no actual emails in dev)
- Delivery detail page includes Google Maps link for navigation

### File List

**Created:**
- `emails/offer-accepted.tsx` - React Email template for provider notification
- `src/lib/email/send-provider-offer-notification.ts` - Email send wrapper
- `src/hooks/use-notifications.ts` - React hook for realtime notifications
- `src/components/provider/notification-bell.tsx` - Notification bell component
- `src/app/provider/deliveries/[id]/page.tsx` - Delivery detail server component
- `src/app/provider/deliveries/[id]/delivery-detail-client.tsx` - Delivery detail client component
- `tests/e2e/provider-offer-notification.spec.ts` - E2E tests (10 tests)

**Modified:**
- `src/lib/actions/offers.ts` - Added `notifyProviderOfferAccepted()` and `acceptOffer()` functions
- `src/app/provider/layout.tsx` - Added NotificationBell to header
- `src/app/provider/offers/offers-list-client.tsx` - Renamed "Aceptadas" to "Entregas Activas"

**Added (shadcn components):**
- `src/components/ui/popover.tsx`
- `src/components/ui/scroll-area.tsx`

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-16 | Story drafted from tech spec and epics | Claude |
| 2025-12-17 | Story implementation complete - all 7 tasks done, 10 E2E tests passing | Claude Opus 4.5 |
