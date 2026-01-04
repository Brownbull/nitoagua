"use client";

import Link from "next/link";
import { MapPin, Droplets, Clock, Users, Zap, Banknote, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import type { AvailableRequest } from "@/lib/actions/offers";

interface RequestCardProps {
  request: AvailableRequest;
}

/**
 * Request card component for provider request browser - Optimized compact layout
 * AC: 8.1.2 - Shows: location (comuna), amount, urgency, time posted, offer count
 */
export function RequestCard({ request }: RequestCardProps) {
  const {
    id,
    comuna_name,
    amount,
    is_urgent,
    payment_method,
    created_at,
    offer_count,
  } = request;

  // Format amount for display (e.g., "5,000 litros")
  const formatAmount = (liters: number) => {
    if (liters >= 1000) {
      return `${(liters / 1000).toLocaleString("es-CL")} mil litros`;
    }
    return `${liters.toLocaleString("es-CL")} litros`;
  };

  // Format time since posted (e.g., "Hace 15 min")
  const timePosted = created_at
    ? formatDistanceToNow(new Date(created_at), {
        addSuffix: true,
        locale: es,
      })
    : "Recién publicado";

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 px-3 py-3 ${
        is_urgent ? "border-l-[3px] border-l-red-500" : ""
      }`}
      data-testid="request-card"
    >
      {/* Row 1: Location + Urgent badge */}
      <div className="flex items-center gap-2 mb-2">
        <MapPin className="h-5 w-5 shrink-0 text-orange-500" />
        <span className="font-semibold text-base text-gray-900 truncate">
          {comuna_name || "Sin ubicación"}
        </span>
        {is_urgent && (
          <Badge
            variant="destructive"
            className="flex items-center gap-0.5 text-xs px-2 py-0.5 h-5 ml-auto shrink-0"
            data-testid="urgent-badge"
          >
            <Zap className="h-3 w-3" />
            Urgente
          </Badge>
        )}
      </div>

      {/* Row 2: Amount, time, offers, payment - inline */}
      <div className="flex items-center gap-x-4 gap-y-1 flex-wrap text-xs text-gray-600 mb-3">
        <span className="flex items-center gap-1">
          <Droplets className="h-4 w-4 text-blue-500" />
          <span className="font-semibold">{formatAmount(amount)}</span>
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {timePosted}
        </span>
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          {offer_count === 0 ? "0" : offer_count} {offer_count === 1 ? "oferta" : "ofertas"}
        </span>
        <span
          className={`flex items-center gap-1 ${
            payment_method === "transfer" ? "text-purple-600" : "text-green-600"
          }`}
          data-testid="payment-badge"
        >
          {payment_method === "transfer" ? (
            <Building2 className="h-3.5 w-3.5" />
          ) : (
            <Banknote className="h-3.5 w-3.5" />
          )}
          <span className="font-medium">
            {payment_method === "transfer" ? "Transferencia" : "Efectivo"}
          </span>
        </span>
      </div>

      {/* Row 3: Action button - full width */}
      <Button
        asChild
        size="sm"
        className="w-full bg-orange-500 hover:bg-orange-600 h-10 text-sm font-medium"
        data-testid="view-details-button"
      >
        <Link href={`/provider/requests/${id}`}>
          Ver
        </Link>
      </Button>
    </div>
  );
}

/**
 * Skeleton loading state for request card
 */
export function RequestCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 px-3 py-3 animate-pulse">
      {/* Row 1: Location */}
      <div className="flex items-center gap-2 mb-2">
        <div className="h-5 w-5 bg-gray-200 rounded" />
        <div className="h-5 w-28 bg-gray-200 rounded" />
      </div>
      {/* Row 2: Details */}
      <div className="flex items-center gap-4 mb-3">
        <div className="h-4 w-20 bg-gray-200 rounded" />
        <div className="h-4 w-16 bg-gray-200 rounded" />
        <div className="h-4 w-14 bg-gray-200 rounded" />
      </div>
      {/* Row 3: Button */}
      <div className="h-10 w-full bg-gray-200 rounded" />
    </div>
  );
}
