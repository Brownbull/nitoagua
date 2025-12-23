"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { getDeliveryPrice } from "@/lib/utils/commission";
import { isGuestRequest, sendGuestNotification } from "@/lib/email";

/**
 * Result type for completeDelivery action
 * Follows Atlas Section 4: API Response Format
 */
interface CompleteDeliveryResult {
  success: boolean;
  error?: string;
}

/**
 * Mark a delivery as complete
 *
 * Story: 11A-1 P10 Delivery Completion
 * FR31: Suppliers can mark an accepted request as delivered
 *
 * AC 11A-1.3: Server Action Works
 * - Updates request status to 'delivered'
 * - Sets delivered_at timestamp
 * - Records commission in settlement system
 * - Only the accepting provider can complete (authorization check)
 *
 * @param offerId - The offer ID of the accepted offer
 */
export async function completeDelivery(
  offerId: string
): Promise<CompleteDeliveryResult> {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "No autenticado" };
  }

  // Get offer with request details
  // Using admin client to get full access to related data
  const { data: offer, error: offerError } = await adminClient
    .from("offers")
    .select(
      `
      id,
      status,
      provider_id,
      request_id,
      water_requests!offers_request_id_fkey (
        id,
        status,
        consumer_id,
        amount,
        supplier_id,
        guest_email,
        guest_name,
        tracking_token,
        address
      )
    `
    )
    .eq("id", offerId)
    .single();

  if (offerError || !offer) {
    console.error("[Delivery] Error fetching offer:", offerError);
    return { success: false, error: "Oferta no encontrada" };
  }

  // AC 11A-1.3: Verify authorization - only the accepting provider can complete
  if (offer.provider_id !== user.id) {
    return { success: false, error: "No autorizado" };
  }

  // Verify offer status is 'accepted'
  if (offer.status !== "accepted") {
    return {
      success: false,
      error:
        offer.status === "completed"
          ? "Esta entrega ya fue completada"
          : "La oferta no está aceptada",
    };
  }

  const request = offer.water_requests as unknown as {
    id: string;
    status: string;
    consumer_id: string | null;
    amount: number;
    supplier_id: string | null;
    guest_email: string | null;
    guest_name: string | null;
    tracking_token: string | null;
    address: string;
  };

  if (!request) {
    return { success: false, error: "Solicitud no encontrada" };
  }

  // Verify request status is 'accepted' (not already delivered)
  if (request.status !== "accepted") {
    return {
      success: false,
      error:
        request.status === "delivered"
          ? "Esta solicitud ya fue marcada como entregada"
          : "La solicitud no está en estado aceptado",
    };
  }

  const now = new Date().toISOString();

  // AC 11A-1.3: Update request status to delivered
  const { error: updateRequestError } = await adminClient
    .from("water_requests")
    .update({
      status: "delivered",
      delivered_at: now,
    })
    .eq("id", request.id)
    .eq("status", "accepted"); // Safety check

  if (updateRequestError) {
    console.error("[Delivery] Error updating request:", updateRequestError);
    return { success: false, error: "Error al actualizar la solicitud" };
  }

  // Update offer status to 'completed' for tracking
  const { error: updateOfferError } = await adminClient
    .from("offers")
    .update({ status: "completed" })
    .eq("id", offerId);

  if (updateOfferError) {
    console.error("[Delivery] Error updating offer status:", updateOfferError);
    // Don't fail the whole operation, offer status is secondary
  }

  // AC 11A-1.3: Record commission in settlement system
  // Get provider's commission rate (from profile override or default)
  let commissionPercent = 10; // Default per Atlas Section 4

  const { data: profile } = await supabase
    .from("profiles")
    .select("commission_override")
    .eq("id", user.id)
    .single();

  if (profile?.commission_override !== null && profile?.commission_override !== undefined) {
    commissionPercent = profile.commission_override;
  } else {
    // Check admin settings for default
    const { data: commissionSetting } = await adminClient
      .from("admin_settings")
      .select("value")
      .eq("key", "default_commission_percent")
      .single();

    if (commissionSetting?.value) {
      commissionPercent =
        typeof commissionSetting.value === "object"
          ? (commissionSetting.value as { value: number }).value
          : (commissionSetting.value as number);
    }
  }

  // Calculate commission based on delivery price
  const deliveryPrice = getDeliveryPrice(request.amount);
  const commissionAmount = Math.round(
    deliveryPrice * (commissionPercent / 100)
  );

  // Record commission_owed in ledger
  const { error: ledgerError } = await adminClient
    .from("commission_ledger")
    .insert({
      provider_id: user.id,
      type: "commission_owed",
      amount: commissionAmount,
      description: `Comisión por entrega de ${request.amount}L - Solicitud #${request.id.slice(0, 8)}`,
      request_id: request.id,
    });

  if (ledgerError) {
    console.error("[Delivery] Error recording commission:", ledgerError);
    // Don't fail the operation - the delivery is complete, commission can be reconciled later
  }

  // AC 11A-1.5: Create notification for consumer about delivery completion
  // Get provider name for notifications
  const { data: providerProfile } = await adminClient
    .from("profiles")
    .select("name")
    .eq("id", user.id)
    .single();

  const providerName = providerProfile?.name || "El proveedor";

  if (request.consumer_id) {
    // Registered consumer: in-app notification
    await adminClient.from("notifications").insert({
      user_id: request.consumer_id,
      type: "delivery_completed",
      title: "¡Entrega completada!",
      message: `Tu pedido de ${request.amount.toLocaleString("es-CL")} litros ha sido entregado`,
      data: {
        request_id: request.id,
        offer_id: offerId,
      },
      read: false,
    });
  } else if (isGuestRequest({ guest_email: request.guest_email, consumer_id: request.consumer_id })) {
    // Guest consumer: email notification
    // Fire and forget - don't block the response
    sendGuestNotification({
      type: "delivered",
      guestEmail: request.guest_email!,
      guestName: request.guest_name || "Cliente",
      requestId: request.id,
      trackingToken: request.tracking_token || "",
      amount: request.amount,
      address: request.address,
      supplierName: providerName,
      deliveredAt: now,
    }).catch((err) => {
      console.error("[Delivery] Failed to send guest email:", err);
    });
  }

  console.log(
    `[Delivery] Completed: offer=${offerId}, request=${request.id}, provider=${user.id}, commission=${commissionAmount}`
  );

  // Revalidate relevant paths
  revalidatePath("/provider/offers");
  revalidatePath("/provider/deliveries");
  revalidatePath(`/provider/deliveries/${offerId}`);
  revalidatePath("/provider/earnings");
  revalidatePath(`/request/${request.id}`);

  return { success: true };
}
