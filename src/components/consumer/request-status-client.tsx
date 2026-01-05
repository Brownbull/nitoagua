"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Droplets,
  MapPin,
  Calendar,
  FileText,
  RotateCcw,
  Loader2,
  MessageCircle,
  AlertTriangle,
  CheckCircle,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { type RequestStatus } from "@/components/shared/status-badge";
import { GradientHeader } from "@/components/consumer/gradient-header";
import { TimelineTracker } from "@/components/consumer/timeline-tracker";
import { StatusCard, SupplierInfo, CallButton } from "@/components/consumer/status-card";
import { CancelRequestButton } from "@/components/consumer/cancel-request-button";
import { NegativeStatusCard } from "@/components/consumer/negative-status-card";
import { OfferList } from "@/components/consumer/offer-list";
import { OfferSelectionModal } from "@/components/consumer/offer-selection-modal";
import { DisputeDialog } from "@/components/consumer/dispute-dialog";
import { RatingDialog } from "@/components/consumer/rating-dialog";
import { getRatingByRequest, type Rating } from "@/lib/actions/ratings";
import {
  formatDateSpanish,
  formatShortDate,
} from "@/lib/utils/format";
import { useRequestPolling } from "@/hooks/use-request-polling";
import { useConsumerOffers, ConsumerOffer } from "@/hooks/use-consumer-offers";
import { selectOffer } from "@/lib/actions/offers";
import { notifyStatusChange } from "@/lib/notifications";
import { type DisputeStatus } from "@/lib/actions/disputes";

// Dispute interface for API response
interface Dispute {
  id: string;
  request_id: string;
  consumer_id: string;
  provider_id: string;
  dispute_type: string;
  description: string | null;
  evidence_url: string | null;
  status: DisputeStatus;
  resolution_notes: string | null;
  resolved_by: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

// Display labels for dispute status (Spanish) - defined locally to avoid server action export issues
const DISPUTE_STATUS_LABELS: Record<DisputeStatus, string> = {
  open: "Abierta",
  under_review: "En revisión",
  resolved_consumer: "Resuelta (a tu favor)",
  resolved_provider: "Resuelta (a favor del proveedor)",
  closed: "Cerrada",
};

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
  consumer_id: string | null; // AC12.3: To compare with cancelled_by
  cancelled_by: string | null; // AC12.3.2/3: Who cancelled the request
  cancellation_reason: string | null; // AC12.3.2/3: Reason for cancellation
  cancelled_at: string | null; // AC12.3.2/3: When it was cancelled
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

  // Dispute state - AC12.7.5.1
  const [isDisputeDialogOpen, setIsDisputeDialogOpen] = useState(false);
  const [canDispute, setCanDispute] = useState(false);
  const [disputeReason, setDisputeReason] = useState<string | null>(null);
  const [existingDispute, setExistingDispute] = useState<Dispute | null>(null);
  const [disputeLoading, setDisputeLoading] = useState(true); // Start as loading
  const [disputeError, setDisputeError] = useState(false);

  // Rating state - AC12.7.13.1
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);
  const [existingRating, setExistingRating] = useState<Rating | null>(null);
  const [ratingLoading, setRatingLoading] = useState(true);
  const [hasShownRatingPrompt, setHasShownRatingPrompt] = useState(false);

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

  // Check dispute eligibility for delivered requests - AC12.7.5.1
  useEffect(() => {
    const currentStatus = polledStatus || initialRequest.status;
    if (currentStatus !== "delivered") {
      setCanDispute(false);
      setExistingDispute(null);
      setDisputeLoading(false);
      setDisputeError(false);
      return;
    }

    const checkDispute = async () => {
      setDisputeLoading(true);
      setDisputeError(false);
      try {
        // Use API route instead of server action
        const response = await fetch(`/api/disputes?requestId=${initialRequest.id}`);
        const result = await response.json();

        if (result.success && result.data) {
          if (result.data.existingDispute) {
            setExistingDispute(result.data.existingDispute);
            setCanDispute(false);
          } else {
            setCanDispute(result.data.canFile);
            setDisputeReason(result.data.reason || null);
          }
        } else {
          // API returned error, allow filing by default within window
          console.warn("[RequestStatusClient] Dispute API error:", result.error);
          setCanDispute(true);
        }
      } catch (err) {
        console.error("[RequestStatusClient] Dispute check error:", err);
        // On error, show the button anyway - let the dialog handle validation
        setCanDispute(true);
        setDisputeError(true);
      } finally {
        setDisputeLoading(false);
      }
    };

    checkDispute();
  }, [initialRequest.id, polledStatus, initialRequest.status]);

  // Check for existing rating and show prompt for delivered requests - AC12.7.13.1
  useEffect(() => {
    const currentStatus = polledStatus || initialRequest.status;
    if (currentStatus !== "delivered") {
      setExistingRating(null);
      setRatingLoading(false);
      return;
    }

    const checkRating = async () => {
      setRatingLoading(true);
      try {
        const result = await getRatingByRequest(initialRequest.id);
        if (result.success) {
          setExistingRating(result.data ?? null);
          // Show rating prompt automatically if no existing rating and haven't shown yet
          if (!result.data && !hasShownRatingPrompt) {
            setIsRatingDialogOpen(true);
            setHasShownRatingPrompt(true);
          }
        }
      } catch (err) {
        console.error("[RequestStatusClient] Rating check error:", err);
      } finally {
        setRatingLoading(false);
      }
    };

    checkRating();
  }, [initialRequest.id, polledStatus, initialRequest.status, hasShownRatingPrompt]);

  // Handle dispute created - reload to show updated state
  const handleDisputeCreated = () => {
    window.location.reload();
  };

  // Handle rating submitted - refresh to show updated state
  const handleRatingSubmitted = () => {
    // Reload to refresh any rating displays
    window.location.reload();
  };

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
    <div className="min-h-dvh bg-gray-50 flex flex-col">
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
                <div className="w-9 h-9 rounded-xl bg-[#DBEAFE] flex items-center justify-center shrink-0">
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
                <div className="w-9 h-9 rounded-xl bg-[#E0E7FF] flex items-center justify-center shrink-0">
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

            {/* Rating Section - AC12.7.13.1 */}
            <div className="bg-white rounded-xl p-4 shadow-sm mb-4" data-testid="rating-section">
              {ratingLoading ? (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                </div>
              ) : existingRating ? (
                // Show existing rating with option to update
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-yellow-100 flex items-center justify-center shrink-0">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-400" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Tu calificación</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= existingRating.rating
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsRatingDialogOpen(true)}
                    className="text-[#0077B6] hover:text-[#005f8f]"
                    data-testid="edit-rating-button"
                  >
                    Editar
                  </Button>
                </div>
              ) : (
                // Show rating prompt
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-yellow-600">
                    <Star className="h-4 w-4 fill-yellow-400" />
                    <span className="text-sm font-medium">¿Cómo fue tu experiencia?</span>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-yellow-300 text-yellow-700 hover:bg-yellow-50 hover:text-yellow-800"
                    onClick={() => setIsRatingDialogOpen(true)}
                    data-testid="rate-button"
                  >
                    <Star className="mr-2 h-4 w-4 fill-yellow-400" />
                    Calificar Entrega
                  </Button>
                </div>
              )}
            </div>

            {/* Reorder button - primary action */}
            <Button
              asChild
              className="w-full bg-[#10B981] hover:bg-[#059669] rounded-xl py-4 text-base font-semibold shadow-[0_4px_14px_rgba(16,185,129,0.3)] mb-4"
            >
              <Link href="/">
                <RotateCcw className="mr-2 h-5 w-5" />
                Solicitar Agua de Nuevo
              </Link>
            </Button>

            {/* Dispute Section - AC12.7.5.1, AC12.7.5.4 - at the end after primary action */}
            <div className="bg-white rounded-xl p-4 shadow-sm" data-testid="dispute-section">
              {disputeLoading ? (
                // Loading state
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                  <span className="ml-2 text-sm text-gray-500">Cargando...</span>
                </div>
              ) : existingDispute ? (
                // Show existing dispute status with resolution-specific content
                <div>
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      existingDispute.status === "resolved_consumer"
                        ? "bg-green-100"
                        : existingDispute.status === "resolved_provider"
                          ? "bg-gray-100"
                          : "bg-amber-100"
                    }`}>
                      {existingDispute.status === "resolved_consumer" ? (
                        <CheckCircle className="h-4 w-4 text-green-600" aria-hidden="true" />
                      ) : existingDispute.status === "resolved_provider" ? (
                        <MessageCircle className="h-4 w-4 text-gray-600" aria-hidden="true" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden="true" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900" data-testid="dispute-status-label">
                        {existingDispute.status === "resolved_consumer"
                          ? "Disputa resuelta a tu favor"
                          : existingDispute.status === "resolved_provider"
                            ? "Disputa cerrada"
                            : "Disputa en revisión"}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5" data-testid="dispute-status-value">
                        {DISPUTE_STATUS_LABELS[existingDispute.status]}
                      </p>
                    </div>
                    <CheckCircle className={`h-5 w-5 shrink-0 ${
                      existingDispute.status === "resolved_consumer"
                        ? "text-green-500"
                        : existingDispute.status === "resolved_provider"
                          ? "text-gray-400"
                          : "text-amber-500"
                    }`} />
                  </div>

                  {/* Resolution-specific messages */}
                  {existingDispute.status === "resolved_consumer" && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800 mb-2">
                        Lamentamos mucho los inconvenientes que esto te ha causado. Tu experiencia es muy importante para nosotros y trabajamos constantemente para mejorar nuestro servicio.
                      </p>
                      {existingDispute.resolution_notes && (
                        <p className="text-xs text-green-700 mb-3 italic">
                          &quot;{existingDispute.resolution_notes}&quot;
                        </p>
                      )}
                      <Button
                        asChild
                        size="sm"
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <Link href="/request">
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Intentar de Nuevo
                        </Link>
                      </Button>
                    </div>
                  )}

                  {existingDispute.status === "resolved_provider" && (
                    <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-sm text-gray-700 mb-2">
                        Después de revisar tu caso, no encontramos evidencia suficiente para proceder con tu reclamo. Si crees que hubo un error, puedes contactar a soporte.
                      </p>
                      {existingDispute.resolution_notes && (
                        <p className="text-xs text-gray-600 italic">
                          &quot;{existingDispute.resolution_notes}&quot;
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : canDispute ? (
                // Show dispute button - AC12.7.5.1
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-amber-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">¿Hay algún problema?</span>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 hover:text-amber-800"
                    onClick={() => setIsDisputeDialogOpen(true)}
                    data-testid="dispute-button"
                  >
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Reportar Problema
                  </Button>
                </div>
              ) : disputeReason ? (
                // Show reason why can't dispute
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span data-testid="dispute-unavailable-reason">{disputeReason}</span>
                </div>
              ) : (
                // Default fallback - show button anyway
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-amber-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">¿Hay algún problema?</span>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 hover:text-amber-800"
                    onClick={() => setIsDisputeDialogOpen(true)}
                    data-testid="dispute-button"
                  >
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Reportar Problema
                  </Button>
                </div>
              )}
            </div>

            {/* Dispute Dialog */}
            <DisputeDialog
              requestId={request.id}
              open={isDisputeDialogOpen}
              onOpenChange={setIsDisputeDialogOpen}
              onDisputeCreated={handleDisputeCreated}
            />

            {/* Rating Dialog - AC12.7.13.1 */}
            <RatingDialog
              requestId={request.id}
              open={isRatingDialogOpen}
              onOpenChange={setIsRatingDialogOpen}
              onRatingSubmitted={handleRatingSubmitted}
              providerName={request.profiles?.name}
            />
          </>
        )}

        {/* Status-specific content: Cancelled - AC12.3.2 & AC12.3.3 */}
        {isCancelled && (
          <NegativeStatusCard
            variant={
              // Determine if cancelled by user or provider
              // If cancelled_by === consumer_id OR cancelled_by is null, it's user cancellation
              // Otherwise it's provider cancellation
              request.cancelled_by === null ||
              request.cancelled_by === request.consumer_id
                ? "cancelled_by_user"
                : "cancelled_by_provider"
            }
            cancelledAt={request.cancelled_at}
            cancellationReason={request.cancellation_reason}
          />
        )}

        {/* Status-specific content: No Offers - AC12.3.1 */}
        {isNoOffers && (
          <div data-testid="no-offers-card">
            <NegativeStatusCard
              variant="no_offers"
              createdAt={request.created_at}
            />
          </div>
        )}

        {/* Request Details - Compact version */}
        <div className="bg-white rounded-2xl p-4 mt-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Detalles</h3>

          <div className="space-y-3">
            {/* Amount */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#DBEAFE] flex items-center justify-center shrink-0">
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
              <div className="w-9 h-9 rounded-xl bg-[#D1FAE5] flex items-center justify-center shrink-0">
                <MapPin className="h-4 w-4 text-[#065F46]" aria-hidden="true" />
              </div>
              <span className="text-sm text-gray-700 pt-2">{request.address}</span>
            </div>

            {/* Date */}
            {request.created_at && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
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
                <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
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
