/**
 * Shared Action Result Types
 * Story 12.6-2: Session Handling Audit Across All Roles
 *
 * Provides consistent response types for server actions with session expiry handling.
 * All server actions should use these types for consistent error handling.
 */

/**
 * Standard action result type for server actions
 *
 * AC12.6.2.5: Create shared ActionResult<T> type with requiresLogin flag
 *
 * @example
 * // Action with data return
 * export async function getProfile(): Promise<ActionResult<Profile>> {
 *   if (!user) return { success: false, error: "Session expired", requiresLogin: true };
 *   return { success: true, data: profile };
 * }
 *
 * @example
 * // Action without data return
 * export async function deleteItem(): Promise<ActionResult<void>> {
 *   if (!user) return { success: false, error: "Session expired", requiresLogin: true };
 *   return { success: true };
 * }
 */
export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string; requiresLogin?: boolean };

/**
 * Standard auth error message for session expiry
 */
export const AUTH_ERROR_MESSAGE = "Tu sesión expiró. Por favor, inicia sesión nuevamente.";

/**
 * Helper to check if result requires login redirect
 */
export function requiresLoginRedirect<T>(
  result: ActionResult<T>
): result is { success: false; error: string; requiresLogin: true } {
  return result.success === false && result.requiresLogin === true;
}

/**
 * Helper to create auth error response
 * Use this when user authentication fails in server actions
 */
export function createAuthError(message?: string): ActionResult<never> {
  return {
    success: false,
    error: message || AUTH_ERROR_MESSAGE,
    requiresLogin: true,
  };
}
