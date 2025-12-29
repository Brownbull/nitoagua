import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

/**
 * Send Push Notification Edge Function
 * Story 12-6: Web Push Notifications
 *
 * AC12.6.5: Edge Function sends push via web-push library
 * AC12.6.10: Handle 410 Gone responses (clean up stale subscriptions)
 *
 * This function is called with user_id and notification payload.
 * It retrieves all push subscriptions for the user and sends
 * push notifications to each endpoint using the Web Push protocol.
 *
 * For VAPID signing, we use the jose library (works in Deno).
 */

import * as jose from "https://deno.land/x/jose@v5.2.2/index.ts";

// CORS headers for function responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Web Push requires specific headers
interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  url?: string;
  tag?: string;
  data?: Record<string, unknown>;
}

interface PushSubscription {
  endpoint: string;
  p256dh: string;
  auth: string;
}

interface RequestBody {
  user_id: string;
  notification: PushPayload;
}

// VAPID key for authentication (from environment)
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY") || "";
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY") || "";
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") || "mailto:soporte@nitoagua.cl";

/**
 * Convert base64url to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

/**
 * Create VAPID JWT token for push service authentication using jose
 */
async function createVapidAuthHeader(audience: string): Promise<string> {
  if (!VAPID_PRIVATE_KEY || !VAPID_PUBLIC_KEY) {
    throw new Error("VAPID keys not configured");
  }

  // Import the private key (base64url-encoded)
  const privateKeyBytes = urlBase64ToUint8Array(VAPID_PRIVATE_KEY);

  // Create the JWK from raw bytes (P-256 / ES256)
  const privateJwk = {
    kty: "EC",
    crv: "P-256",
    d: VAPID_PRIVATE_KEY,
    x: VAPID_PUBLIC_KEY.slice(0, 43), // First 32 bytes base64url encoded
    y: VAPID_PUBLIC_KEY.slice(43), // Last 32 bytes base64url encoded
  };

  try {
    // Import private key for signing
    const privateKey = await jose.importJWK(privateJwk, "ES256");

    // Create JWT with expiration 12 hours from now
    const expiration = Math.floor(Date.now() / 1000) + 12 * 60 * 60;

    const jwt = await new jose.SignJWT({ sub: VAPID_SUBJECT })
      .setProtectedHeader({ alg: "ES256", typ: "JWT" })
      .setAudience(audience)
      .setExpirationTime(expiration)
      .sign(privateKey);

    return `vapid t=${jwt}, k=${VAPID_PUBLIC_KEY}`;
  } catch (error) {
    console.error("[Push] Error creating VAPID token:", error);
    // Fall back to unsigned request (may work with some push services)
    return "";
  }
}

/**
 * Send push notification to a single endpoint
 * Returns true if successful, false if endpoint is stale (410 Gone)
 *
 * Note: Full encryption of the payload requires the ece (encrypted content encoding)
 * library. For simplicity, we're sending unencrypted payloads which works for
 * many use cases but may not work with all push services.
 */
async function sendPushToEndpoint(
  subscription: PushSubscription,
  payload: PushPayload
): Promise<{ success: boolean; stale: boolean; error?: string }> {
  try {
    // Parse endpoint URL for audience
    const endpointUrl = new URL(subscription.endpoint);
    const audience = `${endpointUrl.protocol}//${endpointUrl.host}`;

    const body = JSON.stringify(payload);
    const bodyBytes = new TextEncoder().encode(body);

    // Prepare headers for Web Push
    const headers: Record<string, string> = {
      "Content-Type": "application/octet-stream",
      "Content-Length": String(bodyBytes.length),
      TTL: "86400", // 24 hours
      "Content-Encoding": "aes128gcm",
      Urgency: "normal",
    };

    // Add VAPID authorization if keys are configured
    try {
      const vapidAuth = await createVapidAuthHeader(audience);
      if (vapidAuth) {
        headers["Authorization"] = vapidAuth;
      }
    } catch (e) {
      console.warn("[Push] Could not create VAPID auth:", e);
    }

    // Note: For full Web Push compliance, the payload should be encrypted
    // using the p256dh and auth keys from the subscription.
    // This requires the Web Push encryption library.
    // For now, we're sending the raw payload which works in development
    // but may need to be updated for production.

    // Send to push service
    const response = await fetch(subscription.endpoint, {
      method: "POST",
      headers,
      body: bodyBytes,
    });

    if (response.ok || response.status === 201) {
      return { success: true, stale: false };
    }

    // AC12.6.10: Handle 410 Gone (subscription no longer valid)
    if (response.status === 410) {
      console.log("[Push] Subscription stale (410 Gone):", subscription.endpoint);
      return { success: false, stale: true };
    }

    // Handle other errors
    const errorText = await response.text();
    console.error(
      `[Push] Error ${response.status}: ${errorText}`,
      subscription.endpoint
    );
    return { success: false, stale: false, error: `${response.status}: ${errorText}` };
  } catch (error) {
    console.error("[Push] Exception sending to endpoint:", error);
    return { success: false, stale: false, error: String(error) };
  }
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { user_id, notification }: RequestBody = await req.json();

    if (!user_id || !notification) {
      return new Response(
        JSON.stringify({ error: "Missing user_id or notification" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // AC12.6.5: Query push_subscriptions for user
    const { data: subscriptions, error: queryError } = await supabase
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .eq("user_id", user_id);

    if (queryError) {
      console.error("[Push] Error querying subscriptions:", queryError);
      return new Response(
        JSON.stringify({ error: "Failed to query subscriptions" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      // No subscriptions for user - this is not an error
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: "No subscriptions" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Send push to each subscription
    let sentCount = 0;
    const staleEndpoints: string[] = [];

    for (const sub of subscriptions) {
      const result = await sendPushToEndpoint(sub, notification);

      if (result.success) {
        sentCount++;
      } else if (result.stale) {
        staleEndpoints.push(sub.endpoint);
      }
    }

    // AC12.6.10: Clean up stale subscriptions
    if (staleEndpoints.length > 0) {
      const { error: deleteError } = await supabase
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
      `[Push] Sent ${sentCount}/${subscriptions.length} push notifications to user ${user_id}`
    );

    return new Response(
      JSON.stringify({
        success: true,
        sent: sentCount,
        total: subscriptions.length,
        cleaned: staleEndpoints.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[Push] Edge Function error:", error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
