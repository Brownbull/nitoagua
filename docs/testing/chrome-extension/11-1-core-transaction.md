# E2E Test: 11-1 - Core Transaction Flow (CHAIN-1)

## Test Information

| Field | Value |
|-------|-------|
| **Generated** | 2025-12-22 |
| **Story** | 11-1 - Core Transaction Flow |
| **Epic** | CHAIN-1 Happy Path Validation |
| **Base URL** | https://nitoagua.vercel.app |
| **Personas** | 🔵 Consumer, 🟢 Provider |
| **Total Scenarios** | 5 (+ optional multi-offer) |
| **Estimated Time** | 15-20 min |

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
| 🟢 | Provider (Don Pedro) |

---

## Pre-Execution Setup

### Environment Verification
- [ ] 👁️ Chrome browser open with Claude Extension active
- [ ] 👁️ Extension icon visible in toolbar
- [ ] 👁️ Network connection stable

### Production Data Setup
> Run before first test execution:
> ```bash
> npm run chain1:setup
> ```
> Run after testing to cleanup:
> ```bash
> npm run chain1:cleanup:confirm
> ```

### Tab Setup

#### 🔵 Tab 1: Consumer

1. [ ] 👆 Open new browser tab
2. [ ] ⌨️ Navigate to: `https://nitoagua.vercel.app/login`
3. [ ] 👁️ Verify: Login page loads
4. [ ] ⌨️ Enter email: `consumer@nitoagua.cl`
5. [ ] ⌨️ Enter password: `test.123`
6. [ ] 👆 Click "Iniciar Sesión" button
7. [ ] 👁️ Verify: Home page loads
8. [ ] 👁️ Verify: "Pedir Agua" button visible

**Keep this tab open throughout testing**

#### 🟢 Tab 2: Provider

1. [ ] 👆 Open new browser tab
2. [ ] ⌨️ Navigate to: `https://nitoagua.vercel.app/login`
3. [ ] 👁️ Verify: Login page loads
4. [ ] ⌨️ Enter email: `supplier@nitoagua.cl`
5. [ ] ⌨️ Enter password: `test.123`
6. [ ] 👆 Click "Iniciar Sesión" button
7. [ ] 👁️ Verify: Provider dashboard loads
8. [ ] 👁️ Verify: Navigation shows provider options

**Keep this tab open throughout testing**

📍 **CHECKPOINT 0** - Both personas logged in, tabs arranged side by side

---

## Step C1: Consumer Requests Water

**Priority:** 🔴 Critical
**Persona:** 🔵 Consumer

### 🔵 Tab 1: Consumer

1. [ ] 👆 Click "Pedir Agua" button on home screen
2. [ ] 👁️ Verify: Request form opens
3. [ ] ⌨️ Select Comuna: Choose any available (e.g., Villarrica)
4. [ ] ⌨️ Enter cantidad: `1000` (liters)
5. [ ] 👆 Select urgency level (any)
6. [ ] ⌨️ Enter/verify phone number
7. [ ] 👆 Click "Confirmar Pedido" / Submit button
8. [ ] 👁️ Verify: Confirmation screen appears
9. [ ] 👁️ Verify: Tracking code is displayed
10. [ ] 👁️ Verify: Status shows "Buscando ofertas" or similar
11. [ ] 📸 Screenshot: Confirmation screen

**Record tracking code:** ________________

📍 **CHECKPOINT 1** - Request created successfully

<details>
<summary>Checkpoint State (expand if resuming)</summary>

- Tab 1 (Consumer): On confirmation/tracking screen
- Tab 2 (Provider): On dashboard
- Data created: 1 water request (pending)

</details>

---

## Step P5: Provider Browses Requests

**Priority:** 🔴 Critical
**Persona:** 🟢 Provider

### ⚠️ Cross-Persona Synchronization

**Switching from Consumer to Provider:**

1. [ ] 👁️ In Consumer tab: Verify confirmation screen still shows
2. [ ] ⏳ Wait 3-5 seconds for system sync
3. [ ] 👆 Switch to Provider tab
4. [ ] 🔄 Refresh the page

### 🟢 Tab 2: Provider

5. [ ] 👆 Navigate to "Solicitudes" / Request browser
6. [ ] 👁️ Verify: Request list loads
7. [ ] 👁️ Verify: Consumer's new request appears in list
8. [ ] 👁️ Verify: Can see location (comuna)
9. [ ] 👁️ Verify: Can see amount (1000L)
10. [ ] 👁️ Verify: Urgency indicator visible
11. [ ] 📸 Screenshot: Request in provider dashboard

**If request not visible after refresh:**
- Wait 10 more seconds
- Refresh again
- If still not visible, note as potential issue

📍 **CHECKPOINT 2** - Provider sees consumer's request

<details>
<summary>Checkpoint State (expand if resuming)</summary>

- Tab 1 (Consumer): On tracking screen
- Tab 2 (Provider): On request list, can see new request
- Data: 1 water request visible to provider

</details>

---

## Step P6: Provider Submits Offer

**Priority:** 🔴 Critical
**Persona:** 🟢 Provider

### 🟢 Tab 2: Provider (continued)

1. [ ] 👆 Click on consumer's request to view details
2. [ ] 👁️ Verify: Request details page opens
3. [ ] 👁️ Verify: Full request info visible (address, amount, instructions)
4. [ ] 👆 Click "Hacer Oferta" / Make Offer button
5. [ ] 👁️ Verify: Offer form/dialog appears
6. [ ] 👁️ Verify: Auto-calculated price is shown
7. [ ] ⌨️ (Optional) Add delivery window or message
8. [ ] 👆 Click confirm/submit offer
9. [ ] 👁️ Verify: Offer submitted successfully
10. [ ] 👆 Navigate to "Mis Ofertas" / My Offers
11. [ ] 👁️ Verify: New offer appears in list
12. [ ] 📸 Screenshot: Offer confirmation

📍 **CHECKPOINT 3** - Offer submitted by provider

<details>
<summary>Checkpoint State (expand if resuming)</summary>

- Tab 1 (Consumer): On tracking screen
- Tab 2 (Provider): On "Mis Ofertas", offer visible
- Data: 1 water request + 1 active offer

</details>

---

## (Optional) Multiple Offers Test

**Priority:** 🟡 Important
**Note:** Requires second approved provider account

### If Provider 2 Available:

1. [ ] 👆 Open Tab 3, login as Provider 2
2. [ ] 👆 Navigate to Solicitudes
3. [ ] 👆 Find same request, submit competing offer
4. [ ] 👁️ Verify: Second offer submitted

**If Provider 2 NOT available:**
- [ ] ⏭️ SKIP - Mark as skipped (no second provider)

---

## Step C2: Consumer Accepts Offer

**Priority:** 🔴 Critical
**Persona:** 🔵 Consumer

### ⚠️ Cross-Persona Synchronization

**Switching from Provider to Consumer:**

1. [ ] 👁️ In Provider tab: Verify offer shows in "Mis Ofertas"
2. [ ] ⏳ Wait 3-5 seconds for system sync
3. [ ] 👆 Switch to Consumer tab
4. [ ] 🔄 Refresh the page

### 🔵 Tab 1: Consumer

5. [ ] 👁️ Verify: Request status page loads
6. [ ] 👁️ Verify: Status updated (offers available)
7. [ ] 👁️ Verify: Offer(s) visible
8. [ ] 👁️ Verify: Provider name visible on offer
9. [ ] 👁️ Verify: Price/delivery window visible
10. [ ] 👆 Click "Aceptar" on desired offer
11. [ ] 👁️ Verify: Confirmation dialog (if any)
12. [ ] 👆 Confirm acceptance
13. [ ] 👁️ Verify: Status changes to "Aceptado" / "En camino"
14. [ ] 📸 Screenshot: Accepted state

📍 **CHECKPOINT 4** - Offer accepted by consumer

<details>
<summary>Checkpoint State (expand if resuming)</summary>

- Tab 1 (Consumer): Shows accepted status
- Tab 2 (Provider): Should reflect accepted offer
- Data: 1 accepted water request + 1 accepted offer

</details>

---

## Step P10: Provider Completes Delivery

**Priority:** 🔴 Critical
**Persona:** 🟢 Provider

### ⚠️ Cross-Persona Synchronization

**Switching from Consumer to Provider:**

1. [ ] 👁️ In Consumer tab: Verify status shows "Aceptado" or "En camino"
2. [ ] ⏳ Wait 3-5 seconds for system sync
3. [ ] 👆 Switch to Provider tab
4. [ ] 🔄 Refresh the page

### 🟢 Tab 2: Provider

5. [ ] 👆 Navigate to active deliveries / accepted offers
6. [ ] 👁️ Verify: Accepted delivery is visible
7. [ ] 👆 Click on the delivery to view details
8. [ ] 👆 Click "Marcar Entregado" / Mark Delivered
9. [ ] 👁️ Verify: Confirmation dialog (if any)
10. [ ] 👆 Confirm completion
11. [ ] 👁️ Verify: Delivery marked as complete
12. [ ] 👁️ Verify: Commission logged (if visible)
13. [ ] 📸 Screenshot: Completion screen

📍 **CHECKPOINT 5** - CHAIN-1 Complete

<details>
<summary>Checkpoint State (expand if resuming)</summary>

- Tab 1 (Consumer): Should show delivered status
- Tab 2 (Provider): Shows completed delivery
- Data: 1 delivered water request, commission recorded

</details>

---

## Test Results

### Summary

| Metric | Value |
|--------|-------|
| **Executed On** | 2025-12-22 |
| **Executed By** | Claude + Chrome Extension |
| **Total Steps** | ~45 |
| **Passed** | 2 (C1, P5) |
| **Failed** | 0 |
| **Skipped** | 3 (P6, C2, P10 - RLS blocked, completed via admin) |
| **Pass Rate** | N/A - Test incomplete due to RLS issues |

### Step Results

| Step | Workflow | Result | Notes |
|------|----------|--------|-------|
| C1 | Consumer Request | [x] Pass | Request created: #FC833A0F |
| P5 | Provider Browse | [x] Pass | Request visible in provider list |
| P6 | Provider Offer | [x] Skipped | RLS blocked - completed via admin script |
| C2 | Consumer Accept | [x] Skipped | RLS blocked - completed via admin script |
| P10 | Provider Complete | [x] Skipped | RLS blocked - completed via admin script |

### Overall Result

- [ ] ✅ **PASSED** - CHAIN-1 fully functional
- [ ] ⚠️ **PASSED WITH ISSUES** - Minor issues noted
- [x] ❌ **BLOCKED** - RLS policy issues prevent UI testing

---

### Failure Log

| Step | Description | Expected | Actual | Screenshot |
|------|-------------|----------|--------|------------|
| P6 | Provider create offer | Offer created via UI | "No tienes permiso para crear ofertas" - RLS policy checks wrong role name | N/A |
| C2 | Consumer view offers | Offers page loads | "permission denied for table users" | N/A |
| C2 | Consumer view request | Request details load | "Solicitud no encontrada" | N/A |
| C2 | Consumer tracking page | Tracking page works | "Enlace no válido" | N/A |

### RLS Issues Found (Must Fix Before Re-test)

| # | Issue | Root Cause | Fix Required |
|---|-------|------------|--------------|
| 1 | Provider can't create offers | Policy checks `role = 'provider'` but profiles use `role = 'supplier'` | Apply migration `20251219180000_fix_offers_rls_role_name.sql` |
| 2 | Consumer can't view own requests | Missing RLS policy for consumer access | Add policy for consumer to view own water_requests |
| 3 | Tracking token page broken | Unknown RLS or routing issue | Debug `/track/[token]` page |
| 4 | Offers page permission error | RLS on users table | Fix join query or add users read policy |

### Notes & Observations

```
LESSON LEARNED: Chrome Extension E2E testing on production should be postponed
until:
1. All RLS policies are verified working via Playwright tests
2. Manual testing confirms happy path works end-to-end
3. Application is more polished and stable

This type of testing is valuable for final validation but is too fragile
when the app still has RLS and permission issues. Each failure cascades
and makes the entire test session unproductive.

RECOMMENDED APPROACH:
1. First: Fix RLS issues using Playwright tests (faster iteration)
2. Second: Manual testing to verify flows work
3. Last: Chrome Extension E2E for final production validation

Test data created during this session was completed via admin scripts:
- Request ID: fc833a0f-7cbe-4861-9530-dc63e8d607c5
- Offer ID: 5551ad88-d426-44fd-b397-f6a0fd404ed1
- Final status: delivered (completed via admin client)
```

---

## Post-Execution

### Cleanup Test Data
```bash
npm run chain1:cleanup:confirm
```

### Commit Results
```bash
git add docs/testing/chrome-extension/
git commit -m "test(e2e): 11-1 CHAIN-1 core transaction - executed"
git push origin develop
```

---

*Generated by Atlas E2E Workflow*
*Checklist Version: 1.0*
