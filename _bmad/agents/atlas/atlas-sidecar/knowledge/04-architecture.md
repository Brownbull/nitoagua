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
| Maps | Google Maps API | Address lookup, geolocation |

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

---

## Sync Notes

Last architecture sync: 2025-12-18
Source: docs/architecture.md (V2 spec, 870 lines)
