# Architectural Decisions & Patterns

> Section 4 of Atlas Memory
> Last Sync: 2026-01-04
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
| Maps | Leaflet + OpenStreetMap | Free, no API key |

## System Boundaries

**In Scope:** Request coordination, provider verification, commission tracking, email/push notifications
**Out of Scope:** Payment processing (cash/transfer), route optimization

## Data Flows

- **Consumer Request:** Form → API → Supabase → Realtime Broadcast → Provider Dashboard + Email
- **V2 Offer:** Provider → Offer → Realtime → Consumer Selects → Delivery → Commission Ledger

## ADRs (Architectural Decision Records)

| ADR | Decision | Rationale |
|-----|----------|-----------|
| 001 | Next.js 15 App Router | PWA support, SSR, Vercel native |
| 002 | Supabase over Firebase | PostgreSQL, better RLS, free tier |
| 003 | shadcn/ui over MUI | Code ownership, accessibility |
| 004 | Google OAuth only | Simplifies auth, consistent UX |
| 005 | Server Actions | Type-safe mutations |
| 006 | Consumer-choice offers | Simpler than push assignment |
| 007 | Supabase Realtime | Zero cost, instant notifications |
| 008 | Separate settlement tables | Clear audit trail |
| 009 | Admin allowlist | Pre-seed admins before registration |

## Core Patterns

| Pattern | Location | Notes |
|---------|----------|-------|
| ApiResponse<T> | Type convention | `{ data: T | null, error: { code, message } | null }` |
| Server Actions | `src/lib/actions/*.ts` | `'use server'` + requireProvider/requireAdmin guards |
| Admin Client | `src/lib/supabase/admin.ts` | RLS bypass for elevated operations |
| Dynamic Import | `next/dynamic` with `ssr: false` | Leaflet, location-pinpoint |
| ActionResult<T> | `src/lib/types/action-result.ts` | `{ success, error?, requiresLogin? }` |

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Components | PascalCase | `OfferCard.tsx` |
| Utils | kebab-case | `date-utils.ts` |
| DB columns | snake_case | `delivery_window_start` |
| UI strings | Spanish | `"Oferta expirada"` |
| Comments | English | `// Calculate commission` |

## Cross-Cutting Concerns

- **Date/Time:** UTC storage (TIMESTAMPTZ), Chile display (America/Santiago), date-fns/es
- **Currency:** Integer (CLP no decimals), display: `$15.000`
- **Commission:** Default 10%, `Math.round(grossAmount * commissionPercent / 100)`
- **Pricing:** Single source: `getDeliveryPrice()` in `src/lib/utils/commission.ts`
  - 100L: $5,000 | 1,000L: $20,000 | 5,000L: $75,000 | 10,000L: $140,000

---

## Code Review Learnings (by Epic)

| Epic | Pattern | Key Learning |
|------|---------|--------------|
| 8 | Centralized pricing | `getDeliveryPrice()` - never hardcode prices |
| 8 | Storage bucket RLS | `commission-receipts` with `{provider_id}/` path |
| 8 | SSR bypass | `dynamic()` with `ssr: false` for Leaflet |
| 10 | CountdownTimer | `data-testid` passthrough, `aria-live` for accessibility |
| 10 | Mobile viewport | `min-h-dvh`, `safe-area-bottom`, `pb-safe` CSS utilities |
| 11 | Force-dynamic | Export `dynamic = "force-dynamic"` for admin pages |
| 11 | DRY pricing | `AMOUNT_OPTIONS` must call `getDeliveryPrice()` |
| 12 | Map wizard | 4-state machine, button disabled until `mapLoaded` |
| 12.5 | RLS optimization | `(select auth.uid())` vs `auth.uid()` - caches per query |
| 12.5 | React memoization | `memo()`, `useMemo()`, `useCallback()` for list items |
| 12.5 | Bundle aliasing | Zod locale exclusion in `next.config.ts` |
| 12.6 | Session handling | `requiresLogin` flag + client visibility checks |
| 12.7 | Fixed panel layout | `flex flex-col` + `shrink-0` header/footer, `flex-1 overflow-y-auto` content |
| 12.7 | Admin safe areas | `pb-safe` on bottom nav, `pb-20` on layout for mobile |
| 12.7 | Pre-validation pattern | `withdrawOffer()` validates status BEFORE mutation - prevents race conditions |
| 12.7 | Realtime query filtering | Consumer hook uses `.in("status", [...])` at query level, not client-side |
| 12.7 | localStorage with URL priority | URL params take priority, then localStorage fallback, then defaults |
| 12.7 | Dynamic year arrays | Generate year options dynamically: `Array.from({ length: currentYear - 2022 }, ...)` |
| 12.7 | Silent refresh failures | Realtime refresh errors fail silently - user can retry manually |
| 12.7 | Toast variant styling | Sonner `toastOptions.classNames` with `!important` modifiers to override default styles |
| 12.7 | PWA icon purposes | Manifest needs separate icon entries for `maskable` and `any` (Next.js type limitation) |
| 12.7 | Form submit overlay | Full-screen `fixed inset-0 z-50` overlay during submission prevents flash during navigation |
| 12.8 | Service Worker timeout | `navigator.serviceWorker.ready` can hang indefinitely - wrap with timeout (3s) |
| 12.8 | Push cleanup on logout | Call `cleanupPushBeforeLogout()` BEFORE `signOut()` to prevent cross-user notifications |
| 12.8 | Endpoint deduplication | On push subscribe, delete OTHER users' subscriptions for same endpoint (admin client) |
| 12.8 | Toast font consistency | Add `!font-sans` to Sonner classNames - toast portal may render outside body font context |

---

## Key Patterns Reference

### Mobile Screen Adaptability
- `min-h-dvh` for dynamic viewport height
- `safe-area-bottom` for notched devices
- Standalone fallbacks use `min-h-dvh` directly (not `flex-1`)
- **Full spec:** `docs/standards/progressive-web-app-standards.md`

### Vercel Caching Prevention
Pages with realtime DB queries need: `export const dynamic = "force-dynamic";`
- `/admin/verification`, `/admin/orders`, `/admin/dashboard`

### Fixed Slide-in Panel Pattern (Story 12.7-7)
When creating slide-in panels with action buttons at bottom:
```tsx
<div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl z-60 flex flex-col">
  {/* Header - shrink-0 prevents shrinking */}
  <div className="shrink-0 border-b px-5 py-4">Header</div>

  {/* Scrollable content - flex-1 takes remaining space */}
  <div className="flex-1 overflow-y-auto p-5">Content</div>

  {/* Sticky footer with safe area - shrink-0 prevents shrinking */}
  <div className="shrink-0 border-t p-4 safe-area-bottom">Actions</div>
</div>
```
- Used in: `ProviderDetailPanel`
- Key: `flex flex-col` on container, `shrink-0` on fixed height elements
- Note: Use `z-60` to layer above bottom nav (`z-50`)

### RLS Policy Performance
```sql
-- SLOW: re-evaluates per row
USING (user_id = auth.uid());
-- FAST: cached for entire query
USING (user_id = (select auth.uid()));
```
Migration: `20251229100000_optimize_rls_performance.sql` (32 policies, 11 tables)

### Session Expiry Handling (Story 12.6-1)
1. **Client:** `ensureValidSession()` in `src/lib/auth/session.ts` - proactive refresh
2. **Hook:** `useAuth` with visibility change + 5-min periodic checks
3. **Server:** Return `{ requiresLogin: true }` for auth failures
4. **Login:** `?returnTo=` + `?expired=true` params preserved through OAuth

### Bundle Budgets
```javascript
// scripts/check-bundle-size.js
totalChunks: 3.5 MB limit, 3.2 MB warn
largestChunk: 250 KB limit, 200 KB warn
```
Current (v2.4.0): 1.70 MB total, 196.8 KB largest

### Workflow Documentation
| Document | Persona | Workflows |
|----------|---------|-----------|
| `docs/workflows/consumer-workflows.md` | Consumer | C1-C7 (100%) |
| `docs/workflows/provider-workflows.md` | Provider | P1-P16 (87.5%) |
| `docs/workflows/admin-workflows.md` | Admin | A1-A9 (100%) |

---

*Last verified: 2026-01-05 | Sources: architecture.md, Epic 8-12.8 code reviews*
