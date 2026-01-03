"use server";

import { requireAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ActionResult } from "@/lib/types/action-result";
import { revalidatePath } from "next/cache";
import {
  DISPUTE_TYPE_LABELS,
  RESOLVABLE_STATUSES,
  type ResolutionType,
} from "@/lib/utils/dispute-constants";
import { triggerDisputeResolvedPush } from "@/lib/push/trigger-push";

// Re-export the type for use by components
export type { ResolutionType } from "@/lib/utils/dispute-constants";

interface ResolveDisputeInput {
  disputeId: string;
  resolution: ResolutionType;
  notes: string;
}

/**
 * Resolve a dispute in favor of consumer or provider
 * - Updates dispute status to resolved_consumer or resolved_provider
 * - Sets resolution_notes, resolved_by, and resolved_at
 * - Creates notifications for both consumer and provider
 */
export async function resolveDispute(
  input: ResolveDisputeInput
): Promise<ActionResult<{ disputeId: string }>> {
  const { disputeId, resolution, notes } = input;

  // Validate admin access
  const admin = await requireAdmin();

  // Validate input
  if (!disputeId) {
    return { success: false, error: "Dispute ID is required" };
  }
  if (!resolution || !["resolved_consumer", "resolved_provider"].includes(resolution)) {
    return { success: false, error: "Invalid resolution type" };
  }
  if (!notes || notes.trim().length === 0) {
    return { success: false, error: "Resolution notes are required" };
  }

  const adminClient = createAdminClient();

  // First, get the dispute to verify it exists and is resolvable
  const { data: dispute, error: fetchError } = await adminClient
    .from("disputes")
    .select("id, status, consumer_id, provider_id, dispute_type, request_id")
    .eq("id", disputeId)
    .single();

  if (fetchError || !dispute) {
    console.error("[ADMIN-DISPUTES] Error fetching dispute:", fetchError?.message);
    return { success: false, error: "Dispute not found" };
  }

  // Check if dispute can be resolved
  if (!RESOLVABLE_STATUSES.includes(dispute.status as typeof RESOLVABLE_STATUSES[number])) {
    return { success: false, error: "Dispute has already been resolved" };
  }

  const resolvedAt = new Date().toISOString();

  // Update the dispute status
  const { error: updateError } = await adminClient
    .from("disputes")
    .update({
      status: resolution,
      resolution_notes: notes.trim(),
      resolved_by: admin.id,
      resolved_at: resolvedAt,
    })
    .eq("id", disputeId);

  if (updateError) {
    console.error("[ADMIN-DISPUTES] Error updating dispute:", updateError.message);
    return { success: false, error: "Failed to resolve dispute" };
  }

  // Prepare notification messages using shared constants
  const disputeTypeLabel = DISPUTE_TYPE_LABELS[dispute.dispute_type] || dispute.dispute_type;

  const consumerMessage =
    resolution === "resolved_consumer"
      ? `Tu disputa "${disputeTypeLabel}" fue resuelta a tu favor.`
      : `Tu disputa "${disputeTypeLabel}" fue revisada. El proveedor fue exonerado.`;

  const providerMessage =
    resolution === "resolved_provider"
      ? `La disputa "${disputeTypeLabel}" fue resuelta a tu favor.`
      : `La disputa "${disputeTypeLabel}" fue resuelta a favor del consumidor.`;

  // Create notifications for both parties
  const notifications = [
    {
      user_id: dispute.consumer_id,
      type: "dispute_resolved",
      title: "Disputa Resuelta",
      message: consumerMessage,
      data: {
        dispute_id: disputeId,
        request_id: dispute.request_id,
        resolution,
      },
    },
    {
      user_id: dispute.provider_id,
      type: "dispute_resolved",
      title: "Disputa Resuelta",
      message: providerMessage,
      data: {
        dispute_id: disputeId,
        request_id: dispute.request_id,
        resolution,
      },
    },
  ];

  const { error: notifyError } = await adminClient.from("notifications").insert(notifications);

  if (notifyError) {
    // Log but don't fail - dispute is already resolved
    console.error("[ADMIN-DISPUTES] Error creating notifications:", notifyError.message);
  }

  // Send push notifications to both consumer and provider
  try {
    await Promise.all([
      triggerDisputeResolvedPush(
        dispute.consumer_id,
        dispute.request_id,
        consumerMessage,
        false // isProvider = false
      ),
      triggerDisputeResolvedPush(
        dispute.provider_id,
        dispute.request_id,
        providerMessage,
        true // isProvider = true
      ),
    ]);
  } catch (pushError) {
    // Log but don't fail - dispute is already resolved
    console.error("[ADMIN-DISPUTES] Error sending push notifications:", pushError);
  }

  console.log(
    `[ADMIN-DISPUTES] Dispute ${disputeId} resolved as ${resolution} by ${admin.email}`
  );

  // Revalidate the disputes pages
  revalidatePath("/admin/disputes");
  revalidatePath(`/admin/disputes/${disputeId}`);

  return { success: true, data: { disputeId } };
}
