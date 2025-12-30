"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { sendProviderVerificationNotification } from "@/lib/email";
import { AUTH_ERROR_MESSAGE, type ActionResult } from "@/lib/types/action-result";

export type VerificationDecision = "approved" | "rejected" | "more_info_needed";

interface VerifyProviderInput {
  providerId: string;
  decision: VerificationDecision;
  reason?: string;
  notes?: string;
  missingDocs?: string[];
}

/**
 * Verify a provider application (approve, reject, or request more info)
 */
export async function verifyProvider(
  input: VerifyProviderInput
): Promise<ActionResult> {
  try {
    // Get current user
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    // AC12.6.2.4: Return requiresLogin flag for auth failures
    if (userError || !user || !user.email) {
      console.error("[VERIFICATION] User not authenticated:", userError?.message);
      return {
        success: false,
        error: AUTH_ERROR_MESSAGE,
        requiresLogin: true,
      };
    }

    // Verify user is admin
    const { data: adminEmail } = await supabase
      .from("admin_allowed_emails")
      .select("email")
      .eq("email", user.email)
      .single();

    if (!adminEmail) {
      console.error("[VERIFICATION] Non-admin attempting to verify:", user.email);
      return {
        success: false,
        error: "No tienes permisos de administrador",
      };
    }

    // Use admin client to update provider
    const adminClient = createAdminClient();

    // Build update data
    const updateData: Record<string, unknown> = {
      verification_status: input.decision,
      updated_at: new Date().toISOString(),
    };

    // Add reason for rejection
    if (input.decision === "rejected" && input.reason) {
      updateData.rejection_reason = input.reason;
    }

    // Add internal notes if provided
    if (input.notes) {
      updateData.internal_notes = input.notes;
    }

    // For more_info_needed, store missing docs in rejection_reason field
    // (We can use this field for both rejection reason and missing docs request)
    if (input.decision === "more_info_needed" && input.missingDocs) {
      const missingDocsMessage = input.missingDocs.join(", ");
      updateData.rejection_reason = input.reason
        ? `${input.reason}\nDocumentos faltantes: ${missingDocsMessage}`
        : `Documentos faltantes: ${missingDocsMessage}`;
    }

    // Update the provider profile
    const { error: updateError } = await adminClient
      .from("profiles")
      .update(updateData)
      .eq("id", input.providerId);

    if (updateError) {
      console.error("[VERIFICATION] Error updating provider:", updateError.message);
      return {
        success: false,
        error: "Error al actualizar el proveedor",
      };
    }

    // Log the action
    const actionLabels = {
      approved: "APPROVED",
      rejected: "REJECTED",
      more_info_needed: "MORE_INFO_REQUESTED",
    };

    console.log(
      `[VERIFICATION] Provider ${input.providerId} ${actionLabels[input.decision]} by ${user.email}` +
        (input.reason ? ` - Reason: ${input.reason}` : "")
    );

    // Send email notification to provider (non-blocking)
    // Fetch provider details for the email
    const { data: provider } = await adminClient
      .from("profiles")
      .select("name, email")
      .eq("id", input.providerId)
      .single();

    if (provider?.email) {
      // Fire and forget - don't await, don't block the response
      sendProviderVerificationNotification({
        email: provider.email,
        providerName: provider.name || "Proveedor",
        status: input.decision,
        rejectionReason: input.reason,
        missingDocuments: input.missingDocs,
      }).catch((err) => {
        console.error("[VERIFICATION] Email notification failed:", err);
      });
    } else {
      console.warn("[VERIFICATION] Cannot send notification - no email for provider:", input.providerId);
    }

    // Revalidate the verification pages
    revalidatePath("/admin/verification");
    revalidatePath(`/admin/verification/${input.providerId}`);

    return {
      success: true,
    };
  } catch (err) {
    console.error("[VERIFICATION] Unexpected error:", err);
    return {
      success: false,
      error: "Error inesperado al procesar la verificacion",
    };
  }
}

/**
 * Get pending provider count for badge display
 */
export async function getPendingProviderCount(): Promise<number> {
  try {
    const adminClient = createAdminClient();

    const { count, error } = await adminClient
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .in("role", ["supplier", "provider"])
      .in("verification_status", ["pending", "more_info_needed"]);

    if (error) {
      console.error("[VERIFICATION] Error counting pending:", error.message);
      return 0;
    }

    return count || 0;
  } catch (err) {
    console.error("[VERIFICATION] Unexpected error counting:", err);
    return 0;
  }
}
