import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { MapPin, Clock, AlertTriangle, Truck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { WaterRequest } from "@/lib/supabase/types";

interface RequestCardProps {
  request: WaterRequest;
  showAcceptButton?: boolean;
  showDeliverButton?: boolean;
  onAcceptRequest?: (request: WaterRequest) => void;
  onDeliverRequest?: (request: WaterRequest) => void;
  currentTab?: string;
}

// Amount badge color mapping
function getAmountBadgeClasses(amount: number): string {
  switch (amount) {
    case 100:
      return "bg-gray-100 text-gray-800 border-gray-200";
    case 1000:
      return "bg-blue-100 text-blue-800 border-blue-200";
    case 5000:
      return "bg-green-100 text-green-800 border-green-200";
    case 10000:
      return "bg-purple-100 text-purple-800 border-purple-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

function formatAmount(amount: number): string {
  if (amount >= 1000) {
    return `${amount / 1000}kL`;
  }
  return `${amount}L`;
}

function truncateAddress(address: string, maxLength: number = 30): string {
  if (address.length <= maxLength) return address;
  return address.substring(0, maxLength) + "...";
}

export function RequestCard({
  request,
  showAcceptButton = false,
  showDeliverButton = false,
  onAcceptRequest,
  onDeliverRequest,
  currentTab,
}: RequestCardProps) {
  const timeAgo = formatDistanceToNow(new Date(request.created_at!), {
    addSuffix: true,
    locale: es,
  });

  const isUrgent = request.is_urgent === true;
  const customerName = request.guest_name || "Cliente";

  return (
    <Card
      className={`transition-shadow hover:shadow-md ${
        isUrgent ? "border-l-4 border-l-red-500" : ""
      }`}
      data-testid="request-card"
      data-urgent={isUrgent}
    >
      <CardContent className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Main info section */}
          <div className="flex-1 min-w-0">
            {/* Header with name and urgency */}
            <div className="flex items-center gap-2 mb-1">
              <h3
                className="font-semibold text-gray-900 truncate"
                data-testid="customer-name"
              >
                {customerName}
              </h3>
              {isUrgent && (
                <span
                  className="flex items-center gap-1 text-xs text-red-600 font-medium"
                  data-testid="urgency-indicator"
                >
                  <AlertTriangle className="w-3 h-3" />
                  Urgente
                </span>
              )}
            </div>

            {/* Address */}
            <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span
                className="truncate"
                data-testid="address"
                title={request.address}
              >
                {truncateAddress(request.address)}
              </span>
            </div>

            {/* Badges row */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className={getAmountBadgeClasses(request.amount)}
                data-testid="amount-badge"
              >
                {formatAmount(request.amount)}
              </Badge>

              <span
                className="flex items-center gap-1 text-xs text-gray-500"
                data-testid="time-ago"
              >
                <Clock className="w-3 h-3" />
                {timeAgo}
              </span>
            </div>
          </div>

          {/* Actions section - Full width on mobile, right-aligned on desktop */}
          <div className="flex gap-2 w-full sm:w-auto sm:flex-row sm:items-center">
            {/* Ver Detalles on left */}
            <Button
              size="lg"
              variant="outline"
              asChild
              className="flex-1 sm:flex-none"
              data-testid="view-details-button"
            >
              <Link href={`/requests/${request.id}${currentTab ? `?from=${currentTab}` : ""}`}>Ver Detalles</Link>
            </Button>
            {/* Aceptar on right (closer to right-handed thumb zone) */}
            {showAcceptButton && (
              <Button
                size="lg"
                onClick={() => onAcceptRequest?.(request)}
                className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700"
                data-testid="accept-button"
              >
                Aceptar
              </Button>
            )}
            {/* Marcar Entregado on right (for accepted requests) */}
            {showDeliverButton && (
              <Button
                size="lg"
                onClick={() => onDeliverRequest?.(request)}
                className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700"
                data-testid="deliver-button"
              >
                <Truck className="w-4 h-4 mr-2" />
                Marcar Entregado
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
