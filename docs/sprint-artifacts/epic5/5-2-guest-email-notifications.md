# Story 5.2: Guest Email Notifications

Status: drafted

## Story

As a **guest consumer**,
I want **to receive email notifications when my request status changes**,
so that **I know when my water is coming without needing to constantly check the app**.

## Background

This story implements FR34 (System sends email notification to guest consumers when request status changes) from the PRD. It builds on Story 5-1's email infrastructure to integrate email notifications into the existing API routes.

**Current State:**
- API routes have notification stubs: `console.log('[NOTIFY]...')` in three locations
- Story 5-1 provides email infrastructure (Resend client, templates)
- Guest requests store `guest_email` field for notification delivery

**Integration Points:**
- POST `/api/requests` - Send "Request Confirmed" email after successful creation
- PATCH `/api/requests/[id]` with action="accept" - Send "Request Accepted" email
- PATCH `/api/requests/[id]` with action="deliver" - Send "Request Delivered" email

## Acceptance Criteria

1. **AC5-2-1**: Guest receives confirmation email when request is created
   - Email sent only if `guest_email` is provided AND `consumer_id` is null (true guest)
   - Subject: "Tu solicitud de agua fue recibida - nitoagua"
   - Content includes: customer name, request amount, tracking link, supplier phone
   - Tracking link format: `{BASE_URL}/track/{tracking_token}`

2. **AC5-2-2**: Guest receives notification email when request is accepted
   - Email sent to `guest_email` when status changes to "accepted"
   - Subject: "¡Tu agua viene en camino! - nitoagua"
   - Content includes: customer name, delivery window (if provided), supplier name, supplier phone

3. **AC5-2-3**: Guest receives notification email when request is delivered
   - Email sent to `guest_email` when status changes to "delivered"
   - Subject: "Entrega completada - nitoagua"
   - Content includes: customer name, delivery completion timestamp, request summary

4. **AC5-2-4**: Email failures do not block API operations
   - API returns success even if email sending fails
   - Email errors are logged for debugging
   - User receives API response without email delivery confirmation

5. **AC5-2-5**: Only guests receive email notifications (not registered users)
   - Check: `guest_email` exists AND (`consumer_id` is null OR request was created without auth)
   - Registered users will receive in-app notifications (Story 5-3)

6. **AC5-2-6**: Email sending is properly logged
   - Success: `[EMAIL] Sent {template_name} to {masked_email}`
   - Failure: `[EMAIL] Failed to send {template_name}: {error_message}`

## Tasks / Subtasks

- [ ] **Task 1: Create Guest Email Helper** (AC: 5-2-1, 5-2-4, 5-2-5, 5-2-6)
  - [ ] Create `src/lib/email/send-guest-notification.ts`
  - [ ] Implement `isGuestRequest()` helper to check guest vs registered
  - [ ] Implement `sendGuestNotification()` that handles all 3 notification types
  - [ ] Add error handling that logs but doesn't throw
  - [ ] Add email masking utility for logging (show first 2 chars + domain)

- [ ] **Task 2: Integrate Request Created Email** (AC: 5-2-1)
  - [ ] Update `src/app/api/requests/route.ts` POST handler
  - [ ] After successful request insertion, call sendGuestNotification()
  - [ ] Pass request data: id, tracking_token, guest_name, guest_email, amount
  - [ ] Fetch supplier phone from profiles table for email content
  - [ ] Construct tracking URL using environment variable or request origin

- [ ] **Task 3: Integrate Request Accepted Email** (AC: 5-2-2)
  - [ ] Update `src/app/api/requests/[id]/route.ts` PATCH handler (accept action)
  - [ ] After successful status update, fetch full request with guest_email
  - [ ] Call sendGuestNotification() with template "accepted"
  - [ ] Include delivery_window if provided, supplier name and phone

- [ ] **Task 4: Integrate Request Delivered Email** (AC: 5-2-3)
  - [ ] Update `src/app/api/requests/[id]/route.ts` PATCH handler (deliver action)
  - [ ] After successful status update, fetch full request with guest_email
  - [ ] Call sendGuestNotification() with template "delivered"
  - [ ] Include delivered_at timestamp, amount, address summary

- [ ] **Task 5: Fetch Supplier Info for Emails** (AC: 5-2-1, 5-2-2)
  - [ ] Create helper to fetch supplier contact info by supplier_id
  - [ ] Cache supplier info in memory if needed (same supplier for MVP)
  - [ ] Handle case where supplier info is not available

- [ ] **Task 6: Testing & Verification** (AC: 5-2-1 to 5-2-6)
  - [ ] Verify TypeScript compilation passes
  - [ ] Verify `npm run build` succeeds
  - [ ] Verify `npm run lint` passes
  - [ ] Manual test: Create guest request and verify email received
  - [ ] Manual test: Accept request and verify email received
  - [ ] Manual test: Mark delivered and verify email received
  - [ ] Verify registered user requests do NOT trigger emails

## Dev Notes

### Architecture Alignment

From `docs/architecture.md`:
- API routes should return success even if notifications fail
- Use consistent API response format: `{ data, error }`
- Email helper should be in `src/lib/email/`

### Email Helper Implementation Pattern

```typescript
// src/lib/email/send-guest-notification.ts
import { sendEmail } from './resend';
import { RequestConfirmed } from './templates/request-confirmed';
import { RequestAccepted } from './templates/request-accepted';
import { RequestDelivered } from './templates/request-delivered';

type NotificationType = 'confirmed' | 'accepted' | 'delivered';

interface GuestNotificationData {
  type: NotificationType;
  guestEmail: string;
  guestName: string;
  requestId: string;
  trackingToken: string;
  amount: number;
  address?: string;
  supplierPhone?: string;
  supplierName?: string;
  deliveryWindow?: string;
  deliveredAt?: string;
}

export function isGuestRequest(request: {
  guest_email: string | null;
  consumer_id: string | null;
}): boolean {
  return !!request.guest_email && !request.consumer_id;
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  return `${local.slice(0, 2)}***@${domain}`;
}

export async function sendGuestNotification(data: GuestNotificationData): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nitoagua.vercel.app';
  const trackingUrl = `${baseUrl}/track/${data.trackingToken}`;

  try {
    let subject: string;
    let template: React.ComponentType<any>;
    let props: Record<string, unknown>;

    switch (data.type) {
      case 'confirmed':
        subject = 'Tu solicitud de agua fue recibida - nitoagua';
        template = RequestConfirmed;
        props = {
          customerName: data.guestName,
          requestId: data.requestId,
          trackingUrl,
          amount: data.amount,
          supplierPhone: data.supplierPhone || '',
        };
        break;
      case 'accepted':
        subject = '¡Tu agua viene en camino! - nitoagua';
        template = RequestAccepted;
        props = {
          customerName: data.guestName,
          trackingUrl,
          deliveryWindow: data.deliveryWindow,
          supplierName: data.supplierName || 'Su aguatero',
          supplierPhone: data.supplierPhone || '',
        };
        break;
      case 'delivered':
        subject = 'Entrega completada - nitoagua';
        template = RequestDelivered;
        props = {
          customerName: data.guestName,
          deliveredAt: data.deliveredAt,
          amount: data.amount,
          address: data.address,
        };
        break;
    }

    await sendEmail({
      to: data.guestEmail,
      subject,
      template,
      props,
    });

    console.log('[EMAIL] Sent', data.type, 'to', maskEmail(data.guestEmail));
  } catch (error) {
    console.error('[EMAIL] Failed to send', data.type, ':', error);
    // Don't throw - email failure shouldn't block API response
  }
}
```

### API Integration Pattern

```typescript
// In POST /api/requests after successful insert
if (insertData.guest_email && !insertData.consumer_id) {
  // Fetch supplier phone (MVP: single supplier)
  const { data: supplier } = await supabase
    .from('profiles')
    .select('phone')
    .eq('role', 'supplier')
    .single();

  sendGuestNotification({
    type: 'confirmed',
    guestEmail: insertData.guest_email,
    guestName: insertData.guest_name,
    requestId: insertedRequest.id,
    trackingToken: insertedRequest.tracking_token,
    amount: insertData.amount,
    supplierPhone: supplier?.phone,
  });
}
```

### Project Structure Notes

- New file: `src/lib/email/send-guest-notification.ts`
- Modified files:
  - `src/app/api/requests/route.ts` (POST handler)
  - `src/app/api/requests/[id]/route.ts` (PATCH handler)

### Dependencies

- Story 5-1 must be completed first (provides sendEmail, templates)
- Resend API key must be configured in environment

### Learnings from Previous Story

**From Story 5-1 (Email Notification Setup) - Status: drafted**

Story 5-1 establishes the email infrastructure this story depends on:
- `sendEmail()` helper function at `src/lib/email/resend.ts`
- Three templates: `request-confirmed.tsx`, `request-accepted.tsx`, `request-delivered.tsx`
- Props interfaces defined for each template
- Error handling pattern: log errors, return success/failure status

**Existing Notification Stubs to Replace:**
1. Line 109-116 in `[id]/route.ts`: Request delivered notification
2. Line 261-264 in `[id]/route.ts`: Request cancelled notification (not for guests per AC)
3. Line 537-544 in `[id]/route.ts`: Request accepted notification
4. POST in `route.ts`: Need to ADD request created notification (no stub exists)

[Source: docs/sprint-artifacts/epic5/5-1-email-notification-setup-with-resend.md]

### References

- [Source: docs/architecture.md#API Contracts] - API response format
- [Source: docs/epics.md#Story 5.2] - Original story requirements
- [Source: docs/prd.md#FR34] - System sends email notification to guest consumers
- [Source: src/app/api/requests/route.ts] - Request creation endpoint
- [Source: src/app/api/requests/[id]/route.ts:109-116] - Deliver notification stub
- [Source: src/app/api/requests/[id]/route.ts:537-544] - Accept notification stub

## Prerequisites

- Story 5-1 complete (Email infrastructure with Resend and templates)
- Resend API key configured in environment variables
- Vercel environment variables set for production

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Guest receives email on request creation
- [ ] Guest receives email on request acceptance
- [ ] Guest receives email on request delivery
- [ ] Registered users do NOT receive email notifications
- [ ] Email failures do not block API responses
- [ ] Build passes (`npm run build`)
- [ ] Lint passes (`npm run lint`)
- [ ] Story status updated to `review`

---

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2025-12-07 | SM Agent (Claude Opus 4.5) | Story drafted from epics.md, architecture, and existing API code |
