import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { OffersClient } from "./offers-client";

interface OffersPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}

interface RequestSummary {
  id: string;
  status: string;
  amount: number;
  address: string;
  is_urgent: boolean | null;
  consumer_id: string | null;
  tracking_token: string | null;
}

/**
 * Error page when request is not found or user is not authorized
 */
function RequestNotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-8 pb-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-amber-600" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Solicitud no encontrada
          </h1>
          <p className="text-gray-600 mb-6">
            La solicitud que buscas no existe o no tienes acceso a ella
          </p>
          <Button asChild className="w-full">
            <Link href="/">Volver al Inicio</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Error page when user is not authenticated
 */
function AuthRequiredPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-8 pb-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-blue-600" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Inicio de sesion requerido
          </h1>
          <p className="text-gray-600 mb-6">
            Debes iniciar sesion para ver las ofertas de tu solicitud
          </p>
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/">Volver al Inicio</Link>
            </Button>
            <p className="text-sm text-gray-500">
              Si eres un visitante, usa el enlace de seguimiento que te enviamos por correo
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface InitialOffer {
  id: string;
  request_id: string;
  provider_id: string;
  delivery_window_start: string;
  delivery_window_end: string;
  expires_at: string;
  status: string;
  message: string | null;
  created_at: string;
  accepted_at: string | null;
  profiles: {
    name: string;
    avatar_url?: string | null;
  } | null;
}

interface OffersContentProps {
  request: RequestSummary;
  isGuestAccess: boolean;
  trackingToken?: string;
  initialOffers: InitialOffer[];
}

function OffersContent({ request, isGuestAccess, trackingToken, initialOffers }: OffersContentProps) {
  return (
    <div className="py-6 px-4">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Back navigation */}
        <Button variant="ghost" size="sm" asChild className="mb-2">
          <Link
            href={
              isGuestAccess && trackingToken
                ? `/track/${trackingToken}`
                : `/request/${request.id}`
            }
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver al estado
          </Link>
        </Button>

        {/* Request summary header */}
        <div className="bg-white rounded-lg border p-4">
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Ofertas para tu solicitud
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>{request.amount.toLocaleString("es-CL")}L</span>
            <span>•</span>
            <span className="truncate max-w-[200px]">{request.address}</span>
            {request.is_urgent && (
              <>
                <span>•</span>
                <span className="text-red-600 font-medium">Urgente</span>
              </>
            )}
          </div>
        </div>

        {/* Offers client component - handles realtime updates and selection */}
        <OffersClient
          requestId={request.id}
          requestAmount={request.amount}
          initialOffers={initialOffers}
          isGuestAccess={isGuestAccess}
          trackingToken={trackingToken}
        />
      </div>
    </div>
  );
}

/**
 * Request Offers Page (Consumer View)
 *
 * Server component that displays the offers for a consumer's request.
 * Supports both authenticated consumers (via consumer_id) and guests (via tracking_token).
 *
 * Route: /request/[id]/offers
 * Guest route: /request/[id]/offers?token=xxx
 *
 * AC10.1.6: Guest consumers can view offers using their tracking token
 *
 * Acceptance Criteria:
 * - AC10.1.1: Consumer sees "Ofertas Recibidas" section with count badge
 * - AC10.1.2: Each offer card shows provider info, delivery window, price, countdown
 * - AC10.1.3: Offers sorted by delivery window (soonest first)
 * - AC10.1.4: List updates in real-time via Supabase Realtime
 * - AC10.1.5: Empty state shows waiting messaging with timeout notice
 * - AC10.1.6: Guest consumers can view offers using tracking token
 */
export default async function RequestOffersPage({ params, searchParams }: OffersPageProps) {
  const { id } = await params;
  const { token: trackingToken } = await searchParams;

  // Guest access via tracking token - AC10.1.6
  if (trackingToken) {
    // Use admin client to bypass RLS for guest token verification
    const adminClient = createAdminClient();

    const { data: guestRequest, error: guestError } = await adminClient
      .from("water_requests")
      .select(
        `
        id,
        status,
        amount,
        address,
        is_urgent,
        consumer_id,
        tracking_token
      `
      )
      .eq("id", id)
      .eq("tracking_token", trackingToken)
      .single();

    if (guestError || !guestRequest) {
      return <RequestNotFoundPage />;
    }

    // Fetch initial offers for guest (bypasses RLS) - AC10.1.3: sorted by delivery_window_start
    const { data: guestOffers } = await adminClient
      .from("offers")
      .select(
        `
        id,
        request_id,
        provider_id,
        delivery_window_start,
        delivery_window_end,
        expires_at,
        status,
        message,
        created_at,
        accepted_at,
        profiles:provider_id (
          name
        )
      `
      )
      .eq("request_id", id)
      .in("status", ["active", "expired"])
      .order("delivery_window_start", { ascending: true });

    // Transform offers to match interface
    // Note: avatar_url exists in profiles table but not yet populated by providers
    const transformedOffers: InitialOffer[] = (guestOffers || []).map((offer) => ({
      ...offer,
      profiles: offer.profiles
        ? {
            name: (offer.profiles as { name?: string }).name || "Repartidor",
            avatar_url: null, // TODO: Add avatar_url to query when types are regenerated
          }
        : null,
    }));

    return (
      <OffersContent
        request={guestRequest as RequestSummary}
        isGuestAccess={true}
        trackingToken={trackingToken}
        initialOffers={transformedOffers}
      />
    );
  }

  // Authenticated access - check user via server-side Supabase client
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <AuthRequiredPage />;
  }

  // Query for the request - consumer can only see their own requests
  const { data: requestData, error } = await supabase
    .from("water_requests")
    .select(
      `
      id,
      status,
      amount,
      address,
      is_urgent,
      consumer_id,
      tracking_token
    `
    )
    .eq("id", id)
    .eq("consumer_id", user.id)
    .single();

  if (error || !requestData) {
    return <RequestNotFoundPage />;
  }

  // Fetch initial offers for authenticated user - AC10.1.3: sorted by delivery_window_start
  const { data: userOffers } = await supabase
    .from("offers")
    .select(
      `
      id,
      request_id,
      provider_id,
      delivery_window_start,
      delivery_window_end,
      expires_at,
      status,
      message,
      created_at,
      accepted_at,
      profiles:provider_id (
        name
      )
    `
    )
    .eq("request_id", id)
    .in("status", ["active", "expired"])
    .order("delivery_window_start", { ascending: true });

  // Transform offers to match interface
  // Note: avatar_url exists in profiles table but not yet populated by providers
  const transformedOffers: InitialOffer[] = (userOffers || []).map((offer) => ({
    ...offer,
    profiles: offer.profiles
      ? {
          name: (offer.profiles as { name?: string }).name || "Repartidor",
          avatar_url: null, // TODO: Add avatar_url to query when types are regenerated
        }
      : null,
  }));

  return (
    <OffersContent
      request={requestData as RequestSummary}
      isGuestAccess={false}
      initialOffers={transformedOffers}
    />
  );
}
