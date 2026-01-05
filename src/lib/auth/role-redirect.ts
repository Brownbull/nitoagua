/**
 * Role-Based Route Guard Utilities
 *
 * Story 12.8-2: Role-Based Route Guards (BUG-R2-004)
 *
 * Provides centralized role-to-route mappings and redirect helpers
 * to enforce role isolation across the application.
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
  admin: "/admin",
  supplier: "/provider",
  consumer: "/",
};

/**
 * Route prefixes that require specific roles
 * Note: /request is intentionally NOT listed here as it's accessible to guests
 */
export const ROLE_ROUTE_PATTERNS: Record<UserRole, string[]> = {
  admin: ["/admin"],
  supplier: ["/provider", "/profile"], // /profile is supplier-only profile page
  consumer: ["/consumer-profile", "/settings", "/history"], // /request is public for guest access
};

/**
 * Public routes that don't require authentication or role checks
 */
export const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/signup",
  "/auth/callback",
  "/admin/login",
  "/admin/not-authorized",
  "/admin/auth/callback",
  "/api",
  "/sw.js",
  "/manifest.webmanifest",
  "/icons",
];

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
 * Returns true if:
 * - Route is public
 * - Route doesn't match any role-specific pattern
 * - Route matches the user's role pattern
 */
export function isRouteAllowedForRole(
  pathname: string,
  role: UserRole | string | undefined | null
): boolean {
  // Public routes are always allowed
  if (PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    return true;
  }

  // Check if this path is restricted to a specific role
  for (const [requiredRole, patterns] of Object.entries(ROLE_ROUTE_PATTERNS)) {
    const matchesPattern = patterns.some(
      (pattern) => pathname === pattern || pathname.startsWith(`${pattern}/`)
    );

    if (matchesPattern) {
      // This route requires a specific role
      return role === requiredRole;
    }
  }

  // Route doesn't match any role-specific pattern - allow it
  return true;
}

/**
 * Get the required role for a route path, if any
 * Returns null if the route is public or doesn't require a specific role
 */
export function getRequiredRoleForRoute(pathname: string): UserRole | null {
  // Public routes don't require any role
  if (PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    return null;
  }

  // Check each role's patterns
  for (const [role, patterns] of Object.entries(ROLE_ROUTE_PATTERNS)) {
    const matchesPattern = patterns.some(
      (pattern) => pathname === pattern || pathname.startsWith(`${pattern}/`)
    );

    if (matchesPattern) {
      return role as UserRole;
    }
  }

  return null;
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
