# Provider Workflows - nitoagua

**Document Type:** User Workflow Reference
**Persona:** Don Pedro (Provider/Supplier)
**Last Updated:** 2025-12-24
**Epic 11 Validation Status:** Complete
**Atlas Reference:** Section 8 (Workflow Chains) - "Provider Offer Flow"

---

## Overview

This document catalogs all **provider-facing workflows** in nitoagua that have been validated through E2E testing. Each workflow represents a complete user journey that a water delivery provider can accomplish in the application.

### Persona Profile: Don Pedro

- **Age:** 42 years old
- **Tech Savviness:** Medium-High (comfortable with apps)
- **Business:** 60 customers/month, owns cistern truck
- **Key Needs:** See all requests, quick offers, track earnings
- **Tolerance:** Information density OK, efficiency matters

---

## Workflow Summary

### Onboarding Workflows (P1-P4)

| ID | Workflow | Status | Test Coverage |
|----|----------|--------|---------------|
| **P1** | Register Account | ⚠️ Partial | `provider-registration.spec.ts` (OAuth blocked) |
| **P2** | Upload Documents | ❌ Gap | Seeded only - file upload not tested |
| **P3** | Setup Service Areas | ✅ Validated | `provider-service-areas.spec.ts` |
| **P4** | Track Verification Status | ✅ Validated | `provider-verification-status.spec.ts` |

### Daily Operations Workflows (P5-P11)

| ID | Workflow | Status | Test Coverage |
|----|----------|--------|---------------|
| **P5** | Browse Available Requests | ✅ Validated | `provider-request-browser.spec.ts` |
| **P6** | Submit Offer | ✅ Validated | `provider-offer-submission.spec.ts` |
| **P7** | Track My Offers | ✅ Validated | `provider-active-offers.spec.ts` |
| **P8** | Receive Acceptance Notification | ✅ Validated | `provider-offer-notification.spec.ts` |
| **P9** | View Delivery Details | ✅ Validated | `provider-active-offers.spec.ts` |
| **P10** | Complete Delivery | ✅ Validated | `provider-active-offers.spec.ts` (Story 11a-1) |
| **P11** | View Earnings/History | ✅ Validated | `provider-earnings.spec.ts`, `provider-earnings-seeded.spec.ts` |

### Lifecycle Workflows (P12-P16)

| ID | Workflow | Status | Test Coverage |
|----|----------|--------|---------------|
| **P12** | Request Withdrawal | ❌ Gap | Seeded only - button click not tested |
| **P13** | Withdraw/Cancel Offer | ✅ Validated | `provider-withdraw-offer.spec.ts` |
| **P14** | Handle Offer Expiration | ✅ Validated | `provider-offer-edge-cases.spec.ts` |
| **P15** | Handle Request Filled | ✅ Validated | `provider-offer-edge-cases.spec.ts` |
| **P16** | Toggle Availability | ✅ Validated | `provider-availability-toggle.spec.ts` |

---

## Detailed Workflows

### P1: Register Account

**Purpose:** Provider creates an account to offer delivery services

**Flow:**
```
Landing Page → Google OAuth → Profile Setup → Document Upload → Service Areas → Review → Submit
```

**Steps:**
1. **Visit Onboarding:** Go to `/provider/onboarding`
2. **Google Sign-In:** Click "Comenzar con Google"
3. **Personal Info:** Name, RUT, phone number
4. **Vehicle Info:** Type, capacity, working hours/days
5. **Service Areas:** Select comunas (Villarrica, Pucón, etc.)
6. **Documents:** Upload cedula, licencia, vehiculo photos
7. **Bank Info:** RUT (pre-filled), bank, account type, number
8. **Review:** Confirm all information
9. **Submit:** Application submitted for admin review

**Success Criteria:**
- Fast OAuth registration
- Clear 6-step progress indicator
- Profile data persisted in localStorage between steps

**E2E Test Coverage:**
- `tests/e2e/provider-registration.spec.ts` (637 lines)
  - Welcome page display
  - Authentication redirect logic
  - Validation schemas (RUT, phone)
  - Document types configuration
  - Vehicle/bank info configuration
  - **BUT:** Full wizard blocked by Google OAuth

**Status:** ⚠️ **PARTIAL** - UI validated, full submission blocked by OAuth

---

### P2: Upload Documents

**Purpose:** Provider uploads required documents for verification

**Flow:**
```
Documents Step → Select File → Upload → Status Updated
```

**Required Documents:**
- Cédula de identidad (ID card)
- Licencia de conducir (Driver's license)
- Fotos del vehículo (Vehicle photos)

**Optional Documents:**
- Permiso sanitario (Health permit)

**Success Criteria:**
- Clear required vs optional distinction
- File type validation (images only)
- Upload progress indicator
- Status badge per document

**E2E Test Coverage:**
- Documents inserted as database records in seeds
- **No E2E test exercises actual file upload mechanics**
- `provider-document-management.spec.ts` - Document status display only

**Status:** ❌ **GAP** - File upload not tested (backlogged to Epic 12)

---

### P3: Setup Service Areas

**Purpose:** Provider selects which comunas they serve

**Flow:**
```
Settings → Service Areas → Select Comunas → Save
```

**Steps:**
1. **Navigate:** Go to Provider Settings
2. **Service Areas Tab:** Click "Zonas de Servicio"
3. **Select Comunas:** Toggle checkboxes for:
   - Villarrica
   - Pucón
   - Licán Ray
   - Curarrehue
   - Freire
4. **Save:** Confirm selection
5. **Effect:** Provider sees requests only from selected areas

**Success Criteria:**
- Clear comuna list with checkboxes
- Changes saved immediately
- Requests filtered by selected areas

**E2E Test Coverage:**
- `tests/e2e/provider-service-areas.spec.ts`
  - Area selection UI
  - Save functionality
  - Request filtering

**Status:** ✅ **VALIDATED**

---

### P4: Track Verification Status

**Purpose:** Provider sees their verification status during onboarding

**Flow:**
```
Submit Application → Status: Pendiente → Admin Review → Status Updated
```

**Status States:**
- 🟡 **Pendiente:** Application under review
- 🟢 **Aprobado:** Account verified, can start working
- 🔴 **Rechazado:** Application rejected (with reason)
- 🟠 **Más info requerida:** Need to update documents

**Success Criteria:**
- Clear status indicator
- Reason shown if rejected
- Link to update documents if needed

**E2E Test Coverage:**
- `tests/e2e/provider-verification-status.spec.ts`
  - Status display for all states
  - Navigation based on status

**Status:** ✅ **VALIDATED**

---

### P5: Browse Available Requests

**Purpose:** Provider sees water requests in their service areas

**Flow:**
```
Dashboard → Requests Tab → Filter by Area/Status → View Request List
```

**Steps:**
1. **Login:** Provider signs in
2. **Navigate:** Go to `/provider/requests`
3. **View List:** See all pending requests with:
   - Consumer location (comuna, address)
   - Water amount (L)
   - Urgency indicator
   - Time since requested
   - Estimated earnings
4. **Filter:** By comuna, urgency, amount
5. **Select:** Click to view details

**Info Displayed Per Request:**
| Field | Purpose |
|-------|---------|
| Location | Does provider cover this area? |
| Amount | Fits truck capacity? |
| Urgency | Priority indicator |
| Time | How old is the request? |
| Earnings | How much will provider earn? |

**Success Criteria:**
- Only shows requests in provider's service areas
- Availability toggle must be ON
- Clear visual hierarchy

**E2E Test Coverage:**
- `tests/e2e/provider-request-browser.spec.ts`
  - Request list display
  - Filtering functionality
  - Empty states
  - Request details navigation

**Status:** ✅ **VALIDATED**

---

### P6: Submit Offer

**Purpose:** Provider submits an offer to fulfill a water request

**Flow:**
```
Request Details → Set Delivery Window → Add Message → Submit Offer
```

**Steps:**
1. **View Request:** Click "Ver Detalles" on a request
2. **Review Details:** See full request info
3. **Delivery Window:** Set start and end time
4. **Message (optional):** Add note to consumer
5. **Review Earnings:** See price and commission breakdown
6. **Submit:** Click "Enviar Oferta"
7. **Confirmation:** Offer created, redirected to "Mis Ofertas"

**Offer Form Fields:**
| Field | Required | Description |
|-------|----------|-------------|
| Delivery Start | Yes | When delivery begins |
| Delivery End | Yes | When delivery completes |
| Message | No | Note to consumer |

**Earnings Display:**
- Platform price (from settings)
- Commission deduction (% or fixed)
- Net earnings to provider

**Success Criteria:**
- Quick offer flow (< 30 seconds)
- Auto-calculated price
- Clear earnings preview
- Offer validity countdown displayed

**E2E Test Coverage:**
- `tests/e2e/provider-offer-submission.spec.ts` (310 lines)
  - Request detail page access
  - Price and earnings display
  - Delivery window picker
  - Message textarea
  - Offer validity display
  - Submit button and navigation

**Status:** ✅ **FULLY VALIDATED**

---

### P7: Track My Offers

**Purpose:** Provider sees all their pending and active offers

**Flow:**
```
Dashboard → Offers Tab → View Offer Status
```

**Offer States:**
- 🟡 **Activa:** Waiting for consumer response
- 🟢 **Aceptada:** Consumer accepted, pending delivery
- ✅ **Completada:** Delivery marked as complete
- ❌ **Cancelada:** Offer withdrawn
- ⏰ **Expirada:** Offer expired without response
- 🔴 **Rechazada:** Request filled by another provider

**Success Criteria:**
- See all offers in one view
- Clear status indicators
- Avoid overbooking (see pending commitments)

**E2E Test Coverage:**
- `tests/e2e/provider-active-offers.spec.ts`
  - Offer list display
  - Status indicators
  - Actions per status

**Status:** ✅ **VALIDATED**

---

### P8: Receive Acceptance Notification

**Purpose:** Provider gets notified when consumer accepts their offer

**Flow:**
```
Consumer Accepts → Email Sent → Provider Opens App → Sees Accepted Offer
```

**Notification Content:**
- Consumer name
- Delivery address
- Scheduled time
- Link to offer details

**Success Criteria:**
- Email sent immediately on acceptance
- Clear action: "Ver Detalles"
- In-app notification visible

**E2E Test Coverage:**
- `tests/e2e/provider-offer-notification.spec.ts`
  - Notification creation
  - Email sending (mocked)
  - In-app notification display

**Status:** ✅ **VALIDATED**

---

### P9: View Delivery Details

**Purpose:** Provider sees full details for an accepted delivery

**Flow:**
```
Accepted Offer → View Details → See Consumer Info + Instructions
```

**Details Displayed:**
| Field | Description |
|-------|-------------|
| Consumer Name | Who to contact |
| Phone | Direct call link |
| Address | Delivery location |
| Special Instructions | "Past the bridge, blue house" |
| Water Amount | Liters to deliver |
| Scheduled Time | Agreed delivery window |
| Earnings | What provider will earn |

**Success Criteria:**
- All info visible in one screen
- Phone is tappable for direct call
- Special instructions prominent

**E2E Test Coverage:**
- `tests/e2e/provider-active-offers.spec.ts`
  - Delivery detail view
  - Consumer info visibility
  - Contact information

**Status:** ✅ **VALIDATED**

---

### P10: Complete Delivery

**Purpose:** Provider marks a delivery as complete

**Flow:**
```
Accepted Offer → Mark Delivered → Commission Recorded → Earnings Updated
```

**Steps:**
1. **View Accepted Offer:** Navigate to active deliveries
2. **Mark Complete:** Click "Marcar como Entregada"
3. **Confirm:** Acknowledge completion
4. **Effect:**
   - Offer status → "Completada"
   - Commission recorded in ledger
   - Consumer notified
   - Earnings updated

**Business Rules:**
- Commission calculated per platform settings
- Entry created in `commission_ledger` table
- Consumer can now rate (future feature)

**Success Criteria:**
- One-tap completion
- Immediate earnings update
- Consumer receives notification

**E2E Test Coverage:**
- `tests/e2e/provider-active-offers.spec.ts`
  - Mark delivered button
  - Status transition
  - Commission ledger entry
  - **Fixed in Story 11a-1** (was a gap)

**Status:** ✅ **VALIDATED** (Fixed in Epic 11A)

---

### P11: View Earnings/History

**Purpose:** Provider tracks earnings and delivery history

**Flow:**
```
Dashboard → Earnings Tab → View Summary + History
```

**Earnings Display:**
| Period | Shows |
|--------|-------|
| Today | Earnings from today's deliveries |
| This Week | Week-to-date earnings |
| This Month | Month-to-date earnings |
| All Time | Total earnings |

**History List:**
- Date/time of delivery
- Consumer name
- Amount delivered
- Earnings for that delivery
- Status (completed, pending settlement)

**Success Criteria:**
- Clear earnings breakdown
- Settlement status visible
- "Solicitar Pago" button when eligible

**E2E Test Coverage:**
- `tests/e2e/provider-earnings.spec.ts`
  - Earnings dashboard display
  - Period filtering
  - History list
- `tests/e2e/provider-earnings-seeded.spec.ts`
  - Seeded data scenarios
  - Settlement button visibility

**Status:** ✅ **VALIDATED**

---

### P12: Request Withdrawal

**Purpose:** Provider requests payout of accumulated earnings

**Flow:**
```
Earnings Page → Solicitar Pago → Confirm Bank Details → Submit → Admin Reviews
```

**Steps:**
1. **View Earnings:** Navigate to earnings page
2. **Click Withdraw:** "Solicitar Pago" button
3. **Review Amount:** See available balance
4. **Confirm Bank:** Verify bank account details
5. **Submit:** Request sent to admin queue

**Business Rules:**
- Minimum withdrawal amount (configurable)
- Bank account must be verified
- Admin approves/rejects

**E2E Test Coverage:**
- **No E2E test clicks "Solicitar Pago" button**
- Withdrawal requests seeded directly in `seed-admin-orders-tests.ts`

**Status:** ❌ **GAP** - Button click flow not tested (backlogged to Epic 12)

---

### P13: Withdraw/Cancel Offer

**Purpose:** Provider cancels their own pending offer

**Flow:**
```
Active Offers → Select Offer → Retirar Oferta → Confirm
```

**Steps:**
1. **View Offers:** Go to active offers list
2. **Select Offer:** Find pending offer to cancel
3. **Withdraw:** Click "Retirar Oferta"
4. **Confirm:** Acknowledge cancellation

**Business Rules:**
- Can only cancel if status is "Activa" (pending)
- Cannot cancel after consumer accepts
- No strike if cancelled before acceptance

**E2E Test Coverage:**
- `tests/e2e/provider-withdraw-offer.spec.ts`
  - Withdraw button functionality
  - Confirmation dialog
  - Status update

**Status:** ✅ **VALIDATED**

---

### P14: Handle Offer Expiration

**Purpose:** Provider's offer expires without consumer response

**Flow:**
```
Offer Pending → Time Expires → Status: Expirada
```

**Business Rules:**
- Offers expire after configurable period (default 30 min)
- Expired offers show in history
- No penalty to provider

**E2E Test Coverage:**
- `tests/e2e/provider-offer-edge-cases.spec.ts`
  - Expiration status display
  - History tracking

**Status:** ✅ **VALIDATED**

---

### P15: Handle Request Filled

**Purpose:** Consumer accepts another provider's offer

**Flow:**
```
Offer Pending → Consumer Picks Other → Status: Rechazada
```

**Business Rules:**
- Provider notified that request was filled
- Offer moves to history with "Request Filled" status
- No penalty to provider

**E2E Test Coverage:**
- `tests/e2e/provider-offer-edge-cases.spec.ts`
  - Request filled notification
  - Status update

**Status:** ✅ **VALIDATED**

---

### P16: Toggle Availability

**Purpose:** Provider turns on/off availability to see requests

**Flow:**
```
Dashboard → Availability Toggle → ON/OFF
```

**Effect:**
- **ON:** Provider sees requests in service areas
- **OFF:** Provider sees no requests (vacation mode)

**Success Criteria:**
- Clear toggle indicator
- Immediate effect on request visibility
- Persists across sessions

**E2E Test Coverage:**
- `tests/e2e/provider-availability-toggle.spec.ts`
  - Toggle functionality
  - Request visibility changes
  - State persistence

**Status:** ✅ **VALIDATED**

---

## Workflow Chains

### CHAIN-1: Happy Path Delivery (Provider Portion)

The provider's role in the complete delivery transaction:

```
P5 (Browse) → P6 (Submit Offer) → [Wait] → P8 (Notification) → P9 (Details) → P10 (Complete)
```

**Test Coverage:** `tests/e2e/chain1-happy-path.spec.ts`

### CHAIN-2: Provider Onboarding

Complete registration to verification:

```
P1 (Register) → P2 (Documents) → P3 (Areas) → [Admin: A1-A3] → P4 (Verified)
```

---

## Coverage Summary

| Category | Workflows | Validated | Gaps |
|----------|-----------|-----------|------|
| Onboarding | P1-P4 | 3/4 | P2 (file upload) |
| Daily Ops | P5-P11 | 7/7 | None |
| Lifecycle | P12-P16 | 4/5 | P12 (withdrawal click) |
| **Total** | **16 workflows** | **14/16 (87.5%)** | **2 gaps** |

---

## Identified Gaps (Backlogged to Epic 12)

| Workflow | Gap Description | Risk Level |
|----------|-----------------|------------|
| P2: Upload Documents | File upload mechanics not tested | Medium - OAuth dependency |
| P12: Request Withdrawal | "Solicitar Pago" click not tested | Low - Low frequency feature |

---

## Related Test Files

| Test File | Workflows Covered |
|-----------|-------------------|
| `provider-registration.spec.ts` | P1 (partial) |
| `provider-document-management.spec.ts` | P2 (display only) |
| `provider-service-areas.spec.ts` | P3 |
| `provider-verification-status.spec.ts` | P4 |
| `provider-request-browser.spec.ts` | P5 |
| `provider-offer-submission.spec.ts` | P6 |
| `provider-active-offers.spec.ts` | P7, P9, P10 |
| `provider-offer-notification.spec.ts` | P8 |
| `provider-earnings.spec.ts` | P11 |
| `provider-earnings-seeded.spec.ts` | P11 |
| `provider-withdraw-offer.spec.ts` | P13 |
| `provider-offer-edge-cases.spec.ts` | P14, P15 |
| `provider-availability-toggle.spec.ts` | P16 |
| `chain1-happy-path.spec.ts` | P5, P6, P10 (integration) |

---

*Document generated as part of Story 11-21: Seed Data Blind Spot Analysis*
