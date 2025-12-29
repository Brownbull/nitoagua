# Admin Workflows - nitoagua

**Document Type:** User Workflow Reference
**Persona:** Platform Administrator
**Last Updated:** 2025-12-24
**Epic 11 Validation Status:** Complete
**Atlas Reference:** Section 8 (Workflow Chains) - "Admin Provider Verification"

---

## Overview

This document catalogs all **admin-facing workflows** in nitoagua that have been validated through E2E testing. Each workflow represents a complete user journey that a platform administrator can accomplish in the application.

### Persona Profile: Admin

- **Role:** Platform operator
- **Tech Savviness:** High
- **Key Needs:** Provider verification, order monitoring, settlement management
- **Tolerance:** Power user features, bulk operations, data density OK

---

## Workflow Summary

### Provider Management Workflows (A1-A4)

| ID | Workflow | Status | Test Coverage |
|----|----------|--------|---------------|
| **A1** | View Verification Queue | ✅ Validated | `admin-verification-workflow.spec.ts` |
| **A2** | Review Provider Documents | ✅ Validated | `admin-verification.spec.ts` |
| **A3** | Approve/Reject Provider | ✅ Validated | `admin-verification-workflow.spec.ts` |
| **A4** | View Provider Directory | ✅ Validated | `admin-providers.spec.ts` |

### Platform Monitoring Workflows (A5-A7)

| ID | Workflow | Status | Test Coverage |
|----|----------|--------|---------------|
| **A5** | View All Orders | ✅ Validated | `admin-orders-seeded.spec.ts` |
| **A6** | View Order Details | ✅ Validated | `admin-orders.spec.ts` |
| **A7** | Configure Pricing | ✅ Validated | `admin-pricing.spec.ts` |

### Settlement Workflows (A8-A9)

| ID | Workflow | Status | Test Coverage |
|----|----------|--------|---------------|
| **A8** | View Settlement Queue | ✅ Validated | `admin-settlement.spec.ts` |
| **A9** | Approve/Reject Settlement | ✅ Validated | `admin-orders-seeded.spec.ts` |

---

## Detailed Workflows

### A1: View Verification Queue

**Purpose:** Admin sees all providers pending verification

**Flow:**
```
Admin Dashboard → Providers Tab → Pending Verification Queue
```

**Steps:**
1. **Login:** Admin signs in
2. **Navigate:** Go to `/admin/providers`
3. **Filter:** Select "Pending" status filter
4. **View Queue:** See list of providers awaiting review with:
   - Provider name
   - Registration date
   - Document status (uploaded/missing)
   - Service areas requested

**Queue Display:**
| Field | Purpose |
|-------|---------|
| Name | Provider identity |
| Date | When they registered |
| Documents | ✅ Complete / ⚠️ Missing |
| Areas | Which comunas they want to serve |

**Success Criteria:**
- Queue shows newest first (or configurable)
- Clear document status per provider
- Quick access to review action

**E2E Test Coverage:**
- `tests/e2e/admin-verification-workflow.spec.ts`
  - Queue display
  - Filtering
  - Provider card info
- `tests/e2e/admin-verification.spec.ts`
  - Basic verification page

**Status:** ✅ **VALIDATED**

---

### A2: Review Provider Documents

**Purpose:** Admin examines uploaded documents for a provider

**Flow:**
```
Verification Queue → Select Provider → View Documents → Verify Details
```

**Steps:**
1. **Select Provider:** Click on provider in queue
2. **View Profile:** See provider's personal info:
   - Name, RUT, phone
   - Vehicle type and capacity
   - Service areas
3. **View Documents:** See uploaded files:
   - Cédula de identidad (ID card)
   - Licencia de conducir (Driver's license)
   - Fotos del vehículo (Vehicle photos)
   - Optional: Permiso sanitario
4. **Verify:** Compare document info with profile

**Document Review:**
| Document | What to Check |
|----------|---------------|
| Cédula | Name matches, valid ID |
| Licencia | Valid license, matches vehicle class |
| Vehículo | Truck exists, matches description |

**Success Criteria:**
- Documents viewable inline (click to expand)
- Clear association between profile and documents
- Notes field for admin comments

**E2E Test Coverage:**
- `tests/e2e/admin-verification.spec.ts`
  - Document display
  - Provider detail view

**Status:** ✅ **VALIDATED**

---

### A3: Approve/Reject Provider

**Purpose:** Admin makes verification decision on a provider

**Flow:**
```
Provider Review → Decision (Approve/Reject) → Confirmation → Provider Notified
```

**Steps:**
1. **Review Complete:** After examining documents
2. **Decision:**
   - **Approve:** Click "Aprobar"
   - **Reject:** Click "Rechazar" + select reason
   - **More Info:** Click "Solicitar más información"
3. **Confirm:** Acknowledge action
4. **Effect:**
   - Provider status updated
   - Email sent to provider
   - Provider sees new status in app

**Rejection Reasons:**
- Documentos ilegibles (Illegible documents)
- Información incompleta (Incomplete info)
- Vehículo no apto (Vehicle not suitable)
- Zona no cubierta (Area not covered)
- Otro (Other - with note)

**Success Criteria:**
- One-click approve
- Reject requires reason selection
- Provider immediately notified
- Queue updated

**E2E Test Coverage:**
- `tests/e2e/admin-verification-workflow.spec.ts`
  - Approve action
  - Reject action with reason
  - Status transitions
  - Email notification (mocked)

**Status:** ✅ **VALIDATED**

---

### A4: View Provider Directory

**Purpose:** Admin sees all providers with status and metrics

**Flow:**
```
Admin Dashboard → Providers Tab → Full Directory
```

**Directory Columns:**
| Column | Description |
|--------|-------------|
| Name | Provider name |
| Status | Pending / Approved / Rejected |
| Areas | Service comunas |
| Deliveries | Total completed |
| Rating | Consumer rating (future) |
| Strikes | Warning count |
| Last Active | Recent activity |

**Actions Available:**
- Filter by status
- Search by name
- Click to view full profile
- Bulk actions (future)

**Success Criteria:**
- All providers visible
- Efficient search/filter
- Quick access to details

**E2E Test Coverage:**
- `tests/e2e/admin-providers.spec.ts`
  - Directory display
  - Filtering
  - Provider detail navigation

**Status:** ✅ **VALIDATED**

---

### A5: View All Orders

**Purpose:** Admin monitors all water requests across the platform

**Flow:**
```
Admin Dashboard → Orders Tab → Order List
```

**Steps:**
1. **Navigate:** Go to `/admin/orders`
2. **View List:** See all requests with:
   - Order ID
   - Consumer name
   - Provider name (if assigned)
   - Status
   - Amount
   - Date/time
3. **Filter:** By status, date range, provider, consumer
4. **Sort:** By date, status, amount

**Order Statuses:**
| Status | Description |
|--------|-------------|
| Pendiente | Waiting for offers |
| Con ofertas | Has pending offers |
| Aceptada | Offer accepted |
| Entregada | Delivery complete |
| Cancelada | Cancelled |
| Expirada | Timed out |

**Success Criteria:**
- Real-time view of platform activity
- Easy filtering by status
- Quick drill-down to details

**E2E Test Coverage:**
- `tests/e2e/admin-orders-seeded.spec.ts`
  - Order list display
  - Status filtering
  - Seeded data scenarios
- `tests/e2e/admin-orders.spec.ts`
  - Basic orders functionality

**Status:** ✅ **VALIDATED**

---

### A6: View Order Details

**Purpose:** Admin sees complete details of a specific order

**Flow:**
```
Orders List → Select Order → Full Details View
```

**Order Details Display:**
| Section | Information |
|---------|-------------|
| **Request Info** | ID, date, amount, urgency, address |
| **Consumer Info** | Name, phone, email |
| **Provider Info** | Name, phone (if assigned) |
| **Status History** | Timeline of status changes |
| **Offers** | All offers submitted |
| **Settlement** | Commission info, payment status |

**Success Criteria:**
- Complete order visibility
- Timeline of events
- All related records visible

**E2E Test Coverage:**
- `tests/e2e/admin-orders.spec.ts`
  - Order detail view
  - Related records display

**Status:** ✅ **VALIDATED**

---

### A7: Configure Pricing

**Purpose:** Admin sets platform pricing and commission rates

**Flow:**
```
Admin Dashboard → Settings → Pricing Configuration
```

**Configurable Settings:**
| Setting | Description |
|---------|-------------|
| Base Price per Tier | Price for 1000L, 5000L, 10000L |
| Commission Rate | % or fixed amount per delivery |
| Urgency Multiplier | Price increase for urgent requests |
| Minimum Order | Minimum water amount |

**Steps:**
1. **Navigate:** Go to `/admin/settings/pricing`
2. **View Current:** See current pricing configuration
3. **Edit:** Modify values
4. **Preview:** See effect on sample orders
5. **Save:** Apply new pricing

**Success Criteria:**
- Clear pricing display
- Validation on input
- Changes take effect immediately
- Historical pricing preserved

**E2E Test Coverage:**
- `tests/e2e/admin-pricing.spec.ts`
  - Pricing configuration view
  - Edit functionality
  - Validation
- `tests/e2e/admin-settings.spec.ts`
  - General settings access

**Status:** ✅ **VALIDATED**

---

### A8: View Settlement Queue

**Purpose:** Admin sees providers requesting payout

**Flow:**
```
Admin Dashboard → Settlement Tab → Pending Payouts Queue
```

**Queue Display:**
| Column | Description |
|--------|-------------|
| Provider | Who is requesting |
| Amount | How much they're owed |
| Deliveries | How many orders included |
| Bank Account | Where to send payment |
| Request Date | When they requested |

**Actions:**
- View breakdown by order
- Verify bank details
- Approve or reject

**Success Criteria:**
- Clear queue of pending payouts
- Amount breakdown visible
- Quick approve/reject actions

**E2E Test Coverage:**
- `tests/e2e/admin-settlement.spec.ts`
  - Settlement queue display
  - Pending requests
- `tests/e2e/admin-orders-seeded.spec.ts`
  - Seeded settlement scenarios

**Status:** ✅ **VALIDATED**

---

### A9: Approve/Reject Settlement

**Purpose:** Admin processes provider payout requests

**Flow:**
```
Settlement Queue → Select Request → Review → Approve/Reject
```

**Steps:**
1. **Select Request:** Click on pending settlement
2. **Review Details:**
   - Provider info
   - Bank account details
   - Order breakdown
   - Total amount
3. **Decision:**
   - **Approve:** Click "Aprobar Pago"
   - **Reject:** Click "Rechazar" + reason
4. **Effect:**
   - Status updated
   - Provider notified
   - (Future: Trigger bank transfer)

**Approval Process:**
1. Verify bank account matches provider
2. Confirm order amounts are correct
3. Mark as approved
4. Record approval in ledger

**Success Criteria:**
- Clear amount breakdown
- Bank details verification
- One-click approve
- Audit trail

**E2E Test Coverage:**
- `tests/e2e/admin-orders-seeded.spec.ts`
  - Approve settlement
  - Reject settlement
  - Status transitions

**Status:** ✅ **VALIDATED**

---

## Workflow Chains

### CHAIN-2: Provider Onboarding (Admin Portion)

Admin's role in verifying new providers:

```
[Provider: P1-P4] → A1 (Queue) → A2 (Review) → A3 (Approve/Reject) → [Provider Notified]
```

**Test Coverage:** `tests/e2e/admin-verification-workflow.spec.ts`

---

## Additional Admin Features

### Dashboard Metrics (A10)

**Purpose:** Admin sees platform overview metrics

**Metrics Displayed:**
- Total orders (today, week, month)
- Active providers
- Pending verifications
- Settlement queue size
- Revenue summary

**E2E Test Coverage:**
- `tests/e2e/admin-dashboard-metrics.spec.ts`
  - Metrics display
  - Real-time updates

**Status:** ✅ **VALIDATED**

---

## Coverage Summary

| Category | Workflows | Validated |
|----------|-----------|-----------|
| Provider Mgmt | A1-A4 | ✅ 4/4 |
| Platform Ops | A5-A7 | ✅ 3/3 |
| Settlement | A8-A9 | ✅ 2/2 |
| **Total** | **9 workflows** | **✅ 100%** |

---

## Related Test Files

| Test File | Workflows Covered |
|-----------|-------------------|
| `admin-verification-workflow.spec.ts` | A1, A3 |
| `admin-verification.spec.ts` | A2 |
| `admin-providers.spec.ts` | A4 |
| `admin-orders-seeded.spec.ts` | A5, A9 |
| `admin-orders.spec.ts` | A6 |
| `admin-pricing.spec.ts` | A7 |
| `admin-settings.spec.ts` | A7 |
| `admin-settlement.spec.ts` | A8 |
| `admin-dashboard-metrics.spec.ts` | Dashboard |
| `admin-auth.spec.ts` | Authentication |

---

## Future Workflows (Not Yet Implemented)

| ID | Workflow | Status | Notes |
|----|----------|--------|-------|
| A10 | Manage Strikes | Partial | View strikes, no bulk action |
| A11 | Export Reports | Not implemented | CSV/PDF export |
| A12 | Configure Regions | Not implemented | Add/remove service areas |
| A13 | User Management | Partial | Basic user list |

---

*Document generated as part of Story 11-21: Seed Data Blind Spot Analysis*
