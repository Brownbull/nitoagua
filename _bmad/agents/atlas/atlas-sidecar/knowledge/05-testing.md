# Testing Patterns & Coverage Expectations

> Section 5 of Atlas Memory
> Last Sync: 2025-12-29
> Sources: docs/sprint-artifacts/testing/, run_app.local.md, epic retrospectives

## Testing Strategy

| Aspect | Choice | Notes |
|--------|--------|-------|
| **Framework** | Playwright | Cross-browser E2E testing |
| **Browsers** | Chromium (primary) | Firefox, WebKit have flakiness |
| **Pattern** | Seed data per test | Deterministic test state |
| **Auth** | Dev login mode | `NEXT_PUBLIC_DEV_LOGIN=true` |

### Test Levels

| Level | Purpose | Coverage |
|-------|---------|----------|
| E2E | Full user journeys | 600+ tests (primary focus) |
| Integration | API routes | Via E2E coverage |
| Unit | Component logic | Minimal |

## Seed Data Commands

```bash
npm run seed:local          # Full test data
npm run seed:offers         # Offer-specific tests
npm run seed:earnings       # Earnings dashboard tests
npm run seed:verification   # Admin verification tests
npm run seed:test:clean && npm run seed:test  # Clean and re-seed
```

**Production variants:** Add `:prod` suffix (e.g., `npm run seed:offers:prod`)

## Coverage by Epic

| Epic | Stories | E2E Tests | Status |
|------|---------|-----------|--------|
| Epic 1-8 | 50 | ~600 | ✅ Complete |
| Epic 10 | 7 | ~80 | ✅ Complete |
| Epic 11 | 21 | ~120 | ✅ Complete |
| Epic 12 | 14 | 98 | ✅ Complete (84 pass, 14 expected skip) |

---

## Critical Test Patterns

### 1. Error Detection (MANDATORY)

```typescript
import { assertNoErrorState } from "../fixtures/error-detection";

// Call AFTER every page.goto()
await page.goto("/path");
await assertNoErrorState(page);
```

**Rule:** ALL tests that navigate to pages must call `assertNoErrorState(page)` first.

### 2. Merged Fixtures Import

```typescript
// ✅ Correct (Epic 10+)
import { test, expect } from '../support/fixtures/merged-fixtures';

// ❌ Wrong
import { test, expect } from '@playwright/test';
```

### 3. Wait Patterns

```typescript
// ❌ Anti-pattern
await page.waitForTimeout(2000);

// ✅ Correct - element-based wait
await page.getByRole("heading", { name: "Mis Ganancias" }).waitFor({ state: "visible" });
await page.waitForLoadState("networkidle");
```

### 4. Selector Specificity

```typescript
// ❌ Matches multiple elements
await page.getByText("Cancelado");

// ✅ Correct approaches
await page.getByTestId("status-badge");
await page.getByText("Cancelado", { exact: true });
await page.getByText("Cancelado").first();
```

### 5. Mobile Viewport Testing

```typescript
test.use({
  viewport: { width: 360, height: 780 },
  isMobile: true,
  hasTouch: true,
});
```

### 6. Serial Data-Mutating Tests

```typescript
test.describe.configure({ mode: "serial" });
// Later tests may skip if earlier tests consumed the data
```

### 7. Consumer Login Skip Pattern

```typescript
const devLoginButton = page.getByTestId("dev-login-consumer");
if (await devLoginButton.isVisible().catch(() => false)) {
  await devLoginButton.click();
} else {
  test.skip(true, "Dev login not available");
}
```

---

## Production Test Execution

### Command Template

```bash
BASE_URL="https://nitoagua.vercel.app" \
NEXT_PUBLIC_SUPABASE_URL="<prod-url>" \
NEXT_PUBLIC_SUPABASE_ANON_KEY="<anon-key>" \
NEXT_PUBLIC_DEV_LOGIN=true \
DISPLAY= timeout 180 npx playwright test <test-file> \
  --project=chromium --workers=1 --reporter=list
```

**Key Requirements:**
- `BASE_URL` required (tests default to localhost without it)
- `timeout 180` minimum (3+ min for production latency)
- `--workers=1` for deterministic ordering

### Expected Skip Rates

| Environment | Pass Rate | Skips | Reason |
|-------------|-----------|-------|--------|
| Local | ~86% | 14 | Provider auth tests (dev login) |
| Production | ~86% | 14 | Same - no dev-login users in prod |

---

## Test File Conventions

| Pattern | Example |
|---------|---------|
| Location | `tests/e2e/*.spec.ts` |
| Naming | `consumer-request.spec.ts` (kebab-case) |
| Fixtures | `tests/fixtures/*.ts` |
| Seeds | `scripts/local/seed-*.ts` |

---

## Database Health Check

Run `@health` tests FIRST before other E2E:

```bash
npm run test:e2e -- --grep "@health"
```

**Location:** `tests/e2e/database-health.spec.ts`

**Required Tables:** profiles, water_requests, admin_settings, admin_allowed_emails, provider_documents, commission_ledger, withdrawal_requests, offers, notifications, comunas, provider_service_areas, push_subscriptions

---

## Chrome Extension vs Playwright

| Factor | Chrome Extension | Playwright |
|--------|------------------|------------|
| **Best For** | New features, exploratory | Regression, CI/CD |
| **Data** | Real/seeded data | Seeds per-test |
| **Production** | ❌ Never run | ❌ Never run |

**Rule:** New feature → Chrome Extension first → then Playwright for regression.

---

## Known Issues

### WebKit Flakiness
- Focus on Chromium for primary testing
- Run WebKit separately with retries
- Accept some flakiness in CI

### Test Isolation
Each test must seed its own data, clean up, and not depend on other tests' state.

---

## Key Test IDs Reference

| Component | Test ID | Usage |
|-----------|---------|-------|
| Negative status | `negative-status-{variant}` | Status card variants |
| Map step | `map-step`, `map-confirm-button` | Location pinpoint |
| Notification bell | `notification-bell` | Provider notifications |
| Offer cards | `offer-card`, `offer-countdown` | Provider offers |
| Support section | `support-contact`, `whatsapp-support` | Contact info |

---

## Code Review Learnings (Testing)

| Date | Story | Issue | Fix Applied |
|------|-------|-------|-------------|
| 2026-01-03 | 12.7-8 | Wrong import: `@playwright/test` instead of merged-fixtures | Use `../support/fixtures/merged-fixtures` |
| 2026-01-03 | 12.7-8 | 13x `waitForTimeout(2000)` anti-pattern | Replaced with `waitForLoadState("networkidle")` |
| 2026-01-03 | 12.7-8 | Missing `assertNoErrorState` in login helpers | Added to both loginAsSupplier/loginAsConsumer |
| 2026-01-03 | 12.7-11 | **Mock tests (22 placeholder assertions)** - Tests that verify string === string instead of page interaction | Rewrote with real page navigation, `assertNoErrorState`, and actual UI assertions |
| 2026-01-03 | 12.7-11 | Wrong status value in admin timeline (`en_route` vs `in_transit`) | Use consistent `in_transit` DB value in all code |
| 2026-01-03 | 12.7-12 | `Page` type import with merged-fixtures | Import `Page` from `@playwright/test` separately when using merged-fixtures |
| 2026-01-03 | 12.7-12 | Tests fail when provider has pending withdrawal | Add `checkForPendingWithdrawal()` helper + skip logic for state-dependent tests |
| 2026-01-03 | 12.7-12 | Weak "always-pass" assertions (`expect(x \|\| true).toBe(true)`) | Replace with proper state checks that can actually fail |
| 2026-01-03 | 12.7-13 | Rating E2E tests with database verification | Use admin client for test setup, serial mode for data mutations |

---

## Rating/Review Test Pattern (Story 12.7-13)

**Test Structure:** Serial tests with shared test data IDs

```typescript
test.describe.configure({ mode: "serial" });

// Track IDs for cross-test dependencies and cleanup
let testRequestId: string | null = null;
let testProviderId: string | null = null;
let testConsumerId: string | null = null;

test.beforeAll(async () => {
  const adminClient = getAdminClient();
  // Find test users by role
  const { data: consumer } = await adminClient
    .from("profiles")
    .select("id")
    .eq("role", "consumer")
    .limit(1)
    .single();
  if (consumer) testConsumerId = consumer.id;
});

test.afterAll(async () => {
  // Clean up test data
  if (testRequestId) {
    const adminClient = getAdminClient();
    await adminClient.from("ratings").delete().eq("request_id", testRequestId);
    await adminClient.from("water_requests").delete().eq("id", testRequestId);
  }
});
```

**Database Verification Pattern:**
```typescript
test("Rating persists in database", async ({ log }) => {
  test.skip(!testRequestId, "Test data not available");

  const adminClient = getAdminClient();
  const { data: rating, error } = await adminClient
    .from("ratings")
    .select("*")
    .eq("request_id", testRequestId)
    .eq("consumer_id", testConsumerId)
    .single();

  expect(rating).toBeTruthy();
  expect(rating.rating).toBe(4);
  expect(rating.comment).toBe("Expected comment text");
});
```

**Key Test IDs Added:**
- `rating-section` - Rating section container
- `rate-button` - Initial rate CTA
- `edit-rating-button` - Edit existing rating
- `rating-dialog` - Rating dialog modal
- `rating-stars-input` - Star selection container
- `star-{1-5}` - Individual star buttons
- `rating-label` - Feedback label (Malo/Regular/Bueno/etc.)
- `rating-comment` - Comment textarea
- `rating-submit-button` - Submit rating button

---

*Last verified: 2026-01-03 | Sources: run_app.local.md, testing docs, Stories Testing-1/1B/2/3, Epic 10-12.7 implementations*
