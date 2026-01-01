"use client";

/**
 * useActionHandler Hook
 * Story 12.6-2: Session Handling Audit Across All Roles
 *
 * Client-side hook for handling server action responses with automatic
 * session expiry detection and login redirect.
 *
 * AC12.6.2.5: Create useActionHandler hook for consistent client-side handling
 */

import { useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createLoginRedirectUrl } from "@/lib/auth/session";
import { type ActionResult, requiresLoginRedirect } from "@/lib/types/action-result";

interface UseActionHandlerOptions {
  /**
   * Custom return URL for login redirect (defaults to current pathname)
   */
  returnTo?: string;

  /**
   * Callback for handling non-auth errors
   */
  onError?: (error: string) => void;

  /**
   * Callback for handling success
   */
  onSuccess?: () => void;
}

/**
 * Hook for handling server action responses with automatic session handling
 *
 * @example
 * const { handleAction } = useActionHandler({
 *   onError: (error) => toast.error(error),
 * });
 *
 * const handleSubmit = async () => {
 *   const result = await handleAction(() => submitForm(data));
 *   if (result) {
 *     // Success - result contains the data
 *     console.log(result.data);
 *   }
 *   // Failure cases are handled automatically
 * };
 *
 * @example
 * // For actions without return data
 * const handleDelete = async () => {
 *   const success = await handleAction(() => deleteItem(id));
 *   if (success) {
 *     toast.success("Eliminado");
 *   }
 * };
 */
export function useActionHandler(options?: UseActionHandlerOptions) {
  const router = useRouter();
  const pathname = usePathname();

  /**
   * Execute a server action and handle the result
   *
   * @param action - The server action to execute
   * @returns The action result if successful, null if failed
   */
  const handleAction = useCallback(
    async <T>(
      action: () => Promise<ActionResult<T>>
    ): Promise<ActionResult<T> | null> => {
      try {
        const result = await action();

        // Check for session expiry - redirect to login
        if (requiresLoginRedirect(result)) {
          const returnTo = options?.returnTo || pathname;
          const loginUrl = createLoginRedirectUrl(returnTo);
          router.push(loginUrl);
          return null;
        }

        // Handle other errors
        if (!result.success) {
          options?.onError?.(result.error);
          return result;
        }

        // Success
        options?.onSuccess?.();
        return result;
      } catch (error) {
        // Unexpected error
        const errorMessage =
          error instanceof Error ? error.message : "Error inesperado";
        options?.onError?.(errorMessage);
        return null;
      }
    },
    [router, pathname, options]
  );

  /**
   * Execute a server action and extract just the success status
   * Useful for actions without data return
   *
   * @param action - The server action to execute
   * @returns true if successful, false otherwise
   */
  const handleActionSimple = useCallback(
    async <T>(action: () => Promise<ActionResult<T>>): Promise<boolean> => {
      const result = await handleAction(action);
      return result?.success === true;
    },
    [handleAction]
  );

  /**
   * Execute a server action and extract the data if successful
   * Useful when you only care about the data on success
   *
   * @param action - The server action to execute
   * @returns The data if successful, undefined otherwise
   */
  const handleActionData = useCallback(
    async <T>(action: () => Promise<ActionResult<T>>): Promise<T | undefined> => {
      const result = await handleAction(action);
      if (result?.success) {
        return result.data;
      }
      return undefined;
    },
    [handleAction]
  );

  return {
    handleAction,
    handleActionSimple,
    handleActionData,
  };
}

export default useActionHandler;
