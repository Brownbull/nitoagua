"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Droplets,
  MapPin,
  Calendar,
  FileText,
  RotateCcw,
  Loader2,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { type RequestStatus } from "@/components/shared/status-badge";
import { GradientHeader } from "@/components/consumer/gradient-header";
import { TimelineTracker } from "@/components/consumer/timeline-tracker";
import { StatusCard, SupplierInfo, CallButton } from "@/components/consumer/status-card";
import { CancelRequestButton } from "@/components/consumer/cancel-request-button";
import { OfferList } from "@/components/consumer/offer-list";
import { OfferSelectionModal } from "@/components/consumer/offer-selection-modal";
import {
  formatDateSpanish,
  formatShortDate,
} from "@/lib/utils/format";
import { useRequestPolling } from "@/hooks/use-request-polling";
import { useConsumerOffers, ConsumerOffer } from "@/hooks/use-consumer-offers";
import { selectOffer } from "@/lib/actions/offers";
import { notifyStatusChange } from "@/lib/notifications";

interface RequestWithSupplier {
  id: string;
  status: string;
  amount: number;
  address: string;
  special_instructions: string | null;
  is_urgent: boolean;
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

interface RequestStatusClientProps {
  initialRequest: RequestWithSupplier;
}

/**
 * Client component for request status page with polling
 * Refactored to match UX mockup design patterns
 *
 * AC5-3-1: Toast notification appears when status changes
 * AC5-3-3: Request status page auto-updates (30 second polling)
 * AC10.5.1-8: Status page with offer context
 * Updated: Offers displayed inline instead of separate page
 */
export function RequestStatusClient({ initialRequest }: RequestStatusClientProps) {
  // Offer selection state
  const [selectingOfferId, setSelectingOfferId] = useState<string | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<ConsumerOffer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const { status: polledStatus, isPolling, data: polledData } = useRequestPolling(
    initialRequest.id,
    initialRequest.status,
    {
      interval: 30000,
      enabled: true,
      onStatusChange: (from, to, data) => {
        notifyStatusChange(to, data.delivery_window as string | null | undefined);
      },
    }
  );

  // Fetch offers for pending requests
  const isPendingStatus = (polledStatus || initialRequest.status) === "pending";
  const {
    offers,
    loading: offersLoading,
    activeOfferCount,
  } = useConsumerOffers(initialRequest.id, {
    enabled: isPendingStatus,
  });

  // Merge polled data with initial request
  const request: RequestWithSupplier = polledData
    ? {
        ...initialRequest,
        status: polledData.status,
        accepted_at: (polledData.accepted_at as string) ?? initialRequest.accepted_at,
        in_transit_at: (polledData.in_transit_at as string) ?? initialRequest.in_transit_at,
        delivered_at: (polledData.delivered_at as string) ?? initialRequest.delivered_at,
        delivery_window: (polledData.delivery_window as string) ?? initialRequest.delivery_window,
        supplier_id: (polledData.supplier_id as string) ?? initialRequest.supplier_id,
      }
    : { ...initialRequest, status: polledStatus };

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

  // Handle offer selection - open confirmation modal
  const handleSelectOffer = (offerId: string) => {
    const offer = offers.find((o) => o.id === offerId);
    if (!offer) return;

    // Check if offer is expired
    if (offer.status === "expired" || new Date(offer.expires_at) < new Date()) {
      toast.error("Esta oferta ha expirado", {
        description: "Por favor, selecciona otra oferta",
      });
      return;
    }

    setSelectingOfferId(offerId);
    setSelectedOffer(offer);
    setIsModalOpen(true);
  };

  // Handle confirmation - call selectOffer action
  const handleConfirmSelection = async () => {
    if (!selectedOffer) return;

    setIsConfirming(true);

    try {
      const result = await selectOffer(selectedOffer.id);

      if (!result.success) {
        toast.error("Error al seleccionar oferta", {
          description: result.error || "Por favor, intenta de nuevo",
        });
        return;
      }

      // Show success toast
      toast.success(`¡Listo! Tu pedido fue asignado a ${result.providerName}`, {
        description: "Te notificaremos cuando el repartidor esté en camino",
      });

      // Close modal
      setIsModalOpen(false);

      // Full page reload to show updated status
      // router.refresh() only refreshes server components, not client state
      window.location.reload();
    } catch (err) {
      console.error("[RequestStatusClient] Selection error:", err);
      toast.error("Error al seleccionar oferta", {
        description: "Ocurrió un error inesperado. Por favor, intenta de nuevo.",
      });
    } finally {
      setIsConfirming(false);
      setSelectingOfferId(null);
    }
  };

  // Handle modal close
  const handleModalClose = (open: boolean) => {
    if (!open && !isConfirming) {
      setIsModalOpen(false);
      setSelectedOffer(null);
      setSelectingOfferId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Polling Indicator */}
      {isPolling && (
        <div className="fixed top-4 right-4 z-50">
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-sm border border-gray-200">
            <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
            <span className="text-xs text-gray-500">Actualizando...</span>
          </div>
        </div>
      )}

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
            {/* Show timeline/status or offers depending on whether we have offers */}
            {offers.length === 0 && !offersLoading ? (
              <>
                <StatusCard
                  status="pending"
                  title="Esperando ofertas"
                  description="Los repartidores están viendo tu pedido"
                />

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
                      className="shrink-0 mt-0.5"
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
              </>
            ) : (
              <>
                {/* Section header when offers exist */}
                <h2 className="text-lg font-bold text-gray-900 mb-3">
                  Elige tu repartidor
                </h2>

                {/* Inline Offers List */}
                <OfferList
                  offers={offers}
                  requestAmount={request.amount}
                  loading={offersLoading}
                  onSelectOffer={handleSelectOffer}
                  selectingOfferId={selectingOfferId}
                />

                {/* Selection Modal */}
                <OfferSelectionModal
                  offer={selectedOffer}
                  requestAmount={request.amount}
                  open={isModalOpen}
                  onOpenChange={handleModalClose}
                  onConfirm={handleConfirmSelection}
                  isLoading={isConfirming}
                />
              </>
            )}

            {/* Cancel button - always show */}
            <div className="mt-4">
              <CancelRequestButton requestId={request.id} variant="danger" />
            </div>
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
            <CancelRequestButton requestId={request.id} variant="danger" />
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
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">
                  {request.amount.toLocaleString("es-CL")}L
                </span>
                {request.is_urgent && (
                  <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-800">
                    Urgente
                  </span>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#D1FAE5] flex items-center justify-center flex-shrink-0">
                <MapPin className="h-4 w-4 text-[#065F46]" aria-hidden="true" />
              </div>
              <span className="text-sm text-gray-700 pt-2">{request.address}</span>
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

            {/* Special Instructions */}
            {request.special_instructions && (
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-4 w-4 text-orange-600" aria-hidden="true" />
                </div>
                <span className="text-sm text-gray-700 pt-2">{request.special_instructions}</span>
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
    </div>
  );
}
