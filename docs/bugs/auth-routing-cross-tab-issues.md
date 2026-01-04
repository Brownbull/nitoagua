# Bug Study: Authentication & Role-Based Routing Issues

**Date:** 2026-01-01
**Reported By:** User
**Priority:** High
**Affects:** All user roles (Provider, Consumer, Admin)

---

## Problem Summary

When a user is logged in (e.g., as a provider), opening a new browser tab and navigating to the root URL (`nitoagua.vercel.app`) does not redirect them to their role-specific dashboard. Instead, they see the consumer home page or get redirected to an incorrect route (`/dashboard`). Additionally, logging out in one tab causes 404 errors in other tabs that still have the old session UI displayed.

---

## Observed Symptoms

### Symptom 1: Wrong Redirect on New Tab
1. User logs in as **provider** in incognito Tab A
2. Provider lands correctly on their dashboard
3. User opens **new Tab B** in same incognito session
4. User navigates to `nitoagua.vercel.app` (root URL)
5. **Expected:** Redirect to `/provider/requests` (provider dashboard)
6. **Actual:** Shows consumer home page (`/`) without redirect

### Symptom 2: Stale URL After Auth Callback
1. Provider logs in via Google OAuth
2. Auth callback redirects to `/dashboard`
3. This route exists but is the **OLD** supplier dashboard (via `(supplier)` route group)
4. The **NEW** provider dashboard is at `/provider/requests`
5. **Result:** Inconsistent user experience with two dashboard systems

### Symptom 3: Cross-Tab Session Invalidation Causes 404
1. User has provider dashboard open in Tab A
2. User logs out in Tab B
3. Tab A still shows the provider dashboard UI (stale state)
4. Any navigation or API call in Tab A results in 404 or auth errors
5. **Expected:** Tab A should detect logout and redirect to login

---

## Root Cause Analysis

### Issue #1: Home Page Lacks Role-Based Redirect

**File:** [src/app/page.tsx](src/app/page.tsx)

The home page (`/`) is a client component that:
- Checks if user is authenticated via `supabase.auth.getUser()`
- Fetches user name from profile for display
- **But does NOT check user role**
- **And does NOT redirect providers/admins to their dashboards**

```typescript
// Current implementation (PROBLEMATIC)
useEffect(() => {
  const supabase = createClient();
  supabase.auth.getUser().then(async ({ data: { user } }) => {
    setUser(user);
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("name")  // Only fetches name, NOT role
        .eq("id", user.id)
        .single();
      // No role check, no redirect logic
    }
  });
}, []);
```

**Impact:** Providers opening a new tab and navigating to `/` see the consumer home page instead of being redirected to their dashboard.

---

### Issue #2: Auth Callback Redirects to Wrong Route

**File:** [src/app/auth/callback/route.ts](src/app/auth/callback/route.ts)

```typescript
// Line 77-78 - WRONG redirect target
if (profile.role === "supplier") {
  return NextResponse.redirect(`${origin}/dashboard`);  // OLD route
}
```

**Problem:**
- Redirects to `/dashboard` which renders via `(supplier)/dashboard/page.tsx` (OLD system)
- Should redirect to `/provider/requests` (NEW system)
- Creates confusion between two parallel routing systems

---

### Issue #3: Login Page Also Has Wrong Redirect

**File:** [src/app/(auth)/login/page.tsx](src/app/(auth)/login/page.tsx)

```typescript
// Line 48-49 - Same problem
if (profile.role === "supplier") {
  redirect("/dashboard");  // OLD route
}
```

---

### Issue #4: Two Parallel Route Systems Exist

The codebase has **two** supplier/provider dashboard systems:

| System | Route Pattern | Layout | Status |
|--------|--------------|--------|--------|
| **OLD** | `(supplier)/dashboard/*` | `(supplier)/layout.tsx` (server) | Has server-side auth check |
| **NEW** | `/provider/*` | `provider/layout.tsx` (client) | No server-side auth check |

**Files in OLD system (`(supplier)/`):**
- [src/app/(supplier)/dashboard/page.tsx](src/app/(supplier)/dashboard/page.tsx) - Old dashboard
- [src/app/(supplier)/layout.tsx](src/app/(supplier)/layout.tsx) - Server-side auth guard

**Files in NEW system (`/provider/`):**
- [src/app/provider/requests/page.tsx](src/app/provider/requests/page.tsx) - New dashboard
- [src/app/provider/layout.tsx](src/app/provider/layout.tsx) - Client-side layout (no auth guard!)

**Critical Problem:** The NEW provider layout (`/provider/layout.tsx`) is a **client component** with NO server-side authentication check. Anyone can access `/provider/*` routes directly.

---

### Issue #5: No Cross-Tab Session Synchronization

**Missing Implementation:** The application does not implement any mechanism to:
- Detect when a user logs out in another tab
- Synchronize auth state across browser tabs
- Redirect stale tabs to login when session expires

**Standard Solutions Not Implemented:**
```typescript
// Option 1: BroadcastChannel API (not implemented)
const channel = new BroadcastChannel('auth');
channel.onmessage = (event) => {
  if (event.data.type === 'logout') router.push('/login');
};

// Option 2: Storage event listener (not implemented)
window.addEventListener('storage', (event) => {
  if (event.key?.includes('supabase.auth')) {
    // Check if logged out and redirect
  }
});
```

---

### Issue #6: Middleware Does Not Handle Role-Based Routing

**File:** [src/lib/supabase/middleware.ts](src/lib/supabase/middleware.ts)

```typescript
export async function updateSession(request: NextRequest) {
  // ... creates supabase client
  await supabase.auth.getUser();  // Only refreshes session
  return supabaseResponse;  // No role checks, no redirects
}
```

**Problem:** Middleware only refreshes the Supabase session but does not:
- Check user role
- Redirect providers away from consumer routes
- Redirect consumers away from provider routes
- Protect routes based on role

---

## Impact Assessment

| User Role | Impact | Severity |
|-----------|--------|----------|
| **Provider** | Can see consumer home page when opening new tab; confusing UX | High |
| **Provider** | Gets redirected to old `/dashboard` instead of new `/provider/requests` | High |
| **Consumer** | Could potentially navigate to `/provider/*` routes (no server protection) | Medium |
| **All Users** | Logging out in one tab doesn't affect other tabs | High |
| **All Users** | 404 errors when session expires in one tab | High |

---

## Affected Files

### Critical (Must Fix)

| File | Issue |
|------|-------|
| [src/app/page.tsx](src/app/page.tsx) | No role-based redirect |
| [src/app/auth/callback/route.ts](src/app/auth/callback/route.ts) | Wrong redirect target |
| [src/app/(auth)/login/page.tsx](src/app/(auth)/login/page.tsx) | Wrong redirect target |
| [src/app/provider/layout.tsx](src/app/provider/layout.tsx) | No server-side auth guard |
| [src/lib/supabase/middleware.ts](src/lib/supabase/middleware.ts) | No role-based routing |

### Secondary (Should Fix)

| File | Issue |
|------|-------|
| [src/app/(supplier)/dashboard/page.tsx](src/app/(supplier)/dashboard/page.tsx) | Deprecated but still accessible |
| [src/middleware.ts](src/middleware.ts) | Could be enhanced for role routing |

---

## Proposed Solution

### Phase 1: Fix Immediate Routing Issues

#### 1.1 Update Auth Callback Route
```typescript
// src/app/auth/callback/route.ts
if (profile.role === "supplier") {
  return NextResponse.redirect(`${origin}/provider/requests`);  // NEW route
}
```

#### 1.2 Update Login Page Redirect
```typescript
// src/app/(auth)/login/page.tsx
if (profile.role === "supplier") {
  redirect("/provider/requests");  // NEW route
}
```

#### 1.3 Add Role Check to Home Page
```typescript
// src/app/page.tsx
useEffect(() => {
  const supabase = createClient();
  supabase.auth.getUser().then(async ({ data: { user } }) => {
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("name, role")  // ADD role
        .eq("id", user.id)
        .single();

      if (profile?.role === "supplier") {
        router.replace("/provider/requests");  // Redirect providers
        return;
      }
      setUserName(profile?.name ?? null);
    }
    setUser(user);
  });
}, []);
```

### Phase 2: Add Server-Side Protection to Provider Routes

#### 2.1 Convert Provider Layout to Server Component with Auth Guard
```typescript
// src/app/provider/layout.tsx (converted to server component)
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProviderLayoutClient } from "@/components/layout/provider-layout-client";

export default async function ProviderLayout({ children }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?role=supplier");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, verification_status")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "supplier") {
    redirect("/");  // Non-suppliers go to consumer home
  }

  // Check if needs onboarding
  if (profile.verification_status === "pending_documents") {
    redirect("/provider/onboarding");
  }

  return <ProviderLayoutClient>{children}</ProviderLayoutClient>;
}
```

### Phase 3: Implement Cross-Tab Session Sync

#### 3.1 Create Auth Sync Hook
```typescript
// src/hooks/use-auth-sync.ts
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function useAuthSync() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    // Listen for auth state changes (includes cross-tab events)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT") {
          // User signed out (possibly in another tab)
          router.replace("/login?expired=true");
        }
      }
    );

    // Also listen to storage events for immediate sync
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key?.includes("supabase.auth") && !event.newValue) {
        router.replace("/login?expired=true");
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [router]);
}
```

#### 3.2 Add Hook to Root Layout or Auth-Protected Layouts
```typescript
// Use in provider/layout.tsx, admin/layout.tsx, etc.
function ProviderLayoutClient({ children }) {
  useAuthSync();  // Sync auth state across tabs
  // ... rest of layout
}
```

### Phase 4: Deprecate Old Route System

#### 4.1 Add Redirects from Old to New Routes
```typescript
// next.config.ts
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/provider/requests',
        permanent: true,
      },
      {
        source: '/dashboard/:path*',
        destination: '/provider/:path*',
        permanent: true,
      },
    ];
  },
};
```

#### 4.2 Eventually Remove `(supplier)/` Route Group
- Remove `src/app/(supplier)/` directory after transition period
- Keep redirects in place for bookmarked URLs

---

## Testing Requirements

### Manual Test Cases

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| RT-1 | Provider new tab redirect | 1. Log in as provider 2. Open new tab 3. Go to root URL | Redirects to `/provider/requests` |
| RT-2 | Consumer new tab stays home | 1. Log in as consumer 2. Open new tab 3. Go to root URL | Stays on `/` (home) |
| RT-3 | Cross-tab logout | 1. Open provider dashboard in Tab A 2. Log out in Tab B | Tab A redirects to login |
| RT-4 | Provider route protection | 1. As consumer, navigate to `/provider/requests` | Redirects to `/` |
| RT-5 | Auth callback redirect | 1. Log in as provider via Google | Lands on `/provider/requests` |

### E2E Test Files to Create/Update

- `tests/e2e/auth-routing.spec.ts` - New file for routing tests
- `tests/e2e/cross-tab-session.spec.ts` - New file for session sync tests

---

## Implementation Priority

1. **Immediate (Day 1):** Fix redirect targets in auth callback and login page
2. **High (Day 1-2):** Add role check to home page with redirect
3. **High (Day 2-3):** Add server-side auth guard to provider layout
4. **Medium (Day 3-4):** Implement cross-tab session synchronization
5. **Low (Week 2):** Add permanent redirects and deprecate old routes

---

## Related Stories/Epics

This bug study may warrant a new story in the current sprint:
- **Story: Fix Role-Based Routing and Cross-Tab Session Management**
- **Epic:** Authentication & Security Hardening

---

---

# Additional Bug: Service Worker & Consumer Notification Issues

**Added:** 2026-01-01

## Problem Summary (SW + Notifications)

Two additional issues were discovered during testing:

1. **Service Worker throws error when clicking push notification**
2. **Consumer notification bell doesn't update when receiving new offers**

---

## Issue #1: Service Worker Navigate Error

### Symptom
When clicking a push notification, Chrome console shows:
```
[SW] Notification clicked: new-offer-8a8a42b9-a03c-4c8a-b4cc-4e065de8d19d
Uncaught (in promise) TypeError: This service worker is not the client's active service worker.
```

### Root Cause
**File:** [public/sw.js:221](public/sw.js#L221)

The service worker was using `includeUncontrolled: true` when finding clients, then calling `client.navigate()` on ALL matching clients, including those not controlled by this SW. The `navigate()` method can only be called on **controlled clients**.

```javascript
// BEFORE (buggy):
clients.matchAll({ type: "window", includeUncontrolled: true })
  .then((windowClients) => {
    for (const client of windowClients) {
      client.navigate(urlToOpen);  // Throws on uncontrolled clients!
    }
  });
```

### Fix Applied
Changed to `includeUncontrolled: false` and added try-catch:

```javascript
// AFTER (fixed):
clients.matchAll({ type: "window", includeUncontrolled: false })
  .then(async (windowClients) => {
    for (const client of windowClients) {
      try {
        await client.navigate(urlToOpen);
        return client.focus();
      } catch (e) {
        console.log("[SW] Navigate failed, will open new window:", e.message);
      }
    }
    // Open new window if no controlled client exists
    if (clients.openWindow) {
      return clients.openWindow(urlToOpen);
    }
  });
```

**Status:** FIXED in SW_VERSION 2.5.1

---

## Issue #2: Consumer Notification Bell Not Updating

### Symptom
When a provider makes an offer:
1. Consumer receives push notification (SW log shows it)
2. Notification is inserted into `notifications` table
3. **But** the notification bell icon in consumer header doesn't show unread count
4. Consumer has to manually refresh to see updates

### Root Cause: Architectural Gap

The consumer side uses **two separate notification systems** that are disconnected:

| Component | Hook Used | Data Source | Real-time? |
|-----------|-----------|-------------|------------|
| Bottom nav clock icon | `useUnreadUpdates` | `water_requests` table (status changes) | No (localStorage + polling) |
| Header bell icon | `DashboardHeader` | Static prop passed from parent | No |
| Provider bell icon | `useNotifications` | `notifications` table | Yes (Supabase realtime) |

**The Problem:**
- When a new offer is created, it inserts into the `notifications` table
- But consumers don't have any component listening to the `notifications` table!
- The `useUnreadUpdates` hook only tracks `water_requests` status changes, not notifications
- The `DashboardHeader` bell only shows a static `notificationCount` prop

### Files Involved

| File | Issue |
|------|-------|
| [src/components/layout/consumer-nav.tsx](src/components/layout/consumer-nav.tsx) | Uses `useUnreadUpdates` (wrong hook for notifications) |
| [src/components/layout/dashboard-header.tsx](src/components/layout/dashboard-header.tsx) | Bell is static, not connected to real-time |
| [src/hooks/use-unread-updates.ts](src/hooks/use-unread-updates.ts) | Only tracks `water_requests`, not `notifications` |
| [src/hooks/use-notifications.ts](src/hooks/use-notifications.ts) | Has real-time support but only used by providers |

### Proposed Fix

**Option A: Create Consumer Notification Bell Component** (Recommended)
```typescript
// src/components/consumer/consumer-notification-bell.tsx
"use client";

import { useNotifications } from "@/hooks/use-notifications";

export function ConsumerNotificationBell() {
  const { unreadCount, notifications, navigateToNotification } = useNotifications();

  // Render notification bell with dropdown (similar to provider's)
  // Filter notifications by consumer-relevant types: new_offer, delivery_completed, etc.
}
```

**Option B: Enhance DashboardHeader to Use Real Hook**
```typescript
// Modify DashboardHeader to accept a real-time hook instead of static prop
export function DashboardHeader({ ... }) {
  const { unreadCount } = useNotifications(); // Add real-time connection
  // ...
}
```

**Option C: Add Notification Types to useUnreadUpdates**
Expand `useUnreadUpdates` to also query the `notifications` table for consumer-relevant types.

### Recommendation
**Option A** is recommended because:
1. Keeps provider and consumer notification systems parallel but separate
2. Allows consumer-specific notification filtering
3. Doesn't change existing provider functionality
4. Can be added to consumer layouts without breaking existing components

---

## Updated Implementation Priority

1. **DONE:** Fix SW navigate error (deployed as v2.5.1)
2. **HIGH:** Create `ConsumerNotificationBell` component
3. **HIGH:** Add component to consumer layouts/pages
4. **MEDIUM:** Fix auth routing issues (see main bug study above)

---

## References

- [Next.js Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Supabase Auth State Change](https://supabase.com/docs/reference/javascript/auth-onauthstatechange)
- [BroadcastChannel API](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel)
- [Service Worker Clients API](https://developer.mozilla.org/en-US/docs/Web/API/Clients)
