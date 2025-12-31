"use server";

import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Push Notification Sender (Server-Side)
 * Story 12-6: Web Push Notifications
 *
 * AC12.6.5: Send push notifications via web-push library
 * AC12.6.10: Handle 410 Gone responses (clean up stale subscriptions)
 *
 * This module provides a server-side function to send push notifications
 * to a user's subscribed devices.
 */

// Lazy initialization flag
let vapidInitialized = false;

/**
 * Initialize web-push with VAPID details (lazy, on first use)
 * This prevents build-time errors when env vars are not available
 */
function initVapid(): boolean {
  if (vapidInitialized) return true;

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
  const privateKey = process.env.VAPID_PRIVATE_KEY || "";
  const subject = process.env.VAPID_SUBJECT || "mailto:soporte@nitoagua.cl";

  if (!publicKey || !privateKey) {
    console.warn("[Push] VAPID keys not configured");
    return false;
  }

  try {
    webpush.setVapidDetails(subject, publicKey, privateKey);
    vapidInitialized = true;
    return true;
  } catch (error) {
    console.error("[Push] Error initializing VAPID:", error);
    return false;
  }
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  url?: string;
  tag?: string;
  data?: Record<string, unknown>;
}

export interface SendPushResult {
  success: boolean;
  sent: number;
  total: number;
  cleaned: number;
  errors?: string[];
}

/**
 * Send push notification to a user
 *
 * AC12.6.5: Query push_subscriptions for user and send via web-push
 * AC12.6.10: Clean up stale subscriptions on 410 Gone response
 *
 * @param userId - The user ID to send notifications to
 * @param notification - The notification payload
 */
export async function sendPushToUser(
  userId: string,
  notification: PushPayload
): Promise<SendPushResult> {
  // Initialize VAPID on first use (lazy initialization)
  if (!initVapid()) {
    console.warn("[Push] VAPID not configured, skipping push send");
    return { success: true, sent: 0, total: 0, cleaned: 0 };
  }

  const adminClient = createAdminClient();

  // Query user's push subscriptions
  const { data: subscriptions, error: queryError } = await adminClient
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("user_id", userId);

  if (queryError) {
    console.error("[Push] Error querying subscriptions:", queryError);
    return {
      success: false,
      sent: 0,
      total: 0,
      cleaned: 0,
      errors: [queryError.message],
    };
  }

  if (!subscriptions || subscriptions.length === 0) {
    // No subscriptions - this is not an error, but log for debugging
    console.log(
      `[Push] No subscriptions found for user ${userId} - notification: "${notification.title}"`
    );
    return { success: true, sent: 0, total: 0, cleaned: 0 };
  }

  console.log(
    `[Push] Found ${subscriptions.length} subscription(s) for user ${userId} - sending: "${notification.title}"`
  );

  // Prepare payload
  const payload = JSON.stringify(notification);

  let sentCount = 0;
  const staleEndpoints: string[] = [];
  const errors: string[] = [];

  // Send to each subscription
  for (const sub of subscriptions) {
    const pushSubscription = {
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth,
      },
    };

    try {
      await webpush.sendNotification(pushSubscription, payload);
      sentCount++;
    } catch (error: unknown) {
      const webPushError = error as { statusCode?: number; body?: string };

      // AC12.6.10: Handle 410 Gone (subscription no longer valid)
      if (webPushError.statusCode === 410) {
        console.log("[Push] Subscription stale (410 Gone):", sub.endpoint);
        staleEndpoints.push(sub.endpoint);
      } else if (webPushError.statusCode === 404) {
        // 404 also means subscription is invalid
        staleEndpoints.push(sub.endpoint);
      } else {
        console.error("[Push] Error sending to endpoint:", error);
        errors.push(
          `${webPushError.statusCode || "unknown"}: ${webPushError.body || String(error)}`
        );
      }
    }
  }

  // AC12.6.10: Clean up stale subscriptions
  if (staleEndpoints.length > 0) {
    const { error: deleteError } = await adminClient
      .from("push_subscriptions")
      .delete()
      .in("endpoint", staleEndpoints);

    if (deleteError) {
      console.error("[Push] Error cleaning stale subscriptions:", deleteError);
    } else {
      console.log(`[Push] Cleaned ${staleEndpoints.length} stale subscriptions`);
    }
  }

  console.log(
    `[Push] Sent ${sentCount}/${subscriptions.length} push notifications to user ${userId}`
  );

  return {
    success: sentCount > 0 || staleEndpoints.length === subscriptions.length,
    sent: sentCount,
    total: subscriptions.length,
    cleaned: staleEndpoints.length,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Send push notification to multiple users
 *
 * @param userIds - Array of user IDs to send notifications to
 * @param notification - The notification payload
 */
export async function sendPushToUsers(
  userIds: string[],
  notification: PushPayload
): Promise<{ results: Record<string, SendPushResult> }> {
  const results: Record<string, SendPushResult> = {};

  for (const userId of userIds) {
    results[userId] = await sendPushToUser(userId, notification);
  }

  return { results };
}
