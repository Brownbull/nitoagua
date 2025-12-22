# Story 12-6: Web Push Notifications

| Field | Value |
|-------|-------|
| **Story ID** | 12-6 |
| **Epic** | Epic 12: Consumer UX Enhancements |
| **Title** | Web Push Notifications |
| **Status** | drafted |
| **Priority** | P1 (High) |
| **Points** | 8 |
| **Sprint** | Backlog |

## User Story

**As a** user (consumer or provider) with the PWA installed,
**I want** to receive push notifications on my device even when the app is closed,
**So that** I'm immediately alerted to important updates like new offers, status changes, or delivery updates.

## Problem Statement

Current notification implementation (Story 10-6) only supports:
- In-app toast notifications via Sonner
- Basic browser Notification API (client-side only)
- Supabase Realtime for live updates when app is open

This fails on Android PWA because:
1. No Web Push API implementation (no VAPID keys)
2. Service worker lacks `push` event handler
3. No server-side push capability
4. Notifications only work when app is actively open

Users miss critical updates when the app is closed or in background.

## Technical Approach

### Web Push API Implementation

```
Server Event → Supabase Edge Function → Web Push API → Service Worker → OS Notification
```

### Components Required

1. **VAPID Key Pair Generation**
   - Public key stored in env (client-side)
   - Private key stored in env (server-side only)

2. **Push Subscription Management**
   - New database table: `push_subscriptions`
   - Store user_id, endpoint, keys (p256dh, auth)
   - Handle subscription/unsubscription

3. **Service Worker Push Handler**
   - Add `push` event listener
   - Add `notificationclick` event listener
   - Handle notification display and routing

4. **Backend Push Sender**
   - Supabase Edge Function to send push messages
   - Triggered by database events (offers, status changes)

## Acceptance Criteria

### AC12.6.1: VAPID Configuration
- [ ] Generate VAPID key pair
- [ ] Store public key in `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- [ ] Store private key in `VAPID_PRIVATE_KEY` (server-only)
- [ ] Document key generation process

### AC12.6.2: Push Subscription Database
- [ ] Create `push_subscriptions` table:
  ```sql
  CREATE TABLE push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, endpoint)
  );
  ```
- [ ] RLS: Users can only manage their own subscriptions
- [ ] Index on user_id for efficient queries

### AC12.6.3: Client-Side Subscription
- [ ] Update notification settings component to subscribe to push
- [ ] Store subscription in database via API route
- [ ] Handle subscription errors gracefully
- [ ] Show subscription status in UI

### AC12.6.4: Service Worker Push Handler
- [ ] Add `push` event listener in sw.js
- [ ] Parse notification payload and display
- [ ] Add `notificationclick` handler for navigation
- [ ] Support notification actions (e.g., "Ver detalles")

### AC12.6.5: Push Sender Edge Function
- [ ] Create Supabase Edge Function `send-push-notification`
- [ ] Accept payload: user_id, title, body, url, icon
- [ ] Query subscriptions for user
- [ ] Send via Web Push Protocol
- [ ] Handle failed/expired subscriptions

### AC12.6.6: Integration with Existing Events
- [ ] Trigger push on new offer received (consumer)
- [ ] Trigger push on offer accepted (provider)
- [ ] Trigger push on status change (in_transit, delivered)
- [ ] Trigger push on request timeout (consumer)

### AC12.6.7: Android PWA Verification
- [ ] Test push notification received when app is closed
- [ ] Test notification click opens correct page
- [ ] Test notification icon displays correctly
- [ ] Verify works on Samsung Galaxy (user's device)

### AC12.6.8: Graceful Degradation
- [ ] If push not supported, fall back to existing behavior
- [ ] If user denies permission, show informative message
- [ ] Handle subscription failures without breaking app

## Database Schema

```sql
-- Push notification subscriptions
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

-- Enable RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can manage their own subscriptions
CREATE POLICY "Users can manage own subscriptions"
  ON push_subscriptions FOR ALL
  USING (auth.uid() = user_id);

-- Index for efficient queries
CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);
```

## Files to Create/Modify

### New Files
| File | Purpose |
|------|---------|
| `supabase/migrations/YYYYMMDD_push_subscriptions.sql` | Database migration |
| `supabase/functions/send-push-notification/index.ts` | Edge function for sending |
| `src/lib/actions/push-subscription.ts` | Server actions for subscription |
| `src/lib/push/vapid.ts` | VAPID configuration |

### Modified Files
| File | Change |
|------|--------|
| `public/sw.js` | Add push and notificationclick handlers |
| `src/components/shared/notification-settings.tsx` | Add push subscription logic |
| `.env.local` | Add VAPID keys |
| `src/lib/actions/offers.ts` | Trigger push on offer events |

## Environment Variables

```env
# Public (client-side)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<generated-public-key>

# Private (server-side only)
VAPID_PRIVATE_KEY=<generated-private-key>
VAPID_SUBJECT=mailto:soporte@nitoagua.cl
```

## Testing Strategy

1. **Local Testing**
   - Use Chrome DevTools Application > Service Workers
   - Test push via DevTools "Push" button
   - Verify notification appears

2. **E2E Testing**
   - Mock push subscription in tests
   - Verify subscription stored in database
   - Test notification click navigation

3. **Manual Android Testing**
   - Install PWA on real device
   - Grant notification permission
   - Close app completely
   - Trigger event from another device/admin
   - Verify notification received

## Dependencies

- Web Push library (server-side): `web-push` npm package
- Supabase Edge Functions (for sending)
- Existing notification infrastructure (Story 10-6)

## Out of Scope

- iOS push notifications (requires Apple Push Notification service)
- Rich notifications with images
- Notification grouping/bundling
- Notification scheduling

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Push notifications work on Android PWA when app is closed
- [ ] Subscription management UI functional
- [ ] Edge function deployed and working
- [ ] No regression in existing notification features
- [ ] Code review passed

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-22 | Story created based on Android PWA notification investigation | Claude Opus 4.5 |
