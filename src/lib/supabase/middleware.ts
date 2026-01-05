import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database'
import {
  getRoleRedirectUrl,
  isRouteAllowedForRole,
  getRequiredRoleForRoute,
  PUBLIC_ROUTES,
} from '@/lib/auth/role-redirect'

/**
 * Middleware session update with role-based route guards
 *
 * Story 12.8-2: Role-Based Route Guards (BUG-R2-004)
 *
 * Ensures:
 * 1. Session tokens are refreshed on each request
 * 2. Users are redirected to role-appropriate routes
 * 3. Unauthenticated users are sent to /login for role-restricted routes
 *
 * Note: Routes like /request are intentionally accessible without authentication
 * to support guest water requests.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Skip role checks for public routes (static files, API, auth routes)
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  // Also skip for static assets not in PUBLIC_ROUTES (already handled by matcher, but be safe)
  const isStaticAsset = pathname.includes('.') && !pathname.endsWith('.html')

  if (isPublicRoute || isStaticAsset) {
    return supabaseResponse
  }

  // Check if this route requires a specific role (e.g., /admin, /provider, /settings)
  const requiredRole = getRequiredRoleForRoute(pathname)

  // If route doesn't require a specific role, allow access (e.g., /request for guests)
  if (!requiredRole) {
    return supabaseResponse
  }

  // Route requires a specific role - authentication is required
  if (!user) {
    // Don't redirect if already on a login page
    if (pathname !== '/login' && pathname !== '/signup' && pathname !== '/admin/login') {
      // Admin routes use separate admin login
      if (pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }

      // All other protected routes use main login with returnTo
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('returnTo', pathname)
      return NextResponse.redirect(loginUrl)
    }
    return supabaseResponse
  }

  // User is authenticated - fetch their role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role

  // Check if user is allowed to access this route
  if (!isRouteAllowedForRole(pathname, role)) {
    // Get the correct redirect URL for their role
    const redirectUrl = getRoleRedirectUrl(role)

    // Log for debugging (useful in development)
    console.log(
      `[ROLE GUARD] Blocking ${role || 'unknown'} from ${pathname}, redirecting to ${redirectUrl}`
    )

    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }

  return supabaseResponse
}
