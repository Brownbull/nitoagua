import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import { type RequestStatus } from "@/components/shared/status-badge";
import { GradientHeader } from "@/components/consumer/gradient-header";
import { TimelineTracker } from "@/components/consumer/timeline-tracker";
import { StatusCard, SupplierInfo, CallButton } from "@/components/consumer/status-card";
import { TrackingRefresh } from "@/components/consumer/tracking-refresh";
import { CancelRequestButton } from "@/components/consumer/cancel-request-button";
import {
  formatDateSpanish,
  formatShortDate,
  maskAddress,
} from "@/lib/utils/format";
import { AlertTriangle, Droplets, MapPin, Calendar, RotateCcw, Eye, MessageCircle } from "lucide-react";
import Link from "next/link";

interface TrackingPageProps {
  params: Promise<{ token: string }>;
}

interface RequestWithSupplier {
  id: string;
  status: string;
  amount: number;
  address: string;
  created_at: string | null;
  accepted_at: string | null;
  in_transit_at: string | null;
  delivered_at: string | null;
  delivery_window: string | null;
  supplier_id: string | null;
  active_offer_count?: number;
  profiles: {
    name: string;
    phone: string;
  } | null;
}

function TrackingErrorPage() {
  return (
    <main className="min-h-dvh bg-gray-50 flex flex-col">
      <GradientHeader title="Solicitud no encontrada" showBack={false} />
      <div className="flex-1 flex items-center justify-center p-5">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-amber-600" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Enlace no válido
          </h2>
          <p className="text-gray-600 mb-6">
            El enlace puede haber expirado o ser incorrecto
          </p>
          <Button asChild className="w-full bg-[#0077B6] hover:bg-[#005f8f] rounded-xl py-4">
            <Link href="/">Volver al Inicio</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

interface TrackingContentProps {
  request: RequestWithSupplier;
  trackingToken: string;
}

function TrackingContent({ request, trackingToken }: TrackingContentProps) {
  const status = request.status as RequestStatus;
  const isAccepted = status === "accepted";
  const isInTransit = status === "in_transit";
  const isDelivered = status === "delivered";
  const isPending = status === "pending";
  const isCancelled = status === "cancelled";
  const isNoOffers = status === "no_offers";

  // Title based on status
  const getTitle = () => {
    if (isPending) return "Tu solicitud está activa";
    if (isAccepted || isInTransit) return "Estado de tu solicitud";
    if (isDelivered) return "¡Entrega completada!";
    if (isCancelled) return "Solicitud cancelada";
    if (isNoOffers) return "Sin ofertas";
    return "Estado de tu solicitud";
  };

  return (
    <main className="min-h-dvh bg-gray-50 flex flex-col">
      <TrackingRefresh />

      {/* Gradient Header */}
      <GradientHeader title={getTitle()} status={status} />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-5 py-3 bg-gray-50">
        {/* Timeline */}
        <TimelineTracker
          currentStatus={status}
          createdAt={request.created_at || new Date().toISOString()}
          acceptedAt={request.accepted_at}
          inTransitAt={request.in_transit_at}
          deliveredAt={request.delivered_at}
          formatDate={formatShortDate}
        />

        {/* Status-specific content: Pending */}
        {isPending && (
          <>
            <StatusCard
              status="pending"
              title="Esperando ofertas"
              description="Los repartidores están viendo tu pedido"
            >
              {/* Offer count badge */}
              {request.active_offer_count !== undefined && request.active_offer_count > 0 && (
                <p
                  className="mt-3 text-sm font-semibold text-[#0077B6] bg-[#CAF0F8] px-3 py-1.5 rounded-full inline-block"
                  data-testid="offer-count-badge"
                >
                  {request.active_offer_count === 1
                    ? "1 oferta disponible"
                    : `${request.active_offer_count} ofertas disponibles`}
                </p>
              )}
            </StatusCard>

            {/* Info note */}
            <div className="bg-[#CAF0F8] rounded-xl p-3.5 mb-4">
              <div className="flex gap-2.5 items-start">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0077B6"
                  strokeWidth="2"
                  className="flex-shrink-0 mt-0.5"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <p className="text-[13px] text-[#03045E]">
                  Recibirás ofertas de diferentes repartidores. Podrás comparar precios y horarios antes de elegir.
                </p>
              </div>
            </div>

            {/* Ver Ofertas button */}
            <Button
              asChild
              className="w-full bg-[#0077B6] hover:bg-[#005f8f] rounded-xl py-4 text-base font-semibold shadow-[0_4px_14px_rgba(0,119,182,0.3)] mb-3"
              data-testid="view-offers-button"
            >
              <Link href={`/request/${request.id}/offers?token=${trackingToken}`}>
                <Eye className="mr-2 h-5 w-5" />
                Ver Ofertas
              </Link>
            </Button>

            {/* Cancel button */}
            <CancelRequestButton
              requestId={request.id}
              trackingToken={trackingToken}
              variant="danger"
              activeOfferCount={request.active_offer_count}
            />
          </>
        )}

        {/* Status-specific content: Accepted */}
        {isAccepted && (
          <>
            <StatusCard
              status="accepted"
              title="¡Tu agua viene en camino!"
              description={request.delivery_window
                ? `Entrega estimada: ${request.delivery_window}`
                : "El repartidor está en camino"}
            >
              {request.profiles?.name && (
                <SupplierInfo
                  name={request.profiles.name}
                  phone={request.profiles.phone}
                  variant="accepted"
                />
              )}
              {request.profiles?.phone && (
                <CallButton phone={request.profiles.phone} />
              )}
            </StatusCard>

            {/* Delivery window display for test - visible */}
            {request.delivery_window && (
              <div className="flex items-center gap-3 bg-white rounded-xl p-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-[#DBEAFE] flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-4 w-4 text-[#1E40AF]" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs text-[#3B82F6]">Entrega estimada</p>
                  <p className="text-sm font-semibold text-[#1E3A8A]" data-testid="delivery-window">
                    {request.delivery_window}
                  </p>
                </div>
              </div>
            )}

            {/* Cancel button for accepted status */}
            <CancelRequestButton requestId={request.id} trackingToken={trackingToken} variant="danger" />
          </>
        )}

        {/* Status-specific content: In Transit */}
        {isInTransit && (
          <>
            <StatusCard
              status="in_transit"
              title="¡Tu agua está en camino!"
              description={request.delivery_window
                ? `Llegando pronto: ${request.delivery_window}`
                : "El repartidor está llegando"}
            >
              {request.profiles?.name && (
                <SupplierInfo
                  name={request.profiles.name}
                  phone={request.profiles.phone}
                  variant="in_transit"
                />
              )}
              {request.profiles?.phone && (
                <CallButton phone={request.profiles.phone} />
              )}
            </StatusCard>

            {request.delivery_window && (
              <div className="flex items-center gap-3 bg-white rounded-xl p-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-[#E0E7FF] flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-4 w-4 text-[#3730A3]" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs text-[#4F46E5]">Llegando pronto</p>
                  <p className="text-sm font-semibold text-[#312E81]" data-testid="delivery-window">
                    {request.delivery_window}
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Status-specific content: Delivered */}
        {isDelivered && (
          <>
            <StatusCard
              status="delivered"
              title="¡Tu agua fue entregada!"
              description={request.delivered_at
                ? `Entregado el ${formatDateSpanish(request.delivered_at)}`
                : "Entrega completada"}
            />

            {/* Reorder button */}
            <Button
              asChild
              className="w-full bg-[#10B981] hover:bg-[#059669] rounded-xl py-4 text-base font-semibold shadow-[0_4px_14px_rgba(16,185,129,0.3)]"
            >
              <Link href="/">
                <RotateCcw className="mr-2 h-5 w-5" />
                Solicitar Agua de Nuevo
              </Link>
            </Button>
          </>
        )}

        {/* Status-specific content: Cancelled */}
        {isCancelled && (
          <>
            <StatusCard
              status="cancelled"
              title="Solicitud cancelada"
              description="Esta solicitud fue cancelada y no será procesada"
            />

            <Button
              asChild
              variant="outline"
              className="w-full rounded-xl py-4 text-base font-semibold"
            >
              <Link href="/">
                <RotateCcw className="mr-2 h-5 w-5" />
                Nueva Solicitud
              </Link>
            </Button>
          </>
        )}

        {/* Status-specific content: No Offers */}
        {isNoOffers && (
          <div data-testid="no-offers-card">
            <StatusCard
              status="no_offers"
              title="Sin Ofertas"
              description="Lo sentimos, no hay aguateros disponibles ahora"
            >
              <p className="text-xs text-[#C2410C] mt-2" data-testid="no-offers-message">
                Tu solicitud no recibió ofertas. Esto puede ocurrir en horarios de baja demanda.
              </p>
            </StatusCard>

            <Button
              asChild
              className="w-full bg-[#EA580C] hover:bg-[#C2410C] rounded-xl py-4 text-base font-semibold mb-3"
              data-testid="new-request-button"
            >
              <Link href="/">
                <RotateCcw className="mr-2 h-5 w-5" />
                Nueva Solicitud
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="w-full border-[#10B981] text-[#059669] hover:bg-green-50 rounded-xl py-4 text-base font-semibold"
              data-testid="contact-support-button"
            >
              <a
                href="https://wa.me/56912345678?text=Hola,%20necesito%20ayuda%20con%20mi%20solicitud%20de%20agua"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Contactar Soporte
              </a>
            </Button>
          </div>
        )}

        {/* Request Details - Compact version */}
        <div className="bg-white rounded-2xl p-4 mt-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Detalles</h3>

          <div className="space-y-3">
            {/* Amount */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#DBEAFE] flex items-center justify-center flex-shrink-0">
                <Droplets className="h-4 w-4 text-[#1E40AF]" aria-hidden="true" />
              </div>
              <span className="text-sm font-medium text-gray-900">
                {request.amount.toLocaleString("es-CL")}L
              </span>
            </div>

            {/* Address (masked for privacy) */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#D1FAE5] flex items-center justify-center flex-shrink-0">
                <MapPin className="h-4 w-4 text-[#065F46]" aria-hidden="true" />
              </div>
              <span className="text-sm text-gray-700 pt-2">{maskAddress(request.address)}</span>
            </div>

            {/* Date */}
            {request.created_at && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-4 w-4 text-purple-600" aria-hidden="true" />
                </div>
                <span className="text-sm text-gray-700">
                  {formatDateSpanish(request.created_at)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center py-6">
          <Button variant="ghost" asChild className="text-gray-500">
            <Link href="/">Volver al Inicio</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

export default async function TrackingPage({ params }: TrackingPageProps) {
  const { token } = await params;
  // Use admin client to bypass RLS - guest tracking via token is intentional
  const supabase = createAdminClient();

  const { data: requestData, error } = await supabase
    .from("water_requests")
    .select(
      `
      id,
      status,
      amount,
      address,
      created_at,
      accepted_at,
      in_transit_at,
      delivered_at,
      delivery_window,
      supplier_id,
      profiles!water_requests_supplier_id_fkey (
        name,
        phone
      )
    `
    )
    .eq("tracking_token", token)
    .single();

  if (error || !requestData) {
    return <TrackingErrorPage />;
  }

  // AC10.5.7: Get active offer count for pending requests
  let activeOfferCount = 0;
  if (requestData.status === "pending") {
    const { count } = await supabase
      .from("offers")
      .select("*", { count: "exact", head: true })
      .eq("request_id", requestData.id)
      .eq("status", "active");
    activeOfferCount = count ?? 0;
  }

  const request: RequestWithSupplier = {
    ...requestData,
    active_offer_count: activeOfferCount,
    profiles: requestData.profiles as RequestWithSupplier["profiles"],
  };

  return <TrackingContent request={request} trackingToken={token} />;
}
