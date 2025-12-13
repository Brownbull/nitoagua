"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

interface ActionResult<T = void> {
  success: boolean;
  error?: string;
  data?: T;
}

/**
 * Check if current user is admin
 */
async function verifyAdminAccess(): Promise<{
  isAdmin: boolean;
  userId?: string;
  email?: string;
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user || !user.email) {
    return { isAdmin: false, error: "Debes iniciar sesion como administrador" };
  }

  const { data: adminEmail } = await supabase
    .from("admin_allowed_emails")
    .select("email")
    .eq("email", user.email)
    .single();

  if (!adminEmail) {
    return { isAdmin: false, error: "No tienes permisos de administrador" };
  }

  return { isAdmin: true, userId: user.id, email: user.email };
}

/**
 * Verify a payment - confirm commission was received
 * AC6.5.5, AC6.5.6, AC6.5.8
 */
export async function verifyPayment(
  withdrawalId: string,
  bankReference?: string
): Promise<ActionResult> {
  try {
    const auth = await verifyAdminAccess();
    if (!auth.isAdmin) {
      return { success: false, error: auth.error };
    }

    const adminClient = createAdminClient();

    // Get the withdrawal request details
    const { data: withdrawal, error: fetchError } = await adminClient
      .from("withdrawal_requests")
      .select("id, provider_id, amount, status")
      .eq("id", withdrawalId)
      .single();

    if (fetchError || !withdrawal) {
      console.error("[ADMIN] Error fetching withdrawal:", fetchError?.message);
      return { success: false, error: "Solicitud de retiro no encontrada" };
    }

    if (withdrawal.status !== "pending") {
      return { success: false, error: "Esta solicitud ya fue procesada" };
    }

    // 1. Update withdrawal request to completed
    const { error: updateError } = await adminClient
      .from("withdrawal_requests")
      .update({
        status: "completed",
        processed_by: auth.userId,
        processed_at: new Date().toISOString(),
        bank_reference: bankReference || null,
      })
      .eq("id", withdrawalId);

    if (updateError) {
      console.error("[ADMIN] Error updating withdrawal:", updateError.message);
      return { success: false, error: "Error al actualizar solicitud" };
    }

    // 2. Insert commission_paid entry in ledger (AC6.5.6)
    const { error: ledgerError } = await adminClient
      .from("commission_ledger")
      .insert({
        provider_id: withdrawal.provider_id,
        type: "commission_paid",
        amount: withdrawal.amount,
        description: `Pago verificado - Solicitud #${withdrawalId.slice(0, 8)}`,
        bank_reference: bankReference || null,
        admin_id: auth.userId,
      });

    if (ledgerError) {
      console.error("[ADMIN] Error inserting ledger entry:", ledgerError.message);
      // Don't fail the whole operation, but log it
    }

    // 3. TODO: Notify provider (AC6.5.8)
    // This would use the notification system from Epic 5
    console.log(
      `[ADMIN] Payment ${withdrawalId} VERIFIED by ${auth.email}. Bank ref: ${bankReference || "N/A"}`
    );

    revalidatePath("/admin/settlement");
    return { success: true };
  } catch (err) {
    console.error("[ADMIN] Unexpected error in verifyPayment:", err);
    return { success: false, error: "Error inesperado al verificar pago" };
  }
}

/**
 * Reject a payment with reason
 * AC6.5.7, AC6.5.8
 */
export async function rejectPayment(
  withdrawalId: string,
  reason: string
): Promise<ActionResult> {
  try {
    const auth = await verifyAdminAccess();
    if (!auth.isAdmin) {
      return { success: false, error: auth.error };
    }

    if (!reason.trim()) {
      return { success: false, error: "El motivo de rechazo es requerido" };
    }

    const adminClient = createAdminClient();

    // Get the withdrawal request details
    const { data: withdrawal, error: fetchError } = await adminClient
      .from("withdrawal_requests")
      .select("id, provider_id, status")
      .eq("id", withdrawalId)
      .single();

    if (fetchError || !withdrawal) {
      console.error("[ADMIN] Error fetching withdrawal:", fetchError?.message);
      return { success: false, error: "Solicitud de retiro no encontrada" };
    }

    if (withdrawal.status !== "pending") {
      return { success: false, error: "Esta solicitud ya fue procesada" };
    }

    // Update withdrawal request to rejected
    const { error: updateError } = await adminClient
      .from("withdrawal_requests")
      .update({
        status: "rejected",
        processed_by: auth.userId,
        processed_at: new Date().toISOString(),
        rejection_reason: reason.trim(),
      })
      .eq("id", withdrawalId);

    if (updateError) {
      console.error("[ADMIN] Error rejecting withdrawal:", updateError.message);
      return { success: false, error: "Error al rechazar solicitud" };
    }

    // TODO: Notify provider with reason (AC6.5.8)
    console.log(
      `[ADMIN] Payment ${withdrawalId} REJECTED by ${auth.email}. Reason: ${reason}`
    );

    revalidatePath("/admin/settlement");
    return { success: true };
  } catch (err) {
    console.error("[ADMIN] Unexpected error in rejectPayment:", err);
    return { success: false, error: "Error inesperado al rechazar pago" };
  }
}

/**
 * Get provider ledger history for detail view
 * AC6.5.3 (Detail view)
 */
export async function getProviderLedgerHistory(
  providerId: string
): Promise<ActionResult<Array<{
  id: string;
  type: string;
  amount: number;
  description: string | null;
  bank_reference: string | null;
  created_at: string;
}>>> {
  try {
    const auth = await verifyAdminAccess();
    if (!auth.isAdmin) {
      return { success: false, error: auth.error };
    }

    const adminClient = createAdminClient();

    const { data: entries, error } = await adminClient
      .from("commission_ledger")
      .select(`
        id,
        type,
        amount,
        description,
        bank_reference,
        created_at
      `)
      .eq("provider_id", providerId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[ADMIN] Error fetching ledger history:", error.message);
      return { success: false, error: "Error al obtener historial" };
    }

    return { success: true, data: entries || [] };
  } catch (err) {
    console.error("[ADMIN] Unexpected error in getProviderLedgerHistory:", err);
    return { success: false, error: "Error inesperado" };
  }
}

/**
 * Get signed URL for receipt image
 */
export async function getReceiptUrl(
  receiptPath: string
): Promise<ActionResult<string>> {
  try {
    const auth = await verifyAdminAccess();
    if (!auth.isAdmin) {
      return { success: false, error: auth.error };
    }

    const adminClient = createAdminClient();

    const { data, error } = await adminClient.storage
      .from("receipts")
      .createSignedUrl(receiptPath, 3600); // 1 hour expiry

    if (error) {
      console.error("[ADMIN] Error getting receipt URL:", error.message);
      return { success: false, error: "Error al obtener comprobante" };
    }

    return { success: true, data: data.signedUrl };
  } catch (err) {
    console.error("[ADMIN] Unexpected error in getReceiptUrl:", err);
    return { success: false, error: "Error inesperado" };
  }
}
