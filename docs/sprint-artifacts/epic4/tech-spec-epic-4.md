# Epic Technical Specification: User Accounts & Profiles

Date: 2025-12-04
Author: Gabe
Epic ID: 4
Status: Draft

---

## Overview

Epic 4 delivers consumer account functionality for nitoagua, enabling returning consumers to create accounts for faster repeat orders with pre-filled information. This epic adds consumer registration, login, profile management, request history, and request cancellation.

**CRITICAL REQUIREMENT CHANGE FROM ORIGINAL SPEC:**

The original Epic 4 specification assumed **Email/Password authentication** for consumers. This has been **CHANGED** to:

| User Type | Production Auth | Test/Local Auth |
|-----------|-----------------|-----------------|
| Supplier | Google OAuth only | Google OAuth + Test Login |
| Consumer | Google OAuth only | Google OAuth + Test Login |
| Guest | No auth required | No auth required |

**Rationale:**
1. **Consistency** - Same auth flow for all registered users (suppliers and consumers)
2. **Simplicity** - No password management, reset flows, or security concerns
3. **Reusability** - Leverage existing Google OAuth infrastructure from Epic 3
4. **UX** - One-tap login experience for mobile users

**Guest Flow Unchanged:** Consumers can STILL request water without registering using the existing guest flow from Epic 2. Registration is optional and provides convenience features (pre-filled forms, request history).

## Objectives and Scope

### In Scope

- **Consumer Registration via Google OAuth** - Create consumer profile after Google sign-in
- **Consumer Login** - Shared login page with role-based routing
- **Consumer Profile Management** - Edit name, phone, address, special instructions
- **Pre-filled Request Form** - Auto-populate from profile for registered users
- **Request History** - View all past requests with status
- **Request Cancellation** - Cancel pending requests before acceptance
- **Test Login (Local Only)** - E2E test support without Google OAuth

### Out of Scope (MVP)

- Email/Password authentication (removed from requirements)
- Password reset flow (not applicable with Google OAuth)
- Social login providers other than Google
- Push notifications (Epic 5)
- Consumer ratings or reviews
- Multiple addresses per consumer (future enhancement)

### Stories in This Epic

| Story | Title | Focus |
|-------|-------|-------|
| 4-1 | Consumer Registration | Google OAuth + consumer profile creation |
| 4-2 | Consumer Login | Google OAuth sign-in, role routing |
| 4-3 | Pre-filled Request Form | Profile data auto-fill |
| 4-4 | Consumer Request History | Past request listing |
| 4-5 | Cancel Pending Request | Request cancellation flow |
| 4-6 | Epic Deployment & Verification | Git workflow, production deploy, verification |

## System Architecture Alignment

### Architecture Components Used

| Component | Usage in Epic 4 |
|-----------|-----------------|
| Next.js App Router | `src/app/(consumer)/*` route group enhancements |
| Supabase Auth | Google OAuth (reuse from Epic 3) |
| Supabase Database | `profiles` table (consumer data), `water_requests` queries |
| shadcn/ui | Profile form, history list, cancel dialog |
| React Hook Form + Zod | Profile form validation |

### Route Structure

```
src/app/
├── (auth)/
│   ├── login/page.tsx          # Shared login (consumers + suppliers)
│   └── auth/callback/route.ts  # OAuth callback with role routing
├── (consumer)/
│   ├── layout.tsx              # Consumer layout (already exists from Epic 2)
│   ├── page.tsx                # Home with personalized greeting
│   ├── request/page.tsx        # Request form (enhanced with pre-fill)
│   ├── profile/page.tsx        # Consumer profile management (NEW)
│   └── history/page.tsx        # Request history (NEW)
```

### Component Structure

```
src/components/
├── consumer/
│   ├── request-form.tsx        # Enhanced with pre-fill (existing)
│   ├── profile-form.tsx        # Consumer profile editing (NEW)
│   ├── request-history.tsx     # History list component (NEW)
│   └── cancel-dialog.tsx       # Cancel confirmation (NEW)
├── auth/
│   └── google-sign-in.tsx      # Reuse from Epic 3
```

## Detailed Design

### Authentication Flow (Revised)

```
┌─────────────────────────────────────────────────────────────────┐
│                    UNIFIED GOOGLE OAuth FLOW                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. User clicks "Continuar con Google" on /login                │
│  2. Redirect to Google OAuth consent                            │
│  3. Google redirects to /auth/callback                          │
│  4. Supabase exchanges code for session                         │
│  5. Check if profile exists:                                    │
│     ├─ No profile → Check intended role from query param:       │
│     │   ├─ ?role=supplier → /onboarding (supplier)              │
│     │   └─ ?role=consumer → /consumer/onboarding (NEW)          │
│     ├─ profile.role = 'supplier' → /dashboard                   │
│     └─ profile.role = 'consumer' → / (consumer home)            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Role-Based Routing Enhancement

The existing `/auth/callback/route.ts` needs enhancement to support consumer registration:

```typescript
// Enhanced callback routing logic
if (!profile) {
  // New user - check intended role from state/query
  const intendedRole = searchParams.get('role') || 'consumer'; // default to consumer

  if (intendedRole === 'supplier') {
    return NextResponse.redirect(new URL('/onboarding', request.url));
  } else {
    return NextResponse.redirect(new URL('/consumer/onboarding', request.url));
  }
}

// Existing user - route by role
if (profile.role === 'supplier') {
  return NextResponse.redirect(new URL('/dashboard', request.url));
}

// Consumer
return NextResponse.redirect(new URL('/', request.url));
```

### Consumer Profile Fields

```sql
-- Consumer-specific usage of profiles table
-- (Table structure from Epic 1, consumer fields used in Epic 4)

profiles:
  id UUID              -- from auth.users
  role TEXT            -- 'consumer'
  name TEXT            -- Display name
  phone TEXT           -- Chilean format +56XXXXXXXXX
  address TEXT         -- Default delivery address
  special_instructions TEXT -- "past the bridge" type notes
  created_at TIMESTAMPTZ
  updated_at TIMESTAMPTZ

-- NOTE: Consumer profiles do NOT use supplier fields:
-- service_area, price_100l, price_1000l, price_5000l, price_10000l, is_available
```

### TypeScript Types

```typescript
// src/types/consumer.ts
export interface ConsumerProfile {
  id: string;
  role: 'consumer';
  name: string;
  phone: string;
  address: string | null;
  specialInstructions: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConsumerProfileInput {
  name: string;
  phone: string;
  address?: string;
  specialInstructions?: string;
}

// Consumer onboarding (minimal - just required fields)
export interface ConsumerOnboardingInput {
  name: string;
  phone: string;
}
```

### Data Models and Contracts

#### Request History Query

```typescript
// Query for consumer request history
const { data: requests } = await supabase
  .from('water_requests')
  .select('*')
  .eq('consumer_id', userId)
  .order('created_at', { ascending: false })
  .range(offset, offset + limit - 1);
```

#### Request Cancellation

```typescript
// Cancel request API contract
// PATCH /api/requests/[id]
{ action: 'cancel' }

// Response
{ data: { id, status: 'cancelled', cancelledAt }, error: null }

// Validation rules:
// 1. Request must exist
// 2. Status must be 'pending' (not accepted/delivered/cancelled)
// 3. User must be the consumer who created request (consumer_id = auth.uid())
//    OR guest with valid tracking_token
```

### APIs and Interfaces

#### Consumer Profile API

```typescript
// GET /api/consumer/profile
// Returns current consumer profile
{ data: ConsumerProfile, error: null }

// PATCH /api/consumer/profile
// Update consumer profile
{ name, phone, address?, specialInstructions? }
// Response: { data: ConsumerProfile, error: null }
```

#### Request Cancellation Extension

```typescript
// Extend existing PATCH /api/requests/[id]
// Add action: 'cancel' to supported actions

// Request: { action: 'cancel' }
// Response: { data: { id, status, cancelledAt }, error: null }

// Error cases:
// - 400: Request not found
// - 400: Request not pending (cannot cancel)
// - 403: Not authorized to cancel this request
```

### Test Login (Local Development Only)

For E2E testing without Google OAuth:

```typescript
// Environment check
const isTestLoginEnabled = process.env.NODE_ENV === 'development' &&
                           process.env.ENABLE_TEST_LOGIN === 'true';

// Test login route (local only)
// POST /api/auth/test-login
{ email: 'test-consumer@test.local', role: 'consumer' }
{ email: 'test-supplier@test.local', role: 'supplier' }

// Creates or retrieves test user and returns session
// ONLY available when ENABLE_TEST_LOGIN=true (local dev)
```

## Story Specifications

### Story 4-1: Consumer Registration

**Changes from Original Spec:**
- ~~Email/Password~~ → Google OAuth only
- Simplified onboarding (just name + phone, address optional)

**Acceptance Criteria (Revised):**
1. "Crear Cuenta" button visible on consumer home (for non-logged-in users)
2. Clicking redirects to login page with `?role=consumer` param
3. Google OAuth flow completes
4. New consumer users redirect to `/consumer/onboarding`
5. Onboarding form collects: name, phone (Chilean format)
6. Profile created with `role='consumer'`
7. Redirect to consumer home with toast: "¡Cuenta creada!"

### Story 4-2: Consumer Login

**Changes from Original Spec:**
- ~~Email/Password~~ → Google OAuth only
- Shared login page with suppliers

**Acceptance Criteria (Revised):**
1. Login page shows single "Continuar con Google" button
2. After OAuth, existing consumers redirect to home (/)
3. Existing suppliers redirect to /dashboard
4. New users redirect to appropriate onboarding
5. Consumer home shows personalized greeting: "Hola, [Name]"

### Story 4-3: Pre-filled Request Form

**Unchanged from Original Spec:**
- If logged in, pre-fill: name, phone, address, special_instructions
- Hide email field (in-app tracking instead)
- Set `consumer_id` on request submission

### Story 4-4: Consumer Request History

**Unchanged from Original Spec:**
- List requests where `consumer_id = userId`
- Pagination, status badges, detail view
- Empty state with CTA

### Story 4-5: Cancel Pending Request

**Unchanged from Original Spec:**
- Cancel button visible only for `status='pending'`
- Confirmation dialog
- Updates status to 'cancelled' with timestamp
- Works for both registered consumers and guests (with token)

## UX Considerations

### Consumer Onboarding Flow

The consumer onboarding is intentionally minimal compared to supplier onboarding:

| Field | Consumer | Supplier |
|-------|----------|----------|
| Name | Required | Required |
| Phone | Required | Required |
| Service Area | - | Required |
| Price Tiers (4) | - | Required |
| Address | Optional (can add later) | - |

**Rationale:** Consumers want quick signup. They can add address during first request or in profile later.

### Login Page Enhancement

The existing `/login` page needs to support both user types:

```
┌─────────────────────────────────────────┐
│                                         │
│            nitoagua                     │
│                                         │
│    ┌─────────────────────────────┐      │
│    │   Continuar con Google      │      │
│    └─────────────────────────────┘      │
│                                         │
│    ─────────── o ───────────            │
│                                         │
│    ¿Eres proveedor de agua?             │
│    [Registrarme como proveedor]         │
│                                         │
└─────────────────────────────────────────┘
```

Default assumption: User is a consumer (most common case).

## Security Considerations

### Authorization Matrix

| Action | Guest | Consumer | Supplier |
|--------|-------|----------|----------|
| Create request | ✓ | ✓ | - |
| View request (by token) | ✓ | ✓ | - |
| View request (by consumer_id) | - | ✓ (own) | - |
| Cancel request | ✓ (own, with token) | ✓ (own) | - |
| View request history | - | ✓ (own) | - |
| Manage profile | - | ✓ | ✓ |

### RLS Policies

```sql
-- Consumer can view own requests
CREATE POLICY "Consumers can view own requests"
ON water_requests FOR SELECT
USING (consumer_id = auth.uid());

-- Consumer can cancel own pending requests
CREATE POLICY "Consumers can cancel own pending requests"
ON water_requests FOR UPDATE
USING (
  consumer_id = auth.uid() AND
  status = 'pending'
)
WITH CHECK (status = 'cancelled');
```

## Testing Strategy

### Test Login for E2E

```typescript
// tests/e2e/helpers/auth.ts
export async function loginAsTestConsumer(page: Page) {
  if (process.env.ENABLE_TEST_LOGIN !== 'true') {
    throw new Error('Test login not enabled');
  }

  await page.request.post('/api/auth/test-login', {
    data: { email: 'test-consumer@test.local', role: 'consumer' }
  });
}
```

### E2E Test Coverage

| Story | Test Focus |
|-------|------------|
| 4-1 | Registration flow, onboarding form validation |
| 4-2 | Login routing, personalized home |
| 4-3 | Pre-fill verification, consumer_id linkage |
| 4-4 | History pagination, status badges |
| 4-5 | Cancel flow, authorization checks |

## Implementation Notes

### Reuse from Epic 3

| Component | Source | Reuse Type |
|-----------|--------|------------|
| Google OAuth button | `src/components/auth/google-sign-in.tsx` | Direct |
| Auth callback | `src/app/auth/callback/route.ts` | Extend |
| Profile form pattern | `src/components/supplier/profile-form.tsx` | Pattern |
| AlertDialog | `src/components/ui/alert-dialog.tsx` | Direct |
| Toast notifications | Sonner | Direct |

### New Components Needed

1. `src/app/(consumer)/onboarding/page.tsx` - Consumer onboarding
2. `src/components/consumer/onboarding-form.tsx` - Name + phone form
3. `src/app/(consumer)/profile/page.tsx` - Consumer profile page
4. `src/components/consumer/profile-form.tsx` - Profile editing
5. `src/app/(consumer)/history/page.tsx` - Request history
6. `src/components/consumer/request-history.tsx` - History list
7. `src/components/consumer/cancel-dialog.tsx` - Cancel confirmation
8. `src/app/api/consumer/profile/route.ts` - Profile API
9. `src/app/api/auth/test-login/route.ts` - Test login (local only)

### API Route Extensions

1. Extend `/api/requests/[id]` with `action: 'cancel'`
2. Extend `/auth/callback` with consumer role routing

## Migration Checklist

### Pre-Development

- [ ] Verify Google OAuth still works in production (from Epic 3)
- [ ] Confirm profiles table has consumer-needed fields
- [ ] Review existing consumer components from Epic 2

### Implementation Order

1. **Story 4-1** - Consumer registration (foundation)
2. **Story 4-2** - Consumer login (builds on 4-1)
3. **Story 4-3** - Pre-filled form (requires login)
4. **Story 4-4** - Request history (requires login)
5. **Story 4-5** - Cancel request (can be parallel with 4-4)

---

## References

- [Epic 3 Tech Spec](./epic3/tech-spec-epic-3.md) - Google OAuth patterns
- [Architecture](../architecture.md) - System design
- [PRD](../prd.md) - Functional requirements FR2-FR5, FR12, FR15-FR16
- [Epics](../epics.md) - Original story definitions (to be updated)

---

*Generated: 2025-12-04*
*Epic 4 Status: contexted*
