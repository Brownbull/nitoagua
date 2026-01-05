# Historical Lessons (Retrospectives)

> Section 6 of Atlas Memory
> Last Sync: 2026-01-05
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
| Refs pattern for realtime callbacks | useEffect re-runs on callback identity change → Connection loop |
| "Render then Refresh" pattern | `force-dynamic` still serves cached HTML → Fetch on mount |
| `merged-fixtures` import | `@playwright/test` import → Use merged-fixtures |
| `waitForSettingsLoaded()` helper | `waitForTimeout(1000)` → Element-based waits |
| API routes for client calls | Server actions in client components → RSC render errors |
| `.limit(1)` for existence checks | `.single()` returns 406 when no rows → Use `.limit(1)` |
| RLS policies for inserts | Admin client requires env var → Use RLS if policy allows |
| Bucket name verification | Code references wrong bucket name → Verify bucket exists in DB |
| Ternary rating display | `&&` only renders when true → Use ternary with fallback text |
| Story spec font mismatch | Story said "Inter" but app uses Poppins → Verify actual fonts before implementing |
| Sonner toast font isolation | Sonner may render outside font context → Use explicit `!font-sans` class |

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

## Realtime Hook Connection Loop (Epic 12.7 Admin)

**Problem:** Admin orders page showed "Conectando..." in an endless loop, and provider requests page had similar re-subscription issues.

**Root Cause:** React useEffect dependency arrays included callback functions that were recreated on every render, causing the subscription effect to cleanup and re-run continuously.

```typescript
// ❌ WRONG - Callbacks recreated each render → infinite re-subscription
useEffect(() => {
  // ... setup subscription using handleChange
  return () => cleanup();
}, [enabled, handleChange]); // handleChange recreates → effect re-runs

// ❌ WRONG - useCallback doesn't help if dependencies change
const handleChange = useCallback(() => {
  onOrderChange?.(); // onOrderChange is NEW on every parent render
}, [onOrderChange]); // Still recreates when parent re-renders
```

**Solution:** Use refs pattern to keep callbacks stable:

```typescript
// ✅ CORRECT - Refs for callbacks, stable dependency array
const onOrderChangeRef = useRef(onOrderChange);
const onOfferChangeRef = useRef(onOfferChange);

// Keep refs updated (doesn't trigger effect re-run)
useEffect(() => {
  onOrderChangeRef.current = onOrderChange;
}, [onOrderChange]);

useEffect(() => {
  onOfferChangeRef.current = onOfferChange;
}, [onOfferChange]);

useEffect(() => {
  if (!enabled) return;

  // Handler uses refs - stable reference
  const handleChange = () => {
    onOrderChangeRef.current?.();
  };

  // ... setup subscription with handleChange
  return () => cleanup();
}, [enabled, router, debounceMs]); // Only re-subscribe when NEEDED
```

**Files Fixed:**
- `src/hooks/use-realtime-orders.ts` - Admin orders hook
- `src/hooks/use-realtime-requests.ts` - Provider requests hook

**Key Insight:** When passing callbacks to custom hooks with Supabase Realtime subscriptions, the callback identity matters. Parent components create new function references on every render, which triggers useEffect re-runs. Use refs to decouple callback identity from subscription lifecycle.

---

## Stale Data on Page Load (Next.js Caching)

**Problem:** Provider requests page showed "old requests" on initial load, but correct data after pressing refresh button.

**Root Cause:** Even with `export const dynamic = "force-dynamic"`, Next.js can serve cached HTML from CDN. Server components render with stale data baked in.

**Solution:** Fetch fresh data on component mount in addition to initial server render:

```typescript
// Page renders with initialRequests from server (fast initial paint)
const [requests, setRequests] = useState(initialRequests);

// Then immediately fetch fresh data
useEffect(() => {
  if (providerStatus?.isVerified && providerStatus?.isAvailable) {
    handleRefresh(); // Call server action directly
  }
}, []); // Run once on mount

const handleRefresh = useCallback(async () => {
  const result = await getAvailableRequests(); // Server action
  if (result.success && result.requests) {
    setRequests(result.requests);
  }
}, []);
```

**Pattern:** "Render then Refresh"
1. Render immediately with server data (avoids loading skeleton)
2. Fetch fresh data on mount (guarantees current state)
3. Update local state with fresh data

**Why This Works:**
- Server actions bypass CDN cache
- User sees content immediately (no loading state)
- Fresh data appears within milliseconds
- Subsequent realtime updates maintain freshness

**Applied To:**
- `src/app/provider/requests/request-browser-client.tsx`
- `src/components/admin/orders-table.tsx` (already had this pattern)

---

---

## Type Generation After Schema Changes (Epic 12.7)

**Problem:** TypeScript build failed with "Argument of type 'disputes' is not assignable to parameter of type..." after adding new database table.

**Root Cause:** `src/types/database.ts` wasn't updated after applying migration. Supabase client couldn't recognize the new table.

**Solution:** Always regenerate types after schema changes:

```bash
# Via MCP tool
mcp__supabase__generate_typescript_types

# Then update src/types/database.ts with generated types
```

**Pattern:** Schema change → Generate types → Update database.ts → Build

**Key Files:**
- `supabase/migrations/` - Schema source of truth
- `src/types/database.ts` - TypeScript types for Supabase client

**Applied In:** Story 12.7-5 (Consumer Dispute Option)

---

## Consumer Dispute System (Story 12.7-5)

**Pattern:** Dispute table with time window validation

**Database Schema:**
- `disputes` table with one-to-one constraint on `request_id` (UNIQUE)
- 5 dispute types: `not_delivered`, `wrong_quantity`, `late_delivery`, `quality_issue`, `other`
- 5 statuses: `open`, `under_review`, `resolved_consumer`, `resolved_provider`, `closed`
- `dispute_window_hours` in `admin_settings` (default 48h)

**RLS Pattern:** Optimized `(select auth.uid())` for performance:
```sql
CREATE POLICY "Consumers can create disputes"
  ON disputes FOR INSERT
  TO authenticated
  WITH CHECK (
    consumer_id = (select auth.uid())
    AND EXISTS (
      SELECT 1 FROM water_requests wr
      WHERE wr.id = disputes.request_id
      AND wr.consumer_id = (select auth.uid())
      AND wr.status = 'delivered'
    )
  );
```

**UI Pattern:** Two-step dialog flow
1. Select dispute type (required)
2. Confirm before submit (prevents accidental submissions)

### Server Actions vs API Routes (Key Learning)

**Problem:** Server actions called from client components caused "Server Components render" errors in production (Vercel), even with try-catch wrappers.

**Root Cause:** Server action exports from `"use server"` files can cause RSC hydration issues when imported into client components, especially when the server action internally uses cookies/auth.

**Solution:** Use Next.js API routes (`/api/disputes`) instead of server actions for client-side calls:

```typescript
// ❌ WRONG - Server action in client component
import { createDispute } from "@/lib/actions/disputes";
const result = await createDispute({ ... }); // RSC error in production

// ✅ CORRECT - API route from client component
const response = await fetch("/api/disputes", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ request_id, dispute_type, description }),
});
const result = await response.json();
```

**When to Use:**
- **Server Actions:** Server components, form actions, server-to-server calls
- **API Routes:** Client components making async calls (onClick handlers, useEffect)

### Supabase `.single()` vs `.limit(1)` (Key Learning)

**Problem:** Checking for existing dispute returned 406 Not Acceptable error.

**Root Cause:** `.single()` returns HTTP 406 when no rows are found (expects exactly one row).

**Solution:** Use `.limit(1)` and check array length for "maybe exists" queries:

```typescript
// ❌ WRONG - Returns 406 error when no dispute exists
const { data: existingDispute, error } = await supabase
  .from("disputes")
  .select("id")
  .eq("request_id", requestId)
  .single(); // Throws 406 if no rows!

// ✅ CORRECT - Returns empty array when no dispute exists
const { data: existingDisputeArray } = await supabase
  .from("disputes")
  .select("id")
  .eq("request_id", requestId)
  .limit(1);

if (existingDisputeArray && existingDisputeArray.length > 0) {
  // Dispute exists
}
```

**When to Use:**
- **`.single()`:** Query MUST return exactly one row (e.g., by primary key)
- **`.maybeSingle()`:** Query may return 0 or 1 row (returns null if none)
- **`.limit(1)`:** Query may return 0+ rows, you only need first (safest for existence checks)

### RLS vs Admin Client for Inserts

**Problem:** Insert with admin client failed in Vercel preview (missing `SUPABASE_SERVICE_ROLE_KEY`).

**Solution:** If RLS policy allows the operation, use regular authenticated client:

```typescript
// ❌ WRONG - Requires SERVICE_ROLE_KEY env var
const adminClient = createAdminClientSafe();
if (!adminClient) return { success: false, error: "Config error" };
await adminClient.from("disputes").insert({ ... });

// ✅ CORRECT - RLS policy already allows consumer inserts
await supabase.from("disputes").insert({
  request_id,
  consumer_id: user.id, // RLS validates this matches auth.uid()
  provider_id: waterRequest.supplier_id,
  dispute_type,
  description,
  status: "open",
});
```

**Key Insight:** Review RLS policies before reaching for admin client. If policy permits the operation, use regular client - it's more portable across environments.

### Code Review Finding (12.7-5)

**Problem:** Server action `canFileDispute()` used `.single()` for existence check, while API route correctly used `.limit(1)`.

**Detection:** Atlas-enhanced code review compared implementation against Section 6 patterns and caught the violation.

**Fix Applied:** Changed [src/lib/actions/disputes.ts:152](src/lib/actions/disputes.ts#L152) from `.single()` to `.limit(1)` pattern.

**Prevention:** When implementing existence checks, always use `.limit(1)` pattern. Add this to code review checklist.

---

## Storage Bucket Name Mismatch (Story 12.7-12)

**Problem:** Commission payment screenshot upload silently failed.

**Root Cause:** Migration `20251213010552_add_cash_settlement_tables.sql` created bucket named `receipts`, but code in `withdraw-client.tsx` and `settlement.ts` referenced bucket `commission-receipts`.

**Detection Pattern:**
```bash
# Check what bucket code expects
grep -r "\.from\([\"']" src/ | grep -E "receipts|proofs"

# Check what buckets exist in migrations
grep -r "storage.buckets" supabase/migrations/
```

**Solution:**
1. Created new migration `20260103100000_add_commission_receipts_bucket.sql`
2. Added `commission-receipts` bucket with correct MIME types and size limits
3. Added RLS policies for provider upload and admin view

**Prevention:**
- When implementing storage features, verify bucket name matches in:
  1. Migration file (bucket creation)
  2. Code file (`.from("bucket-name")`)
  3. RLS policies (bucket_id check)
- Add bucket name to test setup or seed script to catch mismatches early

**Key Insight:** Silent failures in file uploads are often bucket configuration issues. The upload code may look correct but fail if the bucket doesn't exist with the expected name.

---

---

## Rating/Review System (Story 12.7-13)

**Pattern:** Consumer ratings with provider average aggregation via trigger

**Database Schema:**
```sql
-- Ratings table
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES water_requests(id) ON DELETE CASCADE,
  consumer_id UUID REFERENCES profiles(id),
  provider_id UUID REFERENCES profiles(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT CHECK (comment IS NULL OR length(comment) <= 500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(request_id, consumer_id)  -- One rating per delivery
);

-- Profile aggregation columns
ALTER TABLE profiles
  ADD COLUMN average_rating DECIMAL(2,1) DEFAULT NULL,
  ADD COLUMN rating_count INTEGER DEFAULT 0;
```

**Trigger Pattern:** Automatic aggregation on insert/update:
```sql
CREATE OR REPLACE FUNCTION update_provider_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET average_rating = (
      SELECT ROUND(AVG(rating)::numeric, 1)
      FROM ratings WHERE provider_id = NEW.provider_id
    ),
    rating_count = (
      SELECT COUNT(*) FROM ratings WHERE provider_id = NEW.provider_id
    )
  WHERE id = NEW.provider_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
```

**RLS Pattern:** Optimized policies:
```sql
-- Consumers can view own and public ratings
CREATE POLICY "Anyone can view ratings" ON ratings FOR SELECT
  TO authenticated USING (true);

-- Consumers can create ratings for their delivered requests
CREATE POLICY "Consumers can create ratings" ON ratings FOR INSERT
  TO authenticated
  WITH CHECK (
    consumer_id = (select auth.uid())
    AND EXISTS (
      SELECT 1 FROM water_requests
      WHERE id = request_id
      AND consumer_id = (select auth.uid())
      AND status = 'delivered'
    )
  );
```

### UI Pattern: Auto-prompt After Delivery

**Integration:** Rating prompt auto-appears once after delivery (per session):
```typescript
// Track if prompt has been shown this session
const [hasShownRatingPrompt, setHasShownRatingPrompt] = useState(false);

// Auto-open rating dialog when conditions met
useEffect(() => {
  if (
    status === "delivered" &&
    !existingRating &&
    !ratingLoading &&
    !hasShownRatingPrompt
  ) {
    setIsRatingDialogOpen(true);
    setHasShownRatingPrompt(true);
  }
}, [status, existingRating, ratingLoading, hasShownRatingPrompt]);
```

### Component Reuse: Rating Stars

**Pattern:** Single component with interactive and readonly modes:
```typescript
interface RatingStarsProps {
  rating: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}
```

**Usage:**
- Interactive: Rating dialog input (`onChange` provided)
- Readonly: Offer cards, profile display (`readonly={true}`)

### Rating Display in Offer Cards

**Pattern:** Show rating only when `rating_count > 0`:
```typescript
const hasRating = offer.profiles?.rating_count && offer.profiles.rating_count > 0;

{hasRating ? (
  <div data-testid="provider-rating">
    <Star className="fill-yellow-400 text-yellow-400" />
    <span>{averageRating?.toFixed(1)}</span>
    <span>({ratingCount})</span>
  </div>
) : (
  <p>Proveedor verificado</p>
)}
```

### Hook Extension Pattern

**Pattern:** Extend existing query to include new fields:
```typescript
// In use-consumer-offers.ts - Add rating fields to profile join
profiles:provider_id (
  name,
  avatar_url,
  average_rating,   // NEW
  rating_count      // NEW
)
```

### Key Learnings:

1. **Trigger aggregation** - Provider averages via DB trigger, not application code
2. **One rating per delivery** - UNIQUE constraint on `(request_id, consumer_id)`
3. **Graceful fallback** - Show "Proveedor verificado" when no ratings
4. **Spanish labels** - Rating feedback: Malo, Regular, Bueno, Muy bueno, Excelente
5. **Edit vs Create** - Check existing rating to show "Editar" or "Calificar"

---

## Admin Provider Rating Display (Story 12.8-5)

**Problem:** Admin provider detail panel showed rating badge next to name in list view, but not in the detail panel when clicking into a provider.

**Root Cause:** The rating badge conditional only rendered when `rating_count > 0`:
```typescript
// ❌ INCOMPLETE - Nothing shown when provider has no ratings
{provider.rating_count && provider.rating_count > 0 && (
  <div className="rating-badge">...</div>
)}
```

**Solution:** Always show the rating badge with a fallback for no ratings:
```typescript
// ✅ CORRECT - Always shows rating info in detail panel
{provider.rating_count && provider.rating_count > 0 ? (
  <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 rounded-lg">
    <Star className="w-4 h-4 text-amber-500 fill-current" />
    <span className="text-sm font-semibold text-amber-700">
      {(provider.average_rating ?? 0).toFixed(1)}
    </span>
    <span className="text-xs text-amber-600">
      ({provider.rating_count})
    </span>
  </div>
) : (
  <span className="text-xs text-gray-400 px-2 py-0.5 bg-gray-100 rounded-lg">
    Sin calificaciones
  </span>
)}
```

**Pattern:** Consistent Rating Display
- **List view (cards):** Ternary with "Sin calificaciones" fallback ✓
- **Detail view (panel):** Ternary with "Sin calificaciones" fallback ✓ (fixed in 12.8-5)

**Files Affected:**
- `src/components/admin/provider-directory.tsx` - List view (was correct)
- `src/components/admin/provider-detail-panel.tsx` - Detail panel (fixed)

**Key Insight:** When displaying rating info in multiple views (list and detail), ensure both use the same pattern with fallback text. The detail panel should match the list view's handling of zero-rating providers.

---

*Last verified: 2026-01-05 | Sources: Epic 3, 8, 10, 11, 12, 12.6, 12.7 (Stories 12.7-2, 12.7-3, 12.7-4, 12.7-5, 12.7-12, 12.7-13), 12.8 (Stories 12.8-5, 12.8-6), Push Notification Reliability Session, Local Dev Setup, VAPID Whitespace Fix, Code Review 12.7-4, Code Review 12.7-5, Realtime Connection Loop Fix Session, Consumer Dispute Implementation, Storage Bucket Mismatch Fix, Rating/Review System, Admin Provider Rating Display Fix, Toast Font Consistency Fix*
