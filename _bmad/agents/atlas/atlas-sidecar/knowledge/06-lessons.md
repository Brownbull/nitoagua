# Historical Lessons (Retrospectives)

> Section 6 of Atlas Memory
> Last Sync: 2026-01-06
> Sources: Epic retrospectives, code reviews

## What Worked / What Failed

| Worked | Failed → Fix |
|--------|--------------|
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
| Debounced realtime refresh (500ms) | `router.refresh()` interrupts clicks → Debounce |
| `.trim()` on VAPID keys | Whitespace in env vars → Silent VAPID init failure |
| Refs pattern for realtime callbacks | useEffect re-runs on callback change → Connection loop |
| "Render then Refresh" pattern | `force-dynamic` still serves cached HTML → Fetch on mount |
| `merged-fixtures` import | `@playwright/test` import → Use merged-fixtures |
| `waitForSettingsLoaded()` helper | `waitForTimeout(1000)` → Element-based waits |
| API routes for client calls | Server actions in client components → RSC render errors |
| `.limit(1)` for existence checks | `.single()` returns 406 when no rows → Use `.limit(1)` |
| RLS policies for inserts | Admin client requires env var → Use RLS if policy allows |
| Bucket name verification | Code references wrong bucket name → Verify bucket exists |
| Ternary rating display | `&&` only renders when true → Use ternary with fallback |
| Story spec font mismatch | Story said "Inter" but app uses Poppins → Verify actual fonts |
| Sonner toast font isolation | Toast outside font context → Use explicit `!font-sans` class |

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
- Use `merged-fixtures` import, not `@playwright/test`

### PWA/Push
- Use `registration.showNotification()` not `new Notification()` (Android PWA)
- Lazy VAPID init (env vars unavailable at module load)
- **VAPID keys must be `.trim()`ed** - Vercel copy-paste adds whitespace
- Toggle based on `pushState`, not `permission`
- Edge Functions: Deploy explicitly (no auto-deploy)
- Push trigger: Call at top level after RPC success, not nested in fire-and-forget helpers

### Leaflet Maps
- **Explicit Height Required**: Use `h-dvh` (not `min-h-dvh`) on parent + `absolute inset-0` on MapContainer
- Call `map.invalidateSize()` after container becomes visible
- Use `MapResizeHandler` component for PWA tile rendering
- Pattern: Staggered delays (0ms, 100ms, 300ms, 500ms) + window resize listener

### Version Management
- `npm run version:check` - Build fails if SW_VERSION ≠ package.json
- Version bump: Update `package.json` + `public/sw.js` together

### Vercel Env Vars
- `NEXT_PUBLIC_*` = Build-time only (baked in)
- After adding: Must redeploy to take effect
- Server-only vars = Runtime read

### Local Development
- After `npx supabase db reset`: Run `npm run seed:dev-login`
- Comunas require verified providers with `is_available=true` and service areas configured
- Test users: admin/consumer/supplier@nitoagua.cl (all use `.123` suffix passwords)

---

## Hard-Won Wisdom

> "The `new Notification()` API silently fails in Android PWA standalone mode."

> "VAPID validation happens at `setVapidDetails()` call time, not send time. Check key lengths: public=87, private=43."

> "86% pass with 14 provider skips is expected, not a failure."

> "Edge Functions don't auto-deploy. Always explicitly deploy."

> "Two auth patterns: Server actions → `{requiresLogin: true}`. Layouts → `redirect()`. Don't mix."

> "Leaflet tiles blank? Use `h-dvh` on parent + `absolute inset-0` on MapContainer."

> "No comunas in dropdown after db reset? Run `npm run seed:dev-login`."

> "Admin uses 'assigned' but DB has 'accepted'? Query actual DB status values."

> "Push not received? Verify subscription exists BEFORE transaction time."

> "Clicks fail on realtime pages? Debounce `router.refresh()` with 500ms delay."

> "Partial fixes are worse than no fix - grep ALL occurrences before fixing enum mismatches."

---

## Key Pattern Quick Reference

### Push Notification Architecture
- **8 triggers**: newOffer, offerAccepted, deliveryCompleted, requestTimeout, verificationApproved, inTransit, requestFilled, requestCancelled
- **Log patterns**: `[TriggerPush]` (entry), `[Push]` (send result)
- **Verification**: Check `push_subscriptions` table, verify subscription `created_at` is BEFORE transaction

### Service Worker Navigation
- Use `postMessage` pattern (not `client.navigate()`) for notification click handling
- Include `includeUncontrolled: true` in `clients.matchAll()`
- App listens via `navigator.serviceWorker.addEventListener("message", ...)`

### Realtime Hook Stability
- Use refs pattern to decouple callback identity from subscription lifecycle
- `onOrderChangeRef.current = onOrderChange` in separate effect
- Subscription effect only depends on `[enabled, router, debounceMs]`

### Stale Data Prevention
- "Render then Refresh" pattern: Initial server render + `useEffect` fetch on mount
- Server actions bypass CDN cache; `router.refresh()` may not

### Status Enum Reference
| Status | DB Value | Admin Display |
|--------|----------|---------------|
| Pending | `pending`, `offers_pending`, `no_offers` | Pendiente |
| Accepted | `accepted` | Aceptados |
| En Route | `en_route` | En Camino |
| Delivered | `delivered` | Entregados |
| Cancelled | `cancelled` | Cancelados |

### Supabase Query Patterns
| Method | Use When | Returns on No Rows |
|--------|----------|-------------------|
| `.single()` | Must return exactly one row | 406 error |
| `.maybeSingle()` | May return 0 or 1 row | null |
| `.limit(1)` | Existence check | Empty array |

### Server Actions vs API Routes
- **Server Actions**: Server components, form actions
- **API Routes**: Client component onClick/useEffect calls (avoids RSC errors)

---

## Epic-Specific Learnings

### Epic 12.6 - Session Handling
- Pattern in Section 4 (Architecture): `ensureValidSession()`, visibility checks, `requiresLogin` flag

### Epic 12.7 - Bug Fixes
- VAPID whitespace fix: `.trim()` on env vars
- Realtime debounce: 500ms delay on `router.refresh()`
- Status config duplication: Always grep ALL files for enum fixes
- Type generation: After schema changes → `generate_typescript_types` → update `database.ts`

### Epic 12.8 - Admin UX
- SW ready timeout: Wrap with 3s timeout to prevent hang
- Push cleanup: Call `cleanupPushBeforeLogout()` BEFORE `signOut()`
- Endpoint dedup: Delete other users' subscriptions for same endpoint
- Rating display: Use ternary with "Sin calificaciones" fallback in both list and detail views

---

## Storage & Ratings Patterns

### Storage Buckets
- Always verify bucket name matches in: migration, code (`.from("bucket-name")`), and RLS policies
- Silent upload failures often indicate bucket doesn't exist with expected name

### Rating System
- One rating per delivery: `UNIQUE(request_id, consumer_id)` constraint
- Provider aggregation via trigger: `update_provider_rating()` function
- Auto-prompt: Show rating dialog once per session after delivery
- Display: "Sin calificaciones" fallback when `rating_count === 0`

---

*Last verified: 2026-01-06 | Generation 5 optimization: Consolidated verbose debugging narratives, removed duplicate code examples (→ Section 4), merged push notification sections*
