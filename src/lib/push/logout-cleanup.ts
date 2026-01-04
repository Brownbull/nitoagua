"use client";

/**
 * Story 12.8-1: Push Notification Security & Logout Cleanup
 * BUG-R2-003, BUG-R2-017: Fix push notifications sent to wrong user
 *
 * This utility cleans up push subscriptions before logout to prevent:
 * - Privacy breach: Users seeing other users' notifications
 * - Authorization bypass: Notification links to pages user cannot access
 * - Multi-tenant isolation failure: Cross-user data leakage
 *
 * MUST be called before supabase.auth.signOut()
 */

import { unsubscribeFromPush } from "@/lib/actions/push-subscription";

/**
 * Helper to add timeout to a promise
 * Returns the promise result or undefined if timeout exceeded
 */
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T | undefined> {
  const timeoutPromise = new Promise<undefined>((resolve) => {
    setTimeout(() => resolve(undefined), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]);
}

/**
 * Clean up push subscriptions before logout
 * AC12.8.1.1, AC12.8.1.2, AC12.8.1.3: Cleanup on logout
 * AC12.8.1.6: Graceful handling when no subscription exists
 *
 * 1. Unsubscribes from browser's Push Manager
 * 2. Deletes subscription record from database
 *
 * Errors are logged but don't block logout (graceful handling)
 */
export async function cleanupPushBeforeLogout(): Promise<void> {
  try {
    // 1. Unsubscribe from browser push manager (with timeout)
    // navigator.serviceWorker.ready can hang if no SW is registered
    if ("serviceWorker" in navigator && "PushManager" in window) {
      // Use timeout to prevent hanging in environments without service worker
      const registration = await withTimeout(navigator.serviceWorker.ready, 3000);

      if (registration) {
        const subscription = await registration.pushManager.getSubscription();

        if (subscription) {
          // Unsubscribe from browser
          await subscription.unsubscribe();
          console.log("[Logout] Browser push subscription removed");
        } else {
          console.log("[Logout] No browser push subscription to remove");
        }
      } else {
        console.log("[Logout] Service worker not ready (timeout), skipping browser cleanup");
      }
    } else {
      console.log("[Logout] Push notifications not supported in this browser");
    }

    // 2. Delete from database (server action)
    // This removes ALL subscriptions for current user
    const result = await unsubscribeFromPush();
    if (result.success) {
      console.log("[Logout] Database push subscription removed");
    } else if (result.requiresLogin) {
      // Session already expired - database cleanup not needed
      console.log("[Logout] Session expired, skipping database cleanup");
    } else if (result.error) {
      console.warn("[Logout] Database cleanup warning:", result.error);
    }
  } catch (error) {
    // Log but don't block logout (AC12.8.1.6: Graceful handling)
    console.error("[Logout] Error cleaning up push subscription:", error);
  }
}
