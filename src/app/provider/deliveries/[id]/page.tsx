import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DeliveryDetailClient } from "./delivery-detail-client";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Delivery Detail Page
 * AC: 8.5.3 - Display full customer contact info, complete delivery address,
 *             water amount, and delivery window
 * AC: 8.5.4 - "Ver Detalles" button links to this page
 */
export default async function DeliveryDetailPage({ params }: PageProps) {
  const { id: requestId } = await params;
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/provider/deliveries/" + requestId);
  }

  // Check if user is a verified provider
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, verification_status")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "supplier") {
    redirect("/");
  }

  if (profile.verification_status !== "approved") {
    redirect("/provider/onboarding/pending");
  }

  // Use admin client to fetch all data without RLS restrictions
  const adminClient = createAdminClient();

  // Fetch the accepted offer for this request and provider
  const { data: offer, error: offerError } = await adminClient
    .from("offers")
    .select(`
      id,
      status,
      delivery_window_start,
      delivery_window_end,
      message,
      accepted_at,
      created_at,
      water_requests!offers_request_id_fkey(
        id,
        consumer_id,
        guest_name,
        guest_phone,
        address,
        amount,
        is_urgent,
        special_instructions,
        status,
        comuna_id,
        comunas!water_requests_comuna_id_fkey(name),
        profiles!water_requests_consumer_id_fkey(
          name,
          phone,
          email
        )
      )
    `)
    .eq("request_id", requestId)
    .eq("provider_id", user.id)
    .eq("status", "accepted")
    .single();

  if (offerError || !offer) {
    // Try to find any offer for this request (even if not accepted)
    const { data: anyOffer } = await adminClient
      .from("offers")
      .select("id, status")
      .eq("request_id", requestId)
      .eq("provider_id", user.id)
      .single();

    if (!anyOffer) {
      notFound();
    }

    // Offer exists but not accepted - redirect to offers page
    redirect("/provider/offers");
  }

  // Extract and transform data
  const request = offer.water_requests as unknown as {
    id: string;
    consumer_id: string | null;
    guest_name: string | null;
    guest_phone: string;
    address: string;
    amount: number;
    is_urgent: boolean;
    special_instructions: string | null;
    status: string;
    comuna_id: string | null;
    comunas: { name: string } | null;
    profiles: { name: string; phone: string; email: string | null } | null;
  };

  if (!request) {
    notFound();
  }

  // Build customer info (registered or guest)
  const customerName = request.profiles?.name || request.guest_name || "Cliente";
  const customerPhone = request.profiles?.phone || request.guest_phone;
  const comunaName = request.comunas?.name || "";
  const fullAddress = comunaName
    ? `${request.address}, ${comunaName}`
    : request.address;

  const deliveryData = {
    offerId: offer.id,
    requestId: request.id,
    customerName,
    customerPhone,
    deliveryAddress: fullAddress,
    comunaName,
    amount: request.amount,
    isUrgent: request.is_urgent,
    specialInstructions: request.special_instructions,
    deliveryWindowStart: offer.delivery_window_start,
    deliveryWindowEnd: offer.delivery_window_end,
    acceptedAt: offer.accepted_at,
    requestStatus: request.status,
  };

  return <DeliveryDetailClient delivery={deliveryData} />;
}
