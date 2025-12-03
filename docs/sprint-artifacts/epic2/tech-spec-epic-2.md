# Epic Technical Specification: Consumer Water Request

Date: 2025-12-03
Author: Gabe
Epic ID: 2
Status: Draft

---

## Overview

Epic 2 delivers the core consumer experience for nitoagua - the ability for anyone to request water delivery without registration barriers. This epic implements the "Doña María" user persona experience: a simple, obvious "Solicitar Agua" button that leads to a streamlined request flow. The epic encompasses 6 stories covering the home screen with the signature big action button, the guest request form with validation, request review and submission, confirmation display, and status tracking for both guest (via tracking token) and authenticated users.

This epic is foundational to proving nitoagua's value proposition: replacing scattered WhatsApp, Facebook, and phone-based coordination with a single, intuitive point of contact. Success means a consumer can complete a water request in under 2 minutes (guest) or 30 seconds (registered), then track their delivery status without needing to call the supplier.

## Objectives and Scope

**In Scope:**
- Consumer home screen with prominent "Solicitar Agua" BigActionButton component
- Guest water request form with all required fields (name, phone, email, address, special instructions, amount)
- Optional fields support (urgency toggle, geolocation)
- Chilean phone number validation (+56 format)
- Water amount selection via AmountSelector component (100L, 1000L, 5000L, 10000L)
- Request review screen before submission
- API endpoint for request creation (POST /api/requests)
- Request confirmation screen with tracking information
- Guest tracking page at `/track/[token]` (no auth required)
- Authenticated user request status page at `/request/[id]`
- StatusBadge component for visual status indication (Pending, Accepted, Delivered)
- Status timeline visualization
- Bottom navigation for consumer mobile experience
- Full Spanish (Chilean) interface
- Responsive design (mobile-first, tablet, desktop support)

**Out of Scope:**
- Consumer registration/login (Epic 4)
- Pre-filled forms for registered users (Epic 4)
- Request cancellation (Epic 4)
- Email notifications (Epic 5)
- In-app notifications (Epic 5)
- Supplier dashboard and request management (Epic 3)
- Payment processing
- Push notifications
- Map integration for address lookup (future enhancement)
- Offline request queuing (simplified implementation only)

## System Architecture Alignment

This epic aligns with the established architecture:

- **Framework:** Next.js 15 App Router with `(consumer)` route group for consumer-specific pages
- **UI Components:** shadcn/ui with custom components (BigActionButton, AmountSelector, StatusBadge)
- **Styling:** Tailwind CSS with Agua Pura theme (Primary: #0077B6, Secondary: #00A8E8)
- **Database:** Supabase PostgreSQL with `water_requests` table, RLS policies for data access
- **Validation:** Zod schemas for form validation with React Hook Form integration
- **API Pattern:** Next.js Route Handlers returning `{ data, error }` format
- **State Management:** React Context for auth state, URL state for request tracking
- **Guest Access:** Tracking token enables unauthenticated status checks via `/track/[token]`

**Key Architecture Components Used:**
- `src/app/(consumer)/page.tsx` - Consumer home
- `src/app/(consumer)/request/page.tsx` - Request form
- `src/app/(consumer)/request/[id]/page.tsx` - Request status (authenticated)
- `src/app/track/[token]/page.tsx` - Guest tracking
- `src/app/api/requests/route.ts` - Request creation API
- `src/components/consumer/*` - Consumer-specific components
- `src/lib/validations/request.ts` - Zod validation schema

## Detailed Design

### Services and Modules

| Module | Responsibility | Key Files | Owner |
|--------|---------------|-----------|-------|
| **Consumer Pages** | Route handling for consumer-facing pages | `src/app/(consumer)/*` | Frontend |
| **Request Form** | Water request data collection and validation | `src/components/consumer/request-form.tsx` | Frontend |
| **Request API** | Request creation and retrieval endpoints | `src/app/api/requests/route.ts` | Backend |
| **Tracking Service** | Guest request status lookup by token | `src/app/track/[token]/page.tsx` | Frontend/Backend |
| **Validation Layer** | Zod schemas for form and API validation | `src/lib/validations/request.ts` | Shared |
| **UI Components** | Custom consumer components | `src/components/consumer/*` | Frontend |
| **Shared Components** | Reusable status and display components | `src/components/shared/*` | Frontend |

**Custom Component Inventory:**

| Component | Purpose | Props |
|-----------|---------|-------|
| `BigActionButton` | 200x200px circular CTA for home screen | `onClick`, `loading`, `disabled` |
| `AmountSelector` | 2x2 grid for water volume selection | `value`, `onChange`, `prices` |
| `StatusBadge` | Visual status indicator | `status: 'pending' \| 'accepted' \| 'delivered' \| 'cancelled'` |
| `RequestForm` | Complete guest request form | `onSubmit`, `initialData?` |
| `StatusTracker` | Timeline visualization of request progress | `request`, `currentStatus` |

### Data Models and Contracts

**Water Request Entity (from `water_requests` table):**

```typescript
interface WaterRequest {
  id: string;                    // UUID, primary key
  // Consumer identification (guest OR registered)
  consumer_id: string | null;    // FK to profiles, null for guests
  guest_name: string | null;     // Guest consumer name
  guest_phone: string;           // Required for all requests
  guest_email: string | null;    // Required for guests (tracking link)
  tracking_token: string;        // UUID for guest status tracking
  // Request details
  address: string;               // Delivery address
  special_instructions: string;  // "Past the bridge" directions
  latitude: number | null;       // Optional geolocation
  longitude: number | null;
  amount: 100 | 1000 | 5000 | 10000;  // Water volume in liters
  is_urgent: boolean;            // Urgency flag
  // Status workflow
  status: 'pending' | 'accepted' | 'delivered' | 'cancelled';
  // Supplier assignment (set in Epic 3)
  supplier_id: string | null;
  delivery_window: string | null;
  decline_reason: string | null;
  // Timestamps
  created_at: string;            // ISO timestamp
  accepted_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
}
```

**Request Input Schema (Zod):**

```typescript
const requestSchema = z.object({
  name: z.string().min(2, "El nombre es requerido"),
  phone: z.string().regex(/^\+56[0-9]{9}$/, "Formato: +56912345678"),
  email: z.string().email("Email inválido").optional(),
  address: z.string().min(5, "La dirección es requerida"),
  specialInstructions: z.string().min(1, "Las instrucciones son requeridas"),
  amount: z.enum(["100", "1000", "5000", "10000"]),
  isUrgent: z.boolean().default(false),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});
```

**Supabase Database Types (generated):**

```typescript
// From src/types/database.ts
export type Database = {
  public: {
    Tables: {
      water_requests: {
        Row: WaterRequest;
        Insert: Omit<WaterRequest, 'id' | 'created_at' | 'tracking_token'>;
        Update: Partial<WaterRequest>;
      };
    };
  };
};
```

### APIs and Interfaces

**POST /api/requests** - Create new water request

```typescript
// Request Body
interface CreateRequestBody {
  name: string;
  phone: string;           // Format: +56912345678
  email?: string;          // Required for guests
  address: string;
  specialInstructions: string;
  amount: 100 | 1000 | 5000 | 10000;
  isUrgent?: boolean;
  latitude?: number;
  longitude?: number;
}

// Success Response (201 Created)
{
  data: {
    id: string;
    trackingToken: string;
    status: "pending";
    createdAt: string;
  },
  error: null
}

// Error Responses
// 400 Bad Request - Validation error
{
  data: null,
  error: {
    message: "Datos inválidos",
    code: "VALIDATION_ERROR",
    details?: ZodError
  }
}

// 500 Internal Server Error
{
  data: null,
  error: {
    message: "Error interno",
    code: "INTERNAL_ERROR"
  }
}
```

**GET /api/requests/[id]** - Get request by ID (authenticated users)

```typescript
// Success Response (200 OK)
{
  data: WaterRequest,
  error: null
}

// 404 Not Found
{
  data: null,
  error: {
    message: "Solicitud no encontrada",
    code: "NOT_FOUND"
  }
}
```

**GET /track/[token]** - Guest tracking page (Server Component)

- Fetches request by `tracking_token` using Supabase anon key
- Returns rendered page with status information
- No auth required

### Workflows and Sequencing

**Guest Request Flow:**

```
┌─────────────────┐
│  Consumer Home  │
│  (Big Button)   │
└────────┬────────┘
         │ tap "Solicitar Agua"
         ▼
┌─────────────────┐
│  Request Form   │
│  (Guest Flow)   │
└────────┬────────┘
         │ fill fields, validate
         ▼
┌─────────────────┐
│  Review Screen  │
│  (Confirm Data) │
└────────┬────────┘
         │ tap "Enviar Solicitud"
         ▼
┌─────────────────┐     ┌─────────────────┐
│  POST /api/     │────▶│   Supabase      │
│  requests       │     │   INSERT        │
└────────┬────────┘     └─────────────────┘
         │ success
         ▼
┌─────────────────┐
│  Confirmation   │
│  (Show Token)   │
└────────┬────────┘
         │ user clicks "Ver Estado"
         ▼
┌─────────────────┐
│  /track/[token] │
│  (Status Page)  │
└─────────────────┘
```

**Request Status State Machine:**

```
                    ┌─────────────┐
                    │   PENDING   │
                    └──────┬──────┘
                           │
          ┌────────────────┼────────────────┐
          │ (Epic 3:       │                │ (Epic 4:
          │  Supplier      │                │  Consumer
          │  accepts)      │                │  cancels)
          ▼                │                ▼
   ┌─────────────┐         │         ┌─────────────┐
   │  ACCEPTED   │         │         │  CANCELLED  │
   └──────┬──────┘         │         └─────────────┘
          │                │
          │ (Epic 3:       │
          │  Mark          │
          │  delivered)    │
          ▼                │
   ┌─────────────┐         │
   │  DELIVERED  │         │
   └─────────────┘         │
```

**Component Interaction Sequence:**

```
User                BigActionButton      RequestForm         API              Supabase
 │                       │                   │                │                  │
 │──tap───────────────▶│                   │                │                  │
 │                       │──navigate────────▶│                │                  │
 │                       │                   │                │                  │
 │──fill form──────────────────────────────▶│                │                  │
 │                       │                   │──validate──────│                  │
 │                       │                   │◀─────errors────│                  │
 │                       │                   │                │                  │
 │──submit─────────────────────────────────▶│                │                  │
 │                       │                   │──POST──────────▶│                  │
 │                       │                   │                │──INSERT─────────▶│
 │                       │                   │                │◀────success──────│
 │                       │                   │◀───response────│                  │
 │◀──confirmation────────────────────────────│                │                  │
```

## Non-Functional Requirements

### Performance

| Requirement | Target | Measurement | Source |
|-------------|--------|-------------|--------|
| **NFR1: Initial Load** | < 3 seconds on 3G | Lighthouse Performance Score > 80 | PRD NFR1 |
| **NFR2: Request Submission** | < 5 seconds on 3G | Time from submit click to confirmation | PRD NFR2 |
| **NFR4: Responsiveness** | No UI freezing | No blocking operations on main thread | PRD NFR4 |

**Implementation Strategies:**

- **Server Components:** Use React Server Components for initial page render to reduce client JS bundle
- **Code Splitting:** Lazy load form components, AmountSelector only when needed
- **Image Optimization:** Use Next.js Image component for PWA icons, limit image usage
- **Suspense Boundaries:** Wrap data-fetching components with Suspense for progressive loading
- **Optimistic UI:** Show loading states immediately, update UI before API response

**Measurable Targets for Epic 2:**

- Consumer home page LCP < 2.5s on mobile 3G
- Request form interactive (FID) < 100ms
- Form submission with loading state shown in < 200ms
- Tracking page loads in < 2s (simple server-rendered content)

### Security

| Requirement | Implementation | Source |
|-------------|----------------|--------|
| **NFR5: HTTPS** | Enforced by Vercel (automatic) | PRD NFR5 |
| **NFR9: Input Validation** | Zod schemas on client AND server | PRD NFR9 |

**Security Measures for Epic 2:**

- **Input Validation:** All form inputs validated via Zod before API submission
- **Phone Sanitization:** Chilean phone regex prevents injection: `/^\+56[0-9]{9}$/`
- **Address/Instructions:** Sanitize special characters, max length limits
- **Tracking Token:** UUID v4 provides 122 bits of entropy, not guessable
- **RLS Policies:** Guest requests insertable by anyone, but read access controlled
- **CSRF Protection:** Next.js built-in CSRF protection via SameSite cookies
- **XSS Prevention:** React DOM escaping, no dangerouslySetInnerHTML

**Data Privacy:**

- Guest tracking only shows partial address (last 4 chars masked)
- Full contact info only visible to assigned supplier (Epic 3)
- No PII logged in console or error tracking

### Reliability/Availability

| Requirement | Target | Implementation | Source |
|-------------|--------|----------------|--------|
| **NFR14: Uptime** | 99% during business hours | Vercel Edge Network SLA | PRD NFR14 |
| **NFR15: No Data Loss** | Zero lost requests | Supabase transaction integrity | PRD NFR15 |
| **NFR16: Error Handling** | User-friendly messages | Spanish error messages, recovery options | PRD NFR16 |
| **NFR17: Offline Queuing** | Queue if offline | localStorage queue, sync on reconnect | PRD NFR17 |

**Implementation:**

- **Error Boundaries:** Wrap major components to prevent full page crashes
- **Toast Notifications:** Use Sonner for success/error feedback
- **Retry Logic:** API calls retry once on network failure
- **Offline Detection:** Check `navigator.onLine` before submission
- **Local Queue:** If offline, store request in localStorage, submit when online
- **Form Persistence:** Save form state to sessionStorage on blur to prevent data loss

### Observability

**Logging Strategy (Development):**

```typescript
console.log("[REQUEST]", { action: "create", guestPhone: phone.slice(-4) });
console.error("[ERROR]", { context: "submitRequest", error: error.message });
```

**Production Logging:**

- Vercel automatic function logs
- Structured JSON format for parseability
- No PII in logs (phone masked, email omitted)

**Metrics to Track:**

| Metric | Description | Tool |
|--------|-------------|------|
| Request submission rate | Requests per hour/day | Vercel Analytics |
| Form abandonment | Users who start but don't submit | Future: PostHog |
| Error rate | Failed API calls | Vercel Logs |
| Load times | LCP, FID, CLS | Vercel Speed Insights |

**Alerting (Future):**

- Supabase dashboard for database monitoring
- Vercel deployment notifications
- Manual monitoring for MVP

## Dependencies and Integrations

### NPM Dependencies (from package.json)

| Package | Version | Purpose | Epic 2 Usage |
|---------|---------|---------|--------------|
| `next` | 16.0.6 | Framework | App Router, API routes, SSR |
| `react` | 19.2.0 | UI library | Component rendering |
| `react-dom` | 19.2.0 | DOM rendering | Client hydration |
| `@supabase/supabase-js` | ^2.86.0 | Database client | Request CRUD operations |
| `@supabase/ssr` | ^0.8.0 | SSR auth | Cookie-based sessions |
| `react-hook-form` | ^7.67.0 | Form handling | Request form state |
| `@hookform/resolvers` | ^5.2.2 | Validation integration | Zod + RHF binding |
| `zod` | ^4.1.13 | Schema validation | Request validation |
| `sonner` | ^2.0.7 | Toast notifications | Success/error feedback |
| `lucide-react` | ^0.555.0 | Icons | Water drop, status icons |
| `date-fns` | ^4.1.0 | Date formatting | "hace 2 horas" display |
| `clsx` | ^2.1.1 | Class utilities | Conditional styling |
| `tailwind-merge` | ^3.4.0 | Tailwind utilities | Class deduplication |
| `class-variance-authority` | ^0.7.1 | Variant styling | Button/badge variants |

### Radix UI Primitives (shadcn/ui dependencies)

| Package | Usage |
|---------|-------|
| `@radix-ui/react-dialog` | Review/confirmation modals |
| `@radix-ui/react-label` | Form field labels |
| `@radix-ui/react-select` | Dropdown selects (if needed) |
| `@radix-ui/react-slot` | Component composition |
| `@radix-ui/react-tabs` | Status tabs (future) |

### External Service Integrations

| Service | Purpose | Configuration | Epic 2 Scope |
|---------|---------|---------------|--------------|
| **Supabase** | Database + Auth | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Request storage, guest tracking |
| **Vercel** | Hosting | Automatic via deployment | Serves consumer pages |
| **Google Maps** | Address lookup | `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Optional geolocation (deferred) |

### Internal Module Dependencies

```
src/app/(consumer)/page.tsx
  └── src/components/consumer/big-action-button.tsx
        └── src/components/ui/button.tsx (shadcn)

src/app/(consumer)/request/page.tsx
  └── src/components/consumer/request-form.tsx
        ├── src/components/consumer/amount-selector.tsx
        ├── src/components/ui/input.tsx (shadcn)
        ├── src/components/ui/textarea.tsx (shadcn)
        ├── src/components/ui/form.tsx (shadcn)
        └── src/lib/validations/request.ts

src/app/api/requests/route.ts
  ├── src/lib/supabase/server.ts
  └── src/lib/validations/request.ts

src/app/track/[token]/page.tsx
  ├── src/lib/supabase/server.ts
  ├── src/components/shared/status-badge.tsx
  └── src/components/consumer/status-tracker.tsx
```

### Epic 1 Dependencies (Prerequisites)

Epic 2 requires these Epic 1 deliverables:

| Story | Dependency | Status |
|-------|------------|--------|
| 1.1 Project Initialization | Next.js project with shadcn/ui | ✅ Done |
| 1.2 Supabase Database | `water_requests` table schema | ✅ Done |
| 1.3 Supabase Auth | Auth middleware (for future registered users) | ✅ Done |
| 1.4 PWA Configuration | Manifest, service worker | ✅ Done |
| 1.5 Deployment Pipeline | Vercel deployment working | ✅ Done |

## Acceptance Criteria (Authoritative)

### Story 2-1: Consumer Home Screen with Big Action Button

| # | Acceptance Criterion |
|---|---------------------|
| AC2-1-1 | Consumer home page displays a 200x200px circular "Solicitar Agua" button with water drop icon |
| AC2-1-2 | Button has blue gradient (primary #0077B6 to secondary #00A8E8) with subtle shadow |
| AC2-1-3 | Button responds to hover (scale 1.05), active (scale 0.98), and loading (pulse) states |
| AC2-1-4 | Tapping button navigates to `/request` page |
| AC2-1-5 | Bottom navigation displays 3 items: Home, History, Profile with icons and labels |
| AC2-1-6 | All text is in Spanish (Chilean) |
| AC2-1-7 | Touch targets are minimum 44x44px for accessibility |

### Story 2-2: Water Request Form (Guest Flow)

| # | Acceptance Criterion |
|---|---------------------|
| AC2-2-1 | Form includes required fields: Name, Phone, Email, Address, Special Instructions, Amount |
| AC2-2-2 | Phone validates Chilean format (+56XXXXXXXXX) with validation hint |
| AC2-2-3 | Email validates proper email format |
| AC2-2-4 | AmountSelector displays 4 options (100L, 1000L, 5000L, 10000L) in 2x2 grid with prices |
| AC2-2-5 | Urgency toggle available (Normal/Urgente) |
| AC2-2-6 | "Use my location" button available for optional geolocation |
| AC2-2-7 | Validation errors display below fields in red (#EF4444) |
| AC2-2-8 | Required fields marked with asterisk (*) |

### Story 2-3: Request Review and Submission

| # | Acceptance Criterion |
|---|---------------------|
| AC2-3-1 | Review screen displays all entered information formatted clearly |
| AC2-3-2 | Water amount displays with corresponding price |
| AC2-3-3 | "Editar" button returns to form with data preserved |
| AC2-3-4 | "Enviar Solicitud" button shows loading spinner during submission |
| AC2-3-5 | Successful submission navigates to confirmation screen |
| AC2-3-6 | Failed submission shows toast notification with retry option |
| AC2-3-7 | If connection fails, request queues locally for later submission |

### Story 2-4: Request Confirmation Screen

| # | Acceptance Criterion |
|---|---------------------|
| AC2-4-1 | Confirmation displays success icon (green checkmark) |
| AC2-4-2 | Shows "¡Solicitud Enviada!" heading |
| AC2-4-3 | Displays request ID/number |
| AC2-4-4 | Shows message: "El aguatero te contactará pronto" |
| AC2-4-5 | Displays supplier phone number |
| AC2-4-6 | "Ver Estado" button navigates to status tracking |
| AC2-4-7 | "Nueva Solicitud" button returns to request form |
| AC2-4-8 | Guest consumers see email notification message with tracking link format |

### Story 2-5: Request Status Tracking (Guest)

| # | Acceptance Criterion |
|---|---------------------|
| AC2-5-1 | Tracking page accessible at `/track/[token]` without authentication |
| AC2-5-2 | StatusBadge displays correct state: Pendiente (amber), Aceptada (blue), Entregada (green) |
| AC2-5-3 | Visual progress indicator shows: Pending → Accepted → Delivered |
| AC2-5-4 | Request details show amount and partial address (privacy) |
| AC2-5-5 | If accepted: Shows delivery window and supplier phone |
| AC2-5-6 | If delivered: Shows completion message with timestamp |
| AC2-5-7 | Page auto-refreshes every 30 seconds |
| AC2-5-8 | Invalid tokens show "Solicitud no encontrada" error |

### Story 2-6: Request Status Page (Consumer View)

| # | Acceptance Criterion |
|---|---------------------|
| AC2-6-1 | Status page accessible at `/request/[id]` |
| AC2-6-2 | StatusBadge shows current state |
| AC2-6-3 | Timeline visualization displays: Created → Accepted → Delivered |
| AC2-6-4 | Shows request details: date, amount, address, special instructions |
| AC2-6-5 | Pending status shows: "Esperando confirmación del aguatero" |
| AC2-6-6 | Accepted status shows: "¡Confirmado! Tu agua viene en camino" with supplier info |
| AC2-6-7 | Delivered status shows: "Entrega completada" with timestamp |

## Traceability Mapping

| AC | FR | Spec Section | Component(s) | Test Idea |
|----|-----|--------------|--------------|-----------|
| AC2-1-1 | FR38, FR41 | Detailed Design > Services | BigActionButton | Visual regression test |
| AC2-1-2 | UX Spec | Visual Foundation | BigActionButton | Verify gradient colors |
| AC2-1-3 | FR41 | UX Patterns | BigActionButton | Interactive state tests |
| AC2-1-4 | FR7 | Workflows | Consumer routing | Navigation E2E test |
| AC2-1-5 | FR40 | Project Structure | ConsumerNav | Layout test |
| AC2-1-6 | FR40 | Objectives | All UI | Spanish text verification |
| AC2-1-7 | NFR10 | Accessibility | All touch elements | Accessibility audit |
| AC2-2-1 | FR8 | Data Models | RequestForm | Form field presence test |
| AC2-2-2 | FR8 | Validation | request.ts | Phone regex unit test |
| AC2-2-3 | FR9 | Validation | request.ts | Email validation test |
| AC2-2-4 | FR10 | Data Models | AmountSelector | Selection behavior test |
| AC2-2-5 | FR11 | Data Models | RequestForm | Toggle behavior test |
| AC2-2-6 | FR9 | APIs | Geolocation API | Browser API integration |
| AC2-2-7 | NFR9 | Validation | Form component | Error display test |
| AC2-2-8 | UX Spec | Form Patterns | Form labels | Visual verification |
| AC2-3-1 | FR13 | Workflows | Review component | Content verification test |
| AC2-3-2 | FR10 | Data Models | Review component | Price display test |
| AC2-3-3 | FR7 | Workflows | Form navigation | Back button test |
| AC2-3-4 | FR7 | NFR Performance | Submit button | Loading state test |
| AC2-3-5 | FR7 | APIs | API route | Success flow E2E |
| AC2-3-6 | NFR16 | Error Handling | Toast component | Error handling test |
| AC2-3-7 | NFR17 | Reliability | Offline queue | Offline submission test |
| AC2-4-1 | FR7 | Workflows | Confirmation screen | Visual verification |
| AC2-4-2 | FR40 | Objectives | Confirmation screen | Spanish text check |
| AC2-4-3 | FR7 | Data Models | Confirmation screen | ID display test |
| AC2-4-4 | FR40 | Objectives | Confirmation screen | Message verification |
| AC2-4-5 | FR36 | APIs | Confirmation screen | Supplier info display |
| AC2-4-6 | FR14 | Workflows | Navigation | Link navigation test |
| AC2-4-7 | FR7 | Workflows | Navigation | New request flow test |
| AC2-4-8 | FR6 | APIs | Confirmation screen | Tracking link test |
| AC2-5-1 | FR6, FR1 | APIs | Track page | Guest access test |
| AC2-5-2 | FR14 | Data Models | StatusBadge | State color verification |
| AC2-5-3 | FR14 | Workflows | StatusTracker | Progress visualization test |
| AC2-5-4 | FR43 | Security | Track page | Privacy masking test |
| AC2-5-5 | FR18 | Data Models | Track page | Accepted state info |
| AC2-5-6 | FR14 | Data Models | Track page | Delivered state info |
| AC2-5-7 | FR14 | NFR Performance | Track page | Auto-refresh test |
| AC2-5-8 | NFR16 | Error Handling | Track page | Invalid token test |
| AC2-6-1 | FR14 | APIs | Request status page | Route access test |
| AC2-6-2 | FR14 | Data Models | StatusBadge | Badge rendering test |
| AC2-6-3 | FR14 | Workflows | StatusTracker | Timeline test |
| AC2-6-4 | FR14 | Data Models | Request details | Content display test |
| AC2-6-5 | FR14, FR40 | Objectives | Status messages | Pending state text |
| AC2-6-6 | FR14, FR18 | Data Models | Status messages | Accepted state test |
| AC2-6-7 | FR14 | Data Models | Status messages | Delivered state test |

## Risks, Assumptions, Open Questions

### Risks

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|------------|--------|------------|
| R1 | **Chilean phone validation too strict** - Users may enter phones in different formats | Medium | High | Accept multiple formats (+56, 56, 9) and normalize to +56 format |
| R2 | **Guest tracking token enumeration** - Malicious actors could try to guess tokens | Low | Medium | UUID v4 has 122 bits entropy; rate limit `/track` endpoint |
| R3 | **Offline queue data loss** - localStorage may be cleared by user | Medium | Medium | Warn users; show pending queue count; sync aggressively |
| R4 | **Address ambiguity** - Rural addresses don't map cleanly | High | Low | Special instructions field is mandatory; address is secondary |
| R5 | **Form abandonment** - Users may not complete long form | Medium | Medium | Save form state to sessionStorage; minimize required fields |
| R6 | **Supplier phone visibility** - Privacy concern showing supplier info | Low | Low | Supplier opted in by registering; phone is business number |

### Assumptions

| ID | Assumption | Validation Approach |
|----|------------|---------------------|
| A1 | **Single supplier for MVP** - Only one aguatero in the system | Hardcode supplier lookup in confirmation; migrate to query in Epic 3 |
| A2 | **Guest flow is primary** - Most users won't register immediately | Track ratio of guest vs registered requests (Epic 4) |
| A3 | **Chilean Spanish is understood** - No need for regional variations | User feedback during pilot |
| A4 | **Mobile-first users** - Consumers primarily use Android phones | Verify mobile traffic in Vercel Analytics |
| A5 | **Email delivery works** - Guests will receive tracking emails | Resend delivery logs; fallback to phone contact |
| A6 | **Supabase RLS sufficient** - No additional API-level auth needed for guests | Security review of RLS policies |

### Open Questions

| ID | Question | Owner | Resolution Date | Impact |
|----|----------|-------|-----------------|--------|
| Q1 | Should we show supplier's pricing on the amount selector? | PM | Before Story 2-2 | Affects AmountSelector component design |
| Q2 | What's the max length for special instructions? | PM | Before Story 2-2 | Database constraint + UI validation |
| Q3 | Should tracking page show all historical status changes or just current? | UX | Before Story 2-5 | Affects StatusTracker complexity |
| Q4 | Is 30-second auto-refresh sufficient for status updates? | PM | Before Story 2-5 | Balance between UX and server load |
| Q5 | Should we capture why users abandon the form? | PM | Post-MVP | Analytics implementation |

**Resolution Notes:**
- Q1: Resolved - Yes, show prices on AmountSelector per UX spec
- Q2: Resolved - 500 character limit for special instructions
- Q3: Resolved - Show timeline with current position, not full history
- Q4: Resolved - 30 seconds is acceptable for MVP; consider SSE for v2

## Test Strategy Summary

### Test Levels

| Level | Scope | Framework | Coverage Target |
|-------|-------|-----------|-----------------|
| **Unit** | Validation schemas, utility functions | Vitest (future) | 80% of lib/ files |
| **Component** | React components in isolation | React Testing Library (future) | Critical paths |
| **E2E** | Full user flows | Playwright | All happy paths + key error cases |
| **Manual** | Visual verification, accessibility | Human QA | Every story before done |

### E2E Test Coverage (Playwright)

**Epic 2 Test Suites:**

```typescript
// tests/e2e/consumer-request.spec.ts

describe('Consumer Home Screen', () => {
  test('displays big action button with correct styling');
  test('button navigates to request form on click');
  test('bottom navigation shows Home, History, Profile');
});

describe('Guest Request Form', () => {
  test('form displays all required fields');
  test('phone validation shows error for invalid format');
  test('phone validation accepts valid Chilean format');
  test('amount selector allows single selection');
  test('urgency toggle works correctly');
  test('form prevents submission with missing required fields');
});

describe('Request Submission Flow', () => {
  test('successful submission shows confirmation screen');
  test('confirmation displays request ID and tracking link');
  test('confirmation shows supplier phone number');
});

describe('Guest Tracking', () => {
  test('tracking page loads with valid token');
  test('invalid token shows error page');
  test('status badge displays correct state');
  test('accepted status shows supplier info');
});
```

### Acceptance Criteria Coverage

| Story | ACs | E2E Tests | Manual Tests |
|-------|-----|-----------|--------------|
| 2-1 | 7 | 3 | Visual verification, touch target audit |
| 2-2 | 8 | 5 | Field label check, error message text |
| 2-3 | 7 | 4 | Review screen layout, offline scenario |
| 2-4 | 8 | 3 | Success icon appearance, Spanish text |
| 2-5 | 8 | 4 | Status badge colors, auto-refresh |
| 2-6 | 7 | 3 | Timeline visualization |

### Edge Cases to Test

| Scenario | Test Approach |
|----------|---------------|
| Very long special instructions (500+ chars) | E2E: Verify truncation/scroll |
| Phone with spaces/dashes | Unit: Normalization test |
| Double submit (fast clicks) | E2E: Debounce verification |
| Network disconnect mid-submit | E2E: Offline detection test |
| Slow network (3G simulation) | E2E: Loading state duration |
| Invalid tracking token format | E2E: Error handling |
| Expired session during form fill | E2E: Session recovery |

### Accessibility Testing

| Test | Tool | Frequency |
|------|------|-----------|
| Color contrast | Lighthouse | Every build |
| Keyboard navigation | Manual | Per story |
| Screen reader | VoiceOver (Mac) | Per epic |
| Touch target sizes | axe DevTools | Per story |

### Performance Testing

| Metric | Target | Tool | Gate |
|--------|--------|------|------|
| LCP | < 2.5s | Lighthouse CI | Block deployment |
| FID | < 100ms | Lighthouse CI | Warning |
| CLS | < 0.1 | Lighthouse CI | Warning |
| Bundle size | < 150KB (first load) | Next.js build | Warning |

### Test Data Requirements

```typescript
// tests/fixtures/request.ts
export const validRequest = {
  name: "María González",
  phone: "+56912345678",
  email: "maria@test.cl",
  address: "Camino Los Robles 123, Villarrica",
  specialInstructions: "Después del puente, casa azul con portón verde",
  amount: 1000,
  isUrgent: false
};

export const invalidPhones = [
  "12345678",        // Missing country code
  "+56123456789",    // 10 digits instead of 9
  "+1234567890",     // Wrong country code
  "phone number"     // Non-numeric
];
```

---

_Tech Spec generated by BMAD Method - Epic Tech Context Workflow_
_Date: 2025-12-03_
_For: Gabe_
