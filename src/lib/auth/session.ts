/**
 * Session Validation Utilities
 * Story 12.6-1: Fix Stale Session on Server Actions
 *
 * Provides proactive session validation and refresh to prevent
 * "you need to be logged in" errors when session expires.
 */

import { createClient } from "@/lib/supabase/client";

/**
 * Session validation result
 */
export interface SessionValidationResult {
  valid: boolean;
  userId?: string;
  refreshed?: boolean;
  error?: string;
}

/**
 * Result type for auth-required operations
 * Server actions should return this when auth is required
 */
export interface AuthRequiredResult {
  success: false;
  requiresLogin: true;
  returnTo?: string;
}

/**
 * Buffer time before expiry to trigger proactive refresh (5 minutes in ms)
 */
const REFRESH_BUFFER_MS = 5 * 60 * 1000;

/**
 * Validates and refreshes the current session if needed (CLIENT-SIDE ONLY)
 *
 * AC12.6.1.1: Create validateSession() utility that checks if session is valid
 * - If session expired but refresh token valid, trigger token refresh
 * - If session completely invalid, return valid: false
 *
 * @returns SessionValidationResult with validation status
 */
export async function ensureValidSession(): Promise<SessionValidationResult> {
  const supabase = createClient();

  try {
    // Get current session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("[Session] Error getting session:", sessionError.message);
      return {
        valid: false,
        error: sessionError.message,
      };
    }

    // No session at all - needs login
    if (!session) {
      return {
        valid: false,
        error: "No active session",
      };
    }

    // Check if token expires soon (within buffer time)
    const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
    const needsRefresh = Date.now() > expiresAt - REFRESH_BUFFER_MS;

    if (needsRefresh) {
      console.log("[Session] Token expires soon, refreshing proactively...");

      const { data: refreshData, error: refreshError } =
        await supabase.auth.refreshSession();

      if (refreshError) {
        console.error("[Session] Refresh failed:", refreshError.message);
        return {
          valid: false,
          error: "Session refresh failed",
        };
      }

      if (!refreshData.session) {
        return {
          valid: false,
          error: "No session after refresh",
        };
      }

      console.log("[Session] Token refreshed successfully");
      return {
        valid: true,
        userId: refreshData.session.user.id,
        refreshed: true,
      };
    }

    // Session is valid and not expiring soon
    return {
      valid: true,
      userId: session.user.id,
      refreshed: false,
    };
  } catch (error) {
    console.error("[Session] Unexpected error:", error);
    return {
      valid: false,
      error: "Session validation failed",
    };
  }
}

/**
 * Checks session validity without refreshing (for quick status checks)
 *
 * @returns boolean indicating if session appears valid
 */
export async function isSessionValid(): Promise<boolean> {
  const supabase = createClient();

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    return !error && !!user;
  } catch {
    return false;
  }
}

/**
 * Force refresh the session (useful after visibility change)
 *
 * AC12.6.1.3: Update client state when tokens are refreshed
 *
 * @returns boolean indicating success
 */
export async function forceRefreshSession(): Promise<boolean> {
  const supabase = createClient();

  try {
    const { error } = await supabase.auth.refreshSession();
    return !error;
  } catch {
    return false;
  }
}

/**
 * Creates a return URL for login redirect
 * Captures current path for post-login redirect
 *
 * AC12.6.1.4: Redirect to login with return URL
 *
 * @param currentPath - Current pathname (from usePathname())
 */
export function createLoginRedirectUrl(currentPath: string): string {
  // Encode the return path for safety
  const encodedReturnTo = encodeURIComponent(currentPath);
  return `/login?returnTo=${encodedReturnTo}&expired=true`;
}
