# Workflow Chains

> Section 8 of Atlas Memory
> Last Sync: 2025-12-18
> Sources: docs/architecture.md, docs/prd.md

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

### Journey: Consumer Water Request (V2 with Offers)

```
[Submit Request] → [Offers Received] → [Compare] → [Accept Offer] → [Track] → [Delivered]
       ↓                  ↓               ↓              ↓             ↓
  [Pending Status]   [Realtime        [Price,        [Provider      [Commission
                      Broadcast]       Time Window]   Notified]      Logged]
```

**Steps:**
1. Consumer submits request
2. Providers see request in dashboard (realtime)
3. Providers submit offers (price, delivery window)
4. Consumer compares offers
5. Consumer accepts preferred offer
6. Provider delivers water
7. Commission logged to settlement ledger

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

## Component Mapping

| Journey Step | Component Location |
|--------------|-------------------|
| Request Form | `src/app/consumer/request/` |
| Provider Dashboard | `src/app/provider/dashboard/` |
| Offer Submission | `src/app/provider/offers/` |
| Admin Queue | `src/app/admin/verification/` |
| Tracking Page | `src/app/consumer/track/` |

---

*Last verified: 2025-12-18 | Sources: architecture.md, prd.md*
