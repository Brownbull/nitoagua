# nitoagua - Product Requirements Document (V2)

**Author:** Gabe
**Date:** 2025-12-11
**Version:** 2.0
**Status:** Full Platform Specification

---

## Executive Summary

nitoagua is a water delivery coordination platform for rural Chile that connects water consumers (rural households) with water suppliers (independent cistern truck operators) through a centralized platform managed by administrators. This V2 PRD expands the original MVP scope to include the complete three-role platform: Consumer, Provider (Supplier), and Admin.

The platform solves the fragmented, frustrating process of coordinating water deliveries across WhatsApp, Facebook, and phone calls by providing:
- **Consumers:** One-button water requests with offer selection and status tracking
- **Providers:** Single dashboard to browse requests and submit competitive offers
- **Admins:** Full platform control including provider verification, pricing, and operations monitoring

**The driving vision:** "Chile is ready for this. Nobody is doing it. There's a gap - rural people need services, providers exist, but no simple coordination point. It should be easy."

### What Makes This Special

**Asymmetric Simplicity Across Three Roles:**

| Role | Experience | Design Philosophy |
|------|------------|-------------------|
| Consumer | Ultra-simple "Request Water" button | One-thumb operation in 30 seconds |
| Provider | Sophisticated dashboard for browsing and offering | Efficiency-focused power user tools |
| Admin | Comprehensive operations control | Information-dense, desktop-first |

**Key Differentiators:**
1. **No registration barrier** - Consumers request water without accounts
2. **Supplier-led adoption** - Providers bring their existing customers
3. **Human touch preserved** - App facilitates coordination, doesn't replace relationships
4. **Consumer-choice offer model** - Providers submit offers, consumers choose best fit
5. **Trust-based operations** - Optional photo confirmation, trust over bureaucracy
6. **Designed for rural Chile** - Spanish-first, intermittent connectivity, local context

---

## Project Classification

**Technical Type:** web_app (Progressive Web App)
**Domain:** general (logistics/coordination)
**Complexity:** low

This is a B2B2C logistics coordination platform with marketplace dynamics. The web_app classification reflects the PWA-first technical approach, while the low domain complexity indicates no specialized regulatory requirements beyond standard web application practices.

**V2 Scope Expansion:**
- MVP (Epics 1-5): Consumer requests + Supplier dashboard ✅ COMPLETE
- V2 (Epics 6+): Full provider lifecycle + Admin operations + Consumer improvements

---

## Reference Documents

### UX Mockups (Visual Requirements)

| Flow | File | Screens | Status |
|------|------|---------|--------|
| Consumer | `docs/ux-mockups/00-consolidated-consumer-flow.html` | 15+ | Complete |
| Provider | `docs/ux-mockups/01-consolidated-provider-flow.html` | 13+ | Complete |
| Admin | `docs/ux-mockups/02-admin-dashboard.html` | 13 | Complete |

### Audit Documents (Business Rules)

| Document | Focus |
|----------|-------|
| `docs/ux-audit/consumer-flow-audit.md` | Consumer UX decisions |
| `docs/ux-audit/provider-flow-audit.md` | Provider workflow + business model |
| `docs/ux-audit/admin-flow-requirements.md` | Admin capabilities + requirements |
| `docs/ux-audit/theme-mockups.md` | Visual design system |

### Baseline

| Document | Purpose |
|----------|---------|
| `docs/prd.md` | Original MVP PRD (45 FRs) |
| `docs/product-brief-nitoagua-2025-11-30.md` | Original product vision |

---

## Key Business Decisions (V2)

### Account & Role Model

| Decision | Value | Rationale |
|----------|-------|-----------|
| Single Gmail = Single Role | Yes | Simplicity - no role-switching complexity |
| Multi-Gmail for different roles | Allowed | User can be Consumer on one Gmail, Provider on another |
| Admin accounts | Allowlist-based | Emails pre-seeded in database table; only those can register as admin |
| All authentication | Google OAuth only | Consistent across all three roles |

**Admin Registration Flow:**
1. Admin emails pre-seeded in `admin_allowed_emails` table
2. User navigates to `/admin` and clicks "Login with Google"
3. System checks if email exists in allowlist
4. If yes → registration/login proceeds
5. If no → rejection message: "Contact support for admin access"

### V2 Feature Priorities

| Feature | Priority | Notes |
|---------|----------|-------|
| Provider onboarding/registration | **MUST HAVE** | Self-registration flow |
| Admin verification queue | **MUST HAVE** | Review provider applications |
| Consumer-choice offer system | **MUST HAVE** | Providers submit offers, consumers select |
| Provider earnings visibility | **MUST HAVE** | Show what they'll earn |
| Cash settlement tracking | **MUST HAVE** | Track who owes what |
| Offer validity configuration | **MUST HAVE** | Admin sets min/max validity windows |
| Commission tracking | Nice-to-have | Future feature |
| Rating enforcement | Nice-to-have | Warnings → bans system |
| Map view for admin | Nice-to-have | Live orders visualization |
| Theme system | Nice-to-have | Follow mockup colors for now |

### Platform Model

| Decision | Value |
|----------|-------|
| Supplier model | **Multi-supplier marketplace** |
| Provider registration | **Self-registration** (with admin verification) |
| Geographic scope | **Araucanía Region** (Villarrica, Pucón, surrounding areas) |

### Visual Design Direction

**Current approach:** Follow mockup colors exactly
- Consumer: Blue water theme
- Provider: Orange accent theme
- Admin: Gray neutral theme

**Future consideration:** Dark mode support (not V2 scope)

### Request Assignment Model

**Consumer-Choice Offer Model:**

| Aspect | Decision |
|--------|----------|
| Distribution | Request broadcast to ALL providers in service area |
| Provider action | Providers browse available requests and submit offers |
| Offer contents | Price + delivery window + optional message |
| Consumer action | Consumer views all offers, selects preferred provider |
| Offer validity | Admin-configurable (min: 15min, max: 2hrs, default: 30min) |
| Request timeout | If no offers received within 4 hours, consumer notified |
| No provider available | Consumer notified: "No hay ofertas disponibles. Intenta más tarde." |

**Provider Availability:**
- Binary toggle: "Disponible" / "No disponible"
- Only "Disponible" providers see requests in their service area
- Provider controls their own availability status
- Provider browses requests at their own pace (no push pressure)

### Cash Settlement Model

**Payment Flow:**
1. Consumer pays provider in cash for delivery
2. System tracks: Provider owes platform X% commission
3. Provider manually transfers commission to platform bank account
4. Admin marks commission as received

**Settlement Rules:**
| Aspect | Decision |
|--------|----------|
| Payment method | Provider → Platform bank transfer |
| Deadline | Admin discretion (no hard deadline) |
| Delinquency tracking | Age of outstanding debt shown in provider dashboard |
| Admin visibility | Quick scan for overdue providers |
| Enforcement | Warning → Temporary ban → Permanent ban (admin actions) |

### Pricing Model

**Platform-Wide Pricing:**
| Aspect | Decision |
|--------|----------|
| Price setting | Admin sets platform-wide prices |
| Provider override | No - same prices for all providers |
| Commission rate | Configurable per-provider (admin only) |
| Price tiers | 100L, 1000L, 5000L, 10000L |

### Document Requirements

**Required for Verification (Minimum):**
- Cédula de identidad (ID) - **Required**
- Vehicle information - **Required**
- One certification (any) - **Required**

**Optional Uploads:**
- Licencia de conducir
- Permisos sanitarios
- Additional certifications
- Vehicle photos

### Location Model

**Map Pinpoint (Consumer):**
| Aspect | Decision |
|--------|----------|
| Trigger | After address entry |
| Interaction | Draggable pin on map |
| Required | Optional refinement |
| Address field | Separate text field (not from map) |
| Geolocation | Pin uses device geolocation, not address lookup |
| Fallback | Text address + special instructions always available |

---

## Success Criteria

### V2 Vision: Production-Ready Platform

V2 success is about transforming nitoagua from a functional MVP into a **production-quality application** that can be shown to investors, partners, and real users with pride. The goal is a polished, complete platform that demonstrates the full vision.

### Primary Success Metrics

**Platform Completeness:**
> All three user roles (Consumer, Provider, Admin) have complete, polished flows that match the approved mockups.

**Multi-Provider Marketplace:**
> At least 3 verified providers actively using the platform in the Araucanía region.

**Real Transaction Flow:**
> Complete request lifecycle works: Consumer request → Providers submit offers → Consumer selects offer → Delivery → Settlement tracking.

### Validation Milestones

| Milestone | Success Criteria |
|-----------|------------------|
| Provider Onboarding | Provider can self-register, upload documents, and receive verification decision |
| Admin Operations | Admin can verify providers, view all orders, manage platform settings |
| Consumer-Choice Offers | Providers submit offers, consumers view and select preferred provider |
| Offer Validity | Admin can configure offer validity bounds (15min-2hrs) |
| Earnings Transparency | Providers see exactly what they'll earn when submitting offers |
| Cash Settlement | System tracks cash payments and outstanding platform commission |
| Visual Polish | UI matches mockups - professional, consistent, production-ready |

### What Success Looks Like

- **Investor demo:** "This is a complete platform, not a prototype"
- **Provider says:** "I can see exactly what I'll earn and manage all my requests in one place"
- **Admin says:** "I have full visibility into platform operations and can verify providers efficiently"
- **Consumer says:** (Same as MVP) "I just pressed the button and got my water"

### What Success Does NOT Look Like

- Feature-complete but ugly/inconsistent UI
- Working code but obvious gaps vs mockups
- Technical functionality without production polish

---

## Product Scope

### Baseline: MVP Complete (Epics 1-5)

The following capabilities already exist in production:

**Consumer:**
- Guest water requests (no registration required)
- Registered user requests with profile pre-fill
- Request status tracking (Pending → Accepted → Delivered)
- Request cancellation (pending only)
- Email notifications (guests) + In-app notifications (registered)
- Request history for registered users

**Supplier (Provider):**
- Registration and login (Google OAuth)
- Dashboard to view all incoming requests
- Accept/decline requests
- Mark deliveries as completed
- Profile management

**Platform:**
- PWA (Progressive Web App)
- Supabase backend (auth, database, real-time)
- Vercel deployment
- E2E test coverage (341+ tests)

### V2 Scope: Must-Have Features

**Provider Onboarding & Registration:**
- Self-registration flow with document uploads
- Document types: Cédula, Licencia, Permisos sanitarios, Certificaciones, Vehicle info
- Verification pending state with timeline
- Verification result notification (approved/rejected/more info needed)

**Consumer-Choice Offer System:**
- Providers browse available requests in their service area
- Providers submit offers with price and delivery window
- Offer validity countdown (admin-configurable: 15min-2hrs)
- Consumers view all offers and select preferred provider
- Show earnings when submitting offer: "Ganarás: $X,XXX (después de comisión)"

**Provider Earnings & Settlement:**
- Earnings visibility on dashboard and request detail
- Commission breakdown: Precio total - Comisión (X%) = Tu ganancia
- Cash vs transfer payment tracking
- "Comisión pendiente" tracking for cash transactions
- Withdrawal requests (bank transfer, 1-2 days)

**Admin Dashboard (Core):**
- Admin login via allowlist (Google OAuth)
- Provider verification queue (approve/reject/request more info)
- Provider directory with status management
- Pricing & commission configuration
- Live orders dashboard (list view)
- System settings (acceptance window, distance limits)

**Consumer UX Improvements:**
- Map pinpoint for location confirmation
- Negative status states (cancelled, rejected, failed)
- Payment method selection (cash/transfer)
- Improved urgency pricing display

**Visual Polish:**
- Match all mockup styling exactly
- Consistent component patterns across roles
- Professional, production-ready appearance

### V2 Scope: Nice-to-Have Features

These are documented but NOT required for V2 launch:

| Feature | Description | Defer To |
|---------|-------------|----------|
| Commission tracking dashboard | Detailed commission analytics | V3 |
| Rating enforcement | Automatic warnings → bans | V3 |
| Map view for admin | Live order visualization on map | V3 |
| Theme system | Dark mode, Ghibli themes | Future |
| Route optimization | Suggested delivery routes for providers | Future |
| Push notifications | Native push (currently polling) | Future |
| Offline mode | Full offline capability | Future |

### Vision: Future Features

**V3+ Marketplace Enhancements:**
- Consumer choice between multiple providers
- Provider ratings and reviews
- Dynamic pricing based on demand/availability
- Recurring/subscription orders

**V3+ Operations:**
- Problem resolution queue
- Order history with search/filter
- Consumer directory and management
- Financial reports and exports
- Notification template management

**Beyond Water:**
- Other rural service coordination (gas, propane)
- Geographic expansion beyond Araucanía
- Native mobile apps

---

## User Experience Principles

### Design Philosophy by Role

**Consumer Experience - "Doña María"**
- Ultra-simple, zero-friction
- One-thumb operation in 30 seconds
- Big, obvious "Pedir Agua" button
- Minimal required fields
- Clear status updates without complexity
- Trust signals without fake metrics

**Provider Experience - "Don Pedro"**
- Efficiency-focused power user tools
- Browse all available requests in service area
- Submit offers at own pace (no push pressure)
- Earnings transparency when submitting offers
- Track offer status (pending, accepted, expired)
- Settlement tracking at a glance

**Admin Experience**
- Information-dense, desktop-first
- Quick scanning for issues (overdue, pending verification)
- Batch operations where applicable
- Full platform visibility
- Configuration without complexity

### Visual Identity by Role

| Role | Primary Color | Theme | Target Device |
|------|--------------|-------|---------------|
| Consumer | Blue (#0077B6) | Trust, water, clarity | Mobile-first |
| Provider | Orange (#F97316) | Energy, action, urgency | Mobile + tablet |
| Admin | Gray (#374151) | Professional, neutral | Desktop-first |

### Key Interaction Patterns

**Consumer:**
1. **Big Action Button** - Dominant "Pedir Agua Ahora" CTA
2. **Progressive Form** - 3-step wizard (Contact → Location → Amount)
3. **Map Pinpoint** - Optional geolocation refinement
4. **Offer Selection** - View offers, compare providers, select best fit
5. **Status Timeline** - Visual progress: Esperando Ofertas → Oferta Aceptada → En Camino → Entregado
6. **Negative States** - Clear explanation + next action for failures

**Provider:**
1. **Request Browser** - Browse available requests in service area
2. **Offer Submission** - Price + delivery window + optional message
3. **Earnings Display** - "Ganarás: $X,XXX" when submitting offer
4. **Offer Countdown** - Time remaining on submitted offers
5. **Availability Toggle** - Prominent "Disponible" switch
6. **Settlement Dashboard** - Cash owed, withdrawal requests

**Admin:**
1. **Verification Queue** - Approve/reject/request more info
2. **Provider Directory** - Search, filter, status at a glance
3. **Pricing Configuration** - Tier-based pricing editor
4. **Orders List** - All orders with status filters
5. **Settings Panel** - System configuration

### Critical UX Rules

1. **No dead ends** - Every screen has clear next action
2. **Forgiveness** - Easy to go back, hard to make irreversible mistakes
3. **Progress visibility** - Always show where you are in flows
4. **Human fallback** - Phone numbers visible for when app isn't enough
5. **Earnings transparency** - Provider always knows what they'll make
6. **Trust without fake metrics** - No fabricated social proof

---

## Functional Requirements

This section defines WHAT capabilities the product must have. These requirements are the complete inventory of capabilities that will be designed by UX, supported by Architecture, and implemented by Development.

**Scope Note:** Requirements marked [MVP] already exist. Requirements marked [V2] are new for this version.

---

### Consumer Account & Access

- **FR1** [MVP]: Consumers can submit water requests without creating an account (guest flow)
- **FR2** [MVP]: Consumers can create an account using Google OAuth
- **FR3** [MVP]: Registered consumers can log in and access their saved profile
- **FR4** [MVP]: Registered consumers can update their profile information
- **FR5** [MVP]: Consumers can view their active and past requests
- **FR6** [MVP]: Guest consumers receive a unique tracking link via email

---

### Water Request Submission

- **FR7** [MVP]: Consumers can create a new water request with required information
- **FR8** [MVP]: Water requests must include: name, phone, address, special instructions, water amount
- **FR9** [MVP]: Water requests can optionally include: email, geolocation
- **FR10** [MVP]: Consumers can select water amount from predefined tiers (100L, 1000L, 5000L, 10000L)
- **FR11** [MVP]: Consumers can indicate urgency (standard vs urgent)
- **FR12** [MVP]: Registered consumers see pre-filled information in request form
- **FR13** [MVP]: Consumers can review request details before submitting
- **FR14** [V2]: Consumers can refine their location using a draggable map pin (optional)
- **FR15** [V2]: Consumers can select payment method (cash or bank transfer)
- **FR16** [V2]: Urgent requests display pricing impact ("Urgente - tarifa adicional puede aplicar")

---

### Request Management (Consumer)

- **FR17** [MVP]: Consumers can view request status (Pending, Accepted, En Camino, Delivered)
- **FR18** [MVP]: Consumers can cancel pending requests (before provider accepts)
- **FR19** [MVP]: Consumers cannot cancel once request is accepted
- **FR20** [MVP]: Consumers receive notifications when status changes
- **FR21** [MVP]: Consumers can see assigned provider contact information
- **FR22** [V2]: Consumers see negative status states with clear explanations (Cancelled, Rejected, Failed)
- **FR23** [V2]: Consumers receive "no providers available" notification when all providers decline

---

### Provider Registration & Onboarding

- **FR24** [V2]: Providers can self-register by initiating signup flow
- **FR25** [V2]: Provider registration uses Google OAuth
- **FR26** [V2]: Providers must provide personal information (name, phone, email)
- **FR27** [V2]: Providers must upload required documents (Cédula, Vehicle info, one certification)
- **FR28** [V2]: Providers can optionally upload additional documents (Licencia, Permisos, photos)
- **FR29** [V2]: Providers see verification status (Pending Review, Approved, Rejected, More Info Needed)
- **FR30** [V2]: Providers receive notification of verification decision
- **FR31** [V2]: Rejected providers see reason and can reapply
- **FR32** [V2]: Providers requesting more info see specific document requests

---

### Provider Dashboard & Availability

- **FR33** [MVP]: Providers can view all requests assigned to them
- **FR34** [MVP]: Providers can see request details (customer, location, amount, urgency)
- **FR35** [MVP]: Providers can sort/filter requests by status, urgency, amount
- **FR36** [V2]: Providers can toggle availability status (Disponible/No disponible)
- **FR37** [V2]: Only "Disponible" providers receive incoming requests
- **FR38** [V2]: Providers see simplified dashboard focused on current delivery + earnings

---

### Consumer-Choice Offer System

- **FR39** [V2]: Requests are broadcast to ALL providers in the consumer's service area
- **FR40** [V2]: Providers can browse available requests in their configured service areas
- **FR41** [V2]: Providers can submit offers with price and delivery window
- **FR42** [V2]: Offers include: price, delivery window, optional message
- **FR43** [V2]: Offer validity is admin-configurable (min: 15min, max: 2hrs, default: 30min)
- **FR44** [V2]: Offers show countdown timer until expiration
- **FR45** [V2]: Consumers can view all offers on their request
- **FR46** [V2]: Consumers can select their preferred offer
- **FR47** [V2]: Selected offer becomes assigned delivery; other offers are cancelled
- **FR48** [V2]: If no offers received within 4 hours, consumer notified
- **FR49** [V2]: Expired offers are automatically cleaned up by cron job

---

### Provider Request Handling

- **FR50** [MVP]: Providers can mark assigned requests as delivered
- **FR51** [V2]: Providers see commission breakdown when submitting offers
- **FR52** [V2]: Providers can report problems during delivery (client unavailable, wrong address, etc.)
- **FR53** [V2]: Providers can withdraw pending offers before consumer selects

---

### Provider Earnings & Settlement

- **FR54** [V2]: Providers see earnings dashboard with totals and breakdowns
- **FR55** [V2]: Earnings display shows: gross amount, commission %, net earnings
- **FR56** [V2]: System tracks payment method per delivery (cash vs transfer)
- **FR57** [V2]: Cash deliveries create pending commission balance
- **FR58** [V2]: Providers see outstanding commission debt ("Comisión pendiente")
- **FR59** [V2]: Providers can request withdrawal of available balance
- **FR60** [V2]: Withdrawal requests processed via bank transfer (1-2 days)
- **FR61** [V2]: Providers see age of outstanding debt in dashboard

---

### Provider Profile & Settings

- **FR62** [MVP]: Providers can update profile information
- **FR63** [V2]: Providers can view/update uploaded documents
- **FR64** [V2]: Providers can add bank account for withdrawals
- **FR65** [V2]: Providers can configure offer validity within admin bounds
- **FR66** [V2]: Providers can configure service areas (locality-based: Villarrica, Pucón, etc.)
- **FR67** [V2]: Providers see their account standing (Good, Warning, Suspended, Banned)
- **FR68** [V2]: Providers receive notifications for account status changes

---

### Admin Authentication & Access

- **FR69** [V2]: Admin panel accessible at hidden URL (/admin)
- **FR70** [V2]: Admin authentication uses Google OAuth
- **FR71** [V2]: Only emails in admin allowlist can access admin panel
- **FR72** [V2]: Non-allowlisted emails see rejection message with support contact
- **FR73** [V2]: Admin allowlist managed via database (seeded emails)

---

### Admin Provider Verification

- **FR74** [V2]: Admins can view queue of pending provider applications
- **FR75** [V2]: Admins can view uploaded documents for each application
- **FR76** [V2]: Admins can approve provider applications
- **FR77** [V2]: Admins can reject provider applications with reason
- **FR78** [V2]: Admins can request additional information from applicants
- **FR79** [V2]: Admins can add internal notes to applications

---

### Admin Provider Management

- **FR80** [V2]: Admins can view directory of all providers
- **FR81** [V2]: Admins can search/filter providers by name, status, location
- **FR82** [V2]: Admins can view provider details (profile, documents, earnings, deliveries)
- **FR83** [V2]: Admins can suspend providers (with reason)
- **FR84** [V2]: Admins can unsuspend providers
- **FR85** [V2]: Admins can permanently ban providers (with reason)
- **FR86** [V2]: Admins can set per-provider commission rate

---

### Admin Pricing & Configuration

- **FR87** [V2]: Admins can set platform-wide water prices per tier
- **FR88** [V2]: Admins can configure urgency surcharge percentage
- **FR89** [V2]: Admins can set offer validity bounds (min: 15min, max: 2hrs)
- **FR90** [V2]: Admins can configure request timeout duration (default: 4 hours)
- **FR91** [V2]: Admins can configure service areas (locality list)
- **FR92** [V2]: Price changes take effect immediately for new requests

---

### Admin Orders & Offers Operations

- **FR93** [V2]: Admins can view all orders in list format
- **FR94** [V2]: Admins can filter orders by status, date, provider, consumer
- **FR95** [V2]: Admins can view order details, offers received, and timeline
- **FR96** [V2]: Admins can manually cancel orders if needed
- **FR97** [V2]: Admins can see offer analytics (avg offers per request, acceptance rate)
- **FR98** [V2]: Admins can see provider settlement status (who owes commission)

---

### Admin Settlement Management

- **FR99** [V2]: Admins can view providers with outstanding commission debt
- **FR100** [V2]: Admins can mark commission payments as received
- **FR101** [V2]: Admins can see debt aging (how long outstanding)
- **FR102** [V2]: Admins can issue warnings to delinquent providers

---

### Notifications

- **FR103** [MVP]: System sends email notifications to guest consumers
- **FR104** [MVP]: System shows in-app notifications to registered consumers
- **FR105** [V2]: System notifies consumers when new offers arrive on their request
- **FR106** [V2]: System notifies consumers when offers are about to expire
- **FR107** [V2]: System notifies providers when their offer is selected
- **FR108** [V2]: System notifies providers when their offer expires
- **FR109** [V2]: System notifies providers of verification decisions
- **FR110** [V2]: System notifies providers of account status changes
- **FR111** [V2]: System notifies consumers when no offers received (4hr timeout)

---

### Platform & PWA

- **FR112** [MVP]: Application is accessible as Progressive Web App
- **FR113** [MVP]: Application can be installed to device home screen
- **FR114** [MVP]: Application interface is in Spanish (Chilean)
- **FR115** [MVP]: Application is responsive (mobile, tablet, desktop)
- **FR116** [MVP]: Application handles slow connections gracefully
- **FR117** [V2]: Admin interface optimized for desktop use

---

## Non-Functional Requirements

### Performance

**Why It Matters:** Rural Chilean users have slow/intermittent connections. Realtime offer updates critical.

- **NFR1** [MVP]: Initial page load under 3 seconds on 3G
- **NFR2** [MVP]: Request submission within 5 seconds on 3G
- **NFR3** [MVP]: Dashboard loads within 3 seconds
- **NFR4** [V2]: Realtime offer updates delivered within 2 seconds via Supabase Realtime
- **NFR5** [V2]: Offer countdown timer accurate to ±1 second
- **NFR6** [V2]: Admin dashboard loads within 3 seconds with up to 100 items

### Security

**Why It Matters:** Handling personal data, documents, and financial information.

- **NFR7** [MVP]: All data encrypted via HTTPS
- **NFR8** [MVP]: Passwords/tokens stored securely (Google OAuth handles this)
- **NFR9** [MVP]: Session management with appropriate expiry
- **NFR10** [V2]: Document uploads stored securely with access control
- **NFR11** [V2]: Admin functions protected by allowlist verification
- **NFR12** [V2]: Financial data (earnings, commissions) access-controlled

### Accessibility

**Why It Matters:** Target includes older adults with potential vision/motor limitations.

- **NFR13** [MVP]: Minimum 44x44px touch targets
- **NFR14** [MVP]: WCAG AA color contrast
- **NFR15** [MVP]: One-handed mobile operation
- **NFR16** [V2]: Large, clear countdown timers for providers

### Reliability

**Why It Matters:** Water delivery is essential; platform must be dependable.

- **NFR17** [MVP]: 99% uptime during business hours
- **NFR18** [MVP]: No data loss on submitted requests
- **NFR19** [V2]: Request assignment continues if one provider's connection fails
- **NFR20** [V2]: Settlement data never lost (financial accuracy critical)

### Scalability

**Why It Matters:** Platform expanding to multi-provider marketplace.

- **NFR21** [V2]: Support 50+ concurrent providers
- **NFR22** [V2]: Support 1000+ requests per day
- **NFR23** [V2]: Admin dashboard performant with 1000+ orders

---

## Summary

### PRD V2 Complete

This Product Requirements Document captures the complete vision for nitoagua V2 - a production-ready, multi-provider water delivery coordination platform for rural Chile.

### Requirements Count

| Category | MVP (Existing) | V2 (New) | Total |
|----------|----------------|----------|-------|
| Consumer | 21 | 6 | 27 |
| Provider | 10 | 40 | 50 |
| Admin | 0 | 34 | 34 |
| Platform | 6 | 1 | 7 |
| **Total FRs** | **37** | **80** | **117** |
| **NFRs** | 11 | 12 | 23 |

### What V2 Delivers

1. **Complete Three-Role Platform** - Consumer, Provider, Admin all with polished flows
2. **Provider Lifecycle** - Self-registration → Document upload → Admin verification → Active provider
3. **Consumer-Choice Offer System** - Providers submit offers, consumers select best fit
4. **Earnings Transparency** - Providers always know what they'll make before submitting offers
5. **Settlement Tracking** - Cash commission debt tracked and aged
6. **Admin Operations** - Full platform control via hidden dashboard with offer analytics
7. **Production Polish** - UI matching approved mockups exactly

### The Core Value Proposition

nitoagua V2 transforms a functional MVP into a **production-quality platform** ready for real deployment in Chile's Araucanía region. It replaces scattered WhatsApp messages and phone calls with one coordination point that:

- **Consumers** trust because it's simple and reliable
- **Providers** prefer because they see all requests and know their earnings
- **Admins** control because they have full visibility and configuration

### What Makes This Special

The platform preserves the **human touch** that makes rural Chilean business work while eliminating the chaos of fragmented communications. Providers still call customers, relationships still matter - but the coordination happens in one place.

---

_This PRD captures nitoagua V2 - a production-ready water delivery coordination platform._

_Created through collaborative discovery between Gabe and AI facilitator._

_Reference: UX Mockups (Consumer, Provider, Admin), Architecture Document V2, Original PRD_

_Updated: 2025-12-12 - Aligned with Consumer-Choice Offer Model per Architecture V2_

