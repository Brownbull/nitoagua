"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { sendOfferAcceptedEmail } from "@/lib/email/send-provider-offer-notification";
import {
  triggerOfferAcceptedPush,
  triggerNewOfferPush,
  triggerRequestFilledPush,
} from "@/lib/push/trigger-push";
import { createAuthError } from "@/lib/types/action-result";

// Types for the request browser
export interface AvailableRequest {
  id: string;
  comuna_id: string | null;
  comuna_name: string | null;
  amount: number;
  is_urgent: boolean;
  payment_method: "cash" | "transfer";
  created_at: string | null;
  offer_count: number;
}

export interface ProviderStatus {
  isVerified: boolean;
  isAvailable: boolean;
  hasServiceAreas: boolean;
}

export interface GetAvailableRequestsResult {
  success: boolean;
  requests?: AvailableRequest[];
  providerStatus?: ProviderStatus;
  error?: string;
}

/**
 * Get pending water requests available in the provider's service areas
 * Requires: provider must be verified (verification_status = 'approved')
 * Returns: pending requests sorted by urgency first, then by newest
 * AC: 8.1.1, 8.1.3
 */
export async function getAvailableRequests(): Promise<GetAvailableRequestsResult> {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  // AC12.6.2.3: Return requiresLogin flag for auth failures
  if (userError || !user) {
    return createAuthError();
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

  // Get provider's service areas
  const { data: serviceAreas, error: areasError } = await supabase
    .from("provider_service_areas")
    .select("comuna_id")
    .eq("provider_id", user.id);

  if (areasError) {
    console.error("[Offers] Error fetching service areas:", areasError);
    return {
      success: false,
      error: "Error al cargar áreas de servicio",
    };
  }

  const providerStatus: ProviderStatus = {
    isVerified: profile.verification_status === "approved",
    isAvailable: profile.is_available === true,
    hasServiceAreas: (serviceAreas?.length ?? 0) > 0,
  };

  // If provider is not verified, return empty list with status
  // AC: 8.1.1 - must be verified
  if (!providerStatus.isVerified) {
    return {
      success: true,
      requests: [],
      providerStatus,
    };
  }

  // If provider is not available, return empty list with status
  // AC: 8.1.6 - unavailable provider sees empty state
  if (!providerStatus.isAvailable) {
    return {
      success: true,
      requests: [],
      providerStatus,
    };
  }

  // If provider has no service areas configured
  if (!providerStatus.hasServiceAreas) {
    return {
      success: true,
      requests: [],
      providerStatus,
    };
  }

  const comunaIds = serviceAreas!.map((sa) => sa.comuna_id);

  // Query pending requests in provider's service areas
  // AC: 8.1.1 - only pending requests in service areas
  // AC: 8.1.3 - sorted by urgency first, then by time (newest first)
  const { data: requests, error: requestsError } = await supabase
    .from("water_requests")
    .select(`
      id,
      comuna_id,
      comunas!water_requests_comuna_id_fkey(name),
      amount,
      is_urgent,
      payment_method,
      created_at
    `)
    .eq("status", "pending")
    .in("comuna_id", comunaIds)
    .order("is_urgent", { ascending: false })
    .order("created_at", { ascending: false });

  if (requestsError) {
    console.error("[Offers] Error fetching requests:", requestsError);
    return {
      success: false,
      error: "Error al cargar solicitudes",
    };
  }

  // Get offer counts for each request
  // AC: 8.1.2 - display offer count
  const requestIds = requests?.map((r) => r.id) ?? [];

  let offerCounts: Record<string, number> = {};

  if (requestIds.length > 0) {
    // Use admin client to bypass RLS on offers table
    const { data: offers, error: offersError } = await adminClient
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

  // Map to response format
  const availableRequests: AvailableRequest[] = (requests ?? []).map((r) => ({
    id: r.id,
    comuna_id: r.comuna_id,
    comuna_name: (r.comunas as { name: string } | null)?.name ?? null,
    amount: r.amount,
    is_urgent: r.is_urgent ?? false,
    payment_method: (r.payment_method as "cash" | "transfer") ?? "cash",
    created_at: r.created_at,
    offer_count: offerCounts[r.id] ?? 0,
  }));

  return {
    success: true,
    requests: availableRequests,
    providerStatus,
  };
}

/**
 * Get provider profile status for request browser
 * Used to check if provider can view requests
 */
export async function getProviderBrowserStatus(): Promise<{
  success: boolean;
  status?: ProviderStatus;
  error?: string;
}> {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  // AC12.6.2.3: Return requiresLogin flag for auth failures
  if (userError || !user) {
    return createAuthError();
  }

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
      error: "Esta funcionalidad es solo para proveedores",
    };
  }

  const { data: serviceAreas } = await supabase
    .from("provider_service_areas")
    .select("comuna_id")
    .eq("provider_id", user.id);

  return {
    success: true,
    status: {
      isVerified: profile.verification_status === "approved",
      isAvailable: profile.is_available === true,
      hasServiceAreas: (serviceAreas?.length ?? 0) > 0,
    },
  };
}

// Types for request detail view
export interface RequestDetail {
  id: string;
  consumer_id: string | null;
  guest_name: string | null;
  comuna_id: string | null;
  comuna_name: string | null;
  address: string;
  amount: number;
  is_urgent: boolean;
  payment_method: "cash" | "transfer";
  special_instructions: string | null;
  created_at: string | null;
  status: string;
  offer_count: number;
  provider_has_offer: boolean;
  existing_offer_id: string | null;
}

export interface GetRequestDetailResult {
  success: boolean;
  request?: RequestDetail;
  error?: string;
}

/**
 * Get detailed information about a specific request
 * AC: 8.2.1 - Display full request info for offer submission
 * AC: 8.2.8 - Check if provider already has offer on this request
 */
export async function getRequestDetail(requestId: string): Promise<GetRequestDetailResult> {
  const supabase = await createClient();

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  // AC12.6.2.3: Return requiresLogin flag for auth failures
  if (userError || !user) {
    return createAuthError();
  }

  // Get provider profile and verify status
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, verification_status")
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
      error: "Esta funcionalidad es solo para proveedores",
    };
  }

  if (profile.verification_status !== "approved") {
    return {
      success: false,
      error: "Tu cuenta debe estar verificada para ver solicitudes",
    };
  }

  // Get request details with comuna name
  const { data: request, error: requestError } = await supabase
    .from("water_requests")
    .select(`
      id,
      consumer_id,
      guest_name,
      comuna_id,
      comunas!water_requests_comuna_id_fkey(name),
      address,
      amount,
      is_urgent,
      payment_method,
      special_instructions,
      created_at,
      status
    `)
    .eq("id", requestId)
    .single();

  if (requestError || !request) {
    console.error("[Offers] Error fetching request detail:", requestError);
    return {
      success: false,
      error: "Solicitud no encontrada",
    };
  }

  // Check if request is still pending
  if (request.status !== "pending") {
    return {
      success: false,
      error: "Esta solicitud ya no está disponible",
    };
  }

  // Get offer count and check if provider already has an offer
  const { data: offerData } = await supabase
    .from("offers")
    .select("id, provider_id")
    .eq("request_id", requestId)
    .eq("status", "active");

  const offerCount = offerData?.length ?? 0;
  const existingOffer = offerData?.find(o => o.provider_id === user.id);

  return {
    success: true,
    request: {
      id: request.id,
      consumer_id: request.consumer_id,
      guest_name: request.guest_name,
      comuna_id: request.comuna_id,
      comuna_name: (request.comunas as { name: string } | null)?.name ?? null,
      address: request.address,
      amount: request.amount,
      is_urgent: request.is_urgent ?? false,
      payment_method: (request.payment_method as "cash" | "transfer") ?? "cash",
      special_instructions: request.special_instructions,
      created_at: request.created_at,
      status: request.status,
      offer_count: offerCount,
      provider_has_offer: !!existingOffer,
      existing_offer_id: existingOffer?.id ?? null,
    },
  };
}

// Types for offer creation
export interface OfferFormData {
  delivery_window_start: string;
  delivery_window_end: string;
  message?: string;
}

export interface CreateOfferResult {
  success: boolean;
  offerId?: string;
  error?: string;
  isDuplicate?: boolean;
}

// Types for platform settings needed for offers
export interface OfferPlatformSettings {
  offer_validity_minutes: number;
  commission_percent: number;
  price: number;
  urgency_surcharge_percent: number;
}

/**
 * Get platform settings needed for offer submission
 * AC: 8.2.2 - Price from platform settings
 * AC: 8.2.3 - Commission for earnings preview
 * AC: 8.2.5 - Offer validity duration
 */
export async function getOfferSettings(amount: number, isUrgent: boolean): Promise<{
  success: boolean;
  settings?: OfferPlatformSettings;
  error?: string;
}> {
  const adminClient = createAdminClient();

  // Fetch relevant settings
  const { data: settings, error } = await adminClient
    .from("admin_settings")
    .select("key, value");

  if (error) {
    console.error("[Offers] Error fetching settings:", error);
    return {
      success: false,
      error: "Error al cargar configuración",
    };
  }

  // Build settings map
  const settingsMap: Record<string, number> = {};
  for (const setting of settings || []) {
    const value = typeof setting.value === "object" && setting.value !== null
      ? (setting.value as { value: number }).value
      : setting.value as number;
    settingsMap[setting.key] = value;
  }

  // Determine price based on amount
  let basePrice = 0;
  if (amount <= 100) {
    basePrice = settingsMap.price_100l ?? 5000;
  } else if (amount <= 1000) {
    basePrice = settingsMap.price_1000l ?? 20000;
  } else if (amount <= 5000) {
    basePrice = settingsMap.price_5000l ?? 75000;
  } else {
    basePrice = settingsMap.price_10000l ?? 140000;
  }

  // Apply urgency surcharge if applicable
  const urgencySurchargePercent = settingsMap.urgency_surcharge_percent ?? 10;
  const price = isUrgent
    ? Math.round(basePrice * (1 + urgencySurchargePercent / 100))
    : basePrice;

  return {
    success: true,
    settings: {
      offer_validity_minutes: settingsMap.offer_validity_default ?? 30,
      commission_percent: settingsMap.default_commission_percent ?? 15,
      price,
      urgency_surcharge_percent: urgencySurchargePercent,
    },
  };
}

/**
 * Create a new offer on a request
 * AC: 8.2.6 - Create offer with status 'active', expires_at calculated
 * AC: 8.2.8 - Prevent duplicate offers (UNIQUE constraint)
 */
export async function createOffer(
  requestId: string,
  data: OfferFormData
): Promise<CreateOfferResult> {
  const supabase = await createClient();

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  // AC12.6.2.3: Return requiresLogin flag for auth failures
  if (userError || !user) {
    return createAuthError();
  }

  // Verify provider is approved
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, verification_status, is_available")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "supplier") {
    return {
      success: false,
      error: "Esta funcionalidad es solo para proveedores",
    };
  }

  if (profile.verification_status !== "approved") {
    return {
      success: false,
      error: "Tu cuenta debe estar verificada para enviar ofertas",
    };
  }

  if (!profile.is_available) {
    return {
      success: false,
      error: "Debes estar disponible para enviar ofertas",
    };
  }

  // Validate delivery window
  const startTime = new Date(data.delivery_window_start);
  const endTime = new Date(data.delivery_window_end);
  const now = new Date();

  if (startTime <= now) {
    return {
      success: false,
      error: "La hora de inicio debe ser en el futuro",
    };
  }

  if (endTime <= startTime) {
    return {
      success: false,
      error: "La hora de fin debe ser después de la hora de inicio",
    };
  }

  // Validate message length (server-side validation)
  const MAX_MESSAGE_LENGTH = 500;
  if (data.message && data.message.length > MAX_MESSAGE_LENGTH) {
    return {
      success: false,
      error: `El mensaje no puede exceder ${MAX_MESSAGE_LENGTH} caracteres`,
    };
  }

  // Verify request exists and is pending
  const { data: request, error: requestError } = await supabase
    .from("water_requests")
    .select("id, status, consumer_id, guest_name, amount")
    .eq("id", requestId)
    .single();

  if (requestError || !request) {
    return {
      success: false,
      error: "Solicitud no encontrada",
    };
  }

  if (request.status !== "pending") {
    return {
      success: false,
      error: "Esta solicitud ya no está disponible",
    };
  }

  // Get offer validity from settings
  const adminClient = createAdminClient();
  const { data: settingsData } = await adminClient
    .from("admin_settings")
    .select("key, value")
    .eq("key", "offer_validity_default")
    .single();

  const validityMinutes = settingsData?.value
    ? typeof settingsData.value === "object"
      ? (settingsData.value as { value: number }).value
      : settingsData.value as number
    : 30;

  // Calculate expires_at
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + validityMinutes);

  // Insert offer (UNIQUE constraint will handle duplicates)
  const { data: offer, error: insertError } = await supabase
    .from("offers")
    .insert({
      request_id: requestId,
      provider_id: user.id,
      delivery_window_start: data.delivery_window_start,
      delivery_window_end: data.delivery_window_end,
      message: data.message || null,
      expires_at: expiresAt.toISOString(),
      status: "active",
    })
    .select("id")
    .single();

  if (insertError) {
    console.error("[Offers] Error creating offer:", insertError);

    // Check for unique constraint violation
    if (insertError.code === "23505") {
      return {
        success: false,
        error: "Ya enviaste una oferta para esta solicitud",
        isDuplicate: true,
      };
    }

    // Check for RLS policy violation (most common issue)
    if (insertError.code === "42501") {
      return {
        success: false,
        error: "No tienes permiso para crear ofertas. Verifica que tu cuenta esté verificada.",
      };
    }

    return {
      success: false,
      error: `Error al crear la oferta: ${insertError.message || insertError.code}`,
    };
  }

  // Create notification for consumer (if registered user)
  if (request.consumer_id) {
    await supabase
      .from("notifications")
      .insert({
        user_id: request.consumer_id,
        type: "new_offer",
        title: "Nueva oferta recibida",
        message: `Un proveedor ha enviado una oferta para tu solicitud de ${request.amount} litros`,
        data: { offer_id: offer.id, request_id: requestId },
      });

    // AC12.6.7: Send push notification for new offer
    // Note: offerCount is approximate (this offer just added)
    triggerNewOfferPush(request.consumer_id, requestId, request.amount, 1).catch(
      (err) => console.error("[Offers] Push notification error:", err)
    );
  }

  // Revalidate relevant paths
  revalidatePath("/provider/requests");
  revalidatePath(`/provider/requests/${requestId}`);
  revalidatePath("/provider/offers");

  return {
    success: true,
    offerId: offer.id,
  };
}

/**
 * Check if provider already has an offer on a request
 * Used for duplicate detection on client side
 */
export async function checkExistingOffer(requestId: string): Promise<{
  hasOffer: boolean;
  offerId?: string;
}> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { hasOffer: false };
  }

  const { data: offer } = await supabase
    .from("offers")
    .select("id")
    .eq("request_id", requestId)
    .eq("provider_id", user.id)
    .eq("status", "active")
    .single();

  return {
    hasOffer: !!offer,
    offerId: offer?.id,
  };
}

// Types for getMyOffers
export interface OfferWithRequest {
  id: string;
  request_id: string;
  status: "active" | "accepted" | "expired" | "cancelled" | "request_filled";
  delivery_window_start: string;
  delivery_window_end: string;
  expires_at: string;
  created_at: string;
  message: string | null;
  request: {
    id: string;
    amount: number;
    address: string;
    is_urgent: boolean;
    comuna_name: string | null;
    status: string;
  } | null;
  dispute: {
    id: string;
    status: string;
    disputeType: string;
  } | null;
}

export interface GroupedOffers {
  pending: OfferWithRequest[];
  accepted: OfferWithRequest[];
  history: OfferWithRequest[];
}

export interface GetMyOffersResult {
  success: boolean;
  offers?: GroupedOffers;
  error?: string;
}

/**
 * Get provider's offers grouped by status
 * AC: 8.3.1 - Provider sees offers grouped: Pendientes, Aceptadas, Expiradas/Rechazadas
 * AC: 8.3.2 - Pending offers show: request summary, delivery window, time remaining
 */
export async function getMyOffers(): Promise<GetMyOffersResult> {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  // AC12.6.2.3: Return requiresLogin flag for auth failures
  if (userError || !user) {
    return createAuthError();
  }

  // Verify user is a provider
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
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
      error: "Esta funcionalidad es solo para proveedores",
    };
  }

  // Query provider's offers with request details
  // AC: 8.3.2 - Include request summary (amount, location, urgency)
  // Use admin client to bypass RLS on water_requests join
  // (RLS blocks providers from seeing non-pending requests even for their own offers)
  const { data: offers, error: offersError } = await adminClient
    .from("offers")
    .select(`
      id,
      request_id,
      status,
      delivery_window_start,
      delivery_window_end,
      expires_at,
      created_at,
      message,
      water_requests!offers_request_id_fkey(
        id,
        amount,
        address,
        is_urgent,
        status,
        comunas!water_requests_comuna_id_fkey(name),
        disputes(id, status, dispute_type)
      )
    `)
    .eq("provider_id", user.id)
    .order("created_at", { ascending: false });

  if (offersError) {
    console.error("[Offers] Error fetching offers:", offersError);
    return {
      success: false,
      error: "Error al cargar ofertas",
    };
  }

  // Transform and group offers
  // AC: 8.3.1 - Group by status: active → accepted → expired/cancelled/request_filled
  const transformedOffers: OfferWithRequest[] = (offers || []).map((offer) => {
    const request = offer.water_requests as unknown as {
      id: string;
      amount: number;
      address: string;
      is_urgent: boolean;
      status: string;
      comunas: { name: string } | null;
      disputes: Array<{ id: string; status: string; dispute_type: string }> | null;
    } | null;

    // Get the first dispute if any exist
    const dispute = request?.disputes?.[0] ?? null;

    return {
      id: offer.id,
      request_id: offer.request_id,
      status: offer.status as OfferWithRequest["status"],
      delivery_window_start: offer.delivery_window_start,
      delivery_window_end: offer.delivery_window_end,
      expires_at: offer.expires_at,
      created_at: offer.created_at,
      message: offer.message,
      request: request ? {
        id: request.id,
        amount: request.amount,
        address: request.address,
        is_urgent: request.is_urgent,
        status: request.status,
        comuna_name: request.comunas?.name ?? null,
      } : null,
      dispute: dispute ? {
        id: dispute.id,
        status: dispute.status,
        disputeType: dispute.dispute_type,
      } : null,
    };
  });

  // Group by status
  const grouped: GroupedOffers = {
    pending: transformedOffers.filter(o => o.status === "active"),
    accepted: transformedOffers.filter(o => o.status === "accepted"),
    history: transformedOffers.filter(o =>
      ["expired", "cancelled", "request_filled"].includes(o.status)
    ),
  };

  return {
    success: true,
    offers: grouped,
  };
}

/**
 * Withdraw (cancel) a pending offer
 * AC: 8.4.2 - Upon confirmation: offer status changes to 'cancelled'
 */
export async function withdrawOffer(offerId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const supabase = await createClient();

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  // AC12.6.2.3: Return requiresLogin flag for auth failures
  if (userError || !user) {
    return createAuthError();
  }

  // Verify offer exists, belongs to this provider, and is active
  const { data: offer, error: offerError } = await supabase
    .from("offers")
    .select("id, provider_id, status")
    .eq("id", offerId)
    .single();

  if (offerError || !offer) {
    return {
      success: false,
      error: "Oferta no encontrada",
    };
  }

  if (offer.provider_id !== user.id) {
    return {
      success: false,
      error: "No tienes permiso para cancelar esta oferta",
    };
  }

  if (offer.status !== "active") {
    return {
      success: false,
      error: "Solo puedes cancelar ofertas pendientes",
    };
  }

  // Update offer status to cancelled
  const { error: updateError } = await supabase
    .from("offers")
    .update({ status: "cancelled" })
    .eq("id", offerId);

  if (updateError) {
    console.error("[Offers] Error cancelling offer:", updateError);
    return {
      success: false,
      error: "Error al cancelar la oferta",
    };
  }

  // Revalidate paths
  revalidatePath("/provider/offers");

  return {
    success: true,
  };
}

// Result type for accepting an offer
export interface AcceptOfferResult {
  success: boolean;
  error?: string;
  offerId?: string;
  requestId?: string;
}

/**
 * Accept a provider's offer (consumer action)
 * This is called when a consumer selects a provider's offer on their request
 *
 * - Updates offer status to 'accepted'
 * - Updates request status to 'accepted' with supplier_id
 * - Marks all other offers for this request as 'request_filled'
 * - Triggers provider notification (in-app + email)
 *
 * AC: 8.5.1, 8.5.2 - Provider gets notified when their offer is accepted
 */
export async function acceptOffer(offerId: string): Promise<AcceptOfferResult> {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  // Get current user (could be consumer or guest via tracking token)
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch the offer with request info
  const { data: offer, error: offerError } = await adminClient
    .from("offers")
    .select(`
      id,
      provider_id,
      request_id,
      status,
      delivery_window_start,
      delivery_window_end,
      water_requests!offers_request_id_fkey(
        id,
        consumer_id,
        status
      )
    `)
    .eq("id", offerId)
    .single();

  if (offerError || !offer) {
    console.error("[Offers] Error fetching offer for acceptance:", offerError);
    return {
      success: false,
      error: "Oferta no encontrada",
    };
  }

  // Validate offer is still active
  if (offer.status !== "active") {
    return {
      success: false,
      error: offer.status === "accepted"
        ? "Esta oferta ya fue aceptada"
        : offer.status === "expired"
        ? "Esta oferta ha expirado"
        : "Esta oferta ya no está disponible",
    };
  }

  const request = offer.water_requests as unknown as {
    id: string;
    consumer_id: string | null;
    status: string;
  };

  // Validate request is still pending
  if (!request || request.status !== "pending") {
    return {
      success: false,
      error: "Esta solicitud ya no está disponible para aceptar ofertas",
    };
  }

  // Validate ownership - user must own the request (or be guest owner - checked elsewhere)
  if (user && request.consumer_id && request.consumer_id !== user.id) {
    return {
      success: false,
      error: "No tienes permiso para aceptar ofertas en esta solicitud",
    };
  }

  const now = new Date().toISOString();

  // Transaction: Update offer, request, and other offers atomically
  // 1. Update the selected offer to 'accepted'
  const { error: acceptError } = await adminClient
    .from("offers")
    .update({
      status: "accepted",
      accepted_at: now,
    })
    .eq("id", offerId)
    .eq("status", "active"); // Safety check

  if (acceptError) {
    console.error("[Offers] Error accepting offer:", acceptError);
    return {
      success: false,
      error: "Error al aceptar la oferta",
    };
  }

  // 2. Update request status to 'accepted' with supplier info
  const { error: requestError } = await adminClient
    .from("water_requests")
    .update({
      status: "accepted",
      supplier_id: offer.provider_id,
      accepted_at: now,
      delivery_window: `${offer.delivery_window_start} - ${offer.delivery_window_end}`,
    })
    .eq("id", request.id)
    .eq("status", "pending"); // Safety check

  if (requestError) {
    console.error("[Offers] Error updating request:", requestError);
    // Rollback offer status
    await adminClient
      .from("offers")
      .update({ status: "active", accepted_at: null })
      .eq("id", offerId);
    return {
      success: false,
      error: "Error al actualizar la solicitud",
    };
  }

  // 3. Mark all other offers for this request as 'request_filled'
  await adminClient
    .from("offers")
    .update({ status: "request_filled" })
    .eq("request_id", request.id)
    .neq("id", offerId)
    .eq("status", "active");

  // 4. Notify provider - AC: 8.5.1, 8.5.2
  // Fire and forget - don't block the response
  notifyProviderOfferAccepted(offerId, offer.provider_id).catch((err) => {
    console.error("[Offers] Failed to send provider notification:", err);
  });

  // Revalidate paths
  revalidatePath("/provider/offers");
  revalidatePath(`/request/${request.id}`);
  revalidatePath(`/track`);

  return {
    success: true,
    offerId: offerId,
    requestId: request.id,
  };
}

// Types for offer acceptance
export interface OfferAcceptanceDetails {
  offer_id: string;
  provider_id: string;
  provider_name: string;
  provider_email: string | null;
  request_id: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  comuna_name: string;
  amount: number;
  delivery_window_start: string;
  delivery_window_end: string;
}

export interface NotifyProviderOfferAcceptedResult {
  success: boolean;
  notificationId?: string;
  emailSent?: boolean;
  error?: string;
}

/**
 * Notify provider that their offer was accepted by a consumer
 * Creates in-app notification and sends email
 *
 * AC: 8.5.1 - Provider receives in-app notification: "¡Tu oferta fue aceptada!"
 * AC: 8.5.2 - Email notification sent with delivery details
 * AC: 8.5.3 - Notification includes: customer name, phone, full address, amount, delivery window
 */
export async function notifyProviderOfferAccepted(
  offerId: string,
  providerId: string
): Promise<NotifyProviderOfferAcceptedResult> {
  const adminClient = createAdminClient();

  // Fetch offer details with request and customer info
  const { data: offer, error: offerError } = await adminClient
    .from("offers")
    .select(`
      id,
      request_id,
      provider_id,
      delivery_window_start,
      delivery_window_end,
      water_requests!offers_request_id_fkey(
        id,
        consumer_id,
        guest_name,
        guest_phone,
        address,
        amount,
        comuna_id,
        comunas!water_requests_comuna_id_fkey(name),
        profiles!water_requests_consumer_id_fkey(
          name,
          phone
        )
      )
    `)
    .eq("id", offerId)
    .single();

  if (offerError || !offer) {
    console.error("[Offers] Error fetching offer for notification:", offerError);
    return {
      success: false,
      error: "Oferta no encontrada",
    };
  }

  // Get provider details for email
  const { data: provider, error: providerError } = await adminClient
    .from("profiles")
    .select("name, email")
    .eq("id", providerId)
    .single();

  if (providerError || !provider) {
    console.error("[Offers] Error fetching provider for notification:", providerError);
    return {
      success: false,
      error: "Proveedor no encontrado",
    };
  }

  // Extract request and customer info
  const request = offer.water_requests as unknown as {
    id: string;
    consumer_id: string | null;
    guest_name: string | null;
    guest_phone: string;
    address: string;
    amount: number;
    comuna_id: string | null;
    comunas: { name: string } | null;
    profiles: { name: string; phone: string } | null;
  };

  if (!request) {
    return {
      success: false,
      error: "Solicitud no encontrada",
    };
  }

  // Determine customer info (registered user or guest)
  const customerName = request.profiles?.name || request.guest_name || "Cliente";
  const customerPhone = request.profiles?.phone || request.guest_phone;
  const comunaName = request.comunas?.name || "";
  const fullAddress = comunaName ? `${request.address}, ${comunaName}` : request.address;

  // Create notification message
  // AC: 8.5.1 - Format: "¡Tu oferta fue aceptada! Solicitud de 5,000L en Quilicura"
  const notificationTitle = "¡Tu oferta fue aceptada!";
  const notificationMessage = `Solicitud de ${request.amount.toLocaleString("es-CL")}L en ${comunaName || "tu área"}`;

  // AC: 8.5.3 - Include relevant metadata
  const notificationData = {
    offer_id: offerId,
    request_id: request.id,
    customer_name: customerName,
    customer_phone: customerPhone,
    delivery_address: fullAddress,
    delivery_window_start: offer.delivery_window_start,
    delivery_window_end: offer.delivery_window_end,
  };

  // Create notification record in notifications table
  // AC: 8.5.1 - Via notifications table
  const { data: notification, error: notificationError } = await adminClient
    .from("notifications")
    .insert({
      user_id: providerId,
      type: "offer_accepted",
      title: notificationTitle,
      message: notificationMessage,
      data: notificationData,
      read: false,
    })
    .select("id")
    .single();

  if (notificationError) {
    console.error("[Offers] Error creating notification:", notificationError);
    // Continue to try sending email even if notification insert fails
  }

  // Send email notification
  // AC: 8.5.2 - Email notification sent via Resend
  let emailSent = false;
  if (provider.email) {
    try {
      const emailResult = await sendOfferAcceptedEmail({
        to: provider.email,
        providerName: provider.name || "Proveedor",
        customerName,
        customerPhone,
        deliveryAddress: fullAddress,
        amount: request.amount,
        deliveryWindowStart: offer.delivery_window_start,
        deliveryWindowEnd: offer.delivery_window_end,
        requestId: request.id,
      });
      emailSent = !emailResult.error;
      if (emailResult.error) {
        console.error("[Offers] Email send failed:", emailResult.error);
      }
    } catch (emailError) {
      console.error("[Offers] Email send exception:", emailError);
    }
  }

  // Note: Push notification is now triggered directly in selectOffer() for reliability
  // This function only handles in-app notification and email

  console.log(`[Offers] Notified provider ${providerId} of offer acceptance: ${offerId}`);

  return {
    success: true,
    notificationId: notification?.id,
    emailSent,
  };
}

// =============================================================================
// CONSUMER OFFER SELECTION (Story 10-2)
// =============================================================================

/**
 * Result type for selectOffer action
 */
export interface SelectOfferResult {
  success: boolean;
  error?: string;
  requestId?: string;
  providerName?: string;
}

/**
 * Consumer selects a provider's offer (Consumer action - Story 10-2)
 *
 * This action uses the atomic select_offer database function to:
 * - AC10.2.4: Update selected offer to 'accepted' with accepted_at timestamp
 * - AC10.2.5: Update request to 'accepted' with provider_id assigned
 * - AC10.2.6: Mark all other active offers on request as 'request_filled'
 * - AC10.2.9: Notify selected provider (in-app + email)
 * - AC10.2.10: Notify other providers (in-app only)
 *
 * @param offerId - The offer ID to select
 * @param trackingToken - Optional tracking token for guest consumers
 */
export async function selectOffer(
  offerId: string,
  trackingToken?: string
): Promise<SelectOfferResult> {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  // Get current user (may be null for guests)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch the offer with request info to validate ownership
  const { data: offer, error: offerError } = await adminClient
    .from("offers")
    .select(
      `
      id,
      provider_id,
      request_id,
      status,
      delivery_window_start,
      delivery_window_end,
      profiles:provider_id (
        name,
        email
      ),
      water_requests!offers_request_id_fkey (
        id,
        consumer_id,
        tracking_token,
        status,
        amount,
        comuna_id,
        comunas!water_requests_comuna_id_fkey (
          name
        )
      )
    `
    )
    .eq("id", offerId)
    .single();

  if (offerError || !offer) {
    console.error("[SelectOffer] Error fetching offer:", offerError);
    return {
      success: false,
      error: "Oferta no encontrada",
    };
  }

  const request = offer.water_requests as unknown as {
    id: string;
    consumer_id: string | null;
    tracking_token: string | null;
    status: string;
    amount: number;
    comuna_id: string | null;
    comunas: { name: string } | null;
  };

  const provider = offer.profiles as unknown as {
    name: string;
    email: string | null;
  };

  // AC10.2.3: Validate consumer owns the request
  // For registered users: consumer_id must match
  // For guests: tracking_token must match (AC10.2.6 - Guest Consumer Support)
  const isOwner =
    (user && request.consumer_id === user.id) ||
    (trackingToken && request.tracking_token === trackingToken);

  if (!isOwner) {
    return {
      success: false,
      error: "No tienes permiso para seleccionar ofertas en esta solicitud",
    };
  }

  // Call the atomic database function
  // AC10.2.3, 10.2.4, 10.2.5, 10.2.6: Atomic transaction
  // Note: Using type assertion since the function was just created and types aren't regenerated yet
  const { data: result, error: rpcError } = await (adminClient.rpc as Function)(
    "select_offer",
    {
      p_offer_id: offerId,
      p_request_id: request.id,
    }
  );

  if (rpcError) {
    console.error("[SelectOffer] RPC error:", rpcError);
    return {
      success: false,
      error: "Error al procesar la selección. Por favor, intenta de nuevo.",
    };
  }

  // Check result from database function
  const dbResult = result as {
    success: boolean;
    error?: string;
    provider_id?: string;
    cancelled_offers?: number;
  };

  if (!dbResult.success) {
    return {
      success: false,
      error: dbResult.error || "Error al seleccionar la oferta",
    };
  }

  // AC12.6.7: Send push notification IMMEDIATELY (same pattern as submitOffer)
  // This must be called directly here, not nested in notifyProviderOfferAccepted,
  // to ensure it executes before the serverless function returns
  const comunaName = request.comunas?.name || "";
  triggerOfferAcceptedPush(offer.provider_id, request.id, request.amount, comunaName).catch(
    (err) => console.error("[SelectOffer] Push notification error:", err)
  );

  // AC10.2.9: Notify selected provider (in-app + email)
  // Fire and forget - don't block the response
  // Note: Push is now handled above, this only does in-app notification and email
  notifyProviderOfferAccepted(offerId, offer.provider_id).catch((err) => {
    console.error("[SelectOffer] Failed to notify selected provider:", err);
  });

  // AC10.2.10: Notify other providers whose offers were cancelled
  if (dbResult.cancelled_offers && dbResult.cancelled_offers > 0) {
    notifyOtherProvidersOfferCancelled(request.id, offerId).catch((err) => {
      console.error("[SelectOffer] Failed to notify other providers:", err);
    });
  }

  // Revalidate paths
  revalidatePath(`/request/${request.id}`);
  revalidatePath(`/request/${request.id}/offers`);
  revalidatePath(`/track/${request.tracking_token}`);
  revalidatePath("/provider/offers");

  console.log(
    `[SelectOffer] Consumer selected offer ${offerId} for request ${request.id}`
  );

  return {
    success: true,
    requestId: request.id,
    providerName: provider?.name || "Repartidor",
  };
}

/**
 * Notify other providers that their offers were cancelled (request was filled)
 * AC10.2.10: In-app notification only for cancelled offers
 */
async function notifyOtherProvidersOfferCancelled(
  requestId: string,
  acceptedOfferId: string
): Promise<void> {
  const adminClient = createAdminClient();

  // Get all other providers who had offers on this request
  const { data: cancelledOffers, error } = await adminClient
    .from("offers")
    .select("id, provider_id")
    .eq("request_id", requestId)
    .eq("status", "request_filled")
    .neq("id", acceptedOfferId);

  if (error || !cancelledOffers || cancelledOffers.length === 0) {
    return;
  }

  // Create in-app notifications for each provider
  const notifications = cancelledOffers.map((offer) => ({
    user_id: offer.provider_id,
    type: "offer_request_filled",
    title: "Solicitud asignada",
    message: "La solicitud ya fue asignada a otro repartidor",
    data: {
      offer_id: offer.id,
      request_id: requestId,
    },
    read: false,
  }));

  const { error: insertError } = await adminClient
    .from("notifications")
    .insert(notifications);

  if (insertError) {
    console.error(
      "[SelectOffer] Error creating cancellation notifications:",
      insertError
    );
  } else {
    console.log(
      `[SelectOffer] Notified ${notifications.length} providers of request_filled`
    );
  }

  // AC12.6.7: Send push notifications to other providers
  for (const offer of cancelledOffers) {
    triggerRequestFilledPush(offer.provider_id, requestId).catch(
      (err) => console.error("[SelectOffer] Push notification error:", err)
    );
  }
}
