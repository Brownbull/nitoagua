"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { ActionResult, createAuthError } from "@/lib/types/action-result";

/**
 * Rating interface matching database schema
 * Story 12.7-13: Rating/Review System
 */
export interface Rating {
  id: string;
  request_id: string | null;
  consumer_id: string | null;
  provider_id: string | null;
  rating: number;
  comment: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface SubmitRatingInput {
  request_id: string;
  rating: number;
  comment?: string;
}

export interface SubmitRatingResult {
  ratingId: string;
  isUpdate: boolean;
}

/**
 * Submit or update a rating for a completed delivery
 *
 * AC12.7.13.2: 5-star rating system
 * AC12.7.13.3: Optional comment (max 500 chars)
 * AC12.7.13.5: Rating storage linked to delivery
 *
 * @param input - Rating details (request_id, rating 1-5, optional comment)
 */
export async function submitRating(
  input: SubmitRatingInput
): Promise<ActionResult<SubmitRatingResult>> {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return createAuthError();
    }

    // Validate rating value
    if (input.rating < 1 || input.rating > 5 || !Number.isInteger(input.rating)) {
      return {
        success: false,
        error: "La calificación debe ser un número entre 1 y 5",
      };
    }

    // Validate comment length
    if (input.comment && input.comment.length > 500) {
      return {
        success: false,
        error: "El comentario no puede exceder 500 caracteres",
      };
    }

    // Get request to verify ownership and status
    const { data: request, error: requestError } = await supabase
      .from("water_requests")
      .select("id, status, consumer_id, supplier_id")
      .eq("id", input.request_id)
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
        error: "No tienes permiso para calificar esta solicitud",
      };
    }

    // Verify request is delivered
    if (request.status !== "delivered") {
      return {
        success: false,
        error: "Solo puedes calificar solicitudes entregadas",
      };
    }

    // Verify provider exists
    if (!request.supplier_id) {
      return {
        success: false,
        error: "La solicitud no tiene un proveedor asignado",
      };
    }

    // Check if rating already exists
    const { data: existingRating } = await supabase
      .from("ratings")
      .select("id")
      .eq("request_id", input.request_id)
      .eq("consumer_id", user.id)
      .limit(1);

    const isUpdate = !!(existingRating && existingRating.length > 0);
    let ratingId: string;

    if (isUpdate) {
      // Update existing rating
      const { data: updated, error: updateError } = await adminClient
        .from("ratings")
        .update({
          rating: input.rating,
          comment: input.comment?.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingRating[0].id)
        .select("id")
        .single();

      if (updateError) {
        console.error("[Ratings] Update error:", updateError);
        return {
          success: false,
          error: "Error al actualizar la calificación",
        };
      }

      ratingId = updated.id;
    } else {
      // Insert new rating
      const { data: inserted, error: insertError } = await adminClient
        .from("ratings")
        .insert({
          request_id: input.request_id,
          consumer_id: user.id,
          provider_id: request.supplier_id,
          rating: input.rating,
          comment: input.comment?.trim() || null,
        })
        .select("id")
        .single();

      if (insertError) {
        console.error("[Ratings] Insert error:", insertError);

        // Check for unique constraint violation
        if (insertError.code === "23505") {
          return {
            success: false,
            error: "Ya existe una calificación para esta solicitud",
          };
        }

        return {
          success: false,
          error: "Error al guardar la calificación",
        };
      }

      ratingId = inserted.id;
    }

    // Revalidate relevant paths
    try {
      revalidatePath(`/request/${input.request_id}`);
    } catch (err) {
      console.warn("[Ratings] revalidatePath error (non-fatal):", err);
    }

    console.log(
      `[Ratings] ${isUpdate ? "Updated" : "Created"}: rating=${input.rating}, request=${input.request_id}, consumer=${user.id}`
    );

    return {
      success: true,
      data: { ratingId, isUpdate },
    };
  } catch (err) {
    console.error("[Ratings] Unexpected error in submitRating:", err);
    return {
      success: false,
      error: "Error inesperado al guardar la calificación",
    };
  }
}

/**
 * Get the rating for a specific request (if exists)
 *
 * Used to check if consumer has already rated a delivery
 */
export async function getRatingByRequest(
  requestId: string
): Promise<ActionResult<Rating | null>> {
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

    // Get rating (RLS will filter)
    const { data: rating, error } = await supabase
      .from("ratings")
      .select("*")
      .eq("request_id", requestId)
      .eq("consumer_id", user.id)
      .limit(1);

    if (error) {
      console.error("[Ratings] Get error:", error);
      return {
        success: false,
        error: "Error al obtener la calificación",
      };
    }

    return {
      success: true,
      data: rating && rating.length > 0 ? (rating[0] as Rating) : null,
    };
  } catch (err) {
    console.error("[Ratings] Unexpected error in getRatingByRequest:", err);
    return {
      success: false,
      error: "Error al obtener la calificación",
    };
  }
}

/**
 * Get provider rating info (average and count)
 *
 * AC12.7.13.4: Provider profile shows average rating
 */
export async function getProviderRating(
  providerId: string
): Promise<ActionResult<{ averageRating: number | null; ratingCount: number }>> {
  try {
    const supabase = await createClient();

    // Get provider profile with rating fields
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("average_rating, rating_count")
      .eq("id", providerId)
      .single();

    if (error) {
      // Provider not found or not accessible
      if (error.code === "PGRST116") {
        return {
          success: true,
          data: { averageRating: null, ratingCount: 0 },
        };
      }
      console.error("[Ratings] Get provider rating error:", error);
      return {
        success: false,
        error: "Error al obtener la calificación del proveedor",
      };
    }

    return {
      success: true,
      data: {
        averageRating: profile.average_rating ? Number(profile.average_rating) : null,
        ratingCount: profile.rating_count || 0,
      },
    };
  } catch (err) {
    console.error("[Ratings] Unexpected error in getProviderRating:", err);
    return {
      success: false,
      error: "Error al obtener la calificación del proveedor",
    };
  }
}
