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

/**
 * Story 12.6-1: Enhanced result types with requiresLogin flag
 * AC12.6.1.2: On auth failure, return { success: false, requiresLogin: true }
 */
export interface SubscribeResult {
  success: boolean;
  error?: string;
  /** AC12.6.1.2: True when user needs to re-authenticate */
  requiresLogin?: boolean;
}

export interface UnsubscribeResult {
  success: boolean;
  error?: string;
  /** AC12.6.1.2: True when user needs to re-authenticate */
  requiresLogin?: boolean;
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

  // AC12.6.1.2: Return requiresLogin flag for auth failures
  if (userError || !user) {
    console.log("[PushSubscription] Auth required for subscribeToPush");
    return {
      success: false,
      error: "Tu sesión expiró. Por favor, inicia sesión nuevamente.",
      requiresLogin: true,
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

  // AC12.6.1.2: Return requiresLogin flag for auth failures
  if (userError || !user) {
    console.log("[PushSubscription] Auth required for unsubscribeFromPush");
    return {
      success: false,
      error: "Tu sesión expiró. Por favor, inicia sesión nuevamente.",
      requiresLogin: true,
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

/**
 * Send a server-side test push notification
 * This actually tests the web-push library and VAPID configuration
 */
export async function sendServerTestPush(): Promise<{
  success: boolean;
  error?: string;
  details?: {
    sent: number;
    total: number;
    cleaned: number;
    vapidConfigured: boolean;
    debug?: string;
  };
}> {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      error: "Tu sesión expiró. Por favor, inicia sesión nuevamente.",
    };
  }

  // Check admin client env vars BEFORE trying to use it
  const hasServiceRoleKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  const hasServiceKey = !!process.env.SUPABASE_SERVICE_KEY;
  const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;

  console.log(`[ServerTestPush] Env check:`, {
    hasSupabaseUrl,
    hasServiceRoleKey,
    hasServiceKey,
  });

  // If neither service key is available, return early with detailed error
  if (!hasServiceRoleKey && !hasServiceKey) {
    return {
      success: false,
      error: "Error de configuración: Service key no configurada en el servidor.",
      details: {
        sent: 0,
        total: 0,
        cleaned: 0,
        vapidConfigured: false,
        debug: `ENV: url=${hasSupabaseUrl}, role_key=${hasServiceRoleKey}, service_key=${hasServiceKey}`,
      },
    };
  }

  // Import sendPushToUser dynamically to avoid circular dependency
  const { sendPushToUser } = await import("@/lib/push/send-push");

  console.log(`[ServerTestPush] Sending test push to user ${user.id}`);

  const result = await sendPushToUser(user.id, {
    title: "Notificación de prueba (servidor)",
    body: "Esta notificación fue enviada desde el servidor usando web-push",
    icon: "/icons/icon-192.png",
    url: "/",
    tag: "server-test-push",
  });

  console.log(`[ServerTestPush] Result:`, result);

  // Check VAPID configuration
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const vapidConfigured = !!(vapidPublicKey && vapidPrivateKey);

  return {
    success: result.success && result.sent > 0,
    error: result.sent === 0
      ? (result.total === 0
          ? "No tienes suscripciones activas. Habilita notificaciones primero."
          : vapidConfigured
            ? `Enviado a ${result.sent}/${result.total} dispositivos. ${result.cleaned} limpiados.`
            : "VAPID keys no configuradas en el servidor.")
      : undefined,
    details: {
      sent: result.sent,
      total: result.total,
      cleaned: result.cleaned,
      vapidConfigured,
      debug: `ENV: url=${hasSupabaseUrl}, role_key=${hasServiceRoleKey}, service_key=${hasServiceKey}`,
    },
  };
}
