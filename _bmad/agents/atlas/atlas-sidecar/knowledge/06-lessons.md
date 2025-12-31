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

---

## Push Notification Debugging (Epic 12.7)

**Story 12.7-2 Findings:**
- Triggers ARE called (contrary to original bug assumption)
- Edge Function NOT used for push - web-push npm library is used directly from server actions
- Key log patterns: `[TriggerPush]` (entry), `[Push]` (send result)

| Log Message | Meaning |
|-------------|---------|
| `[TriggerPush] triggerNewOfferPush called` | Server action invoked trigger |
| `[Push] No subscriptions found for user` | User never enabled push on device |
| `[Push] Found N subscription(s)` | User has active subscription(s) |
| `[Push] Sent M/N push notifications` | Delivery attempted |

**Verification Steps:**
1. Check `push_subscriptions` table for user
2. Verify subscription `created_at` is BEFORE transaction
3. Check Vercel logs for `[Push]` messages
4. VAPID keys: `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` must be in Vercel env

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

*Last verified: 2025-12-31 | Sources: Epic 3, 8, 10, 11, 12, 12.6, 12.7 (Story 12.7-4 BUG-011), Local Dev Setup*
