"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2, WifiOff, RefreshCw } from "lucide-react";
import { useConsumerOffers, ConsumerOffer } from "@/hooks/use-consumer-offers";
import { OfferList } from "@/components/consumer/offer-list";
import { OfferSelectionModal } from "@/components/consumer/offer-selection-modal";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { selectOffer } from "@/lib/actions/offers";

interface OffersClientProps {
  requestId: string;
  requestAmount: number;
  /** Initial offers from server (for guest access that bypasses RLS) */
  initialOffers?: ConsumerOffer[];
  /** Whether this is guest access (disables realtime, uses initial offers only) */
  isGuestAccess?: boolean;
  /** Tracking token for guest consumers (AC10.2.6) */
  trackingToken?: string;
}

/**
 * Offers Client Component
 * Integrates useConsumerOffers hook, OfferList, and selection modal
 *
 * Story 10-1: Display offer list with real-time updates
 * Story 10-2: Handle offer selection with confirmation modal
 *
 * AC10.1.4: List updates in real-time via Supabase Realtime
 * AC10.2.1: Tapping "Seleccionar" opens confirmation modal
 * AC10.2.7: Success toast after selection
 * AC10.2.8: Redirect to request status page after selection
 */
export function OffersClient({
  requestId,
  requestAmount,
  initialOffers = [],
  isGuestAccess = false,
  trackingToken,
}: OffersClientProps) {
  const router = useRouter();
  const [selectingOfferId, setSelectingOfferId] = useState<string | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<ConsumerOffer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  // For guests, disable the hook (RLS blocks client-side fetches)
  const {
    offers: realtimeOffers,
    loading,
    error,
    isConnected,
    refresh,
  } = useConsumerOffers(requestId, {
    enabled: !isGuestAccess, // Disable for guests - use initialOffers instead
  });

  // Use realtime offers for authenticated users, initial offers for guests
  const offers = useMemo(() => {
    if (isGuestAccess) {
      return initialOffers;
    }
    // For authenticated users, prefer realtime if available, fallback to initial
    return realtimeOffers.length > 0 ? realtimeOffers : initialOffers;
  }, [isGuestAccess, realtimeOffers, initialOffers]);

  // AC10.2.1: Handle offer selection - open confirmation modal
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

  // AC10.2.3: Handle confirmation - call selectOffer action
  const handleConfirmSelection = async () => {
    if (!selectedOffer) return;

    setIsConfirming(true);

    try {
      // Call server action with tracking token for guest support (AC10.2.6)
      const result = await selectOffer(
        selectedOffer.id,
        isGuestAccess ? trackingToken : undefined
      );

      if (!result.success) {
        // Show error toast
        toast.error("Error al seleccionar oferta", {
          description: result.error || "Por favor, intenta de nuevo",
        });
        return;
      }

      // AC10.2.7: Show success toast
      toast.success(`¡Listo! Tu pedido fue asignado a ${result.providerName}`, {
        description: "Te notificaremos cuando el repartidor esté en camino",
      });

      // Close modal
      setIsModalOpen(false);

      // AC10.2.8: Redirect to request status page
      if (isGuestAccess && trackingToken) {
        router.push(`/track/${trackingToken}`);
      } else {
        router.push(`/request/${requestId}`);
      }
    } catch (err) {
      console.error("[OffersClient] Selection error:", err);
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

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-2">Error al cargar ofertas</p>
        <p className="text-sm text-gray-500">{error}</p>
        <button
          onClick={refresh}
          className="mt-4 text-[#0077B6] hover:underline text-sm"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Determine loading state - for guests, we use server-provided data so no loading
  const isLoading = !isGuestAccess && loading && offers.length === 0;

  return (
    <div className="space-y-4">
      {/* Connection status indicator (only for authenticated users) */}
      {!isGuestAccess && !isConnected && !loading && (
        <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
          <WifiOff className="h-3 w-3" />
          <span>Conexión en tiempo real limitada - actualizando cada 30s</span>
        </div>
      )}

      {/* Guest refresh guidance (guest users don't have realtime) */}
      {isGuestAccess && offers.length > 0 && (
        <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
          <span>Las ofertas pueden actualizarse</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-[#0077B6] hover:text-[#005f8f]"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Actualizar
          </Button>
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div
          className="flex items-center justify-center py-4"
          aria-busy="true"
          aria-live="polite"
        >
          <Loader2
            className="h-5 w-5 animate-spin text-gray-400 mr-2"
            aria-hidden="true"
          />
          <span className="text-sm text-gray-500">Cargando ofertas...</span>
        </div>
      )}

      {/* Offer list component */}
      <OfferList
        offers={offers}
        requestAmount={requestAmount}
        loading={isLoading}
        onSelectOffer={handleSelectOffer}
        selectingOfferId={selectingOfferId}
      />

      {/* Realtime update indicator (only for authenticated users) */}
      {!isGuestAccess && isConnected && (
        <p className="text-center text-xs text-gray-400">
          Actualización en tiempo real activa
        </p>
      )}

      {/* Confirmation Modal - AC10.2.1, AC10.2.2 */}
      <OfferSelectionModal
        offer={selectedOffer}
        requestAmount={requestAmount}
        open={isModalOpen}
        onOpenChange={handleModalClose}
        onConfirm={handleConfirmSelection}
        isLoading={isConfirming}
      />
    </div>
  );
}

export default OffersClient;
