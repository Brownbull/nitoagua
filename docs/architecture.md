# nitoagua - Architecture Document

## Executive Summary

nitoagua is a Progressive Web App (PWA) built with Next.js 15, Supabase (PostgreSQL + Auth), and shadcn/ui. The architecture prioritizes simplicity for MVP validation: a single full-stack deployment on Vercel with Supabase handling database, authentication, and real-time capabilities. This decision-focused document ensures AI agents implement consistently across all features.

## Project Initialization

First implementation story should execute:

```bash
npx create-next-app@latest nitoagua --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

This establishes the base architecture with:
- Next.js 15.1 with App Router
- TypeScript
- Tailwind CSS
- ESLint
- `src/` directory structure
- `@/*` import alias

After initialization, install additional dependencies:

```bash
# Core dependencies
npm install @supabase/supabase-js @supabase/ssr

# UI components
npx shadcn@latest init
npx shadcn@latest add button card input textarea select dialog toast badge tabs form

# Email
npm install resend @react-email/components

# Utilities
npm install zod date-fns
```

## Decision Summary

| Category | Decision | Version | Affects FRs | Rationale |
|----------|----------|---------|-------------|-----------|
| Framework | Next.js (App Router) | 15.1.x | All | PWA support, SSR, API routes, Vercel deployment |
| Language | TypeScript | 5.x | All | Type safety, better DX, AI agent consistency |
| Database | Supabase (PostgreSQL) | Latest | FR1-FR45 | Managed PostgreSQL, built-in auth, real-time, free tier |
| ORM | Supabase Client | 2.x | FR1-FR45 | Native integration, no separate ORM needed for MVP |
| Authentication | Supabase Auth | Built-in | FR1-FR6, FR19-FR23 | Email/password, magic links, session management |
| UI Components | shadcn/ui + Tailwind | Latest | All UI | UX spec requirement, accessible, customizable |
| Email Service | Resend + React Email | Latest | FR6, FR17, FR34-FR35 | Developer-friendly, React templates, free tier |
| Deployment | Vercel | N/A | FR38-FR42 | Next.js native, edge functions, automatic HTTPS |
| Maps | Google Maps API | Latest | FR28 | Address lookup, geolocation, rural Chile coverage |
| State Management | React Context + URL state | Built-in | All | Simple enough for MVP, no Redux needed |
| Forms | React Hook Form + Zod | Latest | FR7-FR13 | Validation, type safety, shadcn/ui integration |

## Project Structure

```
nitoagua/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth group routes
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (consumer)/               # Consumer group routes
│   │   │   ├── page.tsx              # Consumer home (big button)
│   │   │   ├── request/
│   │   │   │   ├── page.tsx          # New request form
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Request status
│   │   │   ├── history/
│   │   │   │   └── page.tsx          # Request history
│   │   │   ├── profile/
│   │   │   │   └── page.tsx          # User profile
│   │   │   └── layout.tsx
│   │   ├── (supplier)/               # Supplier group routes
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx          # Request dashboard
│   │   │   ├── requests/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Request detail
│   │   │   ├── profile/
│   │   │   │   └── page.tsx          # Supplier profile
│   │   │   └── layout.tsx
│   │   ├── api/                      # API routes
│   │   │   ├── requests/
│   │   │   │   ├── route.ts          # GET/POST requests
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts      # GET/PATCH specific request
│   │   │   ├── webhooks/
│   │   │   │   └── resend/
│   │   │   │       └── route.ts      # Email webhooks
│   │   │   └── health/
│   │   │       └── route.ts          # Health check
│   │   ├── track/
│   │   │   └── [token]/
│   │   │       └── page.tsx          # Guest tracking page
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Landing/redirect
│   │   ├── manifest.ts               # PWA manifest
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── badge.tsx
│   │   │   └── ...
│   │   ├── consumer/                 # Consumer-specific components
│   │   │   ├── big-action-button.tsx
│   │   │   ├── request-form.tsx
│   │   │   ├── status-tracker.tsx
│   │   │   └── amount-selector.tsx
│   │   ├── supplier/                 # Supplier-specific components
│   │   │   ├── request-card.tsx
│   │   │   ├── request-list.tsx
│   │   │   ├── stats-header.tsx
│   │   │   └── delivery-modal.tsx
│   │   ├── shared/                   # Shared components
│   │   │   ├── status-badge.tsx
│   │   │   ├── address-input.tsx
│   │   │   ├── phone-input.tsx
│   │   │   ├── loading-spinner.tsx
│   │   │   └── error-boundary.tsx
│   │   └── layout/                   # Layout components
│   │       ├── consumer-nav.tsx
│   │       ├── supplier-sidebar.tsx
│   │       └── header.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts             # Browser client
│   │   │   ├── server.ts             # Server client
│   │   │   ├── middleware.ts         # Auth middleware
│   │   │   └── types.ts              # Database types
│   │   ├── email/
│   │   │   ├── resend.ts             # Resend client
│   │   │   └── templates/
│   │   │       ├── request-confirmed.tsx
│   │   │       ├── request-accepted.tsx
│   │   │       └── request-delivered.tsx
│   │   ├── validations/
│   │   │   ├── request.ts            # Request form validation
│   │   │   ├── profile.ts            # Profile validation
│   │   │   └── common.ts             # Shared validations
│   │   └── utils/
│   │       ├── format.ts             # Date/currency formatting
│   │       ├── phone.ts              # Chilean phone validation
│   │       └── constants.ts          # App constants
│   ├── hooks/
│   │   ├── use-auth.ts               # Auth state hook
│   │   ├── use-requests.ts           # Requests data hook
│   │   └── use-toast.ts              # Toast notifications
│   └── types/
│       ├── database.ts               # Supabase generated types
│       ├── request.ts                # Request types
│       └── user.ts                   # User types
├── public/
│   ├── icons/                        # PWA icons
│   │   ├── icon-192.png
│   │   └── icon-512.png
│   └── sw.js                         # Service worker
├── supabase/
│   ├── migrations/                   # Database migrations
│   │   └── 001_initial_schema.sql
│   └── seed.sql                      # Development seed data
├── emails/                           # React Email templates (for preview)
│   ├── request-confirmed.tsx
│   ├── request-accepted.tsx
│   └── request-delivered.tsx
├── .env.local.example
├── .env.local                        # Local env (gitignored)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── components.json                   # shadcn/ui config
└── package.json
```

## FR Category to Architecture Mapping

| FR Category | Architecture Component | Primary Files |
|-------------|----------------------|---------------|
| Consumer Account & Access (FR1-FR6) | Supabase Auth + Auth Routes | `src/app/(auth)/*`, `src/lib/supabase/` |
| Water Request Submission (FR7-FR13) | Request Form + API | `src/components/consumer/request-form.tsx`, `src/app/api/requests/` |
| Request Management - Consumer (FR14-FR18) | Status Pages + Notifications | `src/app/(consumer)/request/[id]/`, `src/lib/email/` |
| Supplier Registration & Profile (FR19-FR23) | Supplier Auth + Profile | `src/app/(auth)/`, `src/app/(supplier)/profile/` |
| Supplier Request Dashboard (FR24-FR28) | Dashboard + RequestCard | `src/app/(supplier)/dashboard/`, `src/components/supplier/` |
| Request Handling - Supplier (FR29-FR33) | API Routes + Actions | `src/app/api/requests/[id]/`, `src/components/supplier/` |
| Notifications & Communication (FR34-FR37) | Resend + React Email | `src/lib/email/`, `emails/` |
| Platform & PWA (FR38-FR42) | Next.js + Service Worker | `src/app/manifest.ts`, `public/sw.js` |
| Data & Privacy (FR43-FR45) | Supabase RLS + API | `supabase/migrations/`, Row Level Security policies |

## Technology Stack Details

### Core Technologies

**Next.js 15.1** (Framework)
- App Router for file-based routing
- Server Components for performance
- API Routes for backend logic
- Built-in image optimization
- Turbopack for fast development

**TypeScript 5.x** (Language)
- Strict mode enabled
- Path aliases configured (`@/*`)
- Generated types from Supabase

**Supabase** (Backend-as-a-Service)
- PostgreSQL database (managed)
- Row Level Security (RLS) for data isolation
- Built-in authentication (email/password, magic links)
- Real-time subscriptions (for future use)
- Edge Functions (if needed)

**shadcn/ui + Tailwind CSS** (UI)
- Pre-built accessible components
- Radix UI primitives
- Customized with "Agua Pura" theme
- Tailwind for utility-first styling

**Resend + React Email** (Notifications)
- Transactional email API
- React-based email templates
- Webhook support for delivery tracking

### Integration Points

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Next.js App   │────▶│    Supabase      │     │     Resend      │
│   (Vercel)      │     │  (PostgreSQL)    │     │   (Email API)   │
│                 │     │                  │     │                 │
│ - Server Comp.  │     │ - Database       │     │ - Transactional │
│ - API Routes    │◀────│ - Auth           │     │ - Templates     │
│ - Client Comp.  │     │ - RLS Policies   │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                                                │
         │              ┌──────────────────┐             │
         └─────────────▶│   Google Maps    │◀────────────┘
                        │      API         │
                        │                  │
                        │ - Address lookup │
                        │ - Geolocation    │
                        └──────────────────┘
```

## Implementation Patterns

These patterns ensure consistent implementation across all AI agents:

### API Response Format

All API routes MUST return this structure:

```typescript
// Success response
{
  data: T,
  error: null
}

// Error response
{
  data: null,
  error: {
    message: string,
    code: string  // e.g., "VALIDATION_ERROR", "NOT_FOUND", "UNAUTHORIZED"
  }
}
```

### Database Query Pattern

```typescript
// Always use server client for mutations
import { createClient } from "@/lib/supabase/server";

export async function createRequest(data: RequestInput) {
  const supabase = await createClient();

  const { data: request, error } = await supabase
    .from("requests")
    .insert(data)
    .select()
    .single();

  if (error) {
    throw new DatabaseError(error.message, error.code);
  }

  return request;
}
```

### Form Validation Pattern

```typescript
// src/lib/validations/request.ts
import { z } from "zod";

export const requestSchema = z.object({
  name: z.string().min(2, "El nombre es requerido"),
  phone: z.string().regex(/^\+56[0-9]{9}$/, "Formato: +56912345678"),
  address: z.string().min(5, "La dirección es requerida"),
  specialInstructions: z.string().min(1, "Las instrucciones son requeridas"),
  amount: z.enum(["100", "1000", "5000", "10000"]),
  email: z.string().email("Email inválido").optional(),
  isUrgent: z.boolean().default(false),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export type RequestInput = z.infer<typeof requestSchema>;
```

### Component Pattern

```typescript
// Always use this structure for components
interface RequestCardProps {
  request: Request;
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
}

export function RequestCard({ request, onAccept, onDecline }: RequestCardProps) {
  // Component implementation
}
```

## Consistency Rules

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Files (components) | kebab-case | `request-card.tsx` |
| Files (utils/lib) | kebab-case | `format.ts` |
| React Components | PascalCase | `RequestCard` |
| Functions | camelCase | `createRequest` |
| Variables | camelCase | `requestData` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_REQUEST_AMOUNT` |
| Database tables | snake_case | `water_requests` |
| Database columns | snake_case | `created_at` |
| API routes | kebab-case | `/api/requests` |
| URL params | kebab-case | `/request/[id]` |
| CSS classes | Tailwind utilities | `bg-primary text-white` |
| Environment vars | SCREAMING_SNAKE_CASE | `SUPABASE_URL` |

### Code Organization

**Imports Order (enforced by ESLint):**
1. React/Next.js imports
2. Third-party libraries
3. Internal aliases (`@/`)
4. Relative imports
5. Types

```typescript
// Example
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { createRequest } from "@/lib/supabase/requests";
import { requestSchema } from "@/lib/validations/request";

import { RequestCard } from "./request-card";

import type { Request } from "@/types/request";
```

**File Structure within directories:**
- `index.ts` for barrel exports (only if needed)
- Components: Single component per file
- Hooks: One hook per file
- Types: Grouped by domain

### Error Handling

**Client-side errors:**
```typescript
try {
  await submitRequest(data);
  toast({ title: "Solicitud enviada", variant: "success" });
} catch (error) {
  if (error instanceof ValidationError) {
    // Show field-level errors
  } else {
    toast({
      title: "Error al enviar",
      description: "Intenta de nuevo",
      variant: "destructive"
    });
  }
}
```

**Server-side errors:**
```typescript
// API route error handling
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = requestSchema.parse(body);
    const result = await createRequest(validated);
    return NextResponse.json({ data: result, error: null });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { data: null, error: { message: "Datos inválidos", code: "VALIDATION_ERROR" } },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { data: null, error: { message: "Error interno", code: "INTERNAL_ERROR" } },
      { status: 500 }
    );
  }
}
```

### Logging Strategy

**Development:** Console logging with structured format
**Production:** Vercel logs (automatic)

```typescript
// Use consistent log format
console.log("[REQUEST]", { action: "create", userId, requestId });
console.error("[ERROR]", { context: "createRequest", error: error.message });
```

## Data Architecture

### Database Schema

```sql
-- Users (handled by Supabase Auth, extended with profiles)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('consumer', 'supplier')),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  special_instructions TEXT,
  -- Supplier-specific fields
  service_area TEXT,
  price_100l INTEGER,
  price_1000l INTEGER,
  price_5000l INTEGER,
  price_10000l INTEGER,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Water Requests
CREATE TABLE water_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Consumer info (can be guest or registered)
  consumer_id UUID REFERENCES profiles(id),
  guest_name TEXT,
  guest_phone TEXT NOT NULL,
  guest_email TEXT,
  tracking_token TEXT UNIQUE DEFAULT gen_random_uuid()::text,
  -- Request details
  address TEXT NOT NULL,
  special_instructions TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  amount INTEGER NOT NULL CHECK (amount IN (100, 1000, 5000, 10000)),
  is_urgent BOOLEAN DEFAULT false,
  -- Status workflow
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'delivered', 'cancelled')),
  -- Supplier assignment
  supplier_id UUID REFERENCES profiles(id),
  delivery_window TEXT,
  decline_reason TEXT,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

-- Row Level Security Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_requests ENABLE ROW LEVEL SECURITY;

-- Consumers can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Consumers can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Suppliers can read all pending requests
CREATE POLICY "Suppliers can read pending requests"
  ON water_requests FOR SELECT
  USING (
    status = 'pending'
    OR supplier_id = auth.uid()
    OR consumer_id = auth.uid()
  );

-- Consumers can create requests
CREATE POLICY "Anyone can create requests"
  ON water_requests FOR INSERT
  WITH CHECK (true);

-- Consumers can cancel their own pending requests
CREATE POLICY "Consumers can cancel own pending requests"
  ON water_requests FOR UPDATE
  USING (
    (consumer_id = auth.uid() OR tracking_token IS NOT NULL)
    AND status = 'pending'
  );

-- Suppliers can accept/complete requests
CREATE POLICY "Suppliers can update assigned requests"
  ON water_requests FOR UPDATE
  USING (
    supplier_id = auth.uid()
    OR (status = 'pending' AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'supplier'
    ))
  );

-- Indexes
CREATE INDEX idx_requests_status ON water_requests(status);
CREATE INDEX idx_requests_supplier ON water_requests(supplier_id);
CREATE INDEX idx_requests_consumer ON water_requests(consumer_id);
CREATE INDEX idx_requests_tracking ON water_requests(tracking_token);
```

### Data Flow

```
Consumer Request Flow:
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│ PENDING │───▶│ ACCEPTED│───▶│DELIVERED│    │CANCELLED│
└─────────┘    └─────────┘    └─────────┘    └─────────┘
     │              │              │              ▲
     │              │              │              │
     └──────────────┴──────────────┴──────────────┘
                    (consumer can cancel if pending)
```

## API Contracts

### Request Endpoints

**POST /api/requests** - Create new request
```typescript
// Request body
{
  name: string,
  phone: string,        // Format: +56912345678
  address: string,
  specialInstructions: string,
  amount: 100 | 1000 | 5000 | 10000,
  email?: string,       // Required for guests (for tracking link)
  isUrgent?: boolean,
  latitude?: number,
  longitude?: number
}

// Response
{
  data: {
    id: string,
    trackingToken: string,  // For guest tracking
    status: "pending"
  },
  error: null
}
```

**GET /api/requests** - List requests (supplier)
```typescript
// Query params
?status=pending|accepted|delivered
&sort=created_at|amount|is_urgent
&order=asc|desc

// Response
{
  data: Request[],
  error: null
}
```

**PATCH /api/requests/[id]** - Update request
```typescript
// Accept request
{ action: "accept", deliveryWindow?: string }

// Mark delivered
{ action: "deliver" }

// Cancel request (consumer only, if pending)
{ action: "cancel" }

// Decline request (supplier)
{ action: "decline", reason?: string }
```

## Security Architecture

### Authentication Flow

1. **Registered Users:** Email/password via Supabase Auth
2. **Guest Consumers:** No auth required for request submission
3. **Guest Tracking:** Unique token in URL (`/track/[token]`)

### Security Measures

| Measure | Implementation |
|---------|----------------|
| HTTPS | Enforced by Vercel |
| Password Hashing | Supabase Auth (bcrypt) |
| Session Management | Supabase (JWT + cookies) |
| CSRF Protection | Next.js built-in |
| Input Validation | Zod schemas on all inputs |
| SQL Injection | Parameterized queries via Supabase |
| XSS Prevention | React DOM escaping + CSP headers |
| Rate Limiting | Vercel Edge (100 req/10s default) |
| Data Isolation | Row Level Security policies |

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...  # Server-side only
RESEND_API_KEY=re_xxx
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...
```

## Performance Considerations

### NFR Compliance

| NFR | Target | Strategy |
|-----|--------|----------|
| NFR1: Initial load | < 3s on 3G | Server components, code splitting, image optimization |
| NFR2: Request submission | < 5s on 3G | Optimistic UI, background sync |
| NFR3: Dashboard load | < 3s | Server-side data fetching, pagination |
| NFR4: Responsive | No freezing | Suspense boundaries, loading states |

### Caching Strategy

```typescript
// Static pages (landing, etc.)
export const revalidate = 3600; // 1 hour

// Dynamic pages (dashboard, requests)
export const dynamic = "force-dynamic";

// API routes
export const runtime = "edge"; // For low latency
```

### PWA Configuration

```typescript
// src/app/manifest.ts
export default function manifest() {
  return {
    name: "nitoagua",
    short_name: "nitoagua",
    description: "Coordina tu entrega de agua",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0077B6",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
```

## Deployment Architecture

### Vercel Configuration

```
┌────────────────────────────────────────────────────────┐
│                        Vercel                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │    Edge      │  │   Serverless │  │    Static    │ │
│  │   Network    │  │   Functions  │  │    Assets    │ │
│  │              │  │              │  │              │ │
│  │ - CDN        │  │ - API Routes │  │ - JS/CSS     │ │
│  │ - SSL/TLS    │  │ - ISR        │  │ - Images     │ │
│  │ - DDoS       │  │ - SSR        │  │ - SW         │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
           ┌───────────────────────────────┐
           │          Supabase             │
           │  (São Paulo region - sa-east) │
           │                               │
           │  - PostgreSQL                 │
           │  - Auth                       │
           │  - Storage (future)           │
           └───────────────────────────────┘
```

### Environment Setup

| Environment | Purpose | Supabase Project |
|-------------|---------|------------------|
| Development | Local dev | Local or dev project |
| Preview | PR previews | Dev project |
| Production | Live app | Production project |

## Development Environment

### Prerequisites

- Node.js 20.x LTS
- npm 10.x or pnpm 9.x
- Git
- Supabase CLI (optional, for local development)
- VS Code with recommended extensions

### Setup Commands

```bash
# Clone and install
git clone <repo-url>
cd nitoagua
npm install

# Setup environment
cp .env.local.example .env.local
# Edit .env.local with your Supabase and API keys

# Run development server
npm run dev

# Run with Supabase local (optional)
supabase start
npm run dev

# Type generation (after schema changes)
npx supabase gen types typescript --project-id <project-id> > src/types/database.ts

# Build and test
npm run build
npm run lint
```

### VS Code Extensions (Recommended)

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma"
  ]
}
```

## Architecture Decision Records (ADRs)

### ADR-001: Supabase over Firebase/Custom Backend

**Decision:** Use Supabase as the Backend-as-a-Service

**Context:** Need database, auth, and potential real-time features for MVP

**Options Considered:**
1. Firebase - More mature but complex, Firestore query limitations
2. Custom Node.js backend - Maximum flexibility but more work
3. Supabase - PostgreSQL, simpler RLS, good DX

**Decision:** Supabase

**Rationale:**
- PostgreSQL is more familiar and powerful than Firestore
- Row Level Security simplifies authorization
- Free tier sufficient for MVP
- Easy upgrade path to dedicated PostgreSQL later
- Real-time built-in for future features

### ADR-002: Next.js App Router over Pages Router

**Decision:** Use App Router (not Pages Router)

**Context:** Building new Next.js 15 application

**Rationale:**
- Server Components for better performance
- Simpler data fetching patterns
- Built-in layouts and loading states
- Future-proof architecture
- Better TypeScript support

### ADR-003: No Separate ORM (Prisma/Drizzle)

**Decision:** Use Supabase client directly for MVP

**Context:** Need database access layer

**Options Considered:**
1. Prisma ORM - Excellent DX but adds complexity
2. Drizzle ORM - Lighter weight but newer
3. Supabase client - Direct access, no additional layer

**Decision:** Supabase client for MVP

**Rationale:**
- Fewer dependencies for MVP
- Supabase client is type-safe with generated types
- Can add Prisma later if needed for complex queries
- Simpler deployment (no migration step)

### ADR-004: Resend over SendGrid/AWS SES

**Decision:** Use Resend for transactional email

**Context:** Need to send request confirmations and status updates

**Rationale:**
- React Email integration (matches Next.js stack)
- Excellent developer experience
- Generous free tier (3,000 emails/month)
- Simple API, good documentation
- Founded by Vercel alumni (good ecosystem fit)

### ADR-005: Single-Tenant MVP Architecture

**Decision:** Build for single supplier initially

**Context:** MVP validation with one supplier

**Rationale:**
- Simplifies architecture significantly
- Proves core value proposition first
- Database schema supports multi-tenant future
- Can add supplier selection in v2
- Reduces initial complexity

---

_Generated by BMAD Decision Architecture Workflow v1.0_
_Date: 2025-12-01_
_For: Gabe_
