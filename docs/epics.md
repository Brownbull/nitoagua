# nitoagua - Epic Breakdown

**Author:** Gabe
**Date:** 2025-12-01
**Project Level:** MVP
**Target Scale:** Single supplier pilot in Villarrica region, Chile

---

## Overview

This document provides the complete epic and story breakdown for nitoagua, decomposing the requirements from the [PRD](./prd.md) into implementable stories.

**Living Document Notice:** This version incorporates UX Design and Architecture context for detailed implementation guidance.

**Context Incorporated:**
- ✅ PRD - 45 Functional Requirements + 17 NFRs
- ✅ UX Design - Agua Pura theme, Big Button consumer experience, Card-based supplier dashboard
- ✅ Architecture - Next.js 15 + Supabase + shadcn/ui + Resend

### Epic Summary

| Epic | Title | Stories | User Value |
|------|-------|---------|------------|
| 1 | Foundation & Infrastructure | 5 | Project setup enabling all features |
| 2 | Consumer Water Request | 6 | Consumer can request water and track status |
| 3 | Supplier Dashboard & Request Management | 7 | Supplier can view and manage all requests |
| 4 | User Accounts & Profiles | 5 | Registered users get faster repeat orders |
| 5 | Notifications & Communication | 3 | Automated status updates via email |

**Total:** 5 Epics, 26 Stories

---

## Functional Requirements Inventory

### Consumer Account & Access (FR1-FR6)
- **FR1:** Consumers can submit water requests without creating an account (guest flow)
- **FR2:** Consumers can optionally create an account with email and password
- **FR3:** Registered consumers can log in and access their saved profile
- **FR4:** Registered consumers can update their profile information
- **FR5:** Consumers can view their active and past requests
- **FR6:** Guest consumers receive a unique link (via email) to track their request status

### Water Request Submission (FR7-FR13)
- **FR7:** Consumers can create a new water request specifying required information
- **FR8:** Water requests must include: name, phone, address, special instructions, water amount
- **FR9:** Water requests can optionally include: email, geolocation coordinates
- **FR10:** Consumers can select water amount from predefined tiers (100L, 1000L, 5000L, 10000L)
- **FR11:** Consumers can add urgency indication to their request (standard vs. urgent)
- **FR12:** Registered consumers see their saved information pre-filled in the request form
- **FR13:** Consumers can review their request details before submitting

### Request Management - Consumer (FR14-FR18)
- **FR14:** Consumers can view the current status of their request (Pending, Accepted, Delivered)
- **FR15:** Consumers can cancel a pending request (status = Pending only)
- **FR16:** Consumers cannot cancel a request once it has been accepted
- **FR17:** Consumers receive notification when their request status changes
- **FR18:** Consumers can see which supplier accepted their request and contact info

### Supplier Registration & Profile (FR19-FR23)
- **FR19:** Suppliers can register an account with business information
- **FR20:** Suppliers must specify their service area (town/region)
- **FR21:** Suppliers can set their water prices for each tier
- **FR22:** Suppliers can update their profile and pricing information
- **FR23:** Suppliers can mark themselves as available or unavailable (vacation mode)

### Supplier Request Dashboard (FR24-FR28)
- **FR24:** Suppliers can view all incoming water requests in a single dashboard
- **FR25:** Suppliers can see request details: customer info, address, amount, urgency, time
- **FR26:** Suppliers can sort requests by submission time, urgency, or water amount
- **FR27:** Suppliers can filter requests by status (pending, accepted, delivered)
- **FR28:** Suppliers can view customer location on a map (when geolocation provided)

### Request Handling - Supplier (FR29-FR33)
- **FR29:** Suppliers can accept a pending request
- **FR30:** Suppliers can optionally add a delivery window when accepting
- **FR31:** Suppliers can mark an accepted request as delivered
- **FR32:** Suppliers can decline a request with a reason (optional)
- **FR33:** Declined requests return to pending status

### Notifications & Communication (FR34-FR37)
- **FR34:** System sends email notification to guest consumers when request status changes
- **FR35:** System shows in-app notification to registered consumers when status changes
- **FR36:** Supplier contact info visible to consumers after request is accepted
- **FR37:** Consumer contact info visible to suppliers for accepted requests

### Platform & PWA (FR38-FR42)
- **FR38:** Application is accessible as a Progressive Web App on any modern browser
- **FR39:** Application can be installed to device home screen
- **FR40:** Application interface is fully in Spanish (Chilean)
- **FR41:** Application is responsive and works on mobile, tablets, and desktop
- **FR42:** Application displays properly on slow connections (progressive loading)

### Data & Privacy (FR43-FR45)
- **FR43:** Consumer personal info only visible to suppliers who accepted their request
- **FR44:** Consumers can request deletion of their account and associated data
- **FR45:** Request history is retained for reference (configurable retention period)

---

## FR Coverage Map

| Epic | FRs Covered |
|------|-------------|
| Epic 1: Foundation | Infrastructure for all FRs (FR38-FR42 partially) |
| Epic 2: Consumer Request | FR1, FR6, FR7, FR8, FR9, FR10, FR11, FR13, FR14, FR17, FR18, FR38, FR39, FR40, FR41, FR42 |
| Epic 3: Supplier Dashboard | FR19, FR20, FR21, FR22, FR23, FR24, FR25, FR26, FR27, FR28, FR29, FR30, FR31, FR32, FR33, FR37 |
| Epic 4: User Accounts | FR2, FR3, FR4, FR5, FR12, FR15, FR16, FR35, FR43, FR44, FR45 |
| Epic 5: Notifications | FR34, FR35, FR36 |

---

## Epic 1: Foundation & Infrastructure

**Goal:** Establish the technical foundation that enables all subsequent feature development. This is a greenfield project requiring project initialization, database setup, authentication infrastructure, and deployment pipeline.

**User Value:** While consumers and suppliers won't directly interact with this epic, it creates the foundation that makes ALL other features possible. Without this, nothing else works.

**FRs Addressed:** Infrastructure supporting all 45 FRs, directly implementing FR38-FR42 (PWA platform requirements)

---

### Story 1.1: Project Initialization

As a **developer**,
I want **the Next.js project initialized with all core dependencies**,
So that **I have a working development environment to build features**.

**Acceptance Criteria:**

**Given** an empty project directory
**When** project initialization is complete
**Then** the following structure exists:
- Next.js 15.1 with App Router, TypeScript, Tailwind CSS, ESLint
- `src/` directory structure with `@/*` import alias
- shadcn/ui initialized with Agua Pura theme colors
- Core dependencies installed: `@supabase/supabase-js`, `@supabase/ssr`, `zod`, `date-fns`
- shadcn/ui components: button, card, input, textarea, select, dialog, toast, badge, tabs, form
- `.env.local.example` with all required environment variables documented

**And** running `npm run dev` starts the development server without errors
**And** running `npm run build` completes successfully

**Prerequisites:** None (first story)

**Technical Notes:**
- Execute: `npx create-next-app@latest nitoagua --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`
- Configure shadcn/ui with custom theme from UX spec (Primary: #0077B6, Secondary: #00A8E8)
- Use system fonts for performance: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`

---

### Story 1.2: Supabase Database Setup

As a **developer**,
I want **the Supabase database schema created with all required tables**,
So that **the application can persist user and request data**.

**Acceptance Criteria:**

**Given** a Supabase project is created
**When** the initial migration is run
**Then** the following tables exist:
- `profiles` table with fields: id (UUID, FK to auth.users), role (consumer/supplier), name, phone, address, special_instructions, service_area, price tiers, is_available, timestamps
- `water_requests` table with fields: id (UUID), consumer_id, guest fields, tracking_token, address, special_instructions, coordinates, amount, is_urgent, status, supplier_id, delivery_window, decline_reason, timestamps

**And** Row Level Security is enabled on both tables
**And** RLS policies implement data isolation per Architecture spec
**And** Indexes exist on: status, supplier_id, consumer_id, tracking_token

**Prerequisites:** Story 1.1

**Technical Notes:**
- Migration file: `supabase/migrations/001_initial_schema.sql`
- Use `gen_random_uuid()` for UUIDs
- Status enum: 'pending', 'accepted', 'delivered', 'cancelled'
- Amount constraint: CHECK (amount IN (100, 1000, 5000, 10000))
- Generate TypeScript types: `npx supabase gen types typescript`

---

### Story 1.3: Supabase Authentication Integration

As a **developer**,
I want **Supabase Auth configured for the application**,
So that **users can register and log in securely**.

**Acceptance Criteria:**

**Given** Supabase Auth is configured
**When** authentication is integrated with Next.js
**Then** the following files exist and function:
- `src/lib/supabase/client.ts` - Browser client for client components
- `src/lib/supabase/server.ts` - Server client for server components and API routes
- `src/lib/supabase/middleware.ts` - Auth middleware for session management
- `src/middleware.ts` - Next.js middleware using Supabase auth

**And** session cookies are properly managed (refresh, expiration)
**And** auth state is accessible in both server and client components
**And** rate limiting is configured on auth endpoints (5 attempts/hour/IP)

**Prerequisites:** Story 1.2

**Technical Notes:**
- Use `@supabase/ssr` for cookie-based auth with Next.js App Router
- Configure Supabase Auth for email/password (magic links optional for MVP)
- JWT expiration: 7 days access token, 30 days refresh token

---

### Story 1.4: PWA Configuration

As a **consumer**,
I want **to install nitoagua on my phone's home screen**,
So that **I can access it like a native app without the app store**.

**Acceptance Criteria:**

**Given** a user visits nitoagua on a mobile browser
**When** they choose "Add to Home Screen"
**Then** the app installs with:
- App name: "nitoagua"
- Short name: "nitoagua"
- Theme color: #0077B6 (Ocean Blue)
- Background color: #ffffff
- Display mode: standalone
- Icons: 192x192 and 512x512 PNG

**And** the app opens in standalone mode (no browser chrome)
**And** a basic service worker caches static assets
**And** the app shell loads in < 3 seconds on 3G connection

**Prerequisites:** Story 1.1

**Technical Notes:**
- Create `src/app/manifest.ts` with PWA configuration
- Create `public/sw.js` with basic caching strategy (cache-first for static assets)
- Create `public/icons/` with icon-192.png and icon-512.png
- Register service worker in root layout

---

### Story 1.5: Deployment Pipeline

As a **developer**,
I want **automatic deployment to Vercel on git push**,
So that **changes are deployed to production automatically**.

**Acceptance Criteria:**

**Given** the repository is connected to Vercel
**When** code is pushed to the main branch
**Then** the following happens:
- Build runs automatically
- TypeScript compilation succeeds
- ESLint passes with no errors
- Production deployment completes

**And** environment variables are configured in Vercel dashboard
**And** preview deployments are created for pull requests
**And** production URL is accessible with HTTPS

**Prerequisites:** Story 1.1

**Technical Notes:**
- Connect GitHub repo to Vercel
- Configure environment variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
- Use Vercel's automatic HTTPS and CDN

---

## Epic 2: Consumer Water Request

**Goal:** Enable consumers to request water through a simple, accessible interface without requiring registration. This is the core consumer experience - "press the button, get called back."

**User Value:** Consumers can finally request water from one simple interface instead of hunting through WhatsApp, Facebook, and phone contacts. Guest flow means zero barrier to first use.

**FRs Addressed:** FR1, FR6, FR7, FR8, FR9, FR10, FR11, FR13, FR14, FR17, FR18, FR38, FR39, FR40, FR41, FR42

---

### Story 2.1: Consumer Home Screen with Big Action Button

As a **consumer (Doña María)**,
I want **to see one big obvious button to request water**,
So that **I know exactly what to do when I open the app**.

**Acceptance Criteria:**

**Given** a consumer opens nitoagua
**When** the home page loads
**Then** they see:
- A dominant circular button (200x200px) with "Solicitar Agua" text
- Water drop icon (48x48px) inside the button
- Blue gradient background (primary #0077B6 to secondary #00A8E8)
- Subtle shadow for depth
- Clean, uncluttered layout

**And** the button has the following states:
- Hover/Focus: Scale 1.05, enhanced shadow
- Active: Scale 0.98, darker gradient
- Loading: Pulse animation

**And** tapping the button navigates to the request form
**And** the page is fully in Spanish (Chilean)
**And** touch target is minimum 44x44px (WCAG AA)

**Prerequisites:** Story 1.4 (PWA configured)

**Technical Notes:**
- Create `src/app/(consumer)/page.tsx` as the consumer home
- Create `src/components/consumer/big-action-button.tsx` custom component
- Use Tailwind for responsive sizing and animations
- Bottom navigation with 3 items: Home, History, Profile (icons + labels)

---

### Story 2.2: Water Request Form (Guest Flow)

As a **consumer (guest)**,
I want **to submit a water request without creating an account**,
So that **I can get water delivered with minimal friction**.

**Acceptance Criteria:**

**Given** a guest consumer taps "Solicitar Agua"
**When** the request form loads
**Then** they see a form with these fields:
- Name (required, text input)
- Phone (required, format: +56912345678, with validation hint)
- Email (required for guests, for tracking link)
- Address (required, text input with Google Maps autocomplete option)
- Special Instructions (required, textarea, "past the bridge" type directions)
- Water Amount (required, AmountSelector grid: 100L, 1000L, 5000L, 10000L with prices)
- Urgency (optional, toggle between "Normal" and "Urgente")
- Geolocation (optional, "Use my location" button)

**And** each field shows validation errors below the field in red (#EF4444)
**And** required fields are marked with asterisk (*)
**And** phone validation accepts Chilean format (+56 9 XXXX XXXX)
**And** form submits to POST /api/requests

**Prerequisites:** Story 2.1, Story 1.2

**Technical Notes:**
- Create `src/app/(consumer)/request/page.tsx`
- Create `src/components/consumer/request-form.tsx`
- Create `src/components/consumer/amount-selector.tsx` (2x2 grid)
- Use React Hook Form + Zod for validation
- Schema: `src/lib/validations/request.ts`
- Chilean phone regex: `/^\+56[0-9]{9}$/`

---

### Story 2.3: Request Review and Submission

As a **consumer**,
I want **to review my request before submitting**,
So that **I can catch any mistakes before it's sent**.

**Acceptance Criteria:**

**Given** a consumer has filled out the request form
**When** they tap "Revisar Solicitud"
**Then** they see a review screen showing:
- All entered information formatted clearly
- Water amount with price displayed
- Urgency status if selected
- "Editar" button to go back
- "Enviar Solicitud" button to submit

**And** when they tap "Enviar Solicitud":
- Loading spinner shows on button
- Request is submitted to API
- On success: Navigate to confirmation screen
- On error: Toast notification with retry option

**And** if connection fails, request is queued locally and submitted when online

**Prerequisites:** Story 2.2

**Technical Notes:**
- Review step can be same page with state change or separate route
- Use optimistic UI pattern for submission
- Implement basic offline queue using localStorage
- API returns: `{ data: { id, trackingToken, status: 'pending' }, error: null }`

---

### Story 2.4: Request Confirmation Screen

As a **consumer**,
I want **to see confirmation that my request was received**,
So that **I know my request is in the system**.

**Acceptance Criteria:**

**Given** a consumer has successfully submitted a request
**When** the confirmation screen displays
**Then** they see:
- Success icon (checkmark in green circle)
- "¡Solicitud Enviada!" heading
- Request number/ID displayed
- Message: "El aguatero te contactará pronto"
- Supplier contact info (phone number visible)
- "Ver Estado" button to track request
- "Nueva Solicitud" button to request again

**And** guest consumers see: "Te enviamos un email con el enlace para seguir tu solicitud"
**And** the tracking link format is: `/track/[trackingToken]`

**Prerequisites:** Story 2.3

**Technical Notes:**
- Create confirmation as part of request flow or separate route
- Display supplier phone from profiles table
- For MVP with single supplier, always show that supplier's info

---

### Story 2.5: Request Status Tracking (Guest)

As a **guest consumer**,
I want **to check my request status using the tracking link**,
So that **I know when my water will arrive**.

**Acceptance Criteria:**

**Given** a guest consumer clicks their tracking link (from email)
**When** the tracking page loads at `/track/[token]`
**Then** they see:
- Status badge: "Pendiente" (amber), "Aceptada" (blue), or "Entregada" (green)
- Visual progress indicator showing: Pending → Accepted → Delivered
- Request details: amount, address (partial for privacy)
- If accepted: Delivery window if provided, supplier phone number
- If delivered: "Tu agua fue entregada" message with completion time

**And** the page auto-refreshes every 30 seconds to check for updates
**And** invalid tokens show: "Solicitud no encontrada" error page

**Prerequisites:** Story 2.4, Story 1.2

**Technical Notes:**
- Create `src/app/track/[token]/page.tsx`
- Create `src/components/shared/status-badge.tsx`
- Query: `water_requests` WHERE `tracking_token = [token]`
- Use Supabase's anon key (no auth required for guest tracking)

---

### Story 2.6: Request Status Page (Consumer View)

As a **consumer**,
I want **to view the detailed status of my request**,
So that **I can see all information about my pending delivery**.

**Acceptance Criteria:**

**Given** a consumer navigates to their request status
**When** the status page loads at `/request/[id]`
**Then** they see:
- Status badge with current state
- Timeline visualization: Created → Accepted → Delivered
- Request details: date, amount, address, special instructions
- If status = Pending: "Cancelar Solicitud" button visible
- If status = Accepted: Supplier name, phone, delivery window
- If status = Delivered: Completion timestamp

**And** page shows appropriate message for each status:
- Pending: "Esperando confirmación del aguatero"
- Accepted: "¡Confirmado! Tu agua viene en camino"
- Delivered: "Entrega completada"

**Prerequisites:** Story 2.5

**Technical Notes:**
- Create `src/app/(consumer)/request/[id]/page.tsx`
- Create `src/components/consumer/status-tracker.tsx`
- Reuse StatusBadge component from Story 2.5
- Cancel button only visible when status = 'pending'

---

## Epic 3: Supplier Dashboard & Request Management

**Goal:** Provide suppliers with a powerful dashboard to see ALL requests in one place and manage them efficiently. This replaces the chaos of WhatsApp, Facebook, and phone notes.

**User Value:** Suppliers finally have ONE place to see all customer requests, accept deliveries, and track completions. No more Monday evening chaos hunting through multiple apps.

**FRs Addressed:** FR19, FR20, FR21, FR22, FR23, FR24, FR25, FR26, FR27, FR28, FR29, FR30, FR31, FR32, FR33, FR37

---

### Story 3.1: Supplier Registration

As a **water supplier (Don Pedro)**,
I want **to register my business on nitoagua**,
So that **I can start receiving water requests through the platform**.

**Acceptance Criteria:**

**Given** a supplier visits the registration page
**When** they complete the registration form
**Then** they provide:
- Email (required, for login)
- Password (required, min 8 chars)
- Business/Personal name (required)
- Phone number (required, Chilean format)
- Service area (required, dropdown: Villarrica, Pucón, etc.)
- Price per tier (required for each):
  - 100L: input in CLP
  - 1000L: input in CLP
  - 5000L: input in CLP
  - 10000L: input in CLP

**And** on successful registration:
- Profile created with role = 'supplier'
- Redirected to supplier dashboard
- Toast: "¡Bienvenido a nitoagua!"

**And** validation errors show inline below fields

**Prerequisites:** Story 1.3 (Auth integration)

**Technical Notes:**
- Create `src/app/(auth)/register/page.tsx` with role selection or separate supplier path
- Create `src/lib/validations/profile.ts` with supplier schema
- Insert into both `auth.users` (Supabase Auth) and `profiles` table
- Service areas: hardcoded list for MVP (Villarrica region)

---

### Story 3.2: Supplier Login

As a **registered supplier**,
I want **to log in to my dashboard**,
So that **I can view and manage water requests**.

**Acceptance Criteria:**

**Given** a supplier visits the login page
**When** they enter valid credentials
**Then** they are:
- Authenticated via Supabase Auth
- Redirected to supplier dashboard
- Session persisted (stay logged in)

**And** invalid credentials show: "Email o contraseña incorrectos"
**And** rate limiting prevents brute force (5 attempts/hour)
**And** "Olvidé mi contraseña" link available (password reset email)

**Prerequisites:** Story 3.1

**Technical Notes:**
- Create `src/app/(auth)/login/page.tsx`
- After login, check profile.role to redirect:
  - supplier → /dashboard
  - consumer → / (consumer home)
- Use Supabase Auth `signInWithPassword`

---

### Story 3.3: Supplier Request Dashboard

As a **supplier**,
I want **to see all incoming water requests in one dashboard**,
So that **I can plan my deliveries efficiently**.

**Acceptance Criteria:**

**Given** a logged-in supplier visits the dashboard
**When** the dashboard loads
**Then** they see:
- Stats header: Pending count, Today's deliveries, Total this week
- Tab navigation: Pendientes | Aceptadas | Completadas
- Request cards showing:
  - Customer name
  - Location (address, truncated)
  - Water amount (badge with color)
  - Urgency indicator (red left border if urgent)
  - Time since request ("hace 2 horas")
  - "Aceptar" and "Ver Detalles" buttons

**And** cards are sorted by: urgency first, then submission time (oldest first)
**And** empty state shows: "No hay solicitudes pendientes" with availability toggle

**Prerequisites:** Story 3.2, Story 2.3 (requests exist)

**Technical Notes:**
- Create `src/app/(supplier)/dashboard/page.tsx`
- Create `src/components/supplier/request-card.tsx`
- Create `src/components/supplier/request-list.tsx`
- Create `src/components/supplier/stats-header.tsx`
- Query: `water_requests` WHERE `status = 'pending'` ORDER BY `is_urgent DESC, created_at ASC`
- Use Tailwind responsive: single column mobile, 2-col tablet, 3-col desktop

---

### Story 3.4: Supplier Request Details View

As a **supplier**,
I want **to see full details of a water request**,
So that **I can review all information before accepting**.

**Acceptance Criteria:**

**Given** a supplier clicks "Ver Detalles" on a request card
**When** the detail view opens (modal or page)
**Then** they see:
- Customer name and phone (clickable to call)
- Full address with special instructions
- Map showing location (if coordinates available)
- Water amount and price they'll charge
- Urgency status
- Request submission time
- Action buttons: "Aceptar", "Rechazar"

**And** phone number is clickable (tel: link)
**And** map uses Google Maps embed (if coordinates exist)
**And** close/back returns to dashboard

**Prerequisites:** Story 3.3

**Technical Notes:**
- Create `src/app/(supplier)/requests/[id]/page.tsx` OR modal dialog
- Create map component using Google Maps API (static image or embed)
- Environment variable: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

---

### Story 3.5: Accept Request with Delivery Window

As a **supplier**,
I want **to accept a request and optionally set a delivery window**,
So that **the customer knows when to expect their water**.

**Acceptance Criteria:**

**Given** a supplier clicks "Aceptar" on a pending request
**When** the accept dialog opens
**Then** they see:
- Confirmation message: "¿Aceptar esta solicitud?"
- Optional delivery window input: "Mañana 2-4pm", "Hoy en la tarde", free text
- "Confirmar" and "Cancelar" buttons

**And** when confirmed:
- Request status changes to 'accepted'
- `accepted_at` timestamp is set
- `supplier_id` is set to current user
- `delivery_window` saved if provided
- Customer is notified (handled in Epic 5)
- Toast: "Solicitud aceptada"
- Card moves to "Aceptadas" tab

**Prerequisites:** Story 3.3

**Technical Notes:**
- API: PATCH `/api/requests/[id]` with `{ action: 'accept', deliveryWindow?: string }`
- Create `src/components/supplier/delivery-modal.tsx`
- Update triggers notification (Epic 5)

---

### Story 3.6: Mark Request as Delivered

As a **supplier**,
I want **to mark a request as delivered after completing the delivery**,
So that **the customer is notified and my records are updated**.

**Acceptance Criteria:**

**Given** a supplier views an accepted request
**When** they click "Marcar Entregado"
**Then** a confirmation dialog shows: "¿Confirmar entrega completada?"

**And** when confirmed:
- Request status changes to 'delivered'
- `delivered_at` timestamp is set
- Customer is notified (handled in Epic 5)
- Toast: "Entrega completada"
- Card moves to "Completadas" tab

**And** the request appears in completed history with delivery timestamp

**Prerequisites:** Story 3.5

**Technical Notes:**
- API: PATCH `/api/requests/[id]` with `{ action: 'deliver' }`
- Confirmation dialog to prevent accidental completion
- Update triggers notification (Epic 5)

---

### Story 3.7: Supplier Profile Management

As a **supplier**,
I want **to update my profile and pricing**,
So that **my information stays current**.

**Acceptance Criteria:**

**Given** a supplier navigates to Profile settings
**When** the profile page loads
**Then** they can view and edit:
- Business name
- Phone number
- Service area
- Price for each tier (100L, 1000L, 5000L, 10000L)
- Availability toggle: "Disponible" / "No disponible (vacaciones)"

**And** changes are saved with "Guardar Cambios" button
**And** toast confirms: "Perfil actualizado"
**And** when unavailable, supplier doesn't receive new requests (MVP: visual only)

**Prerequisites:** Story 3.2

**Technical Notes:**
- Create `src/app/(supplier)/profile/page.tsx`
- Availability toggle sets `is_available` in profiles table
- For MVP, availability is informational (no automated filtering yet)

---

## Epic 4: User Accounts & Profiles

**Goal:** Enable consumers to create accounts for faster repeat orders with pre-filled information. Add request cancellation and account management.

**User Value:** Registered consumers can request water in under 30 seconds with pre-filled data. They can manage their profile, cancel pending requests, and view request history.

**FRs Addressed:** FR2, FR3, FR4, FR5, FR12, FR15, FR16, FR35, FR43, FR44, FR45

---

### Story 4.1: Consumer Registration

As a **consumer**,
I want **to create an account**,
So that **my information is saved for faster future requests**.

**Acceptance Criteria:**

**Given** a consumer clicks "Crear Cuenta" from login or home
**When** they complete registration
**Then** they provide:
- Email (required)
- Password (required, min 8 chars)
- Name (required)
- Phone (required, Chilean format)
- Address (optional, can add later)
- Special Instructions (optional, can add later)

**And** on success:
- Profile created with role = 'consumer'
- Redirected to consumer home
- Toast: "¡Cuenta creada! Ya puedes solicitar agua más rápido"

**Prerequisites:** Story 1.3

**Technical Notes:**
- Create consumer registration flow (separate from supplier)
- Role = 'consumer' in profiles table
- Pre-fill request form with profile data (Story 4.3)

---

### Story 4.2: Consumer Login

As a **registered consumer**,
I want **to log in to my account**,
So that **I can use my saved information and view my requests**.

**Acceptance Criteria:**

**Given** a consumer visits the login page
**When** they enter valid credentials
**Then** they are:
- Authenticated
- Redirected to consumer home
- See personalized greeting: "Hola, [Name]"

**And** the big button now shows their saved address below
**And** invalid credentials show error message

**Prerequisites:** Story 4.1

**Technical Notes:**
- Shared login page with supplier (distinguish by role after login)
- Consumer home checks auth state and personalizes

---

### Story 4.3: Pre-filled Request Form for Registered Users

As a **registered consumer**,
I want **my saved information pre-filled in the request form**,
So that **I can request water in under 30 seconds**.

**Acceptance Criteria:**

**Given** a logged-in consumer opens the request form
**When** the form loads
**Then** these fields are pre-filled from their profile:
- Name
- Phone
- Address
- Special Instructions

**And** they only need to:
- Select water amount
- Optionally set urgency
- Review and submit

**And** form submission creates request with `consumer_id` set
**And** no email required (in-app notifications instead)

**Prerequisites:** Story 4.2, Story 2.2

**Technical Notes:**
- Check auth state in request form component
- If logged in: fetch profile, pre-fill fields, hide email field
- Consumer_id links request to profile for history

---

### Story 4.4: Consumer Request History

As a **registered consumer**,
I want **to view my past water requests**,
So that **I can track my water usage and repeat previous orders**.

**Acceptance Criteria:**

**Given** a logged-in consumer navigates to History
**When** the history page loads
**Then** they see:
- List of all their requests (newest first)
- Each entry shows: date, amount, status, address
- Status badges: Pending (amber), Accepted (blue), Delivered (green), Cancelled (gray)
- Tap to view full details

**And** empty state shows: "Tu historial está vacío" with "Solicitar Agua" button
**And** history loads efficiently with pagination (10 per page)

**Prerequisites:** Story 4.3, Story 2.3

**Technical Notes:**
- Create `src/app/(consumer)/history/page.tsx`
- Query: `water_requests` WHERE `consumer_id = [userId]` ORDER BY `created_at DESC`
- Implement pagination or infinite scroll

---

### Story 4.5: Cancel Pending Request

As a **consumer**,
I want **to cancel my request if it hasn't been accepted yet**,
So that **I can change my mind before the supplier commits**.

**Acceptance Criteria:**

**Given** a consumer views their pending request
**When** they click "Cancelar Solicitud"
**Then** a confirmation dialog shows: "¿Seguro que quieres cancelar?"

**And** when confirmed:
- Request status changes to 'cancelled'
- `cancelled_at` timestamp is set
- Toast: "Solicitud cancelada"
- Request shows in history with grey "Cancelada" badge

**And** if request is already accepted:
- Cancel button is NOT visible
- Message shows: "Esta solicitud ya fue aceptada y no puede cancelarse"

**Prerequisites:** Story 2.6

**Technical Notes:**
- API: PATCH `/api/requests/[id]` with `{ action: 'cancel' }`
- RLS policy: Only allow cancel if `status = 'pending'` AND (`consumer_id = auth.uid()` OR guest with token)
- FR16 enforced: accepted requests cannot be cancelled

---

## Epic 5: Notifications & Communication

**Goal:** Implement email notifications for guest consumers and in-app notifications for registered users when request status changes.

**User Value:** Consumers know immediately when their request is accepted or delivered without checking the app. Guests get tracking links via email.

**FRs Addressed:** FR34, FR35, FR36

---

### Story 5.1: Email Notification Setup with Resend

As a **developer**,
I want **email sending configured with Resend**,
So that **the system can send transactional emails to consumers**.

**Acceptance Criteria:**

**Given** Resend is configured
**When** email templates are created
**Then** the following exist:
- `src/lib/email/resend.ts` - Resend client configuration
- `src/lib/email/templates/request-confirmed.tsx` - Guest request confirmation
- `src/lib/email/templates/request-accepted.tsx` - Request accepted notification
- `src/lib/email/templates/request-delivered.tsx` - Delivery completed notification

**And** each template includes:
- nitoagua branding (logo, colors)
- Clear subject line in Spanish
- Request details summary
- Tracking link (for guest emails)
- Supplier contact info (when relevant)

**And** templates render correctly in email clients

**Prerequisites:** Story 1.1

**Technical Notes:**
- Install: `npm install resend @react-email/components`
- Environment variable: RESEND_API_KEY
- Create React Email templates in `emails/` for preview
- Copy to `src/lib/email/templates/` for use

---

### Story 5.2: Guest Email Notifications

As a **guest consumer**,
I want **to receive email when my request status changes**,
So that **I know when my water is coming without checking the app**.

**Acceptance Criteria:**

**Given** a guest submits a request with their email
**When** the request is created
**Then** they receive an email with:
- Subject: "Tu solicitud de agua fue recibida - nitoagua"
- Request summary (amount, address)
- Tracking link: `nitoagua.cl/track/[token]`
- Supplier contact info

**And** when request is accepted:
- Subject: "¡Tu agua viene en camino! - nitoagua"
- Delivery window if provided
- Supplier name and phone

**And** when request is delivered:
- Subject: "Entrega completada - nitoagua"
- Completion timestamp

**Prerequisites:** Story 5.1, Story 3.5, Story 3.6

**Technical Notes:**
- Trigger emails from API route status updates
- Create helper: `sendRequestStatusEmail(request, newStatus)`
- Only send to guests (check if `guest_email` exists AND `consumer_id` is null)

---

### Story 5.3: In-App Notifications for Registered Users

As a **registered consumer**,
I want **to see notifications in the app when my request status changes**,
So that **I don't need to check email**.

**Acceptance Criteria:**

**Given** a logged-in consumer has an active request
**When** the request status changes
**Then** they see:
- Toast notification when app is open: "Tu solicitud fue aceptada"
- Badge on History tab indicating unread updates
- Status page auto-updates without refresh

**And** notification shows relevant info:
- Accepted: "Tu agua viene en camino" + delivery window
- Delivered: "Entrega completada"

**Prerequisites:** Story 5.2, Story 4.4

**Technical Notes:**
- For MVP: Use polling (check every 30 seconds) or manual refresh
- Toast notifications using shadcn/ui toast component
- Future: Implement Supabase real-time subscriptions for instant updates
- Note: FR35 specifies in-app notification, not push notifications (out of scope for MVP)

---

## FR Coverage Matrix

| FR | Description | Epic | Story |
|----|-------------|------|-------|
| FR1 | Guest request flow | Epic 2 | Story 2.2, 2.3 |
| FR2 | Consumer registration | Epic 4 | Story 4.1 |
| FR3 | Consumer login | Epic 4 | Story 4.2 |
| FR4 | Consumer profile update | Epic 4 | Story 4.1 |
| FR5 | View active/past requests | Epic 4 | Story 4.4 |
| FR6 | Guest tracking link | Epic 2 | Story 2.4, 2.5 |
| FR7 | Create water request | Epic 2 | Story 2.2 |
| FR8 | Required request fields | Epic 2 | Story 2.2 |
| FR9 | Optional request fields | Epic 2 | Story 2.2 |
| FR10 | Water amount tiers | Epic 2 | Story 2.2 |
| FR11 | Urgency indication | Epic 2 | Story 2.2 |
| FR12 | Pre-filled form for registered | Epic 4 | Story 4.3 |
| FR13 | Review before submit | Epic 2 | Story 2.3 |
| FR14 | View request status | Epic 2 | Story 2.5, 2.6 |
| FR15 | Cancel pending request | Epic 4 | Story 4.5 |
| FR16 | Cannot cancel accepted | Epic 4 | Story 4.5 |
| FR17 | Status change notification | Epic 5 | Story 5.2, 5.3 |
| FR18 | See supplier contact info | Epic 2 | Story 2.4, 2.6 |
| FR19 | Supplier registration | Epic 3 | Story 3.1 |
| FR20 | Supplier service area | Epic 3 | Story 3.1 |
| FR21 | Supplier price tiers | Epic 3 | Story 3.1 |
| FR22 | Supplier profile update | Epic 3 | Story 3.7 |
| FR23 | Supplier availability | Epic 3 | Story 3.7 |
| FR24 | View all requests dashboard | Epic 3 | Story 3.3 |
| FR25 | See request details | Epic 3 | Story 3.3, 3.4 |
| FR26 | Sort requests | Epic 3 | Story 3.3 |
| FR27 | Filter requests by status | Epic 3 | Story 3.3 |
| FR28 | View customer location map | Epic 3 | Story 3.4 |
| FR29 | Accept request | Epic 3 | Story 3.5 |
| FR30 | Add delivery window | Epic 3 | Story 3.5 |
| FR31 | Mark delivered | Epic 3 | Story 3.6 |
| FR32 | Decline request | Epic 3 | Story 3.4 |
| FR33 | Declined returns to pending | Epic 3 | Story 3.4 |
| FR34 | Email notification for guests | Epic 5 | Story 5.2 |
| FR35 | In-app notification for registered | Epic 5 | Story 5.3 |
| FR36 | Supplier contact visible after accept | Epic 2, 5 | Story 2.4, 5.2 |
| FR37 | Consumer contact visible to supplier | Epic 3 | Story 3.4 |
| FR38 | PWA accessible | Epic 1 | Story 1.4 |
| FR39 | Install to home screen | Epic 1 | Story 1.4 |
| FR40 | Spanish interface | Epic 2 | Story 2.1, all UI |
| FR41 | Responsive design | Epic 2, 3 | All UI stories |
| FR42 | Progressive loading | Epic 1 | Story 1.4 |
| FR43 | Data isolation | Epic 1 | Story 1.2 (RLS) |
| FR44 | Account deletion | Epic 4 | (Future story) |
| FR45 | Request history retention | Epic 4 | Story 4.4 |

---

## Summary

**Epic Breakdown Complete for nitoagua**

### What We Created:

- **5 Epics** organized by user value delivery
- **26 Stories** with detailed BDD acceptance criteria
- **Complete FR coverage** - all 45 functional requirements mapped to stories
- **Technical context** from Architecture incorporated into implementation notes
- **UX context** from Design Specification incorporated into component details

### Epic Overview:

| Epic | Stories | Focus |
|------|---------|-------|
| Epic 1: Foundation | 5 | Project setup, database, auth, PWA, deployment |
| Epic 2: Consumer Request | 6 | Big button, request form, status tracking |
| Epic 3: Supplier Dashboard | 7 | Registration, dashboard, accept/deliver workflow |
| Epic 4: User Accounts | 5 | Consumer accounts, profiles, history, cancellation |
| Epic 5: Notifications | 3 | Email and in-app notifications |

### Recommended Implementation Order:

1. **Epic 1** - Foundation (enables everything else)
2. **Epic 2** - Consumer Request (core consumer value)
3. **Epic 3** - Supplier Dashboard (enables full loop)
4. **Epic 5** - Notifications (connect consumer and supplier)
5. **Epic 4** - User Accounts (enhancement for repeat users)

### Ready For:

- ✅ Phase 4 Implementation - Sprint Planning workflow
- ✅ Story-level implementation with `create-story` workflow
- ✅ Development by AI agents with clear acceptance criteria

---

_This epic breakdown was created using the BMad Method - Create Epics and Stories workflow._

_All functional requirements from PRD are mapped and traceable._

_UX Design and Architecture context have been incorporated for complete implementation guidance._
