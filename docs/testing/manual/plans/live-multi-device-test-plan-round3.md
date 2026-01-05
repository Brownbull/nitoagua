# Live Multi-Device Testing - Round 3 (Post-Epic 12.8)

**Version:** 2.7.0 (Epic 12.8 complete)
**Created:** 2026-01-05
**Prerequisites:** All bugs from Round 1 & Round 2 fixed
**Test Environment:** Production (https://nitoagua.vercel.app)

---

## Overview

This test plan consolidates all bug fixes from:
- **Epic 12.7** - Round 1 bug fixes (22 bugs)
- **Epic 12.8** - Round 2 bug fixes (12 bugs)

**Focus Areas:**
1. **Verify Round 2 bug fixes** - New fixes from Epic 12.8
2. **Run remaining E2E test suites** - Tests not run in previous rounds
3. **Full regression sweep** - Complete system validation
4. **Production verification** - Real multi-device concurrent usage

---

## Bug Fix Status Summary

### Round 2 Bugs (Epic 12.8)

| Bug ID | Title | Priority | Status | Story |
|--------|-------|----------|--------|-------|
| BUG-R2-001 | Provider delivery buttons hidden | Medium | **FIXED** | Pre-Epic 12.8 |
| BUG-R2-002 | "Iniciar Entrega" fails - missing in_transit | Critical | **FIXED** | Pre-Epic 12.8 |
| BUG-R2-003 | Push notifications device-bound | High | **FIXED** | 12.8-1 |
| BUG-R2-004 | Admin can access consumer view (role isolation) | Critical | **FIXED** | 12.8-2 |
| BUG-R2-005 | Push notification grey circle icon | Low | **FIXED** | 12.8-6 |
| BUG-R2-006 | Rating popup font inconsistency | Low | **VERIFIED OK** | 12.8-6 |
| BUG-R2-007 | Admin orders mobile UX cluttered | High | **FIXED** | 12.8-4 |
| BUG-R2-008 | Admin order detail status badge cluttered | Medium | **FIXED** | 12.8-4 |
| BUG-R2-009 | Provider Mis Ofertas wrong default filter | Medium | **FIXED** | 12.8-3 |
| BUG-R2-010 | Admin providers missing email on cards | Medium | **FIXED** | 12.8-5 |
| BUG-R2-011 | Admin providers missing ratings | Medium | **FIXED** | 12.8-5 |
| BUG-R2-012 | Admin orders "Total" → "Disputas" | Medium | **FIXED** | Pre-Epic 12.8 |
| BUG-R2-013 | Admin not notified on dispute | Medium | **FIXED** | Pre-Epic 12.8 |
| BUG-R2-014 | Provider dispute warning missing | Medium | **FIXED** | Pre-Epic 12.8 |
| BUG-R2-015 | Consumer dispute retry link missing | Medium | **FIXED** | Pre-Epic 12.8 |
| BUG-R2-016 | Toast font inconsistency | Low | **FIXED** | 12.8-6 |
| BUG-R2-017 | Push sent to wrong user (shared device) | Critical | **FIXED** | 12.8-1 |
| BUG-R2-018 | Mis Ofertas shows completed deliveries | Medium | **FIXED** | 12.8-3 |

---

## Part A: E2E Test Suite Execution

### Priority 1: Health Check & Core Flows

Run these first to verify system is stable:

```bash
# Database health
npm run test:e2e -- tests/e2e/database-health.spec.ts --project=chromium --workers=1

# Core consumer flow
npm run test:e2e -- tests/e2e/chain1-happy-path.spec.ts --project=chromium --workers=1
```

**Expected:** All pass

---

### Priority 2: Fixed Area Tests (Epic 12.8)

#### A. Admin Orders Mobile UX (BUG-R2-007, R2-008)

```bash
npm run test:e2e -- tests/e2e/admin-orders-mobile-ux.spec.ts --project=chromium --workers=1
```

**Tests:**
- [ ] Mobile layout renders correctly
- [ ] Status badge placement
- [ ] Filter dropdown works
- [ ] Cards are touch-friendly

#### B. Admin Providers UX (BUG-R2-010, R2-011)

```bash
npm run test:e2e -- tests/e2e/admin-providers-ux.spec.ts --project=chromium --workers=1
```

**Tests:**
- [ ] Email displayed on provider cards
- [ ] Rating badge on cards
- [ ] Rating in detail panel

#### C. Provider Mis Ofertas (BUG-R2-009, R2-018)

```bash
npm run test:e2e -- tests/e2e/provider-active-offers.spec.ts --project=chromium --workers=1
```

**Tests:**
- [ ] Default filter shows all offers
- [ ] Completed deliveries filtered out
- [ ] Correct status display

#### D. Role-Based Route Guards (BUG-R2-004)

```bash
npm run test:e2e -- tests/e2e/admin-auth.spec.ts --project=chromium --workers=1
npm run test:e2e -- tests/e2e/consumer-registration.spec.ts --project=chromium --workers=1
```

**Tests:**
- [ ] Admin cannot access consumer routes
- [ ] Provider cannot access admin routes
- [ ] Consumer cannot access provider routes

---

### Priority 3: Comprehensive Suite Execution

Run the full test suite in batches to avoid timeouts:

#### Batch 1: Consumer Tests

```bash
npm run test:e2e -- tests/e2e/consumer-*.spec.ts --project=chromium --workers=2
```

**Files (17):**
- consumer-home.spec.ts
- consumer-home-merged.spec.ts
- consumer-home-trust-signals.spec.ts
- consumer-registration.spec.ts
- consumer-request-form.spec.ts
- consumer-request-confirmation.spec.ts
- consumer-request-submission.spec.ts
- consumer-request-status.spec.ts
- consumer-request-status-offer-context.spec.ts
- consumer-request-workflow.spec.ts
- consumer-map-pinpoint.spec.ts
- consumer-payment-selection.spec.ts
- consumer-offers.spec.ts
- consumer-offer-selection.spec.ts
- consumer-offer-countdown.spec.ts
- consumer-status-tracking.spec.ts
- consumer-tracking.spec.ts
- consumer-cancellation-workflow.spec.ts
- consumer-dispute.spec.ts

#### Batch 2: Provider Tests

```bash
npm run test:e2e -- tests/e2e/provider-*.spec.ts --project=chromium --workers=2
```

**Files (14):**
- provider-registration.spec.ts
- provider-verification-status.spec.ts
- provider-service-areas.spec.ts
- provider-availability-toggle.spec.ts
- provider-document-management.spec.ts
- provider-request-browser.spec.ts
- provider-offer-submission.spec.ts
- provider-offer-notification.spec.ts
- provider-active-offers.spec.ts
- provider-withdraw-offer.spec.ts
- provider-offer-edge-cases.spec.ts
- provider-visibility.spec.ts
- provider-earnings.spec.ts
- provider-earnings-seeded.spec.ts
- provider-earnings-workflow.spec.ts
- provider-commission-settlement.spec.ts
- provider-map-view.spec.ts
- provider-settings.spec.ts
- provider-ux-redesign.spec.ts

#### Batch 3: Admin Tests

```bash
npm run test:e2e -- tests/e2e/admin-*.spec.ts --project=chromium --workers=2
```

**Files (14):**
- admin-auth.spec.ts
- admin-dashboard-metrics.spec.ts
- admin-orders.spec.ts
- admin-orders-seeded.spec.ts
- admin-orders-mobile-ux.spec.ts (NEW)
- admin-panel-ux.spec.ts
- admin-pricing.spec.ts
- admin-providers.spec.ts
- admin-providers-ux.spec.ts (NEW)
- admin-settings.spec.ts
- admin-settlement.spec.ts
- admin-status-sync.spec.ts
- admin-verification.spec.ts
- admin-verification-workflow.spec.ts
- admin-disputes.spec.ts

#### Batch 4: Supplier Tests (Legacy)

```bash
npm run test:e2e -- tests/e2e/supplier-*.spec.ts --project=chromium --workers=2
```

**Files (6):**
- supplier-auth.spec.ts
- supplier-dashboard.spec.ts
- supplier-request-details.spec.ts
- supplier-accept.spec.ts
- supplier-deliver.spec.ts
- supplier-profile.spec.ts

#### Batch 5: Workflow & Integration Tests

```bash
npm run test:e2e -- tests/e2e/*workflow*.spec.ts tests/e2e/*integration*.spec.ts --project=chromium --workers=1
```

**Files:**
- chain1-happy-path.spec.ts
- request-timeout-workflow.spec.ts
- consumer-cancellation-workflow.spec.ts
- provider-earnings-workflow.spec.ts
- epic12-integration.spec.ts

#### Batch 6: Specialized Tests

```bash
# Rating system
npm run test:e2e -- tests/e2e/rating-review.spec.ts --project=chromium --workers=1

# PWA & Push
npm run test:e2e -- tests/e2e/pwa*.spec.ts tests/e2e/push-subscription.spec.ts --project=chromium --workers=1

# Session handling
npm run test:e2e -- tests/e2e/session-expiry.spec.ts --project=chromium --workers=1

# En Camino status
npm run test:e2e -- tests/e2e/en-camino-delivery-status.spec.ts --project=chromium --workers=1

# Offer cancellation
npm run test:e2e -- tests/e2e/offer-cancellation-flow.spec.ts --project=chromium --workers=1
```

---

## Part B: Manual Device Testing

### Test 1: Push Notification Security (BUG-R2-003, R2-017)

**Objective:** Verify push notifications follow user, not device

**Setup:**
- Device A: Phone
- Device B: Laptop

| Step | Action | Expected | Pass/Fail |
|------|--------|----------|-----------|
| 1.1 | Log in as Consumer A on Phone | Push enabled | |
| 1.2 | Log OUT of Consumer A on Phone | | |
| 1.3 | Log in as Consumer B on Phone | Push enabled | |
| 1.4 | Log in as Consumer A on Laptop | Push enabled | |
| 1.5 | As Provider, create offer for Consumer A | | |
| 1.6 | **VERIFY:** Notification appears on Laptop | NOT on Phone | |
| 1.7 | **VERIFY:** Phone (Consumer B) gets NO notification | | |

---

### Test 2: Role Isolation (BUG-R2-004)

**Objective:** Verify users cannot access other roles' views

| Step | Action | Expected | Pass/Fail |
|------|--------|----------|-----------|
| 2.1 | Log in as Admin | Admin dashboard | |
| 2.2 | Navigate to /settings (consumer route) | **Redirected** to admin | |
| 2.3 | Navigate to /provider/requests | **Redirected** to admin | |
| 2.4 | Log in as Consumer | Consumer home | |
| 2.5 | Navigate to /admin/orders | **Redirected** to login or home | |
| 2.6 | Log in as Provider | Provider dashboard | |
| 2.7 | Navigate to /admin/orders | **Redirected** to provider | |

---

### Test 3: Admin Orders Mobile UX (BUG-R2-007, R2-008)

**Objective:** Verify admin orders page is mobile-friendly

**Device:** Mobile phone (or Chrome DevTools mobile emulation)

| Step | Action | Expected | Pass/Fail |
|------|--------|----------|-----------|
| 3.1 | Log in as Admin on mobile | Admin dashboard | |
| 3.2 | Navigate to Orders | Orders page loads | |
| 3.3 | **VERIFY:** Cards display cleanly | No overflow, no clutter | |
| 3.4 | **VERIFY:** Status badge visible | Clear status indicator | |
| 3.5 | **VERIFY:** Filter dropdown works | Full text visible | |
| 3.6 | Click an order card | Detail page opens | |
| 3.7 | **VERIFY:** Status in separate row | Not cramped in header | |

---

### Test 4: Admin Provider Ratings (BUG-R2-010, R2-011)

**Objective:** Verify provider ratings visible in admin

| Step | Action | Expected | Pass/Fail |
|------|--------|----------|-----------|
| 4.1 | Log in as Admin | Admin dashboard | |
| 4.2 | Navigate to Providers | Providers list | |
| 4.3 | **VERIFY:** Email on cards | Email visible | |
| 4.4 | **VERIFY:** Rating badge on cards | Stars + count visible | |
| 4.5 | Click a provider with ratings | Detail panel opens | |
| 4.6 | **VERIFY:** Rating in detail header | Rating badge visible | |

---

### Test 5: Provider Mis Ofertas (BUG-R2-009, R2-018)

**Objective:** Verify offer list filtering works correctly

| Step | Action | Expected | Pass/Fail |
|------|--------|----------|-----------|
| 5.1 | Log in as Provider | Provider dashboard | |
| 5.2 | Navigate to Mis Ofertas | Offers list | |
| 5.3 | **VERIFY:** No default filter applied | All offers visible | |
| 5.4 | **VERIFY:** Completed deliveries hidden | Only active offers shown | |
| 5.5 | Apply "Pending" filter | Only pending offers shown | |
| 5.6 | Clear filter | All active offers return | |

---

### Test 6: Toast Font Consistency (BUG-R2-016)

**Objective:** Verify toast styling matches app

| Step | Action | Expected | Pass/Fail |
|------|--------|----------|-----------|
| 6.1 | Trigger a success action | Success toast appears | |
| 6.2 | **VERIFY:** Font matches app (Poppins) | Consistent typography | |
| 6.3 | **VERIFY:** Green checkmark icon | CircleCheckIcon visible | |
| 6.4 | Trigger an error | Error toast appears | |
| 6.5 | **VERIFY:** Red X icon | OctagonXIcon visible | |

---

## Part C: Expected Test Results

### E2E Suite Expected Results

Based on historical data:

| Category | Tests | Expected Pass | Expected Skip | Notes |
|----------|-------|---------------|---------------|-------|
| Consumer | ~150 | ~145 | 5 | Some require dev-login |
| Provider | ~120 | ~105 | 15 | Provider auth tests |
| Admin | ~100 | ~98 | 2 | Most should pass |
| Supplier | ~40 | ~38 | 2 | Legacy tests |
| Workflows | ~50 | ~48 | 2 | Integration tests |
| **Total** | ~600 | ~86% | ~14% | Standard skip rate |

**Expected Skip Rate:** ~14% (provider auth tests without dev-login users)

---

## Part D: Issue Tracking

### New Bugs Found This Round

| ID | Title | Severity | Test | Status |
|----|-------|----------|------|--------|
| | | | | |

### Regression Issues

| ID | Title | Severity | Original Fix | Status |
|----|-------|----------|--------------|--------|
| | | | | |

---

## Execution Checklist

### Pre-Execution

- [ ] Verify production deployment complete
- [ ] Check Vercel build status
- [ ] Clear browser caches on test devices
- [ ] Verify test accounts work (admin, consumer, supplier)

### E2E Execution

- [ ] Batch 1: Health check & core flows
- [ ] Batch 2: Consumer tests
- [ ] Batch 3: Provider tests
- [ ] Batch 4: Admin tests
- [ ] Batch 5: Supplier tests
- [ ] Batch 6: Workflow tests
- [ ] Batch 7: Specialized tests

### Manual Testing

- [ ] Test 1: Push notification security
- [ ] Test 2: Role isolation
- [ ] Test 3: Admin orders mobile UX
- [ ] Test 4: Admin provider ratings
- [ ] Test 5: Provider Mis Ofertas
- [ ] Test 6: Toast styling

### Post-Execution

- [ ] Document all failures
- [ ] Categorize issues (new bug / regression / flaky test)
- [ ] Update bug report document if needed
- [ ] Mark test plan as complete

---

## Quick Start Commands

```bash
# Run all E2E tests (full suite)
npm run test:e2e -- --project=chromium --workers=2

# Run with reporter
npm run test:e2e -- --project=chromium --workers=2 --reporter=html

# Run specific batch
npm run test:e2e -- tests/e2e/admin-*.spec.ts --project=chromium --workers=2

# Run single test for debugging
npm run test:e2e -- tests/e2e/admin-orders-mobile-ux.spec.ts --project=chromium --workers=1 --debug
```

---

*Created: 2026-01-05*
*Epic 12.8 deployment verified*
