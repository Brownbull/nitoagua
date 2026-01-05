"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { ActionResult, createAuthError } from "@/lib/types/action-result";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Safe admin client creator that returns null if env vars are missing
 * instead of throwing an error
 */
function createAdminClientSafe() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.warn("[Disputes] Admin client not available - missing env vars");
    return null;
  }

  return createSupabaseClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Dispute types - must match database CHECK constraint
export type DisputeType =
  | "not_delivered"
  | "wrong_quantity"
  | "late_delivery"
  | "quality_issue"
  | "other";

// Dispute status - must match database CHECK constraint
export type DisputeStatus =
  | "open"
  | "under_review"
  | "resolved_consumer"
  | "resolved_provider"
  | "closed";

// Display labels for dispute types (Spanish)
export const DISPUTE_TYPE_LABELS: Record<DisputeType, string> = {
  not_delivered: "No recibí mi pedido",
  wrong_quantity: "Cantidad incorrecta",
  late_delivery: "Llegó tarde",
  quality_issue: "Mala calidad",
  other: "Otro problema",
};

// Display labels for dispute status (Spanish)
export const DISPUTE_STATUS_LABELS: Record<DisputeStatus, string> = {
  open: "Abierta",
  under_review: "En revisión",
  resolved_consumer: "Resuelta (a tu favor)",
  resolved_provider: "Resuelta (a favor del proveedor)",
  closed: "Cerrada",
};

export interface Dispute {
  id: string;
  request_id: string;
  consumer_id: string;
  provider_id: string;
  dispute_type: DisputeType;
  description: string | null;
  evidence_url: string | null;
  status: DisputeStatus;
  resolution_notes: string | null;
  resolved_by: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface CreateDisputeInput {
  request_id: string;
  dispute_type: DisputeType;
  description?: string;
}

export interface CreateDisputeResult {
  disputeId: string;
}

/**
 * Check if a consumer can file a dispute for a request
 * - Request must be delivered
 * - Must be within the dispute window (default 48 hours)
 * - Must not already have a dispute
 *
 * AC12.7.5.1: Dispute option visibility rules
 */
export async function canFileDispute(
  requestId: string
): Promise<ActionResult<{ canFile: boolean; reason?: string }>> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return createAuthError();
    }

  // Get the request details
  const { data: request, error: requestError } = await supabase
    .from("water_requests")
    .select("id, status, delivered_at, consumer_id, supplier_id")
    .eq("id", requestId)
    .single();

  if (requestError || !request) {
    return {
      success: false,
      error: "Solicitud no encontrada",
    };
  }

  // Verify ownership
  if (request.consumer_id !== user.id) {
    return {
      success: false,
      error: "No tienes permiso para disputar esta solicitud",
    };
  }

  // Check if already delivered
  if (request.status !== "delivered") {
    return {
      success: true,
      data: {
        canFile: false,
        reason: "Solo puedes disputar solicitudes entregadas",
      },
    };
  }

  // Check if dispute already exists - use .limit(1) to avoid 406 error when no rows
  // Per Atlas Section 6: .single() returns 406 when no rows exist
  const { data: existingDisputeArray } = await supabase
    .from("disputes")
    .select("id")
    .eq("request_id", requestId)
    .limit(1);

  if (existingDisputeArray && existingDisputeArray.length > 0) {
    return {
      success: true,
      data: {
        canFile: false,
        reason: "Ya existe una disputa para esta solicitud",
      },
    };
  }

  // Get dispute window setting - use default if not accessible
  // Note: admin_settings may require admin access, so we use a default
  let disputeWindowHours = 48; // Default 48 hours
  const adminClient = createAdminClientSafe();
  if (adminClient) {
    try {
      const { data: setting } = await adminClient
        .from("admin_settings")
        .select("value")
        .eq("key", "dispute_window_hours")
        .single();
      if (setting?.value) {
        disputeWindowHours = Number(setting.value);
      }
    } catch (err) {
      // Error fetching setting, use default
      console.warn("[Disputes] Could not fetch dispute_window_hours, using default:", err);
    }
  }

  // Check if within dispute window
  if (request.delivered_at) {
    const deliveredAt = new Date(request.delivered_at);
    const windowEnd = new Date(
      deliveredAt.getTime() + disputeWindowHours * 60 * 60 * 1000
    );
    const now = new Date();

    if (now > windowEnd) {
      return {
        success: true,
        data: {
          canFile: false,
          reason: `El plazo para disputar ha expirado (${disputeWindowHours} horas después de la entrega)`,
        },
      };
    }
  }

  return {
    success: true,
    data: { canFile: true },
  };
  } catch (err) {
    console.error("[Disputes] Unexpected error in canFileDispute:", err);
    // On error, allow filing - the create action will validate
    return {
      success: true,
      data: { canFile: true },
    };
  }
}

/**
 * Create a new dispute for a delivered request
 *
 * AC12.7.5.2: Dispute types
 * AC12.7.5.3: Dispute submission
 * AC12.7.5.4: Status updates
 * AC12.7.5.5: Database schema
 */
export async function createDispute(
  input: CreateDisputeInput
): Promise<ActionResult<CreateDisputeResult>> {
  try {
    const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return createAuthError();
  }

  // Validate dispute type
  const validTypes: DisputeType[] = [
    "not_delivered",
    "wrong_quantity",
    "late_delivery",
    "quality_issue",
    "other",
  ];
  if (!validTypes.includes(input.dispute_type)) {
    return {
      success: false,
      error: "Tipo de disputa inválido",
    };
  }

  // Check if can file dispute
  const canFileResult = await canFileDispute(input.request_id);
  if (!canFileResult.success) {
    return canFileResult;
  }
  if (!canFileResult.data?.canFile) {
    return {
      success: false,
      error: canFileResult.data?.reason || "No puedes disputar esta solicitud",
    };
  }

  // Get request to get provider_id
  const { data: request, error: requestError } = await supabase
    .from("water_requests")
    .select("supplier_id, consumer_id")
    .eq("id", input.request_id)
    .single();

  if (requestError || !request) {
    return {
      success: false,
      error: "Solicitud no encontrada",
    };
  }

  if (!request.supplier_id) {
    return {
      success: false,
      error: "La solicitud no tiene un proveedor asignado",
    };
  }

  // Use admin client to bypass RLS for insert (we've already validated ownership)
  const adminClientForInsert = createAdminClientSafe();
  if (!adminClientForInsert) {
    console.error("[Disputes] Admin client not available for insert");
    return {
      success: false,
      error: "Error de configuración del servidor. Por favor contacta soporte.",
    };
  }

  // Create the dispute
  const { data: dispute, error: insertError } = await adminClientForInsert
    .from("disputes")
    .insert({
      request_id: input.request_id,
      consumer_id: user.id,
      provider_id: request.supplier_id,
      dispute_type: input.dispute_type,
      description: input.description?.trim() || null,
      status: "open",
    })
    .select("id")
    .single();

  if (insertError) {
    console.error("[Disputes] Insert error:", insertError);

    // Check for unique constraint violation (already has dispute)
    if (insertError.code === "23505") {
      return {
        success: false,
        error: "Ya existe una disputa para esta solicitud",
      };
    }

    return {
      success: false,
      error: "Error al crear la disputa",
    };
  }

  // Revalidate the request page - wrapped in try-catch as it can throw in certain contexts
  try {
    revalidatePath(`/request/${input.request_id}`);
  } catch (revalidateErr) {
    // Log but don't fail the action - the dispute was created successfully
    console.warn("[Disputes] revalidatePath error (non-fatal):", revalidateErr);
  }

  // Send notification to admin users about the new dispute
  try {
    await notifyAdminsOfNewDispute(
      adminClientForInsert,
      dispute.id,
      input.request_id,
      input.dispute_type
    );
  } catch (notifyErr) {
    // Log but don't fail - dispute was created successfully
    console.warn("[Disputes] Admin notification error (non-fatal):", notifyErr);
  }

  return {
    success: true,
    data: { disputeId: dispute.id },
  };
  } catch (err) {
    console.error("[Disputes] Unexpected error in createDispute:", err);
    return {
      success: false,
      error: "Error inesperado al crear la disputa. Por favor intenta de nuevo.",
    };
  }
}

/**
 * Get a dispute for a specific request (if exists)
 */
export async function getDisputeForRequest(
  requestId: string
): Promise<ActionResult<Dispute | null>> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return createAuthError();
    }

    // Get dispute (RLS will ensure user can only see their own)
    const { data: dispute, error } = await supabase
      .from("disputes")
      .select("*")
      .eq("request_id", requestId)
      .single();

    if (error) {
      // No dispute found is not an error
      if (error.code === "PGRST116") {
        return {
          success: true,
          data: null,
        };
      }
      console.error("[Disputes] Get error:", error);
      return {
        success: false,
        error: "Error al obtener la disputa",
      };
    }

    return {
      success: true,
      data: dispute as Dispute,
    };
  } catch (err) {
    console.error("[Disputes] Unexpected error in getDisputeForRequest:", err);
    return {
      success: false,
      error: "Error al obtener la disputa",
    };
  }
}

/**
 * Helper function to notify admin users when a new dispute is created
 * Creates in-app notifications for all admin users
 */
async function notifyAdminsOfNewDispute(
  adminClient: ReturnType<typeof createAdminClientSafe>,
  disputeId: string,
  requestId: string,
  disputeType: DisputeType
): Promise<void> {
  if (!adminClient) {
    console.warn("[Disputes] Cannot notify admins - admin client not available");
    return;
  }

  // Get admin users
  const { data: adminEmails } = await adminClient
    .from("admin_allowed_emails")
    .select("email");

  if (!adminEmails || adminEmails.length === 0) {
    console.log("[Disputes] No admin emails found to notify");
    return;
  }

  const { data: adminProfiles } = await adminClient
    .from("profiles")
    .select("id")
    .in("email", adminEmails.map((a) => a.email));

  if (!adminProfiles || adminProfiles.length === 0) {
    console.log("[Disputes] No admin profiles found to notify");
    return;
  }

  // Prepare notification messages
  const disputeTypeLabel = DISPUTE_TYPE_LABELS[disputeType] || disputeType;
  const shortRequestId = requestId.slice(0, 8);

  // Create notifications for all admins
  const notifications = adminProfiles.map((admin) => ({
    user_id: admin.id,
    type: "dispute_created",
    title: "Nueva Disputa Reportada",
    message: `Disputa "${disputeTypeLabel}" para pedido #${shortRequestId}. Requiere revisión.`,
    data: {
      dispute_id: disputeId,
      request_id: requestId,
      dispute_type: disputeType,
    },
  }));

  const { error: insertError } = await adminClient
    .from("notifications")
    .insert(notifications);

  if (insertError) {
    console.error("[Disputes] Error creating admin notifications:", insertError.message);
  } else {
    console.log(`[Disputes] Notified ${adminProfiles.length} admin(s) about dispute ${disputeId}`);
  }
}
