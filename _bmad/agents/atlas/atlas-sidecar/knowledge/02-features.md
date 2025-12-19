# Feature Inventory + Intent

> Section 2 of Atlas Memory
> Last Sync: 2025-12-18
> Sources: docs/prd.md, docs/architecture.md, docs/epics.md

## Feature Overview

nitoagua provides features for three user types: Consumers, Providers (aguateros), and Admins.

## Consumer Features

### Core Request Flow (MVP)
| Feature | Intent | FRs |
|---------|--------|-----|
| **Guest Water Request** | Zero-friction first use | FR1, FR7-FR11 |
| **Request Tracking** | Know when delivery arrives | FR14, FR17-FR18 |
| **Request Cancellation** | Cancel before acceptance | FR15-FR16 |

### Registered Consumer Features
| Feature | Intent | FRs |
|---------|--------|-----|
| **Account Registration** | Faster repeat orders | FR2-FR4 |
| **Pre-filled Forms** | Speed from saved profile | FR12 |
| **Request History** | View past orders | FR5 |
| **In-app Notifications** | Real-time status updates | FR35 |

## Provider Features

### Dashboard & Operations
| Feature | Intent | FRs |
|---------|--------|-----|
| **Request Dashboard** | See ALL requests in one place | FR24-FR28 |
| **Accept Request** | Claim with optional delivery window | FR29-FR30 |
| **Mark Delivered** | Complete the delivery loop | FR31 |
| **Availability Toggle** | Vacation mode | FR23 |

### V2 Offer System
| Feature | Intent | Architecture |
|---------|--------|--------------|
| **Submit Offer** | Propose delivery to consumer | Consumer-choice model |
| **Active Offers List** | Track pending offers | Realtime subscriptions |
| **Offer Expiration** | Time-bound commitment | Configurable validity |
| **Earnings Dashboard** | Track commissions owed | Settlement ledger |

### Provider Profile
| Feature | Intent | FRs |
|---------|--------|-----|
| **Registration Flow** | Onboard with documents | FR19-FR21 |
| **Service Areas** | Define coverage (comunas) | ADR-007 |
| **Document Upload** | Verification requirements | V2 spec |
| **Bank Details** | Settlement payments | V2 spec |

## Admin Features (V2)

| Feature | Intent | Architecture |
|---------|--------|--------------|
| **Provider Verification** | Approve/reject providers | Allowlist + queue |
| **Provider Directory** | Manage all providers | Admin panel |
| **Pricing Configuration** | Set platform rates | admin_settings table |
| **Cash Settlement** | Track commission debt | Commission ledger |
| **Orders Management** | View all platform orders | Admin dashboard |

## Platform Features

| Feature | Intent | FRs |
|---------|--------|-----|
| **PWA Installation** | Home screen access | FR38-FR39 |
| **Spanish Interface** | Chilean localization | FR40 |
| **Responsive Design** | Mobile, tablet, desktop | FR41 |
| **Offline Capability** | Queue requests offline | FR42, NFR17 |

## Water Amount Tiers

| Tier | Volume | Use Case |
|------|--------|----------|
| Small | 100L | Emergency/small tank |
| Medium | 1,000L | Household weekly |
| Large | 5,000L | Large household |
| X-Large | 10,000L | Agricultural/commercial |

## Request Status Flow (MVP)

```
Pending -> Accepted -> Delivered
    |
    v
Cancelled (consumer, only if pending)
```

**V2 Extended Flow:**
```
Pending -> [Offers Received] -> Offer Accepted -> In Transit -> Delivered
```

## Feature Dependencies

| Feature | Depends On |
|---------|-----------|
| Pre-filled forms | User registration |
| Offer system | Provider verification |
| Settlement tracking | Completed deliveries |
| Email notifications | Resend integration |
| Realtime updates | Supabase subscriptions |

## Feature-to-Story Mapping

| Epic | Stories | Features Delivered |
|------|---------|-------------------|
| Epic 1 | 1.1-1.5 | PWA, Auth, Database |
| Epic 2 | 2.1-2.6 | Consumer request flow |
| Epic 3 | 3.1-3.8 | Supplier dashboard |
| Epic 4 | 4.1-4.6 | Consumer accounts |
| Epic 5 | 5.1-5.4 | Email notifications |
| Epic 6 | 6.1-6.10 | Admin panel |
| Epic 7 | 7.1-7.11 | Provider onboarding |
| Epic 8 | 8.1-8.10 | Offer system |

---

## Sync Notes

Last features sync: 2025-12-18
Sources: prd.md (FR1-FR45), architecture.md (V2 spec), epics.md
