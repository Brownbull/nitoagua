"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { COMUNAS } from "@/lib/validations/provider-registration";

export interface ServiceAreaWarning {
  comunaId: string;
  comunaName: string;
  pendingCount: number;
}

export interface UpdateServiceAreasResult {
  success: boolean;
  error?: string;
  warnings?: ServiceAreaWarning[];
}

export interface GetServiceAreasResult {
  success: boolean;
  areas?: string[];
  error?: string;
}

export interface ActiveDelivery {
  id: string;
  address: string;
  status: string;
}

export interface ToggleAvailabilityResult {
  success: boolean;
  error?: string;
  needsConfirmation?: boolean;
  activeDeliveries?: ActiveDelivery[];
}

/**
 * Get current service areas for the authenticated provider
 */
export async function getProviderServiceAreas(): Promise<GetServiceAreasResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      error: "No autenticado",
    };
  }

  // Verify user is an approved provider
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, verification_status")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "supplier") {
    return {
      success: false,
      error: "No tienes acceso a esta funcionalidad",
    };
  }

  if (profile.verification_status !== "approved") {
    return {
      success: false,
      error: "Tu cuenta aún no está verificada",
    };
  }

  // Get current service areas
  const { data: areas, error: areasError } = await supabase
    .from("provider_service_areas")
    .select("comuna_id")
    .eq("provider_id", user.id);

  if (areasError) {
    console.error("[Provider Settings] Error fetching service areas:", areasError);
    return {
      success: false,
      error: "Error al cargar áreas de servicio",
    };
  }

  return {
    success: true,
    areas: areas?.map((a) => a.comuna_id) || [],
  };
}

/**
 * Check for pending requests in specific comunas
 */
export async function checkPendingRequestsInAreas(
  comunaIdsToRemove: string[]
): Promise<{ warnings: ServiceAreaWarning[] }> {
  if (comunaIdsToRemove.length === 0) {
    return { warnings: [] };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { warnings: [] };
  }

  // Note: water_requests doesn't have comuna_id - requests are matched to suppliers by address/location
  // For this story, we'll check for pending/accepted requests assigned to this supplier
  // The warning will be general since we can't map requests to specific comunas without location data

  // For V2, we'd want to add comuna_id to water_requests or infer from address
  // For now, we'll warn if there are ANY pending requests when removing areas
  const { data: pendingRequests, error } = await supabase
    .from("water_requests")
    .select("id, status, address")
    .eq("supplier_id", user.id)
    .in("status", ["pending", "accepted", "en_route"]);

  if (error || !pendingRequests || pendingRequests.length === 0) {
    return { warnings: [] };
  }

  // Since we can't map to specific comunas, return a general warning for each area being removed
  const warnings: ServiceAreaWarning[] = comunaIdsToRemove.map((comunaId) => {
    const comuna = COMUNAS.find((c) => c.id === comunaId);
    return {
      comunaId,
      comunaName: comuna?.name || comunaId,
      pendingCount: 0, // Will be set below
    };
  });

  // Set the total pending count on the first warning (we'll display as general warning)
  if (warnings.length > 0 && pendingRequests.length > 0) {
    warnings[0].pendingCount = pendingRequests.length;
  }

  return { warnings: warnings.filter((w) => w.pendingCount > 0) };
}

/**
 * Update service areas for the authenticated provider
 */
export async function updateServiceAreas(
  comunaIds: string[],
  skipWarnings: boolean = false
): Promise<UpdateServiceAreasResult> {
  console.log("[Provider Settings] Updating service areas:", comunaIds);

  // Validate minimum area requirement
  if (!comunaIds || comunaIds.length === 0) {
    return {
      success: false,
      error: "Debes tener al menos una comuna activa",
    };
  }

  // Validate all comunaIds are valid
  const validComunaIds: string[] = COMUNAS.map((c) => c.id);
  const invalidIds = comunaIds.filter((id) => !validComunaIds.includes(id));
  if (invalidIds.length > 0) {
    return {
      success: false,
      error: `Comunas inválidas: ${invalidIds.join(", ")}`,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      error: "No autenticado",
    };
  }

  // Verify user is an approved provider
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, verification_status")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "supplier") {
    return {
      success: false,
      error: "No tienes acceso a esta funcionalidad",
    };
  }

  if (profile.verification_status !== "approved") {
    return {
      success: false,
      error: "Tu cuenta aún no está verificada",
    };
  }

  // Get current service areas to determine what's being removed
  const { data: currentAreas } = await supabase
    .from("provider_service_areas")
    .select("comuna_id")
    .eq("provider_id", user.id);

  const currentComunaIds = currentAreas?.map((a) => a.comuna_id) || [];
  const removedComunaIds = currentComunaIds.filter((id) => !comunaIds.includes(id));

  // Check for pending requests in removed areas (unless user chose to skip)
  if (!skipWarnings && removedComunaIds.length > 0) {
    const { warnings } = await checkPendingRequestsInAreas(removedComunaIds);
    if (warnings.length > 0) {
      return {
        success: false,
        warnings,
      };
    }
  }

  // Use admin client for the update operation
  const adminClient = createAdminClient();

  try {
    // Delete existing areas
    const { error: deleteError } = await adminClient
      .from("provider_service_areas")
      .delete()
      .eq("provider_id", user.id);

    if (deleteError) {
      console.error("[Provider Settings] Error deleting service areas:", deleteError);
      throw new Error("Error al actualizar áreas de servicio");
    }

    // Insert new areas
    const inserts = comunaIds.map((comunaId) => ({
      provider_id: user.id,
      comuna_id: comunaId,
    }));

    const { error: insertError } = await adminClient
      .from("provider_service_areas")
      .insert(inserts);

    if (insertError) {
      console.error("[Provider Settings] Error inserting service areas:", insertError);
      throw new Error("Error al actualizar áreas de servicio");
    }

    console.log("[Provider Settings] Service areas updated successfully");

    // Revalidate dashboard paths
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings/areas");

    return {
      success: true,
    };
  } catch (error) {
    console.error("[Provider Settings] Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error inesperado",
    };
  }
}

/**
 * Toggle provider availability status
 * When turning OFF, checks for active deliveries and requires confirmation if any exist
 */
export async function toggleAvailability(
  isAvailable: boolean,
  skipWarning: boolean = false
): Promise<ToggleAvailabilityResult> {
  console.log("[Provider Settings] Toggle availability:", isAvailable, "skipWarning:", skipWarning);

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      error: "No autenticado",
    };
  }

  // Verify user is an approved provider
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, verification_status, is_available")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return {
      success: false,
      error: "No se pudo obtener el perfil",
    };
  }

  if (profile.role !== "supplier") {
    return {
      success: false,
      error: "No tienes acceso a esta funcionalidad",
    };
  }

  if (profile.verification_status !== "approved") {
    return {
      success: false,
      error: "Tu cuenta aún no está verificada",
    };
  }

  // If turning OFF and not skipping warning, check for in-progress deliveries
  if (!isAvailable && !skipWarning) {
    const { data: activeDeliveries, error: deliveriesError } = await supabase
      .from("water_requests")
      .select("id, status, address")
      .eq("supplier_id", user.id)
      .in("status", ["accepted", "en_route"]);

    if (deliveriesError) {
      console.error("[Provider Settings] Error checking active deliveries:", deliveriesError);
      // Continue without warning - don't block toggle
    } else if (activeDeliveries && activeDeliveries.length > 0) {
      console.log("[Provider Settings] Active deliveries found:", activeDeliveries.length);
      return {
        success: false,
        needsConfirmation: true,
        activeDeliveries: activeDeliveries.map((d) => ({
          id: d.id,
          address: d.address,
          status: d.status,
        })),
      };
    }
  }

  // Update availability
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ is_available: isAvailable })
    .eq("id", user.id);

  if (updateError) {
    console.error("[Provider Settings] Error updating availability:", updateError);
    return {
      success: false,
      error: "Error al actualizar disponibilidad",
    };
  }

  console.log("[Provider Settings] Availability updated successfully to:", isAvailable);

  // Revalidate dashboard path
  revalidatePath("/dashboard");

  return {
    success: true,
  };
}

/**
 * Get current provider availability status
 */
export async function getProviderAvailability(): Promise<{
  success: boolean;
  isAvailable?: boolean;
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      error: "No autenticado",
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_available")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return {
      success: false,
      error: "No se pudo obtener el perfil",
    };
  }

  return {
    success: true,
    isAvailable: profile.is_available ?? false,
  };
}
