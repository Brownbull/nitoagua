# Epic 12.8: Round 2 Bug Fixes - Technical Context

## Overview

This document provides the technical context for implementing bug fixes discovered during Round 2 live multi-device testing. It maps each bug to specific files, identifies root causes, and provides implementation guidance.

## Architecture Summary

The codebase uses:
- **Framework:** Next.js 14+ with App Router
- **Backend:** Supabase (PostgreSQL + Realtime + Auth + Storage)
- **State:** React hooks (custom realtime hooks)
- **Notifications:** Sonner (toasts) + Web Push (VAPID)
- **Styling:** TailwindCSS
- **Icons:** Lucide-react

---

## Bug-to-File Mapping

### Phase 1: Security Fixes (P0)

#### BUG-R2-003 & BUG-R2-017: Push Notification Security
**Status:** CRITICAL - Security vulnerability

| Item | Details |
|------|---------|
| **Files** | `src/lib/actions/push-subscription.ts`, `src/app/provider/settings/sign-out-button.tsx`, `src/app/consumer-profile/page.tsx`, `src/components/admin/admin-logout-button.tsx` |
| **Database** | `push_subscriptions` table (constraint change needed) |

**Root Cause Analysis (Three Issues):**

1. **Missing Logout Cleanup:** When a user logs out, `signOut()` is called but `unsubscribeFromPush()` is NOT called. The database record linking user to endpoint remains, and the browser service worker subscription stays active.

2. **Database Constraint Too Loose:** Current constraint is `UNIQUE(user_id, endpoint)` which allows the SAME endpoint to be registered for MULTIPLE users. Should be `UNIQUE(endpoint)`.

3. **No Endpoint Deduplication:** When subscribing, the system doesn't check if the endpoint already exists for a different user before creating a new subscription.

**Data Flow (Bug Scenario):**
```
1. User A logs in → subscribes → DB: (User_A, Endpoint_E1)
2. User A logs out → signOut() BUT NO unsubscribe → DB still has (User_A, E1)
3. User B logs in on same device → subscribes → DB: (User_B, E1)
4. Now DB has BOTH: (User_A, E1) AND (User_B, E1)
5. Push to User A queries for E1 → sends to E1
6. E1 is on User B's device → WRONG USER GETS NOTIFICATION
```

**Fix Strategy:**

```typescript
// Part 1: Add logout cleanup to ALL logout handlers
async function handleLogout() {
  // 1. Unsubscribe from browser push manager
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (subscription) await subscription.unsubscribe();

  // 2. Delete from database
  await unsubscribeFromPush();

  // 3. Then sign out
  await supabase.auth.signOut();
}

// Part 2: Endpoint deduplication in subscribeToPush()
// Before upserting, delete any existing subscriptions with same endpoint
await supabase
  .from("push_subscriptions")
  .delete()
  .eq("endpoint", subscription.endpoint)
  .neq("user_id", user.id);  // Only delete OTHER users' records

// Then upsert for current user
```

**Files to Modify:**

| File | Change Required |
|------|-----------------|
| `src/app/provider/settings/sign-out-button.tsx` | Add push unsubscribe before signOut |
| `src/app/consumer-profile/page.tsx` | Add push unsubscribe before signOut |
| `src/components/admin/admin-logout-button.tsx` | Add push unsubscribe before signOut |
| `src/lib/actions/push-subscription.ts` | Add endpoint deduplication in `subscribeToPush()` |
| `supabase/migrations/` | (Optional) Add global endpoint uniqueness constraint |

---

#### BUG-R2-004: Role Isolation Failure
**Status:** CRITICAL - Authorization bypass

| Item | Details |
|------|---------|
| **Files** | `src/middleware.ts`, `src/app/provider/layout.tsx`, `src/app/admin/layout.tsx`, `src/app/(consumer)/layout.tsx` |
| **Root Cause** | Routes don't verify user role before rendering |

**Current State:**
- Consumer routes (`/request`, `/consumer-profile`, `/settings`) check only "is authenticated"
- Admin accessing `/settings` via notification click renders consumer UI
- No role verification in route layouts

**Fix Strategy:**

```typescript
// Option 1: Middleware-level guards (recommended)
// src/middleware.ts
export async function middleware(request: NextRequest) {
  const role = session?.user?.user_metadata?.role;

  // Consumer routes
  if (request.nextUrl.pathname.startsWith('/consumer') ||
      request.nextUrl.pathname === '/settings' ||
      request.nextUrl.pathname === '/request') {
    if (role !== 'consumer' && role !== undefined) {
      return NextResponse.redirect(new URL(`/${role}`, request.url));
    }
  }

  // Provider routes
  if (request.nextUrl.pathname.startsWith('/provider')) {
    if (role !== 'supplier') {
      return NextResponse.redirect(new URL(`/${role || 'login'}`, request.url));
    }
  }

  // Admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (role !== 'admin') {
      return NextResponse.redirect(new URL(`/${role || 'login'}`, request.url));
    }
  }
}

// Option 2: Layout-level guards
// src/app/(consumer)/layout.tsx
export default async function ConsumerLayout({ children }) {
  const profile = await getProfile();

  if (profile?.role === 'supplier') {
    redirect('/provider');
  }
  if (profile?.role === 'admin') {
    redirect('/admin');
  }

  return <>{children}</>;
}
```

**Files to Modify:**

| File | Change Required |
|------|-----------------|
| `src/middleware.ts` | Add role-based route guards |
| `src/app/(consumer)/layout.tsx` | Add role check, redirect if wrong role |
| `src/app/provider/layout.tsx` | Add role check, redirect if wrong role |
| `src/app/admin/layout.tsx` | Add role check (may already exist) |

---

### Phase 2: Core Fixes (P1/P2)

#### BUG-R2-009 & BUG-R2-018: Provider "Mis Ofertas" Issues
**Status:** Same root cause for both bugs

| Item | Details |
|------|---------|
| **Files** | `src/app/provider/offers/page.tsx`, `src/lib/actions/offers.ts`, `src/components/provider/offer-card.tsx` |
| **Root Cause** | Using `offers.status` instead of `water_requests.status` |

**Problem:**
- `offers.status = 'accepted'` (never changes after acceptance)
- `water_requests.status = 'delivered'` (updated when delivery completes)
- UI shows `offers.status` → completed deliveries show as "Aceptada"
- Default filter is pre-selected, hiding some offers

**Fix Strategy:**

```typescript
// In offers query (src/lib/actions/offers.ts)
const { data: offers } = await supabase
  .from("offers")
  .select(`
    *,
    request:water_requests!inner(
      id,
      status,
      ...
    )
  `)
  .eq("supplier_id", userId)
  .eq("status", "accepted")
  .not("request.status", "in", "(delivered,cancelled)")
  .order("created_at", { ascending: false });

// In offer card component
const displayStatus = offer.request?.status || offer.status;
// Use displayStatus for badge rendering
```

**Files to Modify:**

| File | Change Required |
|------|-----------------|
| `src/app/provider/offers/page.tsx` | Remove default filter, adjust query |
| `src/lib/actions/offers.ts` | Filter out delivered/cancelled requests |
| `src/components/provider/offer-card.tsx` | Display `request.status` not `offer.status` |

---

#### BUG-R2-007 & BUG-R2-008: Admin Orders Mobile UX
**Status:** CSS/responsive issues

| Item | Details |
|------|---------|
| **Files** | `src/app/admin/orders/page.tsx`, `src/components/admin/orders-table.tsx`, `src/app/admin/orders/[id]/page.tsx` |
| **Root Cause** | Too many elements, poor mobile layout |

**BUG-R2-007 Issues:**
- Filter dropdown text cut off on mobile
- 6 status boxes always visible (take too much space)
- Cluttered header with live indicator + refresh

**BUG-R2-008 Issues:**
- Order detail header cramped
- Status badge competes with other elements
- Too much scrolling needed

**Fix Strategy:**

```tsx
// Mobile-optimized layout for orders page
<div className="flex flex-col gap-2">
  {/* Header: compact */}
  <div className="flex justify-between items-center">
    <h1>Pedidos</h1>
    <div className="flex items-center gap-2">
      <span className="text-xs">🟢 Live</span>
      <span className="text-xs">🔄 0:45</span>
    </div>
  </div>

  {/* Status filters: collapsible on mobile */}
  <div className="md:flex hidden gap-2">
    {/* 6 status cards - desktop only */}
  </div>
  <select className="md:hidden w-full">
    {/* Dropdown for mobile */}
  </select>

  {/* Search + Sort: single row */}
  <div className="flex gap-2">
    <input placeholder="Buscar..." className="flex-1" />
    <button>📅 ↑↓</button>
  </div>
</div>

// Order detail: status on its own row
<div className="flex flex-col">
  <div className="flex items-center gap-2">
    <BackButton />
    <h1>Pedido #{id}</h1>
  </div>
  <div className="mt-2">
    <StatusBadge status={order.status} size="lg" />
  </div>
</div>
```

**Files to Modify:**

| File | Change Required |
|------|-----------------|
| `src/components/admin/orders-table.tsx` | Add collapsible status filters, fix dropdown width |
| `src/app/admin/orders/page.tsx` | Compact header layout |
| `src/app/admin/orders/[id]/page.tsx` | Status on separate row |

---

#### BUG-R2-010 & BUG-R2-011: Admin Providers UX & Ratings
**Status:** Missing features + layout issues

| Item | Details |
|------|---------|
| **Files** | `src/app/admin/providers/page.tsx`, `src/components/admin/provider-card.tsx`, `src/app/admin/providers/[id]/page.tsx` |
| **Database** | `profiles.average_rating`, `profiles.rating_count`, `ratings` table |

**BUG-R2-010 Issues:**
- Status and Area filters on separate rows (inefficient)
- Provider cards missing email

**BUG-R2-011 Issues:**
- No rating display on provider cards
- No rating history in provider detail

**Fix Strategy:**

```tsx
// Filter layout: side by side
<div className="flex gap-2 mb-2">
  <select className="flex-1">Status</select>
  <select className="flex-1">Area</select>
</div>
<input className="w-full" placeholder="Buscar..." />

// Provider card with rating + email
<div className="flex justify-between">
  <div>
    <h3>{provider.name}</h3>
    <p>📞 {provider.phone}</p>
    <p>✉️ {provider.email}</p>
  </div>
  <div className="text-right">
    <span>⭐ {provider.average_rating} ({provider.rating_count})</span>
  </div>
</div>

// Provider detail: ratings section
<section>
  <h2>Calificaciones ({provider.rating_count})</h2>
  <p>Promedio: ⭐ {provider.average_rating}</p>
  <table>
    {ratings.map(r => (
      <tr>
        <td>{r.created_at}</td>
        <td>{r.consumer.name}</td>
        <td>{"⭐".repeat(r.rating)}</td>
        <td>{r.comment}</td>
      </tr>
    ))}
  </table>
</section>
```

**Files to Modify:**

| File | Change Required |
|------|-----------------|
| `src/app/admin/providers/page.tsx` | Side-by-side filters |
| `src/components/admin/provider-card.tsx` | Add email + rating badge |
| `src/app/admin/providers/[id]/page.tsx` | Add ratings section with history |
| `src/lib/actions/providers.ts` | Include ratings in provider detail query |

---

### Phase 3: Polish (P3)

#### BUG-R2-005: Push Notification Status Bar Icon
**Status:** PWA config issue

| Item | Details |
|------|---------|
| **Files** | `public/sw.js`, `public/icons/`, `src/app/manifest.ts` |
| **Root Cause** | Missing monochrome notification icon for Android status bar |

**Fix Strategy:**

```javascript
// In sw.js - showNotification options
self.registration.showNotification(title, {
  body: body,
  icon: '/icons/icon-192.png',       // Full icon
  badge: '/icons/badge-72.png',       // Monochrome badge for status bar
  tag: tag,
  ...
});
```

**Files to Modify:**

| File | Change Required |
|------|-----------------|
| `public/sw.js` | Add `badge` to showNotification |
| `public/icons/` | Add monochrome badge icon (72x72, white on transparent) |
| `src/app/manifest.ts` | Verify icons are properly configured |

---

#### BUG-R2-006: Rating Popup Font Inconsistency
**Status:** To verify - may be minor

| Item | Details |
|------|---------|
| **Files** | `src/components/consumer/rating-dialog.tsx` or rating popup component |
| **Root Cause** | Font family may differ from app standard |

**Fix Strategy:**

```tsx
// Ensure rating dialog uses app font
<Dialog>
  <DialogContent className="font-sans">
    {/* font-sans uses Inter from Tailwind config */}
  </DialogContent>
</Dialog>
```

---

#### BUG-R2-016: Toast Notifications Font & Icons
**Status:** Styling issue

| Item | Details |
|------|---------|
| **Files** | `src/components/ui/sonner.tsx`, toast call sites |
| **Root Cause** | Sonner not configured with app font, missing icons |

**Fix Strategy:**

```tsx
// In sonner.tsx or app layout
<Toaster
  toastOptions={{
    style: {
      fontFamily: 'Inter, system-ui, sans-serif',
    },
  }}
/>

// In toast calls - add icons
import { CheckCircle, XCircle, Info } from 'lucide-react';

toast.success("¡Listo!", {
  icon: <CheckCircle className="h-4 w-4 text-green-500" />
});
toast.error("Error", {
  icon: <XCircle className="h-4 w-4 text-red-500" />
});
```

**Files to Modify:**

| File | Change Required |
|------|-----------------|
| `src/components/ui/sonner.tsx` | Add font family config |
| Toast call sites (various) | Add icons to toast calls |

---

## Implementation Priority Order

Based on security impact and dependencies:

```
Week 1 (CRITICAL):
├── 12.8-1: Push Notification Security (8 pts)
│   ├── Add logout cleanup to all sign-out handlers
│   ├── Add endpoint deduplication on subscribe
│   └── (Optional) DB migration for endpoint uniqueness
│
└── 12.8-2: Role-Based Route Guards (5 pts)
    ├── Add middleware guards
    └── Add layout-level role checks

Week 2 (CORE):
├── 12.8-3: Provider "Mis Ofertas" Fix (5 pts)
├── 12.8-4: Admin Orders Mobile UX (5 pts)
└── 12.8-5: Admin Providers UX & Ratings (5 pts)

Week 3 (POLISH):
└── 12.8-6: UI Polish (3 pts)
```

---

## Testing Considerations

### Push Notification Security Testing
1. User A logs in on Device X, enables push
2. User A logs out - verify subscription deleted from DB
3. User B logs in on Device X, enables push
4. User A creates request on different device
5. Provider creates offer for User A
6. **VERIFY:** Notification goes to User A's device, NOT Device X

### Role Isolation Testing
1. Log in as Admin
2. Click consumer notification (if still subscribed)
3. **VERIFY:** Redirected to /admin, NOT to consumer page
4. Manually navigate to /settings
5. **VERIFY:** Redirected to /admin, NOT consumer settings

---

## Key Files Index

| Category | Files |
|----------|-------|
| Push Security | `src/lib/actions/push-subscription.ts`, `src/app/*/sign-out-*.tsx` |
| Role Guards | `src/middleware.ts`, `src/app/*/layout.tsx` |
| Provider Offers | `src/app/provider/offers/`, `src/lib/actions/offers.ts` |
| Admin Orders | `src/app/admin/orders/`, `src/components/admin/orders-table.tsx` |
| Admin Providers | `src/app/admin/providers/`, `src/components/admin/provider-*.tsx` |
| Toast | `src/components/ui/sonner.tsx` |
| PWA | `public/sw.js`, `public/icons/`, `src/app/manifest.ts` |
