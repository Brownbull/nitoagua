# Story 12-13: Epic 12 Full Local Validation

| Field | Value |
|-------|-------|
| **Story ID** | 12-13 |
| **Epic** | Epic 12: Consumer UX Enhancements |
| **Title** | Epic 12 Full Local Validation |
| **Status** | drafted |
| **Priority** | P0 (Final Checkpoint) |
| **Points** | 5 |
| **Sprint** | Backlog |
| **Type** | Playwright Validation |

## Purpose

Complete validation of ALL Epic 12 features running against local Supabase. This is the final local checkpoint before production deployment and ensures all features work together.

## Prerequisites

- [ ] Story 12-12 (Push Notifications Production) - done
- [ ] All implementation stories (12-1 through 12-6) - done
- [ ] All phase checkpoints (12-7 through 12-12) - done
- [ ] Local Supabase running with full seed data

## Comprehensive Test Suite

### Phase 1 Tests: UI & Status Display
| Story | Test File | Tests |
|-------|-----------|-------|
| 12-5 | consumer-home-trust-signals.spec.ts | 6 |
| 12-3 | consumer-negative-status.spec.ts | 8 |

### Phase 2 Tests: Form Enhancements
| Story | Test File | Tests |
|-------|-----------|-------|
| 12-1 | consumer-map-pinpoint.spec.ts | 6 |
| 12-2 | consumer-payment-selection.spec.ts | 8 |
| 12-4 | consumer-urgency-pricing.spec.ts | 6 |

### Phase 3 Tests: Push Notifications
| Story | Test File | Tests |
|-------|-----------|-------|
| 12-6 | push-subscription.spec.ts | 7 |

### Integration Tests (New for 12-13)
| Test ID | Description | Workflows |
|---------|-------------|-----------|
| 12-INT-1 | Full request flow with map + payment + urgency | C1 |
| 12-INT-2 | Consumer request → timeout → retry with trust signals visible | C1, C5 |
| 12-INT-3 | Consumer request → cancel → negative state → new request | C1, C8 |
| 12-INT-4 | Provider sees all new fields (payment, urgency, coordinates) | P5 |
| 12-INT-5 | Push subscription + offer → notification trigger | C1, P5 |

## Acceptance Criteria

### AC12.13.1: Full Test Suite Execution
- [ ] All 41 unit tests passing
- [ ] All 5 integration tests passing
- [ ] Total: 46 tests

### AC12.13.2: Cross-Feature Validation
- [ ] Trust signals visible during request flow
- [ ] Negative states accessible from happy path tests
- [ ] Payment and urgency visible to both consumer and provider
- [ ] Map coordinates saved and retrievable

### AC12.13.3: Test Report
- [ ] Generate full test report
- [ ] Document any skipped tests with reasons
- [ ] No flaky tests

## Test Commands

```bash
# Run FULL Epic 12 test suite locally
NEXT_PUBLIC_DEV_LOGIN=true DISPLAY= timeout 300 npx playwright test \
  tests/e2e/consumer-home-trust-signals.spec.ts \
  tests/e2e/consumer-negative-status.spec.ts \
  tests/e2e/consumer-map-pinpoint.spec.ts \
  tests/e2e/consumer-payment-selection.spec.ts \
  tests/e2e/consumer-urgency-pricing.spec.ts \
  tests/e2e/push-subscription.spec.ts \
  tests/e2e/epic12-integration.spec.ts \
  --project=chromium --workers=1 --reporter=list

# Alternative: Run by pattern
NEXT_PUBLIC_DEV_LOGIN=true DISPLAY= timeout 300 npx playwright test \
  --grep "12-" \
  --project=chromium --workers=1 --reporter=list
```

## Seed Data Requirements

```bash
# Full seed for Epic 12 testing
npm run seed:local

# Or specific Epic 12 seed (if created)
npm run seed:epic12
```

## Definition of Done

- [ ] All 46 tests passing locally
- [ ] Integration tests verify cross-feature behavior
- [ ] Test report generated and saved
- [ ] Ready for final production validation (12-14)

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

### Detailed Results

| Test File | Tests | Pass | Fail | Skip |
|-----------|-------|------|------|------|
| consumer-home-trust-signals.spec.ts | 6 | | | |
| consumer-negative-status.spec.ts | 8 | | | |
| consumer-map-pinpoint.spec.ts | 6 | | | |
| consumer-payment-selection.spec.ts | 8 | | | |
| consumer-urgency-pricing.spec.ts | 6 | | | |
| push-subscription.spec.ts | 7 | | | |
| epic12-integration.spec.ts | 5 | | | |

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-24 | Story created as final local checkpoint | Claude |
