"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

interface ActionResult<T = void> {
  success: boolean;
  error?: string;
  data?: T;
}

// Types for earnings dashboard
export type EarningsPeriod = "today" | "week" | "month";

export interface EarningsSummary {
  period: EarningsPeriod;
  total_deliveries: number;
  gross_income: number;
  commission_amount: number;
  commission_percent: number;
  net_earnings: number;
  cash_received: number;
  commission_pending: number;
}

export interface DeliveryRecord {
  id: string;
  date: string;
  amount: number;
  payment_method: "cash" | "transfer";
  commission: number;
  net: number;
}

/**
 * Get date range for earnings period
 * AC: 8.6.1 - Period selector: Hoy / Esta Semana / Este Mes
 */
function getPeriodRange(period: EarningsPeriod): { start: Date; end: Date } {
  const now = new Date();
  switch (period) {
    case "today":
      return { start: startOfDay(now), end: endOfDay(now) };
    case "week":
      return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
    case "month":
      return { start: startOfMonth(now), end: endOfMonth(now) };
  }
}

/**
 * Get earnings summary for current provider
 * AC: 8.6.1 - Period selector filter
 * AC: 8.6.2 - Summary cards: Total Entregas, Ingreso Bruto, Comisión (%), Ganancia Neta
 * AC: 8.6.3 - Cash section: Efectivo Recibido, Comisión Pendiente
 */
export async function getEarningsSummary(
  period: EarningsPeriod = "month"
): Promise<ActionResult<EarningsSummary>> {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "No autenticado" };
    }

    // Verify user is a provider
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, commission_override")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return { success: false, error: "No se pudo obtener el perfil" };
    }

    if (profile.role !== "supplier") {
      return { success: false, error: "Esta funcionalidad es solo para proveedores" };
    }

    // Get commission percent from admin settings or provider override
    const adminClient = createAdminClient();
    let commissionPercent = 15; // Default

    if (profile.commission_override !== null) {
      commissionPercent = profile.commission_override;
    } else {
      const { data: commissionSetting } = await adminClient
        .from("admin_settings")
        .select("value")
        .eq("key", "default_commission_percent")
        .single();

      if (commissionSetting?.value) {
        commissionPercent = typeof commissionSetting.value === "object"
          ? (commissionSetting.value as { value: number }).value
          : commissionSetting.value as number;
      }
    }

    // Get date range for period
    const { start, end } = getPeriodRange(period);

    // Query completed deliveries (requests with status 'delivered' where provider is supplier)
    // These are requests where the offer was accepted and delivery completed
    const { data: deliveries, error: deliveriesError } = await supabase
      .from("water_requests")
      .select(`
        id,
        amount,
        delivered_at
      `)
      .eq("supplier_id", user.id)
      .eq("status", "delivered")
      .gte("delivered_at", start.toISOString())
      .lte("delivered_at", end.toISOString());

    if (deliveriesError) {
      console.error("[Settlement] Error fetching deliveries:", deliveriesError);
      return { success: false, error: "Error al cargar entregas" };
    }

    // Calculate gross income from deliveries
    // For now, we use a simple amount-based pricing (should match offer settings)
    const getPrice = (amount: number): number => {
      if (amount <= 100) return 5000;
      if (amount <= 1000) return 20000;
      if (amount <= 5000) return 75000;
      return 140000;
    };

    let grossIncome = 0;
    let cashReceived = 0;
    const totalDeliveries = deliveries?.length ?? 0;

    // For now, assume all deliveries are cash (payment_method not yet tracked on requests)
    // In a real implementation, we'd track payment_method on water_requests
    for (const delivery of deliveries || []) {
      const price = getPrice(delivery.amount);
      grossIncome += price;
      // Assume cash for now (will be enhanced when payment method is tracked)
      cashReceived += price;
    }

    // Calculate commission
    const commissionAmount = Math.round(grossIncome * (commissionPercent / 100));
    const netEarnings = grossIncome - commissionAmount;

    // Calculate commission pending from ledger
    // Sum of commission_owed entries minus sum of commission_paid entries
    const { data: ledgerEntries, error: ledgerError } = await supabase
      .from("commission_ledger")
      .select("type, amount")
      .eq("provider_id", user.id);

    if (ledgerError) {
      console.error("[Settlement] Error fetching ledger:", ledgerError);
      // Continue without ledger data - set pending to 0
    }

    let commissionOwed = 0;
    let commissionPaid = 0;

    for (const entry of ledgerEntries || []) {
      if (entry.type === "commission_owed") {
        commissionOwed += entry.amount;
      } else if (entry.type === "commission_paid") {
        commissionPaid += entry.amount;
      }
    }

    const commissionPending = commissionOwed - commissionPaid;

    return {
      success: true,
      data: {
        period,
        total_deliveries: totalDeliveries,
        gross_income: grossIncome,
        commission_amount: commissionAmount,
        commission_percent: commissionPercent,
        net_earnings: netEarnings,
        cash_received: cashReceived,
        commission_pending: Math.max(0, commissionPending),
      },
    };
  } catch (err) {
    console.error("[Settlement] Unexpected error in getEarningsSummary:", err);
    return { success: false, error: "Error inesperado" };
  }
}

/**
 * Get delivery history for current provider
 * AC: 8.6.5 - Delivery history list shows: date, amount, payment method, commission
 */
export async function getDeliveryHistory(
  limit: number = 10,
  offset: number = 0
): Promise<ActionResult<{ records: DeliveryRecord[]; total: number }>> {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "No autenticado" };
    }

    // Verify user is a provider
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, commission_override")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return { success: false, error: "No se pudo obtener el perfil" };
    }

    if (profile.role !== "supplier") {
      return { success: false, error: "Esta funcionalidad es solo para proveedores" };
    }

    // Get commission percent
    const adminClient = createAdminClient();
    let commissionPercent = 15;

    if (profile.commission_override !== null) {
      commissionPercent = profile.commission_override;
    } else {
      const { data: commissionSetting } = await adminClient
        .from("admin_settings")
        .select("value")
        .eq("key", "default_commission_percent")
        .single();

      if (commissionSetting?.value) {
        commissionPercent = typeof commissionSetting.value === "object"
          ? (commissionSetting.value as { value: number }).value
          : commissionSetting.value as number;
      }
    }

    // Get total count
    const { count, error: countError } = await supabase
      .from("water_requests")
      .select("*", { count: "exact", head: true })
      .eq("supplier_id", user.id)
      .eq("status", "delivered");

    if (countError) {
      console.error("[Settlement] Error counting deliveries:", countError);
    }

    // Query completed deliveries
    const { data: deliveries, error: deliveriesError } = await supabase
      .from("water_requests")
      .select(`
        id,
        amount,
        delivered_at
      `)
      .eq("supplier_id", user.id)
      .eq("status", "delivered")
      .order("delivered_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (deliveriesError) {
      console.error("[Settlement] Error fetching delivery history:", deliveriesError);
      return { success: false, error: "Error al cargar historial" };
    }

    // Calculate price for each delivery
    const getPrice = (amount: number): number => {
      if (amount <= 100) return 5000;
      if (amount <= 1000) return 20000;
      if (amount <= 5000) return 75000;
      return 140000;
    };

    const records: DeliveryRecord[] = (deliveries || []).map((d) => {
      const price = getPrice(d.amount);
      const commission = Math.round(price * (commissionPercent / 100));
      return {
        id: d.id,
        date: d.delivered_at || "",
        amount: price,
        payment_method: "cash" as const, // Default to cash, will be enhanced
        commission,
        net: price - commission,
      };
    });

    return {
      success: true,
      data: {
        records,
        total: count ?? 0,
      },
    };
  } catch (err) {
    console.error("[Settlement] Unexpected error in getDeliveryHistory:", err);
    return { success: false, error: "Error inesperado" };
  }
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
