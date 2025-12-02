# Supabase Authentication Configuration

This directory contains the Supabase authentication integration for the NitoAgua application.

## Directory Structure

```
src/lib/supabase/
├── client.ts      # Browser client for client components
├── server.ts      # Server client for server components/API routes
├── middleware.ts  # Auth middleware utilities
├── auth.ts        # Auth helper functions (getUser, getSession)
├── types.ts       # Type exports
└── README.md      # This file
```

## Client Usage

### Browser Client (Client Components)

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'

export function MyClientComponent() {
  const supabase = createClient()
  // Use supabase client...
}
```

### Server Client (Server Components / API Routes)

```typescript
import { createClient } from '@/lib/supabase/server'

export async function MyServerComponent() {
  const supabase = await createClient()
  // Use supabase client...
}
```

### Auth Helpers

```typescript
import { getUser, getSession } from '@/lib/supabase/auth'

// Server-side
const user = await getUser()
const session = await getSession()
```

### Client-Side Hook

```typescript
'use client'

import { useAuth } from '@/hooks/use-auth'

export function MyComponent() {
  const { user, loading, error } = useAuth()

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!user) return <div>Not authenticated</div>

  return <div>Hello, {user.email}</div>
}
```

## Required Supabase Dashboard Configuration

### Authentication Settings

1. **Enable Email/Password Authentication**
   - Go to: Authentication > Providers
   - Enable "Email" provider
   - Configure email templates as needed

2. **Rate Limiting** (AC1.3.6)
   - Go to: Authentication > Settings > Rate Limits
   - Configure: 5 attempts per hour per IP
   - This prevents brute-force attacks on login

3. **JWT Configuration** (Optimized for Rural Users)
   - Go to: Authentication > Settings
   - **Access Token (JWT) expiration: 86400 seconds (24 hours)**
   - **Refresh Token expiration: 2592000 seconds (30 days)**

   > **Why longer sessions?** NitoAgua serves users in rural areas with
   > potentially unreliable connectivity. Longer token lifetimes reduce
   > re-authentication friction. The middleware automatically refreshes
   > tokens on each request, so security is maintained.

### Security Checklist

- [x] Cookie-based sessions (not localStorage)
- [x] Server-side session management
- [x] Middleware refreshes tokens on every request
- [ ] Rate limiting configured in dashboard
- [ ] JWT expiration settings configured

## Environment Variables

Required in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Optional (for admin operations):

```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Architecture Decisions

- **@supabase/ssr**: Used instead of legacy @supabase/auth-helpers for Next.js App Router compatibility
- **Cookie-based sessions**: More secure than localStorage, works with SSR
- **Middleware session refresh**: Ensures tokens are always fresh on navigation
- **Typed client**: All Supabase operations are fully typed using generated Database types
