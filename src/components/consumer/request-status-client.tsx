"use client";

import Link from "next/link";
import {
  Phone,
  Droplets,
  MapPin,
  Calendar,
  Truck,
  Clock,
  Package,
  FileText,
  CheckCircle,
  RotateCcw,
  XCircle,
  Loader2,
  Eye,
  AlertTriangle,
  MessageCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, type RequestStatus } from "@/components/shared/status-badge";
import { StatusTracker } from "@/components/consumer/status-tracker";
import { CancelRequestButton } from "@/components/consumer/cancel-request-button";
import {
  formatDateSpanish,
  formatShortDate,
  formatPhone,
} from "@/lib/utils/format";
import { useRequestPolling } from "@/hooks/use-request-polling";
import { notifyStatusChange } from "@/lib/notifications";

interface RequestWithSupplier {
  id: string;
  status: string;
  amount: number;
  address: string;
  special_instructions: string | null;
  is_urgent: boolean;
  created_at: string | null;
  accepted_at: string | null;
  delivered_at: string | null;
  delivery_window: string | null;
  supplier_id: string | null;
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
 *
 * Polls for status updates every 30 seconds and shows toast
 * notifications when status changes. Used by registered consumers.
 *
 * AC5-3-1: Toast notification appears when status changes
 * AC5-3-3: Request status page auto-updates (30 second polling)
 * AC5-3-4: Notifications are user-specific (API validates consumer_id)
 * AC5-3-5: Graceful degradation (polling errors logged, not shown)
 */
export function RequestStatusClient({ initialRequest }: RequestStatusClientProps) {
  const { status: polledStatus, isPolling, data: polledData } = useRequestPolling(
    initialRequest.id,
    initialRequest.status,
    {
      interval: 30000,
      enabled: true,
      onStatusChange: (from, to, data) => {
        // Show toast notification on status change (AC5-3-1)
        notifyStatusChange(to, data.delivery_window as string | null | undefined);
      },
    }
  );

  // Merge polled data with initial request
  const request: RequestWithSupplier = polledData
    ? {
        ...initialRequest,
        status: polledData.status,
        accepted_at: (polledData.accepted_at as string) ?? initialRequest.accepted_at,
        delivered_at: (polledData.delivered_at as string) ?? initialRequest.delivered_at,
        delivery_window: (polledData.delivery_window as string) ?? initialRequest.delivery_window,
        supplier_id: (polledData.supplier_id as string) ?? initialRequest.supplier_id,
      }
    : { ...initialRequest, status: polledStatus };

  const status = request.status as RequestStatus;
  const isAccepted = status === "accepted";
  const isDelivered = status === "delivered";
  const isPending = status === "pending";
  const isCancelled = status === "cancelled";
  const isNoOffers = status === "no_offers";

  return (
    <div className="py-6 px-4">
      {/* Polling Indicator (AC5-3-3: subtle loading indicator) */}
      {isPolling && (
        <div className="fixed top-4 right-4 z-50">
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-sm border border-gray-200">
            <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
            <span className="text-xs text-gray-500">Actualizando...</span>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header with Status Badge */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Estado de tu solicitud
          </h1>
          <StatusBadge status={status} />
        </div>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Progreso</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusTracker
              currentStatus={status}
              createdAt={request.created_at || new Date().toISOString()}
              acceptedAt={request.accepted_at}
              deliveredAt={request.delivered_at}
              formatDate={formatShortDate}
            />
          </CardContent>
        </Card>

        {/* Request Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Detalles de la solicitud</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Request Date */}
            {request.created_at && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-5 w-5 text-purple-600" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fecha de solicitud</p>
                  <p className="font-medium">{formatDateSpanish(request.created_at)}</p>
                </div>
              </div>
            )}

            {/* Amount */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Droplets className="h-5 w-5 text-blue-600" aria-hidden="true" />
              </div>
              <div className="flex items-center gap-2">
                <div>
                  <p className="text-sm text-gray-500">Cantidad</p>
                  <p className="font-medium">{request.amount.toLocaleString("es-CL")}L</p>
                </div>
                {request.is_urgent && (
                  <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                    Urgente
                  </span>
                )}
              </div>
            </div>

            {/* Address (full address for authenticated owner) */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <MapPin className="h-5 w-5 text-green-600" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Direccion</p>
                <p className="font-medium">{request.address}</p>
              </div>
            </div>

            {/* Special Instructions */}
            {request.special_instructions && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 text-orange-600" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Instrucciones especiales</p>
                  <p className="font-medium">{request.special_instructions}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status-specific content: Pending */}
        {isPending && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-3">
                  <Clock className="h-6 w-6 text-amber-600" aria-hidden="true" />
                </div>
                <p className="text-lg font-medium text-amber-800 mb-1">
                  Esperando ofertas de repartidores
                </p>
                <p className="text-sm text-amber-700">
                  Te notificaremos cuando recibas ofertas
                </p>
              </div>
            </CardContent>
            {/* AC10.1.1: Ver Ofertas button with offer count badge */}
            <div className="px-6 pb-4 space-y-3">
              <Button
                asChild
                className="w-full bg-[#0077B6] hover:bg-[#005f8f]"
                data-testid="view-offers-button"
              >
                <Link href={`/request/${request.id}/offers`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Ofertas
                </Link>
              </Button>
              <CancelRequestButton requestId={request.id} />
            </div>
          </Card>
        )}

        {/* Status-specific content: Accepted */}
        {isAccepted && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-blue-600" aria-hidden="true" />
                <CardTitle className="text-lg text-blue-800">
                  Confirmado! Tu agua viene en camino
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Supplier Info */}
              {request.profiles?.name && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Truck className="h-5 w-5 text-blue-600" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-600">Aguatero</p>
                    <p className="font-medium text-blue-900">{request.profiles.name}</p>
                  </div>
                </div>
              )}

              {/* Supplier Phone */}
              {request.profiles?.phone && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-5 w-5 text-blue-600" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-600">Telefono</p>
                    <a
                      href={`tel:${request.profiles.phone}`}
                      className="font-medium text-blue-900 hover:underline"
                    >
                      {formatPhone(request.profiles.phone)}
                    </a>
                  </div>
                </div>
              )}

              {/* Delivery Window */}
              {request.delivery_window && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-5 w-5 text-blue-600" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-600">Ventana de entrega</p>
                    <p className="font-medium text-blue-900">{request.delivery_window}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Status-specific content: Delivered */}
        {isDelivered && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                  <Package className="h-6 w-6 text-green-600" aria-hidden="true" />
                </div>
                <p className="text-lg font-semibold text-green-800 mb-1">
                  Entrega completada
                </p>
                {request.delivered_at && (
                  <p className="text-green-700">
                    Entregado el {formatDateSpanish(request.delivered_at)}
                  </p>
                )}
              </div>
            </CardContent>
            {/* Quick reorder button */}
            <div className="px-6 pb-6">
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                asChild
              >
                <Link href="/request">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Solicitar Agua de Nuevo
                </Link>
              </Button>
            </div>
          </Card>
        )}

        {/* Status-specific content: Cancelled */}
        {isCancelled && (
          <Card className="border-gray-200 bg-gray-50">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <XCircle className="h-6 w-6 text-gray-500" aria-hidden="true" />
                </div>
                <p className="text-lg font-semibold text-gray-700 mb-1">
                  Solicitud cancelada
                </p>
                <p className="text-sm text-gray-500">
                  Esta solicitud fue cancelada y no sera procesada
                </p>
              </div>
            </CardContent>
            <div className="px-6 pb-6">
              <Button
                variant="outline"
                className="w-full"
                asChild
              >
                <Link href="/request">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Nueva Solicitud
                </Link>
              </Button>
            </div>
          </Card>
        )}

        {/* Status-specific content: No Offers (Timeout) */}
        {/* AC10.4.5: Orange badge with "Sin Ofertas" */}
        {/* AC10.4.6: Empathetic message */}
        {/* AC10.4.7: "Nueva Solicitud" button */}
        {/* AC10.4.8: "Contactar Soporte" WhatsApp link */}
        {isNoOffers && (
          <Card className="border-orange-200 bg-orange-50" data-testid="no-offers-card">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-3">
                  <AlertTriangle className="h-6 w-6 text-orange-600" aria-hidden="true" />
                </div>
                <p className="text-lg font-semibold text-orange-800 mb-1" data-testid="no-offers-title">
                  Sin Ofertas
                </p>
                <p className="text-sm text-orange-700 mb-2" data-testid="no-offers-message">
                  Lo sentimos, no hay aguateros disponibles ahora
                </p>
                <p className="text-xs text-orange-600">
                  Tu solicitud no recibió ofertas en las últimas 4 horas.
                  Esto puede ocurrir en horarios de baja demanda o zonas con pocos aguateros.
                </p>
              </div>
            </CardContent>
            <div className="px-6 pb-6 space-y-3">
              <Button
                className="w-full bg-orange-600 hover:bg-orange-700"
                asChild
                data-testid="new-request-button"
              >
                <Link href="/">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Nueva Solicitud
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full border-green-500 text-green-700 hover:bg-green-50"
                asChild
                data-testid="contact-support-button"
              >
                <a
                  href="https://wa.me/56912345678?text=Hola,%20necesito%20ayuda%20con%20mi%20solicitud%20de%20agua"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Contactar Soporte
                </a>
              </Button>
            </div>
          </Card>
        )}

        {/* Navigation */}
        <div className="text-center pt-4">
          <Button variant="outline" asChild>
            <Link href="/">Volver al Inicio</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
