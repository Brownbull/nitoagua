"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useConsumerOffers, ConsumerOffer } from "@/hooks/use-consumer-offers";
import { OfferList } from "@/components/consumer/offer-list";
import { OfferSelectionModal } from "@/components/consumer/offer-selection-modal";
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
    <div className="space-y-3">
      {/* Offer list component */}
      <OfferList
        offers={offers}
        requestAmount={requestAmount}
        loading={isLoading}
        onSelectOffer={handleSelectOffer}
        selectingOfferId={selectingOfferId}
      />

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
