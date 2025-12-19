"use server";

import { createClient } from "@/lib/supabase/server";

// Types for the map view
export interface MapRequest {
  id: string;
  latitude: number;
  longitude: number;
  comuna_id: string | null;
  comuna_name: string | null;
  address: string;
  amount: number;
  is_urgent: boolean;
  created_at: string | null;
  offer_count: number;
  // For active deliveries
  status?: string;
  delivery_window?: string | null;
  is_my_delivery?: boolean;
}

export interface ProviderServiceArea {
  comuna_id: string;
  comuna_name: string;
}

export interface MapProviderStatus {
  isVerified: boolean;
  isAvailable: boolean;
  hasServiceAreas: boolean;
}

export interface GetMapDataResult {
  success: boolean;
  requests?: MapRequest[];
  serviceAreas?: ProviderServiceArea[];
  providerStatus?: MapProviderStatus;
  error?: string;
}

/**
 * Get pending water requests with coordinates for the map view
 * AC: 8.10.2, 8.10.3, 8.10.11 - Get requests in provider's service areas with coordinates
 */
export async function getMapData(): Promise<GetMapDataResult> {
  const supabase = await createClient();

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      error: "No autenticado",
    };
  }

  // Get provider profile and verify status
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

  // Check if user is a supplier
  if (profile.role !== "supplier") {
    return {
      success: false,
      error: "Esta funcionalidad es solo para proveedores",
    };
  }

  // Get provider's service areas with comuna names
  // AC: 8.10.2 - Display provider's service areas
  const { data: serviceAreas, error: areasError } = await supabase
    .from("provider_service_areas")
    .select(`
      comuna_id,
      comunas!provider_service_areas_comuna_id_fkey(name)
    `)
    .eq("provider_id", user.id);

  if (areasError) {
    console.error("[Map] Error fetching service areas:", areasError);
    return {
      success: false,
      error: "Error al cargar áreas de servicio",
    };
  }

  const providerStatus: MapProviderStatus = {
    isVerified: profile.verification_status === "approved",
    isAvailable: profile.is_available === true,
    hasServiceAreas: (serviceAreas?.length ?? 0) > 0,
  };

  // Transform service areas
  const formattedServiceAreas: ProviderServiceArea[] = (serviceAreas ?? []).map((sa) => ({
    comuna_id: sa.comuna_id,
    comuna_name: (sa.comunas as { name: string } | null)?.name ?? "",
  }));

  // If provider is not verified or not available, return empty list with status
  if (!providerStatus.isVerified || !providerStatus.isAvailable || !providerStatus.hasServiceAreas) {
    return {
      success: true,
      requests: [],
      serviceAreas: formattedServiceAreas,
      providerStatus,
    };
  }

  const comunaIds = serviceAreas!.map((sa) => sa.comuna_id);

  // Query pending requests with coordinates in provider's service areas
  // AC: 8.10.3 - Only requests in provider's comunas with valid coordinates
  const { data: requests, error: requestsError } = await supabase
    .from("water_requests")
    .select(`
      id,
      latitude,
      longitude,
      comuna_id,
      comunas!water_requests_comuna_id_fkey(name),
      address,
      amount,
      is_urgent,
      created_at
    `)
    .eq("status", "pending")
    .in("comuna_id", comunaIds)
    .not("latitude", "is", null)
    .not("longitude", "is", null)
    .order("is_urgent", { ascending: false })
    .order("created_at", { ascending: false });

  if (requestsError) {
    console.error("[Map] Error fetching requests:", requestsError);
    return {
      success: false,
      error: "Error al cargar solicitudes",
    };
  }

  // Get offer counts for each request
  const requestIds = requests?.map((r) => r.id) ?? [];

  let offerCounts: Record<string, number> = {};

  if (requestIds.length > 0) {
    const { data: offers, error: offersError } = await supabase
      .from("offers")
      .select("request_id")
      .in("request_id", requestIds)
      .eq("status", "active");

    if (!offersError && offers) {
      offerCounts = offers.reduce((acc, offer) => {
        acc[offer.request_id] = (acc[offer.request_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    }
  }

  // Map pending requests to response format
  const pendingMapRequests: MapRequest[] = (requests ?? [])
    .filter((r) => r.latitude !== null && r.longitude !== null)
    .map((r) => ({
      id: r.id,
      latitude: r.latitude as number,
      longitude: r.longitude as number,
      comuna_id: r.comuna_id,
      comuna_name: (r.comunas as { name: string } | null)?.name ?? null,
      address: r.address,
      amount: r.amount,
      is_urgent: r.is_urgent ?? false,
      created_at: r.created_at,
      offer_count: offerCounts[r.id] ?? 0,
      status: "pending",
      is_my_delivery: false,
    }));

  // Also fetch the provider's active deliveries (accepted requests assigned to them)
  // This shows their scheduled/in-progress deliveries on the map
  const { data: myDeliveries, error: deliveriesError } = await supabase
    .from("water_requests")
    .select(`
      id,
      latitude,
      longitude,
      comuna_id,
      comunas!water_requests_comuna_id_fkey(name),
      address,
      amount,
      is_urgent,
      created_at,
      status,
      delivery_window
    `)
    .eq("supplier_id", user.id)
    .in("status", ["accepted", "in_progress"])
    .not("latitude", "is", null)
    .not("longitude", "is", null);

  if (deliveriesError) {
    console.error("[Map] Error fetching my deliveries:", deliveriesError);
    // Continue without deliveries - not a fatal error
  }

  // Map active deliveries
  const deliveryMapRequests: MapRequest[] = (myDeliveries ?? [])
    .filter((r) => r.latitude !== null && r.longitude !== null)
    .map((r) => ({
      id: r.id,
      latitude: r.latitude as number,
      longitude: r.longitude as number,
      comuna_id: r.comuna_id,
      comuna_name: (r.comunas as { name: string } | null)?.name ?? null,
      address: r.address,
      amount: r.amount,
      is_urgent: r.is_urgent ?? false,
      created_at: r.created_at,
      offer_count: 0, // N/A for deliveries
      status: r.status,
      delivery_window: r.delivery_window,
      is_my_delivery: true,
    }));

  // Combine pending requests and active deliveries
  // Deliveries first so they appear on top
  const mapRequests = [...deliveryMapRequests, ...pendingMapRequests];

  return {
    success: true,
    requests: mapRequests,
    serviceAreas: formattedServiceAreas,
    providerStatus,
  };
}
