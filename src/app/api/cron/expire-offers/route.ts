import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/cron/expire-offers
 * Cron job that marks expired offers and notifies providers
 *
 * Security: Authenticated via CRON_SECRET header
 * Schedule: * * * * * (every minute via Vercel cron)
 *
 * AC6.7.1: Runs every minute via Vercel cron
 * AC6.7.2: Marks offers with expires_at < NOW() as 'expired'
 * AC6.7.3: Notifies affected providers "Tu oferta expiró"
 * AC6.7.4: Logs count of expired offers
 * AC6.7.5: Authenticated via CRON_SECRET
 */
export async function GET(request: NextRequest) {
  const start = Date.now();

  // AC6.7.5: Verify CRON_SECRET from Authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.log("[CRON] expire-offers: Unauthorized request");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();

    // AC6.7.2: Find and update expired offers
    // Query: SELECT * FROM offers WHERE status = 'active' AND expires_at < NOW()
    // Batch update: SET status = 'expired'
    const now = new Date().toISOString();
    const { data: expired, error } = await supabase
      .from("offers")
      .update({ status: "expired" })
      .eq("status", "active")
      .lt("expires_at", now)
      .select(`
        id,
        provider_id,
        request_id,
        water_requests!inner(
          id,
          address,
          amount,
          guest_name
        )
      `);

    if (error) {
      console.error("[CRON] expire-offers: Error expiring offers:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    const expiredCount = expired?.length || 0;

    // AC6.7.3: Create notifications for affected providers
    if (expired && expired.length > 0) {
      // Prepare notification inserts
      const notifications = expired.map((offer) => {
        // Type the water_requests properly
        const request = offer.water_requests as unknown as {
          id: string;
          address: string;
          amount: number;
          guest_name: string | null;
        };

        // Use guest_name or generic "Cliente" for notification message
        const consumerName = request.guest_name || "Cliente";

        return {
          user_id: offer.provider_id,
          type: "offer_expired",
          title: "Tu oferta expiró",
          message: `Tu oferta para ${consumerName} (${request.amount}L en ${request.address}) ha expirado.`,
          data: {
            offer_id: offer.id,
            request_id: offer.request_id,
          },
          read: false,
        };
      });

      // Insert all notifications in batch
      const { error: notifError } = await supabase
        .from("notifications")
        .insert(notifications);

      if (notifError) {
        // Log error but don't fail the cron - offers were already expired
        console.error(
          "[CRON] expire-offers: Error creating notifications:",
          notifError
        );
      } else {
        console.log(
          `[CRON] expire-offers: Created ${notifications.length} notifications`
        );
      }
    }

    const duration = Date.now() - start;

    // AC6.7.4: Log count of expired offers
    console.log(`[CRON] Expired ${expiredCount} offers in ${duration}ms`);

    return NextResponse.json({
      expired_count: expiredCount,
      duration_ms: duration,
    });
  } catch (error) {
    const duration = Date.now() - start;
    console.error("[CRON] expire-offers: Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        duration_ms: duration,
      },
      { status: 500 }
    );
  }
}
