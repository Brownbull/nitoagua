# Web Push Notifications Guide

> Complete setup guide for Web Push Notifications in Next.js with Supabase
> Last Updated: 2026-01-02

## Overview

This guide covers how to implement reliable Web Push Notifications in a Next.js PWA using:
- **web-push** npm library for sending notifications
- **Service Worker** for receiving and displaying notifications
- **Supabase** for storing push subscriptions
- **VAPID keys** for authentication

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Browser PWA   │────▶│  Supabase DB    │◀────│  Next.js Server │
│  (Service Worker)│     │ push_subscriptions│     │  (Server Actions)│
└────────┬────────┘     └─────────────────┘     └────────┬────────┘
         │                                               │
         │              ┌─────────────────┐              │
         │◀─────────────│  Push Service   │◀─────────────│
                        │  (FCM/APNs)     │   web-push
                        └─────────────────┘
```

## Prerequisites

### 1. Generate VAPID Keys

```bash
npx web-push generate-vapid-keys
```

This outputs:
```
Public Key:  BNx...  (87 characters)
Private Key: abc...  (43 characters)
```

### 2. Environment Variables

```env
# .env.local
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BNx...  # 87 chars, no quotes
VAPID_PRIVATE_KEY=abc...              # 43 chars, server-only
```

**Important:**
- `NEXT_PUBLIC_*` vars are baked in at build time
- VAPID keys must be EXACTLY 87/43 chars - check for trailing whitespace
- In Vercel: After adding env vars, you MUST redeploy

## Database Schema

```sql
-- supabase/migrations/xxx_push_subscriptions.sql
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own subscriptions"
ON push_subscriptions FOR ALL
TO authenticated
USING (user_id = auth.uid());

-- Index for faster lookups
CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);
```

## Implementation

### 1. Send Push (Server Action)

```typescript
// src/lib/push/send-push.ts
"use server";

import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  url?: string;
  tag?: string;
  data?: Record<string, unknown>;
}

// Lazy VAPID initialization (env vars may not be available at module load)
let vapidConfigured = false;

function ensureVapidConfigured(): boolean {
  if (vapidConfigured) return true;

  // CRITICAL: .trim() to remove any whitespace from copy-paste
  const publicKey = (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "").trim();
  const privateKey = (process.env.VAPID_PRIVATE_KEY || "").trim();

  if (!publicKey || !privateKey) {
    console.error("[Push] VAPID keys not configured");
    return false;
  }

  // Validate key lengths (common issue: trailing newline = +1 char)
  if (publicKey.length !== 87 || privateKey.length !== 43) {
    console.error(`[Push] Invalid VAPID key lengths: public=${publicKey.length}, private=${privateKey.length}`);
    return false;
  }

  try {
    webpush.setVapidDetails(
      "mailto:your-email@example.com",
      publicKey,
      privateKey
    );
    vapidConfigured = true;
    return true;
  } catch (error) {
    console.error("[Push] VAPID configuration failed:", error);
    return false;
  }
}

export async function sendPushToUser(
  userId: string,
  notification: PushPayload
): Promise<{ sent: number; total: number }> {
  if (!ensureVapidConfigured()) {
    return { sent: 0, total: 0 };
  }

  const supabase = createAdminClient();

  // Get user's push subscriptions
  const { data: subscriptions, error } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("user_id", userId);

  if (error || !subscriptions?.length) {
    console.log(`[Push] No subscriptions for user ${userId}`);
    return { sent: 0, total: 0 };
  }

  console.log(`[Push] Found ${subscriptions.length} subscription(s) for user`);

  const payload = JSON.stringify({
    title: notification.title,
    body: notification.body,
    icon: notification.icon || "/icons/icon-192.png",
    url: notification.url || "/",
    tag: notification.tag,
    data: notification.data,
  });

  let sent = 0;
  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        payload
      );
      sent++;
    } catch (error: unknown) {
      // Handle expired/invalid subscriptions
      if ((error as { statusCode?: number }).statusCode === 410) {
        console.log("[Push] Subscription expired, removing:", sub.endpoint);
        await supabase
          .from("push_subscriptions")
          .delete()
          .eq("endpoint", sub.endpoint);
      } else {
        console.error("[Push] Send failed:", error);
      }
    }
  }

  console.log(`[Push] Sent ${sent}/${subscriptions.length} notifications`);
  return { sent, total: subscriptions.length };
}
```

### 2. Trigger Functions

```typescript
// src/lib/push/trigger-push.ts
"use server";

import { sendPushToUser, type PushPayload } from "./send-push";

/**
 * CRITICAL: Call triggers at the TOP LEVEL of your server action,
 * immediately after the main operation succeeds.
 *
 * DON'T nest triggers inside fire-and-forget async helpers -
 * the serverless function may terminate before they execute.
 */

export async function triggerOfferAcceptedPush(
  providerId: string,
  requestId: string,
  amount: number,
  comuna: string
): Promise<void> {
  const notification: PushPayload = {
    title: "Your offer was accepted!",
    body: `Request for ${amount}L in ${comuna || "your area"}`,
    icon: "/icons/icon-192.png",
    url: `/provider/deliveries/${requestId}`,  // Include full path with ID
    tag: `offer-accepted-${requestId}`,
    data: { type: "offer_accepted", request_id: requestId },
  };

  try {
    await sendPushToUser(providerId, notification);
  } catch (error) {
    console.error("[TriggerPush] Error:", error);
  }
}

// Pattern for using in server actions:
export async function selectOffer(offerId: string) {
  const result = await supabase.rpc("accept_offer", { offer_id: offerId });

  if (result.success) {
    // ✅ Push IMMEDIATELY after success, at top level
    triggerOfferAcceptedPush(offer.provider_id, request.id, request.amount, comuna)
      .catch((err) => console.error("Push error:", err));

    // Then fire-and-forget other notifications (in-app, email)
    notifyOtherSystems(offerId).catch(...);
  }

  return result;
}
```

### 3. Service Worker (public/sw.js)

```javascript
// public/sw.js
const SW_VERSION = "1.0.0";

// Push event - display notification
self.addEventListener("push", (event) => {
  let notification = {
    title: "New Notification",
    body: "You have a new notification",
    icon: "/icons/icon-192.png",
    url: "/",
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      notification = {
        title: payload.title || notification.title,
        body: payload.body || notification.body,
        icon: payload.icon || notification.icon,
        url: payload.url || notification.url,
        tag: payload.tag,
        data: payload.data || {},
      };
    } catch (e) {
      notification.body = event.data.text();
    }
  }

  const options = {
    body: notification.body,
    icon: notification.icon,
    badge: notification.icon,
    tag: notification.tag,
    data: { url: notification.url, ...notification.data },
    vibrate: [200, 100, 200],
    requireInteraction: false,
  };

  // CRITICAL: Use self.registration.showNotification(), NOT new Notification()
  // new Notification() fails silently in Android PWA standalone mode
  event.waitUntil(
    self.registration.showNotification(notification.title, options)
  );
});

// Notification click - navigate to URL
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const urlPath = event.notification.data?.url || "/";
  const urlToOpen = new URL(urlPath, self.location.origin).href;

  event.waitUntil(
    clients
      // CRITICAL: includeUncontrolled handles SW version mismatches
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(async (windowClients) => {
        // Find existing window at our origin
        for (const client of windowClients) {
          if (new URL(client.url).origin === self.location.origin) {
            if ("focus" in client) await client.focus();

            // CRITICAL: Use postMessage, NOT client.navigate()
            // client.navigate() fails on uncontrolled clients
            client.postMessage({
              type: "NOTIFICATION_CLICK",
              url: urlPath,
            });
            return;
          }
        }

        // No existing window, open new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
```

### 4. App-Side Navigation Handler

```typescript
// src/components/service-worker-registration.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function ServiceWorkerRegistration() {
  const router = useRouter();

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      navigator.serviceWorker.register("/sw.js");

      // Listen for navigation messages from SW
      const handleSWMessage = (event: MessageEvent) => {
        if (event.data?.type === "NOTIFICATION_CLICK") {
          // Use Next.js router for proper client-side navigation
          router.push(event.data.url);
        }
      };

      navigator.serviceWorker.addEventListener("message", handleSWMessage);
      return () => {
        navigator.serviceWorker.removeEventListener("message", handleSWMessage);
      };
    }
  }, [router]);

  return null;
}
```

### 5. Subscribe User to Push

```typescript
// src/lib/push/subscribe.ts
"use client";

import { createClient } from "@/lib/supabase/client";

export async function subscribeToPush(): Promise<boolean> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.log("Push not supported");
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    // Check existing subscription
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // Create new subscription
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        console.error("VAPID public key not configured");
        return false;
      }

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
    }

    // Save to database
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return false;

    const keys = subscription.toJSON().keys;
    await supabase.from("push_subscriptions").upsert({
      user_id: user.id,
      endpoint: subscription.endpoint,
      p256dh: keys?.p256dh || "",
      auth: keys?.auth || "",
    }, {
      onConflict: "endpoint",
    });

    return true;
  } catch (error) {
    console.error("Subscribe error:", error);
    return false;
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
```

## Common Issues & Fixes

### 1. VAPID Keys with Whitespace

**Symptom:** Push silently fails, `vapidConfigured: true` but no sends.

**Fix:** Add `.trim()` when reading env vars:
```typescript
const publicKey = (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "").trim();
```

### 2. Notifications Don't Appear on Android

**Symptom:** Works in browser, fails in installed PWA.

**Fix:** Use `self.registration.showNotification()`, NOT `new Notification()`.

### 3. Clicking Opens New Tab

**Symptom:** Clicking notification opens new browser tab instead of navigating.

**Fix:** Use `postMessage` pattern (see Service Worker section above).

### 4. Intermittent Push Delivery

**Symptom:** Some notifications arrive, others don't.

**Fix:** Call push triggers at top level of server action, not nested in async helpers.

### 5. Environment Variables Not Working

**Symptom:** Works locally, fails in production.

**Fix:**
- `NEXT_PUBLIC_*` requires rebuild after change
- After adding Vercel env vars, redeploy the app

## Testing Checklist

1. [ ] VAPID keys are exactly 87/43 characters
2. [ ] `push_subscriptions` table has data for test user
3. [ ] Subscription `created_at` is BEFORE the triggering action
4. [ ] Service Worker is registered (`navigator.serviceWorker.ready`)
5. [ ] Browser notification permission is "granted"
6. [ ] Vercel logs show `[Push] Sent X/Y` messages
7. [ ] Notification click navigates within same tab

## Debugging

Check Vercel Function logs for:
```
[TriggerPush] trigger*Push called - user: xxx, request: yyy
[Push] Found N subscription(s) for user
[Push] Sent M/N notifications
```

If `total: 0`:
- User has no subscriptions in `push_subscriptions` table
- Check if subscription was created BEFORE the action

If notifications not appearing:
- Check browser console for SW errors
- Verify `self.registration.showNotification()` is used
- Test with browser DevTools > Application > Service Workers > Push

## Files Reference

| File | Purpose |
|------|---------|
| `src/lib/push/send-push.ts` | Core send logic with web-push |
| `src/lib/push/trigger-push.ts` | Event-specific trigger functions |
| `src/lib/push/subscribe.ts` | Client-side subscription |
| `public/sw.js` | Service Worker handlers |
| `src/components/service-worker-registration.tsx` | SW registration + message listener |
| `supabase/migrations/xxx_push_subscriptions.sql` | Database schema |

---

*Guide created from NitoAgua PWA implementation, verified working January 2026*
