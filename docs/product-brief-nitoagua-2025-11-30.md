# Product Brief: nitoagua

**Date:** 2025-11-30
**Author:** Gabe
**Context:** Startup/Social Impact Venture

---

## Executive Summary

nitoagua is a water delivery coordination platform designed for rural Chile. It connects water consumers (rural households) with water suppliers (independent cistern truck operators) through a simple, accessible interface. The platform eliminates the scattered, error-prone process of coordinating water deliveries across WhatsApp, Facebook, and phone calls, replacing it with a single point of contact where consumers can request water and know when it will arrive.

The MVP focuses ruthlessly on the core coordination loop: consumers submit requests, suppliers see them in one place, coordination happens, water gets delivered. No payment processing, no route optimization, no marketplace complexity - just simple, effective coordination.

---

## Core Vision

### Initial Vision

Modernize rural water delivery coordination in Chile by providing a platform that makes requesting water as simple as pressing a button. The goal is to eliminate the search-intensive, memory-dependent, error-prone process that currently frustrates both water consumers and suppliers.

**The driving frustration:** "Chile is ready for this. Nobody is doing it. There's a gap - rural people need services, providers exist, but no simple coordination point. It should be easy."

### Problem Statement

Rural Chilean households depend on cistern truck deliveries to fill their water tanks. Currently, coordinating these deliveries is fragmented and frustrating:

**For Consumers:**
- Must search across old Facebook pages, WhatsApp contacts, and phone numbers
- Contact information becomes outdated (numbers change, pages disappear)
- Must re-explain location and special instructions every time
- No visibility into when water will actually arrive
- Process is memory-dependent and error-prone

**For Suppliers:**
- Customer requests scattered across WhatsApp, Facebook Messenger, and phone calls
- Manual process of writing everything down and figuring out routes
- No single view of all pending requests
- Relies on memory and scattered notes
- Frustrated by the administrative overhead of managing requests

**The Core Issue:** Ad-hoc, fragmented communications across multiple platforms with information stored in scattered places on both sides.

### Why Existing Solutions Fall Short

- **WhatsApp/Facebook:** Not designed for service coordination; messages get lost, no structure
- **Phone calls:** Information not recorded, relies on memory
- **No dedicated platform exists:** Neither suppliers nor consumers know of any solution in the Chilean market
- **General delivery apps:** Don't understand the unique dynamics of rural water delivery (large cistern trucks, household tanks, supplier-led coordination)

### Proposed Solution

A Progressive Web App (PWA) that serves as the single coordination point between water suppliers and consumers:

**For Consumers:** One place to request water, see available suppliers, and know when delivery will arrive. Ultra-simple interface designed for users who aren't tech-savvy.

**For Suppliers:** One dashboard to see ALL customer requests, manage their schedule, and handle coordination. More sophisticated tools for the power users who drive adoption.

**Key Design Principle:** Asymmetric simplicity - sophisticated supplier tools, ultra-simple consumer experience.

### Key Differentiators

1. **No registration barrier for consumers** - Request water without creating an account
2. **Supplier-led adoption** - Suppliers bring their existing customers to the platform
3. **Human touch preserved** - App facilitates coordination but doesn't replace phone calls and personal touch
4. **Designed for rural Chile** - Understands intermittent connectivity, Spanish-first, local context
5. **Request as communication** - The structured request IS the coordination channel

---

## Target Users

### Primary Users

#### Water Consumers (Rural Chilean Households)

**Archetype: "Doña María"** - 58 years old, lives outside Villarrica, Android phone set up by daughter, uses WhatsApp for family

**Characteristics:**
- Order water 1-5x/week OR 2x/month (high variance)
- Mix of planned orders (1-3 days ahead) and urgent same-day needs
- Payment: Cash on delivery, transfer before, or transfer after
- Have Android smartphones but are NOT tech-savvy
- Spanish-speaking, some Mapudungun

**Current Pain:**
- "I need water" → Check contacts → Old pages don't exist → Numbers changed → Frustration
- Must re-explain location and special instructions every time
- No visibility into when water will arrive

**What They Need:**
- "Request Water" button - clear and obvious
- Pre-loaded profile (after first use): name, phone, location, special instructions
- Simple selection: water amount + urgency level
- Confirmation of when water will arrive

#### Water Suppliers (Independent Operators)

**Archetype: "Don Pedro"** - 42 years old, owns cistern truck, one-man operation, tech-comfortable, ~60 customers/month

**Characteristics:**
- Small independent operators (one-man businesses)
- More tech-savvy than consumers - comfortable with apps, PWAs, WhatsApp
- Service area: Large mixed territory (spread rural + clustered villages around Villarrica)
- Purely reactive to requests (no set routes)
- Smart practice: Ask if neighbors need water to maximize truck capacity

**Current Pain:**
- Monday evening planning tomorrow's route
- Requests scattered across WhatsApp, Facebook, phone
- Manual sorting by area, volume, urgency
- No visibility of all requests in one place
- Frustrated by administrative overhead

**What They Need:**
- See ALL requests in ONE place
- View: volume, location, urgency, delivery window
- Ability to accept/schedule requests
- Eventually: route optimization suggestions

### User Journey

**Consumer Flow (MVP):**
1. Open nitoagua (PWA or link from supplier)
2. See supplier's water offerings and prices
3. Submit request: name, phone, address, special instructions, amount needed
4. Wait for supplier to call and confirm
5. Receive confirmation of delivery window
6. Get water delivered

**Supplier Flow (MVP):**
1. Register on platform (town, price tiers)
2. Publish water availability
3. See incoming requests in dashboard
4. Call customer to coordinate details
5. Mark request as "Accepted/Scheduled"
6. Execute delivery

---

## Success Metrics

### MVP Success Criteria

1. **One supplier successfully onboarded** and using the platform instead of scattered messages
2. **5-10 real requests** processed through the platform
3. **Supplier preference validated** - they choose nitoagua over WhatsApp for new requests
4. **Consumer completion rate** - requests submitted successfully without abandonment
5. **Coordination loop works** - request → acceptance → delivery happens smoothly

### Key Performance Indicators

**Adoption:**
- Number of active suppliers
- Number of requests per supplier per week
- Consumer return rate (repeat requests)

**Engagement:**
- Request completion rate
- Time from request to supplier response
- Supplier login frequency

**Satisfaction:**
- Supplier Net Promoter Score
- Consumer feedback (qualitative)
- Platform vs. WhatsApp preference

---

## MVP Scope

### Core Features

**Consumer Side:**
- Request water WITH or WITHOUT registration
- Required fields: Name, Phone, Address, Special Instructions, Amount
- Optional fields: Email, Geolocation
- View request status (Pending → Accepted)
- Cancel request ONLY if not yet accepted by supplier

**Supplier Side:**
- Register with town/region and price tiers (4 tiers: 100L, 1000L, 5000L, 10000L)
- Publish water availability with prices
- Dashboard to view all incoming requests
- Accept/schedule requests
- Mark deliveries as completed

**Platform Core:**
- PWA (Progressive Web App) - works on any device with browser
- Request status flow: Pending → Accepted → Delivered
- Basic notification system (email for guests, in-app for registered)

### Out of Scope for MVP

- Route optimization
- Multiple suppliers / marketplace
- Payment processing
- Push notifications (supplier checks app manually)
- Recurring/subscription orders
- Capacity tracking
- Multi-day scheduling views
- Native mobile app

### Future Vision

**v2 - Route Optimization:**
- Map view of pending requests
- Suggested delivery order
- Route planning tools
- "Neighbor bundling" - notify nearby consumers when delivery is coming

**v3+ - Marketplace & Scale:**
- Multiple suppliers per region
- Consumer choice between suppliers
- Payment processing integration
- Urgency-based dynamic pricing
- Supplier ratings and reviews
- Offline caching for intermittent connectivity
- Native mobile apps

---

## Technical Preferences

**Platform Decision:** PWA first, native Android app later

**Rationale:**
- Works on any smartphone with browser
- No app store approval needed
- Easier to iterate quickly
- Can be "installed" on home screen

**Connectivity Considerations:**
- Reliable but intermittent in some areas
- Design for graceful degradation
- Core info should work, advanced features need internet

**Location:**
- Google Maps integration for addresses
- Custom instructions field for "past the bridge" directions
- Geolocation optional but encouraged

**Language:**
- Spanish primary
- Mapudungun nice-to-have for future

---

## Risks and Assumptions

### Key Assumptions

1. **Suppliers will adopt** - They're frustrated enough with current chaos to try something new
2. **Consumers will use supplier's recommendation** - Supplier-led adoption will work
3. **PWA is sufficient** - No need for native app initially
4. **One supplier is enough to validate** - Can learn from single-supplier pilot

### Key Risks

1. **Supplier resistance** - "My WhatsApp works fine" mentality
   - *Mitigation:* Focus on the pain of scattered messages, offer to help onboard

2. **Consumer tech barrier** - Too difficult for non-tech-savvy users
   - *Mitigation:* Supplier-assisted onboarding, ultra-simple interface

3. **Chicken-and-egg** - No consumers without suppliers, no suppliers without consumers
   - *Mitigation:* Supplier brings existing customers, solves cold-start problem

4. **Connectivity issues** - Platform unusable in poor connectivity areas
   - *Mitigation:* PWA with offline considerations, graceful degradation

### Open Questions

1. How will consumers find the platform initially if suppliers bring them?
2. What happens if supplier never responds to a request? (Expiration?)
3. How to handle disputes if they arise?
4. Domain: nitoagua.cl available?

---

## Market Context

**Geography:** Villarrica region, Chile (pilot market)

**Market Dynamics:**
- Rural households with water tanks dependent on cistern truck deliveries
- Small independent water suppliers (one-man operations)
- No known competitors in this specific niche
- Existing behavior: WhatsApp, Facebook, phone calls

**Expansion Path:**
- Villarrica pilot → Other Chilean regions with similar dynamics
- Water delivery → Other rural service coordination (gas, propane, etc.)

**Business Model (Future):**
- Commission per delivery (implement after proving value)
- Focus on adoption and value creation first

---

## Supporting Materials

### Incorporated Research

This product brief synthesizes insights from a comprehensive brainstorming session conducted on 2025-11-30, which included:

- **Role Playing** - Walked through both consumer ("Doña María") and supplier ("Don Pedro") perspectives
- **First Principles Thinking** - Stripped requirements to fundamental needs
- **Resource Constraints** - Stress-tested for simplicity (30-second one-thumb use, driving supplier, 2G internet)

**Key Session Insights:**
1. The MVP is shockingly simple - One supplier, 4 price tiers, basic request form
2. Coordination > Automation - App facilitates, supplier handles human coordination
3. Registration is optional friction - Consumers can request without accounts
4. Cancel rules create commitment - Once accepted, consumer can't cancel
5. Supplier is the power user - Design their experience for efficiency
6. Consumer experience is "set and forget" - Submit request, wait for call, done

---

_This Product Brief captures the vision and requirements for nitoagua._

_It was created through collaborative discovery and reflects the unique needs of this startup/social impact project._

_Next: PRD workflow will transform this brief into detailed product requirements._
