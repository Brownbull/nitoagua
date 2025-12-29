"use client";

import Link from "next/link";
import { MapPin, Droplets, Clock, Users, Zap, Banknote, Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import type { AvailableRequest } from "@/lib/actions/offers";

interface RequestCardProps {
  request: AvailableRequest;
}

/**
 * Request card component for provider request browser
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
    <Card
      className={`relative transition-all hover:shadow-md ${
        is_urgent ? "border-l-3 border-l-red-500" : ""
      }`}
      data-testid="request-card"
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between gap-2">
          {/* Left side: Location + details */}
          <div className="flex-1 min-w-0">
            {/* Location row */}
            <div className="flex items-center gap-1.5 mb-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-orange-500" />
              <span className="font-medium text-xs text-gray-800 truncate">
                {comuna_name || "Sin ubicación"}
              </span>
              {is_urgent && (
                <Badge
                  variant="destructive"
                  className="flex items-center gap-0.5 text-[10px] px-1.5 py-0 h-4"
                  data-testid="urgent-badge"
                >
                  <Zap className="h-2.5 w-2.5" />
                  Urgente
                </Badge>
              )}
            </div>

            {/* Details row */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
              {/* Amount */}
              <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                <Droplets className="h-3 w-3" />
                <span className="font-medium">{formatAmount(amount)}</span>
              </div>

              {/* Time */}
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{timePosted}</span>
              </div>

              {/* Offers */}
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>
                  {offer_count === 0 ? "0" : offer_count} {offer_count === 1 ? "oferta" : "ofertas"}
                </span>
              </div>

              {/* Payment Method - AC12.2.4 */}
              <div
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${
                  payment_method === "transfer"
                    ? "bg-purple-50 text-purple-700"
                    : "bg-green-50 text-green-700"
                }`}
                data-testid="payment-badge"
              >
                {payment_method === "transfer" ? (
                  <Building2 className="h-3 w-3" />
                ) : (
                  <Banknote className="h-3 w-3" />
                )}
                <span className="font-medium">
                  {payment_method === "transfer" ? "Transf." : "Efectivo"}
                </span>
              </div>
            </div>
          </div>

          {/* Right side: Action button */}
          <Button
            asChild
            size="sm"
            className="bg-orange-500 hover:bg-orange-600 text-xs h-8 px-3"
            data-testid="view-details-button"
          >
            <Link href={`/provider/requests/${id}`}>
              Ver
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton loading state for request card
 */
export function RequestCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardContent className="p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="h-3.5 w-3.5 bg-gray-200 rounded" />
              <div className="h-3 w-20 bg-gray-200 rounded" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-5 w-16 bg-gray-200 rounded" />
              <div className="h-3 w-14 bg-gray-200 rounded" />
              <div className="h-3 w-12 bg-gray-200 rounded" />
            </div>
          </div>
          <div className="h-8 w-12 bg-gray-200 rounded" />
        </div>
      </CardContent>
    </Card>
  );
}
