"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/guards";

export async function cancelOrder(
  orderId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify admin access
    const user = await requireAdmin();

    if (!orderId || !reason.trim()) {
      return { success: false, error: "ID del pedido y razon son requeridos" };
    }

    const adminClient = createAdminClient();

    // First, verify the order exists and can be cancelled
    const { data: order, error: fetchError } = await adminClient
      .from("water_requests")
      .select("id, status, supplier_id, consumer_id, guest_email")
      .eq("id", orderId)
      .single();

    if (fetchError || !order) {
      console.error("[ADMIN] Order not found:", orderId);
      return { success: false, error: "Pedido no encontrado" };
    }

    // Check if order can be cancelled
    if (order.status === "cancelled") {
      return { success: false, error: "Este pedido ya esta cancelado" };
    }

    if (order.status === "delivered") {
      return { success: false, error: "No se puede cancelar un pedido entregado" };
    }

    // Get admin user ID from profiles (if email exists)
    let adminProfileId: string | null = null;
    if (user.email) {
      const { data: adminProfile } = await adminClient
        .from("profiles")
        .select("id")
        .eq("email", user.email)
        .single();
      adminProfileId = adminProfile?.id || null;
    }

    // Update the order status
    const { error: updateError } = await adminClient
      .from("water_requests")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason,
        cancelled_by: adminProfileId,
      })
      .eq("id", orderId);

    if (updateError) {
      console.error("[ADMIN] Error cancelling order:", updateError.message);
      return { success: false, error: "Error al cancelar el pedido" };
    }

    // Mark any active offers as "request_filled" (cancelled because request was cancelled)
    const { error: offersError } = await adminClient
      .from("offers")
      .update({ status: "cancelled" })
      .eq("request_id", orderId)
      .in("status", ["active", "accepted"]);

    if (offersError) {
      console.error("[ADMIN] Error updating offers:", offersError.message);
      // Non-fatal - continue
    }

    // Log the action
    console.log(`[ADMIN] Order ${orderId} cancelled by ${user.email}: ${reason}`);

    // TODO: Send notifications to consumer and provider (if assigned)
    // This would be implemented with the notification system from Epic 5

    return { success: true };
  } catch (error) {
    console.error("[ADMIN] Cancel order error:", error);
    return { success: false, error: "Error interno del servidor" };
  }
}
