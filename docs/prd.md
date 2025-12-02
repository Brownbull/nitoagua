# nitoagua - Product Requirements Document

**Author:** Gabe
**Date:** 2025-12-01
**Version:** 1.0

---

## Executive Summary

nitoagua is a water delivery coordination platform for rural Chile that solves the fragmented, frustrating process of connecting water consumers with cistern truck operators. Currently, rural households must search through old Facebook pages, outdated WhatsApp contacts, and unreliable phone numbers just to request water delivery - re-explaining their location and special instructions every time. Suppliers face the mirror image: customer requests scattered across multiple platforms with no single view of pending deliveries.

nitoagua provides a single point of contact. Consumers submit structured requests (no registration required), suppliers see ALL requests in one dashboard, and coordination happens smoothly. The platform facilitates human coordination - it doesn't replace the phone calls and personal touch that make rural Chilean business work.

**The driving vision:** "Chile is ready for this. Nobody is doing it. There's a gap - rural people need services, providers exist, but no simple coordination point. It should be easy."

### What Makes This Special

**Asymmetric Simplicity:** The platform delivers sophisticated tools for tech-comfortable suppliers while maintaining an ultra-simple "Request Water" experience for consumers who may struggle with technology.

**Key differentiators:**
1. **No registration barrier** - Consumers can request water without creating an account
2. **Supplier-led adoption** - Suppliers bring their existing customers to the platform, solving the chicken-and-egg problem
3. **Human touch preserved** - The app facilitates coordination but doesn't replace phone calls and personal relationships
4. **Request as communication** - The structured request IS the coordination channel, eliminating scattered messages
5. **Designed for rural Chile** - Spanish-first, understands intermittent connectivity, respects local context

---

## Project Classification

**Technical Type:** web_app (Progressive Web App)
**Domain:** general (logistics/coordination)
**Complexity:** low

This is a B2B2C logistics coordination platform with marketplace dynamics, but the MVP focuses on single-supplier operation to validate the core coordination loop before adding marketplace complexity. The web_app classification reflects the PWA-first technical approach, while the low domain complexity indicates no specialized regulatory or compliance requirements beyond standard web application practices.

**Classification Rationale:**
- Detection signals matched: "webapp", "PWA", "browser"
- No high-complexity domain signals (not healthcare/fintech/govtech)
- Core challenge is user experience and adoption, not regulatory compliance
- Technical complexity is moderate - standard CRUD operations with some location/mapping integration

---

## Success Criteria

Success for nitoagua MVP is NOT about big numbers - it's about proving the coordination loop works and creates real value.

**Primary Success Metric:**
> One supplier successfully uses nitoagua instead of WhatsApp for incoming requests, and actively prefers it.

**Validation Milestones:**

1. **Supplier Adoption** - One real supplier onboarded and using the platform for 2+ weeks
2. **Consumer Completion** - 5-10 real water requests successfully submitted through the platform
3. **Supplier Preference** - Supplier chooses to direct new customers to nitoagua over WhatsApp
4. **Loop Completion** - Request → Acceptance → Delivery happens smoothly at least 5 times
5. **Consumer Return** - At least one consumer uses the platform for a repeat request

**What Success Looks Like:**
- Supplier says: "This is so much easier than checking 3 different apps for messages"
- Consumer says: "I just pressed the button and they called me back with a time"
- Both parties complete the transaction without needing to fall back to scattered communications

**What Success Does NOT Look Like:**
- Vanity metrics (downloads, page views)
- Time-based projections ("10,000 users in 6 months")
- Feature completeness ("we built everything on the roadmap")

---

## Product Scope

### MVP - Minimum Viable Product

The MVP is intentionally brutal in its simplicity. ONE supplier. Basic request flow. Prove the loop works.

**Consumer Capabilities:**
- Request water WITHOUT registration (guest flow)
- Request water WITH optional registration (faster repeat orders)
- Provide: Name, Phone, Address, Special Instructions, Water Amount
- Optional: Email (for notifications), Geolocation
- View request status: Pending → Accepted → Delivered
- Cancel request ONLY if not yet accepted by supplier

**Supplier Capabilities:**
- Register with location (town/region) and price tiers
- Four standard price tiers: 100L, 1000L, 5000L, 10000L
- Publish water availability with prices
- Dashboard to view ALL incoming requests in one place
- Accept/schedule requests
- Mark deliveries as completed

**Platform Capabilities:**
- Progressive Web App (works on any device with browser)
- Request status flow: Pending → Accepted → Delivered
- Basic notification: email for guests, in-app for registered users
- Spanish language interface

**Explicit MVP Constraints:**
- ONE supplier only (no marketplace)
- NO payment processing (cash/transfer handled externally)
- NO route optimization
- NO push notifications (supplier checks app manually)
- NO recurring/subscription orders
- NO native mobile app
- NO capacity tracking
- NO multi-day scheduling views

### Growth Features (Post-MVP)

**v2 - Route Optimization:**
- Map view of pending requests
- Suggested delivery order based on location clusters
- Route planning tools
- "Neighbor bundling" - notify nearby consumers when delivery is coming
- Multi-day schedule view for suppliers

**v2.5 - Consumer Enhancements:**
- Pre-filled profiles from previous orders (smart defaults)
- Urgency-based pricing tiers
- Order history and repeat-order shortcuts
- Clearer delivery time windows

### Vision (Future)

**v3+ - Marketplace & Scale:**
- Multiple suppliers per region (true marketplace)
- Consumer choice between suppliers
- Payment processing integration
- Dynamic pricing based on urgency/availability
- Supplier ratings and reviews
- Offline caching for intermittent connectivity
- Push notifications
- Native Android app

**Beyond Water:**
- Expand to other rural service coordination (gas, propane, etc.)
- Geographic expansion beyond Villarrica to other Chilean regions
- Business model: commission per delivery (after proving value)

---

## web_app Specific Requirements

This section captures requirements specific to the Progressive Web App platform choice.

### Platform Requirements

**Browser Support:**
- Chrome for Android (primary - 90%+ of target users)
- Safari for iOS (secondary)
- Desktop browsers for supplier dashboard work

**PWA Capabilities:**
- Installable on home screen ("Add to Home Screen")
- Works without app store approval
- Fast iteration and deployment
- Service worker for basic caching

**Responsive Design:**
- Mobile-first for consumers (Android phones)
- Tablet/desktop-friendly for supplier dashboard
- Touch-optimized interactions

### Connectivity Considerations

**Design for Rural Chile:**
- Core functionality must work on slow/intermittent connections
- Graceful degradation when offline
- Minimize data transfer (no heavy images/videos)
- Request submission should queue if connection drops

**What Requires Connectivity:**
- Submitting new requests
- Receiving request notifications
- Real-time status updates

**What Should Work Offline:**
- Viewing previously loaded request details
- Accessing supplier contact info
- Viewing own profile/address info

### Location & Mapping

**Address Handling:**
- Google Maps integration for address lookup
- Custom "special instructions" field mandatory (for "past the bridge" directions)
- Geolocation optional but encouraged
- Store coordinates for future route optimization

**Why This Matters:**
Rural Chilean addresses often don't map cleanly to Google Maps. The special instructions field is critical - it captures the human-readable directions that actually get drivers to the right place.

### Language & Localization

**Primary:** Spanish (Chile)
**Interface Copy:** Natural Chilean Spanish, not formal/corporate
**Future:** Mapudungun support (nice-to-have for indigenous communities)

---

## User Experience Principles

### Design Philosophy

**Asymmetric Simplicity:**
The core UX principle is that supplier and consumer experiences are fundamentally different:

- **Consumers:** Ultra-simple, zero-friction, one-thumb operation in 30 seconds
- **Suppliers:** Feature-rich dashboard, efficiency-focused, power-user tools

This asymmetry is intentional. Suppliers are tech-comfortable and need comprehensive tools. Consumers may struggle with technology and need absolute simplicity.

### Visual Personality

**Overall Vibe:** Clean, trustworthy, approachable
- NOT corporate/enterprise feeling
- NOT overly playful/gamified
- Feels like a helpful local service, not a tech startup

**Color Approach:**
- Water-inspired blues for trust and clarity
- High contrast for readability in outdoor/bright conditions
- Large touch targets for ease of use

### Key Interactions

**Consumer Side - "Doña María" Experience:**

1. **Request Water (Primary Action)**
   - Biggest, most obvious button on the screen
   - One tap to start the request flow
   - Pre-filled fields for registered users
   - Minimal required fields for guests

2. **Status Check**
   - Simple visual: Pending → Accepted → Delivered
   - No complex timeline or tracking
   - Clear "what happens next" messaging

3. **Cancel Request**
   - Available ONLY when status = Pending
   - Disappears once supplier accepts (protects supplier commitment)

**Supplier Side - "Don Pedro" Experience:**

1. **Request Dashboard**
   - ALL requests visible in one view
   - Key info at a glance: location, amount, urgency, when submitted
   - Sort/filter by area, urgency, volume
   - Batch actions for efficiency

2. **Accept/Schedule Flow**
   - One-tap accept
   - Optional: add delivery window
   - System handles consumer notification

3. **Completion Tracking**
   - Mark deliveries as completed
   - Simple daily/weekly view of completed deliveries

### Critical UX Rules

1. **No dead ends** - Every screen has a clear next action
2. **Forgiveness** - Easy to go back, hard to make irreversible mistakes
3. **Progress visibility** - Always show where you are in any flow
4. **Human fallback** - Phone numbers always visible for when app isn't enough

---

## Functional Requirements

This section defines WHAT capabilities the product must have. These are the complete inventory of user-facing and system capabilities that deliver the product vision.

**How These Will Be Used:**
- UX Designer reads FRs → designs interactions for each capability
- Architect reads FRs → designs systems to support each capability
- PM reads FRs → creates epics and stories to implement each capability

### Consumer Account & Access

- **FR1:** Consumers can submit water requests without creating an account (guest flow)
- **FR2:** Consumers can optionally create an account with email and password
- **FR3:** Registered consumers can log in and access their saved profile
- **FR4:** Registered consumers can update their profile information (name, phone, address, special instructions)
- **FR5:** Consumers can view their active and past requests
- **FR6:** Guest consumers receive a unique link (via email) to track their request status

### Water Request Submission

- **FR7:** Consumers can create a new water request specifying required information
- **FR8:** Water requests must include: name, phone number, address, special instructions, water amount
- **FR9:** Water requests can optionally include: email, geolocation coordinates
- **FR10:** Consumers can select water amount from predefined tiers (100L, 1000L, 5000L, 10000L)
- **FR11:** Consumers can add urgency indication to their request (standard vs. urgent)
- **FR12:** Registered consumers see their saved information pre-filled in the request form
- **FR13:** Consumers can review their request details before submitting

### Request Management (Consumer)

- **FR14:** Consumers can view the current status of their request (Pending, Accepted, Delivered)
- **FR15:** Consumers can cancel a pending request (status = Pending only)
- **FR16:** Consumers cannot cancel a request once it has been accepted by a supplier
- **FR17:** Consumers receive notification when their request status changes (email for guests, in-app for registered)
- **FR18:** Consumers can see which supplier accepted their request and their contact information

### Supplier Registration & Profile

- **FR19:** Suppliers can register an account with business information
- **FR20:** Suppliers must specify their service area (town/region)
- **FR21:** Suppliers can set their water prices for each tier (100L, 1000L, 5000L, 10000L)
- **FR22:** Suppliers can update their profile and pricing information
- **FR23:** Suppliers can mark themselves as available or unavailable (vacation mode)

### Supplier Request Dashboard

- **FR24:** Suppliers can view all incoming water requests in a single dashboard
- **FR25:** Suppliers can see request details: customer name, phone, address, special instructions, amount, urgency, submission time
- **FR26:** Suppliers can sort requests by submission time, urgency, or water amount
- **FR27:** Suppliers can filter requests by status (pending, accepted, delivered)
- **FR28:** Suppliers can view customer location on a map (when geolocation provided)

### Request Handling (Supplier)

- **FR29:** Suppliers can accept a pending request
- **FR30:** Suppliers can optionally add a delivery window when accepting (e.g., "Tomorrow 2-4pm")
- **FR31:** Suppliers can mark an accepted request as delivered
- **FR32:** Suppliers can decline a request with a reason (optional)
- **FR33:** Declined requests return to pending status (available for other suppliers in future marketplace)

### Notifications & Communication

- **FR34:** System sends email notification to guest consumers when request status changes
- **FR35:** System shows in-app notification to registered consumers when request status changes
- **FR36:** Supplier contact information (phone) is visible to consumers after request is accepted
- **FR37:** Consumer contact information (phone) is visible to suppliers for accepted requests

### Platform & PWA

- **FR38:** Application is accessible as a Progressive Web App on any modern browser
- **FR39:** Application can be installed to device home screen
- **FR40:** Application interface is fully in Spanish (Chilean)
- **FR41:** Application is responsive and works on mobile phones, tablets, and desktop
- **FR42:** Application displays properly on slow connections (progressive loading)

### Data & Privacy

- **FR43:** Consumer personal information is only visible to suppliers who have accepted their request
- **FR44:** Consumers can request deletion of their account and associated data
- **FR45:** Request history is retained for reference (configurable retention period)

---

## Non-Functional Requirements

### Performance

**Why It Matters:** Rural Chilean users often have slow/intermittent connections. A slow app means abandoned requests.

- **NFR1:** Initial page load under 3 seconds on 3G connection
- **NFR2:** Request submission completes within 5 seconds on 3G connection
- **NFR3:** Dashboard loads all pending requests within 3 seconds
- **NFR4:** Application remains responsive during slow network conditions (no freezing/blocking)

### Security

**Why It Matters:** Handling personal information (phone numbers, addresses) requires basic security hygiene.

- **NFR5:** All data transmission encrypted via HTTPS
- **NFR6:** Passwords stored using industry-standard hashing (bcrypt or similar)
- **NFR7:** Session tokens expire after reasonable inactivity period
- **NFR8:** Rate limiting on authentication endpoints to prevent brute force
- **NFR9:** Input validation on all user-submitted data

### Accessibility

**Why It Matters:** Target users include older adults with potential vision/motor limitations.

- **NFR10:** Minimum touch target size of 44x44 pixels
- **NFR11:** Color contrast meets WCAG AA standards
- **NFR12:** Text size scalable without breaking layout
- **NFR13:** Core functionality usable with one hand on mobile device

### Reliability

**Why It Matters:** Water delivery is essential - the platform must be dependable.

- **NFR14:** Target 99% uptime during business hours (6am-10pm Chile time)
- **NFR15:** No data loss on submitted requests
- **NFR16:** Graceful error handling with user-friendly messages
- **NFR17:** Request submission queues locally if connection drops, sends when restored

---

## Summary

**PRD Complete for nitoagua**

This Product Requirements Document captures the vision, scope, and requirements for nitoagua - a water delivery coordination platform for rural Chile.

**What We've Defined:**
- **45 Functional Requirements** covering consumer flows, supplier dashboard, request lifecycle, and platform capabilities
- **17 Non-Functional Requirements** for performance, security, accessibility, and reliability
- **Clear MVP scope** focused on single-supplier operation to validate the coordination loop
- **UX principles** emphasizing asymmetric simplicity between supplier and consumer experiences

**The Core Value Proposition:**
nitoagua replaces scattered WhatsApp messages, outdated Facebook pages, and forgotten phone numbers with one simple coordination point. Consumers press "Request Water" and know when their delivery will arrive. Suppliers see ALL requests in one dashboard instead of hunting through multiple apps.

**What Makes This Special:**
The platform preserves the human touch that makes rural Chilean business work while eliminating the chaos of fragmented communications. It's not trying to automate away relationships - it's giving them a better foundation.

---

_This PRD captures the essence of nitoagua - simple coordination that respects how rural Chile actually works._

_Created through collaborative discovery between Gabe and AI facilitator._

_Next: Architecture workflow will define the technical approach. UX Design workflow will create the interaction design._
