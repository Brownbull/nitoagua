"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { getDeliveryPrice, formatCLP } from "@/lib/utils/commission";
import { createAuthError, type ActionResult } from "@/lib/types/action-result";

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

    // AC12.6.2.3: Return requiresLogin flag for auth failures
    if (userError || !user) {
      return createAuthError();
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
    // Atlas Section 4: Default commission is 10%
    const adminClient = createAdminClient();
    let commissionPercent = 10; // Default per architecture.md

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

    // Calculate gross income from deliveries using shared pricing utility
    let grossIncome = 0;
    let cashReceived = 0;
    const totalDeliveries = deliveries?.length ?? 0;

    // TODO: Story 8.6 Limitation - payment_method is not yet tracked on water_requests table.
    // Currently all deliveries are assumed to be cash payments.
    // When payment_method column is added to water_requests, update this logic to:
    // - Query payment_method from each delivery
    // - Accurately split cash_received vs transfer amounts
    // - This affects AC8.6.3 (Efectivo Recibido accuracy)
    for (const delivery of deliveries || []) {
      const price = getDeliveryPrice(delivery.amount);
      grossIncome += price;
      // All deliveries counted as cash until payment_method tracking is implemented
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

    // AC12.6.2.3: Return requiresLogin flag for auth failures
    if (userError || !user) {
      return createAuthError();
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

    // Get commission percent - Atlas Section 4: Default 10%
    const adminClient = createAdminClient();
    let commissionPercent = 10;

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

    // Calculate price for each delivery using shared pricing utility
    // TODO: payment_method defaults to cash - see getEarningsSummary TODO for tracking limitation
    const records: DeliveryRecord[] = (deliveries || []).map((d) => {
      const price = getDeliveryPrice(d.amount);
      const commission = Math.round(price * (commissionPercent / 100));
      return {
        id: d.id,
        date: d.delivered_at || "",
        amount: price,
        payment_method: "cash" as const, // Default until payment_method tracking added
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
      return { success: false, error: auth.error || "Error de autenticación" };
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
      return { success: false, error: auth.error || "Error de autenticación" };
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
      return { success: false, error: auth.error || "Error de autenticación" };
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
      return { success: false, error: auth.error || "Error de autenticación" };
    }

    const adminClient = createAdminClient();

    const { data, error } = await adminClient.storage
      .from("commission-receipts")
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

// =============================================================================
// PROVIDER SETTLEMENT ACTIONS (Story 8.7)
// =============================================================================

/**
 * Platform bank details for commission settlement
 * AC: 8.7.2 - Show bank details: Banco, Cuenta, Titular, RUT
 */
export interface PlatformBankDetails {
  bank_name: string;
  account_type: string;
  account_number: string;
  account_holder: string;
  rut: string;
}

/**
 * Pending withdrawal request for current provider
 */
export interface PendingWithdrawal {
  id: string;
  amount: number;
  receipt_path: string | null;
  status: string;
  created_at: string;
  rejection_reason: string | null;
}

/**
 * Get platform bank details for settlement page
 * AC: 8.7.2 - Display Banco, Tipo de Cuenta, Número de Cuenta, Titular, RUT
 */
export async function getPlatformBankDetails(): Promise<ActionResult<PlatformBankDetails>> {
  try {
    const supabase = await createClient();

    // Verify user is authenticated
    // AC12.6.2.3: Return requiresLogin flag for auth failures
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return createAuthError();
    }

    const adminClient = createAdminClient();

    // Fetch all bank-related settings
    const { data: settings, error: settingsError } = await adminClient
      .from("admin_settings")
      .select("key, value")
      .in("key", [
        "platform_bank_name",
        "platform_account_type",
        "platform_account_number",
        "platform_account_holder",
        "platform_rut",
      ]);

    if (settingsError) {
      console.error("[Settlement] Error fetching bank settings:", settingsError);
      return { success: false, error: "Error al cargar datos bancarios" };
    }

    // Parse settings into bank details object
    const settingsMap = new Map(
      (settings || []).map(s => [s.key, (s.value as { value: string }).value])
    );

    const bankDetails: PlatformBankDetails = {
      bank_name: settingsMap.get("platform_bank_name") || "No configurado",
      account_type: settingsMap.get("platform_account_type") || "No configurado",
      account_number: settingsMap.get("platform_account_number") || "No configurado",
      account_holder: settingsMap.get("platform_account_holder") || "No configurado",
      rut: settingsMap.get("platform_rut") || "No configurado",
    };

    return { success: true, data: bankDetails };
  } catch (err) {
    console.error("[Settlement] Unexpected error in getPlatformBankDetails:", err);
    return { success: false, error: "Error inesperado" };
  }
}

/**
 * Get pending withdrawal request for current provider
 * AC: 8.7.6 - Show pending verification status
 */
export async function getPendingWithdrawal(): Promise<ActionResult<PendingWithdrawal | null>> {
  try {
    const supabase = await createClient();

    // Verify user is authenticated
    // AC12.6.2.3: Return requiresLogin flag for auth failures
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return createAuthError();
    }

    // Verify user is a provider
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "supplier") {
      return { success: false, error: "Esta funcionalidad es solo para proveedores" };
    }

    // Check for pending withdrawal request
    const { data: withdrawal, error: withdrawalError } = await supabase
      .from("withdrawal_requests")
      .select("id, amount, receipt_path, status, created_at, rejection_reason")
      .eq("provider_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (withdrawalError) {
      console.error("[Settlement] Error fetching pending withdrawal:", withdrawalError);
      return { success: false, error: "Error al verificar estado de pago" };
    }

    if (!withdrawal) {
      return { success: true, data: null };
    }

    // Map to PendingWithdrawal type with proper defaults
    const pendingWithdrawal: PendingWithdrawal = {
      id: withdrawal.id,
      amount: withdrawal.amount,
      receipt_path: withdrawal.receipt_path,
      status: withdrawal.status || "pending",
      created_at: withdrawal.created_at || new Date().toISOString(),
      rejection_reason: withdrawal.rejection_reason,
    };

    return { success: true, data: pendingWithdrawal };
  } catch (err) {
    console.error("[Settlement] Unexpected error in getPendingWithdrawal:", err);
    return { success: false, error: "Error inesperado" };
  }
}

/**
 * Submit commission payment with receipt
 * AC: 8.7.4 - Create withdrawal_request with status 'pending'
 * AC: 8.7.5 - Notify admin for verification
 */
export async function submitCommissionPayment(
  amount: number,
  receiptPath: string
): Promise<ActionResult<{ requestId: string }>> {
  try {
    const supabase = await createClient();

    // Verify user is authenticated
    // AC12.6.2.3: Return requiresLogin flag for auth failures
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return createAuthError();
    }

    // Verify user is a provider
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, name")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "supplier") {
      return { success: false, error: "Esta funcionalidad es solo para proveedores" };
    }

    // Check for existing pending withdrawal
    const { data: existingWithdrawal } = await supabase
      .from("withdrawal_requests")
      .select("id")
      .eq("provider_id", user.id)
      .eq("status", "pending")
      .maybeSingle();

    if (existingWithdrawal) {
      return { success: false, error: "Ya tienes un pago pendiente de verificación" };
    }

    // Validate amount matches pending commission
    const summaryResult = await getEarningsSummary("month");
    if (!summaryResult.success || !summaryResult.data) {
      return { success: false, error: "Error al verificar comisión pendiente" };
    }

    const pendingCommission = summaryResult.data.commission_pending;
    if (amount !== pendingCommission) {
      return {
        success: false,
        error: `El monto debe ser exactamente ${formatCLP(pendingCommission)}`
      };
    }

    if (pendingCommission <= 0) {
      return { success: false, error: "No tienes comisión pendiente" };
    }

    // Create withdrawal request
    const { data: withdrawal, error: insertError } = await supabase
      .from("withdrawal_requests")
      .insert({
        provider_id: user.id,
        amount: amount,
        receipt_path: receiptPath,
        status: "pending",
      })
      .select("id")
      .single();

    if (insertError || !withdrawal) {
      console.error("[Settlement] Error creating withdrawal request:", insertError);
      return { success: false, error: "Error al registrar pago" };
    }

    // Notify admins (AC: 8.7.5)
    const adminClient = createAdminClient();

    // Get all admin emails
    const { data: adminEmails } = await adminClient
      .from("admin_allowed_emails")
      .select("email");

    // Get admin profile IDs
    if (adminEmails && adminEmails.length > 0) {
      const { data: adminProfiles } = await adminClient
        .from("profiles")
        .select("id")
        .in("email", adminEmails.map(a => a.email));

      // Create notifications for all admins
      if (adminProfiles && adminProfiles.length > 0) {
        const notifications = adminProfiles.map(admin => ({
          user_id: admin.id,
          type: "commission_payment_submitted",
          title: "Nuevo pago de comisión",
          message: `${profile.name || "Un proveedor"} envió un pago de ${formatCLP(amount)} para verificación`,
          data: {
            withdrawal_id: withdrawal.id,
            provider_id: user.id,
            amount: amount,
          },
        }));

        await adminClient
          .from("notifications")
          .insert(notifications);
      }
    }

    console.log(`[Settlement] Payment submitted: provider=${user.id}, amount=${amount}, request=${withdrawal.id}`);

    revalidatePath("/provider/earnings");
    revalidatePath("/provider/earnings/withdraw");
    revalidatePath("/admin/settlement");

    return { success: true, data: { requestId: withdrawal.id } };
  } catch (err) {
    console.error("[Settlement] Unexpected error in submitCommissionPayment:", err);
    return { success: false, error: "Error inesperado al enviar pago" };
  }
}

