"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Push Subscription Server Actions
 * Story 12-6: Web Push Notifications
 *
 * Manages Web Push API subscriptions for users.
 * Subscriptions are stored in push_subscriptions table.
 */

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface SubscribeResult {
  success: boolean;
  error?: string;
}

export interface UnsubscribeResult {
  success: boolean;
  error?: string;
}

export interface SubscriptionStatus {
  isSubscribed: boolean;
  subscriptionCount: number;
}

/**
 * Subscribe a user to push notifications
 * AC12.6.3: Store subscription in database via API route
 *
 * @param subscription - Web Push subscription data
 */
export async function subscribeToPush(
  subscription: PushSubscriptionData
): Promise<SubscribeResult> {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      error: "Debes iniciar sesión para activar notificaciones push",
    };
  }

  // Validate subscription data
  if (!subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
    return {
      success: false,
      error: "Datos de suscripción inválidos",
    };
  }

  // Insert or update subscription (upsert based on user_id + endpoint)
  const { error: insertError } = await supabase
    .from("push_subscriptions")
    .upsert(
      {
        user_id: user.id,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
      {
        onConflict: "user_id,endpoint",
      }
    );

  if (insertError) {
    console.error("[PushSubscription] Error saving subscription:", insertError);
    return {
      success: false,
      error: "Error al guardar la suscripción",
    };
  }

  console.log(`[PushSubscription] User ${user.id} subscribed to push notifications`);

  return {
    success: true,
  };
}

/**
 * Unsubscribe a user from push notifications
 * AC12.6.3: Handle unsubscribe action
 *
 * @param endpoint - The subscription endpoint to remove (optional - removes all if not provided)
 */
export async function unsubscribeFromPush(endpoint?: string): Promise<UnsubscribeResult> {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      error: "No autenticado",
    };
  }

  let query = supabase.from("push_subscriptions").delete().eq("user_id", user.id);

  // If endpoint provided, only delete that specific subscription
  if (endpoint) {
    query = query.eq("endpoint", endpoint);
  }

  const { error: deleteError } = await query;

  if (deleteError) {
    console.error("[PushSubscription] Error removing subscription:", deleteError);
    return {
      success: false,
      error: "Error al eliminar la suscripción",
    };
  }

  console.log(`[PushSubscription] User ${user.id} unsubscribed from push notifications`);

  return {
    success: true,
  };
}

/**
 * Get subscription status for current user
 * AC12.6.3: Check if user is subscribed
 */
export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      isSubscribed: false,
      subscriptionCount: 0,
    };
  }

  const { data: subscriptions, error } = await supabase
    .from("push_subscriptions")
    .select("id")
    .eq("user_id", user.id);

  if (error) {
    console.error("[PushSubscription] Error checking subscription:", error);
    return {
      isSubscribed: false,
      subscriptionCount: 0,
    };
  }

  return {
    isSubscribed: (subscriptions?.length ?? 0) > 0,
    subscriptionCount: subscriptions?.length ?? 0,
  };
}

/**
 * Clean up stale subscriptions for a user
 * AC12.6.10: Clean up stale subscriptions on 410 Gone response
 *
 * @param endpoints - Array of endpoints to remove (received 410 Gone)
 */
export async function cleanupStaleSubscriptions(
  endpoints: string[]
): Promise<{ removed: number }> {
  const adminClient = createAdminClient();

  if (endpoints.length === 0) {
    return { removed: 0 };
  }

  const { data, error } = await adminClient
    .from("push_subscriptions")
    .delete()
    .in("endpoint", endpoints)
    .select("id");

  if (error) {
    console.error("[PushSubscription] Error cleaning stale subscriptions:", error);
    return { removed: 0 };
  }

  console.log(`[PushSubscription] Removed ${data?.length ?? 0} stale subscriptions`);

  return {
    removed: data?.length ?? 0,
  };
}

/**
 * Get all subscriptions for a user (used by push sender)
 * AC12.6.5: Query subscriptions for user
 *
 * @param userId - The user ID to get subscriptions for
 */
export async function getUserSubscriptions(
  userId: string
): Promise<PushSubscriptionData[]> {
  const adminClient = createAdminClient();

  const { data: subscriptions, error } = await adminClient
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("user_id", userId);

  if (error) {
    console.error("[PushSubscription] Error fetching subscriptions:", error);
    return [];
  }

  return (subscriptions ?? []).map((sub) => ({
    endpoint: sub.endpoint,
    keys: {
      p256dh: sub.p256dh,
      auth: sub.auth,
    },
  }));
}
