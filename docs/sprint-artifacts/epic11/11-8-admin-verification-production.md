# Story 11-8: Admin Verification (Production)

| Field | Value |
|-------|-------|
| **Story ID** | 11-8 |
| **Epic** | Epic 11 - Playwright Workflow Validation |
| **Title** | Admin Verification (Production) |
| **Status** | done |
| **Points** | 2 |
| **Priority** | P0 - Critical |
| **Depends On** | Story 11-7 |

---

## User Story

**As a** platform owner,
**I want** to verify admin verification works on production,
**So that** real providers can be verified.

---

## Tasks

### Task 1: Run Production Tests

- [x] 1.1 Create/verify prod seed for pending providers
- [x] 1.2 Run admin-verification-workflow tests against production
- [x] 1.3 Document failures

### Task 2: Fix or Backlog

- [x] 2.1 Analyze each failure
- [x] 2.2 Apply critical fixes
- [x] 2.3 Backlog non-critical issues to Epic 11A

---

## Acceptance Criteria

### AC 11-8.1: Tests Pass on Production
- [x] A1, A2, A3, A4 tests pass
- [x] Or: Failures documented and actioned

---

## Definition of Done

- [x] Tests run against production
- [x] Issues documented and actioned
- [x] Story status updated to `review`

---

## Dev Agent Record

### Implementation Plan

1. Add production seed command for verification test data
2. Modify seed script to support production via environment variables
3. Run tests against production with BASE_URL set
4. Fix any issues found

### Debug Log

**Issue 1: Page showing stale data (cached)**
- Symptom: Page showed "Pendientes (0), Revisando (1)" instead of seeded data
- Root cause: Verification page was being cached by Vercel (Next.js SSR caching)
- Fix: Added `export const dynamic = "force-dynamic"` to `/admin/verification/page.tsx`
- Commit: 63d2d91 (immediate production fix)

**Issue 2: Tests running against wrong URL**
- Symptom: Tests failing even after fix deployed
- Root cause: Missing `BASE_URL` environment variable - tests defaulting to localhost
- Fix: Added `BASE_URL="https://nitoagua.vercel.app"` to test command

### Production Test Commands

**Seed test data:**
```bash
npm run seed:verification:prod
```

**Run tests against production:**
```bash
BASE_URL="https://nitoagua.vercel.app" \
NEXT_PUBLIC_SUPABASE_URL="https://spvbmmydrfquvndxpcug.supabase.co" \
NEXT_PUBLIC_SUPABASE_ANON_KEY="<anon-key>" \
NEXT_PUBLIC_DEV_LOGIN=true \
DISPLAY= timeout 420 npx playwright test tests/e2e/admin-verification-workflow.spec.ts \
  --project=chromium --workers=1 --reporter=list
```

**Clean up test data:**
```bash
npm run seed:verification:prod:clean
```

### Test Results

**Production Test Run (2025-12-23):**

| Test File | Tests | Passed | Skipped | Failed |
|-----------|-------|--------|---------|--------|
| admin-verification-workflow.spec.ts | 18 | 16 | 2 | 0 |

**Test Breakdown:**
- A1: Admin View Verification Queue - 4/4 PASS
- A2: Admin Review Provider Documents - 5/5 PASS
- A3: Admin Approve/Reject Provider - 6/6 PASS
- A4: Provider Notification - 1/2 (1 skipped - no data after A3 consumed it)
- Internal Notes - 0/1 (skipped - no data after A3 consumed it)

**Note:** The 2 skipped tests are expected behavior - tests A3.5 and A3.6 approve/reject providers, consuming the test data. Subsequent tests in the same run find no pending providers to test.

### File List

**Modified Files:**
- `src/app/admin/verification/page.tsx` - Added `force-dynamic` export (commit 63d2d91, immediate fix)
- `scripts/local/seed-admin-verification-tests.ts` - Added production support via env vars (commit 9d49d4d)
- `package.json` - Added `seed:verification:prod` and `seed:verification:prod:clean` scripts (commit 9d49d4d)

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-23 | Story created | SM |
| 2025-12-23 | Production tests passing (16/18, 2 skipped) | Dev Agent |
| 2025-12-23 | Atlas code review: Added test commands, clarified commits | Dev Agent |
