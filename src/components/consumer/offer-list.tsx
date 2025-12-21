"use client";

import { useState, useMemo, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Loader2 } from "lucide-react";
import { OfferCard } from "./offer-card";
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
 * Empty State Component
 * AC10.1.5: "Esperando ofertas de repartidores..." with timeout notice
 */
function EmptyState() {
  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-3">
            <Clock className="h-6 w-6 text-amber-600 animate-pulse" aria-hidden="true" />
          </div>
          <p
            className="text-lg font-medium text-amber-800 mb-1"
            data-testid="empty-state-heading"
          >
            Esperando ofertas de repartidores...
          </p>
          <p className="text-sm text-amber-700 mb-3">
            Tu solicitud fue enviada a los aguateros de la zona
          </p>
          <p
            className="text-xs text-amber-600 bg-amber-100 rounded-lg px-3 py-2"
            data-testid="timeout-notice"
          >
            Si no recibes ofertas en 4 horas, te notificaremos
          </p>
        </div>
      </CardContent>
    </Card>
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
 * Offer List Component
 * AC10.1.1: Consumer sees "Ofertas Recibidas" section with count badge
 * AC10.1.3: Offers sorted by delivery window (soonest first) - handled by hook
 * AC10.1.5: Empty state with appropriate messaging
 * AC10.3.6: Expired offers sorted to bottom with visual fade
 *
 * Pattern follows Epic 8 provider offer list patterns
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

  // Count active (non-expired) offers for badge
  const activeOfferCount = offers.filter(
    (o) => !isOfferExpired(o, expiredDuringView)
  ).length;

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-4">
      {/* Header with count badge - AC10.1.1 */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Ofertas Recibidas
        </h2>
        <Badge
          className={`${
            activeOfferCount > 0
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-600"
          }`}
          data-testid="offer-count-badge"
        >
          {activeOfferCount === 1
            ? "1 oferta"
            : `${activeOfferCount} ofertas`}
        </Badge>
      </div>

      {/* Offer cards or empty state - AC10.1.5 */}
      {offers.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3" data-testid="offers-container">
          {sortedOffers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              requestAmount={requestAmount}
              onSelect={onSelectOffer}
              isSelecting={selectingOfferId === offer.id}
              disabled={selectingOfferId !== null}
              onExpire={handleOfferExpire}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default OfferList;
