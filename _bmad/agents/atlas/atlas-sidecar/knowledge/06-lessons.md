# Historical Lessons (Retrospectives)

> Section 6 of Atlas Memory
> Last Sync: 2025-12-30
> Sources: Epic retrospectives, code reviews

## What Worked / What Failed

| ✅ Worked | ❌ Failed → Fix |
|-----------|-----------------|
| Per-test seeding | Manual click testing → Playwright |
| shadcn/ui components | Complex tables → Card layouts |
| Optimistic UI (Set tracking) | WebKit flakiness → Focus Chromium |
| Admin client RLS bypass | Mixed auth strategies → OAuth only |
| Consumer-choice offers | Hardcoded constants → Reference source |
| Supabase Realtime | SW_VERSION drift → Build checks |
| Leaflet + dynamic import | NEXT_PUBLIC_* stale → Redeploy after changes |
| `map.invalidateSize()` in wizard | Map tiles blank in PWA → MapResizeHandler |
| DB status query investigation | Assumed status values → Query actual DB |
| Enhanced logging for push triggers | Assumed triggers missing → Verify call sites |
| Debounced realtime refresh (500ms) | `router.refresh()` on Realtime interrupts clicks → Debounce |
| `.trim()` on VAPID keys | Whitespace in env vars → Silent VAPID init failure |
| `merged-fixtures` import | `@playwright/test` import → Use merged-fixtures |
| `waitForSettingsLoaded()` helper | `waitForTimeout(1000)` → Element-based waits |

---

## Patterns: Always Follow / Always Avoid

**Follow:**
1. shadcn/ui components (accessible)
2. Server Actions for mutations
3. Admin client for elevated access
4. Per-test seeding (isolated)
5. Card-based dashboards
6. `getDeliveryPrice()` for pricing
7. `ActionResult<T>` with `requiresLogin`

**Avoid:**
1. Complex table layouts
2. Mixed auth methods
3. Skipping E2E tests
4. Shared test state
5. Hardcoded pricing

---

## Critical Rules

### Security
- ALL PostgreSQL functions: `SET search_path = public`
- After every migration: `mcp__supabase__get_advisors type=security`
- RLS: Verify role names match (`'supplier'` not `'provider'`)

### Testing
- `assertNoErrorState(page)` after EVERY `page.goto()`
- Replace `waitForTimeout()` → element assertions
- Expected skip rate: 86% pass, 14 provider skips

### PWA/Push (Epic 12)
- Use `registration.showNotification()` not `new Notification()` (Android PWA)
- Lazy VAPID init (env vars unavailable at module load)
- **VAPID keys must be `.trim()`ed** - Vercel copy-paste often adds trailing whitespace
- Toggle based on `pushState`, not `permission`
- Edge Functions: Deploy explicitly (no auto-deploy)

### Leaflet Maps (Epic 12.7)
- **Explicit Height Required**: Leaflet requires explicit container dimensions - `h-full` may fail with flex-based parents
- **Robust Pattern**: Use `h-dvh` (not `min-h-dvh`) on parent + `absolute inset-0` on MapContainer
- Call `map.invalidateSize()` after container becomes visible (wizard steps, tabs)
- Use `MapResizeHandler` component inside `<MapContainer>` to fix tile rendering in PWA
- Pattern: Staggered delays (0ms, 100ms, 300ms, 500ms) + window resize listener
- Test tiles with `img[src*='tile.openstreetmap.org']` locator
- **Why `min-h-dvh` fails**: Sets minimum, not explicit height - some browsers don't compute height for `h-full` children
- **Why `absolute inset-0` works**: Absolute positioning guarantees explicit computed dimensions regardless of parent flex chain

### Version Management
- `npm run version:check` - Build fails if SW_VERSION ≠ package.json
- Version bump: Update `package.json` + `public/sw.js` together

### Vercel Env Vars
- `NEXT_PUBLIC_*` = Build-time only (baked in)
- After adding: Must redeploy to take effect
- Server-only vars = Runtime read

### Local Development Setup
- After `npx supabase db reset`: Run `npm run seed:dev-login` to create test users
- **Comunas require verified providers**: `getAvailableComunas()` only returns comunas with at least one provider where `verification_status='approved'` AND `is_available=true` AND has entry in `provider_service_areas`
- Seed script now auto-creates service areas for supplier (villarrica, pucon, lican-ray)
- Test users: admin@nitoagua.cl, consumer@nitoagua.cl, supplier@nitoagua.cl (all use `.123` suffix passwords)

---

## Hard-Won Wisdom

> "The `new Notification()` API silently fails in Android PWA standalone mode."

> "VAPID validation happens at `setVapidDetails()` call time, not send time."

> "86% pass with 14 provider skips is expected, not a failure."

> "Edge Functions don't auto-deploy. Always explicitly deploy."

> "Two auth patterns: Server actions → `{requiresLogin: true}`. Layouts → `redirect()`. Don't mix."

> "Leaflet map tiles render when `mapLoaded=true` but appear blank? Use `h-dvh` on parent + `absolute inset-0` on MapContainer. Don't trust `min-h-dvh` with `h-full` children."

> "No comunas in dropdown after db reset? Run `npm run seed:dev-login` - comunas only show if a verified provider has service areas configured."

> "Admin uses 'assigned' but DB has 'accepted'? Always query actual DB status values before assuming enum mappings. Provider code was correct, Admin had legacy incorrect values."

> "Push notifications not received? Verify subscription exists BEFORE transaction. Code calls trigger correctly but user had no subscription at transaction time."

> "VAPID keys look right but push fails silently? Check key lengths - public=87, private=43. If longer (88/44), trailing whitespace. Add `.trim()` to env vars."

> "Clicks intermittently fail on realtime-enabled pages? `router.refresh()` during Realtime events can re-render components mid-click. Debounce refresh calls (500ms) to let user interactions complete."

---

## Push Notification Debugging (Epic 12.7)

**Story 12.7-2 Findings:**
- Triggers ARE called (contrary to original bug assumption)
- Edge Function NOT used for push - web-push npm library is used directly from server actions
- Key log patterns: `[TriggerPush]` (entry), `[Push]` (send result)
- All 8 trigger functions have consistent entry-point logging (added in code review)

| Log Message | Meaning |
|-------------|---------|
| `[TriggerPush] trigger*Push called` | Server action invoked trigger (all 8 functions logged) |
| `[Push] No subscriptions found for user` | User never enabled push on device |
| `[Push] Found N subscription(s)` | User has active subscription(s) |
| `[Push] Sent M/N push notifications` | Delivery attempted |

**All 8 Trigger Functions (with logging):**
1. `triggerNewOfferPush` - Consumer receives when offer submitted
2. `triggerOfferAcceptedPush` - Provider receives when offer accepted
3. `triggerDeliveryCompletedPush` - Consumer receives on delivery
4. `triggerRequestTimeoutPush` - Consumer receives when request times out
5. `triggerVerificationApprovedPush` - Provider receives when verified
6. `triggerInTransitPush` - Consumer receives when provider en route
7. `triggerRequestFilledPush` - Provider receives when another provider selected
8. `triggerRequestCancelledPush` - Provider receives when consumer cancels

**Verification Steps:**
1. Check `push_subscriptions` table for user
2. Verify subscription `created_at` is BEFORE transaction
3. Check Vercel logs for `[TriggerPush]` and `[Push]` messages
4. VAPID keys: `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` must be in Vercel env
5. **Check VAPID key lengths**: Public=87 chars, Private=43 chars. If 88/44, trailing whitespace exists

**VAPID Whitespace Bug (Fixed 2026-01-01):**
- Symptom: `vapidConfigured: true` but `total: 0` subscriptions queried
- Debug showed `vapid_pub=true(88)` instead of `vapid_pub=true(87)` - one char too long
- Root cause: Vercel env vars had trailing newline from copy-paste
- Fix: Added `.trim()` in `send-push.ts`:
  ```typescript
  const publicKey = (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "").trim();
  const privateKey = (process.env.VAPID_PRIVATE_KEY || "").trim();
  ```
- `webpush.setVapidDetails()` silently fails with malformed keys (doesn't throw)

---

## Status Enum Alignment (Epic 12.7)

| Status | DB Value | Admin Display | Notes |
|--------|----------|---------------|-------|
| Pending | `pending`, `offers_pending`, `no_offers` | Pendiente | Grouped for stats |
| Accepted | `accepted` | Aceptados | NOT `assigned` |
| En Route | `en_route` | En Camino | Future status |
| Delivered | `delivered` | Entregados | Completed |
| Cancelled | `cancelled` | Cancelados | By consumer |

> **Key Insight**: When Admin/Provider views show different statuses for the same order, query the actual database to find the correct value. Don't assume one view's enum mapping is correct.

---

## Session Handling (Epic 12.6)

| Layer | Pattern | Location |
|-------|---------|----------|
| Client | `ensureValidSession()` proactive refresh | `src/lib/auth/session.ts` |
| Hook | Visibility change + 5-min polls | `src/hooks/use-auth.ts` |
| Server | Return `{ requiresLogin: true }` | `src/lib/types/action-result.ts` |
| Login | `?returnTo=` + `?expired=true` params | OAuth flow preserved |

> Code examples moved to Section 4 (Architecture)

---

## Realtime & Click Interactions (Epic 12.7)

**Story 12.7-3 Findings:**
- `useRealtimeOrders` hook calls `router.refresh()` on every Supabase Realtime event
- If Realtime event fires during/just before user click, React re-renders interrupt navigation
- **Solution**: Debounce refresh with 500ms delay using `useRef` + `setTimeout`

**Pattern: Debounced Realtime Refresh**
```typescript
const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

const debouncedRefresh = useCallback(() => {
  if (refreshTimeoutRef.current) {
    clearTimeout(refreshTimeoutRef.current);
  }
  refreshTimeoutRef.current = setTimeout(() => {
    router.refresh();
    refreshTimeoutRef.current = null;
  }, 500); // 500ms debounce
}, [router]);
```

**Also Applied:**
- Enhanced OrderCard: `hover:shadow-md hover:bg-gray-50 active:bg-gray-100` + `prefetch={true}`
- Fixed E2E selector mismatches: `order-row-` → `order-card-` (12+ instances)
- Fixed ambiguous text selectors: `getByText('Total')` → `getByTestId('stats-card-total')`

**Code Review Finding (12.7-3):**
- `useRealtimeOrder` (singular, for detail page) was missing debounce - fixed in code review
- Both hooks now have consistent `debounceMs` option (default 500ms)
- Upgraded `admin-orders.spec.ts` to use `merged-fixtures` + `assertNoErrorState()`

**Code Review Finding (12.7-2):**
- `push-subscription.spec.ts` was using `@playwright/test` instead of `merged-fixtures`
- Had 10+ instances of `waitForTimeout(1000)` anti-pattern
- **Fix:** Created `waitForSettingsLoaded()` helper with `waitForLoadState("networkidle")` + element visibility wait
- **Fix:** Login helpers now wait for email field to populate instead of fixed timeout

---

---

## Push Notification Reliability (Epic 12.7 Final)

### Trigger Call Placement Matters

**Problem:** `triggerOfferAcceptedPush` was inconsistent while `triggerNewOfferPush` worked reliably.

**Root Cause:** Push was nested inside `notifyProviderOfferAccepted()` which performed multiple async DB queries before triggering the push. By the time push was triggered, the serverless function could terminate.

**Solution:** Call push trigger directly in the parent function, not nested in fire-and-forget helpers:

```typescript
// ❌ WRONG - Push nested deep in async chain
async function selectOffer(offerId) {
  const dbResult = await supabase.rpc("accept_offer", ...);
  if (dbResult.success) {
    notifyProviderOfferAccepted(offerId).catch(...); // Push is inside here, 2+ async calls deep
  }
}

// ✅ CORRECT - Push at top level, same as submitOffer pattern
async function selectOffer(offerId) {
  const dbResult = await supabase.rpc("accept_offer", ...);
  if (dbResult.success) {
    // Push immediately after success, before fire-and-forget helpers
    triggerOfferAcceptedPush(offer.provider_id, request.id, request.amount, comunaName)
      .catch((err) => console.error("[SelectOffer] Push error:", err));
    // Then fire-and-forget the rest (in-app + email)
    notifyProviderOfferAccepted(offerId).catch(...);
  }
}
```

**Key Insight:** `submitOffer()` works because it calls `triggerNewOfferPush()` directly after RPC success. Copy this pattern for all notification triggers.

---

## Notification Click Navigation (Epic 12.7 Final)

### Service Worker + App Communication

**Problem:** Clicking push notification opened new tab OR navigated to wrong page.

**Root Cause:**
1. `client.navigate()` fails on uncontrolled clients (when SW updates)
2. URL in notification payload was wrong (`/provider/deliveries` instead of `/provider/deliveries/${requestId}`)

**Solution:** Use `postMessage` pattern for reliable navigation:

**Service Worker (sw.js):**
```javascript
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlPath = event.notification.data?.url || "/";
  const urlToOpen = new URL(urlPath, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true })
      .then(async (windowClients) => {
        // Find existing window at our origin
        for (const client of windowClients) {
          if (new URL(client.url).origin === self.location.origin) {
            if ("focus" in client) await client.focus();
            // Use postMessage instead of client.navigate()
            client.postMessage({ type: "NOTIFICATION_CLICK", url: urlPath });
            return;
          }
        }
        // No existing window, open new one
        if (clients.openWindow) return clients.openWindow(urlToOpen);
      })
  );
});
```

**App Component (ServiceWorkerRegistration.tsx):**
```typescript
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function ServiceWorkerRegistration() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js");

      const handleSWMessage = (event: MessageEvent) => {
        if (event.data?.type === "NOTIFICATION_CLICK") {
          router.push(event.data.url);
        }
      };

      navigator.serviceWorker.addEventListener("message", handleSWMessage);
      return () => navigator.serviceWorker.removeEventListener("message", handleSWMessage);
    }
  }, [router]);

  return null;
}
```

**Key Points:**
- Use `includeUncontrolled: true` in `clients.matchAll()` - handles SW version mismatch
- `postMessage` works even when client isn't controlled by SW
- App uses Next.js `router.push()` for proper client-side navigation
- Always include full path with ID in notification URL: `/provider/deliveries/${requestId}`

---

## Request Refresh Not Working (Epic 12.7)

**Problem:** Provider requests page refresh button showed no indication and data stayed stale.

**Root Cause:** `router.refresh()` was cached by Next.js, returning stale data.

**Solution:** Call server action directly instead of relying on router refresh:

```typescript
// ❌ WRONG - Next.js may serve cached response
const handleRefresh = () => {
  router.refresh();
};

// ✅ CORRECT - Bypass cache by calling server action directly
const handleRefresh = useCallback(async () => {
  setIsRefreshing(true);
  try {
    const result = await getAvailableRequests(); // Server action
    if (result.success && result.requests) {
      setRequests(result.requests);
    }
  } finally {
    setIsRefreshing(false);
  }
}, []);
```

**Added:** Visual feedback with spinner and "Actualizando..." text.

---

---

## Status Config Duplication (Code Review 12.7-4)

**Problem:** Status enum fix was incomplete - bug existed in TWO files but only ONE was fixed.

**Root Cause:** Admin pages have duplicate `statusConfig` objects:
- `src/components/admin/orders-table.tsx` - List view
- `src/app/admin/orders/[id]/page.tsx` - Detail view

Original fix only updated list page. Detail page still had `assigned` (wrong) instead of `accepted` (correct).

**Solution:**
1. **Always grep for ALL occurrences** when fixing enum/status mismatches
2. Added `no_offers` status to both configs for consistency

**Pattern to Follow:**
```bash
# When fixing status bugs, ALWAYS search all files
grep -r "assigned" src/app/admin src/components/admin
grep -r "STATUS_CONFIG\|statusConfig" src/
```

**Prevention:**
- Consider extracting shared STATUS_CONFIG to `src/lib/constants/status.ts`
- Add "search ALL files" to code review checklist for enum/status fixes

**Code Review Also Found:**
- Test file missing `assertNoErrorState(page)` after `page.goto()` - fixed by adding import + calls
- Atlas Section 5 pattern violation corrected

> **Key Insight:** Partial fixes are worse than no fix - they create inconsistent behavior that's hard to debug. When fixing enum mismatches, use grep to find ALL occurrences before considering the fix complete.

---

*Last verified: 2026-01-02 | Sources: Epic 3, 8, 10, 11, 12, 12.6, 12.7 (Stories 12.7-2, 12.7-3, 12.7-4), Push Notification Reliability Session, Local Dev Setup, VAPID Whitespace Fix, Code Review 12.7-4*
