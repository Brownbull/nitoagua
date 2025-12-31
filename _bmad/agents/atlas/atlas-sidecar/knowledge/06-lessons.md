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
- Call `map.invalidateSize()` after container becomes visible (wizard steps, tabs)
- Use `MapResizeHandler` component inside `<MapContainer>` to fix tile rendering in PWA
- Pattern: 100ms delay after mount, plus window resize listener
- Test tiles with `img[src*='tile.openstreetmap.org']` locator

### Version Management
- `npm run version:check` - Build fails if SW_VERSION ≠ package.json
- Version bump: Update `package.json` + `public/sw.js` together

### Vercel Env Vars
- `NEXT_PUBLIC_*` = Build-time only (baked in)
- After adding: Must redeploy to take effect
- Server-only vars = Runtime read

---

## Hard-Won Wisdom

> "The `new Notification()` API silently fails in Android PWA standalone mode."

> "VAPID validation happens at `setVapidDetails()` call time, not send time."

> "86% pass with 14 provider skips is expected, not a failure."

> "Edge Functions don't auto-deploy. Always explicitly deploy."

> "Two auth patterns: Server actions → `{requiresLogin: true}`. Layouts → `redirect()`. Don't mix."

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

*Last verified: 2025-12-30 | Sources: Epic 3, 8, 10, 11, 12, 12.6*
