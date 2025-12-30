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

### Bundle Size Optimization (Story 12.5-2)

**Pattern:** Turbopack/webpack aliasing for unused module exclusion.

**Location:** `next.config.ts`

**Key Implementation:**

1. **Zod v4 locale exclusion** - Exclude 46 unused locale files (~238KB savings)
```typescript
// next.config.ts
turbopack: {
  resolveAlias: {
    // Only include English locale (Spanish messages are in our schemas)
    "zod/v4/locales": { browser: "./node_modules/zod/v4/locales/en.js" },
  },
},
webpack: (config, { isServer }) => {
  if (!isServer) {
    config.resolve.alias = {
      ...config.resolve.alias,
      "zod/v4/locales": require.resolve("zod/v4/locales/en.js"),
    };
  }
  return config;
},
```

2. **Dynamic import for conditional heavy libraries**
```typescript
// Instead of: import confetti from "canvas-confetti";
// Use conditional dynamic import:
useEffect(() => {
  if (someCondition) {
    import("canvas-confetti").then((mod) => {
      const confetti = mod.default;
      confetti({ /* options */ });
    });
  }
}, [someCondition]);
```

**Bundle Reduction Achieved:**
| Metric | Before | After | Savings |
|--------|--------|-------|---------|
| Static chunks | 3.4 MB | 3.0 MB | 400 KB (12%) |
| Zod locales | 238 KB | 0 KB | 238 KB |
| canvas-confetti | Static | Dynamic | ~17 KB initial |

**Already Optimized (verified):**
- Leaflet: Dynamic import with `ssr: false` (Story 8-10)
- Lucide-react: All 120+ imports use named exports (tree-shaking works)
- date-fns: Module imports enable tree-shaking

**Source:** docs/sprint-artifacts/epic12.5/12.5-2-bundle-size-optimization.md

---

### RLS Policy Optimization (Story 12.5-3)

**Problem:** RLS policies using `auth.uid()` or `auth.jwt()` directly re-evaluate the function for each row scanned.

**Solution:** Use `(select auth.uid())` or `(select auth.jwt())` which caches the result for the entire query.

**Patterns:**
```sql
-- BEFORE - Slow (re-evaluates per row)
CREATE POLICY "Users can read own" ON table
    FOR SELECT
    USING (user_id = auth.uid());

-- AFTER - Fast (cached for query)
CREATE POLICY "Users can read own" ON table
    FOR SELECT
    USING (user_id = (select auth.uid()));

-- Admin policies use auth.jwt() for email checks
-- BEFORE - Slow
USING ((auth.jwt() ->> 'email') = admin_email);

-- AFTER - Fast
USING (((select auth.jwt()) ->> 'email') = admin_email);
```

**Implementation:**
- Migration: `20251229100000_optimize_rls_performance.sql`
- 32 RLS policies optimized across 11 tables:
  - Part 1: 25 user policies using `auth.uid()`
  - Part 1B: 7 admin policies using `auth.jwt()` (added by code review)
- Expected improvement: 50-80% reduction in RLS evaluation time

**Affected Tables:**
- User policies: profiles, offers, water_requests, notifications, provider_documents, provider_service_areas, push_subscriptions, commission_ledger, withdrawal_requests
- Admin policies: admin_allowed_emails, admin_settings

**Additional Indexes Created:**
- 6 missing FK indexes (admin_settings, commission_ledger, provider_documents, water_requests, withdrawal_requests)
- 4 performance indexes (offers.status, profiles.role, water_requests composite)

**Code Review Lesson:** Always check Supabase performance advisors after RLS migrations - they catch policies missed during manual review.

**Source:** docs/sprint-artifacts/epic12.5/12.5-3-data-fetching-optimization.md

---

### React Rendering Optimization (Story 12.5-4)

**Pattern:** Systematic memoization for React components to prevent unnecessary re-renders.

**Key Implementation:**

1. **React.memo for list item components**
   - Wrap components rendered in loops (`OfferCard`, `RequestCard`, `OrderCard`, `StatsCard`)
   - Prevents parent re-render from cascading to all children

2. **useMemo for computed values**
   - Status flags, formatted dates, sorted lists
   - Only recalculates when dependencies change

3. **useCallback for event handlers**
   - Handlers passed as props to child components
   - Maintains stable function references across renders

4. **Constants outside components**
   - Move static arrays/objects outside component functions (`HISTORY_STATUSES`, `NOTIFICATION_ICONS`, `STATS_COLOR_CLASSES`)
   - Provides stable references without useMemo overhead

**Example Pattern:**
```typescript
// Constants outside component
const HISTORY_STATUSES = ["expired", "cancelled", "request_filled"];

// Memoized component
function OfferCardComponent({ offer, onWithdraw }: Props) {
  // Memoize computed values
  const { isActive, isHistoryStatus } = useMemo(() => ({
    isActive: offer.status === "active",
    isHistoryStatus: HISTORY_STATUSES.includes(offer.status),
  }), [offer.status]);

  // Memoize handlers passed to children
  const handleWithdraw = useCallback(async () => {
    await withdrawOffer(offer.id);
    onWithdraw?.(offer.id);
  }, [offer.id, onWithdraw]);

  return (/* ... */);
}

// Memoized export
export const OfferCard = memo(OfferCardComponent);
```

**Components Optimized:**
- `src/components/provider/offer-card.tsx`
- `src/components/provider/notification-bell.tsx` (NotificationItem)
- `src/components/admin/orders-table.tsx` (StatsCard, OrderCard)
- `src/components/supplier/request-card.tsx`
- `src/components/supplier/request-list.tsx`
- `src/components/shared/countdown-timer.tsx`

**Key Decision:** Virtualization deferred - lists are paginated (20 items) and don't exceed 50 item threshold.

**Tailwind Fix:** Deprecated `flex-shrink-0` replaced with `shrink-0`.

**Source:** docs/sprint-artifacts/epic12.5/12.5-4-react-rendering-optimization.md

---

### Build & Development Performance Decision (Story 12.5-5)

**Problem:** Evaluate if alternative package managers (pnpm, Bun) would improve developer productivity.

**Baseline Measurements:**
| Metric | npm | pnpm | Bun |
|--------|-----|------|-----|
| Clean Install | 85.6s | 38.9s (2.2x) | 41.2s (2.1x) |
| Production Build | 20.3s | - | - |
| Dev Server Startup | 954ms | - | - |
| Hot Reload | <100ms | - | - |

**Decision:** Keep npm

**Rationale:**
1. Both alternatives only marginally exceed 2x threshold (2.2x and 2.1x)
2. Both have minor compatibility warnings (supabase binary, blocked postinstalls)
3. Dev server already excellent (<1s startup with Turbopack)
4. Build time acceptable (20s)
5. Migration risk outweighs marginal benefits

**Cleanup:** Added `bun.lock` and `pnpm-lock.yaml` to `.gitignore` to prevent test artifacts from being committed.

**Source:** docs/sprint-artifacts/epic12.5/12.5-5-build-development-performance.md

---

### Bundle Size Budget CI Integration (Story 12.5-6)

**Pattern:** CI-integrated bundle size validation with budgets and warnings.

**Location:** `scripts/check-bundle-size.js`

**Key Implementation:**

```javascript
const BUDGETS = {
  totalChunks: {
    limit: 3.5 * 1024 * 1024,  // 3.5 MB hard limit
    warn: 3.2 * 1024 * 1024,   // 3.2 MB warning threshold
  },
  largestChunk: {
    limit: 250 * 1024,  // 250 KB per chunk
    warn: 200 * 1024,   // 200 KB warning
  }
};
```

**npm Script:** `npm run build:check-size`

**Current Status (v2.2.0):**
- Total chunks: 1.70 MB (well within 3.5 MB budget)
- Largest chunk: 196.8 KB (within 250 KB budget)

**Documentation:**
- Performance guide: `docs/technical/performance-guide.md`
- Results comparison: `docs/sprint-artifacts/epic12.5/performance-results.md`

**Source:** docs/sprint-artifacts/epic12.5/12.5-6-performance-validation-documentation.md

---

### Session Expiry Handling Pattern (Story 12.6-1)

**Problem:** User appears logged in but server actions fail with "need to be logged in" error. Root cause: Token refresh only happens on page navigation (middleware), not on server action calls.

**Solution:** Multi-layer session validation:

1. **Client-side proactive refresh** (`src/lib/auth/session.ts`)
```typescript
// ensureValidSession() - call before critical actions
const REFRESH_BUFFER_MS = 5 * 60 * 1000; // 5 minutes

export async function ensureValidSession(): Promise<SessionValidationResult> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) return { valid: false };

  const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
  if (Date.now() > expiresAt - REFRESH_BUFFER_MS) {
    await supabase.auth.refreshSession();
  }
  return { valid: true, userId: session.user.id };
}
```

2. **useAuth hook enhancements** (`src/hooks/use-auth.ts`)
   - Visibility change handler: Validates session when app resumes from background
   - Periodic check: Polls session every 5 minutes when tab is active
   - Auto-redirect: Redirects to `/login?expired=true&returnTo=<path>` on expiry

3. **Server action `requiresLogin` flag**
```typescript
// Return type for auth-required server actions
interface SubscribeResult {
  success: boolean;
  error?: string;
  requiresLogin?: boolean;  // Client should redirect to login
}

// In server action
if (!user) {
  return { success: false, requiresLogin: true, error: "Tu sesión expiró..." };
}
```

4. **Login redirect flow**
   - Login page: Accepts `?returnTo=` and `?expired=true` params
   - OAuth callback: Preserves `returnTo` through Google OAuth flow
   - Toast: Shows "Tu sesión expiró" when `expired=true`
   - Post-login: Redirects to `returnTo` URL (validated as safe relative path)

**Key Decision:** Client-only session utility. Server actions use direct `getUser()` calls - the `ensureValidSession()` utility is only for client-side proactive refresh before critical UI actions.

**Files:**
- `src/lib/auth/session.ts` - Session validation utilities
- `src/components/auth/session-expired-toast.tsx` - Toast component
- `src/hooks/use-auth.ts` - Hook with visibility change + periodic checks
- `src/app/(auth)/login/page.tsx` - Login with returnTo/expired params
- `src/app/auth/callback/route.ts` - OAuth callback with returnTo handling

**Source:** docs/sprint-artifacts/epic12.6/12.6-1-stale-session-fix.md

---

*Last verified: 2025-12-30 | Source: architecture.md, Story 8-6, 8-7, 8-9, 8-10, 10-3, 10-7, 11-8, 11-9, 11-21, 12-1, 12.5-1, 12.5-2, 12.5-3, 12.5-4, 12.5-5, 12.5-6, 12.6-1 code reviews*
