# Story 1.3: Supabase Authentication Integration

Status: ready-for-dev

## Story

As a **developer**,
I want **Supabase Auth configured for the application**,
so that **users can register and log in securely**.

## Acceptance Criteria

1. **AC1.3.1**: Browser client at `src/lib/supabase/client.ts` functions correctly and can be imported by client components
2. **AC1.3.2**: Server client at `src/lib/supabase/server.ts` functions correctly for use in Server Components and API routes
3. **AC1.3.3**: Middleware at `src/middleware.ts` manages session cookies and refreshes auth state on each request
4. **AC1.3.4**: Session refresh and expiration work correctly (JWT auto-refresh before expiration)
5. **AC1.3.5**: Auth state is accessible in both server and client components via helper utilities
6. **AC1.3.6**: Rate limiting is configured (5 attempts/hour/IP via Supabase dashboard)

## Tasks / Subtasks

- [ ] **Task 1: Create Supabase Browser Client** (AC: 1)
  - [ ] Create `src/lib/supabase/client.ts`
  - [ ] Import `createBrowserClient` from `@supabase/ssr`
  - [ ] Export `createClient()` function returning browser Supabase client
  - [ ] Use `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` env vars
  - [ ] Test: Import and call in a client component, verify connection

- [ ] **Task 2: Create Supabase Server Client** (AC: 2)
  - [ ] Create `src/lib/supabase/server.ts`
  - [ ] Import `createServerClient` from `@supabase/ssr`
  - [ ] Import `cookies` from `next/headers`
  - [ ] Export async `createClient()` function returning server Supabase client
  - [ ] Configure cookie handling with `get`, `set`, `remove` operations
  - [ ] Test: Use in a Server Component to query data

- [ ] **Task 3: Create Auth Middleware** (AC: 3, 4)
  - [ ] Create `src/lib/supabase/middleware.ts` with `updateSession()` function
  - [ ] Import `createServerClient` from `@supabase/ssr`
  - [ ] Implement cookie management for request/response cycle
  - [ ] Create `src/middleware.ts` that exports middleware using `updateSession()`
  - [ ] Configure `matcher` to run on all routes except static assets
  - [ ] Test: Session cookies are set/refreshed on page navigation

- [ ] **Task 4: Create Auth Helper Utilities** (AC: 5)
  - [ ] Create `src/lib/supabase/auth.ts` with helper functions:
    - `getUser()` - get current authenticated user (server-side)
    - `getSession()` - get current session (server-side)
  - [ ] Create `src/hooks/use-auth.ts` hook for client-side auth state
  - [ ] Test: Auth state accessible in both server and client components

- [ ] **Task 5: Create Auth Types** (AC: 1, 2, 5)
  - [ ] Create `src/lib/supabase/types.ts` with Supabase client type exports
  - [ ] Export Database types from generated `src/types/database.ts` (when available)
  - [ ] Ensure proper TypeScript typing for all auth functions

- [ ] **Task 6: Configure Supabase Auth Settings** (AC: 6)
  - [ ] In Supabase dashboard: Enable email/password authentication
  - [ ] In Supabase dashboard: Configure rate limiting (5 attempts/hour/IP)
  - [ ] Set JWT expiration: 3600 seconds (1 hour) for access token
  - [ ] Set refresh token expiration: 604800 seconds (7 days)
  - [ ] Document auth configuration in `src/lib/supabase/README.md`

- [ ] **Task 7: Verify Auth Integration** (AC: 1, 2, 3, 4, 5)
  - [ ] Run `npm run build` - verify no TypeScript errors
  - [ ] Run `npm run dev` - verify middleware runs without errors
  - [ ] Test: Create test page that displays auth state
  - [ ] Test: Verify session cookies appear in browser dev tools
  - [ ] Test: Verify middleware refreshes session on navigation

## Dev Notes

### Technical Context

This is Story 1.3 in Epic 1: Foundation & Infrastructure. It establishes the authentication layer that all user-facing features depend on. This story depends on Story 1.2 (Supabase Database Setup) being complete for the `profiles` table.

**Architecture Alignment:**
- ADR-001: Supabase over Firebase/Custom Backend - using Supabase Auth [Source: docs/architecture.md#ADR-001]
- Uses `@supabase/ssr` for Next.js App Router SSR support [Source: docs/architecture.md#Authentication-Flow]

**Key Technical Decisions:**
- Cookie-based sessions via @supabase/ssr (not localStorage)
- Server-side session management for security
- Middleware refreshes tokens on every request
- Rate limiting handled by Supabase (not custom implementation)

### Supabase SSR Architecture

The @supabase/ssr package provides three client types:

1. **Browser Client** (`createBrowserClient`)
   - Used in Client Components (use client)
   - Handles client-side auth state
   - Automatically manages cookies in browser

2. **Server Client** (`createServerClient`)
   - Used in Server Components and API Routes
   - Reads cookies from request
   - Requires cookie handling configuration

3. **Middleware Client** (`createServerClient` with request/response)
   - Used in Next.js middleware
   - Can read AND write cookies
   - Refreshes auth tokens on each request

### Project Structure Notes

**Files to Create:**
```
src/lib/supabase/
├── client.ts          # Browser client for client components
├── server.ts          # Server client for server components/API routes
├── middleware.ts      # Auth middleware utilities
├── auth.ts            # Auth helper functions
├── types.ts           # Type exports
└── README.md          # Configuration documentation

src/
├── middleware.ts      # Next.js middleware entry point
└── hooks/
    └── use-auth.ts    # Client-side auth hook
```

**Alignment with Architecture:**
- Client/server split matches architecture patterns [Source: docs/architecture.md#Supabase-Client-Interfaces]
- Middleware location matches Next.js conventions

### Implementation Patterns

**Browser Client Pattern:**
```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Server Client Pattern:**
```typescript
// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  )
}
```

**Middleware Pattern:**
```typescript
// src/middleware.ts
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### Learnings from Previous Story

**From Story 1-1-project-initialization (Status: done)**

- **Project Foundation Ready**: Full Next.js 16 project structure exists
- **@supabase/ssr Installed**: Package already in dependencies - ready to use
- **Environment Setup**: `.env.local.example` has Supabase vars - need actual values
- **Using Next.js 16**: Latest version with full App Router support
- **Using React 19**: Modern hooks and server components supported
- **src/lib/utils.ts exists**: Can add supabase directory alongside

[Source: docs/sprint-artifacts/1-1-project-initialization.md#Dev-Agent-Record]

**From Story 1-2-supabase-database-setup (Status: ready-for-dev)**

- **Profiles Table Design**: Auth users link to profiles via FK
- **Database Schema Ready**: When 1.2 completes, profiles table will exist
- **RLS Policies**: Will control data access after auth is set up

[Source: docs/sprint-artifacts/1-2-supabase-database-setup.md]

### Security Considerations

- **Cookie Security**: Use `httpOnly`, `secure`, `sameSite: 'lax'` for session cookies
- **PKCE Flow**: Supabase uses PKCE for additional security
- **Rate Limiting**: 5 attempts/hour prevents brute force attacks
- **Token Rotation**: Refresh tokens rotated on use

[Source: docs/architecture.md#Security-Architecture]

### Testing Strategy

Per Architecture, testing at this stage focuses on:
- Client instantiation (browser and server)
- Session cookie management
- Middleware execution
- Auth state accessibility

[Source: docs/sprint-artifacts/tech-spec-epic-1.md#Test-Strategy-Summary]

### References

- [Source: docs/sprint-artifacts/tech-spec-epic-1.md#Story-1.3-Supabase-Auth-Integration]
- [Source: docs/sprint-artifacts/tech-spec-epic-1.md#APIs-and-Interfaces]
- [Source: docs/architecture.md#Authentication-Flow]
- [Source: docs/architecture.md#Security-Architecture]
- [Source: docs/epics.md#Story-1.3-Supabase-Authentication-Integration]
- [Supabase SSR Documentation](https://supabase.com/docs/guides/auth/server-side/nextjs)

## Dev Agent Record

### Context Reference

- [docs/sprint-artifacts/1-3-supabase-authentication-integration.context.xml](1-3-supabase-authentication-integration.context.xml)

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2025-12-02 | SM Agent | Story drafted from tech spec and epics |
