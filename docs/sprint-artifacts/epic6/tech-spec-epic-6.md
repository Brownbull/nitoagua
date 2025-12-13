# Epic Technical Specification: Admin Operations Panel

Date: 2025-12-12
Author: Gabe
Epic ID: 6
Status: Draft

---

## Overview

Epic 6 implements the Admin Operations Panel - a desktop-first administrative dashboard that provides platform operators with full visibility and control over the nitoagua marketplace. This is the **first V2 epic to implement** as it establishes the admin_settings infrastructure required by the Consumer-Choice Offer System (Epics 7-9).

The Admin Panel enables operators to verify providers, configure offer validity settings, track cash settlements, monitor orders, and manage platform operations through a hidden URL with allowlist-based authentication.

## Objectives and Scope

### In Scope

- Admin authentication via Google OAuth with allowlist verification
- Offer system configuration (validity bounds, request timeout)
- Provider verification queue (approve/reject/request more info)
- Provider directory with status management
- Cash settlement tracking (debt aging, payment verification)
- Orders management with offer history
- Offer expiration cron job
- Operations dashboard with marketplace metrics

### Out of Scope

- Pricing tier editor (simplified in V2 - prices are seeded)
- Rating enforcement system (V3)
- Map view for live orders (V3)
- Consumer directory (V3)
- Financial reports export (V3)

## System Architecture Alignment

### Components Referenced

| Component | Location | Purpose |
|-----------|----------|---------|
| Admin Route Group | `src/app/(admin)/` | All admin pages and layouts |
| Admin API Routes | `src/app/api/admin/` | Server-side admin operations |
| Admin Components | `src/components/admin/` | Reusable admin UI components |
| Auth Guards | `src/lib/auth/guards.ts` | `requireAdmin()` function |
| Admin Actions | `src/lib/actions/admin.ts` | Server actions for admin ops |
| Cron Routes | `src/app/api/cron/` | Scheduled background jobs |

### Database Tables (V2)

| Table | Purpose | Epic 6 Usage |
|-------|---------|--------------|
| `admin_allowed_emails` | Allowlist for admin access | Story 6.1 |
| `admin_settings` | Platform configuration | Story 6.2 |
| `profiles` | Provider data (verification_status) | Story 6.3, 6.4 |
| `provider_documents` | Uploaded verification docs | Story 6.3 |
| `commission_ledger` | Cash settlement tracking | Story 6.5 |
| `withdrawal_requests` | Provider payment requests | Story 6.5 |
| `water_requests` | Orders data | Story 6.6 |
| `offers` | Offer history per request | Story 6.6, 6.7 |

### Architectural Constraints

1. **Desktop-First Design**: Admin UI optimized for 1024px+ viewport (mobile warning shown)
2. **Allowlist Auth**: Only emails in `admin_allowed_emails` can access admin routes
3. **RLS Policies**: All admin queries require `role = 'admin'` check
4. **Gray Theme**: Neutral professional palette per architecture spec

### Admin Navigation Components (CRITICAL - DO NOT DELETE)

**⚠️ IMPORTANT:** The following navigation components are shared across ALL admin pages and must be preserved in every story:

| Component | File | Purpose | Visibility |
|-----------|------|---------|------------|
| `AdminSidebar` | `src/components/admin/admin-sidebar.tsx` | Desktop navigation (lg+ screens) | `hidden lg:flex` |
| `AdminBottomNav` | `src/components/admin/admin-bottom-nav.tsx` | Mobile navigation (< lg screens) | `lg:hidden` |

**When adding new admin pages:**
1. Add nav link to BOTH `AdminSidebar` AND `AdminBottomNav`
2. Use consistent icons from `lucide-react`
3. Mark future pages as `disabled: true` until implemented
4. Test on both desktop AND mobile viewports

**Layout file:** `src/app/admin/layout.tsx` renders both nav components conditionally based on admin auth status. DO NOT modify the `{showNav && <AdminBottomNav />}` pattern.

---

## Detailed Design

### Services and Modules

| Service/Module | Responsibility | Inputs | Outputs |
|----------------|----------------|--------|---------|
| `requireAdmin()` | Auth guard for admin routes | Session | Admin user or redirect |
| `getProviderQueue()` | Fetch pending verifications | None | Provider[] with documents |
| `verifyProvider()` | Approve/reject provider | providerId, decision, reason | Updated profile |
| `getSettings()` | Fetch admin_settings | None | Settings object |
| `updateSettings()` | Modify admin_settings | key, value | Updated setting |
| `getSettlementSummary()` | Aggregate commission data | None | Summary with aging |
| `markPaymentReceived()` | Record commission payment | providerId, amount, ref | Ledger entry |
| `expireOffers()` | Cron: expire stale offers | None | Count of expired |

### Data Models and Contracts

```typescript
// Admin Settings Model
interface AdminSettings {
  offer_validity_default: number;  // minutes, default 30
  offer_validity_min: number;      // minutes, min 15
  offer_validity_max: number;      // minutes, max 120
  request_timeout_hours: number;   // hours, default 4
  default_commission_percent: number; // percentage, default 10
}

// Provider Verification
interface ProviderApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  verification_status: 'pending' | 'approved' | 'rejected' | 'more_info_needed';
  submitted_at: string;
  documents: ProviderDocument[];
  service_areas: string[];
  bank_info: { bank_name: string; account_number: string } | null;
  internal_notes?: string;
}

interface ProviderDocument {
  id: string;
  type: 'cedula' | 'licencia' | 'permiso_sanitario' | 'certificacion' | 'vehiculo';
  storage_path: string;
  original_filename: string;
  uploaded_at: string;
  verified_at?: string;
}

// Settlement Tracking
interface ProviderSettlement {
  provider_id: string;
  provider_name: string;
  total_owed: number;        // CLP
  current_bucket: number;    // < 7 days
  week_bucket: number;       // 7-14 days
  overdue_bucket: number;    // > 14 days
  last_payment_date?: string;
  pending_withdrawal?: WithdrawalRequest;
}

interface WithdrawalRequest {
  id: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  receipt_path?: string;
  submitted_at: string;
}

// Orders with Offers
interface OrderDetail {
  id: string;
  consumer_name: string;
  consumer_phone: string;
  consumer_email?: string;
  address: string;
  comuna: string;
  amount_liters: number;
  urgency: 'normal' | 'urgent';
  status: string;
  created_at: string;
  offers: OfferSummary[];
  selected_offer?: OfferSummary;
  provider?: ProviderSummary;
  timeline: TimelineEvent[];
}

interface OfferSummary {
  id: string;
  provider_name: string;
  delivery_window_start: string;
  delivery_window_end: string;
  status: 'active' | 'accepted' | 'expired' | 'cancelled' | 'request_filled';
  created_at: string;
}
```

### APIs and Interfaces

#### Admin Auth

```typescript
// GET /api/admin/auth/check
// Check if current user is admin
Response: { isAdmin: boolean; email: string }

// Middleware: /src/middleware.ts
// Routes starting with /admin (except /admin/login) require:
// 1. Valid session
// 2. Email in admin_allowed_emails table
```

#### Settings API

```typescript
// GET /api/admin/settings
Response: AdminSettings

// PATCH /api/admin/settings
Request: { key: string; value: any }
Response: { success: boolean; updated: AdminSettings }
```

#### Verification Queue

```typescript
// GET /api/admin/providers/pending
Response: ProviderApplication[]

// POST /api/admin/providers/[id]/verify
Request: {
  decision: 'approved' | 'rejected' | 'more_info_needed';
  reason?: string;
  notes?: string;
}
Response: { success: boolean }
```

#### Settlement

```typescript
// GET /api/admin/settlement/summary
Response: {
  total_pending: number;
  total_overdue: number;
  pending_verifications: number;
  providers: ProviderSettlement[];
}

// POST /api/admin/settlement/verify
Request: {
  withdrawal_id: string;
  bank_reference?: string;
}
Response: { success: boolean }
```

#### Cron Endpoints

```typescript
// GET /api/cron/expire-offers
// Header: Authorization: Bearer CRON_SECRET
// Schedule: * * * * * (every minute)
Response: { expired_count: number }

// GET /api/cron/request-timeout
// Schedule: */15 * * * * (every 15 minutes)
Response: { timed_out_count: number }
```

### Workflows and Sequencing

#### Admin Login Flow

```
1. User navigates to /admin
2. Redirect to /admin/login if no session
3. User clicks "Login with Google"
4. OAuth callback at /auth/callback?next=/admin
5. Callback checks admin_allowed_emails
6. If allowed: Redirect to /admin/dashboard
7. If not allowed: Redirect to /admin/not-authorized
```

#### Provider Verification Flow

```
1. Admin opens verification queue
2. System loads pending applications (sorted by submission date)
3. Admin clicks application to view detail
4. Admin reviews documents (viewer with zoom/download)
5. Admin takes action:
   a. Approve: Status → 'approved', notify provider, enable account
   b. Reject: Status → 'rejected', require reason, notify provider
   c. Request Info: Status → 'more_info_needed', select missing docs, notify
6. Application moves out of queue
```

#### Settlement Verification Flow

```
1. Provider completes cash delivery
2. System creates commission_owed entry in ledger
3. Provider transfers commission to platform bank
4. Provider uploads receipt via withdrawal request
5. Admin views pending verifications
6. Admin clicks receipt to view, enters bank reference
7. Admin confirms → Creates commission_paid entry
8. Provider notified, balance updated
```

#### Offer Expiration Cron Flow

```
1. Cron triggers /api/cron/expire-offers
2. Query: SELECT * FROM offers WHERE status = 'active' AND expires_at < NOW()
3. Batch update: SET status = 'expired'
4. For each expired offer: Create notification for provider
5. Log count and return
```

---

## Non-Functional Requirements

### Performance

| Metric | Target | Source |
|--------|--------|--------|
| Admin dashboard load | < 3 seconds | NFR6 |
| Verification queue load | < 2 seconds (up to 50 pending) | Architecture |
| Settlement summary | < 3 seconds | Architecture |
| Cron offer expiration | < 30 seconds per run | Architecture |

**Implementation:**
- Pagination on all tables (25 items default)
- Aggregate queries for dashboard metrics (single query per card)
- Index on `offers.expires_at WHERE status = 'active'`
- Debounced search inputs (300ms)

### Security

| Requirement | Implementation | Source |
|-------------|----------------|--------|
| Admin allowlist | Check `admin_allowed_emails` on login | FR71, NFR11 |
| RLS policies | `role = 'admin'` check on all admin queries | Architecture |
| Document access | Signed URLs with expiration | NFR10 |
| Financial data | Ledger access admin-only | NFR12 |
| Cron auth | CRON_SECRET header validation | Architecture |

**Cron Security Pattern:**
```typescript
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  // ... cron logic
}
```

### Reliability/Availability

| Requirement | Implementation | Source |
|-------------|----------------|--------|
| Financial accuracy | Ledger entries never deleted, adjustments only | NFR20 |
| Audit trail | All admin actions logged with timestamp | Architecture |
| Graceful degradation | Offline indicators, retry on failure | NFR19 |

### Observability

| Signal | Implementation |
|--------|----------------|
| Admin actions | Console log: `[ADMIN] ${action} by ${email} at ${timestamp}` |
| Cron execution | Console log: `[CRON] expire-offers: ${count} expired` |
| Verification decisions | Timestamped in profiles table |
| Settlement transactions | Full audit trail in commission_ledger |

---

## Dependencies and Integrations

### External Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@supabase/supabase-js` | ^2.x | Database, auth, storage |
| `@supabase/ssr` | ^0.x | Server-side Supabase client |
| `date-fns` | ^3.x | Date formatting/manipulation |
| `date-fns-tz` | ^3.x | Timezone conversion (Chile) |
| `sonner` | ^1.x | Toast notifications |
| `lucide-react` | ^0.x | Icons |

### Internal Dependencies

| Dependency | Location | Required By |
|------------|----------|-------------|
| Auth system | MVP Epic 1-3 | Story 6.1 |
| Profiles table | MVP | Stories 6.3, 6.4 |
| Provider registration | Epic 7 | Story 6.3 (to have providers to verify) |
| Offers table | Epic 8-9 | Story 6.6, 6.7 (will be created in migration) |

### Integration Points

| System | Integration | Direction |
|--------|-------------|-----------|
| Supabase Auth | OAuth callback | Bidirectional |
| Supabase Storage | Document viewer | Read |
| Supabase Realtime | Dashboard refresh | Subscribe |
| Vercel Cron | Scheduled jobs | Inbound |
| Email (Resend) | Notifications | Outbound |

---

## Acceptance Criteria (Authoritative)

### Story 6.1: Admin Authentication and Access

1. AC6.1.1: Admin can navigate to `/admin` and see login page with Google OAuth button
2. AC6.1.2: After OAuth, system checks `admin_allowed_emails` table for user email
3. AC6.1.3: If email found, user redirected to `/admin/dashboard`
4. AC6.1.4: If email NOT found, user shown "No autorizado" message
5. AC6.1.5: Admin session persists for 24 hours
6. AC6.1.6: Desktop-optimized layout with sidebar navigation
7. AC6.1.7: Mobile devices show "Usa una computadora" warning

### Story 6.2: Offer System Configuration

8. AC6.2.1: Admin can navigate to "Configuraci\u00f3n" from sidebar
9. AC6.2.2: Settings page shows offer validity fields: default, min, max (in minutes)
10. AC6.2.3: Settings page shows request timeout field (in hours)
11. AC6.2.4: Changes require confirmation before saving
12. AC6.2.5: Changes take effect immediately for new offers
13. AC6.2.6: Invalid values show validation error (min > 0, max >= default >= min)

### Story 6.3: Provider Verification Queue

14. AC6.3.1: Admin can view queue of pending provider applications
15. AC6.3.2: Queue shows count badge of pending applications
16. AC6.3.3: Applications sorted by submission date (oldest first)
17. AC6.3.4: Clicking application opens detail view with documents
18. AC6.3.5: Document viewer supports zoom and download
19. AC6.3.6: Admin can approve application (status → 'approved')
20. AC6.3.7: Admin can reject application (reason required, status → 'rejected')
21. AC6.3.8: Admin can request more info (select missing docs, status → 'more_info_needed')
22. AC6.3.9: Action triggers notification to applicant

### Story 6.4: Provider Directory

23. AC6.4.1: Admin can view searchable table of all providers
24. AC6.4.2: Table columns: Name, Phone, Status, Deliveries, Commission Owed, Joined
25. AC6.4.3: Table supports filtering by status and service area
26. AC6.4.4: Clicking provider shows detail panel
27. AC6.4.5: Admin can suspend provider (with reason)
28. AC6.4.6: Admin can unsuspend provider
29. AC6.4.7: Admin can ban provider (requires confirmation)
30. AC6.4.8: Admin can adjust commission rate per provider

### Story 6.5: Cash Settlement Tracking

31. AC6.5.1: Settlement page shows summary cards: total pending, overdue, pending verifications
32. AC6.5.2: Pending payments table shows: provider, amount, receipt, date, actions
33. AC6.5.3: Provider balances table shows: provider, total owed, days outstanding
34. AC6.5.4: Admin can view uploaded receipt image
35. AC6.5.5: Admin can enter bank reference and confirm payment
36. AC6.5.6: Confirmation creates commission_paid entry in ledger
37. AC6.5.7: Admin can reject payment with reason
38. AC6.5.8: Provider notified of payment verification result

### Story 6.6: Orders Management

39. AC6.6.1: Orders page shows filterable table of all orders
40. AC6.6.2: Filters: status, date range, service area
41. AC6.6.3: Clicking order shows detail view with offer history
42. AC6.6.4: Detail shows timeline: Created → Offers → Selected → Delivered
43. AC6.6.5: Admin can view consumer and provider contact info
44. AC6.6.6: Admin can cancel order with reason
45. AC6.6.7: Offer analytics shown: offers received, time to first offer

### Story 6.7: Offer Expiration Cron Job

46. AC6.7.1: Cron job runs every minute via Vercel cron
47. AC6.7.2: Job marks offers with `expires_at < NOW()` as 'expired'
48. AC6.7.3: Affected providers notified "Tu oferta expir\u00f3"
49. AC6.7.4: Job logs count of expired offers
50. AC6.7.5: Job authenticated via CRON_SECRET

### Story 6.8: Operations Dashboard

51. AC6.8.1: Dashboard shows period selector: Hoy / Esta Semana / Este Mes
52. AC6.8.2: Request metrics: total, with offers %, avg offers/request, timeout rate
53. AC6.8.3: Offer metrics: total, acceptance rate, avg time to first, expiration rate
54. AC6.8.4: Financial: transaction volume, commission earned, pending settlements
55. AC6.8.5: Provider: active count, online now, new applications
56. AC6.8.6: Metrics show trend vs previous period (\u2191 \u2193)
57. AC6.8.7: Clicking metric drills down to filtered view

---

## Traceability Mapping

| AC | Spec Section | Component | API | Test Idea |
|----|--------------|-----------|-----|-----------|
| AC6.1.1-4 | Auth Flow | AdminLogin | /auth/callback | E2E: Login flow with/without allowlist |
| AC6.1.5 | Security | Middleware | - | Unit: Session expiry check |
| AC6.1.6-7 | Layout | AdminLayout | - | Visual: Desktop/mobile layouts |
| AC6.2.1-6 | Settings API | SettingsForm | /api/admin/settings | Integration: CRUD settings |
| AC6.3.1-9 | Verification | VerificationQueue | /api/admin/providers | E2E: Full verification flow |
| AC6.4.1-8 | Directory | ProviderDirectory | /api/admin/providers | Integration: Search, filter, actions |
| AC6.5.1-8 | Settlement | SettlementTable | /api/admin/settlement | E2E: Payment verification flow |
| AC6.6.1-7 | Orders | OrdersTable | /api/admin/orders | Integration: Filters, detail view |
| AC6.7.1-5 | Cron | ExpireOffers | /api/cron/expire-offers | Unit: Expiration logic |
| AC6.8.1-7 | Dashboard | OpsDashboard | /api/admin/dashboard | Integration: Metrics queries |

---

## Risks, Assumptions, Open Questions

### Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **R1**: No providers to verify initially | Low - blocks Story 6.3 testing | Test with seed data; Story 6.3 can proceed after Epic 7 Story 7.1 |
| **R2**: Offers table doesn't exist yet | Medium - blocks Story 6.6, 6.7 | Create offers table in Story 6.2 migration |
| **R3**: Settlement complexity | Medium - financial accuracy critical | Start simple; use ledger pattern with audit trail |

### Assumptions

| ID | Assumption |
|----|------------|
| **A1** | Admin emails will be pre-seeded before deployment |
| **A2** | Vercel cron is available on project's pricing tier |
| **A3** | Supabase Storage already configured from MVP |
| **A4** | 1-2 admins initially; scaling not a concern for V2 |

### Open Questions

| ID | Question | Resolution |
|----|----------|------------|
| **Q1** | What bank account details for settlement? | Placeholder for now; admin-configurable later |
| **Q2** | Email notifications for admin actions? | Yes for verification decisions; no for settings changes |

---

## Test Strategy Summary

### Test Levels

| Level | Coverage | Framework |
|-------|----------|-----------|
| Unit | Auth guards, utility functions | Vitest |
| Integration | API routes, database queries | Vitest + Supabase test DB |
| E2E | Full admin flows | Playwright |

### Priority Test Scenarios

1. **P1: Admin Auth** - Allowlist enforcement, session management
2. **P1: Verification Flow** - Full approve/reject cycle with notifications
3. **P1: Cron Expiration** - Correct offer status transitions
4. **P2: Settlement** - Ledger accuracy, payment recording
5. **P2: Dashboard Metrics** - Aggregate calculations correct
6. **P3: Orders Management** - Filtering, detail views

### Edge Cases

- Admin with expired session attempting action
- Concurrent verification of same provider
- Cron running while provider withdraws offer
- Settlement verification with missing receipt
- Dashboard with zero data (new platform)

### Seeded Test Data

For E2E tests, create seeded scenarios:
- Admin user: `admin@nitoagua.cl` in allowlist
- 3 providers: 1 pending, 1 approved, 1 rejected
- 5 offers: various statuses including about-to-expire
- Settlement entries with aging buckets

---

_Generated by BMAD Epic Tech Context Workflow_
_Epic: 6 - Admin Operations Panel_
_Implementation Order: First V2 Epic (establishes admin_settings infrastructure)_
