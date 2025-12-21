# E2E Test: 10-3 - Offer Countdown Timer (Consumer View)

## Test Information

| Field | Value |
|-------|-------|
| **Generated** | 2025-12-20 |
| **Story** | 10-3 - Offer Countdown Timer (Consumer View) |
| **Epic** | Epic 10: Consumer Offer Selection |
| **Base URL** | https://nitoagua.vercel.app |
| **Personas** | 🔵 Consumer (Doña María) |
| **Total Scenarios** | 7 ACs, 23 test scenarios |
| **Estimated Time** | 15 min |

---

## Legend

| Icon | Meaning |
|------|---------|
| 👆 | Click action |
| ⌨️ | Type/input action |
| 👁️ | Verify/assert (check visually) |
| ⏳ | Wait for condition |
| 🔄 | Refresh/reload page |
| 📸 | Take screenshot (optional) |
| 📍 | Checkpoint - safe to pause here |

| Badge | Persona |
|-------|---------|
| 🔵 | Consumer (Doña María) |

---

## Pre-Execution Setup

### Environment Verification
- [x] 👁️ Chrome browser open with Claude Extension active
- [x] 👁️ Network connection stable

### Test Data Requirement

**⚠️ IMPORTANT:** This test requires offers with various expiration times:
- At least 1 offer with > 1 hour remaining
- At least 1 offer with 10-59 minutes remaining
- At least 1 offer with < 10 minutes remaining (for orange)
- At least 1 offer with < 5 minutes remaining (for red)
- At least 1 expired offer

**If test data not available:** Run `npm run seed:offers` in development, or note scenarios as "SKIPPED - no test data"

### 🔵 Consumer Login

1. [x] 👆 Navigate to: `https://nitoagua.vercel.app`
2. [x] 👁️ Verify: Home page loads
3. [x] 👆 Click "Iniciar Sesión" or login button
4. [x] 👁️ Verify: Login page shows (if dev mode: role selector buttons visible)
5. [x] 👆 Click "Consumer" role button OR enter:
   - Email: `consumer@nitoagua.cl`
   - Password: `consumer.123`
6. [x] 👆 Click "Sign In" if using credentials
7. [x] 👁️ Verify: Consumer home/dashboard loads
8. [x] 👁️ Verify: User is logged in as consumer

📍 **CHECKPOINT 0** - Consumer logged in successfully ✅

---

## Navigate to Offers Page

1. [x] 👆 Navigate to "Mis Solicitudes" or requests page
2. [x] 👁️ Verify: List of water requests displayed
   - **ACTUAL:** "Aún no tienes solicitudes" - Consumer has no requests
3. [ ] ⏭️ BLOCKED - Click on a request that has pending offers
   - **Reason:** No requests exist for this consumer account
4. [ ] ⏭️ BLOCKED - Verify: Offers page loads with offer cards visible

📍 **CHECKPOINT 1** - ⚠️ BLOCKED - No requests with offers available

**Note:** Attempted to access seeded test data at `/request/33333333-3333-3333-3333-333333333333/offers?token=seed-token-pending` but received "Solicitud no encontrada" - seed data does not exist on production.

---

## AC10.3.1: Countdown shows "Expira en MM:SS" when < 1 hour

**Priority:** 🔴 Critical

### Scenario 1.1: Happy Path - MM:SS format displays

1. [ ] 👁️ Find an offer card with < 1 hour remaining
2. [ ] 👁️ Verify: Timer text starts with "Expira en"
3. [ ] 👁️ Verify: Format is "MM:SS" (e.g., "Expira en 45:30")
   - Two digits for minutes
   - Colon separator
   - Two digits for seconds
4. [ ] 📸 Optional: Screenshot of MM:SS format

**Result:**
- [ ] ✅ PASSED - MM:SS format correct
- [x] ⏭️ SKIPPED - No test data available on production
- [ ] ❌ FAILED - Describe issue: _______________

---

## AC10.3.2: Countdown shows "Expira en X h MM min" when > 1 hour

**Priority:** 🔴 Critical

### Scenario 2.1: Happy Path - Hours format displays

1. [ ] 👁️ Find an offer card with > 1 hour remaining
2. [ ] 👁️ Verify: Timer text starts with "Expira en"
3. [ ] 👁️ Verify: Format is "X h MM min" (e.g., "Expira en 2 h 15 min")
   - Hours as number
   - "h" separator
   - Minutes as number
   - "min" suffix
4. [ ] 📸 Optional: Screenshot of hours format

### Scenario 2.2: Edge Case - Exactly 1 hour boundary

1. [ ] 👁️ If an offer is near 1h 00min, observe format
   - At 1h 00min: Should show "1 h 00 min" (NOT "60:00")
   - At 59:59: Should switch to "59:59" format

**Result:**
- [ ] ✅ PASSED - Hours format correct
- [x] ⏭️ SKIPPED - No test data available on production
- [ ] ❌ FAILED - Describe issue: _______________

---

## AC10.3.3: Visual urgency - orange < 10 min, red < 5 min

**Priority:** 🔴 Critical

### Scenario 3.1: Normal state (> 10 min)

1. [ ] 👁️ Find offer with > 10 minutes remaining
2. [ ] 👁️ Verify: Timer text color is NEUTRAL (gray/muted)
   - NOT orange, NOT red

### Scenario 3.2: Warning state (< 10 min, >= 5 min)

1. [ ] 👁️ Find offer with 5-10 minutes remaining
2. [ ] 👁️ Verify: Timer text color is ORANGE
   - Visually stands out from normal text
3. [ ] 📸 Optional: Screenshot of orange timer

### Scenario 3.3: Critical state (< 5 min)

1. [ ] 👁️ Find offer with < 5 minutes remaining
2. [ ] 👁️ Verify: Timer text color is RED
   - More urgent than orange
   - Clearly indicates time is running out
3. [ ] 📸 Optional: Screenshot of red timer

### Scenario 3.4: Color transition observation

1. [ ] ⏳ If possible, watch an offer transition:
   - From normal to orange (at 10:00 → 9:59)
   - From orange to red (at 5:00 → 4:59)
2. [ ] 👁️ Verify: Transition is immediate (not gradual)

**Result:**
- [ ] ✅ PASSED - All urgency colors display correctly
- [x] ⏭️ SKIPPED - No test data available on production
- [ ] ❌ FAILED - Describe issue: _______________

📍 **CHECKPOINT 2** - ⏭️ SKIPPED

---

## AC10.3.4: Expired offer shows "Expirada" badge (gray)

**Priority:** 🔴 Critical

### Scenario 4.1: Already-expired offer display

1. [ ] 👁️ Look for any offer showing "Expirada" text
2. [ ] 👁️ Verify: Badge/text is visible and readable
3. [ ] 👁️ Verify: Text is in gray/muted color
4. [ ] 👁️ Verify: Card appears visually different from active offers

### Scenario 4.2: Real-time expiration (if observable)

1. [ ] ⏳ If an offer is about to expire (< 1 min), watch it
2. [ ] 👁️ Verify: When timer reaches 00:00, it changes to "Expirada"
3. [ ] 👁️ Verify: No error or crash occurs during transition
4. [ ] 👁️ Verify: Card visual state updates (grays out)

**Result:**
- [ ] ✅ PASSED - "Expirada" badge displays correctly
- [x] ⏭️ SKIPPED - No test data available on production
- [ ] ❌ FAILED - Describe issue: _______________

---

## AC10.3.5: "Seleccionar" button disabled on expired offers

**Priority:** 🔴 Critical

### Scenario 5.1: Disabled button on expired offer

1. [ ] 👁️ Find an expired offer card
2. [ ] 👁️ Verify: "Seleccionar" button appears DISABLED
   - Visually grayed out
   - Cursor should not show pointer on hover
3. [ ] 👆 Attempt to click the disabled button
4. [ ] 👁️ Verify: Nothing happens (no navigation, no error)

### Scenario 5.2: Button transition on expiration

1. [ ] ⏳ If watching an offer expire in real-time:
2. [ ] 👁️ Verify: Button transitions from enabled to disabled
3. [ ] 👁️ Verify: No error or flash during transition

**Result:**
- [ ] ✅ PASSED - Button correctly disabled
- [x] ⏭️ SKIPPED - No test data available on production
- [ ] ❌ FAILED - Describe issue: _______________

📍 **CHECKPOINT 3** - ⏭️ SKIPPED

---

## AC10.3.6: Expired offers at bottom or visually faded

**Priority:** 🟡 Important

### Scenario 6.1: Visual fading of expired offers

1. [ ] 👁️ Compare expired offer card to active offer card
2. [ ] 👁️ Verify: Expired offer has reduced opacity (faded look)
   - Should be ~50% opacity
3. [ ] 👁️ Verify: Active offers remain at full opacity

### Scenario 6.2: Sort order (expired at bottom)

1. [ ] 👁️ If there are both active and expired offers:
2. [ ] 👁️ Verify: Active offers appear ABOVE expired offers
3. [ ] 👁️ Verify: Among active offers, sorted by delivery window or time

### Scenario 6.3: All offers expired

1. [ ] 👁️ If all offers are expired:
2. [ ] 👁️ Verify: All cards are visible (not hidden)
3. [ ] 👁️ Verify: All cards show faded/expired state

**Result:**
- [ ] ✅ PASSED - Expired offers properly sorted and faded
- [x] ⏭️ SKIPPED - No test data available on production
- [ ] ❌ FAILED - Describe issue: _______________

---

## AC10.3.7: Countdown updates every second

**Priority:** 🔴 Critical

### Scenario 7.1: Timer decrements smoothly

1. [ ] 👁️ Focus on any active offer countdown timer
2. [ ] ⏳ Watch for 10-15 seconds
3. [ ] 👁️ Verify: Seconds digit decrements each second
   - e.g., :10 → :09 → :08 → :07...
4. [ ] 👁️ Verify: No freezing or skipping
5. [ ] 👁️ Verify: Minute rollover works (01:00 → 00:59)

### Scenario 7.2: Timer continues after idle

1. [ ] ⏳ Stop interacting with the page for 30 seconds
2. [ ] 👁️ Verify: Timer is still counting down (not frozen)
3. [ ] 👁️ Verify: Time shown is accurate (matches real elapsed time)

**Result:**
- [ ] ✅ PASSED - Timer updates smoothly every second
- [x] ⏭️ SKIPPED - No test data available on production
- [ ] ❌ FAILED - Describe issue: _______________

📍 **CHECKPOINT 4** - ⏭️ SKIPPED

---

## Test Results

### Summary

| Metric | Value |
|--------|-------|
| **Executed On** | 2025-12-20 |
| **Executed By** | Atlas/Claude (Chrome Extension) |
| **Total ACs** | 7 |
| **Total Scenarios** | 23 |
| **Passed** | 0 |
| **Failed** | 0 |
| **Skipped** | 7 (all ACs) |
| **Pass Rate** | N/A - No test data |

### AC-Level Results

| AC | Description | Result |
|----|-------------|--------|
| AC10.3.1 | MM:SS format < 1 hour | ⏭️ SKIPPED |
| AC10.3.2 | X h MM min format > 1 hour | ⏭️ SKIPPED |
| AC10.3.3 | Orange/red urgency colors | ⏭️ SKIPPED |
| AC10.3.4 | "Expirada" badge on expired | ⏭️ SKIPPED |
| AC10.3.5 | Disabled button on expired | ⏭️ SKIPPED |
| AC10.3.6 | Expired at bottom/faded | ⏭️ SKIPPED |
| AC10.3.7 | Updates every second | ⏭️ SKIPPED |

### Overall Result

- [ ] ✅ **PASSED** - All critical scenarios passed
- [ ] ⚠️ **PASSED WITH ISSUES** - Minor issues noted
- [ ] ❌ **FAILED** - Critical scenarios failed
- [x] ⏭️ **SKIPPED** - No test data available on production

---

### Failure Log

| AC | Step | Expected | Actual | Screenshot |
|----|------|----------|--------|------------|
| | | | | |
| | | | | |
| | | | | |

### Notes & Observations

```
EXECUTION SUMMARY:
- Test executed via Chrome Extension on production (https://nitoagua.vercel.app)
- Consumer login (dev mode) worked successfully
- Consumer account has no active water requests with pending offers
- Seed test data (UUID: 33333333-3333-3333-3333-333333333333) does not exist on production

ROOT CAUSE:
The countdown timer tests require offers on an active water request. The test data
is seeded only in local development environments using `npm run seed:offers`.
Production does not have this seed data.

RECOMMENDATIONS:
1. For complete E2E testing of Story 10-3, run tests on local environment with:
   - npm run seed:offers (creates test requests with offers)
   - NEXT_PUBLIC_DEV_LOGIN=true enabled

2. Alternatively, create a real water request on production and have a provider
   submit offers to test the countdown functionality manually.

3. The Playwright automated tests (tests/e2e/consumer-offer-countdown.spec.ts)
   cover all ACs and should be run in CI/local environment where seed data exists.

VERIFIED FUNCTIONALITY:
- Consumer login via dev mode works on production
- Navigation to history page works
- "Solicitud no encontrada" error page displays correctly when request doesn't exist
```

---

## Post-Execution

### Save Results
1. [ ] Update the checkboxes above with results (✅/❌/⏭️)
2. [ ] Fill in the Summary table
3. [ ] Mark AC-Level Results (✅ passed, ❌ failed, ⏭️ skipped)
4. [ ] Document any failures in the Failure Log
5. [ ] Add notes and observations

### Commit Results
```bash
git add docs/testing/e2e-checklists/
git commit -m "test(e2e): 10-3 - offer countdown timer executed"
git push origin develop
```

---

*Generated by Atlas E2E Workflow*
*Checklist Version: 2.0 (Complete)*
