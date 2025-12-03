# Story 3.2: Supplier Login

Status: ready-for-dev

## Story

As a **registered supplier (Don Pedro)**,
I want **to log in to my dashboard using my Google account**,
So that **I can view and manage water requests without remembering a password**.

## Background

This story implements the login flow for existing suppliers who have already completed registration (Story 3-1). Like registration, login uses **Google OAuth only** - a key architectural decision for Epic 3. The flow detects whether the user has a profile and routes them appropriately: existing suppliers go directly to the dashboard, while new users are redirected to onboarding.

## Acceptance Criteria

1. **AC3-2-1**: Existing supplier clicks "Continuar con Google" on login page
2. **AC3-2-2**: After Google auth, redirect directly to dashboard (no onboarding)
3. **AC3-2-3**: Session persisted (stay logged in on page refresh)
4. **AC3-2-4**: Role check: if profile.role !== 'supplier', redirect to consumer home
5. **AC3-2-5**: OAuth error shows: "Error al iniciar sesión. Intenta de nuevo."

## Tasks / Subtasks

- [ ] **Task 1: Login Page Enhancement** (AC: 1)
  - [ ] Verify `/login` page exists with Google sign-in button from Story 3-1
  - [ ] Ensure button styling matches Google branding guidelines
  - [ ] Add "loading" state visual feedback during OAuth redirect
  - [ ] Handle edge case: user already logged in → redirect to appropriate dashboard

- [ ] **Task 2: Auth Callback Role-Based Routing** (AC: 2, 4)
  - [ ] Update `src/app/auth/callback/route.ts` to check profile role
  - [ ] Query `profiles` table for authenticated user's role
  - [ ] Routing logic:
    - No profile → `/onboarding` (new user, handled by 3-1)
    - `role === 'supplier'` → `/dashboard`
    - `role === 'consumer'` → `/` (consumer home)
  - [ ] Add logging for auth routing decisions

- [ ] **Task 3: Session Persistence** (AC: 3)
  - [ ] Verify Supabase SSR middleware handles session refresh
  - [ ] Ensure session cookies are properly set with appropriate expiration
  - [ ] Test: logged-in user refreshes page and remains authenticated
  - [ ] Test: logged-in user closes browser, reopens, still authenticated (within session TTL)

- [ ] **Task 4: OAuth Error Handling** (AC: 5)
  - [ ] Handle OAuth callback errors (user cancels, Google error, network issues)
  - [ ] Create error page or redirect to login with error query param
  - [ ] Display toast: "Error al iniciar sesión. Intenta de nuevo."
  - [ ] Provide "Reintentar" button to try OAuth again
  - [ ] Log error details for debugging (don't expose to user)

- [ ] **Task 5: Supplier Dashboard Access Guard** (AC: 2, 4)
  - [ ] Add auth guard to `src/app/(supplier)/layout.tsx`
  - [ ] If not authenticated → redirect to `/login`
  - [ ] If authenticated but role !== 'supplier' → redirect to consumer home
  - [ ] Show loading skeleton while checking auth state

- [ ] **Task 6: E2E Tests** (AC: all)
  - [ ] Add tests to `tests/e2e/supplier-auth.spec.ts`
  - [ ] Test: Existing supplier OAuth redirects to dashboard
  - [ ] Test: Session persists across page refresh
  - [ ] Test: Non-supplier role redirects to consumer home
  - [ ] Test: OAuth error displays Spanish error message
  - [ ] Test: Unauthenticated access to /dashboard redirects to login

## Dev Notes

### Learnings from Previous Story

**From Story 3-1 (Supplier Registration) - Status: ready-for-dev**

Story 3-1 establishes the foundation for this story:
- Login page with Google OAuth button created at `src/app/(auth)/login/page.tsx`
- Google sign-in component at `src/components/auth/google-sign-in.tsx`
- Auth callback handler at `src/app/auth/callback/route.ts`
- Admin client pattern at `src/lib/supabase/admin.ts` for bypassing RLS

**Note**: Story 3-2 should verify these components exist from 3-1 before building on them. If 3-1 is not yet complete, coordinate with SM to sequence properly.

### Architecture Context

**Google OAuth Flow (from Tech Spec):**
```
1. User clicks "Continuar con Google"
2. Redirect to Google OAuth consent
3. Google redirects to /auth/callback
4. Supabase exchanges code for session
5. Check profile exists:
   - No profile → /onboarding (Story 3-1)
   - Supplier profile → /dashboard (This story)
   - Consumer profile → / (consumer home)
```

**Session Management:**
- Supabase JWT stored in HTTP-only cookies
- Managed by `@supabase/ssr` middleware
- Access token: 7 days expiration
- Refresh token: 30 days expiration

### Dependencies on Story 3-1

This story assumes 3-1 creates:
- `src/app/(auth)/login/page.tsx` - Login page
- `src/components/auth/google-sign-in.tsx` - Google button
- `src/app/auth/callback/route.ts` - Callback handler
- Google OAuth provider configured in Supabase

If these don't exist, implement them as part of this story (code will be shared).

### Role-Based Access Pattern

```typescript
// In auth callback route
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single();

if (!profile) {
  return NextResponse.redirect(new URL('/onboarding', request.url));
}

if (profile.role === 'supplier') {
  return NextResponse.redirect(new URL('/dashboard', request.url));
}

// Default: consumer
return NextResponse.redirect(new URL('/', request.url));
```

### Error Handling Pattern

```typescript
// Handle OAuth errors in callback
const error = searchParams.get('error');
const errorDescription = searchParams.get('error_description');

if (error) {
  console.error('[AUTH] OAuth error:', { error, errorDescription });
  return NextResponse.redirect(
    new URL(`/login?error=${encodeURIComponent(error)}`, request.url)
  );
}
```

### References

- [Source: docs/sprint-artifacts/epic3/tech-spec-epic-3.md#Story 3-2: Supplier Login]
- [Source: docs/sprint-artifacts/epic3/tech-spec-epic-3.md#Google OAuth Flow]
- [Source: docs/architecture.md#Authentication Flow]
- [Source: docs/sprint-artifacts/epic3/3-1-supplier-registration.md] - Prerequisite story

## Prerequisites

- Story 3-1 (Supplier Registration) - creates login page, Google OAuth button, callback handler
- Google OAuth configured in Supabase Dashboard
- Supabase Auth middleware functioning (from Epic 1)

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Existing supplier can log in via Google OAuth
- [ ] Session persists across page refresh
- [ ] Role-based routing works (supplier → dashboard, consumer → home)
- [ ] OAuth errors display user-friendly Spanish message
- [ ] E2E tests passing
- [ ] No regression in consumer flows
- [ ] Story status updated to `done`

---

## Dev Agent Record

### Context Reference

- docs/sprint-artifacts/epic3/3-2-supplier-login.context.xml

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2025-12-03 | SM Agent (Claude Opus 4.5) | Story drafted via create-story workflow |
