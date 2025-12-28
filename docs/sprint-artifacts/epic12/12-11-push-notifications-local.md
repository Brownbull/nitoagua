# Story 12-11: Push Notifications Local Validation

| Field | Value |
|-------|-------|
| **Story ID** | 12-11 |
| **Epic** | Epic 12: Consumer UX Enhancements |
| **Title** | Push Notifications Local Validation |
| **Status** | drafted |
| **Priority** | P1 (Checkpoint) |
| **Points** | 5 |
| **Sprint** | Backlog |
| **Type** | Playwright Validation |

## Purpose

Validate story 12-6 (Web Push Notifications) via Playwright E2E tests for testable components (subscription management, database persistence) and document manual testing for actual push delivery.

## Prerequisites

- [ ] Story 12-6 (Web Push Notifications) - done
- [ ] Story 12-10 (Form Enhancements Production) - done (Phase 2 complete)
- [ ] Local Supabase running
- [ ] VAPID keys configured in .env.local

## Test Limitations

**What CAN be tested with Playwright:**
- Push subscription UI interactions
- Subscription persistence in database
- Permission request handling
- Settings toggle behavior
- Edge function deployment status

**What CANNOT be tested with Playwright:**
- Actual push notification delivery
- Service worker push event handling
- Notification click behavior
- Android PWA behavior

**Manual testing required for:**
- Real device push notification receipt
- Notification appearance when app closed
- Notification click navigation

## Test Coverage

### Automated Tests (Playwright)

| Test ID | Description | Type |
|---------|-------------|------|
| 12-6-T1 | Notification settings shows push subscription toggle | UI |
| 12-6-T2 | User can request notification permission | UI |
| 12-6-T3 | Subscription stored in push_subscriptions table | DB |
| 12-6-T4 | Unsubscribe removes subscription from database | DB |
| 12-6-T5 | Subscription status displayed correctly | UI |
| 12-6-T6 | Graceful handling when push not supported | UI |
| 12-6-T7 | Edge function responds to test call | API |

### Manual Tests (Documented)

| Test ID | Description | Device |
|---------|-------------|--------|
| 12-6-M1 | Push received when app is closed | Android PWA |
| 12-6-M2 | Push received on new offer | Android PWA |
| 12-6-M3 | Push received on status change | Android PWA |
| 12-6-M4 | Notification click opens correct page | Android PWA |
| 12-6-M5 | Notification icon displays correctly | Android PWA |

## Acceptance Criteria

### AC12.11.1: Test File Creation
- [ ] Create `tests/e2e/push-subscription.spec.ts`
- [ ] Create manual test checklist document

### AC12.11.2: Automated Test Execution
- [ ] All 7 automated tests passing
- [ ] Tests handle permission dialogs appropriately
- [ ] Database assertions working

### AC12.11.3: Manual Test Documentation
- [ ] Manual test results documented
- [ ] Screenshots of push notifications captured
- [ ] Device and browser version noted

## Test Commands

```bash
# Run push subscription tests locally
NEXT_PUBLIC_DEV_LOGIN=true DISPLAY= timeout 120 npx playwright test \
  tests/e2e/push-subscription.spec.ts \
  --project=chromium --workers=1 --reporter=list
```

## Manual Testing Procedure

1. **Setup:**
   - Install PWA on Android device (Samsung Galaxy)
   - Log in as test consumer
   - Enable push notifications in settings

2. **Test New Offer Push:**
   - Create request as consumer
   - Close app completely
   - As provider (different device/browser), submit offer
   - Verify push notification appears on consumer device

3. **Test Status Change Push:**
   - Have accepted request
   - Close consumer app
   - As provider, mark as in_transit
   - Verify push notification appears

4. **Test Notification Click:**
   - Click on received notification
   - Verify app opens to correct request page

## Definition of Done

- [ ] All 7 automated tests passing locally
- [ ] Manual tests documented with results
- [ ] Push working on real Android device
- [ ] Ready for production validation (12-12)

---

## Automated Test Results

_To be filled after test execution_

| Test File | Tests | Pass | Fail | Skip |
|-----------|-------|------|------|------|
| push-subscription.spec.ts | 7 | | | |

## Manual Test Results

_To be filled after manual testing_

| Test ID | Result | Notes | Date |
|---------|--------|-------|------|
| 12-6-M1 | | | |
| 12-6-M2 | | | |
| 12-6-M3 | | | |
| 12-6-M4 | | | |
| 12-6-M5 | | | |

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-24 | Story created as checkpoint | Claude |
