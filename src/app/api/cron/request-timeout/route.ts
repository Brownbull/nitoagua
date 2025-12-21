import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";
import RequestTimeoutEmail from "../../../../../emails/request-timeout";

/**
 * GET /api/cron/request-timeout
 * Cron job that marks pending requests with no offers as timed out after 4 hours
 *
 * Security: Authenticated via CRON_SECRET header
 * Schedule: Every 15 minutes via Vercel cron
 *
 * Story 10.4: Request Timeout Notification
 * AC10.4.1: Requests pending for 4+ hours with no offers trigger timeout
 * AC10.4.2: Request status changes to 'no_offers'
 * AC10.4.3: Consumer receives in-app notification about timeout (if registered)
 * AC10.4.4: Consumer receives email notification about timeout (if email provided)
 */

const TIMEOUT_HOURS = 4;
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://nitoagua.vercel.app";

export async function GET(request: NextRequest) {
  const start = Date.now();

  // Verify CRON_SECRET from Authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.log("[CRON] request-timeout: Unauthorized request");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const now = new Date();
    const timeoutThreshold = new Date(now.getTime() - TIMEOUT_HOURS * 60 * 60 * 1000);

    // AC10.4.1: Find pending requests that have timed out
    // Criteria:
    // - status = 'pending'
    // - created_at < 4 hours ago
    // - No active offers exist for this request
    // AC10.4.4: Include profile email for registered consumers
    const { data: timedOutRequests, error: fetchError } = await supabase
      .from("water_requests")
      .select(`
        id,
        consumer_id,
        guest_name,
        guest_email,
        guest_phone,
        address,
        amount,
        tracking_token,
        created_at,
        comunas!water_requests_comuna_id_fkey(name),
        profiles!water_requests_consumer_id_fkey(email, name)
      `)
      .eq("status", "pending")
      .lt("created_at", timeoutThreshold.toISOString());

    if (fetchError) {
      console.error("[CRON] request-timeout: Error fetching requests:", fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!timedOutRequests || timedOutRequests.length === 0) {
      const duration = Date.now() - start;
      console.log(`[CRON] request-timeout: No timed out requests found (${duration}ms)`);
      return NextResponse.json({
        timed_out_count: 0,
        duration_ms: duration,
      });
    }

    // Filter out requests that have active offers (they're still waiting for consumer selection)
    const requestIds = timedOutRequests.map((r) => r.id);

    const { data: activeOffers, error: offersError } = await supabase
      .from("offers")
      .select("request_id")
      .in("request_id", requestIds)
      .eq("status", "active");

    if (offersError) {
      console.error("[CRON] request-timeout: Error checking offers:", offersError);
      return NextResponse.json({ error: offersError.message }, { status: 500 });
    }

    // Get request IDs that have active offers (exclude them)
    const requestsWithActiveOffers = new Set(activeOffers?.map((o) => o.request_id) || []);

    // Filter to only requests with NO active offers
    const requestsToTimeout = timedOutRequests.filter(
      (r) => !requestsWithActiveOffers.has(r.id)
    );

    if (requestsToTimeout.length === 0) {
      const duration = Date.now() - start;
      console.log(`[CRON] request-timeout: No requests without offers to timeout (${duration}ms)`);
      return NextResponse.json({
        timed_out_count: 0,
        skipped_with_offers: timedOutRequests.length,
        duration_ms: duration,
      });
    }

    // AC10.4.2: Update status to 'no_offers' and set timed_out_at
    const requestIdsToUpdate = requestsToTimeout.map((r) => r.id);
    const { error: updateError } = await supabase
      .from("water_requests")
      .update({
        status: "no_offers",
        timed_out_at: now.toISOString(),
      })
      .in("id", requestIdsToUpdate);

    if (updateError) {
      console.error("[CRON] request-timeout: Error updating requests:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Process notifications for each timed out request
    const notificationResults = await Promise.allSettled(
      requestsToTimeout.map((request) =>
        processRequestTimeout(supabase, request)
      )
    );

    // Count successes and failures
    const notificationsSent = notificationResults.filter(
      (r) => r.status === "fulfilled" && r.value.success
    ).length;
    const notificationsFailed = notificationResults.filter(
      (r) => r.status === "rejected" || (r.status === "fulfilled" && !r.value.success)
    ).length;

    const duration = Date.now() - start;
    console.log(
      `[CRON] request-timeout: Timed out ${requestsToTimeout.length} requests, ` +
      `sent ${notificationsSent} notifications (${notificationsFailed} failed) in ${duration}ms`
    );

    return NextResponse.json({
      timed_out_count: requestsToTimeout.length,
      notifications_sent: notificationsSent,
      notifications_failed: notificationsFailed,
      skipped_with_offers: timedOutRequests.length - requestsToTimeout.length,
      duration_ms: duration,
    });
  } catch (error) {
    const duration = Date.now() - start;
    console.error("[CRON] request-timeout: Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        duration_ms: duration,
      },
      { status: 500 }
    );
  }
}

/**
 * Process timeout for a single request - create notification and send email
 */
async function processRequestTimeout(
  supabase: ReturnType<typeof createAdminClient>,
  request: {
    id: string;
    consumer_id: string | null;
    guest_name: string | null;
    guest_email: string | null;
    guest_phone: string;
    address: string;
    amount: number;
    tracking_token: string | null;
    created_at: string | null;
    comunas: { name: string } | null;
    profiles: { email: string | null; name: string } | null;
  }
): Promise<{ success: boolean; notificationId?: string; emailSent?: boolean }> {
  let notificationId: string | undefined;
  let emailSent = false;

  // AC10.4.3: Create in-app notification for registered consumers
  if (request.consumer_id) {
    try {
      const { data: notification, error: notifError } = await supabase
        .from("notifications")
        .insert({
          user_id: request.consumer_id,
          type: "request_timeout",
          title: "Sin ofertas disponibles",
          message: "Tu solicitud de agua no recibió ofertas. Intenta de nuevo.",
          data: {
            request_id: request.id,
            amount: request.amount,
            address: request.address,
          },
          read: false,
        })
        .select("id")
        .single();

      if (notifError) {
        console.error(
          `[CRON] request-timeout: Error creating notification for request ${request.id}:`,
          notifError
        );
      } else {
        notificationId = notification?.id;
      }
    } catch (notifErr) {
      console.error(
        `[CRON] request-timeout: Exception creating notification for request ${request.id}:`,
        notifErr
      );
    }
  }

  // AC10.4.4: Send email notification if email is available (guest or registered)
  // For registered consumers, use profile email; for guests, use guest_email
  const email = request.guest_email || request.profiles?.email;
  const customerName = request.guest_name || request.profiles?.name || "Cliente";

  if (email) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);

      // Build tracking URL - registered users go to /request/:id, guests go to /track/:token
      const trackingUrl = request.consumer_id
        ? `${BASE_URL}/request/${request.id}`
        : request.tracking_token
          ? `${BASE_URL}/track/${request.tracking_token}`
          : `${BASE_URL}/request/${request.id}`;

      const comunaName = (request.comunas as { name: string } | null)?.name;
      const fullAddress = comunaName
        ? `${request.address}, ${comunaName}`
        : request.address;

      const { error: emailError } = await resend.emails.send({
        from: "NitoAgua <notificaciones@nitoagua.cl>",
        to: email,
        subject: "Tu solicitud de agua no recibió ofertas",
        react: RequestTimeoutEmail({
          customerName,
          requestId: request.id,
          trackingUrl,
          amount: request.amount,
          address: fullAddress,
        }),
      });

      if (emailError) {
        console.error(
          `[CRON] request-timeout: Error sending email for request ${request.id}:`,
          emailError
        );
      } else {
        emailSent = true;
      }
    } catch (emailErr) {
      console.error(
        `[CRON] request-timeout: Exception sending email for request ${request.id}:`,
        emailErr
      );
    }
  }

  return {
    success: !!notificationId || emailSent,
    notificationId,
    emailSent,
  };
}

// Force dynamic rendering
export const dynamic = "force-dynamic";
