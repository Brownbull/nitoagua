"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  CheckCircle,
  XCircle,
  Clock,
  Timer,
  AlertCircle,
  User,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Offer {
  id: string;
  provider_id: string;
  provider_name: string;
  delivery_window_start: string;
  delivery_window_end: string;
  status: string;
  created_at: string;
  accepted_at: string | null;
}

interface OfferAnalytics {
  total_offers: number;
  time_to_first_offer: number | null;
  time_to_selection: number | null;
}

interface OrderOfferHistoryProps {
  offers: Offer[];
  analytics: OfferAnalytics;
}

const OFFER_STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  active: { label: "Activa", color: "text-blue-700", bgColor: "bg-blue-100", icon: Clock },
  accepted: { label: "Aceptada", color: "text-green-700", bgColor: "bg-green-100", icon: CheckCircle },
  expired: { label: "Expirada", color: "text-amber-700", bgColor: "bg-amber-100", icon: Timer },
  cancelled: { label: "Cancelada", color: "text-red-700", bgColor: "bg-red-100", icon: XCircle },
  request_filled: { label: "Otra elegida", color: "text-gray-600", bgColor: "bg-gray-100", icon: AlertCircle },
};

export function OrderOfferHistory({ offers, analytics }: OrderOfferHistoryProps) {
  if (offers.length === 0) {
    return (
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Historial de Ofertas
        </h2>
        <div className="text-center py-6">
          <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 font-medium">Sin ofertas</p>
          <p className="text-gray-400 text-sm mt-1">
            Este pedido aun no ha recibido ofertas de proveedores
          </p>
        </div>
      </div>
    );
  }

  // Find accepted offer
  const acceptedOffer = offers.find(o => o.status === "accepted");

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Historial de Ofertas
        </h2>
        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
          {offers.length} oferta{offers.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Accepted Offer Highlight */}
      {acceptedOffer && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-green-800">Oferta Aceptada</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-green-700">
              <User className="w-4 h-4" />
              {acceptedOffer.provider_name}
            </div>
            <div className="flex items-center gap-2 text-green-700">
              <Calendar className="w-4 h-4" />
              {format(new Date(acceptedOffer.delivery_window_start), "d MMM, HH:mm", { locale: es })} - {format(new Date(acceptedOffer.delivery_window_end), "HH:mm", { locale: es })}
            </div>
          </div>
        </div>
      )}

      {/* All Offers List */}
      <div className="space-y-3">
        {offers.map((offer) => {
          const statusConfig = OFFER_STATUS_CONFIG[offer.status] || OFFER_STATUS_CONFIG.active;
          const StatusIcon = statusConfig.icon;
          const isAccepted = offer.status === "accepted";

          return (
            <div
              key={offer.id}
              className={cn(
                "p-3 rounded-lg border transition-colors",
                isAccepted
                  ? "border-green-200 bg-green-50/50"
                  : "border-gray-100 bg-gray-50/50 hover:bg-gray-50"
              )}
              data-testid={`offer-${offer.id}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">{offer.provider_name}</span>
                    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold", statusConfig.bgColor, statusConfig.color)}>
                      <StatusIcon className="w-3 h-3" />
                      {statusConfig.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Ventana: {format(new Date(offer.delivery_window_start), "HH:mm", { locale: es })} - {format(new Date(offer.delivery_window_end), "HH:mm", { locale: es })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Creada: {format(new Date(offer.created_at), "d MMM, HH:mm", { locale: es })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Summary */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-bold text-gray-900">{analytics.total_offers}</p>
            <p className="text-xs text-gray-500">Total ofertas</p>
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">
              {analytics.time_to_first_offer !== null ? `${analytics.time_to_first_offer}m` : "-"}
            </p>
            <p className="text-xs text-gray-500">Primera oferta</p>
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">
              {analytics.time_to_selection !== null ? `${analytics.time_to_selection}m` : "-"}
            </p>
            <p className="text-xs text-gray-500">Tiempo seleccion</p>
          </div>
        </div>
      </div>
    </div>
  );
}
