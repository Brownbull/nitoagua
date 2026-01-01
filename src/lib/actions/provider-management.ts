"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { AUTH_ERROR_MESSAGE, type ActionResult } from "@/lib/types/action-result";

/**
 * Check if current user is admin
 * AC12.6.2.4: Return requiresLogin flag for auth failures
 */
async function verifyAdminAccess(): Promise<{ isAdmin: boolean; email?: string; error?: string; requiresLogin?: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user || !user.email) {
    return { isAdmin: false, error: AUTH_ERROR_MESSAGE, requiresLogin: true };
  }

  const { data: adminEmail } = await supabase
    .from("admin_allowed_emails")
    .select("email")
    .eq("email", user.email)
    .single();

  if (!adminEmail) {
    return { isAdmin: false, error: "No tienes permisos de administrador" };
  }

  return { isAdmin: true, email: user.email };
}

/**
 * Suspend a provider with a reason
 */
export async function suspendProvider(
  providerId: string,
  reason: string
): Promise<ActionResult> {
  try {
    const auth = await verifyAdminAccess();
    if (!auth.isAdmin) {
      return { success: false, error: auth.error || "Error de autenticación", requiresLogin: auth.requiresLogin };
    }

    if (!reason.trim()) {
      return { success: false, error: "El motivo de suspension es requerido" };
    }

    const adminClient = createAdminClient();

    // Update provider status
    const { error: updateError } = await adminClient
      .from("profiles")
      .update({
        verification_status: "suspended",
        suspension_reason: reason.trim(),
        is_available: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", providerId)
      .in("role", ["supplier", "provider"]);

    if (updateError) {
      console.error("[ADMIN] Error suspending provider:", updateError.message);
      return { success: false, error: "Error al suspender proveedor" };
    }

    console.log(
      `[ADMIN] Provider ${providerId} SUSPENDED by ${auth.email} - Reason: ${reason}`
    );

    // TODO: Send notification to provider (Story 6.4 AC6.4.5)

    revalidatePath("/admin/providers");
    return { success: true };
  } catch (err) {
    console.error("[ADMIN] Unexpected error in suspendProvider:", err);
    return { success: false, error: "Error inesperado al suspender proveedor" };
  }
}

/**
 * Unsuspend (reactivate) a provider
 */
export async function unsuspendProvider(providerId: string): Promise<ActionResult> {
  try {
    const auth = await verifyAdminAccess();
    if (!auth.isAdmin) {
      return { success: false, error: auth.error || "Error de autenticación", requiresLogin: auth.requiresLogin };
    }

    const adminClient = createAdminClient();

    // Update provider status back to approved
    const { error: updateError } = await adminClient
      .from("profiles")
      .update({
        verification_status: "approved",
        suspension_reason: null,
        is_available: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", providerId)
      .eq("verification_status", "suspended");

    if (updateError) {
      console.error("[ADMIN] Error unsuspending provider:", updateError.message);
      return { success: false, error: "Error al reactivar proveedor" };
    }

    console.log(`[ADMIN] Provider ${providerId} UNSUSPENDED by ${auth.email}`);

    // TODO: Send notification to provider (Story 6.4 AC6.4.6)

    revalidatePath("/admin/providers");
    return { success: true };
  } catch (err) {
    console.error("[ADMIN] Unexpected error in unsuspendProvider:", err);
    return { success: false, error: "Error inesperado al reactivar proveedor" };
  }
}

/**
 * Permanently ban a provider
 */
export async function banProvider(providerId: string): Promise<ActionResult> {
  try {
    const auth = await verifyAdminAccess();
    if (!auth.isAdmin) {
      return { success: false, error: auth.error || "Error de autenticación", requiresLogin: auth.requiresLogin };
    }

    const adminClient = createAdminClient();

    // Update provider status to banned
    const { error: updateError } = await adminClient
      .from("profiles")
      .update({
        verification_status: "banned",
        is_available: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", providerId)
      .in("role", ["supplier", "provider"]);

    if (updateError) {
      console.error("[ADMIN] Error banning provider:", updateError.message);
      return { success: false, error: "Error al banear proveedor" };
    }

    console.log(`[ADMIN] Provider ${providerId} BANNED by ${auth.email}`);

    // TODO: Send notification to provider (Story 6.4 AC6.4.7)

    revalidatePath("/admin/providers");
    return { success: true };
  } catch (err) {
    console.error("[ADMIN] Unexpected error in banProvider:", err);
    return { success: false, error: "Error inesperado al banear proveedor" };
  }
}

/**
 * Update commission rate override for a provider
 * Pass null to reset to default
 */
export async function updateCommissionOverride(
  providerId: string,
  rate: number | null
): Promise<ActionResult> {
  try {
    const auth = await verifyAdminAccess();
    if (!auth.isAdmin) {
      return { success: false, error: auth.error || "Error de autenticación", requiresLogin: auth.requiresLogin };
    }

    // Validate rate if provided
    if (rate !== null) {
      if (isNaN(rate) || rate < 0 || rate > 100) {
        return { success: false, error: "La tasa debe ser entre 0 y 100" };
      }
    }

    const adminClient = createAdminClient();

    // Update commission override
    const { error: updateError } = await adminClient
      .from("profiles")
      .update({
        commission_override: rate,
        updated_at: new Date().toISOString(),
      })
      .eq("id", providerId)
      .in("role", ["supplier", "provider"]);

    if (updateError) {
      console.error("[ADMIN] Error updating commission:", updateError.message);
      return { success: false, error: "Error al actualizar comision" };
    }

    console.log(
      `[ADMIN] Provider ${providerId} commission ${
        rate !== null ? `set to ${rate}%` : "reset to default"
      } by ${auth.email}`
    );

    revalidatePath("/admin/providers");
    return { success: true };
  } catch (err) {
    console.error("[ADMIN] Unexpected error in updateCommissionOverride:", err);
    return { success: false, error: "Error inesperado al actualizar comision" };
  }
}
