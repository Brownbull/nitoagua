# Epic Technical Specification: Supplier Dashboard & Request Management

Date: 2025-12-03
Author: Gabe
Epic ID: 3
Status: Draft

---

## Overview

Epic 3 delivers the supplier-side experience for nitoagua, enabling water delivery operators ("Don Pedro") to manage all incoming water requests through a unified dashboard. This epic replaces the chaos of scattered WhatsApp, Facebook, and phone-based communications with a single point of truth for all pending, accepted, and completed deliveries.

**Key Change from Original Specification:** Authentication will use **Google OAuth only** (via Supabase Auth) instead of email/password. This simplifies the auth flow, eliminates password management, and leverages Google's security infrastructure. All users (both suppliers and consumers in future epics) will authenticate exclusively through their Google accounts.

The supplier dashboard is designed for "Don Pedro" - a tech-comfortable user who needs efficiency tools. Unlike the consumer experience (ultra-simple), the supplier experience is feature-rich with sorting, filtering, and batch operations.

## Objectives and Scope

### In Scope

- **Google OAuth Authentication** - Supplier registration and login via Google Sign-In
- **Supplier Profile Management** - Business info, service area, pricing tiers, availability toggle
- **Request Dashboard** - Unified view of all water requests with tabs (Pending/Accepted/Completed)
- **Request Card UI** - Visual cards showing customer info, location, amount, urgency, time
- **Accept Flow** - One-tap accept with optional delivery window
- **Delivery Completion** - Mark requests as delivered with confirmation
- **Request Details View** - Full customer information with map (if coordinates available)
- **Decline Flow** - Option to decline with reason (returns to pending pool for future marketplace)

### Out of Scope (MVP)

- Multiple suppliers per region (marketplace - future epic)
- Route optimization or delivery sequencing
- Push notifications (supplier checks dashboard manually)
- Supplier ratings or reviews
- Payment processing integration
- Capacity tracking or inventory management
- Consumer registration/login (Epic 4)

### Stories in This Epic

| Story | Title | Focus |
|-------|-------|-------|
| 3-1 | Supplier Registration | Google OAuth + profile creation |
| 3-2 | Supplier Login | Google OAuth sign-in flow |
| 3-3 | Supplier Request Dashboard | Main dashboard with request list |
| 3-4 | Supplier Request Details View | Full request info modal/page |
| 3-5 | Accept Request with Delivery Window | Accept workflow |
| 3-6 | Mark Request as Delivered | Delivery completion |
| 3-7 | Supplier Profile Management | Profile editing, pricing, availability |
| 3-8 | Epic Deployment & Verification | Git flow, deploy, production verification |

## System Architecture Alignment

### Architecture Components Used

| Component | Usage in Epic 3 |
|-----------|-----------------|
| Next.js App Router | `src/app/(supplier)/*` route group, `src/app/(auth)/*` for OAuth |
| Supabase Auth | Google OAuth provider, session management |
| Supabase Database | `profiles` table (supplier data), `water_requests` queries |
| shadcn/ui | Dashboard UI components, cards, tabs, dialogs |
| React Hook Form + Zod | Profile form validation |

### Route Structure

```
src/app/
├── (auth)/
│   ├── login/page.tsx          # Google OAuth login
│   └── auth/callback/route.ts  # OAuth callback handler
├── (supplier)/
│   ├── layout.tsx              # Supplier layout with sidebar/header
│   ├── dashboard/page.tsx      # Main request dashboard
│   ├── requests/[id]/page.tsx  # Request details (or modal)
│   └── profile/page.tsx        # Supplier profile management
```

### Component Structure

```
src/components/
├── supplier/
│   ├── request-card.tsx        # Individual request card
│   ├── request-list.tsx        # List of request cards
│   ├── stats-header.tsx        # Dashboard stats (pending/today/week)
│   ├── delivery-modal.tsx      # Accept with delivery window
│   └── profile-form.tsx        # Supplier profile editing
├── shared/
│   └── status-badge.tsx        # Reused from Epic 2
└── auth/
    └── google-sign-in.tsx      # Google OAuth button
```

## Detailed Design

### Services and Modules

| Module | Responsibility | Key Files |
|--------|---------------|-----------|
| **Auth Module** | Google OAuth flow, session management, role detection | `src/lib/supabase/client.ts`, `src/app/(auth)/*` |
| **Supplier Dashboard** | Request listing, filtering, sorting, stats | `src/app/(supplier)/dashboard/page.tsx` |
| **Request Management** | Accept, decline, mark delivered actions | `src/app/api/requests/[id]/route.ts` |
| **Profile Management** | Supplier profile CRUD, pricing, availability | `src/app/(supplier)/profile/page.tsx` |
| **Notification Trigger** | Email notifications on status change | `src/lib/email/*` (from Epic 5, stub for now) |

### Data Models and Contracts

#### Profiles Table (Supplier Fields)

```sql
-- Existing table from Epic 1, supplier-specific fields:
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('consumer', 'supplier')),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  special_instructions TEXT,
  -- Supplier-specific fields (used in Epic 3)
  service_area TEXT,                    -- e.g., "Villarrica"
  price_100l INTEGER,                   -- Price in CLP for 100L
  price_1000l INTEGER,                  -- Price in CLP for 1000L
  price_5000l INTEGER,                  -- Price in CLP for 5000L
  price_10000l INTEGER,                 -- Price in CLP for 10000L
  is_available BOOLEAN DEFAULT true,    -- Vacation mode toggle
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### TypeScript Types

```typescript
// src/types/supplier.ts
export interface SupplierProfile {
  id: string;
  role: 'supplier';
  name: string;
  phone: string;
  serviceArea: string;
  price100l: number;
  price1000l: number;
  price5000l: number;
  price10000l: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierProfileInput {
  name: string;
  phone: string;
  serviceArea: string;
  price100l: number;
  price1000l: number;
  price5000l: number;
  price10000l: number;
}
```

### APIs and Interfaces

#### Google OAuth Flow

```typescript
// POST /api/auth/callback (handled by Supabase)
// Supabase Auth handles the OAuth callback automatically

// Client-side Google sign-in
import { createClient } from '@/lib/supabase/client';

async function signInWithGoogle() {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });
}
```

#### Supplier Profile API

```typescript
// GET /api/supplier/profile
// Response: { data: SupplierProfile, error: null }

// PATCH /api/supplier/profile
// Request: SupplierProfileInput
// Response: { data: SupplierProfile, error: null }
```

#### Request Actions API

```typescript
// PATCH /api/requests/[id]
// Actions for supplier:

// Accept request
{ action: "accept", deliveryWindow?: string }
// Response: { data: { id, status: "accepted", acceptedAt }, error: null }

// Mark delivered
{ action: "deliver" }
// Response: { data: { id, status: "delivered", deliveredAt }, error: null }

// Decline request
{ action: "decline", reason?: string }
// Response: { data: { id, status: "pending", declineReason }, error: null }
```

#### Dashboard Query

```typescript
// GET /api/requests?status=pending|accepted|delivered&sort=created_at|is_urgent&order=asc|desc

// Response
{
  data: WaterRequest[],
  meta: {
    total: number,
    pending: number,
    todayDeliveries: number,
    weekDeliveries: number
  },
  error: null
}
```

### Workflows and Sequencing

#### Supplier Registration Flow (Google OAuth)

```
1. User clicks "Continuar con Google" on login page
2. Redirect to Google OAuth consent screen
3. User authenticates with Google account
4. Google redirects to /auth/callback with code
5. Supabase exchanges code for session
6. Check if profile exists:
   - If no profile → redirect to /onboarding (create supplier profile)
   - If profile exists → redirect to /dashboard
7. On onboarding, user fills: name, phone, service area, prices
8. Profile created with role='supplier'
9. Redirect to dashboard
```

#### Accept Request Flow

```
1. Supplier views pending request card
2. Clicks "Aceptar" button
3. Optional: Modal opens for delivery window input
4. Clicks "Confirmar"
5. API: PATCH /api/requests/[id] { action: "accept", deliveryWindow }
6. Request status → "accepted", supplier_id set, accepted_at timestamped
7. Card moves to "Aceptadas" tab
8. Toast: "Solicitud aceptada"
9. (Future: Email notification to consumer)
```

#### Mark Delivered Flow

```
1. Supplier views accepted request
2. Clicks "Marcar Entregado"
3. Confirmation dialog: "¿Confirmar entrega completada?"
4. Clicks "Confirmar"
5. API: PATCH /api/requests/[id] { action: "deliver" }
6. Request status → "delivered", delivered_at timestamped
7. Card moves to "Completadas" tab
8. Toast: "Entrega completada"
9. (Future: Email notification to consumer)
```

## Non-Functional Requirements

### Performance

| Requirement | Target | Implementation |
|-------------|--------|----------------|
| **NFR3** Dashboard load | < 3 seconds | Server-side data fetching, pagination if > 50 requests |
| **NFR4** Responsive UI | No freezing | Loading states, skeleton components, optimistic updates |
| Google OAuth | < 2 seconds redirect | Standard Supabase OAuth flow |
| Accept action | < 1 second feedback | Optimistic UI update, background sync |

### Security

| Requirement | Implementation |
|-------------|----------------|
| **NFR5** HTTPS | Enforced by Vercel (automatic) |
| Google OAuth | Supabase manages token exchange securely |
| Session management | Supabase JWT in HTTP-only cookies |
| **NFR8** Rate limiting | Vercel Edge (100 req/10s), Supabase Auth rate limits |
| RLS Policies | Suppliers can only update requests they've accepted |
| Role verification | Check `profile.role === 'supplier'` before allowing dashboard access |

**Google OAuth Configuration Required:**
1. Create Google Cloud Project
2. Configure OAuth consent screen
3. Add authorized redirect URI: `https://<project>.supabase.co/auth/v1/callback`
4. Enable Google provider in Supabase Dashboard → Authentication → Providers

### Reliability/Availability

| Requirement | Target | Strategy |
|-------------|--------|----------|
| **NFR14** Uptime | 99% (6am-10pm Chile) | Vercel + Supabase managed infrastructure |
| **NFR15** No data loss | Zero | Supabase PostgreSQL with automatic backups |
| **NFR16** Error handling | User-friendly | Toast notifications, retry options |
| OAuth failures | Graceful | Show error message, retry button |

### Observability

| Signal | Implementation |
|--------|----------------|
| Errors | Vercel logs (automatic), console.error with context |
| Auth events | Supabase Auth logs (Dashboard → Logs) |
| Request actions | Log `[REQUEST]` with action, supplierId, requestId |
| Performance | Vercel Analytics (automatic) |

## Dependencies and Integrations

### Existing Dependencies (from package.json)

| Package | Version | Usage in Epic 3 |
|---------|---------|-----------------|
| `@supabase/supabase-js` | ^2.86.0 | Database queries, auth |
| `@supabase/ssr` | ^0.8.0 | Server-side auth, cookies |
| `@radix-ui/react-tabs` | ^1.1.13 | Dashboard tabs (Pending/Accepted/Completed) |
| `@radix-ui/react-dialog` | ^1.1.15 | Delivery window modal, confirmations |
| `@radix-ui/react-select` | ^2.2.6 | Service area dropdown |
| `react-hook-form` | ^7.67.0 | Profile form, delivery window form |
| `zod` | ^4.1.13 | Validation schemas |
| `date-fns` | ^4.1.0 | "hace X horas" formatting |
| `lucide-react` | ^0.555.0 | Icons (check, x, truck, etc.) |

### New Dependencies Required

None - all needed packages are already installed.

### External Services

| Service | Purpose | Configuration |
|---------|---------|---------------|
| **Google Cloud** | OAuth provider | Create project, OAuth consent screen, credentials |
| **Supabase Auth** | Google OAuth integration | Enable Google provider, add client ID/secret |

### Internal Dependencies

| Depends On | From Epic | Required For |
|------------|-----------|--------------|
| `profiles` table | Epic 1 | Supplier profile storage |
| `water_requests` table | Epic 1 | Request data |
| `createAdminClient()` | Epic 2 | Server-side operations (if needed) |
| `createServerClient()` | Epic 1 | Auth-aware server queries |
| Status badge component | Epic 2 | Reuse in dashboard |

## Acceptance Criteria (Authoritative)

### Story 3-1: Supplier Registration (Google OAuth)

| AC ID | Criteria |
|-------|----------|
| AC3-1-1 | "Continuar con Google" button visible on login page |
| AC3-1-2 | Clicking button redirects to Google OAuth consent screen |
| AC3-1-3 | After Google auth, new users redirect to onboarding page |
| AC3-1-4 | Onboarding form collects: name, phone, service area, 4 price tiers |
| AC3-1-5 | Profile created with `role='supplier'` in profiles table |
| AC3-1-6 | After profile creation, redirect to supplier dashboard |
| AC3-1-7 | Toast: "¡Bienvenido a nitoagua!" |
| AC3-1-8 | Validation errors show inline below fields (Chilean phone format) |

### Story 3-2: Supplier Login (Google OAuth)

| AC ID | Criteria |
|-------|----------|
| AC3-2-1 | Existing supplier clicks "Continuar con Google" |
| AC3-2-2 | After Google auth, redirect directly to dashboard (no onboarding) |
| AC3-2-3 | Session persisted (stay logged in on refresh) |
| AC3-2-4 | Role check: if profile.role !== 'supplier', redirect to consumer home |
| AC3-2-5 | OAuth error shows: "Error al iniciar sesión. Intenta de nuevo." |

### Story 3-3: Supplier Request Dashboard

| AC ID | Criteria |
|-------|----------|
| AC3-3-1 | Dashboard shows stats header: Pending count, Today's deliveries, Week total |
| AC3-3-2 | Tab navigation: Pendientes \| Aceptadas \| Completadas |
| AC3-3-3 | Request cards show: name, address (truncated), amount badge, urgency, time |
| AC3-3-4 | Urgent requests have red left border |
| AC3-3-5 | Cards sorted by: urgency first, then oldest first |
| AC3-3-6 | Each card has "Aceptar" and "Ver Detalles" buttons |
| AC3-3-7 | Empty state: "No hay solicitudes pendientes" |

### Story 3-4: Supplier Request Details View

| AC ID | Criteria |
|-------|----------|
| AC3-4-1 | Details show full: name, phone (clickable), address, special instructions |
| AC3-4-2 | Amount and urgency clearly displayed |
| AC3-4-3 | Submission time shown ("hace X horas" or date) |
| AC3-4-4 | Map preview if coordinates available |
| AC3-4-5 | Accept/Decline actions available for pending requests |

### Story 3-5: Accept Request with Delivery Window

| AC ID | Criteria |
|-------|----------|
| AC3-5-1 | "Aceptar" button opens optional delivery window modal |
| AC3-5-2 | Delivery window is optional text field (e.g., "Mañana 2-4pm") |
| AC3-5-3 | Confirm sets: status='accepted', supplier_id, accepted_at |
| AC3-5-4 | Request moves to "Aceptadas" tab |
| AC3-5-5 | Toast: "Solicitud aceptada" |
| AC3-5-6 | (Stub) Consumer notification triggered |

### Story 3-6: Mark Request as Delivered

| AC ID | Criteria |
|-------|----------|
| AC3-6-1 | "Marcar Entregado" button on accepted requests |
| AC3-6-2 | Confirmation dialog: "¿Confirmar entrega completada?" |
| AC3-6-3 | Confirm sets: status='delivered', delivered_at |
| AC3-6-4 | Request moves to "Completadas" tab |
| AC3-6-5 | Toast: "Entrega completada" |
| AC3-6-6 | (Stub) Consumer notification triggered |

### Story 3-7: Supplier Profile Management

| AC ID | Criteria |
|-------|----------|
| AC3-7-1 | Profile page accessible from dashboard navigation |
| AC3-7-2 | Edit: name, phone, service area, 4 price tiers |
| AC3-7-3 | Availability toggle (vacation mode) |
| AC3-7-4 | Save shows toast: "Perfil actualizado" |
| AC3-7-5 | Validation: phone format, prices must be positive integers |
| AC3-7-6 | Logout button signs out and redirects to login |

### Story 3-8: Epic Deployment & Verification

| AC ID | Criteria |
|-------|----------|
| AC3-8-1 | All Epic 3 changes committed to develop branch |
| AC3-8-2 | Develop merged to staging, preview deployment verified |
| AC3-8-3 | Staging merged to main, production deployment triggered |
| AC3-8-4 | Production deployment successful (Vercel build passes) |
| AC3-8-5 | Google OAuth flow works in production |
| AC3-8-6 | Supplier can register, login, view dashboard in production |
| AC3-8-7 | Supplier can accept request and mark delivered in production |
| AC3-8-8 | All E2E tests pass (existing + new supplier tests) |
| AC3-8-9 | No regression in consumer flows (guest request still works) |

## Traceability Mapping

| AC | PRD FR | Spec Section | Component | Test Idea |
|----|--------|--------------|-----------|-----------|
| AC3-1-1..8 | FR19-FR21 | Supplier Registration | `google-sign-in.tsx`, `/onboarding` | E2E: OAuth flow mock, profile creation |
| AC3-2-1..5 | FR19 | Supplier Login | `/login`, auth callback | E2E: Login redirect, session persistence |
| AC3-3-1..7 | FR24-FR28 | Dashboard | `dashboard/page.tsx`, `request-card.tsx` | E2E: Dashboard loads, cards display, tabs work |
| AC3-4-1..5 | FR25, FR28 | Request Details | `requests/[id]/page.tsx` | E2E: Details modal, map if coords |
| AC3-5-1..6 | FR29-FR30 | Accept Flow | `delivery-modal.tsx`, API route | E2E: Accept flow, status change |
| AC3-6-1..6 | FR31 | Deliver Flow | API route, confirmation dialog | E2E: Deliver flow, status change |
| AC3-7-1..6 | FR22-FR23 | Profile | `profile/page.tsx`, `profile-form.tsx` | E2E: Edit profile, availability toggle |
| AC3-8-1..9 | FR38-FR42 | Deployment | Git, Vercel | Manual: production verification |

## Risks, Assumptions, Open Questions

### Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| **R1** Google OAuth setup complexity | Medium | Low | Follow Supabase docs, test in local Supabase first |
| **R2** OAuth callback issues in production | High | Medium | Test thoroughly on preview deployments before main |
| **R3** Session persistence across tabs | Medium | Low | Use Supabase SSR patterns (already established in Epic 1) |
| **R4** Role confusion (supplier vs consumer) | Medium | Medium | Clear role check on auth callback, redirect logic |

### Assumptions

| ID | Assumption | Validation |
|----|------------|------------|
| **A1** | Suppliers have Google accounts | Valid for tech-comfortable target users |
| **A2** | Single supplier MVP (no marketplace) | Per PRD constraints |
| **A3** | Supabase free tier sufficient | Yes - 50k monthly active users |
| **A4** | Email notifications deferred to Epic 5 | Per epic planning |

### Open Questions

| ID | Question | Owner | Status |
|----|----------|-------|--------|
| **Q1** | Should we support consumer Google login too? | Gabe | **Answered: Yes** - all auth is Google-only |
| **Q2** | Multiple service areas per supplier? | PM | Open - MVP: single area dropdown |
| **Q3** | What happens if supplier declines all requests? | PM | Open - returns to pending (future: other suppliers) |

## Test Strategy Summary

### E2E Testing (Playwright)

| Area | Test Coverage |
|------|---------------|
| **Google OAuth** | Mock OAuth flow, test redirect to onboarding vs dashboard |
| **Onboarding** | Form validation, profile creation, redirect |
| **Dashboard** | Tabs work, cards display, stats accurate |
| **Accept Flow** | Click accept, modal, status change, tab switch |
| **Deliver Flow** | Click deliver, confirmation, status change |
| **Profile** | Edit fields, save, availability toggle |

### OAuth Testing Strategy

Since Google OAuth requires real Google accounts, we'll use:
1. **Mocked auth state** for most E2E tests (inject session)
2. **Manual testing** for real OAuth flow on preview deployments
3. **Local Supabase** for development (can test full flow with local auth)

### Test Files to Create

```
tests/e2e/
├── supplier-auth.spec.ts        # OAuth flow, onboarding, login
├── supplier-dashboard.spec.ts   # Dashboard tabs, cards, stats
├── supplier-accept.spec.ts      # Accept flow, delivery window
├── supplier-deliver.spec.ts     # Mark delivered flow
└── supplier-profile.spec.ts     # Profile editing, availability
```

### Regression Coverage

- Existing 109 E2E tests from Epic 2 must continue passing
- Consumer flows unaffected by supplier implementation
- Guest tracking continues to work

---

*Generated by BMAD Epic Tech Context Workflow*
*Date: 2025-12-03*
