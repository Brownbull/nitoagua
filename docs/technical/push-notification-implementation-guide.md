# Push Notification Implementation Guide

This guide explains how to implement push notifications with proper user isolation, ensuring notifications are only delivered to the correct user - even on shared devices or browsers.

## Overview

The implementation solves a critical problem: **preventing notifications from being delivered to the wrong user** when multiple users share the same device or browser.

### Key Principles

1. **Row Level Security (RLS)** - Database policies ensure users can only access their own subscriptions
2. **Endpoint Deduplication** - Each push endpoint belongs to only ONE user at a time
3. **Logout Cleanup** - Subscriptions are removed before logout to prevent leakage

---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Client App    │     │   Server        │     │   Database      │
│                 │     │                 │     │                 │
│ - Subscribe UI  │────▶│ - push-sub.ts   │────▶│ - push_subs     │
│ - Service Worker│◀────│ - send-push.ts  │◀────│ - RLS Policies  │
│ - Logout cleanup│     │ - trigger-push  │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## Implementation Files

### 1. Database Schema & RLS

**File:** `supabase/migrations/YYYYMMDD_add_push_subscriptions.sql`

```sql
-- Push subscriptions table
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- CRITICAL: One endpoint per user prevents duplicates
  UNIQUE(user_id, endpoint)
);

-- Index for efficient user queries
CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);

-- Enable RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own subscriptions
CREATE POLICY "Users can manage own subscriptions"
  ON push_subscriptions
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Service role can manage all (for server-side operations)
CREATE POLICY "Service role can manage all subscriptions"
  ON push_subscriptions
  FOR ALL
  USING ((select auth.jwt()) ->> 'role' = 'service_role');

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_push_subscription_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER push_subscription_updated_at
  BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_push_subscription_updated_at();
```

---

### 2. VAPID Configuration

**File:** `src/lib/push/vapid.ts`

```typescript
// Check if VAPID is configured
export function isVapidConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
    process.env.VAPID_PRIVATE_KEY
  );
}

// Convert base64url VAPID key to Uint8Array for browser API
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
```

**Environment Variables:**
```env
# Generate with: npx web-push generate-vapid-keys
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
```

---

### 3. Subscribe/Unsubscribe Server Actions

**File:** `src/lib/actions/push-subscription.ts`

```typescript
'use server';

import { createClient } from '@/lib/supabase/server';

interface SubscribeResult {
  success: boolean;
  error?: string;
  requiresLogin?: boolean;
}

export async function subscribeToPush(
  subscription: PushSubscriptionJSON
): Promise<SubscribeResult> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Not authenticated', requiresLogin: true };
  }

  const endpoint = subscription.endpoint;
  const p256dh = subscription.keys?.p256dh;
  const auth = subscription.keys?.auth;

  if (!endpoint || !p256dh || !auth) {
    return { success: false, error: 'Invalid subscription data' };
  }

  // ============================================================
  // CRITICAL: Endpoint Deduplication for Multi-User Isolation
  // ============================================================
  // Delete any existing subscriptions with the same endpoint
  // from OTHER users. This ensures that on shared devices,
  // the endpoint belongs to only the current user.
  // ============================================================
  const { error: deleteError } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('endpoint', endpoint)
    .neq('user_id', user.id);

  if (deleteError) {
    console.error('[PushSubscription] Deduplication error:', deleteError);
    // Continue anyway - this is a safety measure
  }

  // Upsert the subscription for current user
  const { error } = await supabase
    .from('push_subscriptions')
    .upsert(
      {
        user_id: user.id,
        endpoint,
        p256dh,
        auth,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,endpoint' }
    );

  if (error) {
    console.error('[PushSubscription] Subscribe error:', error);
    return { success: false, error: 'Failed to save subscription' };
  }

  return { success: true };
}

export async function unsubscribeFromPush(endpoint: string): Promise<SubscribeResult> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Not authenticated', requiresLogin: true };
  }

  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('user_id', user.id)
    .eq('endpoint', endpoint);

  if (error) {
    console.error('[PushSubscription] Unsubscribe error:', error);
    return { success: false, error: 'Failed to remove subscription' };
  }

  return { success: true };
}

export async function getSubscriptionStatus(): Promise<{
  isSubscribed: boolean;
  count: number;
}> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { isSubscribed: false, count: 0 };
  }

  const { count, error } = await supabase
    .from('push_subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  if (error) {
    return { isSubscribed: false, count: 0 };
  }

  return { isSubscribed: (count ?? 0) > 0, count: count ?? 0 };
}

// Get all subscriptions for a user (used by send-push)
export async function getUserSubscriptions(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .eq('user_id', userId);

  if (error) {
    console.error('[PushSubscription] Get subscriptions error:', error);
    return [];
  }

  return data ?? [];
}
```

---

### 4. Send Push Notifications

**File:** `src/lib/push/send-push.ts`

```typescript
import webpush from 'web-push';
import { getUserSubscriptions } from '@/lib/actions/push-subscription';
import { createClient } from '@/lib/supabase/server';

let vapidInitialized = false;

function initVapid() {
  if (vapidInitialized) return;

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    console.warn('[SendPush] VAPID keys not configured');
    return;
  }

  webpush.setVapidDetails(
    'mailto:your-email@example.com',
    publicKey,
    privateKey
  );

  vapidInitialized = true;
}

interface PushNotification {
  title: string;
  body: string;
  url?: string;
  icon?: string;
}

export async function sendPushToUser(
  userId: string,
  notification: PushNotification
): Promise<{ sent: number; failed: number }> {
  initVapid();

  const subscriptions = await getUserSubscriptions(userId);

  if (subscriptions.length === 0) {
    console.log(`[SendPush] No subscriptions for user ${userId}`);
    return { sent: 0, failed: 0 };
  }

  const payload = JSON.stringify({
    title: notification.title,
    body: notification.body,
    url: notification.url ?? '/',
    icon: notification.icon ?? '/icon-192x192.png',
  });

  let sent = 0;
  let failed = 0;
  const staleEndpoints: string[] = [];

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        },
        payload
      );
      sent++;
    } catch (error: any) {
      failed++;

      // Handle 410 Gone - subscription is no longer valid
      if (error.statusCode === 410 || error.statusCode === 404) {
        staleEndpoints.push(sub.endpoint);
      } else {
        console.error('[SendPush] Error:', error.message);
      }
    }
  }

  // Clean up stale subscriptions
  if (staleEndpoints.length > 0) {
    const supabase = await createClient();
    await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', userId)
      .in('endpoint', staleEndpoints);

    console.log(`[SendPush] Cleaned up ${staleEndpoints.length} stale subscriptions`);
  }

  console.log(`[SendPush] Sent ${sent}, failed ${failed} for user ${userId}`);
  return { sent, failed };
}

export async function sendPushToUsers(
  userIds: string[],
  notification: PushNotification
): Promise<void> {
  await Promise.all(
    userIds.map((userId) => sendPushToUser(userId, notification))
  );
}
```

---

### 5. Push Notification Triggers

**File:** `src/lib/push/trigger-push.ts`

```typescript
import { sendPushToUser } from './send-push';

// Trigger when a provider submits an offer
export async function triggerNewOfferPush(
  consumerId: string,
  offerDetails: { providerName: string; price: number }
) {
  await sendPushToUser(consumerId, {
    title: 'New Offer Received',
    body: `${offerDetails.providerName} offered $${offerDetails.price}`,
    url: '/consumer/requests',
  });
}

// Trigger when consumer accepts an offer
export async function triggerOfferAcceptedPush(
  providerId: string,
  requestDetails: { address: string }
) {
  await sendPushToUser(providerId, {
    title: 'Offer Accepted!',
    body: `Your offer for ${requestDetails.address} was accepted`,
    url: '/provider/deliveries',
  });
}

// Trigger when delivery is completed
export async function triggerDeliveryCompletedPush(
  consumerId: string,
  deliveryDetails: { providerName: string }
) {
  await sendPushToUser(consumerId, {
    title: 'Delivery Complete',
    body: `${deliveryDetails.providerName} has completed your delivery`,
    url: '/consumer/requests',
  });
}

// Add more triggers as needed for your business events
```

---

### 6. Logout Cleanup (Critical for Security)

**File:** `src/lib/push/logout-cleanup.ts`

```typescript
'use client';

import { unsubscribeFromPush } from '@/lib/actions/push-subscription';

/**
 * CRITICAL: Clean up push subscriptions before logout
 *
 * This prevents notifications from being sent to the wrong user
 * when multiple users share the same device/browser.
 *
 * Must be called BEFORE supabase.auth.signOut()
 */
export async function cleanupPushBeforeLogout(): Promise<void> {
  try {
    // Check if service worker and push are supported
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      // Unsubscribe from browser Push Manager
      await subscription.unsubscribe();

      // Delete from database
      await unsubscribeFromPush(subscription.endpoint);

      console.log('[LogoutCleanup] Push subscription cleaned up');
    }
  } catch (error) {
    // Don't block logout on cleanup errors
    console.error('[LogoutCleanup] Error:', error);
  }
}
```

**Usage in Logout Button:**

```typescript
'use client';

import { createClient } from '@/lib/supabase/client';
import { cleanupPushBeforeLogout } from '@/lib/push/logout-cleanup';
import { useRouter } from 'next/navigation';

export function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    // CRITICAL: Clean up push BEFORE signing out
    await cleanupPushBeforeLogout();

    const supabase = createClient();
    await supabase.auth.signOut();

    router.push('/');
  };

  return (
    <button onClick={handleSignOut}>
      Sign Out
    </button>
  );
}
```

---

### 7. Service Worker

**File:** `public/sw.js`

```javascript
const SW_VERSION = '1.0.0';

// Push notification received
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();

    const options = {
      body: data.body,
      icon: data.icon || '/icon-192x192.png',
      badge: data.badge || '/badge-72x72.png',
      data: {
        url: data.url || '/',
      },
      // Vibration pattern for mobile
      vibrate: [100, 50, 100],
      // Keep notification until user interacts
      requireInteraction: false,
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  } catch (error) {
    console.error('[SW] Push parse error:', error);
  }
});

// Notification clicked
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Focus existing window if available
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.postMessage({ type: 'NOTIFICATION_CLICK', url });
            return client.focus();
          }
        }
        // Otherwise open new window
        return clients.openWindow(url);
      })
  );
});

// Handle subscription changes (e.g., when SW updates)
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('[SW] Push subscription changed');
  // The client should re-subscribe on next visit
});
```

---

### 8. Client-Side Subscribe UI Component

**File:** `src/components/push-notification-toggle.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { subscribeToPush, getSubscriptionStatus } from '@/lib/actions/push-subscription';
import { urlBase64ToUint8Array } from '@/lib/push/vapid';

export function PushNotificationToggle() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    checkSupport();
  }, []);

  async function checkSupport() {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);

    if (supported) {
      const status = await getSubscriptionStatus();
      setIsSubscribed(status.isSubscribed);
    }

    setIsLoading(false);
  }

  async function handleToggle() {
    if (!isSupported) return;

    setIsLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;

      if (isSubscribed) {
        // Unsubscribe
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
        }
        setIsSubscribed(false);
      } else {
        // Subscribe
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidPublicKey) {
          console.error('VAPID public key not configured');
          return;
        }

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });

        const result = await subscribeToPush(subscription.toJSON());

        if (result.success) {
          setIsSubscribed(true);
        } else if (result.requiresLogin) {
          // Handle auth required
          console.log('Login required for push notifications');
        }
      }
    } catch (error) {
      console.error('Push toggle error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  if (!isSupported) {
    return <p>Push notifications are not supported in this browser.</p>;
  }

  return (
    <button onClick={handleToggle} disabled={isLoading}>
      {isLoading ? 'Loading...' : isSubscribed ? 'Disable Notifications' : 'Enable Notifications'}
    </button>
  );
}
```

---

## Integration Checklist

### Setup
- [ ] Generate VAPID keys: `npx web-push generate-vapid-keys`
- [ ] Add environment variables (`NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`)
- [ ] Run database migration for `push_subscriptions` table
- [ ] Install `web-push` package: `npm install web-push`

### Implementation
- [ ] Create `src/lib/push/vapid.ts`
- [ ] Create `src/lib/actions/push-subscription.ts`
- [ ] Create `src/lib/push/send-push.ts`
- [ ] Create `src/lib/push/trigger-push.ts`
- [ ] Create `src/lib/push/logout-cleanup.ts`
- [ ] Create `public/sw.js`
- [ ] Create subscribe UI component

### Integration
- [ ] Register service worker in app layout
- [ ] Add subscribe toggle to user settings
- [ ] Call `cleanupPushBeforeLogout()` in ALL logout handlers
- [ ] Add trigger calls in business logic (offers, deliveries, etc.)

### Testing
- [ ] Test subscription on multiple browsers
- [ ] Test multi-user scenario on same device
- [ ] Test logout cleanup
- [ ] Test notification click navigation
- [ ] Test stale subscription cleanup (410 handling)

---

## Security Considerations

1. **Endpoint Deduplication** - Always delete other users' subscriptions with the same endpoint before saving
2. **Logout Cleanup** - Always clean up subscriptions before `signOut()`
3. **RLS Policies** - Ensure users can only access their own subscriptions
4. **VAPID Keys** - Never expose the private key; only the public key is client-facing
5. **Service Role** - Use service role for server-side operations that need to query all subscriptions

---

## Troubleshooting

### Notifications not appearing
- Check browser notification permissions
- Verify service worker is registered
- Check VAPID keys are correctly configured
- Look for 410 errors in logs (stale subscriptions)

### Wrong user receiving notifications
- Verify endpoint deduplication is working
- Check that logout cleanup is called before `signOut()`
- Verify RLS policies are enabled on the table

### Subscription fails
- Check if user is authenticated
- Verify VAPID public key is accessible client-side
- Check browser console for errors

---

## Reference Files in This Project

| File | Purpose |
|------|---------|
| `src/lib/actions/push-subscription.ts` | Server actions with endpoint deduplication |
| `src/lib/push/send-push.ts` | Push sending with stale cleanup |
| `src/lib/push/trigger-push.ts` | Business event triggers |
| `src/lib/push/logout-cleanup.ts` | Pre-logout cleanup |
| `src/lib/push/vapid.ts` | VAPID configuration |
| `public/sw.js` | Service worker |
| `supabase/migrations/20251227100000_add_push_subscriptions.sql` | Database schema |
