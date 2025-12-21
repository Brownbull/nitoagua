"use client";

import { useState, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Loader2 } from "lucide-react";
import { OfferCard } from "./offer-card";
import { formatCLP, getDeliveryPrice } from "@/lib/utils/commission";
import type { ConsumerOffer } from "@/hooks/use-consumer-offers";

interface OfferListProps {
  offers: ConsumerOffer[];
  requestAmount: number;
  loading?: boolean;
  onSelectOffer: (offerId: string) => void;
  selectingOfferId: string | null;
}

/**
 * Check if an offer is expired (by status or timestamp)
 */
function isOfferExpired(
  offer: ConsumerOffer,
  expiredIds: Set<string>
): boolean {
  return (
    offer.status === "expired" ||
    new Date(offer.expires_at) < new Date() ||
    expiredIds.has(offer.id)
  );
}

/**
 * Empty State Component - Mockup aligned
 * AC10.1.5: "Esperando ofertas de repartidores..." with timeout notice
 */
function EmptyState() {
  return (
    <div className="bg-[#FEF3C7] rounded-2xl p-6 text-center">
      <div className="w-14 h-14 rounded-full bg-[#FDE68A] flex items-center justify-center mx-auto mb-4">
        <Clock className="h-7 w-7 text-[#B45309]" aria-hidden="true" />
      </div>
      <p
        className="text-lg font-semibold text-[#92400E] mb-2"
        data-testid="empty-state-heading"
      >
        Esperando ofertas de repartidores...
      </p>
      <p className="text-sm text-[#A16207] mb-4">
        Tu solicitud fue enviada a los aguateros de la zona
      </p>
      <p
        className="text-sm text-[#B45309] bg-[#FDE68A] rounded-xl px-4 py-2.5 inline-block"
        data-testid="timeout-notice"
      >
        Si no recibes ofertas en 4 horas, te notificaremos
      </p>
    </div>
  );
}

/**
 * Loading State Component
 */
function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Loader2 className="h-8 w-8 animate-spin text-[#0077B6]" />
      <p className="text-sm text-gray-500 mt-2">Cargando ofertas...</p>
    </div>
  );
}

/**
 * Summary Stats Component - Mockup design
 * Shows active offer count and lowest price
 */
function SummaryStats({
  activeCount,
  lowestPrice,
}: {
  activeCount: number;
  lowestPrice: number;
}) {
  return (
    <div className="flex justify-center gap-12 py-4 mb-2">
      <div className="text-center">
        <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
        <p className="text-xs text-gray-500">Ofertas activas</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-gray-900">{formatCLP(lowestPrice)}</p>
        <p className="text-xs text-gray-500">Menor precio</p>
      </div>
    </div>
  );
}

/**
 * Offer List Component - Mockup aligned
 * AC10.1.1: Consumer sees "Ofertas Recibidas" section with count badge
 * AC10.1.3: Offers sorted by delivery window (soonest first) - handled by hook
 * AC10.1.5: Empty state with appropriate messaging
 * AC10.3.6: Expired offers sorted to bottom with visual fade
 */
export function OfferList({
  offers,
  requestAmount,
  loading = false,
  onSelectOffer,
  selectingOfferId,
}: OfferListProps) {
  // Track offers that expired during viewing - AC10.3.4
  const [expiredDuringView, setExpiredDuringView] = useState<Set<string>>(
    new Set()
  );

  // Handle when an offer expires - AC10.3.4, AC10.3.6
  const handleOfferExpire = useCallback((offerId: string) => {
    setExpiredDuringView((prev) => {
      const next = new Set(prev);
      next.add(offerId);
      return next;
    });
  }, []);

  // Sort offers: active first (by delivery window), then expired - AC10.3.6
  const sortedOffers = useMemo(() => {
    return [...offers].sort((a, b) => {
      const aExpired = isOfferExpired(a, expiredDuringView);
      const bExpired = isOfferExpired(b, expiredDuringView);

      // Expired offers go to bottom
      if (aExpired && !bExpired) return 1;
      if (!aExpired && bExpired) return -1;

      // Within same group, sort by delivery window (soonest first)
      return (
        new Date(a.delivery_window_start).getTime() -
        new Date(b.delivery_window_start).getTime()
      );
    });
  }, [offers, expiredDuringView]);

  // Count active (non-expired) offers
  const activeOfferCount = offers.filter(
    (o) => !isOfferExpired(o, expiredDuringView)
  ).length;

  // Calculate lowest price from request amount
  const lowestPrice = getDeliveryPrice(requestAmount);

  // Find the best offer (first active one after sorting)
  const bestOfferId = sortedOffers.find(
    (o) => !isOfferExpired(o, expiredDuringView)
  )?.id;

  if (loading) {
    return <LoadingState />;
  }

  // Empty state
  if (offers.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-3">
      {/* Summary Stats - Mockup design */}
      <SummaryStats activeCount={activeOfferCount} lowestPrice={lowestPrice} />

      {/* Offer cards */}
      <div className="space-y-3" data-testid="offers-container">
        {sortedOffers.map((offer, index) => (
          <OfferCard
            key={offer.id}
            offer={offer}
            requestAmount={requestAmount}
            onSelect={onSelectOffer}
            isSelecting={selectingOfferId === offer.id}
            disabled={selectingOfferId !== null}
            onExpire={handleOfferExpire}
            isBestOffer={offer.id === bestOfferId}
            isFirstCard={index === 0 && !isOfferExpired(offer, expiredDuringView)}
          />
        ))}
      </div>
    </div>
  );
}

export default OfferList;
