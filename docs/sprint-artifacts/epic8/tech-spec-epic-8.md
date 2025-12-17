# Epic Technical Specification: Provider Offer System

Date: 2025-12-16
Author: Gabe
Epic ID: 8
Status: Draft

---

## Overview

Epic 8 implements the Provider Offer System - the core feature enabling the Consumer-Choice Offer Model. This epic transforms providers from passive request recipients into active participants who browse available requests and submit competitive offers. Consumers then select from multiple offers, choosing their preferred provider based on delivery window and trust.

This epic builds on the completed provider onboarding (Epic 7) and admin configuration (Epic 6) to enable the marketplace dynamics that differentiate nitoagua from simple request-assignment systems. The architecture leverages Supabase Realtime for instant offer updates, client-side countdown timers for offer validity, and a cron job for expired offer cleanup.

## Objectives and Scope

### In Scope

- **Provider Request Browser**: Browse pending requests in configured service areas with real-time updates
- **Offer Submission**: Submit offers with delivery window on available requests
- **Active Offers Management**: View pending offers with countdown timers, withdraw if needed
- **Offer Acceptance Notification**: Receive instant notification when consumer selects offer
- **Earnings Dashboard**: View earnings summary with commission breakdown by period
- **Cash Commission Settlement**: Submit payment proof for cash commission owed to platform

### Out of Scope

- Consumer-side offer viewing/selection (Epic 9)
- Provider ratings/reviews (Future)
- Route optimization (Future)
- Push notifications (using in-app + email only)
- Automated commission collection (manual bank transfer only)

## System Architecture Alignment

### Architecture Reference

Per Architecture V2 (ADR-006), the Consumer-Choice Offer Model replaces push-assignment:

```
Consumer creates       All providers        Provider submits     Consumer selects
    request      ────▶  in comuna see  ────▶    offer with    ────▶   one offer
                        request              delivery window
```

### Components Involved

| Component | Role in Epic 8 |
|-----------|----------------|
| `(provider)/requests/` | Request browser + offer submission |
| `(provider)/offers/` | Active offers list with countdown |
| `(provider)/earnings/` | Earnings dashboard + settlement |
| `offers` table | Store provider offers with expiration |
| `commission_ledger` | Track cash commission debts |
| Supabase Realtime | Broadcast new requests, offer status changes |
| Vercel Cron | Expire offers past `expires_at` |

### Constraints

- Provider must be verified (verification_status = 'approved') to submit offers
- Provider must be available (is_available = true) to see requests
- Offer validity bounded by admin settings (15-120 minutes, default 30)
- Only one offer per provider per request (UNIQUE constraint)
- Price is platform-controlled (not provider-editable)

---

## Detailed Design

### Services and Modules

| Module | Responsibility | Location |
|--------|----------------|----------|
| Request Browser | Display pending requests in provider's service areas | `src/app/(provider)/requests/page.tsx` |
| Request Detail | Show full request info + offer form | `src/app/(provider)/requests/[id]/page.tsx` |
| Offer Form | Collect delivery window, show earnings preview | `src/components/provider/offer-form.tsx` |
| Offers List | Show provider's active/pending offers | `src/app/(provider)/offers/page.tsx` |
| Countdown Timer | Display offer expiration countdown | `src/components/shared/countdown-timer.tsx` |
| Earnings Dashboard | Period-based earnings summary | `src/app/(provider)/earnings/page.tsx` |
| Settlement Page | Bank details + receipt upload | `src/app/(provider)/earnings/withdraw/page.tsx` |
| Realtime Requests Hook | Subscribe to new requests | `src/hooks/use-realtime-requests.ts` |
| Realtime Offers Hook | Subscribe to offer status changes | `src/hooks/use-realtime-offers.ts` |
| Offer Actions | Server actions for offer CRUD | `src/lib/actions/offers.ts` |
| Settlement Actions | Commission payment submission | `src/lib/actions/settlement.ts` |

### Data Models and Contracts

#### Offers Table (New)

```sql
CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES water_requests(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Delivery window
  delivery_window_start TIMESTAMPTZ NOT NULL,
  delivery_window_end TIMESTAMPTZ NOT NULL,

  -- Optional message to consumer
  message TEXT,

  -- Expiration
  expires_at TIMESTAMPTZ NOT NULL,

  -- Status
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'accepted', 'expired', 'cancelled', 'request_filled')),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,

  UNIQUE (request_id, provider_id)
);

-- Indexes for performance
CREATE INDEX idx_offers_request ON offers(request_id) WHERE status = 'active';
CREATE INDEX idx_offers_provider ON offers(provider_id, status);
CREATE INDEX idx_offers_expiration ON offers(expires_at) WHERE status = 'active';
```

#### Commission Ledger Table (New)

```sql
CREATE TABLE commission_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  request_id UUID REFERENCES water_requests(id),

  type TEXT NOT NULL CHECK (type IN ('commission_owed', 'commission_paid', 'adjustment')),
  amount INTEGER NOT NULL,  -- CLP, positive = owed to platform

  description TEXT,
  bank_reference TEXT,      -- For payment records
  receipt_path TEXT,        -- Supabase Storage path for receipt
  admin_id UUID REFERENCES profiles(id),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ledger_provider ON commission_ledger(provider_id, created_at DESC);
```

#### TypeScript Types

```typescript
// src/lib/supabase/types.ts (additions)

export interface Offer {
  id: string;
  request_id: string;
  provider_id: string;
  delivery_window_start: string;
  delivery_window_end: string;
  message: string | null;
  expires_at: string;
  status: 'active' | 'accepted' | 'expired' | 'cancelled' | 'request_filled';
  created_at: string;
  accepted_at: string | null;
}

export interface CommissionLedgerEntry {
  id: string;
  provider_id: string;
  request_id: string | null;
  type: 'commission_owed' | 'commission_paid' | 'adjustment';
  amount: number;
  description: string | null;
  bank_reference: string | null;
  receipt_path: string | null;
  admin_id: string | null;
  created_at: string;
}

export interface EarningsSummary {
  period: 'today' | 'week' | 'month';
  total_deliveries: number;
  gross_income: number;
  commission_amount: number;
  net_earnings: number;
  cash_received: number;
  commission_pending: number;
}
```

### APIs and Interfaces

#### Server Actions

```typescript
// src/lib/actions/offers.ts

export async function getAvailableRequests(): Promise<ApiResponse<WaterRequest[]>>
// Returns pending requests in provider's service areas
// Requires: verified provider, is_available = true
// Filter: status = 'pending', comuna_id IN provider_service_areas

export async function getRequestDetail(requestId: string): Promise<ApiResponse<RequestWithOffers>>
// Returns full request with existing offers count
// Requires: verified provider

export async function createOffer(requestId: string, data: OfferFormData): Promise<ApiResponse<Offer>>
// Creates new offer with calculated expires_at
// Validates: delivery window in future, no duplicate offer
// Creates notification for consumer

export async function withdrawOffer(offerId: string): Promise<ApiResponse<void>>
// Sets offer status to 'cancelled'
// Requires: provider owns offer, status = 'active'

export async function getMyOffers(): Promise<ApiResponse<OfferWithRequest[]>>
// Returns provider's offers grouped by status
// Includes request summary for each

// src/lib/actions/settlement.ts

export async function getEarningsSummary(period: 'today' | 'week' | 'month'): Promise<ApiResponse<EarningsSummary>>
// Aggregates from commission_ledger
// Calculates pending = SUM(owed) - SUM(paid)

export async function getDeliveryHistory(limit?: number): Promise<ApiResponse<DeliveryRecord[]>>
// Returns completed deliveries with commission breakdown

export async function submitCommissionPayment(data: PaymentSubmission): Promise<ApiResponse<void>>
// Uploads receipt to Supabase Storage
// Creates withdrawal_request with status 'pending_verification'
// Notifies admin
```

#### API Endpoints (Cron)

```typescript
// src/app/api/cron/expire-offers/route.ts
// Schedule: Every minute
// Action: UPDATE offers SET status = 'expired' WHERE status = 'active' AND expires_at < NOW()
// Notify: Create notification for affected providers

// Authorization: CRON_SECRET header
```

### Workflows and Sequencing

#### Flow 1: Provider Views Available Requests

```
Provider (verified, available)
    │
    ▼
Navigate to /provider/requests
    │
    ▼
useRealtimeRequests hook
    │
    ├──▶ Initial query: pending requests in service areas
    │
    └──▶ Subscribe: new INSERTs to water_requests
         Filter: comuna_id IN provider_service_areas
    │
    ▼
Display RequestCard list
    │
    ├── Location (comuna/area, not exact address)
    ├── Amount: "5,000 litros"
    ├── Urgency: "Normal" | "Urgente ⚡"
    ├── Time: "Hace 15 min"
    ├── Offers count: "2 ofertas"
    └── "Ver Detalles" button
```

#### Flow 2: Provider Submits Offer

```
Provider taps "Ver Detalles"
    │
    ▼
/provider/requests/[id]
    │
    ├── Request summary (full details)
    ├── Existing offers count
    └── "Hacer Oferta" button
    │
    ▼
OfferForm displayed
    │
    ├── Delivery window picker (start + end time)
    ├── Price display (from platform, not editable)
    ├── Earnings preview: "Ganarás: $XX,XXX (después de X% comisión)"
    ├── Optional message field
    └── "Enviar Oferta" button
    │
    ▼
createOffer() server action
    │
    ├── Validate delivery window in future
    ├── Check no duplicate offer exists
    ├── Get offer_validity_minutes from admin_settings
    ├── Calculate expires_at = NOW() + validity
    ├── Insert offer with status = 'active'
    └── Create notification for consumer
    │
    ▼
Redirect to /provider/offers
Toast: "¡Oferta enviada!"
```

#### Flow 3: Offer Lifecycle

```
                        ┌─────────────────────┐
                        │   Offer Created     │
                        │   status = 'active' │
                        └──────────┬──────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
              ▼                    ▼                    ▼
    Consumer selects      Offer expires         Provider withdraws
              │                    │                    │
              ▼                    ▼                    ▼
    status = 'accepted'   status = 'expired'  status = 'cancelled'
              │
              ▼
    Other offers on same request:
    status = 'request_filled'
```

#### Flow 4: Earnings Dashboard

```
Provider navigates to /provider/earnings
    │
    ▼
getEarningsSummary('month') // default
    │
    ├── Query completed deliveries in period
    ├── Sum gross amounts
    ├── Calculate commission per delivery
    └── Aggregate pending (cash only)
    │
    ▼
Display summary cards:
    │
    ├── Total Entregas: count
    ├── Ingreso Bruto: $XX,XXX
    ├── Comisión (X%): -$X,XXX
    └── Ganancia Neta: $XX,XXX (highlighted)
    │
    ▼
Cash payment section:
    │
    ├── Efectivo Recibido: $XX,XXX
    ├── Comisión Pendiente: $XX,XXX
    └── "Pagar Comisión" button → /earnings/withdraw
```

---

## Non-Functional Requirements

### Performance

| Metric | Target | Source |
|--------|--------|--------|
| Request list load | < 3s on 3G | NFR3 |
| Realtime offer updates | < 2s delivery | NFR4 |
| Countdown timer accuracy | ±1 second | NFR5 |
| Offer submission | < 5s on 3G | NFR2 |

**Implementation:**
- Use Supabase Realtime for instant updates
- Client-side countdown using `setInterval` with drift correction
- Optimistic UI updates for offer submission
- Index on `offers(expires_at)` for efficient cron queries

### Security

| Requirement | Implementation |
|-------------|----------------|
| Provider verification | Middleware checks `verification_status = 'approved'` |
| Offer ownership | RLS policy: `provider_id = auth.uid()` |
| Request visibility | RLS: only show requests in provider's service areas |
| Commission data | RLS: providers see own ledger only |
| Receipt uploads | Private Supabase Storage bucket with RLS |
| Cron authorization | `CRON_SECRET` header validation |

**Per Architecture V2:**
- Document uploads in `provider-documents` bucket (private)
- Receipts in `commission-receipts` bucket (private)
- Service role key only for cron operations

### Reliability/Availability

| Requirement | Implementation |
|-------------|----------------|
| Offer creation | Transaction ensures atomic insert |
| Expiration cleanup | Cron runs every minute, idempotent |
| Realtime fallback | Polling every 30s if WebSocket disconnects |
| Financial accuracy | Commission ledger append-only, no updates |

**Degradation Behavior:**
- If Realtime unavailable: fall back to 30s polling
- If cron fails: next run catches up (no offer loss)
- If offer insert fails: show error, allow retry

### Observability

| Signal | Implementation |
|--------|----------------|
| Offer creation | Log: `offer_created`, provider_id, request_id |
| Offer expiration | Log: `offers_expired`, count |
| Settlement submission | Log: `settlement_submitted`, provider_id, amount |
| Realtime connection | Track connection status in hook |

---

## Dependencies and Integrations

### External Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| @supabase/supabase-js | ^2.86.0 | Database + Realtime |
| @supabase/ssr | ^0.8.0 | Server-side Supabase client |
| date-fns | ^4.1.0 | Date formatting, countdown calculations |
| sonner | ^2.0.7 | Toast notifications |
| zod | ^4.1.13 | Offer form validation |

### Internal Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Epic 6 (Admin) | ✅ Complete | Provides `admin_settings` for offer validity |
| Epic 7 (Provider Onboarding) | ✅ Complete | Provides verified providers |
| Provider service areas | ✅ Exists | `provider_service_areas` table from Epic 7 |
| Commission configuration | ✅ Exists | `default_commission_percent` in admin_settings |

### Integration Points

| System | Integration |
|--------|-------------|
| Supabase Realtime | Subscribe to `water_requests` and `offers` tables |
| Supabase Storage | Upload commission payment receipts |
| Vercel Cron | `/api/cron/expire-offers` every minute |
| Notification system | Create in-app + email on offer events |

---

## Acceptance Criteria (Authoritative)

### Story 8.1: Provider Request Browser

| AC# | Criterion |
|-----|-----------|
| 8.1.1 | Verified, available provider sees pending requests in their service areas |
| 8.1.2 | Each request card shows: location (comuna), amount, urgency, time posted, offer count |
| 8.1.3 | Requests sorted by urgency first, then by time (newest first) |
| 8.1.4 | List updates in real-time via Supabase Realtime |
| 8.1.5 | Requests disappear when filled or timed out |
| 8.1.6 | Unavailable provider sees empty state with toggle prompt |

### Story 8.2: Submit Offer on Request

| AC# | Criterion |
|-----|-----------|
| 8.2.1 | Offer form shows delivery window picker (start + end time) |
| 8.2.2 | Price displayed from platform settings (not editable) |
| 8.2.3 | Earnings preview shows: "Ganarás: $XX,XXX (después de X% comisión)" |
| 8.2.4 | Optional message field for notes to consumer |
| 8.2.5 | Offer validity displayed: "Tu oferta expira en 30 min" |
| 8.2.6 | Upon submission: offer created with status 'active', expires_at calculated |
| 8.2.7 | Provider sees confirmation, redirected to "Mis Ofertas" |
| 8.2.8 | Provider cannot submit duplicate offer on same request |

### Story 8.3: Provider's Active Offers List

| AC# | Criterion |
|-----|-----------|
| 8.3.1 | Provider sees offers grouped: Pendientes, Aceptadas, Expiradas/Rechazadas |
| 8.3.2 | Pending offers show: request summary, delivery window, time remaining countdown |
| 8.3.3 | Countdown displays "Expira en 25:30" format |
| 8.3.4 | "Cancelar Oferta" button available on pending offers |
| 8.3.5 | Offers update in real-time (acceptance, expiration) |

### Story 8.4: Withdraw Pending Offer

| AC# | Criterion |
|-----|-----------|
| 8.4.1 | Confirmation dialog: "¿Cancelar esta oferta?" with explanation |
| 8.4.2 | Upon confirmation: offer status changes to 'cancelled' |
| 8.4.3 | Provider sees "Oferta cancelada" toast |
| 8.4.4 | Consumer's offer list updates (offer removed) |
| 8.4.5 | Provider can submit new offer on same request if still pending |

### Story 8.5: Offer Acceptance Notification

| AC# | Criterion |
|-----|-----------|
| 8.5.1 | Provider receives in-app notification: "¡Tu oferta fue aceptada!" |
| 8.5.2 | Email notification sent with delivery details |
| 8.5.3 | Notification includes: customer name, phone, full address, amount, delivery window |
| 8.5.4 | "Ver Detalles" button links to delivery page |
| 8.5.5 | Offer moves to "Entregas Activas" section |

### Story 8.6: Earnings Dashboard

| AC# | Criterion |
|-----|-----------|
| 8.6.1 | Period selector: Hoy / Esta Semana / Este Mes |
| 8.6.2 | Summary cards show: Total Entregas, Ingreso Bruto, Comisión (%), Ganancia Neta |
| 8.6.3 | Cash payment section shows: Efectivo Recibido, Comisión Pendiente |
| 8.6.4 | "Pagar Comisión" button visible when pending > 0 |
| 8.6.5 | Delivery history list shows: date, amount, payment method, commission |

### Story 8.7: Cash Commission Settlement

| AC# | Criterion |
|-----|-----------|
| 8.7.1 | Amount due displayed prominently |
| 8.7.2 | Platform bank details shown: Banco, Cuenta, Titular, RUT |
| 8.7.3 | Upload receipt button functional |
| 8.7.4 | Upon submission: payment record created with status 'pending_verification' |
| 8.7.5 | Admin notified for verification |
| 8.7.6 | Provider sees "Pago enviado - En verificación" |
| 8.7.7 | Once verified: commission_paid entry created, pending balance reduced |

---

## Traceability Mapping

| AC | Spec Section | Component/API | Test Idea |
|----|--------------|---------------|-----------|
| 8.1.1 | Request Browser | `getAvailableRequests()` | E2E: verified provider sees requests |
| 8.1.2 | Request Browser | `RequestCard` component | Unit: card renders all fields |
| 8.1.3 | Request Browser | SQL ORDER BY | Integration: verify sort order |
| 8.1.4 | Realtime Hook | `useRealtimeRequests` | E2E: new request appears without refresh |
| 8.1.5 | Realtime Hook | Realtime subscription | E2E: filled request disappears |
| 8.2.1 | Offer Form | `OfferForm` component | Unit: time picker renders |
| 8.2.2 | Offer Form | `calculateCommission()` | Unit: price from settings |
| 8.2.3 | Offer Form | Commission calculation | Unit: earnings preview correct |
| 8.2.6 | Offer Creation | `createOffer()` | Integration: offer in DB with expires_at |
| 8.2.8 | Offer Creation | UNIQUE constraint | Integration: duplicate returns error |
| 8.3.2 | Offers List | `use-countdown.ts` | Unit: countdown calculates correctly |
| 8.3.5 | Realtime Hook | `useRealtimeOffers` | E2E: status change reflects |
| 8.4.2 | Offer Withdrawal | `withdrawOffer()` | Integration: status = 'cancelled' |
| 8.5.1 | Notifications | `notifications` table | Integration: notification created |
| 8.5.2 | Email | `offer-accepted.tsx` template | Unit: email content correct |
| 8.6.2 | Earnings | `getEarningsSummary()` | Integration: aggregation correct |
| 8.6.3 | Earnings | Commission ledger query | Integration: pending calculated |
| 8.7.3 | Settlement | Supabase Storage | E2E: file uploads successfully |
| 8.7.4 | Settlement | `submitCommissionPayment()` | Integration: withdrawal_request created |

---

## Risks, Assumptions, Open Questions

### Risks

| Risk | Mitigation |
|------|------------|
| Realtime connection drops | Implement 30s polling fallback |
| Cron job failures | Idempotent design, catch-up on next run |
| Timer drift on mobile | Use server time for validation, client for display |
| Multiple providers submit simultaneously | UNIQUE constraint prevents duplicates |

### Assumptions

| Assumption | Basis |
|------------|-------|
| Providers have stable enough internet for Realtime | Rural Chile has improving 3G/4G coverage |
| 30-minute default offer validity is sufficient | Admin can adjust (15-120 min range) |
| Bank transfer is acceptable for commission settlement | Confirmed in PRD V2 business decisions |
| Commission percentage is same for all water amounts | Per Architecture V2 simplicity |

### Open Questions

| Question | Resolution Path |
|----------|-----------------|
| Should expired offers show in provider history? | Product decision - suggest yes for transparency |
| Notification frequency for multiple new requests? | Batch notifications if >3 in 5 minutes |
| Receipt verification SLA for admins? | Define in admin documentation |

---

## Test Strategy Summary

### Test Levels

| Level | Framework | Coverage |
|-------|-----------|----------|
| Unit | Vitest | Commission calculation, countdown logic, form validation |
| Integration | Vitest + Supabase | Server actions, database operations, RLS policies |
| E2E | Playwright | Full user flows, realtime updates, offer lifecycle |

### Key Test Scenarios

1. **Request Browser Flow**
   - Provider sees only requests in their service areas
   - Unavailable provider sees empty state
   - New request appears via Realtime
   - Filled request disappears

2. **Offer Submission Flow**
   - Valid offer creates successfully
   - Earnings preview shows correct calculation
   - Duplicate offer rejected
   - Invalid delivery window rejected

3. **Offer Lifecycle**
   - Countdown timer displays correctly
   - Withdrawal changes status
   - Expiration cron marks offers expired
   - Acceptance updates all related offers

4. **Earnings & Settlement**
   - Period calculations accurate
   - Commission pending calculated from cash deliveries
   - Receipt upload stores file
   - Admin receives notification

### Edge Cases

- Provider becomes unavailable mid-session
- Network disconnect during offer submission
- Multiple offers on request, one accepted
- Zero pending commission (hide button)
- Large numbers in earnings display (proper formatting)
