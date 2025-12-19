# Architectural Decisions & Patterns

> Section 4 of Atlas Memory
> Last Sync: 2025-12-18
> Sources: docs/architecture.md

## Tech Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| Frontend | Next.js 15 (App Router) | PWA support, SSR, TypeScript |
| UI Components | shadcn/ui + Tailwind | Accessible, customizable |
| Database | Supabase (PostgreSQL) | Managed, built-in auth, realtime |
| Auth | Supabase Auth | Google OAuth for all users |
| Email | Resend + React Email | Developer-friendly templates |
| Deployment | Vercel | Edge functions, auto HTTPS |
| Maps | Leaflet + OpenStreetMap | Free, no API key (provider map view) |

## System Boundaries

**In Scope:**
- Request coordination between consumers and providers
- Provider verification and management
- Commission tracking and settlement
- Email notifications

**External/Out of Scope:**
- Payment processing (cash/transfer handled externally)
- Route optimization (V2+ consideration)
- Push notifications (email only for MVP)

## Data Flows

### Consumer Request Flow
```
Consumer -> Request Form -> API Route -> Supabase ->
  -> Realtime Broadcast -> Provider Dashboard
  -> Email (guest tracking link)
```

### V2 Offer Flow
```
Provider -> Submit Offer -> Supabase ->
  -> Realtime to Consumer -> Consumer Selects ->
  -> Provider Notified -> Delivery -> Commission Ledger
```

## Architectural Decisions (ADRs)

| ADR | Decision | Rationale | Date |
|-----|----------|-----------|------|
| 001 | Next.js 15 App Router | PWA support, SSR, Vercel native | 2025-12-01 |
| 002 | Supabase over Firebase | PostgreSQL, better RLS, free tier | 2025-12-01 |
| 003 | shadcn/ui over MUI | Code ownership, accessibility | 2025-12-01 |
| 004 | Google OAuth only | Simplifies auth, consistent UX | 2025-12-04 |
| 005 | Server Actions pattern | Type-safe mutations | 2025-12-02 |
| 006 | Consumer-choice offers | Simpler than push assignment | 2025-12-11 |
| 007 | Supabase Realtime | Zero cost, instant notifications | 2025-12-11 |
| 008 | Separate settlement tables | Clear audit trail | 2025-12-11 |
| 009 | Admin allowlist | Pre-seed admins before registration | 2025-12-11 |

## Patterns Adopted

### API Response Format
```typescript
interface ApiResponse<T> {
  data: T | null;
  error: { code: string; message: string } | null;
}
```

### Server Action Pattern
```typescript
'use server';
export async function createOffer(requestId: string, data: OfferFormData) {
  const user = await requireProvider();
  const validated = offerSchema.safeParse(data);
  // ... validation, execution, revalidation
}
```

### Auth Guards
```typescript
export async function requireAuth() { /* ... */ }
export async function requireProvider() { /* ... */ }
export async function requireAdmin() { /* ... */ }
```

### Component Patterns
| Pattern | First Used | Location |
|---------|------------|----------|
| Admin Client (RLS bypass) | 2-7, 3-1 | `src/lib/supabase/admin.ts` |
| Server Actions | 3-1 | `src/lib/actions/*.ts` |
| shadcn/ui Dialog | 3-5 | Modal with form inputs |
| shadcn/ui AlertDialog | 3-6 | Confirmation dialogs |
| Optimistic UI | 3-5 | Set-based state tracking |
| Tab Preservation | 3-4 | `?from=` query param |
| Dynamic Import (SSR bypass) | 8-10 | `next/dynamic` with `ssr: false` for Leaflet |
| Full-screen Page Override | 8-10 | Conditional header hide via `usePathname()` in layout |

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| React Components | PascalCase | `OfferCard` |
| Files (components) | PascalCase | `OfferCard.tsx` |
| Files (utils) | kebab-case | `date-utils.ts` |
| Server Actions | camelCase | `createOffer` |
| Database columns | snake_case | `delivery_window_start` |
| User-facing strings | Spanish | `"Oferta expirada"` |
| Code comments | English | `// Calculate commission` |

## Cross-Cutting Concerns

### Date/Time
- Storage: UTC in database (TIMESTAMPTZ)
- Display: Chile time (America/Santiago)
- Library: date-fns with es locale

### Currency
- Storage: Integer (CLP has no decimals)
- Display: Full number with dots: `$15.000`

### Commission
- Default: 10%
- Provider override possible
- Calculation: `Math.round(grossAmount * commissionPercent / 100)`

### Pricing (Delivery)
- Single source of truth: `getDeliveryPrice()` in `src/lib/utils/commission.ts`
- Price tiers (CLP):
  - Up to 100L: $5,000
  - Up to 1,000L: $20,000
  - Up to 5,000L: $75,000
  - Over 5,000L: $140,000

---

## Code Review Learnings

### Story 8-6: Earnings Dashboard (2025-12-19)

**Patterns Adopted:**
- `getDeliveryPrice()`: Centralized pricing utility in `src/lib/utils/commission.ts`
- Accessibility: `aria-busy` and `aria-live` for loading states in period selectors

**Technical Decisions:**
- Payment method tracking: Deferred (TODO documented, defaults to cash)
- History pagination: Link hidden until `/provider/earnings/history` route implemented

**Coverage Notes:**
- 26 unit tests, 21+ E2E tests
- Gap: payment_method accuracy for AC8.6.3 (Efectivo Recibido)

## Storage Bucket: commission-receipts (Story 8-7)

Commission payment receipt storage with folder-based RLS:
- Bucket: `commission-receipts` (private, 5MB limit)
- Allowed types: image/jpeg, image/png, image/webp, application/pdf
- Path pattern: `{provider_id}/{timestamp}-receipt.{ext}`
- RLS: Providers can upload/view own, admins can view all

Server actions:
- `getPlatformBankDetails()` - Fetch bank account details from admin_settings
- `getPendingWithdrawal()` - Check for existing pending withdrawal
- `submitCommissionPayment(amount, receiptPath)` - Create withdrawal request
- `getReceiptUrl(receiptPath)` - Get signed URL for admin viewing

### Story 8-9: Provider Settings Page (2025-12-19)

**Patterns Adopted:**
- `hideBackButton` prop: Added to ServiceAreaSettings component for reuse in different layouts
- Consistent settings page layout: `max-w-lg`, `px-4 py-6`, white bg, `text-gray-900` headers
- View-only MVP pattern: Read-only detail pages with "contact support" note for edits

**Component Reuse:**
- AvailabilityToggleWrapper from Epic 7 reused in settings page
- ServiceAreaSettings component extended with `hideBackButton` prop for page-level back button

**Layout Standards (Provider Settings Pages):**
```
- Container: max-w-lg mx-auto px-4 py-6
- Header: text-2xl font-bold text-gray-900 mb-6
- Back button: Top of page, inline-flex items-center text-gray-600
- Cards: bg-white rounded-xl p-4 shadow-sm border border-gray-100
```

### Story 8-10: Provider Map View (2025-12-19)

**Patterns Adopted:**
- `dynamic()` import for Leaflet: SSR-incompatible libraries wrapped with `next/dynamic` using `ssr: false`
- Full-screen map pattern: Hide layout header conditionally using `usePathname()` in client layout
- Provider location: Browser geolocation with graceful degradation (permission denied = no-op)

**Technical Decisions:**
- **Map Library**: Leaflet + OpenStreetMap (free, no API key required) instead of Google Maps
- **Layout Override**: Map page hides provider header via conditional render in `layout.tsx` (matches UX mockup Section 7)
- **Disabled Features**: "Cercanos" filter disabled with tooltip "Próximamente" for future implementation

**Coverage Notes:**
- 12 E2E tests covering: page access, back navigation, auth redirect, filter chips, empty state, location button, FAB navigation
- Gap: Marker tap → preview card not tested with real seeded data (conditional check pattern used)

---

*Last verified: 2025-12-19 | Source: architecture.md, Story 8-6, 8-7, 8-9, 8-10 code reviews*
