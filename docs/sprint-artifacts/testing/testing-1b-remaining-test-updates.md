# Story Testing-1B: Update Remaining Test Files with Error Detection

| Field | Value |
|-------|-------|
| **Epic** | Testing & Quality (Tech Debt) |
| **Story ID** | Testing-1B |
| **Status** | ready-for-dev |
| **Priority** | Medium |
| **Created** | 2025-12-18 |
| **Parent Story** | Testing-1 |

## Problem Statement

Testing-1 established the error detection pattern with `assertNoErrorState()` but only updated 5 test files. The remaining 9 provider test files still don't use this pattern and could mask database/infrastructure errors.

### Files Already Updated (Testing-1)
- `admin-verification.spec.ts`
- `provider-active-offers.spec.ts`
- `provider-earnings.spec.ts`
- `provider-offer-submission.spec.ts`
- `provider-request-browser.spec.ts`

### Files Needing Update (This Story)
1. `provider-verification-status.spec.ts`
2. `provider-registration.spec.ts`
3. `provider-settings.spec.ts`
4. `provider-withdraw-offer.spec.ts`
5. `provider-availability-toggle.spec.ts`
6. `provider-earnings-seeded.spec.ts`
7. `provider-document-management.spec.ts`
8. `provider-service-areas.spec.ts`
9. `provider-offer-notification.spec.ts`

## Acceptance Criteria

### AC 1B.1: All Provider Tests Use Error Detection
- [ ] All 9 remaining provider test files import `assertNoErrorState`
- [ ] Tests that check for "empty OR data" states call `assertNoErrorState(page)` first
- [ ] No new "error OR success" anti-patterns introduced

### AC 1B.2: Consumer Tests Reviewed
- [ ] Review consumer test files for "error OR success" patterns
- [ ] Update consumer tests if needed (document findings)

### AC 1B.3: Tests Pass Without Regressions
- [ ] All updated tests pass against production Supabase
- [ ] No new test failures introduced
- [ ] Database health check still passes

## Implementation Tasks

### Task 1: Update Provider Test Files
For each file, add:
```typescript
import { assertNoErrorState } from "../fixtures/error-detection";
```

And update patterns like:
```typescript
// BEFORE (bad)
const hasData = await page.getByText("Data").isVisible().catch(() => false);
const hasEmpty = await page.getByText("Empty").isVisible().catch(() => false);
expect(hasData || hasEmpty).toBe(true);

// AFTER (good)
await assertNoErrorState(page);  // Check for errors FIRST
const hasData = await page.getByText("Data").isVisible().catch(() => false);
const hasEmpty = await page.getByText("Empty").isVisible().catch(() => false);
expect(hasData || hasEmpty).toBe(true);
```

### Task 2: Review Consumer Tests
- [ ] `consumer-home.spec.ts`
- [ ] `consumer-tracking.spec.ts`
- [ ] `consumer-request.spec.ts`
- [ ] `consumer-request-status.spec.ts`

### Task 3: Run Full Test Suite
```bash
npm run test:e2e -- --project=chromium
```

## Files to Modify

### Provider Tests (9 files)
- `tests/e2e/provider-verification-status.spec.ts`
- `tests/e2e/provider-registration.spec.ts`
- `tests/e2e/provider-settings.spec.ts`
- `tests/e2e/provider-withdraw-offer.spec.ts`
- `tests/e2e/provider-availability-toggle.spec.ts`
- `tests/e2e/provider-earnings-seeded.spec.ts`
- `tests/e2e/provider-document-management.spec.ts`
- `tests/e2e/provider-service-areas.spec.ts`
- `tests/e2e/provider-offer-notification.spec.ts`

### Consumer Tests (review only)
- `tests/e2e/consumer-*.spec.ts`

## Definition of Done

- [ ] All 9 provider test files updated with error detection
- [ ] Consumer tests reviewed (update if needed)
- [ ] All tests pass without regressions
- [ ] No "error OR success" anti-patterns remain

## Related Stories

- **Testing-1**: E2E Testing Reliability Improvements (parent story)
- **Testing-2**: Local Schema Sync (addresses root cause of DB errors)

---

## Dev Agent Record

### Implementation Plan
*To be filled during implementation*

### Debug Log
*To be filled during implementation*

### Completion Notes
*To be filled upon completion*

---

## File List

### Modified Files
*To be filled during implementation*

---

## Change Log

| Date | Change |
|------|--------|
| 2025-12-18 | Story created as follow-up to Testing-1 |
