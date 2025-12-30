# Historical Lessons (Retrospectives)

> Section 6 of Atlas Memory
> Last Sync: 2025-12-30
> Sources: docs/sprint-artifacts/retrospectives/, epic retrospectives

## What Worked

| Pattern | Context | Epic |
|---------|---------|------|
| Per-test seeding | Deterministic, isolated tests | Epic 8+ |
| shadcn/ui AlertDialog | Consistent UX, accessible by default | 3-6 |
| Optimistic UI with Set tracking | Fast perceived performance | 3-5 |
| Tab preservation via `?from=` | Maintains context on navigation | 3-4 |
| Admin client for RLS bypass | Clean separation of concerns | 2-7, 3-1 |
| Server component for guest access | Guest token pages need RLS bypass | 10-1 |
| Google OAuth only | Simpler auth, no password management | ADR-004 |
| Consumer-choice offers | Simpler than push assignment | Epic 8 |
| Supabase Realtime | Zero cost, instant notifications | Epic 8 |
| Leaflet + OpenStreetMap | Free, works with `dynamic()` import | Epic 12 |

## What Failed

| Failure | Prevention |
|---------|------------|
| Manual click testing bottleneck | Adopt Playwright early |
| Complex table-based layouts | Use card-based designs |
| WebKit test flakiness | Focus on Chromium, accept some flakiness |
| Mixed auth strategies | Pick one auth method early |
| Hardcoded constants mismatched docs | Always check Atlas Section 4 |
| Seed data mismatched constants | Reference source constants, not hardcode |
| SW_VERSION drift from package.json | Build checks via `npm run version:check` |
| NEXT_PUBLIC_* env vars not in build | Redeploy after adding Vercel env vars |

---

## Patterns to Always Follow

1. **shadcn/ui components** - Accessible, customizable
2. **Server Actions for mutations** - Type-safe, composable
3. **Admin client for elevated access** - Clear separation
4. **Optimistic UI with Set tracking** - Track pending by ID
5. **Card-based dashboards** - Works on mobile
6. **Per-test seeding** - Deterministic, isolated
7. **Centralize pricing** - Single source in `src/lib/utils/commission.ts`
8. **aria-busy/aria-live** - Loading state accessibility
9. **Consistent auth failure response** - Use `ActionResult<T>` with `requiresLogin` flag

## Patterns to Always Avoid

1. Complex table layouts → Use cards
2. Mixed auth methods → Pick OAuth or email
3. Skip E2E tests → Manual doesn't scale
4. Share test state → Each test seeds own data
5. Hardcode pricing → Use `getDeliveryPrice()`

---

## Security Patterns

### PostgreSQL Functions
ALL functions MUST include `SET search_path`:
```sql
CREATE OR REPLACE FUNCTION my_function()
RETURNS ... SECURITY DEFINER
SET search_path = public  -- REQUIRED
AS $$ ... $$;
```

**After every migration:** Run `mcp__supabase__get_advisors type=security`

### RLS Policy Verification
- Test policies with Playwright before production
- Verify role names match across policies (`'supplier'` not `'provider'`)
- Guest access flows need early debugging

---

## UI/Component Patterns

### Force-Dynamic for Admin Pages
Pages with real-time database queries MUST disable Vercel caching:
```typescript
// src/app/admin/verification/page.tsx
export const dynamic = "force-dynamic";
```

**Required on:** `/admin/verification`, `/admin/orders`, `/admin/dashboard`

### Dynamic Import for SSR Bypass (Leaflet)
```typescript
const LocationPinpoint = dynamic(
  () => import("./location-pinpoint").then((mod) => mod.LocationPinpoint),
  { ssr: false, loading: () => <MapLoadingSkeleton /> }
);
```

### Mobile Screen Adaptability
- `min-h-dvh` for dynamic viewport height
- `safe-area-bottom` for notched devices
- `flex-1 overflow-y-auto` for scrollable content
- Standalone fallback components use `min-h-dvh` directly, NOT `flex-1`

---

## Testing Lessons (Consolidated)

### assertNoErrorState
- Call after EVERY `page.goto()`
- Import from `../fixtures/error-detection`
- NOT needed for: pure unit tests, regex validation, auth redirects
- NEEDED for: page navigation, `.isVisible().catch(() => false)` patterns

### Selector Strict Mode
- `getByText()` matches multiple? Use `{ exact: true }` or `getByTestId()`
- Dynamic testids? Use `[data-testid^="notification-item-"]` prefix selector
- Text in multiple places? Use `.first()` or more specific selector

### Wait Patterns
- Replace `waitForTimeout()` with element-visible assertions
- Use `page.waitForLoadState("networkidle")` for AJAX completion

### Seed Script Rules
- ALL FK fields must be mapped to actual user IDs
- Verify column existence before including in production seeds
- Exit with error code if seeded data is missing

---

## Push Notifications (Epic 12)

### Lazy VAPID Initialization
```typescript
let vapidInitialized = false;
function initVapid(): boolean {
  if (vapidInitialized) return true;
  webpush.setVapidDetails(subject, publicKey, privateKey);
  vapidInitialized = true;
  return true;
}
```
**Why:** `setVapidDetails()` at module load fails when env vars unavailable

### PWA Notification Pattern
```typescript
// ❌ Fails in Android PWA standalone mode
new Notification("Title", options);

// ✅ Works everywhere
const registration = await navigator.serviceWorker.ready;
await registration.showNotification("Title", options);
```

### Toggle State Logic
Base toggle on `pushState === "subscribed"`, not `permission === "granted"`.
Permission persists even after unsubscribe.

### Edge Function Deployment
- Edge Functions don't auto-deploy with code pushes
- Deploy explicitly: `mcp__supabase__deploy_edge_function`
- Configure secrets in Supabase Dashboard, not Vercel

---

## Validation Story Patterns

### Test File Tracking
Before marking validation stories complete:
```bash
git status tests/e2e/  # Check for untracked files
```

### Expected Skip Rates
| Environment | Rate | Skips |
|-------------|------|-------|
| Local | ~86% | 14 (provider auth) |
| Production | ~86% | 14 (same) |

### Manual Verification
Cross-reference E2E test counts instead of clicking every button:
> "E2E verified: 14 tests for map step"

Only user-device-dependent items require real manual testing.

---

## Hard-Won Wisdom

> "The `new Notification()` API silently fails in Android PWA standalone mode. Always use Service Worker's `showNotification()`."

> "VAPID validation happens at `setVapidDetails()` call time, not at send time."

> "Local validation stories have predictable skip rates. 86% pass with 14 provider skips is expected, not a failure."

> "Manual verification doesn't mean clicking every button. Cross-reference E2E test counts to prove coverage exists."

> "Edge Functions don't auto-deploy. Always explicitly deploy via MCP or CLI after changes."

> "Run Supabase security advisors after every migration to catch `function_search_path_mutable` warnings immediately."

> "Two auth patterns are valid: Server actions return `{requiresLogin: true}` for client-side redirect. Layout guards use Next.js `redirect()` for automatic redirect. Don't mix within the same module."

---

## Session Handling Pattern (Epic 12.6)

### Server Actions - Use `requiresLogin` Flag
```typescript
// src/lib/types/action-result.ts
import { createAuthError, type ActionResult } from "@/lib/types/action-result";

export async function myServerAction(): Promise<ActionResult> {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return createAuthError();  // { success: false, error: "...", requiresLogin: true }
  }
  // ... rest of action
}
```

### Layout Guards - Use `redirect()`
```typescript
// src/lib/auth/guards.ts
export async function requireAdmin(): Promise<User> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");  // Throws, never returns
  return user;
}
```

### Client Handler (Gradual Adoption)
```typescript
// src/lib/hooks/use-action-handler.ts - Available for future use
const { handleAction } = useActionHandler();
const result = await handleAction(() => myServerAction());
// Automatically redirects if result.requiresLogin
```

---

## PWA Version Management

### Version Sync (Automated Check)
Build will fail if versions don't match:
```bash
npm run version:check  # Runs automatically before build
```

Script location: `scripts/check-version.js`

### Version Bump Checklist
When bumping app version:
1. Update `package.json` version
2. Update `public/sw.js` SW_VERSION to match
3. Run `npm run version:check` to verify
4. Commit both files together

---

## Vercel Environment Variables

### NEXT_PUBLIC_* Variables Are Build-Time Only
- These are **baked into the JavaScript bundle** at build time
- Adding to Vercel Dashboard does **NOT** automatically deploy
- The app uses the values from when it was **last built**

### After Adding/Changing NEXT_PUBLIC_* Vars
1. Add the env var in Vercel Dashboard
2. **Trigger a new deployment:**
   - Push any commit, OR
   - Go to Vercel → Deployments → "..." → "Redeploy"
3. Verify the new build includes the value

### Server-Side vs Client-Side Env Vars
| Prefix | Available | When Read |
|--------|-----------|-----------|
| `NEXT_PUBLIC_*` | Client + Server | Build time (baked in) |
| No prefix | Server only | Runtime |

---

*Last verified: 2025-12-30 | Sources: Epic 3, 8, 10, 11, 12, 12.6 retrospectives and code reviews*
