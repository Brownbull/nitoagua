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

---

# Post-MVP Epics (V2 Consumer-Choice Offer Model)

**Source:** PRD V2, Architecture V2, UX Mockups (2025-12-11)
**Scope:** Multi-provider marketplace with Consumer-Choice Offer System

The following epics implement the V2 architecture where providers submit offers on requests and consumers select their preferred provider. This replaces the original push-style assignment model with a marketplace-style offer system.

### Epic Summary (Post-MVP)

| Epic | Title | Stories | User Value |
|------|-------|---------|------------|
| 6 | Admin Operations Panel | 8 | Provider verification, offer settings, settlement tracking, operations |
| 7 | Provider Onboarding | 11 | Self-registration, document upload, verification flow, UX alignment |
| 8 | Provider Offer System | 7 | Browse requests, submit offers, track offer status, earnings visibility |
| 9 | Consumer Offer Selection | 5 | View multiple offers, select preferred provider, offer countdown |
| 10 | Consumer UX Enhancements | 5 | Map pinpoint, negative states, payment options, improved messaging |

**Total Post-MVP:** 5 Epics, 36 Stories

**Implementation Order:** Epics are numbered by dependency order (6→7→8→9→10). Start with Epic 6 and proceed sequentially.

---

## Epic 6: Admin Operations Panel

**Goal:** Create comprehensive admin panel for platform management including offer system configuration, provider verification, settlement tracking, and operations monitoring. Desktop-first design optimized for operations team.

**User Value:** Platform operators can configure offer validity, verify providers, track cash settlements, and monitor the marketplace from a single dashboard. Critical for managing the Consumer-Choice Offer Model.

**FRs Covered:** FR69-FR98 (Admin Authentication, Provider Management, Offer Configuration, Settlement Tracking)

**Dependencies:**
- **FIRST V2 EPIC** - No V2 dependencies (depends only on MVP Story 1.3)
- Required by Epic 7, 8, 9 (offer validity settings, provider verification)

---

### Story 6.1: Admin Authentication and Access

As a **platform administrator**,
I want **to access a secure admin panel via hidden URL**,
So that **only authorized personnel can manage the platform**.

**Acceptance Criteria:**

**Given** an admin knows the entry point
**When** they navigate to `/admin`
**Then** they see:
- Admin login page (separate from consumer/provider)
- Google OAuth button
- No visible links from public app

**And** after Google OAuth:
- System checks `admin_allowed_emails` table
- If email found → login succeeds, redirect to dashboard
- If email NOT found → "No autorizado. Contacta al administrador."

**And** after successful login:
- Session persists for 24 hours
- Activity logged with timestamp
- Desktop-optimized layout (min-width warning on mobile)

**Prerequisites:** Story 1.3

**Technical Notes:**
- Create `src/app/(admin)/` route group
- Create `src/app/(admin)/login/page.tsx`
- Create `src/app/(admin)/not-authorized/page.tsx`
- Use `admin_allowed_emails` table (pre-seeded)
- Layout with sidebar navigation

**Mockup Reference:** `docs/ux-mockups/02-admin-dashboard.html`

---

### Story 6.2: Offer System Configuration

As an **admin**,
I want **to configure offer validity and request timeout settings**,
So that **the marketplace operates with appropriate time constraints**.

**Acceptance Criteria:**

**Given** an admin navigates to "Configuración"
**When** they view offer settings
**Then** they see:

**Offer Validity Section:**
- Default validity: [input] minutes (current: 30)
- Minimum validity: [input] minutes (current: 15)
- Maximum validity: [input] minutes (current: 120)
- Preview: "Providers can set offer validity between 15-120 min, default 30 min"

**Request Timeout Section:**
- Request timeout: [input] hours (current: 4)
- Message: "Requests with no offers after 4 hours are marked 'no_offers'"

**And** changes require confirmation
**And** changes are logged in audit trail
**And** changes take effect immediately for new offers

**Prerequisites:** Story 6.1

**Technical Notes:**
- Create `src/app/(admin)/settings/page.tsx`
- Store in `admin_settings` table with keys:
  - `offer_validity_default`
  - `offer_validity_min`
  - `offer_validity_max`
  - `request_timeout_hours`
- Create `src/components/admin/settings-form.tsx`

---

### Story 6.3: Provider Verification Queue

As an **admin**,
I want **to review and approve/reject provider applications**,
So that **only qualified providers can operate on the platform**.

**Acceptance Criteria:**

**Given** an admin opens the verification queue
**When** the queue loads
**Then** they see:
- Count badge: "5 pendientes"
- List sorted by submission date (oldest first)
- Each application shows: Name, photo, phone, submission date, status

**And** clicking an application opens detail view:
- Personal info section
- Document viewer with zoom/download:
  - Cédula de identidad
  - Permisos sanitarios
  - Vehicle photos
  - Certifications (if provided)
- Service areas selected
- Bank account info
- Internal notes field

**And** action buttons:
- "Aprobar" → Confirmation → Status = 'approved'
- "Rechazar" → Reason required (dropdown) → Status = 'rejected'
- "Solicitar Info" → Checkboxes for needed docs → Status = 'more_info_needed'

**And** action triggers notification to applicant (email + in-app)

**Prerequisites:** Story 6.1, Story 7.1 (provider registration)

**Technical Notes:**
- Create `src/app/(admin)/providers/verification/page.tsx`
- Create `src/components/admin/verification-queue.tsx`
- Document viewer with Supabase Storage URLs
- Update `profiles.verification_status` on action

---

### Story 6.4: Provider Directory

As an **admin**,
I want **to view and manage all providers**,
So that **I can handle suspensions, status changes, and support issues**.

**Acceptance Criteria:**

**Given** an admin opens provider directory
**When** the page loads
**Then** they see:
- Searchable table with columns: Name, Phone, Status, Deliveries, Commission Owed, Joined
- Filters: Status (pending, approved, suspended, banned), Service Area
- Sort by any column

**And** clicking a provider shows detail panel:
- Profile info and documents
- Delivery statistics
- Commission ledger summary
- Service areas
- Account standing

**And** available actions:
- Suspend (with reason and duration)
- Unsuspend
- Ban (requires confirmation)
- Adjust commission rate (override)
- Send notification

**Prerequisites:** Story 6.3

**Technical Notes:**
- Create `src/app/(admin)/providers/page.tsx`
- Create `src/components/admin/provider-directory.tsx`
- Pagination with 25 per page
- Search with debounce

---

### Story 6.5: Cash Settlement Tracking

As an **admin**,
I want **to track and verify commission payments from providers**,
So that **cash settlements are properly recorded**.

**Acceptance Criteria:**

**Given** an admin navigates to "Liquidaciones"
**When** the settlement page loads
**Then** they see:

**Summary Cards:**
- Total pending: $XX,XXX (all providers)
- Overdue (>7 days): $XX,XXX
- Payments pending verification: X

**Pending Payments Table:**
- Provider name
- Amount submitted
- Receipt uploaded
- Submitted date
- "Verificar" / "Rechazar" buttons

**Provider Balances Table:**
- Provider name
- Total owed
- Days outstanding
- Last payment date
- "Ver Detalle" link

**And** clicking "Verificar":
- View receipt image
- Enter bank reference (optional)
- Confirm → Creates `commission_paid` entry
- Provider notified: "Pago confirmado"

**And** clicking "Rechazar":
- Reason required
- Provider notified with reason
- Payment record marked rejected

**Prerequisites:** Story 6.1, Story 8.7

**Technical Notes:**
- Create `src/app/(admin)/settlement/page.tsx`
- Create `src/components/admin/settlement-table.tsx`
- Query `commission_ledger` grouped by provider
- Query `withdrawal_requests` with status = 'pending'

---

### Story 6.6: Orders Management

As an **admin**,
I want **to view all orders and their offer history**,
So that **I can monitor the marketplace and intervene if needed**.

**Acceptance Criteria:**

**Given** an admin navigates to "Pedidos"
**When** the orders page loads
**Then** they see:
- Filters: Status, Date range, Service area
- Table: ID, Consumer, Amount, Status, Offers, Provider, Created
- Status badges with colors

**And** clicking an order shows:
- Full request details
- Consumer contact info
- **Offer history**: All offers with status, provider, delivery window
- Timeline: Created → Offers received → Selected → Delivered
- Provider contact (if assigned)

**And** available actions:
- Cancel order (with reason)
- Contact consumer (shows phone/email)
- Contact provider (shows phone)

**And** offer analytics per request:
- Number of offers received
- Time to first offer
- Time to selection

**Prerequisites:** Story 6.1

**Technical Notes:**
- Create `src/app/(admin)/orders/page.tsx`
- Create `src/components/admin/orders-table.tsx`
- Join `water_requests` with `offers` for offer history
- Real-time updates for active orders

---

### Story 6.7: Offer Expiration Cron Job

As **the platform**,
I want **expired offers to be automatically marked as expired**,
So that **consumers don't see stale offers**.

**Acceptance Criteria:**

**Given** offers exist with `expires_at` in the past
**When** the cron job runs (every 1 minute)
**Then**:
- Offers with `status = 'active'` AND `expires_at < NOW()` → status = 'expired'
- Affected providers notified: "Tu oferta expiró"
- Log count of expired offers

**And** the cron is configured in `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/expire-offers",
    "schedule": "* * * * *"
  }]
}
```

**Prerequisites:** Story 8.2 (offers exist)

**Technical Notes:**
- Create `src/app/api/cron/expire-offers/route.ts`
- Use CRON_SECRET for authentication
- Batch update for efficiency
- Log to console for monitoring

---

### Story 6.8: Operations Dashboard

As an **admin**,
I want **to see platform metrics including offer analytics**,
So that **I can monitor marketplace health**.

**Acceptance Criteria:**

**Given** an admin opens the dashboard (home)
**When** the dashboard loads
**Then** they see:

**Period selector:** Hoy / Esta Semana / Este Mes

**Request Metrics:**
- Total requests
- Requests with offers (%)
- Avg offers per request
- Request timeout rate (%)

**Offer Metrics:**
- Total offers submitted
- Offer acceptance rate (%)
- Avg time to first offer
- Offer expiration rate (%)

**Financial:**
- Transaction volume
- Commission earned
- Pending cash settlements
- Overdue settlements

**Provider:**
- Active providers
- Online now
- New applications

**And** each metric shows trend vs previous period (↑ ↓)
**And** clicking metrics drills down to filtered view

**Prerequisites:** Story 6.6

**Technical Notes:**
- Create `src/app/(admin)/dashboard/page.tsx`
- Aggregate queries with date filters
- Use shadcn/ui charts for visualizations
- Cache metrics with 5-minute refresh

---

### Story 6.9: Pricing Configuration

As an **admin**,
I want **to configure platform-wide water prices and commission rates**,
So that **pricing is consistent across all providers and the platform earns sustainable commission**.

**Acceptance Criteria:**

**Given** an admin navigates to "Precios"
**When** the pricing page loads
**Then** they see:

**Water Pricing Section:**
- Price inputs for each tier: 100L, 1000L, 5000L, 10000L
- Values in CLP with "$" prefix
- Current defaults: $5,000 / $20,000 / $75,000 / $140,000

**Urgency Surcharge Section:**
- Percentage input (default: 10%)
- Description: "Porcentaje adicional para pedidos urgentes"

**Commission Section:**
- Percentage input (default: 10%)
- Preview calculation: "En un pedido de $20,000, la plataforma gana $3,000"

**And** changes require confirmation dialog
**And** changes take effect immediately for new requests
**And** success toast confirms "Precios actualizados"

**Prerequisites:** Story 6.1

**Technical Notes:**
- Create `src/app/(admin)/pricing/page.tsx`
- Store in `admin_settings` table with keys: `price_100l`, `price_1000l`, `price_5000l`, `price_10000l`, `urgency_surcharge_percent`, `default_commission_percent`
- Create `src/components/admin/pricing-form.tsx`

**Mockup Reference:** `docs/ux-mockups/02-admin-dashboard.html` - Section 5 (5A: Configuracion de Precios)

**FRs Covered:** FR87, FR88, FR92

---

## Epic 7: Provider Onboarding

**Goal:** Enable new providers to self-register, upload documents, and go through verification process. Essential for marketplace growth.

**User Value:** Water providers can join the platform independently, submit required documents, and start receiving requests after verification. Removes manual onboarding bottleneck.

**FRs Covered:** FR24-FR32 (Provider Registration & Onboarding)

**Dependencies:**
- Requires Epic 6 (Admin) for verification queue

---

### Story 7.1: Provider Registration Flow

As a **potential water provider**,
I want **to register and submit my documents for verification**,
So that **I can start receiving water delivery requests**.

**Acceptance Criteria:**

**Given** a person navigates to `/provider/register`
**When** they start registration
**Then** they progress through steps:

**Step 1: Welcome**
- "¿Quieres ser repartidor de agua?"
- Requirements listed: vehicle, permits, certifications
- "Comenzar con Google" button

**Step 2: Personal Information (after Google OAuth)**
- Name (pre-filled from Google)
- Phone (required, Chilean format validation)
- Profile photo (optional)

**Step 3: Service Areas**
- Multi-select of comunas: Villarrica, Pucón, Curarrehue, Licán Ray
- At least one required

**Step 4: Document Upload**
- Cédula de identidad (required)
- Permiso sanitario (required)
- Certificación de agua (optional)
- Vehicle photos (required)
- Vehicle capacity in liters

**Step 5: Bank Account**
- Bank name (dropdown)
- Account type
- Account number
- RUT

**Step 6: Review & Submit**
- Summary of all info
- "Enviar Solicitud" button

**And** upon submission:
- Profile created with `verification_status = 'pending'`
- Documents uploaded to Supabase Storage
- Admin notified of new application
- Provider sees "pending verification" screen

**Prerequisites:** Story 1.3

**Technical Notes:**
- Create `src/app/(provider)/onboarding/` with step pages
- Create `provider_documents` records for each upload
- Create `provider_service_areas` records
- Use Supabase Storage with RLS for documents

**Mockup Reference:** `docs/ux-mockups/01-consolidated-provider-flow.html` (Onboarding screens)

---

### Story 7.2: Verification Status Screen

As a **provider applicant**,
I want **to see my verification status and any required actions**,
So that **I know what to do next**.

**Acceptance Criteria:**

**Given** a provider with pending verification logs in
**When** they access the app
**Then** they see status-specific screens:

**Pending:**
- "Tu solicitud está en revisión"
- "Tiempo estimado: 24-48 horas"
- List of documents submitted
- Support contact info

**Approved:**
- "¡Bienvenido a nitoagua!"
- Quick tutorial on using dashboard
- "Comenzar a trabajar" button
- Redirects to provider dashboard

**Rejected:**
- "Tu solicitud no fue aprobada"
- Reason shown (from admin)
- "Contactar Soporte" button
- "Volver a intentar" (after 30 days)

**More Info Needed:**
- "Necesitamos más información"
- Specific requests listed
- Upload fields for missing items
- "Enviar" button to resubmit

**Prerequisites:** Story 7.1

**Technical Notes:**
- Create `src/app/(provider)/onboarding/pending/page.tsx`
- Check `profiles.verification_status` on provider login
- Redirect non-approved providers to status screen

---

### Story 7.3: Service Area Configuration

As a **verified provider**,
I want **to configure which areas I serve**,
So that **I only see requests in my operating areas**.

**Acceptance Criteria:**

**Given** a provider navigates to settings
**When** they view service areas
**Then** they see:
- List of available comunas with checkboxes
- Current selections highlighted
- "Guardar" button

**And** available comunas include:
- Villarrica
- Pucón
- Curarrehue
- Licán Ray

**And** at least one comuna must be selected
**And** changes take effect immediately for request visibility

**Prerequisites:** Story 7.2

**Technical Notes:**
- Create `src/app/(provider)/settings/page.tsx`
- Create `src/components/provider/service-area-picker.tsx`
- Update `provider_service_areas` table
- Verify via `comunas` table (pre-seeded)

---

### Story 7.4: Provider Availability Toggle

As a **verified provider**,
I want **to toggle my availability status**,
So that **I control when I receive request notifications**.

**Acceptance Criteria:**

**Given** a provider is on their dashboard
**When** they see the availability toggle
**Then**:
- Large, prominent toggle at top of screen
- Green "DISPONIBLE" when ON
- Gray "NO DISPONIBLE" when OFF

**And** when ON:
- Provider can browse available requests
- Real-time updates for new requests

**And** when OFF:
- "No estás recibiendo solicitudes"
- Can still view pending offers and deliveries
- Cannot browse new requests

**And** toggle state persists across sessions

**Prerequisites:** Story 7.2, Story 3.3

**Technical Notes:**
- Update `profiles.is_available` column
- Create `src/components/provider/availability-toggle.tsx`
- Style similar to Uber's "Go Online" toggle
- Real-time subscription conditional on availability

---

### Story 7.5: Provider Document Management

As a **verified provider**,
I want **to view and update my uploaded documents**,
So that **I can keep my profile current**.

**Acceptance Criteria:**

**Given** a provider navigates to profile
**When** they view documents section
**Then** they see:
- List of uploaded documents
- Document type, upload date, verification status
- Preview thumbnail for each
- "Actualizar" button per document

**And** clicking a document shows:
- Full image viewer
- Download option
- "Subir Nueva Versión" button

**And** uploading new version:
- Replaces existing document
- Status resets to "pending verification" for that doc only
- Admin notified of update

**Prerequisites:** Story 7.1

**Technical Notes:**
- Create `src/app/(provider)/profile/documents/page.tsx`
- Use Supabase Storage signed URLs for secure access
- Track document versions if needed

---

### Story 7.6: Epic Deployment & Verification

As a **developer**,
I want **to deploy all Epic 7 changes through the git branching workflow and verify production with test users**,
So that **the provider registration flow is live and working for new water providers**.

**Acceptance Criteria:**

**Given** Story 7-1 (Provider Registration Flow) is complete and approved
**When** deployment workflow is executed
**Then**:
- All changes committed to develop branch
- Develop merged to staging with preview verification
- Staging merged to main with production deployment
- Production build succeeds on Vercel

**And** database setup verified:
- `provider-documents` storage bucket exists with correct RLS policies
- `comunas` table seeded with Villarrica region data
- `provider_service_areas` table with RLS policies
- Migration applied successfully

**And** production verification with test user:
- Test user created (`provider2@nitoagua.cl`)
- Provider onboarding welcome page loads
- Multi-step wizard navigates correctly
- Document upload works
- Registration submission creates pending profile
- Admin can verify provider in queue
- Approved provider redirects to dashboard

**And** no regression in existing flows:
- Consumer request flow works
- Supplier dashboard works
- Admin panel accessible

**Prerequisites:** Story 7.1

**Technical Notes:**
- Production URL: https://nitoagua.vercel.app
- Test credentials: `provider2@nitoagua.cl` / `provider2.123`
- Branching strategy: develop → staging → main
- Storage bucket may need manual creation in Supabase Dashboard

**Status:** DONE - Deployed 2025-12-15

---

### Story 7.7: UX Alignment - Personal Information Screen

As a **provider registering on the platform**,
I want **the personal information step to match the UX mockups**,
So that **the onboarding experience is consistent with the approved design**.

**Acceptance Criteria:**

**Given** a provider is on the personal information step
**When** the form loads
**Then** they see (per mockup 13.2):
- "Paso 1 de 4" header with 4-segment progress bar (not 6 steps)
- Profile photo upload circle with camera icon and "+ Agregar foto de perfil" link
- Name field (pre-filled from Google if available)
- **RUT field** with validation (currently missing - should be on this screen)
- Phone field with +56 prefix
- Google account linked indicator showing email

**And** the progress bar shows 4 steps total:
1. Información personal
2. Documentos
3. Tu vehículo
4. Cuenta bancaria

**Prerequisites:** Story 7.6 (deployed)

**Technical Notes:**
- Move RUT from bank step to personal info step
- Add profile photo upload to Supabase Storage
- Simplify progress indicator from 6 to 4 steps
- Reorder steps: Personal → Documents → Vehicle → Bank

**Mockup Reference:** `docs/ux-mockups/01-consolidated-provider-flow.html` Section 13.2

---

### Story 7.8: UX Alignment - Document Upload Screen

As a **provider uploading documents**,
I want **the document step to match the UX mockups**,
So that **I see the correct document requirements per the approved design**.

**Acceptance Criteria:**

**Given** a provider is on the documents step
**When** the form loads
**Then** they see (per mockup 13.3):
- "Paso 2 de 4" header with progress bar
- Document list with icons and status:
  - **Cédula de identidad** (required) - ID card icon
  - **Licencia de conducir** (required if motorized vehicle) - license icon
  - **Fotos del vehículo** (required) - vehicle icon
  - **Permiso sanitario** (optional - dashed border) - document icon
- Each document shows: Upload status (✓ Subido / Pendiente), "Cambiar" or "Subir" button
- Info box: "Documentos seguros - Tus documentos están protegidos..."
- Disabled continue button until required docs uploaded

**Changes from current implementation:**
- Add "Licencia de conducir" document type
- Make "Permiso sanitario" optional (currently required)
- Update document card styling to match mockup

**Prerequisites:** Story 7.7

**Technical Notes:**
- Add `licencia_conducir` to document types enum
- Update REQUIRED_DOCUMENTS and OPTIONAL_DOCUMENTS arrays
- Update document upload UI to match mockup styling
- Migration to add new document type

**Mockup Reference:** `docs/ux-mockups/01-consolidated-provider-flow.html` Section 13.3

---

### Story 7.9: UX Alignment - Vehicle Information Screen

As a **provider configuring their vehicle**,
I want **a dedicated vehicle information step matching the UX mockups**,
So that **I can specify my vehicle type, capacity, and availability**.

**Acceptance Criteria:**

**Given** a provider is on the vehicle step
**When** the form loads
**Then** they see (per mockup 13.4):
- "Paso 3 de 4" header with progress bar
- "Tu vehículo" title
- Vehicle type selection with visual cards:
  - 🏍️ Moto - "Hasta 100L por viaje"
  - 🚗 Auto - "Hasta 300L por viaje"
  - 🛻 Camioneta - "Hasta 1000L por viaje"
- Selected card has orange border and checkmark
- Capacity input field: "Capacidad de carga (litros)"
- Working hours dropdown: "Horas disponible por día" (4-6, 6-8, 8-10, 10+)
- Working days buttons: Lun-Dom (toggle selection)

**Changes from current implementation:**
- Add vehicle type selection with visual cards
- Add working hours dropdown
- Add working days selection
- Replace simple capacity dropdown with free text + vehicle type

**Prerequisites:** Story 7.8

**Technical Notes:**
- Add `vehicle_type` column to profiles (enum: 'moto', 'auto', 'camioneta')
- Add `working_hours` column (enum: '4-6', '6-8', '8-10', '10+')
- Add `working_days` column (array of days)
- Create vehicle type cards component
- Migration for new columns

**Mockup Reference:** `docs/ux-mockups/01-consolidated-provider-flow.html` Section 13.4

---

### Story 7.10: UX Alignment - Bank Account Screen

As a **provider configuring bank account**,
I want **the bank step to match the UX mockups**,
So that **the account type selection uses buttons instead of dropdown**.

**Acceptance Criteria:**

**Given** a provider is on the bank account step
**When** the form loads
**Then** they see (per mockup 13.5):
- "Paso 4 de 4" header with progress bar
- "Cuenta bancaria" title
- Description: "Ingresa los datos de la cuenta donde recibirás tus ganancias"
- Bank dropdown selector
- **Account type as two buttons** (not dropdown):
  - "Cuenta Vista" button (highlighted when selected)
  - "Cuenta Corriente" button
- Account number input
- RUT field (pre-filled if entered in personal info, disabled)
- Info box: "Transferencias seguras - Las transferencias se procesan en 1-2 días hábiles"
- "Completar registro" button

**Changes from current implementation:**
- Change account type from dropdown to button selection
- Pre-fill RUT from personal info step (if we move RUT to step 1)
- Update button text from "Siguiente" to "Completar registro"

**Prerequisites:** Story 7.9

**Technical Notes:**
- Update bank form component with toggle buttons
- Pre-populate RUT from earlier step
- Update submit button text

**Mockup Reference:** `docs/ux-mockups/01-consolidated-provider-flow.html` Section 13.5

---

### Story 7.11: UX Alignment Deployment & Verification

As a **developer**,
I want **to deploy all UX alignment changes and verify production matches mockups**,
So that **the provider onboarding flow matches the approved UX design**.

**Acceptance Criteria:**

**Given** Stories 7.7-7.10 are complete
**When** deployment workflow is executed
**Then**:
- All changes committed to develop branch
- Develop merged to staging with preview verification
- Staging merged to main with production deployment
- E2E tests pass for updated onboarding flow

**And** production verification confirms UX alignment:
- Personal info screen matches mockup 13.2 (photo upload, RUT, 4-step progress)
- Document screen matches mockup 13.3 (license required, permiso optional)
- Vehicle screen matches mockup 13.4 (type cards, hours, days)
- Bank screen matches mockup 13.5 (button selection, pre-filled RUT)

**And** E2E testing with test user:
- Reset provider2 test user: `npm run seed:provider2:reset`
- Complete full onboarding flow
- Verify all steps render correctly
- Screenshot comparison with mockups
- Admin approval flow works

**And** no regression in existing flows

**Prerequisites:** Stories 7.7, 7.8, 7.9, 7.10

**Technical Notes:**
- Run E2E tests: `npm run test:e2e -- provider-registration`
- Use Playwright for screenshot comparison
- Production URL: https://nitoagua.vercel.app/provider/onboarding
- Document any remaining discrepancies for future stories

---

## Epic 8: Provider Offer System

**Goal:** Enable providers to browse available requests and submit competitive offers. Core feature of the Consumer-Choice Offer Model where providers actively pursue work rather than passively receiving assignments.

**User Value:** Providers gain control over their work by choosing which requests to pursue, seeing exactly what they'll earn before committing, and competing fairly with other providers.

**FRs Covered:** FR39, FR40, FR41, FR42, FR43, FR44, FR50, FR51, FR52, FR53, FR54, FR55, FR56, FR57, FR58

**Dependencies:**
- Requires Epic 6 (Admin) for offer validity configuration
- Requires Epic 7 (Provider Onboarding) for provider registration

---

### Story 8.1: Provider Request Browser

As a **verified provider**,
I want **to browse available water requests in my service areas**,
So that **I can find work that fits my schedule and location**.

**Acceptance Criteria:**

**Given** a provider is logged in and available (toggle ON)
**When** they navigate to "Solicitudes Disponibles"
**Then** they see:
- List of pending requests in their configured service areas
- Each request card shows:
  - Customer location (comuna/address - no exact address until offer accepted)
  - Water amount: "5,000 litros"
  - Urgency indicator: "Normal" or "Urgente ⚡"
  - Time since posted: "Hace 15 min"
  - Number of offers already: "2 ofertas"
  - "Ver Detalles" button

**And** requests are sorted by:
- Urgency first (urgent requests at top)
- Then by time posted (newest first)

**And** list updates in real-time via Supabase Realtime
**And** requests disappear when filled or timed out

**Prerequisites:** Story 3.3 (provider dashboard exists), Story 7.4

**Technical Notes:**
- Create `src/app/(provider)/requests/page.tsx`
- Create `src/components/provider/request-browser.tsx`
- Use `use-realtime-requests.ts` hook
- Query: Requests WHERE comuna_id IN (provider's service areas) AND status = 'pending'
- RLS: Only show requests in provider's service areas

**Mockup Reference:** `docs/ux-mockups/01-consolidated-provider-flow.html` (Request Browser screen)

---

### Story 8.2: Submit Offer on Request

As a **provider viewing a request**,
I want **to submit an offer with my delivery window**,
So that **the consumer can consider my offer alongside others**.

**Acceptance Criteria:**

**Given** a provider is viewing request details
**When** they tap "Hacer Oferta"
**Then** they see an offer form:
- **Delivery window picker**: Start time + End time (2-hour window recommended)
- **Price display**: "$XX,XXX" (fixed price from platform, not editable)
- **Earnings preview**: "Ganarás: $XX,XXX (después de X% comisión)"
- **Optional message**: Text field for notes to consumer
- **Offer validity**: "Tu oferta expira en 30 min" (from admin settings)
- "Enviar Oferta" primary button
- "Cancelar" secondary button

**And** upon submission:
- Offer created with status 'active'
- `expires_at` calculated from `offer_validity_minutes` setting
- Provider sees confirmation: "¡Oferta enviada! Te notificaremos si es aceptada"
- Provider redirected to "Mis Ofertas" page

**And** provider cannot submit duplicate offers on same request

**Prerequisites:** Story 8.1

**Technical Notes:**
- Create `src/app/(provider)/requests/[id]/page.tsx`
- Create `src/components/provider/offer-form.tsx`
- Create `src/lib/actions/offers.ts` with `createOffer()` action
- Validate delivery window is in future
- Get `offer_validity_minutes` from `admin_settings` table
- Insert into `offers` table with calculated `expires_at`

---

### Story 8.3: Provider's Active Offers List

As a **provider**,
I want **to see all my pending offers and their status**,
So that **I can track which requests I'm waiting on**.

**Acceptance Criteria:**

**Given** a provider has submitted offers
**When** they navigate to "Mis Ofertas"
**Then** they see:
- List of active offers grouped by status:
  - "Pendientes" - waiting for consumer decision
  - "Aceptadas" - consumer selected this offer (now deliveries)
  - "Expiradas/Rechazadas" - not selected

**And** each pending offer shows:
- Request summary (amount, location)
- Delivery window offered
- Time remaining: "Expira en 25:30"
- "Cancelar Oferta" button

**And** offers update in real-time (acceptance, expiration)

**Prerequisites:** Story 8.2

**Technical Notes:**
- Create `src/app/(provider)/offers/page.tsx`
- Group by status with tabs or accordion
- Real-time subscription on offers table for provider_id
- Show countdown using `use-countdown.ts` hook

---

### Story 8.4: Withdraw Pending Offer

As a **provider**,
I want **to withdraw an offer I submitted**,
So that **I can cancel if my availability changes**.

**Acceptance Criteria:**

**Given** a provider has an active pending offer
**When** they tap "Cancelar Oferta"
**Then** they see confirmation:
- "¿Cancelar esta oferta?"
- "El cliente ya no verá tu oferta"
- "Confirmar" / "Volver" buttons

**And** upon confirmation:
- Offer status changes to 'cancelled'
- Provider sees "Oferta cancelada"
- Consumer's offer list updates (offer removed)

**And** provider can submit new offer on same request if still pending

**Prerequisites:** Story 8.3

**Technical Notes:**
- Add `withdrawOffer(offerId)` action
- RLS: Provider can only cancel their own active offers
- Real-time update to consumer's view

---

### Story 8.5: Offer Acceptance Notification

As a **provider with accepted offer**,
I want **to be notified immediately when my offer is selected**,
So that **I can prepare for the delivery**.

**Acceptance Criteria:**

**Given** a consumer selects a provider's offer
**When** the offer is accepted
**Then** the provider receives:
- In-app notification: "¡Tu oferta fue aceptada!"
- Push notification (if enabled)
- Email notification with delivery details

**And** the notification includes:
- Customer name and phone
- Full delivery address (now revealed)
- Water amount
- Delivery window they committed to
- "Ver Detalles" button

**And** the offer moves to "Entregas Activas" section

**Prerequisites:** Story 8.3, Story 9.2 (consumer selects offer)

**Technical Notes:**
- Create notification on offer acceptance (Story 9.2 transaction)
- Email template: `offer-accepted.tsx`
- In-app notification via `notifications` table

---

### Story 8.6: Earnings Dashboard

As a **provider**,
I want **to see my earnings with commission breakdown**,
So that **I understand exactly what I've earned and what I owe**.

**Acceptance Criteria:**

**Given** a provider navigates to "Ganancias"
**When** the earnings page loads
**Then** they see:
- Period selector: Hoy / Esta Semana / Este Mes
- Summary cards:
  - "Total Entregas": Count of completed deliveries
  - "Ingreso Bruto": $XX,XXX
  - "Comisión (X%)": -$X,XXX
  - "Ganancia Neta": $XX,XXX (highlighted)

**And** cash payment section:
- "Efectivo Recibido": $XX,XXX
- "Comisión Pendiente": $XX,XXX (what provider owes platform)
- "Pagar Comisión" button

**And** delivery history list:
- Date, amount, payment method
- Commission breakdown per delivery

**Prerequisites:** Story 3.6 (mark as delivered exists)

**Technical Notes:**
- Create `src/app/(provider)/earnings/page.tsx`
- Create `src/components/provider/earnings-dashboard.tsx`
- Aggregate from `commission_ledger` table
- Calculate pending = SUM(commission_owed) - SUM(commission_paid)

---

### Story 8.7: Cash Commission Settlement

As a **provider with pending commission**,
I want **to pay my platform commission via bank transfer**,
So that **I stay in good standing**.

**Acceptance Criteria:**

**Given** a provider has pending commission from cash deliveries
**When** they tap "Pagar Comisión"
**Then** they see:
- Amount due: "$XX,XXX"
- Platform bank details:
  - Banco: [Bank Name]
  - Cuenta: [Account Number]
  - Titular: nitoagua SpA
  - RUT: XX.XXX.XXX-X
- Upload receipt button
- "Confirmar Pago" button

**And** upon submission:
- Payment record created with status 'pending_verification'
- Admin notified for verification
- Provider sees "Pago enviado - En verificación"

**And** once admin verifies:
- Commission ledger updated (commission_paid)
- Provider notified: "Pago confirmado"
- Pending balance reduced

**Prerequisites:** Story 8.6

**Technical Notes:**
- Create `src/app/(provider)/earnings/withdraw/page.tsx`
- Use Supabase Storage for receipt uploads
- Create `withdrawal_requests` record
- Admin verification in Story 6.5

---

## Epic 9: Consumer Offer Selection

**Goal:** Enable consumers to view and select from multiple provider offers on their water requests. Core feature of the Consumer-Choice Offer Model.

**User Value:** Consumers get choice and control by viewing multiple offers with different delivery windows, then selecting their preferred provider. No more passive waiting - active selection empowers consumers.

**FRs Covered:** FR45, FR46, FR47, FR48, FR14, FR22, FR23

**Dependencies:**
- Requires Epic 8 (Provider Offer System) for providers to submit offers
- Epic 6 (Admin) for offer validity configuration

---

### Story 9.1: Offer List View for Consumers

As a **consumer with a pending request**,
I want **to view all offers submitted by providers**,
So that **I can compare options and choose the best fit for my needs**.

**Acceptance Criteria:**

**Given** a consumer has submitted a water request
**When** they view their request status page
**Then** they see:
- Request summary at top (amount, address, urgency)
- "Ofertas Recibidas" section with count badge
- List of offers sorted by delivery window (soonest first)

**And** each offer card shows:
- Provider name and avatar (if available)
- Delivery window: "Entrega: 2:00 PM - 4:00 PM"
- Price: "$XX,XXX" (base price for now - all offers same price)
- Time remaining: "Expira en 28:45" (countdown timer)
- "Seleccionar" button

**And** if no offers yet:
- "Esperando ofertas de repartidores..."
- "Tu solicitud fue enviada a los aguateros de la zona"
- Request timeout notice: "Si no recibes ofertas en 4 horas, te notificaremos"

**And** offers update in real-time via Supabase Realtime

**Prerequisites:** Story 2.6 (request status page exists)

**Technical Notes:**
- Create `src/app/(consumer)/request/[id]/offers/page.tsx`
- Create `src/components/consumer/offer-list.tsx`
- Create `src/components/consumer/offer-card.tsx`
- Use `use-realtime-offers.ts` hook for live updates
- Query: `SELECT * FROM offers WHERE request_id = ? AND status = 'active' ORDER BY delivery_window_start`

**Mockup Reference:** `docs/ux-mockups/00-consolidated-consumer-flow.html` (Offer Selection screen)

---

### Story 9.2: Select Provider Offer

As a **consumer viewing offers**,
I want **to select my preferred provider's offer**,
So that **my water delivery is confirmed with that provider**.

**Acceptance Criteria:**

**Given** a consumer is viewing offers on their request
**When** they tap "Seleccionar" on an offer
**Then** they see a confirmation modal:
- Provider info (name, avatar)
- Delivery window selected
- Price confirmation
- "Confirmar Selección" primary button
- "Volver" secondary button

**And** upon confirmation:
- Selected offer status changes to 'accepted'
- Request status changes to 'accepted'
- Selected offer's `accepted_at` timestamp is set
- All other offers on request change to 'request_filled'
- Consumer sees "¡Listo! Tu pedido fue asignado a [Provider Name]"
- Consumer is redirected to updated request status page

**And** provider is notified their offer was accepted
**And** other providers are notified their offers expired (request filled)

**Prerequisites:** Story 9.1

**Technical Notes:**
- Create `src/lib/actions/offers.ts` with `selectOffer(offerId)` action
- Transaction: Update offer → Update request → Cancel other offers → Create notifications
- RLS: Consumer can only select offers on their own requests
- Trigger email notification to provider (Story 5.2 pattern)

---

### Story 9.3: Offer Countdown Timer (Consumer View)

As a **consumer viewing offers**,
I want **to see how long each offer remains valid**,
So that **I know I need to decide before offers expire**.

**Acceptance Criteria:**

**Given** a consumer is viewing offers
**When** offers are displayed
**Then** each offer shows:
- Countdown timer: "Expira en MM:SS" (when < 1 hour)
- Countdown timer: "Expira en X h MM min" (when > 1 hour)
- Visual urgency indicator (orange when < 10 min, red when < 5 min)

**And** when an offer expires while consumer is viewing:
- Offer card shows "Expirada" badge (gray)
- "Seleccionar" button is disabled
- Offer moves to bottom of list or fades

**And** countdown updates every second (client-side)

**Prerequisites:** Story 9.1

**Technical Notes:**
- Create `src/hooks/use-countdown.ts` hook
- Create `src/components/shared/countdown-timer.tsx`
- Calculate from `offers.expires_at` timestamp
- Handle timezone correctly (server stores UTC, display local)

---

### Story 9.4: Request Timeout Notification

As a **consumer whose request received no offers**,
I want **to be notified when my request times out**,
So that **I know to try again or contact support**.

**Acceptance Criteria:**

**Given** a consumer's request has been pending for 4 hours
**When** no offers have been received
**Then** a cron job:
- Updates request status to 'no_offers'
- Creates in-app notification for consumer
- Sends email notification (if email provided)

**And** the consumer sees:
- Status: "Sin Ofertas" (orange badge)
- Message: "Lo sentimos, no hay aguateros disponibles ahora"
- Suggestion: "Intenta de nuevo más tarde o contacta soporte"
- "Nueva Solicitud" button
- "Contactar Soporte" link (WhatsApp)

**Prerequisites:** Story 9.1, Story 5.1 (email notifications)

**Technical Notes:**
- Create `src/app/api/cron/request-timeout/route.ts`
- Add `no_offers` to request status enum
- Query: `SELECT * FROM water_requests WHERE status = 'pending' AND created_at < NOW() - INTERVAL '4 hours'`
- Configure Vercel cron to run every 15 minutes

---

### Story 9.5: Request Status with Offer Context

As a **consumer tracking their request**,
I want **to see the selected provider's offer details on the status page**,
So that **I have the delivery information I agreed to**.

**Acceptance Criteria:**

**Given** a consumer has selected an offer on their request
**When** they view the request status page
**Then** they see:
- Current status with timeline (Solicitado → Aceptado → En Camino → Entregado)
- Selected offer details:
  - Provider name and phone
  - Confirmed delivery window: "Entrega estimada: 2:00 PM - 4:00 PM"
- "Llamar al repartidor" button
- "Cancelar" button (if still cancellable)

**And** when no offer selected yet:
- "Ver Ofertas" button linking to offers page
- Count of current offers: "3 ofertas disponibles"

**Prerequisites:** Story 9.2, Story 2.6

**Technical Notes:**
- Update `src/app/(consumer)/request/[id]/page.tsx`
- Join offers table to get selected offer details
- Show delivery window from accepted offer

---

## Epic 10: Consumer UX Enhancements

**Goal:** Address UX improvements identified during audit. Focus on location accuracy, negative states, payment options, and improved messaging.

**User Value:** Consumers get more accurate deliveries through map pinpoint, clearer communication about order status, and can choose their payment method.

**FRs Covered:** FR14, FR15, FR16, FR22, FR23

**Dependencies:**
- Builds on MVP consumer flow (Epics 2-4)

---

### Story 10.1: Map Location Pinpoint

As a **consumer**,
I want **to confirm my exact location on a map**,
So that **the provider can find me accurately**.

**Acceptance Criteria:**

**Given** a consumer enters their address in the request form
**When** they tap "Confirmar Ubicación"
**Then** they see:
- Interactive map centered on entered address
- Draggable pin for fine-tuning
- Address text displayed below map
- "Confirmar" / "Cambiar Dirección" buttons

**And** coordinates are saved with request (`latitude`, `longitude`)
**And** if map fails to load, text-only submission allowed with warning

**Prerequisites:** Story 2.2

**Technical Notes:**
- Create `src/components/consumer/location-pinpoint.tsx`
- Use Google Maps JavaScript API
- Add `latitude`, `longitude` columns to `water_requests`
- Graceful degradation for offline/failed map

---

### Story 10.2: Payment Method Selection

As a **consumer**,
I want **to choose how I'll pay**,
So that **I can use cash or bank transfer**.

**Acceptance Criteria:**

**Given** a consumer is on the request form
**When** they reach payment step
**Then** they see:
- "Efectivo" (Cash) - default, most common
  - "Paga al repartidor cuando llegue"
- "Transferencia" (Bank transfer)
  - Platform bank details shown
  - "Transfiere antes de la entrega"

**And** selected payment method is saved with request
**And** provider sees payment method in request details

**Prerequisites:** Story 2.3

**Technical Notes:**
- Add `payment_method` column (enum: 'cash', 'transfer')
- Create `src/components/consumer/payment-selector.tsx`
- Default to 'cash'

---

### Story 10.3: Negative Status States

As a **consumer**,
I want **to see clear explanations when my request fails**,
So that **I understand what happened and what to do next**.

**Acceptance Criteria:**

**Given** a request enters a negative state
**When** consumer views status
**Then** they see status-specific screens:

**No Offers (timeout):**
- Status: "Sin Ofertas" (orange)
- "No hay aguateros disponibles ahora"
- "Intentar de nuevo" button

**Cancelled by User:**
- Status: "Cancelada" (gray)
- "Cancelaste esta solicitud"
- "Nueva Solicitud" button

**Cancelled by Provider:**
- Status: "Cancelada" (gray)
- Reason if provided
- "Contactar Soporte" option

**And** each negative state includes support contact

**Prerequisites:** Story 2.6, Story 9.4

**Technical Notes:**
- Add 'no_offers', 'cancelled', 'failed' to status enum
- Create `src/components/consumer/negative-status.tsx`
- Add `cancel_reason` column

---

### Story 10.4: Urgency Pricing Display

As a **consumer**,
I want **to see urgency pricing impact clearly**,
So that **I can make informed decisions**.

**Acceptance Criteria:**

**Given** a consumer is on the request form
**When** they toggle urgency
**Then** they see:
- Normal: "Normal" (no surcharge shown)
- Urgente: "Urgente (+X%)" with visual indicator

**And** review screen shows price breakdown:
- Base price
- Urgency surcharge (if applicable)
- Total

**Prerequisites:** Story 2.2, Story 2.3

**Technical Notes:**
- Get `urgency_surcharge_percent` from admin settings
- Update request form urgency toggle
- Update review screen price display

---

### Story 10.5: Remove Fake Social Proof

As a **consumer**,
I want **to see authentic trust signals**,
So that **I can trust the platform based on real information**.

**Acceptance Criteria:**

**Given** the consumer home screen
**When** the page loads
**Then** fake stats are NOT displayed:
- No "500+ ENTREGAS"
- No "50+ AGUATEROS"
- No "4.8 RATING"

**And** instead, qualitative signals shown:
- "Proveedores verificados"
- "Agua certificada"
- "Servicio confiable"

**And** once real metrics exist (>50 deliveries), actual numbers can replace qualitative signals

**Prerequisites:** Story 2.1

**Technical Notes:**
- Update `src/app/(consumer)/page.tsx`
- Create feature flag for real stats threshold
- Track actual metrics for future display

---

## Updated Epic Summary

### All Epics Overview

| Epic | Title | Stories | Scope |
|------|-------|---------|-------|
| 1 | Foundation & Infrastructure | 5 | MVP |
| 2 | Consumer Water Request | 6 | MVP |
| 3 | Supplier Dashboard & Request Management | 7 | MVP |
| 4 | User Accounts & Profiles | 5 | MVP |
| 5 | Notifications & Communication | 3 | MVP |
| 6 | Admin Operations Panel | 8 | V2 |
| 7 | Provider Onboarding | 11 | V2 |
| 8 | Provider Offer System | 7 | V2 |
| 9 | Consumer Offer Selection | 5 | V2 |
| 10 | Consumer UX Enhancements | 5 | V2 |

**Total:** 10 Epics, 61 Stories (26 MVP + 35 V2)

### V2 Implementation Order

Epics 6-10 are numbered in dependency order. Implement sequentially:

1. **Epic 6** - Admin Operations Panel (foundation for V2)
2. **Epic 7** - Provider Onboarding (requires admin verification)
3. **Epic 8** - Provider Offer System (requires verified providers)
4. **Epic 9** - Consumer Offer Selection (requires offers to exist)
5. **Epic 10** - Consumer UX Enhancements (polish layer)

### Key Dependencies

```
Epic 6.1 (Admin Auth) ──────────────────────────────────┐
                                                        │
Epic 6.2 (Offer Config) ←───────────────────────────────┤
         │                                              │
         ├─→ Epic 8.2 (Submit Offer) ←── Epic 8.1       │
         │            │                                 │
         │            └─→ Epic 9.1 (View Offers) ←──────┤
         │                        │                     │
         │                        └─→ Epic 9.2 (Select) │
         │                                    │         │
         │                                    ├─→ Epic 8.5 (Acceptance Notification)
         │                                    │
         └─→ Epic 6.7 (Expiration Cron) ─────→ Epic 9.3 (Countdown)

Epic 7.1 (Provider Registration) ←── Epic 6.1
         │
         └─→ Epic 6.3 (Verification Queue)
                     │
                     └─→ Epic 7.2 (Verification Status) ─→ Epic 8.1 (Request Browser)
```

---

_V2 Post-MVP Epics generated for Consumer-Choice Offer Model (2025-12-12)_

_PRD Reference: `docs/prd-v2.md`_
_Architecture Reference: `docs/architecture.md`_
_UX Mockups: `docs/ux-mockups/`_
