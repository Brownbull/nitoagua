"use client";

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
  // Count active (non-expired) offers for badge
  const activeOfferCount = offers.filter(
    (o) => o.status === "active" && new Date(o.expires_at) > new Date()
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
          {offers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              requestAmount={requestAmount}
              onSelect={onSelectOffer}
              isSelecting={selectingOfferId === offer.id}
              disabled={selectingOfferId !== null}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default OfferList;
