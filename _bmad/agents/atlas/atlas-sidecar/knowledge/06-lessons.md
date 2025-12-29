# Historical Lessons (Retrospectives)

> Section 6 of Atlas Memory
> Last Sync: 2025-12-18
> Sources: docs/sprint-artifacts/retrospectives/, epic retrospectives

## What Worked

| Lesson | Context | Epic/Story |
|--------|---------|------------|
| **Browserless MCP for navigation testing** | Parallel testing dramatically improved | Epic 3 |
| **shadcn/ui AlertDialog for confirmations** | Consistent UX, accessible by default | 3-6 |
| **Optimistic UI with Set tracking** | Fast perceived performance | 3-5 |
| **Tab preservation via `?from=` param** | Maintains context on navigation | 3-4 |
| **Per-test seeding pattern** | Deterministic, isolated tests | Epic 8 |
| **Admin client for RLS bypass** | Clean separation of concerns | 2-7, 3-1 |
| **Server component + admin client for guest access** | Guest token pages need RLS bypass on server | 10-1 |
| **Google OAuth only** | Simpler auth, no password management | ADR-004 |

## What Failed

| Failure | Root Cause | Prevention |
|---------|------------|------------|
| **Manual click testing became bottleneck** | No automated E2E coverage | Adopt Playwright early |
| **Complex table-based layouts** | Accessibility issues, poor mobile UX | Use card-based designs |
| **WebKit test flakiness** | Browser-specific timing issues | Focus on Chromium, accept some flakiness |
| **Mixed auth strategies (email + OAuth)** | Complexity without benefit | Pick one auth method early |
| **Hardcoded defaults mismatched docs** | Code used 15% commission when docs said 10% | Always check Atlas Section 4 for constants |
| **Duplicate utility functions** | Same `getPrice()` in 2 places in same file | Extract to shared utility immediately |
| **Seed data mismatched constants** | Seed used Santiago-area comunas, COMUNAS constant has Villarrica-area | Seed scripts should reference source constants, not hardcode IDs |

## Hard-Won Wisdom

### From Epic 3 Retrospective

> "Browserless MCP for parallel navigation testing - one of the best developer experience improvements of the project."

> "Pattern reuse is powerful - the offer system built on patterns from request handling, card layouts from admin verification."

### From Epic 8 Retrospective

> "Consumer-choice offers (letting consumers pick) is simpler than push assignment. Let the user decide."

> "Realtime subscriptions from Supabase are essentially free and provide instant UI updates."

## Patterns to Avoid

1. **Don't build complex table layouts** - Use cards with filtering/sorting instead
2. **Don't mix authentication methods** - Pick OAuth or email, not both
3. **Don't skip E2E tests** - Manual testing doesn't scale
4. **Don't share test state between tests** - Each test seeds its own data
5. **Don't ignore WebKit** - But don't block on its flakiness either

## Patterns to Follow

1. **Use shadcn/ui components** - Accessible, customizable, code ownership
2. **Server Actions for mutations** - Type-safe, composable
3. **Admin client pattern for elevated access** - Clear separation from user context
4. **Optimistic UI with Set tracking** - Track pending operations by ID
5. **Tab preservation with query params** - User context survives navigation
6. **Card-based dashboards** - Works on mobile, scannable on desktop
7. **Per-test seeding** - Deterministic, isolated, debuggable
8. **Centralize pricing/commission utilities** - Single source of truth in `src/lib/utils/commission.ts`
9. **Add aria-busy/aria-live for loading states** - Accessibility for period selectors, data refreshes

## Code Pattern References

| Pattern | Location | Story |
|---------|----------|-------|
| **Optimistic UI (Set tracking)** | See 04-architecture.md | 3-5 |
| **Tab Preservation (?from= param)** | See 04-architecture.md | 3-4 |
| **Centralized pricing utility** | `src/lib/utils/commission.ts` | 8-6 |
| **Dynamic import for SSR bypass** | `map-wrapper.tsx` | 8-10 |
| **Full-screen page layout override** | `provider/layout.tsx` | 8-10 |

---

## Epic 8 Retrospective (2025-12-19)

**Delivered:** 10 stories, ~160 E2E tests, ~95 unit tests

### Key Wins

- Atlas code reviews caught real issues (DRY violations, seed mismatches, z-index bugs)
- Per-test seeding scales well at 160+ tests
- Supabase Realtime + 30s polling fallback is reliable and free
- Leaflet + OpenStreetMap works well with `dynamic()` import

### Code Review Lessons (Epic 8)

| Issue | Root Cause | Prevention |
|-------|------------|------------|
| Seed data mismatch | Scripts hardcoded IDs vs constants | Reference source constants |
| Z-index battles | Stacking contexts | Hide parent layout via `usePathname()` |
| Duplicate back buttons | Prop not passed to component | `hideBackButton` prop pattern |
| Disabled features unclear | No visual indicator | `disabled` + `cursor-not-allowed` + tooltip |

### Process Adopted

- **@health tests first** - Database health checks run before E2E suite
- **Tech spec before stories** - Run `atlas-epic-tech-context` workflow
- **Full-screen pages** - Hide parent layout via `usePathname()` conditional

---

## Epic 10 Code Review Lessons (2025-12-21)

| Story | Issue | Prevention |
|-------|-------|------------|
| 10-4 | Seed script missing test data | Add to BOTH `tests/fixtures/test-data.ts` AND `scripts/local/seed-test-data.ts` |
| 10-4 | Registered consumer email missed | Check BOTH `guest_email` and `profiles?.email` for notifications |
| 10-4 | E2E tests not using merged-fixtures | New tests: `import { test } from '../support/fixtures/merged-fixtures'` |
| 10-4 | Missing assertNoErrorState | Call `assertNoErrorState(page)` after `page.goto()` |
| 10-5 | Dead component left in codebase | Delete old component immediately when replacing |
| 10-5 | Missing database column | Migration first → update types → update code |
| 10-5 | Story AC didn't match mockup | Update ACs after mockup alignment |
| 10-5 | TypeScript types not regenerated | Run `npx supabase gen types typescript` after migrations |

### Key Patterns from Epic 10

- **Dual email source:** `const email = request.guest_email || request.profiles?.email;`
- **Seed-fixture sync:** Every test fixture constant needs matching seed data
- **Timeline component:** 4-step timelines with status-contextual labels
- **Dead code rule:** Delete unused components immediately

---

---

### Story 11-1: Chrome Extension E2E Testing (2025-12-22)

| Issue | Root Cause | Prevention |
|-------|------------|------------|
| **RLS blocked offer creation** | Policy checks `role = 'provider'` but profiles use `role = 'supplier'` | Run migrations on production; verify role names match across policies |
| **Consumer can't view own requests** | Missing/incorrect RLS policy | Test RLS policies with Playwright before production E2E |
| **Tracking page broken** | Unknown RLS or routing issue | Debug guest access flows early |
| **Chrome Extension E2E too fragile for early testing** | Cascading failures when RLS/permissions fail | Use Chrome Extension E2E only on polished apps |

### Patterns for Chrome Extension E2E Testing

1. **Prerequisites for Chrome Extension E2E on production:**
   - All RLS policies verified via Playwright tests
   - Manual testing confirms happy path works
   - No known blocking issues in core flows

2. **Testing progression (recommended order):**
   - **First**: Playwright tests (fast iteration, catches RLS issues)
   - **Second**: Manual testing (catches UX issues)
   - **Last**: Chrome Extension E2E (final production validation)

3. **When Chrome Extension E2E fails early, stop and fix:**
   - Don't try to work around RLS issues with admin scripts
   - Fix the root cause first, then resume testing
   - Each workaround compounds complexity and wastes time

4. **Admin scripts are for debugging, not testing:**
   - Scripts like `create-test-offer.ts` help diagnose issues
   - But they shouldn't be used to "complete" an E2E test
   - If you need admin bypass, the test is blocked, not passed

---

### Story 11A-1: P10 Delivery Completion (2025-12-22)

**Issue:** Delivery completion button was disabled with "Coming soon" text, blocking CHAIN-1 E2E tests.

| Fix Applied | Pattern Used |
|------------|--------------|
| **Server Action pattern** | `completeDelivery(offerId)` in `src/lib/actions/delivery.ts` |
| **AlertDialog confirmation** | Standard shadcn/ui confirmation dialog before action |
| **Commission recording** | Integrated with existing `commission_ledger` table |
| **Dual notification paths** | In-app for registered consumers, email for guests |
| **data-testid for Playwright** | `complete-delivery-button` selector for reliable tests |

**Key Lesson:** When tests find disabled/placeholder features, create a gap story (Epic 11A) to track and fix them immediately.

---

### Story 11-2: CHAIN-1 Production Testing (2025-12-22)

**Issues Found & Fixed:**

| Issue | Root Cause | Prevention |
|-------|------------|------------|
| **SECURITY DEFINER functions vulnerable** | `select_offer` and `update_updated_at_column` lacked `SET search_path` | Always add `SET search_path = public` to SECURITY DEFINER functions |
| **Migration drift local/production** | Migrations applied via Supabase dashboard with auto-generated timestamps | Always apply migrations via `supabase db push` or commit SQL files first |
| **Test credentials in story files** | Passwords hardcoded in markdown | Store in `.env.production.local`, reference in docs |
| **Production user IDs in git** | Baseline JSON committed with UUIDs | Add baseline files to `.gitignore` |

**Security Patterns:**

1. **SECURITY DEFINER functions must include:**
   ```sql
   CREATE OR REPLACE FUNCTION my_function()
   RETURNS ...
   LANGUAGE plpgsql
   SECURITY DEFINER
   SET search_path = public  -- REQUIRED for security
   AS $$ ... $$;
   ```

2. **Run security check after DB changes:**
   ```
   mcp__supabase__get_advisors type=security
   ```

3. **Production test data hygiene:**
   - Baseline files with user IDs → `.gitignore`
   - Passwords → `.env.production.local`
   - Never commit SERVICE_ROLE_KEY references

**Key Lesson:** Run Supabase security advisors after every migration to catch `function_search_path_mutable` and `rls_disabled_in_public` warnings immediately.

---

---

### Story 11-19: Admin Orders & Settlement (2025-12-24)

**Issues Found in Code Review:**

| Issue | Root Cause | Prevention |
|-------|------------|------------|
| **Missing `force-dynamic` on admin pages** | Used `revalidate = 30` instead of force-dynamic for admin dashboards | Admin pages with real-time counts MUST use `export const dynamic = "force-dynamic"` |
| **Missing `assertNoErrorState` in tests** | New test file didn't follow testing patterns | Call `assertNoErrorState(page)` after EVERY `page.goto()` in tests |
| **Arbitrary `waitForTimeout` delays** | Test used `waitForTimeout(500)` for search debounce | Use element-based waits (e.g., `expect(page.getByTestId("title")).toBeVisible()`) |
| **Unused constants in test files** | Dead code left from development | Remove unused constants during review |
| **Wrong import paths** | Test file used non-existent `../support/helpers/assertions` | Use `../fixtures/error-detection` for assertNoErrorState import |

**Key Patterns from Story 11-19:**

- **Admin dashboard caching:** ALWAYS use `export const dynamic = "force-dynamic"` for admin dashboards
- **Import path for error detection:** `import { assertNoErrorState } from "../fixtures/error-detection"`
- **Wait pattern:** Replace `waitForTimeout()` with element-visible assertions
- **Test file cleanup:** Remove unused constants and fix import paths during initial review

---

### Story 12-3: Negative Status States (2025-12-25)

**Issues Found in Code Review:**

| Issue | Root Cause | Prevention |
|-------|------------|------------|
| **Seed script missing `cancelled_by` mapping** | `cancelled_by` field referenced static ID, not actual user ID | Map ALL foreign key fields in seed scripts: `supplier_id`, `consumer_id`, AND `cancelled_by` |
| **Test selectors matched multiple elements** | `getByText("Cancelado")` matched timeline step AND cancellation timestamp | Use `getByTestId()` for unique selectors when text appears multiple times |
| **Inconsistent cancelled_by logic** | Track page only checked `null`, request-status-client checked `null OR consumer_id` | Align logic across all pages that handle the same state |
| **Missing `assertNoErrorState` calls** | New test file didn't follow testing patterns | Import from `../fixtures/error-detection` and call after EVERY `page.goto()` |
| **Tests not using merged-fixtures** | Test file used plain `@playwright/test` import | Use `import { test, expect } from "../support/fixtures/merged-fixtures"` |
| **Missing mobile viewport test** | DoD required mobile testing but no test existed | Add `test.use({ viewport: { width: 360, height: 780 }, isMobile: true })` test block |

**Key Patterns from Story 12-3:**

- **Foreign key mapping in seed scripts:** ALL FK fields must be mapped to actual user IDs:
  ```typescript
  if (mapped.cancelled_by === TEST_SUPPLIER.id) {
    mapped.cancelled_by = userIds.supplierActualId;
  }
  ```
- **Strict mode violations:** When `getByText()` matches multiple elements, use `getByTestId()` or `.first()`
- **Cancelled state detection:** Check BOTH `cancelled_by === null` AND `cancelled_by === consumer_id`
- **Component test IDs:** Use data-testid with variant suffix: `data-testid="negative-status-{variant}"`

---

---

### Story 12-6: Web Push Notifications (2025-12-28)

**Issues Found & Fixed:**

| Issue | Root Cause | Prevention |
|-------|------------|------------|
| **Push subscriptions table 404** | Migration file existed locally but not applied to production | Apply migrations to production via `mcp__supabase__apply_migration` or `supabase db push` |
| **VAPID build-time error** | `web-push.setVapidDetails()` called at module load, before env vars available | Use **lazy initialization** - call `setVapidDetails()` on first use, not at import |
| **Toggle stayed ON after unsubscribe** | `isToggleChecked` based on `permission === "granted"` (browser permission doesn't change) | Base toggle state on `pushState === "subscribed"` only, not browser permission |
| **Test notification silent fail on Android PWA** | `new Notification()` constructor doesn't work in PWA standalone mode | Use `ServiceWorkerRegistration.showNotification()` instead |
| **Old UI served from cache** | Service worker version `1.1.0` while app was `2.1.0` | Sync SW_VERSION with app version in package.json |

**Key Patterns from Story 12-6:**

1. **Lazy VAPID Initialization for web-push:**
   ```typescript
   let vapidInitialized = false;
   function initVapid(): boolean {
     if (vapidInitialized) return true;
     // Only call setVapidDetails() when actually needed
     webpush.setVapidDetails(subject, publicKey, privateKey);
     vapidInitialized = true;
     return true;
   }
   ```

2. **PWA Notification Pattern (Android compatible):**
   ```typescript
   // Don't use: new Notification("Title", options);
   // Use instead:
   const registration = await navigator.serviceWorker.ready;
   await registration.showNotification("Title", options);
   ```

3. **Service Worker Version Sync:**
   - `public/sw.js` → `SW_VERSION` must match `package.json` version
   - Version mismatch causes stale cache issues

4. **Push Toggle State Logic:**
   - Base toggle on subscription state, not browser permission
   - `permission === "granted"` persists even after unsubscribe
   - `pushState === "subscribed"` accurately reflects active subscription

5. **Migration Application Order:**
   - Local migrations don't auto-sync to production
   - Apply via Supabase MCP or CLI before testing

**Hard-Won Wisdom:**

> "The `new Notification()` API silently fails in Android PWA standalone mode. Always use Service Worker's `showNotification()` for PWA compatibility."

> "VAPID validation happens at `setVapidDetails()` call time, not at send time. If called at module load, build will fail when env vars aren't available."

> "Browser notification permission and push subscription are separate concepts. Permission can be 'granted' while not actively subscribed to push."

---

### Story 12-6: Web Push Notifications Code Review (2025-12-28)

**Issues Fixed in Code Review:**

| Issue | Root Cause | Prevention |
|-------|------------|------------|
| **Missing `SET search_path`** | Trigger function `update_push_subscription_updated_at` lacked security hardening | ALL PostgreSQL functions MUST include `SET search_path = public` (applies migration after initial) |
| **Missing AC integration** | `triggerRequestTimeoutPush()` defined but never called in cron job | Verify all trigger functions are actually CALLED, not just defined |
| **Test selector matched multiple** | `getByText("Notificaciones")` matched 4 elements including "Notificaciones Push" | Use `{ exact: true }` or unique `getByTestId()` selectors |

**Key Patterns:**

1. **Security function check after migrations:**
   - Run `mcp__supabase__get_advisors type=security` after every migration
   - Look for `function_search_path_mutable` warnings
   - Apply fix migration: `CREATE OR REPLACE FUNCTION ... SET search_path = public`

2. **AC verification pattern:**
   - Don't trust that defining a function means AC is complete
   - Grep for actual CALLS to the function, not just definitions
   - Example: `grep "triggerRequestTimeoutPush" src/` should show imports AND calls

3. **Strict mode test selectors:**
   - When text appears in nested/related phrases, use exact match
   - Pattern: `getByText("Notificaciones", { exact: true })`
   - Alternative: Add unique `data-testid` to target element

---

### Story 12-11: Push Notifications Local Validation (2025-12-28)

**Testing Limitations Documented:**

| Limitation | Reason | Solution |
|------------|--------|----------|
| **Cannot test permission grant** | Playwright can't interact with browser permission dialog | Manual testing on real device |
| **Cannot test push subscription** | Requires user interaction with permission dialog | Manual Android PWA testing |
| **Cannot test push delivery** | Requires real service worker and push service | Manual testing documented in story |
| **Dev login skip tests** | Tests skip when `NEXT_PUBLIC_DEV_LOGIN=false` | Intentional design for CI portability |

**Environment Variable Behavior:**

1. **Playwright receives env vars correctly** - Variables passed like `NEXT_PUBLIC_DEV_LOGIN=true npx playwright test` reach test file at module load time
2. **webServer inherits env vars** - Playwright's webServer command inherits parent process env
3. **Existing server conflict** - If server already running on port, Playwright reuses it (ignoring new env vars)

**Key Patterns:**

1. **Stop existing servers before testing:**
   ```bash
   pkill -f "next dev" 2>/dev/null
   fuser 3005/tcp 2>/dev/null | xargs kill -9 2>/dev/null
   ```

2. **Environment variable passing:**
   ```bash
   NEXT_PUBLIC_DEV_LOGIN=true DISPLAY= npx playwright test tests/e2e/push-subscription.spec.ts
   ```

3. **Graceful skip pattern for optional tests:**
   ```typescript
   const skipIfNoDevLogin = process.env.NEXT_PUBLIC_DEV_LOGIN !== "true";
   test.skip(skipIfNoDevLogin, "Dev login required for tests");
   ```

4. **Manual test documentation in checkpoint stories:**
   - Fill results tables referencing parent story's testing results
   - Link back to actual device testing in parent story

---

### Story 12-12: Push Notifications Production Validation (2025-12-28)

**Production Deployment Lessons:**

| Issue | Root Cause | Prevention |
|-------|------------|------------|
| **Edge Function not auto-deployed** | Edge Functions require manual deployment via MCP or CLI | Deploy Edge Functions explicitly with `mcp__supabase__deploy_edge_function` |
| **Tests skipped without BASE_URL** | Playwright defaulted to localhost when BASE_URL not set | Always set `BASE_URL="https://production.url"` for production E2E tests |
| **Edge Function secrets not set** | VAPID keys needed in Edge Function runtime, not just Vercel | Configure secrets in Supabase Dashboard → Edge Functions → Secrets |

**Key Patterns:**

1. **Edge Function Deployment:**
   ```bash
   # Deploy Edge Function to production
   mcp__supabase__deploy_edge_function name="send-push-notification" files=[{name:"index.ts", content:"..."}]

   # Verify deployment
   mcp__supabase__list_edge_functions
   ```

2. **Production E2E Test Command Pattern:**
   ```bash
   BASE_URL="https://nitoagua.vercel.app" \
   NEXT_PUBLIC_SUPABASE_URL="..." \
   NEXT_PUBLIC_SUPABASE_ANON_KEY="..." \
   NEXT_PUBLIC_DEV_LOGIN=true \
   DISPLAY= timeout 180 npx playwright test tests/e2e/test.spec.ts \
     --project=chromium --workers=1 --reporter=list
   ```

3. **Edge Function Secrets Configuration:**
   - Supabase Dashboard → Edge Functions → [function name] → Secrets
   - Required for VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT
   - Different from Vercel environment variables

**Hard-Won Wisdom:**

> "Edge Functions don't auto-deploy with code pushes. Always explicitly deploy via MCP or Supabase CLI after changes."

> "BASE_URL environment variable is critical for production Playwright tests. Without it, tests run against localhost even with production credentials."

---

### Story 12-13: Epic 12 Full Local Validation (2025-12-28)

**Issues Found in Atlas Code Review:**

| Issue | Root Cause | Prevention |
|-------|------------|------------|
| **Untracked test file** | New integration test file `epic12-integration.spec.ts` not added to git | Always run `git status` before marking validation stories complete to catch untracked test files |
| **Test file names mismatch docs** | Story documented wrong filenames (`consumer-negative-status.spec.ts` vs actual `negative-status-states.spec.ts`) | Copy-paste actual filenames from filesystem, not from memory |
| **Grep pattern mismatch** | `--grep "12-"` doesn't match test descriptions like "Story 12-X" | Use `--grep "Story 12-"` or run explicit file list |
| **Provider login tests skip silently** | Dev-login component uses production credentials (`supplier@nitoagua.cl`) which don't exist in local Supabase | Expected behavior - provider tests validated on production (12-14) |

**Key Patterns from Story 12-13:**

1. **Test file tracking rule:**
   - Before marking validation stories complete, run:
     ```bash
     git status tests/e2e/
     ```
   - Add ANY untracked test files before committing

2. **Documentation file name verification:**
   - Verify file names exist with:
     ```bash
     ls tests/e2e/*.spec.ts | grep -E "(pattern)"
     ```
   - Don't trust copy-pasted names from prior documentation

3. **Local vs Production test expectations:**
   - Consumer-facing features: Fully testable locally (86% pass rate expected)
   - Provider-facing features: Skip locally, validate on production
   - Push notifications: UI testable, actual push requires production

4. **Validation story checklist:**
   - [ ] All test files tracked in git
   - [ ] Test commands in story use actual filenames
   - [ ] Skipped tests documented with clear reasons
   - [ ] Production validation story drafted for remaining tests

**Hard-Won Wisdom:**

> "Local validation stories (like 12-13) have predictable skip rates. 86% pass rate with 14 provider skips is expected, not a failure."

> "Always verify test files are tracked BEFORE code review. The 'untracked file' issue is easy to miss when tests all pass."

---

---

### Story 12-14: Epic 12 Full Production Validation (2025-12-28)

**Production Validation Lessons:**

| Issue | Root Cause | Prevention |
|-------|------------|------------|
| **Provider tests skip on production** | Dev login uses `supplier@nitoagua.cl` which doesn't exist in production database (by design) | Expected - provider tests validated via production auth credentials, not dev login |
| **86% pass rate is target, not failure** | 14 tests skip (12 provider auth + 2 seed data dependent) | Document expected skip counts in validation stories |
| **Manual verification via E2E coverage** | Most manual items verifiable by referencing E2E test counts | Link manual checklist items to specific E2E test counts |
| **Android push requires real device** | Playwright cannot simulate push permission grant or service worker push events | Document user-action-required items explicitly |

**Key Patterns from Story 12-14:**

1. **Production validation story structure:**
   - Task 1: Prerequisites verification (commit pending, deployment ready)
   - Task 2: Full test suite execution with breakdown by phase
   - Task 3: Manual verification with E2E test cross-references
   - Task 4: Cross-browser check (Chromium + mobile viewport)
   - Task 5: Documentation update with results

2. **Test Results Summary format:**
   ```markdown
   | Phase | Test Count | Pass | Fail | Skip |
   |-------|------------|------|------|------|
   | Phase 1: UI & Status | 33 | 33 | 0 | 0 |
   | Phase 2: Form Enhancements | 50 | 48 | 0 | 2 |
   | **Total** | **98** | **84** | **0** | **14** |
   ```

3. **Manual verification cross-reference:**
   - Instead of manual clicking, reference: "E2E verified: 14 tests for map step"
   - This proves coverage exists without redundant manual testing
   - Only user-device-dependent items (Android push) require real manual testing

4. **Production vs Local expected differences:**
   - Local: Consumer + Provider tests pass with seed data
   - Production: Consumer tests pass, Provider tests skip (no dev-login users)
   - Same pass rate expected: ~86% for both

5. **User action required items:**
   - Push notification on Android device
   - Notification click navigation
   - Document clearly as "USER ACTION REQUIRED" in ACs

**Hard-Won Wisdom:**

> "Production validation stories should show SAME pass rate as local validation. If rates differ, investigate before proceeding."

> "Manual verification doesn't mean clicking every button. Cross-reference E2E test counts to prove coverage exists."

> "14 skipped tests out of 98 is not a problem when documented. The problem is unexpected skips."

---

### Epic 12 Summary (2025-12-28)

**Epic 12: Consumer UX Enhancements** - 14 stories, ~180 E2E tests

**Phases:**
1. **Phase 1 (UI):** Trust signals (12-5), negative states (12-3), local/prod validation (12-7, 12-8)
2. **Phase 2 (Forms):** Payment selection (12-2), urgency pricing (12-4), map pinpoint (12-1), local/prod validation (12-9, 12-10)
3. **Phase 3 (Push):** Web push (12-6), local/prod validation (12-11, 12-12)
4. **Final Validation:** Full local (12-13), full production (12-14)

**Key Technical Achievements:**
- Leaflet map integration with dynamic imports for SSR bypass
- Web Push Notifications with lazy VAPID initialization
- Service Worker push handlers for Android PWA
- Edge Function deployment for server-side push delivery
- Comprehensive E2E coverage with phased validation approach

**Testing Metrics:**
- 98 total E2E tests for Epic 12 features
- 84 tests pass consistently (86%)
- 14 tests skip expectedly (provider auth + seed data)
- 0 failures, 0 regressions

**Patterns Established:**
- Phased validation: local checkpoint → production checkpoint
- Test-count-based manual verification
- User-action-required explicit documentation
- Expected skip rate documentation

---

*Last verified: 2025-12-28 | Sources: Epic 3, Epic 8 retrospectives, Story 8-6, 8-7, 8-9, 8-10, 10-4, 10-5, 11-1, 11A-1, 11-2, 11-19, 12-3, 12-6, 12-11, 12-12, 12-13, 12-14 implementations*
