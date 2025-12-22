# Workflow Chains

> Section 8 of Atlas Memory
> Last Sync: 2025-12-22
> Sources: docs/architecture.md, docs/prd.md, Epic 10 implementation

## User Journey Mapping

### Journey: Consumer Water Request (MVP)

```
[Need Water] → [Open App] → [Request Form] → [Submit] → [Wait] → [Delivery]
                   ↓             ↓              ↓          ↓
             [PWA Install]  [Address Entry]  [Email     [Track
              optional       w/ Google Maps]  Confirm]   Status]
```

**Steps:**
1. Consumer opens nitoagua (PWA or web)
2. Fills minimal request form (address, volume, urgency)
3. Submits request (no registration required for guests)
4. Receives email with tracking link
5. Tracks status: Pending → Accepted → Delivered

### Journey: Consumer Water Request (V2 with Offers) - IMPLEMENTED

```
[Submit Request] → [Wait for Offers] → [View Offers] → [Accept Offer] → [Track] → [Delivered]
       ↓                  ↓                  ↓               ↓             ↓            ↓
  status=pending    24hr timeout       Countdown        status=        Provider     Commission
  /request/[id]     → no_offers        timer UX        accepted       info shown    recorded
```

**Steps:**
1. Consumer submits request → redirected to `/request/[id]` (status page)
2. Request visible to providers in `/provider/requests` (realtime subscription)
3. Providers submit offers (calculated price from admin settings)
4. Consumer sees offers with countdown timers on status page
5. Consumer accepts preferred offer → `select_offer()` atomic function
6. Provider notified (in-app + email) → delivers water
7. Provider marks delivered → commission logged to settlement ledger

**Key Components:**
| Step | Component | Path |
|------|-----------|------|
| Submit Request | RequestForm | `/request` |
| View Status | RequestStatusClient | `/request/[id]` |
| View Offers | OfferCard + CountdownTimer | `/request/[id]` |
| Accept Offer | `select_offer()` server action | `lib/actions/offers.ts` |
| Track Guest | TrackingPage | `/track/[token]` |

**Timeout Flow:**
- Requests without accepted offer after 24 hours → status = `no_offers`
- Cron job: `/api/cron/request-timeout` (daily, Vercel Hobby limit)
- Consumer notified via email when request times out

### Journey: Provider Offer Flow

```
[Dashboard] → [View Request] → [Submit Offer] → [Wait] → [Accepted?] → [Deliver] → [Complete]
     ↓             ↓                ↓              ↓          ↓            ↓
 [Filter by    [Address,       [Price,        [Realtime  [Route to    [Commission
  status]       Volume,         Window]        Update]    customer]    Recorded]
               Urgency]
```

### Journey: Admin Provider Verification

```
[Pending Queue] → [Review Documents] → [Approve/Reject] → [Notify Provider]
       ↓                  ↓                   ↓                   ↓
  [Allowlist        [Carnet,             [Update          [Email
   Check]            Truck Photo]         Status]          Notification]
```

## Workflow Dependencies

| Workflow | Depends On | Enables |
|----------|------------|---------|
| Consumer Request | PWA installed OR web access | Provider Dashboard updates |
| Provider Offers | Provider verification complete | Consumer offer selection |
| Offer Selection | At least one offer received | Delivery tracking |
| Delivery Complete | Offer accepted | Commission calculation |
| Settlement | Completed deliveries | Provider earnings payout |

## Critical Paths

1. **Request → Offer → Delivery** - Core value loop
2. **Provider Registration → Verification → Dashboard Access** - Provider onboarding
3. **Delivery Complete → Commission Logged → Settlement** - Revenue flow

## Edge Cases by Workflow

### Consumer Request
- Guest vs registered user (guest needs email for tracking)
- Address validation failure (allow manual override)
- No providers available (show "no offers yet" state)

### Provider Offers
- Offer expires before acceptance
- Consumer cancels after offers submitted
- Multiple offers, consumer selects one (others auto-withdrawn)

### Admin Verification
- Documents unclear (request resubmission)
- Provider not in allowlist (add to allowlist first)
- Provider fails verification (can resubmit)

## Impact Matrix

| Feature Change | Affects Workflows |
|----------------|-------------------|
| Address validation | Consumer Request, Provider view |
| Offer expiration logic | Offer submission, Consumer selection |
| Commission rate | Delivery complete, Settlement |
| Email templates | All notification touchpoints |
| Realtime subscriptions | Dashboard, Offer tracking |

## Component Mapping (Verified Dec 2025)

| Journey Step | Component Location |
|--------------|-------------------|
| Consumer Home | `src/app/page.tsx` |
| Request Form | `src/app/(consumer)/request/page.tsx` |
| Request Status | `src/app/(consumer)/request/[id]/page.tsx` |
| Guest Tracking | `src/app/track/[token]/page.tsx` |
| Consumer History | `src/app/(consumer)/history/page.tsx` |
| Consumer Profile | `src/app/consumer-profile/page.tsx` |
| Consumer Settings | `src/app/settings/page.tsx` |
| Provider Dashboard | `src/app/provider/requests/page.tsx` |
| Provider Offers | `src/app/provider/offers/page.tsx` |
| Provider Earnings | `src/app/provider/earnings/page.tsx` |
| Provider Settings | `src/app/provider/settings/page.tsx` |
| Provider Map | `src/app/provider/map/page.tsx` |
| Admin Dashboard | `src/app/admin/page.tsx` |
| Admin Verification | `src/app/admin/verification/page.tsx` |
| Admin Orders | `src/app/admin/orders/page.tsx` |
| Admin Settlement | `src/app/admin/settlement/page.tsx` |
| Admin Settings | `src/app/admin/settings/page.tsx` |

## Navigation Components

| Persona | Nav Component | Features |
|---------|---------------|----------|
| Consumer | `consumer-nav.tsx` | Icon-only, center FAB, unread badge |
| Provider | `provider-nav.tsx` | Icon + label, notification badge |
| Admin | Admin sidebar | Desktop-style sidebar |

---

*Last verified: 2025-12-22 | Sources: architecture.md, prd.md, actual implementation*
