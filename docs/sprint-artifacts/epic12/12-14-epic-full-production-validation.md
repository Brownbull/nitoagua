# Story 12-14: Epic 12 Full Production Validation

| Field | Value |
|-------|-------|
| **Story ID** | 12-14 |
| **Epic** | Epic 12: Consumer UX Enhancements |
| **Title** | Epic 12 Full Production Validation |
| **Status** | drafted |
| **Priority** | P0 (Final Checkpoint) |
| **Points** | 5 |
| **Sprint** | Backlog |
| **Type** | Playwright Validation |

## Purpose

Final production validation of ALL Epic 12 features. This is the last story before Epic 12 is complete and the epic retrospective.

## Prerequisites

- [ ] Story 12-13 (Epic Full Local Validation) - done
- [ ] All changes merged: develop → staging → main
- [ ] All migrations applied to production
- [ ] Edge Functions deployed to production
- [ ] Environment variables configured in Vercel

## Complete Test Coverage

### All Automated Tests (46 total)
| Phase | Tests |
|-------|-------|
| Phase 1: UI & Status | 14 |
| Phase 2: Form Enhancements | 20 |
| Phase 3: Push Notifications | 7 |
| Integration | 5 |

### Production-Specific Checks
| Check | Description |
|-------|-------------|
| Deployment | All features accessible at nitoagua.vercel.app |
| Database | All migrations applied, new columns exist |
| Edge Functions | Push notification function deployed |
| Environment | VAPID keys, API keys configured |
| PWA | Service worker updated, push handlers active |

## Acceptance Criteria

### AC12.14.1: Full Production Test Suite
- [ ] All 46 tests passing on production
- [ ] No regressions in existing functionality
- [ ] Performance acceptable (page loads < 3s)

### AC12.14.2: Manual Production Verification
- [ ] Trust signals visible on production home page
- [ ] Negative states displaying correctly
- [ ] Map pinpoint working with production Google Maps key
- [ ] Payment method persisting to production database
- [ ] Urgency pricing displaying correctly
- [ ] Push notifications received on real Android device

### AC12.14.3: Cross-Browser Check
- [ ] Chrome desktop: All features working
- [ ] Chrome mobile: All features working
- [ ] Android PWA: Push notifications working

### AC12.14.4: Atlas Code Review
- [ ] Run `/bmad:bmm:workflows:atlas-code-review 12-14`
- [ ] All issues addressed
- [ ] Epic 12 patterns documented in Atlas memory

## Test Commands

```bash
# Run FULL Epic 12 test suite on production
NEXT_PUBLIC_SUPABASE_URL="https://spvbmmydrfquvndxpcug.supabase.co" \
NEXT_PUBLIC_SUPABASE_ANON_KEY="..." \
NEXT_PUBLIC_DEV_LOGIN=true \
DISPLAY= timeout 600 npx playwright test \
  tests/e2e/consumer-home-trust-signals.spec.ts \
  tests/e2e/consumer-negative-status.spec.ts \
  tests/e2e/consumer-map-pinpoint.spec.ts \
  tests/e2e/consumer-payment-selection.spec.ts \
  tests/e2e/consumer-urgency-pricing.spec.ts \
  tests/e2e/push-subscription.spec.ts \
  tests/e2e/epic12-integration.spec.ts \
  --project=chromium --workers=1 --reporter=list
```

## Production URLs to Verify

| Feature | URL | Check |
|---------|-----|-------|
| Home (Trust Signals) | https://nitoagua.vercel.app | No fake stats |
| Request Form | https://nitoagua.vercel.app/request | Map, payment, urgency |
| Status Page | https://nitoagua.vercel.app/request/[id] | Negative states |
| Settings (Push) | https://nitoagua.vercel.app/settings | Push subscription |
| Provider Browser | https://nitoagua.vercel.app/provider/requests | Payment badge |

## Definition of Done

- [ ] All 46 automated tests passing on production
- [ ] Manual verification checklist complete
- [ ] Atlas code review passed
- [ ] No critical bugs discovered
- [ ] Story marked as deployed
- [ ] **Epic 12 Complete** - Ready for retrospective

---

## Test Results Summary

_To be filled after test execution_

| Phase | Test Count | Pass | Fail | Skip |
|-------|------------|------|------|------|
| Phase 1: UI & Status | 14 | | | |
| Phase 2: Form Enhancements | 20 | | | |
| Phase 3: Push Notifications | 7 | | | |
| Integration Tests | 5 | | | |
| **Total** | **46** | | | |

## Manual Verification Checklist

| # | Feature | Verified | Notes |
|---|---------|----------|-------|
| 1 | Trust signals on home page | [ ] | |
| 2 | No fake statistics | [ ] | |
| 3 | Negative status: timeout | [ ] | |
| 4 | Negative status: cancelled | [ ] | |
| 5 | Map pinpoint displays | [ ] | |
| 6 | Pin draggable | [ ] | |
| 7 | Coordinates saved | [ ] | |
| 8 | Payment selection: cash | [ ] | |
| 9 | Payment selection: transfer | [ ] | |
| 10 | Payment visible to provider | [ ] | |
| 11 | Urgency shows +10% | [ ] | |
| 12 | Price breakdown on review | [ ] | |
| 13 | Push subscription works | [ ] | |
| 14 | Push notification received | [ ] | |
| 15 | Notification click navigation | [ ] | |

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-24 | Story created as final production checkpoint | Claude |
