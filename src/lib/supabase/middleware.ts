import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database'
import {
  getRoleRedirectUrl,
  isRouteAllowedForRole,
  getRequiredRoleForRoute,
  AUTH_ROUTES,
  TECHNICAL_ROUTES,
  GUEST_ALLOWED_ROUTES,
} from '@/lib/auth/role-redirect'

/**
 * Middleware session update with STRICT role-based route guards
 *
 * Story 12.8-2: Role-Based Route Guards (BUG-R2-004)
 *
 * STRICT ISOLATION PRINCIPLE:
 * - Admins can ONLY access /admin/* routes
 * - Suppliers can ONLY access /provider/* and /profile/* routes
 * - Consumers can ONLY access consumer routes (/, /request/*, /settings/*, etc.)
 * - Once authenticated, users are locked to their role's routes
 *
 * Note: /request is accessible to unauthenticated guests for water requests
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

  // Skip role checks for technical routes (API, service worker, etc.)
  const isTechnicalRoute = TECHNICAL_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  // Also skip for static assets (already handled by matcher, but be safe)
  const isStaticAsset = pathname.includes('.') && !pathname.endsWith('.html')

  if (isTechnicalRoute || isStaticAsset) {
    return supabaseResponse
  }

  // Auth routes are always accessible (login, signup, callbacks)
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  if (isAuthRoute) {
    return supabaseResponse
  }

  // Check if this route requires a specific role
  const requiredRole = getRequiredRoleForRoute(pathname)

  // If route doesn't require a specific role, allow access
  if (!requiredRole) {
    return supabaseResponse
  }

  // Route requires a specific role - check authentication
  if (!user) {
    // Unauthenticated user trying to access role-restricted route
    // Allow guest access to specific public routes (landing page, guest request, tracking)
    const isGuestAllowed = GUEST_ALLOWED_ROUTES.some((route) => {
      if (route === '/') {
        return pathname === '/'
      }
      return pathname === route || pathname.startsWith(`${route}/`)
    })

    if (isGuestAllowed) {
      return supabaseResponse
    }

    // Admin routes use separate admin login
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // All other protected routes use main login with returnTo
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('returnTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // User is authenticated - determine their EFFECTIVE role
  // IMPORTANT: Admin status is determined by admin_allowed_emails table, NOT profile.role
  // (profile.role can only be 'consumer' or 'supplier' per DB constraint)

  let effectiveRole: string | undefined

  // First check if user is an admin (admin_allowed_emails takes precedence)
  const { data: adminEmail } = await supabase
    .from('admin_allowed_emails')
    .select('email')
    .eq('email', user.email ?? '')
    .single()

  if (adminEmail) {
    // User is an admin - they can ONLY access admin routes
    effectiveRole = 'admin'
  } else {
    // Not an admin - use profile.role (consumer or supplier)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    effectiveRole = profile?.role
  }

  // STRICT ISOLATION: Check if user is allowed to access this route
  if (!isRouteAllowedForRole(pathname, effectiveRole)) {
    // Get the correct redirect URL for their role
    const redirectUrl = getRoleRedirectUrl(effectiveRole)

    // Log for debugging
    console.log(
      `[ROLE GUARD] Blocking ${effectiveRole || 'unknown'} from ${pathname}, redirecting to ${redirectUrl}`
    )

    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }

  return supabaseResponse
}
