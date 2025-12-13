# Admin Flow Requirements Document

**Date:** 2025-12-10
**Status:** Mockups Complete
**Participants:** Full BMAD Agent Team (Party Mode Roast Session)

---

## Executive Summary

The admin panel is a critical component identified during the Consumer and Provider flow audits. This document captures all admin functionality requirements gathered during the roast sessions, to be used as input for creating admin mockups.

---

> **Note:** Admin panel includes offer validity configuration and offer analytics. See Section 12 in [02-admin-dashboard.html](../ux-mockups/02-admin-dashboard.html) for Ofertas mockups.

---

## Access Model

### Secret Entry Point
- Admin panel should NOT be publicly discoverable
- Access via one of:
  - Hidden URL (e.g., `/admin` or `/backoffice`)
  - Long-press on logo + key combination
  - Direct URL shared only with admins
- Separate Google authentication for admin role
- Admin is a SEPARATE role (not combined with Consumer or Provider)

### Admin Roles (Future Consideration)
- Super Admin: Full access
- Operations Admin: Day-to-day management
- Support Admin: Read-only + customer support actions

---

## Core Admin Functions

### 1. Provider Verification & Management

#### 1.1 Verification Queue
**Purpose:** Review and approve/reject new provider applications.

**Requirements:**
- List of pending provider applications
- For each application, show:
  - Personal information (name, contact)
  - Uploaded documents:
    - Cédula de identidad
    - Licencia de conducir
    - Permisos sanitarios
    - Certificaciones de agua
    - Vehicle information + photos
  - Application date
  - Status (Pending/In Review/Approved/Rejected/More Info Needed)

**Actions:**
- View document details (zoom, download)
- Approve application
- Reject application (with reason - required)
- Request more information (specify what's needed)
- Add internal notes

#### 1.2 Provider Directory
**Purpose:** View and manage all registered providers.

**Requirements:**
- Searchable/filterable list of all providers
- For each provider, show:
  - Profile info
  - Current status (Active/Suspended/Banned)
  - Rating (current + history)
  - Total deliveries
  - Join date
  - Document expiration dates (if applicable)

**Actions:**
- View full profile
- Suspend provider (with reason)
- Unsuspend provider
- Ban provider (with reason)
- Send notification/message
- View delivery history
- View earnings history
- Edit commission rate (if variable)

#### 1.3 Rating Enforcement
**Purpose:** Manage providers below acceptable rating thresholds.

**Requirements:**
- Dashboard showing providers at risk:
  - Below warning threshold
  - Currently warned
  - Currently suspended
- Automated alerts when provider drops below threshold

**Actions:**
- Issue warning
- Escalate to suspension
- Escalate to ban
- Review appeals
- Override automatic actions (with justification)

---

### 2. Pricing & Commission Management

#### 2.1 Base Pricing Configuration
**Purpose:** Set platform pricing for water quantities.

**Requirements:**
- Configure pricing tiers:
  - 100 litros: $X
  - 1,000 litros: $Y
  - 5,000 litros: $Z
  - Custom quantities
- Configure urgency surcharge (% or flat amount)
- Configure zone-based pricing adjustments (if applicable)
- Preview how prices appear to consumers

**Actions:**
- Create/edit/delete pricing tiers
- Set effective date for price changes
- View price history

#### 2.2 Commission Configuration
**Purpose:** Set platform commission rates.

**Requirements:**
- Global commission rate (%)
- Ability to set provider-specific rates (exceptions)
- View commission impact on sample transactions

**Actions:**
- Update commission rate
- Set effective date
- View commission history

#### 2.3 Financial Overview
**Purpose:** Track platform revenue.

**Requirements:**
- Dashboard showing:
  - Total transactions (count + value)
  - Total commission earned
  - Pending commissions (from cash transactions)
  - Outstanding provider balances
- Filterable by date range
- Export to CSV/Excel

---

### 3. Order/Request Management

#### 3.1 Live Orders Dashboard
**Purpose:** Real-time view of all active orders.

**Requirements:**
- Map view showing:
  - Pending requests (waiting for provider)
  - Accepted requests (assigned to provider)
  - In-progress deliveries (en route)
- List view with filters:
  - Status
  - Date/time
  - Zone
  - Provider
  - Consumer

**Actions:**
- View order details
- Manually assign/reassign provider
- Cancel order (with reason)
- Contact consumer
- Contact provider

#### 3.2 Order History
**Purpose:** Historical view of all orders.

**Requirements:**
- Searchable by:
  - Order ID
  - Consumer name/phone
  - Provider name
  - Date range
  - Status
- Show: Order details, timeline, payment info

**Actions:**
- View full order details
- Issue refund (if applicable)
- Generate report

#### 3.3 Problem Resolution Queue
**Purpose:** Handle reported problems from deliveries.

**Requirements:**
- List of unresolved problems
- For each problem:
  - Problem type
  - Order details
  - Provider report
  - Consumer report (if any)
  - Photos (if provided)
  - Timeline

**Actions:**
- Mark as resolved
- Issue refund
- Issue warning to provider
- Contact parties
- Add notes

---

### 4. Consumer Management

#### 4.1 Consumer Directory
**Purpose:** View and manage registered consumers.

**Requirements:**
- Searchable list of consumers
- For each consumer:
  - Profile info
  - Order count
  - Total spent
  - Registration date
  - Status (Active/Blocked)

**Actions:**
- View order history
- Block consumer (with reason)
- Unblock consumer
- Send notification

#### 4.2 Guest Order Tracking
**Purpose:** Track orders from unregistered users.

**Requirements:**
- List of guest orders
- Contact info provided
- Order status

---

### 5. Analytics & Reporting

#### 5.1 Operations Dashboard
**Requirements:**
- Key metrics:
  - Orders today/week/month
  - Average delivery time
  - Provider utilization
  - Consumer satisfaction (ratings)
  - Problem rate
- Trends and comparisons

#### 5.2 Financial Reports
**Requirements:**
- Revenue by period
- Commission collected
- Outstanding balances
- Top providers by earnings
- Top consumers by spend

#### 5.3 Provider Performance
**Requirements:**
- Delivery completion rate
- Average rating
- Response time (accept/reject speed)
- Problem rate

#### 5.4 Export & Scheduling
**Requirements:**
- Export reports to CSV/Excel/PDF
- Schedule automated reports via email

---

### 6. System Configuration

#### 6.1 Request Assignment Settings
**Requirements:**
- Acceptance window duration (default: 3-5 minutes)
- Provider cycling logic (nearest first, rating-based, round-robin)
- Maximum distance for provider matching

#### 6.2 Rating Thresholds
**Requirements:**
- Warning threshold (e.g., below 4.0)
- Suspension threshold (e.g., below 3.5)
- Ban threshold (e.g., below 3.0)
- Review period for recovery

#### 6.3 Notification Templates
**Requirements:**
- Email templates for consumers
- Push notification templates
- Provider notification templates
- Editable content

---

### 7. Support Tools

#### 7.1 Consumer Support
**Requirements:**
- Look up order by ID or phone number
- View full order history for consumer
- Quick actions: refund, cancel, contact

#### 7.2 Provider Support
**Requirements:**
- Look up provider by name or ID
- View earnings, deliveries, standing
- Quick actions: adjust balance, suspend/unsuspend

#### 7.3 Communication Center
**Requirements:**
- Send bulk notifications
- Filter recipients (all consumers, all providers, specific zones)
- Schedule messages
- View delivery status

---

## Screen Requirements Summary

### Required Screens (MVP)

| # | Screen | Priority | Purpose | Status |
|---|--------|----------|---------|--------|
| 1 | Admin Login | P0 | Secure access to admin panel | ✅ Done |
| 2 | Operations Dashboard | P0 | Key metrics overview | ✅ Done |
| 3 | Provider Verification Queue | P0 | Approve/reject new providers | ✅ Done |
| 4 | Provider Directory | P0 | Manage existing providers | ✅ Done |
| 5 | Pricing & Commission Config | P0 | Set water prices and commission | ✅ Done |
| 6 | Live Orders Dashboard | P1 | Monitor active orders | ✅ Done |
| 7 | Problem Resolution Queue | P1 | Handle reported issues | ✅ Done |
| 8 | Order History | P1 | Search past orders | ✅ Done |
| 9 | Consumer Directory | P2 | Manage consumers | ✅ Done |
| 10 | Financial Reports | P2 | Revenue tracking | ✅ Done |
| 11 | System Settings | P2 | Configure platform rules | ✅ Done |

**Note:** All MVP screens completed on 2025-12-11. See [02-admin-dashboard.html](../ux-mockups/02-admin-dashboard.html) for mockups.

### Future Screens

| # | Screen | Purpose |
|---|--------|---------|
| 13 | Provider Performance Reports | Detailed analytics |
| 14 | Communication Center | Bulk messaging |
| 15 | Audit Log | Track admin actions |
| 16 | Role Management | Multi-admin support |

---

## UI/UX Recommendations

### Design Principles
1. **Different visual identity** from consumer/provider apps (suggest: neutral dark theme)
2. **Desktop-first** design (admins work on computers, not phones)
3. **Dense information display** - admins need to see data efficiently
4. **Quick actions** - minimize clicks for common tasks
5. **Clear status indicators** - color-coded for quick scanning

### Navigation Structure (Suggested)
```
Sidebar Navigation:
├── Dashboard (Operations Overview)
├── Orders
│   ├── Live Orders
│   ├── Order History
│   └── Problems
├── Providers
│   ├── Verification Queue
│   ├── Directory
│   └── Performance
├── Consumers
│   └── Directory
├── Finance
│   ├── Pricing
│   ├── Commissions
│   └── Reports
├── Support
│   ├── Order Lookup
│   └── Communications
└── Settings
    ├── System Config
    ├── Notifications
    └── Admin Users
```

### Key Interactions
- **Verification review**: Side-by-side document viewer with approve/reject buttons
- **Order monitoring**: Real-time updates without page refresh
- **Quick search**: Global search bar for orders, providers, consumers
- **Bulk actions**: Select multiple items for batch operations

---

## Data Requirements

### From Consumer App
- Order details
- Consumer profiles
- Consumer ratings of providers
- Payment information

### From Provider App
- Provider profiles
- Document uploads
- Delivery confirmations
- Problem reports
- Earnings/transactions

### Admin-Generated
- Verification decisions
- Price configurations
- Commission settings
- Warnings/suspensions
- Problem resolutions

---

## Security Considerations

1. **Authentication**: Google OAuth with admin-only whitelist
2. **Authorization**: Role-based access control
3. **Audit logging**: Track all admin actions with timestamp and user
4. **Data access**: Limit sensitive data (full payment info) to authorized roles
5. **Session management**: Auto-logout after inactivity

---

## Integration Points

### With Consumer App
- Price display
- Order status updates
- Notifications

### With Provider App
- Verification status
- Account standing
- Commission deductions
- Notifications

### External Services
- Google OAuth
- Email service (notifications)
- Payment processor (refunds)
- Maps API (order visualization)

---

## Next Steps

1. **UX Designer**: Create admin mockups based on this requirements document
2. **Prioritize**: Team reviews and confirms MVP scope
3. **Architecture**: Architect reviews for technical feasibility
4. **Security Review**: Ensure admin access is properly secured
5. **Development**: Implement alongside consumer/provider apps

---

## Open Questions

1. **Commission rate**: What is the exact percentage? (TBD)
2. **Rating thresholds**: What are the exact numbers? (TBD)
3. **Admin users**: Who specifically will have access? (TBD)
4. **Launch strategy**: Admin panel before or after consumer/provider apps? (TBD)
5. **Refund policy**: Under what conditions can admins issue refunds? (TBD)

---

*Generated by BMAD Party Mode Roast Session*
