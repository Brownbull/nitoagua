/**
 * Role-Based Route Guard Utilities
 *
 * Story 12.8-2: Role-Based Route Guards (BUG-R2-004)
 *
 * Provides centralized role-to-route mappings and redirect helpers
 * to enforce STRICT role isolation across the application.
 *
 * STRICT ISOLATION PRINCIPLE:
 * - Admins can ONLY access /admin/* routes
 * - Suppliers can ONLY access /provider/* and /profile/* routes
 * - Consumers can ONLY access consumer routes (/, /request/*, /settings/*, etc.)
 * - Once authenticated, users are locked to their role's routes
 *
 * Usage:
 * - Middleware: Use getRoleRedirectUrl and isRouteAllowedForRole
 * - Server Components: Use redirectIfWrongRole
 * - Client Components: Use getRoleRedirectUrl with router.push
 */

export type UserRole = "admin" | "supplier" | "consumer";

/**
 * Maps each role to their default dashboard/home route
 */
export const ROLE_HOME_ROUTES: Record<UserRole, string> = {
  admin: "/admin/dashboard",
  supplier: "/provider",
  consumer: "/",
};

/**
 * Routes that each role is ALLOWED to access (whitelist approach)
 * Any route not in a role's whitelist will redirect to their home
 */
export const ROLE_ALLOWED_ROUTES: Record<UserRole, string[]> = {
  admin: [
    "/admin",
  ],
  supplier: [
    "/provider",
    "/profile",
  ],
  consumer: [
    "/",
    "/request",
    "/consumer-profile",
    "/settings",
    "/history",
    "/track",
  ],
};

/**
 * Routes that are ALWAYS public (no auth required, no role checks for unauthenticated users)
 * These are auth-related routes and static assets
 */
export const AUTH_ROUTES = [
  "/login",
  "/signup",
  "/auth/callback",
  "/admin/login",
  "/admin/not-authorized",
  "/admin/auth/callback",
];

/**
 * Technical routes that should never be role-checked
 */
export const TECHNICAL_ROUTES = [
  "/api",
  "/sw.js",
  "/manifest.webmanifest",
  "/icons",
];

/**
 * Routes that unauthenticated users (guests) can access
 * These are public-facing pages that don't require login
 */
export const GUEST_ALLOWED_ROUTES = [
  "/",        // Landing page
  "/request", // Guest water request flow
  "/track",   // Track delivery by token
];

/**
 * Combined public routes (for backwards compatibility)
 */
export const PUBLIC_ROUTES = [...AUTH_ROUTES, ...TECHNICAL_ROUTES];

/**
 * Get the default redirect URL for a given role
 * Returns "/" for undefined/unknown roles
 */
export function getRoleRedirectUrl(role: UserRole | string | undefined | null): string {
  if (!role) return "/";
  return ROLE_HOME_ROUTES[role as UserRole] ?? "/";
}

/**
 * Check if a route path is allowed for a specific role
 *
 * STRICT ISOLATION: Uses whitelist approach
 * - Technical routes (API, SW, etc.) are always allowed
 * - Auth routes are always allowed (for login/logout flows)
 * - For authenticated users, ONLY routes in their role's whitelist are allowed
 */
export function isRouteAllowedForRole(
  pathname: string,
  role: UserRole | string | undefined | null
): boolean {
  // Technical routes are always allowed (API, service worker, etc.)
  if (TECHNICAL_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    return true;
  }

  // Auth routes are always allowed (login, signup, callbacks)
  if (AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    return true;
  }

  // If no role, only allow public routes (handled above) - block everything else
  if (!role) {
    return false;
  }

  // Get the allowed routes for this role
  const allowedRoutes = ROLE_ALLOWED_ROUTES[role as UserRole];
  if (!allowedRoutes) {
    // Unknown role - block access
    return false;
  }

  // Check if pathname matches any of the role's allowed routes
  // Special case: "/" should only match exactly "/" for consumer, not as a prefix for everything
  return allowedRoutes.some((route) => {
    if (route === "/") {
      // Root route matches exactly "/" only
      return pathname === "/";
    }
    // Other routes match as prefixes
    return pathname === route || pathname.startsWith(`${route}/`);
  });
}

/**
 * Get the required role for a route path, if any
 * Returns null if the route is a technical/auth route that doesn't require role checks
 * Returns the role that owns this route otherwise
 */
export function getRequiredRoleForRoute(pathname: string): UserRole | null {
  // Technical routes don't require any role
  if (TECHNICAL_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    return null;
  }

  // Auth routes don't require any role (anyone can access login/signup)
  if (AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    return null;
  }

  // Find which role owns this route
  for (const [role, routes] of Object.entries(ROLE_ALLOWED_ROUTES)) {
    const matchesRoute = routes.some((route) => {
      if (route === "/") {
        return pathname === "/";
      }
      return pathname === route || pathname.startsWith(`${route}/`);
    });

    if (matchesRoute) {
      return role as UserRole;
    }
  }

  // Unknown route - will require authentication and role check
  // Return consumer as default (will be blocked if user is admin/supplier)
  return "consumer";
}

/**
 * Server-side redirect helper for wrong role access
 * Use in Server Components/layouts
 *
 * @example
 * // In a layout.tsx
 * import { redirect } from "next/navigation";
 * import { redirectIfWrongRole } from "@/lib/auth/role-redirect";
 *
 * const profile = await getProfile();
 * redirectIfWrongRole(profile?.role, "consumer");
 */
export function getRedirectUrlIfWrongRole(
  actualRole: UserRole | string | undefined | null,
  requiredRole: UserRole
): string | null {
  if (actualRole === requiredRole) {
    return null; // Role matches, no redirect needed
  }
  return getRoleRedirectUrl(actualRole);
}
