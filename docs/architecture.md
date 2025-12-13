# nitoagua - Architecture Document V2

## Executive Summary

nitoagua is a Progressive Web App (PWA) for water delivery coordination in rural Chile, connecting consumers with water providers (aguateros) through an admin-managed marketplace. Built with Next.js 15, Supabase, and shadcn/ui, the V2 architecture extends the validated MVP with:

- **Consumer-Choice Offer System** - Consumers select from provider offers (not auto-assignment)
- **Provider Lifecycle Management** - Self-registration, document verification, earnings tracking
- **Admin Operations Panel** - Provider verification, pricing control, settlement management
- **Cash Settlement Tracking** - Commission debt ledger with aging and payment reconciliation

This decision-focused document ensures AI agents implement consistently across all features.

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-01 | MVP architecture (single supplier) |
| 2.0 | 2025-12-11 | V2 multi-provider marketplace, consumer-choice offers, admin panel |

---

## Decision Summary

### Core Architecture Decisions (MVP - Unchanged)

| Category | Decision | Rationale |
|----------|----------|-----------|
| Framework | Next.js 15 (App Router) | PWA support, SSR, API routes, Vercel deployment |
| Language | TypeScript 5.x | Type safety, AI agent consistency |
| Database | Supabase (PostgreSQL) | Managed DB, built-in auth, real-time, free tier |
| UI Components | shadcn/ui + Tailwind | Accessible, customizable, matches UX spec |
| Email Service | Resend + React Email | Developer-friendly, React templates |
| Deployment | Vercel | Next.js native, edge functions, automatic HTTPS |
| Maps | Google Maps API | Address lookup, geolocation, rural Chile coverage |

### V2 Architecture Decisions

| # | Category | Decision | Options Considered | Rationale |
|---|----------|----------|-------------------|-----------|
| 1 | Offer Broadcast | **Supabase Realtime** | Polling, Push Service (FCM) | Zero cost, instant, already available |
| 2 | Offer Expiration | **Hybrid (Client + Cron)** | Server-only, Client-only, DB Trigger | Client shows countdown, Cron cleanup every 1 min |
| 3 | Document Storage | **Supabase Storage** | Cloudinary, S3, Vercel Blob | Already integrated, RLS for access control |
| 4 | Settlement Tracking | **Separate tables per concern** | Single table, Wallet model, Event-sourced | Clear separation, easy auditing, financial accuracy |
| 5 | Admin Access | **Allowlist + profiles** | Role column only, Custom claims | Pre-seed allowlist, clean access check |
| 6 | Notifications | **In-app + Selective Email** | In-app only, Email all | Realtime primary, email for critical events only |
| 7 | Service Areas | **Comuna/Town selection** | Radius, Polygon zones | Familiar to Chileans, simple matching |
| 8 | Offer Validity | **Admin-configurable bounds** | Fixed, Provider-only | Admin sets min/max, prevents abuse |

---

## Project Structure (V2)

```
nitoagua/
├── src/
│   ├── app/
│   │   ├── (auth)/                    # Auth routes
│   │   │   ├── login/page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (consumer)/                # Consumer routes (blue theme)
│   │   │   ├── layout.tsx
│   │   │   ├── request/
│   │   │   │   ├── page.tsx           # New request form
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx       # Request status
│   │   │   │       └── offers/page.tsx # NEW: View/select offers
│   │   │   ├── history/page.tsx
│   │   │   └── profile/page.tsx
│   │   │
│   │   ├── (provider)/                # Provider routes (orange theme)
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx     # Home with availability toggle
│   │   │   ├── requests/              # Browse nearby requests
│   │   │   │   ├── page.tsx           # Available requests list
│   │   │   │   └── [id]/page.tsx      # Request detail + offer form
│   │   │   ├── offers/                # My active offers
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── deliveries/            # Assigned deliveries
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── earnings/              # Earnings & settlement
│   │   │   │   ├── page.tsx
│   │   │   │   ├── history/page.tsx
│   │   │   │   └── withdraw/page.tsx
│   │   │   ├── profile/
│   │   │   │   ├── page.tsx
│   │   │   │   └── documents/page.tsx
│   │   │   ├── settings/page.tsx      # Offer validity, service areas
│   │   │   └── onboarding/            # Registration flow
│   │   │       ├── page.tsx           # Personal info
│   │   │       ├── documents/page.tsx # Document upload
│   │   │       ├── bank/page.tsx      # Bank details
│   │   │       └── pending/page.tsx   # Verification waiting
│   │   │
│   │   ├── (admin)/                   # Admin routes (gray theme, desktop-first)
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx
│   │   │   ├── not-authorized/page.tsx
│   │   │   ├── dashboard/page.tsx     # Operations overview
│   │   │   ├── providers/
│   │   │   │   ├── page.tsx           # Directory
│   │   │   │   ├── verification/page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── settlement/page.tsx    # Cash settlement tracking
│   │   │   ├── pricing/page.tsx
│   │   │   └── settings/page.tsx
│   │   │
│   │   ├── api/
│   │   │   ├── requests/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── offers/                # NEW
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── provider/
│   │   │   │   ├── profile/route.ts
│   │   │   │   ├── documents/route.ts # NEW
│   │   │   │   ├── service-areas/route.ts # NEW
│   │   │   │   └── earnings/route.ts  # NEW
│   │   │   ├── admin/                 # NEW
│   │   │   │   ├── providers/route.ts
│   │   │   │   ├── pricing/route.ts
│   │   │   │   ├── settings/route.ts
│   │   │   │   └── settlement/route.ts
│   │   │   ├── notifications/route.ts # NEW
│   │   │   └── cron/                  # NEW
│   │   │       ├── expire-offers/route.ts
│   │   │       ├── request-timeout/route.ts
│   │   │       └── settlement-reminders/route.ts
│   │   │
│   │   ├── auth/callback/route.ts
│   │   ├── track/[token]/page.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── manifest.ts
│   │
│   ├── components/
│   │   ├── ui/                        # shadcn/ui primitives
│   │   ├── consumer/
│   │   │   ├── big-action-button.tsx
│   │   │   ├── request-form.tsx
│   │   │   ├── status-tracker.tsx
│   │   │   ├── offer-list.tsx         # NEW: View offers
│   │   │   └── offer-card.tsx         # NEW
│   │   ├── provider/                  # RENAMED from supplier
│   │   │   ├── request-browser.tsx    # NEW
│   │   │   ├── offer-form.tsx         # NEW
│   │   │   ├── offer-countdown.tsx    # NEW
│   │   │   ├── earnings-dashboard.tsx # NEW
│   │   │   ├── document-upload.tsx    # NEW
│   │   │   ├── service-area-picker.tsx # NEW
│   │   │   └── availability-toggle.tsx # NEW
│   │   ├── admin/                     # NEW
│   │   │   ├── verification-queue.tsx
│   │   │   ├── provider-directory.tsx
│   │   │   ├── orders-table.tsx
│   │   │   ├── pricing-editor.tsx
│   │   │   ├── settlement-table.tsx
│   │   │   └── settings-form.tsx
│   │   ├── shared/
│   │   │   ├── status-badge.tsx
│   │   │   ├── countdown-timer.tsx    # NEW
│   │   │   └── notification-bell.tsx  # NEW
│   │   └── layout/
│   │       ├── consumer-nav.tsx
│   │       ├── provider-nav.tsx       # NEW
│   │       └── admin-sidebar.tsx      # NEW
│   │
│   ├── hooks/
│   │   ├── use-auth.ts
│   │   ├── use-realtime-offers.ts     # NEW
│   │   ├── use-realtime-requests.ts   # NEW
│   │   ├── use-notifications.ts       # NEW
│   │   └── use-countdown.ts           # NEW
│   │
│   └── lib/
│       ├── supabase/
│       │   ├── client.ts
│       │   ├── server.ts
│       │   ├── admin.ts
│       │   ├── middleware.ts
│       │   ├── types.ts
│       │   └── realtime.ts            # NEW
│       ├── actions/
│       │   ├── consumer-profile.ts
│       │   ├── provider-profile.ts
│       │   ├── offers.ts              # NEW
│       │   ├── deliveries.ts          # NEW
│       │   ├── settlement.ts          # NEW
│       │   └── admin.ts               # NEW
│       ├── validations/
│       │   ├── request.ts
│       │   ├── consumer-profile.ts
│       │   ├── provider-profile.ts
│       │   ├── offer.ts               # NEW
│       │   └── admin.ts               # NEW
│       ├── email/
│       │   ├── resend.ts
│       │   ├── send-email.ts
│       │   └── templates/
│       │       ├── offer-received.tsx # NEW
│       │       ├── offer-accepted.tsx # NEW
│       │       └── settlement-reminder.tsx # NEW
│       ├── utils/
│       │   ├── format.ts
│       │   ├── date.ts                # NEW
│       │   ├── currency.ts            # NEW
│       │   └── commission.ts          # NEW
│       ├── auth/
│       │   └── guards.ts              # NEW
│       └── notifications.ts
│
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql
│       ├── 002_v2_offers.sql          # NEW
│       ├── 003_v2_provider.sql        # NEW
│       ├── 004_v2_admin.sql           # NEW
│       └── 005_v2_settlement.sql      # NEW
│
├── vercel.json                        # Cron configuration
└── package.json
```

---

## Data Architecture (V2)

### Database Schema

```sql
-- ============================================
-- EXISTING TABLES (Extended for V2)
-- ============================================

-- Profiles table (extended)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT
  CHECK (role IN ('consumer', 'provider', 'admin'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_status TEXT
  DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected', 'more_info_needed'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS offer_validity_minutes INTEGER DEFAULT 30;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS commission_override INTEGER; -- NULL = use default
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bank_account TEXT;

-- Water requests table (extended)
ALTER TABLE water_requests ADD COLUMN IF NOT EXISTS payment_method TEXT
  CHECK (payment_method IN ('cash', 'transfer'));
ALTER TABLE water_requests ADD COLUMN IF NOT EXISTS comuna_id TEXT REFERENCES comunas(id);
ALTER TABLE water_requests ADD COLUMN IF NOT EXISTS delivery_window_start TIMESTAMPTZ;
ALTER TABLE water_requests ADD COLUMN IF NOT EXISTS delivery_window_end TIMESTAMPTZ;

-- ============================================
-- NEW TABLES FOR V2
-- ============================================

-- Comunas (service areas)
CREATE TABLE comunas (
  id TEXT PRIMARY KEY,           -- 'villarrica', 'pucon'
  name TEXT NOT NULL,            -- 'Villarrica', 'Pucón'
  region TEXT NOT NULL,          -- 'Araucanía'
  active BOOLEAN DEFAULT TRUE
);

-- Provider service areas (many-to-many)
CREATE TABLE provider_service_areas (
  provider_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  comuna_id TEXT REFERENCES comunas(id),
  PRIMARY KEY (provider_id, comuna_id)
);

-- Provider documents
CREATE TABLE provider_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('cedula', 'licencia', 'permiso_sanitario', 'certificacion', 'vehiculo')),
  storage_path TEXT NOT NULL,    -- Supabase Storage path
  original_filename TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES profiles(id)
);

-- Offers
CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES water_requests(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Delivery window
  delivery_window_start TIMESTAMPTZ NOT NULL,
  delivery_window_end TIMESTAMPTZ NOT NULL,

  -- Expiration
  expires_at TIMESTAMPTZ NOT NULL,

  -- Status
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'accepted', 'expired', 'cancelled', 'request_filled')),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,

  UNIQUE (request_id, provider_id)
);

-- Commission ledger
CREATE TABLE commission_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  request_id UUID REFERENCES water_requests(id),

  type TEXT NOT NULL CHECK (type IN ('commission_owed', 'commission_paid', 'adjustment')),
  amount INTEGER NOT NULL,  -- CLP, positive = owed

  description TEXT,
  bank_reference TEXT,
  admin_id UUID REFERENCES profiles(id),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Withdrawal requests
CREATE TABLE withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),

  processed_by UUID REFERENCES profiles(id),
  processed_at TIMESTAMPTZ,
  rejection_reason TEXT,

  bank_name TEXT,
  account_number TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin allowed emails
CREATE TABLE admin_allowed_emails (
  email TEXT PRIMARY KEY,
  added_by TEXT,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- Admin settings
CREATE TABLE admin_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- In-app notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,

  request_id UUID REFERENCES water_requests(id),
  offer_id UUID REFERENCES offers(id),

  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_offers_request ON offers(request_id) WHERE status = 'active';
CREATE INDEX idx_offers_provider ON offers(provider_id, status);
CREATE INDEX idx_offers_expiration ON offers(expires_at) WHERE status = 'active';
CREATE INDEX idx_ledger_provider ON commission_ledger(provider_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, read) WHERE read = FALSE;
CREATE INDEX idx_requests_comuna ON water_requests(comuna_id, status);
CREATE INDEX idx_provider_areas ON provider_service_areas(comuna_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on new tables
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_allowed_emails ENABLE ROW LEVEL SECURITY;

-- Offers: Consumers can view offers for their requests
CREATE POLICY "Consumers can view offers for their requests"
ON offers FOR SELECT
USING (
  request_id IN (
    SELECT id FROM water_requests
    WHERE consumer_id = auth.uid() OR tracking_token IS NOT NULL
  )
);

-- Offers: Providers can view and create their own offers
CREATE POLICY "Providers can manage their offers"
ON offers FOR ALL
USING (provider_id = auth.uid());

-- Offers: Admins can view all
CREATE POLICY "Admins can view all offers"
ON offers FOR SELECT
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Documents: Providers can manage their own
CREATE POLICY "Providers can manage own documents"
ON provider_documents FOR ALL
USING (provider_id = auth.uid());

-- Documents: Admins can view all
CREATE POLICY "Admins can view all documents"
ON provider_documents FOR SELECT
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Notifications: Users can only see their own
CREATE POLICY "Users can view own notifications"
ON notifications FOR SELECT
USING (user_id = auth.uid());

-- Ledger: Providers can view their own
CREATE POLICY "Providers can view own ledger"
ON commission_ledger FOR SELECT
USING (provider_id = auth.uid());

-- Ledger: Admins can view and modify all
CREATE POLICY "Admins can manage ledger"
ON commission_ledger FOR ALL
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
```

### Default Admin Settings

```sql
INSERT INTO admin_settings (key, value) VALUES
  ('default_commission_percent', '10'),
  ('offer_validity_min', '15'),
  ('offer_validity_max', '120'),
  ('offer_validity_default', '30'),
  ('request_timeout_hours', '4'),
  ('urgency_surcharge_percent', '10');

INSERT INTO comunas (id, name, region) VALUES
  ('villarrica', 'Villarrica', 'Araucanía'),
  ('pucon', 'Pucón', 'Araucanía'),
  ('lican-ray', 'Licán Ray', 'Araucanía'),
  ('curarrehue', 'Curarrehue', 'Araucanía'),
  ('freire', 'Freire', 'Araucanía');
```

---

## Novel Architectural Patterns

### Pattern 1: Consumer-Choice Offer System

**Flow:** Request broadcast → Providers submit offers → Consumer chooses

```
Consumer creates       All providers        Consumer views      Consumer selects
    request      ────▶  in comuna get  ────▶  active offers  ────▶   one offer
                        notification          with countdown
        │                    │                     │                    │
        ▼                    ▼                     ▼                    ▼
  water_requests       Supabase             offers table         offer.status =
  status=pending       Realtime             status=active         'accepted'
                                                 │
                                                 ▼
                                            Cron expires
                                            after expires_at
```

**Realtime Subscriptions:**

```typescript
// Provider: Listen for new requests in service area
supabase
  .channel('new-requests')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'water_requests',
    filter: 'status=eq.pending'
  }, handleNewRequest)
  .subscribe();

// Consumer: Listen for offers on their request
supabase
  .channel(`offers-${requestId}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'offers',
    filter: `request_id=eq.${requestId}`
  }, handleOfferChange)
  .subscribe();
```

**Offer Selection Logic:**

```typescript
async function selectOffer(offerId: string, requestId: string) {
  // 1. Validate offer is still active and not expired
  // 2. Update offer status to 'accepted'
  // 3. Update other offers to 'request_filled'
  // 4. Update request with provider assignment
  // 5. Realtime notifies all parties
}
```

### Pattern 2: Cash Settlement Tracking

**Flow:** Cash delivery → Commission debt created → Provider pays → Admin confirms

```typescript
// On delivery completion with cash payment
if (paymentMethod === 'cash') {
  await supabase.from('commission_ledger').insert({
    provider_id: providerId,
    request_id: requestId,
    type: 'commission_owed',
    amount: commissionAmount,
    description: `Comisión de entrega #${requestId.slice(0, 8)}`
  });
}

// Provider balance calculation
const balance = await supabase
  .from('commission_ledger')
  .select('type, amount, created_at')
  .eq('provider_id', providerId);

// Aging buckets: current (<7d), week (7-14d), overdue (>14d)
```

### Pattern 3: Admin Allowlist Authentication

```typescript
// Auth callback checks allowlist for admin routes
if (next.startsWith('/admin')) {
  const { data: allowed } = await supabase
    .from('admin_allowed_emails')
    .select('email')
    .eq('email', user.email)
    .single();

  if (!allowed) {
    return redirect('/admin/not-authorized');
  }
}
```

---

## Implementation Patterns

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| React Components | PascalCase | `OfferCard`, `EarningsDashboard` |
| Files (components) | PascalCase | `OfferCard.tsx` |
| Files (utils) | kebab-case | `date-utils.ts` |
| Server Actions | camelCase verb-noun | `createOffer`, `selectOffer` |
| Hooks | camelCase use- | `useRealtimeOffers` |
| Database columns | snake_case | `delivery_window_start` |
| API routes | kebab-case | `/api/offers` |
| Constants | SCREAMING_SNAKE | `MAX_OFFER_VALIDITY` |
| User-facing strings | Spanish | `"Oferta expirada"` |
| Code comments | English | `// Calculate commission` |

### API Response Format

```typescript
// All API responses use this structure
interface ApiResponse<T> {
  data: T | null;
  error: { code: string; message: string } | null;
}

// Error codes (Spanish messages)
const ERROR_CODES = {
  VALIDATION_ERROR: 'Datos inválidos',
  UNAUTHORIZED: 'No autorizado',
  NOT_FOUND: 'No encontrado',
  OFFER_EXPIRED: 'Esta oferta ha expirado',
  REQUEST_ALREADY_ASSIGNED: 'Esta solicitud ya fue asignada',
} as const;
```

### Server Action Pattern

```typescript
'use server';

export async function createOffer(requestId: string, data: OfferFormData) {
  // 1. Auth check
  const user = await requireProvider();

  // 2. Validate input
  const validated = offerSchema.safeParse(data);
  if (!validated.success) {
    return { data: null, error: { code: 'VALIDATION_ERROR', message: 'Datos inválidos' } };
  }

  // 3. Business logic validation
  // 4. Execute operation
  // 5. Revalidate paths
  // 6. Return result
}
```

### Auth Guards

```typescript
// src/lib/auth/guards.ts
export async function requireAuth() { /* ... */ }
export async function requireProvider() { /* ... */ }
export async function requireAdmin() { /* ... */ }
```

---

## Cross-Cutting Concerns

### Date/Time Handling

| Aspect | Decision |
|--------|----------|
| Storage | UTC in database (`TIMESTAMPTZ`) |
| Display | Chile time (`America/Santiago`) |
| Library | `date-fns` with `es` locale |

```typescript
// src/lib/utils/date.ts
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toZonedTime } from 'date-fns-tz';

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const chileTz = toZonedTime(d, 'America/Santiago');
  return format(chileTz, "d 'de' MMMM, HH:mm", { locale: es });
}
```

### Currency Handling

| Aspect | Decision |
|--------|----------|
| Storage | Integer (CLP has no decimals) |
| Display | Full number: `$15.000` (no "k" notation) |

```typescript
export function formatCLP(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0
  }).format(amount);
}
```

### Commission Calculation

```typescript
// src/lib/utils/commission.ts
export async function calculateCommission(grossAmount: number, providerId: string) {
  // Check provider-specific override, then default rate
  const commissionPercent = provider?.commission_override ?? defaultRate ?? 10;
  const commissionAmount = Math.round(grossAmount * commissionPercent / 100);
  return { grossAmount, commissionPercent, commissionAmount, providerEarnings: grossAmount - commissionAmount };
}
```

---

## Notification Matrix

| Event | Consumer (Registered) | Consumer (Guest) | Provider |
|-------|----------------------|------------------|----------|
| New request nearby | - | - | 🔔 In-app |
| New offer received | 🔔 In-app | 📧 Email | - |
| Offer accepted | 🔔 + 📧 | 📧 Email | 🔔 + 📧 |
| Offer expired | 🔔 In-app | 📧 (if only offer) | 🔔 In-app |
| Provider en route | 🔔 In-app | 📧 Email | - |
| Delivery completed | 🔔 + 📧 | 📧 Email | 🔔 In-app |
| Verification result | - | - | 🔔 + 📧 |
| Settlement reminder | - | - | 🔔 + 📧 |

---

## Cron Jobs (Vercel)

```json
{
  "crons": [
    {
      "path": "/api/cron/expire-offers",
      "schedule": "* * * * *"
    },
    {
      "path": "/api/cron/request-timeout",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/cron/settlement-reminders",
      "schedule": "0 9 * * *"
    }
  ]
}
```

| Job | Schedule | Purpose |
|-----|----------|---------|
| expire-offers | Every minute | Mark expired offers, notify |
| request-timeout | Every hour | Notify consumers with no offers after 4h |
| settlement-reminders | Daily 9am | Remind providers with outstanding debt |

---

## Security Architecture

### Role-Based Access

| Resource | Consumer | Provider | Admin |
|----------|----------|----------|-------|
| Own profile | RW | RW | RW |
| All profiles | - | - | R |
| Own requests | RW | - | - |
| Pending requests | R | R | R |
| Offers (own) | R | RW | R |
| All offers | - | - | RW |
| Documents (own) | - | RW | - |
| All documents | - | - | R |
| Commission ledger | - | R (own) | RW |
| Admin settings | - | - | RW |

### Supabase Storage Buckets

| Bucket | Access | Purpose |
|--------|--------|---------|
| `provider-documents` | Private (RLS) | Cédula, licencia, permisos |
| `avatars` | Public | Profile photos |

---

## FR Coverage (V2)

| Category | FRs | Architecture |
|----------|-----|--------------|
| Consumer Account (FR1-6) | ✅ | Existing MVP |
| Request Submission (FR7-16) | ✅ | Extended with payment_method, comuna |
| Request Management (FR17-23) | ✅ | Extended with negative states |
| Provider Onboarding (FR24-32) | ✅ | New onboarding flow + documents |
| Provider Dashboard (FR33-38) | ✅ | Availability toggle, Realtime |
| **Consumer Choice (FR39-46)** | ✅ | **Replaced push with offer system** |
| Provider Handling (FR47-52) | ✅ | Offer + delivery flow |
| Earnings & Settlement (FR53-60) | ✅ | Commission ledger + aging |
| Provider Profile (FR61-65) | ✅ | Extended profile + service areas |
| Admin Auth (FR66-70) | ✅ | Allowlist + profiles |
| Admin Verification (FR71-76) | ✅ | Verification queue + documents |
| Admin Management (FR77-83) | ✅ | Provider directory + actions |
| Admin Pricing (FR84-88) | ✅ | admin_settings table |
| Admin Orders (FR89-93) | ✅ | Orders dashboard |
| Admin Settlement (FR94-97) | ✅ | Ledger queries + payment recording |
| Notifications (FR98-104) | ✅ | Realtime + email matrix |
| Platform (FR105-110) | ✅ | Existing + admin desktop-first |

---

## Architecture Decision Records (V2)

### ADR-006: Consumer-Choice over Push Assignment

**Decision:** Consumer selects from provider offers instead of system auto-assignment

**Context:** Original PRD V2 specified Uber-style push assignment with countdown timers

**Rationale:**
- Simpler architecture (no scoring algorithm, no cycling logic)
- Better fit for rural connectivity (async-friendly, no timer sync issues)
- Preserves trust relationships (consumer picks who they know)
- Provider time valued through configurable offer expiration
- Aligns with "human touch" product philosophy

### ADR-007: Supabase Realtime for Offer Notifications

**Decision:** Use Supabase Realtime subscriptions for broadcast and updates

**Rationale:**
- Zero additional cost (already have Supabase)
- Instant delivery when online
- Postgres changes trigger automatically
- Simple polling fallback for reconnection

### ADR-008: Separate Settlement Tables

**Decision:** Use `commission_ledger` + `withdrawal_requests` instead of single transactions table

**Rationale:**
- Clear separation of concerns
- Easy audit trail for financial data
- Aging calculation straightforward
- Matches mental model of debits/credits

### ADR-009: Admin Allowlist over Role-Only

**Decision:** Pre-seeded `admin_allowed_emails` table gates admin access

**Rationale:**
- Can add admins before they register
- Clean separation from regular auth flow
- Easy to audit who has admin access
- Matches PRD V2 specification

---

## Development Setup (V2)

### New Dependencies

```bash
# V2 additions
npm install date-fns date-fns-tz  # Date handling
npm install sonner                 # Toast notifications (if not present)
```

### Vercel Cron Setup

1. Add `vercel.json` with cron configuration
2. Set `CRON_SECRET` environment variable
3. Verify cron authorization in each endpoint

### Supabase Storage Setup

1. Create `provider-documents` bucket (private)
2. Apply RLS policies from schema
3. Configure CORS for client uploads

---

_Generated by BMAD Decision Architecture Workflow v2.0_
_Date: 2025-12-11_
_For: Gabe_
_PRD Version: V2 (110 FRs, 23 NFRs)_
