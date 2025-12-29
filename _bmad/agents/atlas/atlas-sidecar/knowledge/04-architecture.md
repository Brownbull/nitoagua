# Architectural Decisions & Patterns

> Section 4 of Atlas Memory
> Last Sync: 2025-12-22
> Sources: docs/architecture.md, docs/standards/progressive-web-app-standards.md

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

## Code Review Learnings (Consolidated)

| Epic | Story | Pattern | Location |
|------|-------|---------|----------|
| 8 | 8-6 | `getDeliveryPrice()` centralized pricing | `src/lib/utils/commission.ts` |
| 8 | 8-6 | `aria-busy`/`aria-live` for loading states | Period selectors |
| 8 | 8-7 | Storage bucket with folder-based RLS | `commission-receipts` bucket |
| 8 | 8-9 | `hideBackButton` prop for component reuse | ServiceAreaSettings |
| 8 | 8-9 | Settings page layout: `max-w-lg mx-auto px-4 py-6` | Provider settings |
| 8 | 8-10 | `dynamic()` import for SSR bypass | Leaflet map wrapper |
| 8 | 8-10 | Full-screen page layout override | `usePathname()` conditional |
| 10 | 10-3 | `data-testid` prop passthrough | CountdownTimer |
| 10 | 10-3 | `aria-live` on active AND expired states | Accessibility |
| 10 | 10-3 | `COUNTDOWN_THRESHOLDS` exported constants | `src/lib/utils/countdown.ts` |
| 10 | 10-7 | Dynamic viewport units (`min-h-dvh`) | `globals.css` |
| 10 | 10-7 | Safe area handling (`pb-safe`) | PWA standards |

### Key Component Patterns

| Component | Location | Key Props |
|-----------|----------|-----------|
| CountdownTimer | `src/components/shared/countdown-timer.tsx` | `expiresAt`, `onExpire`, `showPrefix`, `showIcon`, `data-testid` |
| Storage Bucket | `commission-receipts` | Private, 5MB, path: `{provider_id}/{timestamp}-receipt.{ext}` |

### Mobile Screen Adaptability (Story 10-7)

| Pattern | Usage | Location |
|---------|-------|----------|
| `min-h-dvh` | Dynamic viewport height for mobile layouts | `src/app/globals.css` |
| `safe-area-bottom` | Bottom nav padding for notched devices | `src/app/globals.css` |
| `flex-1 overflow-y-auto` | Scrollable content within fixed viewport | Layout components |

**CSS Utilities Added:**
- `min-h-dvh`, `h-dvh`, `min-h-svh`, `min-h-lvh` - Viewport height variants
- `safe-area-bottom`, `safe-area-top` - Safe area padding with base padding
- `pb-safe`, `pt-safe` - Safe area padding without base padding
- CSS variables: `--safe-top`, `--safe-bottom`, `--safe-left`, `--safe-right`

**Critical Rule:** Standalone fallback components (loading states, error states) must use `min-h-dvh` directly. Do NOT use `flex-1` unless the component is guaranteed to be inside a flex parent.

**Full Standards:** See `docs/standards/progressive-web-app-standards.md` for complete PWA development guidelines.

---

### Vercel Caching Prevention (Story 11-8)

**Problem:** Next.js pages with SSR database queries get cached by Vercel, showing stale data.

**Pattern:** Export `dynamic = "force-dynamic"` on any page that:
- Displays real-time queue data (admin verification, orders)
- Shows current status that changes frequently
- Queries database for counts or listings

**Example:**
```typescript
// src/app/admin/verification/page.tsx
export const dynamic = "force-dynamic";
```

**Pages requiring force-dynamic:**
- `/admin/verification` - Provider verification queue
- `/admin/orders` - Orders management
- `/admin/dashboard` - Operations dashboard (if showing live counts)

---

### Pricing DRY Enforcement (Story 11-9)

**Problem:** `AMOUNT_OPTIONS` in `request.ts` had hardcoded prices that diverged from `getDeliveryPrice()`.

**Pattern:** All pricing MUST derive from `getDeliveryPrice()` - NO hardcoded price values.

**Fixed Location:** `src/lib/validations/request.ts`

**Code:**
```typescript
export const AMOUNT_OPTIONS = [
  { value: "100" as const, label: "100 L", price: getDeliveryPrice(100) },
  { value: "1000" as const, label: "1.000 L", price: getDeliveryPrice(1000) },
  { value: "5000" as const, label: "5.000 L", price: getDeliveryPrice(5000) },
  { value: "10000" as const, label: "10.000 L", price: getDeliveryPrice(10000) },
];
```

**Rule:** When adding new pricing displays, import and call `getDeliveryPrice()` - never hardcode prices.

---

### Workflow Documentation Pattern (Story 11-21)

**Pattern:** Comprehensive workflow documentation with test traceability.

**Location:** `docs/workflows/`

| Document | Persona | Workflows | Coverage |
|----------|---------|-----------|----------|
| `consumer-workflows.md` | Doña María | C1-C7 | 100% |
| `provider-workflows.md` | Don Pedro | P1-P16 | 87.5% (P2, P12 backlogged) |
| `admin-workflows.md` | Admin | A1-A9 | 100% |

**Workflow ID Convention:**
- **C#:** Consumer workflows (C1=Request Water, C2=Accept Offer, etc.)
- **P#:** Provider workflows (P1=Register, P5=Browse Requests, P6=Submit Offer, etc.)
- **A#:** Admin workflows (A1=View Queue, A3=Approve/Reject, etc.)

**Cross-Reference:** Each workflow doc links to Atlas Section 8 (Workflow Chains).

**Backlogged Gaps (Epic 12):**
- P2: Document upload mechanics (file upload not E2E tested)
- P12: Withdrawal request button click (seeded only)

---

### Consumer Map Pinpoint Pattern (Story 12-1)

**Pattern:** Leaflet map step integrated into multi-step wizard.

**Location:** `src/components/consumer/location-pinpoint.tsx`, `location-pinpoint-wrapper.tsx`

**Key Implementation:**
- Dynamic import wrapper with `ssr: false` (reuses Story 8-10 pattern)
- Wizard state machine: `step1 → map → step2 → step3`
- Visual progress shows 3 steps while internal state has 4 states
- Confirm button disabled until map fully loads (code review fix)

**Code:**
```typescript
// Wrapper pattern for SSR bypass
const LocationPinpoint = dynamic(
  () => import("./location-pinpoint").then((mod) => mod.LocationPinpoint),
  { ssr: false, loading: () => <MapLoadingSkeleton /> }
);

// Button disabled until loaded
<Button disabled={!mapLoaded} onClick={handleConfirm}>
  Confirmar Ubicación
</Button>
```

**Graceful Degradation:**
- 10-second timeout triggers error state
- Skip button allows proceeding without coordinates
- `console.error` for monitoring

**Test Helper Pattern:**
```typescript
// Skip map step in tests that don't need it
async function skipMapStep(page: Page) {
  await expect(page.getByTestId("map-step")).toBeVisible({ timeout: 10000 });
  await expect(page.getByTestId("map-confirm-button")).toBeVisible({ timeout: 15000 });
  await page.getByTestId("map-confirm-button").click();
}
```

---

### Performance Baseline Metrics (Story 12.5-1)

**Problem:** Users report sluggishness across all pages on mobile and desktop.

**Key Findings:**
| Page Type | Performance | Primary Issue |
|-----------|-------------|---------------|
| Static pages (/, /request) | ✅ Excellent (<100ms FCP) | None |
| SSR+Auth pages | ⚠️ Slow (650-1500ms TTFB) | RLS policy inefficiency |
| Admin pages | ❌ Critical (1.6-2.5s TTFB) | Multiple DB queries + RLS |

**Root Causes Identified:**
1. **37 RLS policies** using `auth.uid()` instead of `(select auth.uid())` - causes re-evaluation per row
2. **6 unindexed foreign keys** causing full table scans on JOINs
3. **Large bundles** - zod (2.3MB), Supabase packages (1.7MB) on client

**Optimization Priority:**
1. Story 12.5-3: Database (HIGH impact, LOW effort) - Fix RLS first
2. Story 12.5-2: Bundle (MEDIUM impact, MEDIUM effort)
3. Story 12.5-4: SSR (HIGH impact, HIGH effort)

**Bundle Analyzer Pattern:**
```typescript
// next.config.ts
// eslint-disable-next-line @typescript-eslint/no-require-imports
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
```

**Run with:** `npm run analyze` (builds with ANALYZE=true)

**Source:** docs/sprint-artifacts/epic12.5/performance-baseline.md

---

*Last verified: 2025-12-29 | Source: architecture.md, Story 8-6, 8-7, 8-9, 8-10, 10-3, 10-7, 11-8, 11-9, 11-21, 12-1, 12.5-1 code reviews*
