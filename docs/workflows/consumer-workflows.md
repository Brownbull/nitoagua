# Consumer Workflows - nitoagua

**Document Type:** User Workflow Reference
**Persona:** Doña María (Consumer)
**Last Updated:** 2025-12-24
**Epic 11 Validation Status:** Complete
**Atlas Reference:** Section 8 (Workflow Chains) - "Consumer Water Request (V2 with Offers)"

---

## Overview

This document catalogs all **consumer-facing workflows** in nitoagua that have been validated through E2E testing. Each workflow represents a complete user journey that a consumer can accomplish in the application.

### Persona Profile: Doña María

- **Age:** 58 years old
- **Tech Savviness:** Low
- **Setup:** Pre-logged-in by daughter
- **Key Needs:** Simple water request, clear status visibility
- **Tolerance:** ≤3 screens, minimal typing, big buttons

---

## Workflow Summary

| ID | Workflow | Status | Test Coverage |
|----|----------|--------|---------------|
| **C1** | Request Water | ✅ Validated | `consumer-request-form.spec.ts`, `consumer-request-submission.spec.ts` |
| **C2** | See & Accept Offers | ✅ Validated | `consumer-offer-selection.spec.ts`, `consumer-offers.spec.ts` |
| **C3** | Track Delivery Status | ✅ Validated | `consumer-tracking.spec.ts`, `consumer-status-tracking.spec.ts` |
| **C4** | Contact Driver | ✅ Validated | `consumer-tracking.spec.ts` (driver info visible) |
| **C5** | Handle Request Timeout | ✅ Validated | `request-timeout-workflow.spec.ts` |
| **C6** | Cancel Pending Request | ✅ Validated | `consumer-cancellation-workflow.spec.ts` |
| **C7** | Cancel with Active Offers | ✅ Validated | `consumer-cancellation-workflow.spec.ts` |

---

## Detailed Workflows

### C1: Request Water

**Purpose:** Consumer submits a new water delivery request

**Flow:**
```
Home Screen → Request Form (3 steps) → Review → Submit → Confirmation
```

**Steps:**
1. **Home Screen:** Consumer sees big "Solicitar Agua" button
2. **Step 1 - Contact & Location:** Name, phone, email, comuna, address, special instructions
3. **Step 2 - Amount Selection:** Choose water amount (1000L, 5000L, 10000L), optional urgency toggle
4. **Step 3 - Review:** See all entered data, price calculation
5. **Submit:** Submit request to database
6. **Confirmation:** See request ID, tracking information

**Success Criteria:**
- Complete form in ≤3 screens
- Minimal typing required
- Clear price display before submit
- Confirmation with tracking ID

**E2E Test Coverage:**
- `tests/e2e/consumer-request-form.spec.ts` (25+ tests)
  - Step 1: Contact + location validation
  - Step 2: Amount selection, urgency toggle
  - Step 3: Review screen display
  - Navigation: Back/forward, state preservation
- `tests/e2e/consumer-request-submission.spec.ts` (30+ tests)
  - Submit button loading states
  - API success/error handling
  - Double-click prevention
  - Error retry with toast

**Status:** ✅ **FULLY VALIDATED**

---

### C2: See & Accept Offers

**Purpose:** Consumer views provider offers and accepts one

**Flow:**
```
Status Page → Offers List → View Offer Details → Accept Offer → Confirmation
```

**Steps:**
1. **Notification:** Consumer receives email/notification that offers are available
2. **Open Status Page:** Consumer navigates to their request status
3. **View Offers:** See list of all provider offers with:
   - Provider name
   - Delivery window (from-to time)
   - Optional message from provider
   - Offer expiration countdown
4. **Select Offer:** Tap on preferred offer
5. **Accept:** Confirm acceptance
6. **Confirmation:** See updated status "Aceptada"

**Success Criteria:**
- See provider identity (name matters to Doña María)
- Clear delivery time window
- One-tap accept flow
- Immediate status update

**E2E Test Coverage:**
- `tests/e2e/consumer-offer-selection.spec.ts` (14+ tests)
  - View offers list
  - Offer details display
  - Accept offer flow
  - Status update after acceptance
- `tests/e2e/consumer-offers.spec.ts`
  - Offer countdown timer
  - Multiple offers comparison
- `tests/e2e/consumer-offer-countdown.spec.ts`
  - Expiration handling

**Status:** ✅ **FULLY VALIDATED**

---

### C3: Track Delivery Status

**Purpose:** Consumer checks current status of their request

**Flow:**
```
Open App → Status Page → View Current Status + Driver Info
```

**Steps:**
1. **Open App:** Consumer opens nitoagua
2. **Navigate to Status:** Go to active request status page
3. **View Status:** See current status with visual indicator:
   - 🟡 **Pendiente:** Waiting for provider offers
   - 🟢 **Aceptada:** Provider accepted, delivery scheduled
   - ✅ **Entregada:** Delivery completed
   - ❌ **Cancelada:** Request cancelled
4. **View Details:** If accepted, see:
   - Provider name
   - Delivery window
   - Driver phone number (C4)
   - Special instructions

**Success Criteria:**
- Status visible immediately on app open
- Clear visual status indicators
- Driver contact info visible when accepted

**E2E Test Coverage:**
- `tests/e2e/consumer-tracking.spec.ts`
  - Status display for all states
  - Real-time updates
- `tests/e2e/consumer-status-tracking.spec.ts`
  - Detailed status information
  - Progress indicators
- `tests/e2e/consumer-request-status.spec.ts`
  - Request status page functionality

**Status:** ✅ **FULLY VALIDATED**

---

### C4: Contact Driver

**Purpose:** Consumer contacts the delivery driver

**Flow:**
```
Status Page → View Driver Info → Tap Phone Number → Call
```

**Steps:**
1. **View Status:** Open request status page
2. **See Driver Info:** When status is "Aceptada", driver info visible
3. **Tap Phone:** Click on driver phone number
4. **Call:** Native phone app opens with number

**Success Criteria:**
- Driver phone visible after offer accepted
- Phone number is tappable/clickable
- Works on mobile devices

**E2E Test Coverage:**
- Covered within `tests/e2e/consumer-tracking.spec.ts`
  - Driver contact info visibility
  - Phone link functionality

**Status:** ✅ **VALIDATED** (as part of C3 tests)

---

### C5: Handle Request Timeout

**Purpose:** Consumer's request expires without accepted offers

**Flow:**
```
Request Pending → 24hr Timeout → Status "Expirada" → Option to Retry
```

**Steps:**
1. **Request Created:** Consumer submitted request
2. **No Offers Accepted:** 24 hours pass without accepted offer
3. **Timeout:** System automatically expires request
4. **Notification:** Consumer informed of expiration
5. **Retry Option:** "Solicitar de Nuevo" button available

**Business Rules:**
- Requests expire after 24 hours without accepted offer
- Consumer can resubmit immediately
- No penalty to consumer

**E2E Test Coverage:**
- `tests/e2e/request-timeout-workflow.spec.ts`
  - Timeout state display
  - Retry flow
  - Status transitions

**Status:** ✅ **FULLY VALIDATED**

---

### C6: Cancel Pending Request

**Purpose:** Consumer cancels a request before any offers accepted

**Flow:**
```
Status Page → Cancel Button → Confirm → Request Cancelled
```

**Steps:**
1. **View Status:** Open pending request
2. **Cancel Button:** Click "Cancelar Solicitud"
3. **Confirm:** Confirm cancellation in dialog
4. **Complete:** Request status changes to "Cancelada"

**Business Rules:**
- Can cancel anytime if status is "Pendiente"
- No penalties to consumer
- Any pending offers are automatically cancelled

**E2E Test Coverage:**
- `tests/e2e/consumer-cancellation-workflow.spec.ts`
  - Cancel pending request
  - Confirmation dialog
  - Status update

**Status:** ✅ **FULLY VALIDATED**

---

### C7: Cancel with Active Offers

**Purpose:** Consumer cancels after receiving offers but before accepting

**Flow:**
```
Status Page (with offers) → Cancel → Offers Cancelled → Request Cancelled
```

**Steps:**
1. **View Status:** Open request with pending offers
2. **Cancel:** Click cancel button
3. **Confirm:** Acknowledge that all offers will be cancelled
4. **Complete:** Request cancelled, all offers marked "Cancelled"

**Business Rules:**
- Providers notified that their offers were cancelled
- No strike against consumer (they didn't accept yet)
- Provider offers return to "cancelled" state

**E2E Test Coverage:**
- `tests/e2e/consumer-cancellation-workflow.spec.ts`
  - Cancel with active offers
  - Provider notification sent
  - All offers marked cancelled

**Status:** ✅ **FULLY VALIDATED**

---

## Workflow Chains

### CHAIN-1: Happy Path Delivery (Consumer Portion)

The consumer's role in the complete delivery transaction:

```
C1 (Request) → [Wait for offers] → C2 (Accept) → C3 (Track) → [Delivery] → ✅ Complete
```

**Test Coverage:** `tests/e2e/chain1-happy-path.spec.ts`

---

## Coverage Summary

| Category | Workflows | Validated |
|----------|-----------|-----------|
| Core Request Flow | C1, C2 | ✅ 2/2 |
| Status & Tracking | C3, C4 | ✅ 2/2 |
| Timeout & Cancel | C5, C6, C7 | ✅ 3/3 |
| **Total** | **7 workflows** | **✅ 100%** |

---

## Related Test Files

| Test File | Workflows Covered |
|-----------|-------------------|
| `consumer-request-form.spec.ts` | C1 |
| `consumer-request-submission.spec.ts` | C1 |
| `consumer-offer-selection.spec.ts` | C2 |
| `consumer-offers.spec.ts` | C2 |
| `consumer-offer-countdown.spec.ts` | C2 |
| `consumer-tracking.spec.ts` | C3, C4 |
| `consumer-status-tracking.spec.ts` | C3 |
| `consumer-request-status.spec.ts` | C3 |
| `request-timeout-workflow.spec.ts` | C5 |
| `consumer-cancellation-workflow.spec.ts` | C6, C7 |
| `chain1-happy-path.spec.ts` | C1, C2, C3 (integration) |

---

## Future Workflows (Not Yet Implemented)

| ID | Workflow | Status | Notes |
|----|----------|--------|-------|
| C8 | Rate Provider | Not implemented | Post-delivery feedback |
| C9 | Request History | Partial | View past requests |
| C10 | Repeat Order | Not implemented | One-tap re-order |

---

*Document generated as part of Story 11-21: Seed Data Blind Spot Analysis*
