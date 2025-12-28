# Testing Patterns & Coverage Expectations

> Section 5 of Atlas Memory
> Last Sync: 2025-12-23
> Sources: docs/sprint-artifacts/testing/, run_app.local.md, epic retrospectives

## Testing Strategy

### Test Framework

| Aspect | Choice | Notes |
|--------|--------|-------|
| **Framework** | Playwright | Cross-browser E2E testing |
| **Browsers** | Chromium, Firefox, WebKit | WebKit has flakiness issues |
| **Pattern** | Seed data per test | Deterministic test state |
| **Auth** | Dev login mode | NEXT_PUBLIC_DEV_LOGIN=true |

### Test Levels

| Level | Purpose | Coverage Target |
|-------|---------|-----------------|
| Unit | Component logic | Minimal - focus on E2E |
| Integration | API routes | Via E2E coverage |
| E2E | Full user journeys | 600+ tests across all epics |

## Seed Data Patterns

> "The epic adopts a 'per-test seeding' approach where each test file seeds the specific data it needs."
> — Testing documentation

| Scenario | Data Required | Setup Script |
|----------|--------------|--------------|
| Consumer request | User profile, address | `scripts/local/seed-test-data.ts` |
| Provider offers | Provider profile, pending requests | `scripts/local/seed-offer-tests.ts` |
| Earnings dashboard | Completed deliveries with commissions | `scripts/local/seed-earnings-tests.ts` |
| Admin verification | Pending providers, documents | `scripts/local/seed-admin-verification-tests.ts` |

### Seed Data Commands

```bash
# Full test data setup
npm run seed:local

# Offer-specific tests
npm run seed:offers

# Earnings-specific tests
npm run seed:earnings

# Admin verification tests
npm run seed:verification

# Clean and re-seed
npm run seed:test:clean && npm run seed:test
```

## Workflow Validations

### Critical User Journeys (E2E Required)

1. **Consumer Request Flow**
   - Submit water request (guest)
   - Track request status
   - Cancel pending request

2. **Provider Operations**
   - View request dashboard
   - Submit offer to consumer
   - Mark delivery complete

3. **Admin Functions**
   - Verify pending provider
   - View settlement details

## Coverage Expectations

| Epic | Story Count | E2E Tests | Status |
|------|-------------|-----------|--------|
| Epic 1 | 5 | ~20 | ✅ Complete |
| Epic 2 | 6 | ~40 | ✅ Complete |
| Epic 3 | 8 | ~80 | ✅ Complete |
| Epic 4 | 6 | ~50 | ✅ Complete |
| Epic 5 | 4 | ~30 | ✅ Complete |
| Epic 6 | 10 | ~100 | ✅ Complete |
| Epic 7 | 11 | ~120 | ✅ Complete |
| Epic 8 | 10 | ~160 | ✅ Complete |

## Test File Conventions

| Pattern | Example | Notes |
|---------|---------|-------|
| **Location** | `tests/e2e/*.spec.ts` | All E2E in one directory |
| **Naming** | `consumer-request.spec.ts` | kebab-case, feature-based |
| **Fixtures** | `tests/fixtures/*.ts` | Shared test data |
| **Seeds** | `scripts/local/seed-*.ts` | Per-feature seed scripts |

## E2E Reliability Patterns (Testing-1)

> Added 2025-12-18 from Story Testing-1: E2E Testing Reliability Improvements

### Database Health Check

**Problem:** Tests passing silently when tables missing or RLS blocked access.

**Pattern:** Run `@health` tests FIRST before other E2E tests.

**Location:** `tests/e2e/database-health.spec.ts`

**Command:** `npm run test:e2e -- --grep "@health"`

### Error Detection Fixture

**Problem:** Tests accepted "empty state OR data" which masked database errors.

**Pattern:** Check for error states BEFORE checking for content.

**Location:** `tests/fixtures/error-detection.ts` - exports `assertNoErrorState(page)`

**Usage:** Import and call FIRST in any test that could show "empty state".

### Seed Script Verification

**Problem:** Seed scripts didn't verify data was actually created.

**Pattern:** Exit with error code if seeded data is missing. All seed scripts include verification step.

### Unit-Style Test Files (Testing-1B)

**Pattern:** Some test files contain unit-style tests (config checks, regex validation) with no page interactions.

**Rule:** `assertNoErrorState` NOT needed for:
- Pure unit tests (constants/config)
- Regex validation tests
- Auth redirect tests

**Rule:** `assertNoErrorState` NEEDED for:
- Tests navigating to pages
- Tests with `.isVisible().catch(() => false)` patterns
- Tests that could show "empty state"

---

## Known Issues

### WebKit Flakiness

> WebKit tests have intermittent failures on certain interactions.

**Mitigation:**
- Focus on Chromium for primary testing
- Run WebKit separately with retries
- Accept some flakiness in CI

### Test Isolation

Each test must:
1. Seed its own data
2. Clean up after itself (or rely on transaction rollback)
3. Not depend on other tests' state

### Local Database Verification (Testing-2)

**Problem:** Tests passing when tables completely missing.

**Pattern:** Run `npm run verify:local-db` before E2E tests.

**Required Tables:** profiles, water_requests, admin_settings, admin_allowed_emails, provider_documents, commission_ledger, withdrawal_requests, offers, notifications, comunas, provider_service_areas

**Common Fixes:**
- `npx supabase db reset` - Full reset
- `npm run seed:dev-login` - Re-seed dev users
- `npm run seed:test` - Re-seed test data

**Note:** No `deliveries` table - uses `water_requests.status='delivered'`.

### Code Review Lessons (Testing-2)

**Patterns learned:**
1. **Use FK IDs not display names** in seed data (use `comuna_id`, not `comuna_name`)
2. **Check table constraints** before upserts (e.g., `added_by` NOT NULL)
3. **Single source of truth** for REQUIRED_TABLES lists
4. **Fail fast** with actionable error messages (check connection before tables)

---

## Playwright Utils Integration (Testing-3)

**Location:** `tests/support/fixtures/merged-fixtures.ts`

**Key Fixtures:** `log` (structured logging), `recurse` (polling), `interceptNetworkCall`, `networkErrorMonitor`, `userFactory`

**Import (Epic 10+):** `import { test, expect } from '../support/fixtures/merged-fixtures';`

**Log Levels:** `info`, `step`, `success`, `warning`, `error`, `debug`

**Persona Validation:** `tests/e2e/persona-validation.spec.ts` - 13 tests covering all personas

**Full Reference:** `docs/testing/playwright-utils-integration.md`

### Wait Patterns (Story 11-11)

> Added 2025-12-23 from Atlas Code Review of Story 11-11

**Problem:** Tests using arbitrary `waitForTimeout(2000)` delays, which are unreliable and slow.

**Pattern:** Use specific element or network waits instead of fixed timeouts.

**Anti-pattern:**
```typescript
await page.goto("/provider/earnings");
await page.waitForTimeout(2000); // ❌ Arbitrary delay
await assertNoErrorState(page);
```

**Correct pattern:**
```typescript
async function waitForEarningsPageLoad(page: Page): Promise<void> {
  await page.getByRole("heading", { name: "Mis Ganancias" }).waitFor({ state: "visible", timeout: 10000 });
  await page.waitForLoadState("networkidle", { timeout: 10000 });
}

await page.goto("/provider/earnings");
await waitForEarningsPageLoad(page); // ✅ Specific element wait
await assertNoErrorState(page);
```

**Benefits:**
- Faster tests (no unnecessary waiting)
- More reliable (waits for actual readiness)
- Self-documenting (helper name explains what we're waiting for)

### CSS Selector Specificity (Story 11-11)

**Problem:** Generic CSS class selectors like `.bg-gradient-to-br` can match multiple elements.

**Anti-pattern:**
```typescript
const heroCard = page.locator("[class*='bg-gradient']"); // ❌ Matches multiple
await expect(heroCard).toBeVisible(); // Fails: strict mode violation
```

**Correct patterns:**
```typescript
// Option 1: More specific CSS
const heroCard = page.locator(".bg-gradient-to-br.from-gray-900"); // ✅ Unique

// Option 2: Use data-testid (preferred)
const heroCard = page.getByTestId("earnings-hero-card"); // ✅ Best practice

// Option 3: Use first() if truly necessary
await expect(heroCard.first()).toBeVisible(); // ✅ When duplicates expected
```

---

## Chrome Extension vs Playwright Decision Guide

| Factor | Chrome Extension | Playwright |
|--------|------------------|------------|
| **Best For** | New features, multi-persona, exploratory | Regression, CI/CD, timing-sensitive |
| **Data** | Requires real/seeded data | Seeds per-test |
| **Multi-persona** | Natural tab switching | Multi-context setup |
| **Production** | ❌ No seed scripts | ❌ Never run |

**Rule:** New feature → Chrome Extension first → then Playwright for regression.

**Reference:** `docs/testing/e2e-checklists/` for Chrome Extension results.

---

---

## Epic 11 Workflow Validation Patterns

> Added 2025-12-23 from Story 11-3: Provider Visibility (Local)

### Provider Visibility Tests (P7, P8, P9)

**Test File:** `tests/e2e/provider-visibility.spec.ts`

**Seed Dependency:** `npm run seed:offers` (includes notifications)

**Patterns Validated:**
1. **P7 - Track My Offers:** Offers list with status sections (pending/accepted/history)
2. **P8 - Acceptance Notification:** Notification bell popover with offer_accepted type
3. **P9 - Delivery Details:** Full request details page with customer info

**Mobile Testing Pattern:**
```typescript
test.use({
  viewport: { width: 360, height: 780 },
  isMobile: true,
  hasTouch: true,
});
```

**Notification Seeding:**
- Added to `scripts/local/seed-offer-tests.ts`
- Uses valid UUIDs (pattern: `a0000000-0000-0000-0000-00000000XXXX`)
- Creates both read and unread notifications for testing

**Key Selectors:**
| Element | Test ID | Usage |
|---------|---------|-------|
| Pending offers | `section-pending` | P7 status grouping |
| Accepted offers | `section-accepted` | P7 + P9 delivery link |
| Notification bell | `notification-bell` | P8 trigger |
| Offer cards | `offer-card` | P7 card display |
| Offer countdown | `offer-countdown` | P7.3 countdown timer |
| Notification items | `notification-item-${id}` | P8 dynamic testid (use `^=` prefix selector) |

### Code Review Lessons - Story 11-3

**Selector Mismatch Pattern:**
- **Problem:** Tests using `.catch(() => false)` mask selector mismatches
- **Solution:** Use `.count() > 0` before assertions to validate element exists

**Countdown Format Handling:**
- `< 1 hour`: Format is `XX:XX` (e.g., "25:30")
- `> 1 hour`: Format is `X h MM min` (e.g., "1 h 19 min")
- **Regex:** `/Expira en\s*(\d{1,2}:\d{2}|\d+ h \d{2} min)/`

**Dynamic TestID Pattern:**
- Components with dynamic testids (e.g., `notification-item-${id}`) require prefix selectors
- Use `[data-testid^="notification-item-"]` instead of exact match

---

## Production Validation Pattern (Story 11-4)

> Added 2025-12-23 from Story 11-4: Provider Visibility (Production)

### Production Test Execution Pattern

**Seed Command:**
```bash
npm run seed:offers:prod  # Uses ./scripts/run-with-prod-env.sh wrapper
```

**Test Execution Template:**
```bash
NEXT_PUBLIC_SUPABASE_URL="<prod-url>" \
NEXT_PUBLIC_SUPABASE_ANON_KEY="<anon-key>" \
NEXT_PUBLIC_DEV_LOGIN=true \
DISPLAY= \
timeout 180 npx playwright test <test-file> \
  --project=chromium --workers=1 --reporter=list
```

**Key Requirements:**
1. **Environment file:** `.env.production.local` with `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`
2. **Seed first:** Run `npm run seed:offers:prod` before tests
3. **Timeout:** Use `timeout 180` (3 min) for production latency
4. **Single worker:** `--workers=1` for deterministic ordering
5. **Dev login:** `NEXT_PUBLIC_DEV_LOGIN=true` enables test login

**Workflows Validated:**
| Workflow | Tests | Description |
|----------|-------|-------------|
| P7 | 3 | Track My Offers - Offer list with status |
| P8 | 2 | Acceptance Notification - Bell + popover |
| P9 | 2 | Delivery Details - Full request info |
| Integration | 1 | Full navigation flow |

---

## Consumer Tracking Production Validation (Story 11-6)

> Added 2025-12-23 from Story 11-6: Consumer Status Tracking (Production)

### Consumer Tracking Production Tests (C3, C4)

**Seed Command:**
```bash
npm run seed:test:prod  # Uses ./scripts/run-with-prod-env.sh wrapper
```

**Test Execution:**
```bash
NEXT_PUBLIC_SUPABASE_URL="<prod-url>" \
NEXT_PUBLIC_SUPABASE_ANON_KEY="<anon-key>" \
NEXT_PUBLIC_DEV_LOGIN=true \
DISPLAY= \
timeout 240 npx playwright test tests/e2e/consumer-status-tracking.spec.ts tests/e2e/consumer-tracking.spec.ts \
  --project=chromium --workers=1 --reporter=list
```

**Workflows Validated:**
| Workflow | Tests | Description |
|----------|-------|-------------|
| C3.1-C3.6 | 6 | Status at each stage (pending, has_offers, accepted, delivered, cancelled, no_offers) |
| C3.7-C3.9 | 3 | Timeline progression indicators |
| C3.10 | 1 | Request details display |
| C4.1-C4.4 | 4 | Contact button visibility states |
| C4.5-C4.6 | 2 | One-tap contact functionality |
| Accessibility | 2 | Keyboard nav, headings |
| Spanish | 1 | All content in Spanish |

### Code Review Lessons - Story 11-6

**Schema Compatibility Pattern:**
- **Problem:** Local schema had `timed_out_at` column, production did not
- **Solution:** Removed column from seed data - `status: 'no_offers'` alone indicates timeout
- **Rule:** When seeding production, verify column existence before including in data

**CSS Class Update Pattern:**
- **Problem:** Test expected `min-h-screen`, code uses `min-h-dvh` per Story 10-7 PWA standards
- **Solution:** Updated test assertion to match current implementation
- **Rule:** When CSS classes change for mobile optimization, update test assertions

---

## Admin Verification Workflow Tests (Story 11-7)

> Added 2025-12-23 from Story 11-7: Admin Verification (Local)

### Admin Verification Tests (A1-A4)

**Seed Command:**
```bash
npm run seed:verification      # Create test providers in various states
npm run seed:verification:clean  # Remove test data
```

**Test File:** `tests/e2e/admin-verification-workflow.spec.ts`

**Test Execution:**
```bash
NEXT_PUBLIC_DEV_LOGIN=true DISPLAY= timeout 180 npx playwright test \
  tests/e2e/admin-verification-workflow.spec.ts \
  --project=chromium --workers=1 --reporter=list
```

**Workflows Validated:**
| Workflow | Tests | Description |
|----------|-------|-------------|
| A1 | 4 | View verification queue, count, filter tabs |
| A2 | 5 | Review documents, personal/bank info, navigation |
| A3 | 6 | Approve/reject actions, confirmation dialogs |
| A4 | 2 | Email notifications on status change |

**Seed Data Created:**
| Status | Email | Documents |
|--------|-------|-----------|
| pending | pending-provider1@test.local | 3 (cedula, vehiculo, licencia) |
| pending | pending-provider2@test.local | 0 |
| more_info_needed | moreinfo-provider@test.local | 1 |
| rejected | rejected-provider@test.local | 0 |
| approved | approved-provider@test.local | 2 |

### Code Review Lessons - Story 11-7

**Serial Test Data Consumption:**
- **Problem:** Tests A3.5 and A3.6 approve/reject providers, consuming data for later tests
- **Solution:** Configure `test.describe.configure({ mode: "serial" })`, skip later tests if no data
- **Rule:** Data-mutating tests should run serially and expect some tests to skip

**assertNoErrorState Consistency:**
- **Problem:** Tests A2.3 and A2.4 navigated to pages without error state check
- **Solution:** Added `assertNoErrorState(page)` after all page navigations
- **Rule:** ALL tests that navigate to pages must call `assertNoErrorState(page)` first

---

## Admin Verification Production Tests (Story 11-8)

> Added 2025-12-23 from Story 11-8: Admin Verification (Production)

### Production Caching Fix

**Problem:** Admin verification page showing stale data on production (Vercel caching).

**Pattern:** Pages that display real-time database content must use `force-dynamic`.

**Location:** `src/app/admin/verification/page.tsx`

**Code:**
```typescript
export const dynamic = "force-dynamic";
```

**Rule:** Any Next.js page that queries database for real-time status (verification queues, orders, dashboards) should export `dynamic = "force-dynamic"` to prevent Vercel caching.

### Production Test Execution Pattern - Admin Verification

**Seed Command:**
```bash
npm run seed:verification:prod  # Uses ./scripts/run-with-prod-env.sh wrapper
```

**Test Execution:**
```bash
BASE_URL="https://nitoagua.vercel.app" \
NEXT_PUBLIC_SUPABASE_URL="<prod-url>" \
NEXT_PUBLIC_SUPABASE_ANON_KEY="<anon-key>" \
NEXT_PUBLIC_DEV_LOGIN=true \
DISPLAY= timeout 420 npx playwright test tests/e2e/admin-verification-workflow.spec.ts \
  --project=chromium --workers=1 --reporter=list
```

**Key Requirements:**
1. **BASE_URL required** - Tests default to localhost without it
2. **Timeout 420s** (7 min) for admin workflow complexity
3. **Expect skipped tests** - Serial data-mutating tests consume providers

---

## Provider Earnings Workflow Tests (Story 11-11)

> Added 2025-12-23 from Story 11-11: Provider Earnings (Local)

### Provider Earnings Tests (P11, P12)

**Test File:** `tests/e2e/provider-earnings-workflow.spec.ts`

**Seed Dependency:** `npm run seed:earnings`

**Test Execution:**
```bash
NEXT_PUBLIC_DEV_LOGIN=true DISPLAY= timeout 90 npx playwright test \
  tests/e2e/provider-earnings-workflow.spec.ts \
  --project=chromium --workers=1 --reporter=list
```

**Workflows Validated:**
| Workflow | Tests | Description |
|----------|-------|-------------|
| P11.1-P11.5 | 5 | Earnings page, summary cards, period selector, delivery history, commission calculations |
| P12.1-P12.6 | 6 | Settlement button, withdraw page, bank details, upload area, pending state, navigation |
| Integration | 1 | Full earnings to settlement navigation flow |

### Code Review Lessons - Story 11-11

**Strict Mode Selector Issue:**
- **Problem:** `getByText(/Tu ganancia/)` matched 2 elements (header and stat row)
- **Solution:** Use exact match: `getByText("Tu ganancia", { exact: true })`
- **Rule:** When text appears in multiple places (headers, labels, values), use `{ exact: true }` or more specific selectors

**Existing Test Hardcoding Issue:**
- **Problem:** `provider-earnings-seeded.spec.ts` has hardcoded expected amounts ($12,250) that drift when seed data changes
- **Note:** Workflow tests avoid this by checking for element presence rather than specific values
- **Pattern:** For dynamic seed data, check element visibility rather than exact amounts

---

## Production Earnings Workflow Tests (Story 11-12)

> Added 2025-12-23 from Story 11-12: Provider Earnings (Production)

### Production Test Execution Pattern

**Seed Command:**
```bash
npm run seed:earnings:prod  # Uses ./scripts/run-with-prod-env.sh wrapper
```

**Test Execution:**
```bash
NEXT_PUBLIC_SUPABASE_URL="<prod-url>" \
NEXT_PUBLIC_SUPABASE_ANON_KEY="<anon-key>" \
NEXT_PUBLIC_DEV_LOGIN=true \
DISPLAY= timeout 120 npx playwright test tests/e2e/provider-earnings-workflow.spec.ts \
  --project=chromium --workers=1 --reporter=list
```

**Workflows Validated:**
| Workflow | Tests | Description |
|----------|-------|-------------|
| P11.1-P11.5 | 5 | Earnings page, summary cards, period selector, delivery history, commission calculations |
| P12.1-P12.6 | 6 | Settlement button, withdraw page, bank details, upload area, pending state, navigation |
| Integration | 1 | Full earnings to settlement navigation flow |

### Code Review Lessons - Story 11-12

**Test File Commit Pattern:**
- **Problem:** Test file created in one story but left untracked in git
- **Solution:** Always verify `git status` includes new test files before marking story complete
- **Rule:** Production validation stories should verify test files are committed, not just passing

---

---

## Request Timeout Workflow Tests (Story 11-13)

> Added 2025-12-23 from Story 11-13: Request Timeout Flow (Local)

### Request Timeout Tests (C5, C6, C7)

**Test File:** `tests/e2e/request-timeout-workflow.spec.ts`

**Seed Dependency:** `npm run seed:test` (includes guest + consumer no_offers requests)

**Test Execution:**
```bash
NEXT_PUBLIC_DEV_LOGIN=true DISPLAY= timeout 90 npx playwright test \
  tests/e2e/request-timeout-workflow.spec.ts \
  --project=chromium --workers=1 --reporter=list
```

**Workflows Validated:**
| Workflow | Tests | Description |
|----------|-------|-------------|
| C5.1-C5.3 | 3 | Status badge, Spanish message, timeline state |
| C6.1-C6.2 | 2 | Consumer notification view, helpful next steps |
| C7.1-C7.3 | 3 | Retry button visibility, navigation, history display |
| Integration | 1 | Full timeout flow: status → options → retry |

**Seed Data Added:**
| Request | Email | Status | Consumer ID |
|---------|-------|--------|-------------|
| Guest no_offers | nooffers@test.local | no_offers | null |
| Consumer no_offers | test-consumer@test.local | no_offers | TEST_CONSUMER.id |

### Code Review Lessons - Story 11-13

**Strict Mode Selector Pattern:**
- **Problem:** `getByText("Sin Ofertas")` matched 4 elements (badge, heading, card title, address text)
- **Solution:** Use `.first()` selector: `getByText("Sin Ofertas").first()`
- **Rule:** When text appears in page title, status badge, AND address field, use `.first()` or more specific selector

**URL Pattern Matching:**
- **Problem:** Regex `/^https?:\/\/[^/]+(\/request)?$/` didn't match `http://localhost:3005/` (trailing slash)
- **Solution:** Use `(\/)?` to optionally match trailing slash: `/^https?:\/\/[^/]+(\/)?$/`
- **Rule:** Home page URLs have trailing slash; include `(\/)?` in URL patterns

**Consumer Login Skip Pattern:**
- **Problem:** Consumer login tests fail when dev login button not available
- **Solution:** Use `test.skip()` with `.catch(() => false)` pattern
- **Pattern:**
```typescript
const devLoginButton = page.getByTestId("dev-login-consumer");
if (await devLoginButton.isVisible().catch(() => false)) {
  await devLoginButton.click();
} else {
  test.skip(true, "Dev login not available");
}
```

---

## Consumer Cancellation Workflow Tests (Story 11-15)

> Added 2025-12-24 from Story 11-15: Consumer Cancellation (Local)

### Consumer Cancellation Tests (C8-C11)

**Test File:** `tests/e2e/consumer-cancellation-workflow.spec.ts`

**Seed Dependency:** `npm run seed:test` + `npm run seed:offers`

**Test Execution:**
```bash
NEXT_PUBLIC_DEV_LOGIN=true DISPLAY= timeout 90 npx playwright test \
  tests/e2e/consumer-cancellation-workflow.spec.ts \
  --project=chromium --workers=1 --reporter=list
```

**Workflows Validated:**
| Workflow | Tests | Description |
|----------|-------|-------------|
| C8.1-C8.3 | 3 | Cancel button visible, dialog opens, Volver closes |
| C9.1-C9.2 | 2 | Cancel with offers - warning shown |
| C10.1-C10.5 | 5 | Cancelled page UI, Spanish text, Nueva Solicitud button |
| C11.1-C11.3 | 3 | Provider notification warning when offers exist |
| Edge Cases | 4 | Delivered, accepted, cancelled, no_offers states |
| Integration | 1 | Full cancel flow navigation |
| Spanish | 2 | Language verification |

### Code Review Lessons - Story 11-15

**Test Title Clarity:**
- **Problem:** Test title said "button visible" but asserted NOT visible
- **Solution:** Title must match assertion: "Cancel button NOT visible on no_offers request"
- **Rule:** Test titles must accurately describe the expected behavior being verified

**Terminal Status Cancel Button Pattern:**
- Cancelled requests: Cancel button NOT visible (already cancelled)
- Delivered requests: Cancel button NOT visible (completed)
- No_offers requests: Cancel button NOT visible (timed out - terminal state)
- Pending/Accepted: Cancel button visible

---

## Epic 12 Phase 1 Validation Pattern (Story 12-8)

> Added 2025-12-25 from Story 12-8: UI Validation Production

### Phase Checkpoint Validation Pattern

**Pattern:** Phase checkpoint stories validate local tests on production environment.

**Structure:**
- Local validation story (12-7) → Production validation story (12-8)
- Same tests, different environment
- Confirms deployment succeeded

**Test Files Validated:**
| File | Tests | Coverage |
|------|-------|----------|
| consumer-home-trust-signals.spec.ts | 10 | Trust signals (Story 12-5) |
| negative-status-states.spec.ts | 23 | Negative states (Story 12-3) |

**Key Patterns Confirmed:**
- `assertNoErrorState` on all page navigations
- Seeded test data via `TRACKING_TOKENS` fixture
- Mobile viewport testing included
- `data-testid` selectors for reliable targeting
- Spanish language verification tests

**Phase 1 Complete (Epic 12):**
- 12-5: Remove Fake Social Proof ✅
- 12-3: Negative Status States ✅
- 12-7: Local Validation (33/33 tests) ✅
- 12-8: Production Validation (33/33 tests) ✅

**Phase 2 Complete (Epic 12):**
- 12-1: Map Location Pinpoint ✅
- 12-2: Payment Method Selection ✅
- 12-4: Urgency Pricing Display ✅
- 12-9: Local Validation (50/50 tests) ✅

### Negative Status Test Data Pattern

**Seed Data Required:** `npm run seed:test`

**Tracking Tokens for Negative States:**
| Status | Token | Test ID |
|--------|-------|---------|
| no_offers | `seed-token-no-offers` | `negative-status-no_offers` |
| cancelled_by_user | `seed-token-cancelled` | `negative-status-cancelled_by_user` |
| cancelled_by_provider | `seed-token-cancelled-by-provider` | `negative-status-cancelled_by_provider` |

**Component Test IDs:**
| Element | Test ID | Usage |
|---------|---------|-------|
| Status card | `negative-status-{variant}` | AC12.3.5 visual tests |
| Title | `negative-status-title` | Text verification |
| Message | `negative-status-message` | Description verification |
| Primary action | `primary-action-button` | Navigation tests |
| Support section | `support-contact` | AC12.3.4 visibility |
| WhatsApp link | `whatsapp-support` | Contact format tests |
| Email link | `email-support` | Contact format tests |
| Timeline | `timeline` | Step status tests |

---

*Last verified: 2025-12-27 | Sources: run_app.local.md, testing docs, Stories Testing-1/1B/2/3, Chrome Extension E2E, Stories 11-3/11-4/11-5/11-6/11-7/11-8/11-11/11-12/11-13/11-15, 12-7/12-8/12-9 code reviews*
