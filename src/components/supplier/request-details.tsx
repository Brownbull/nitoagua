"use client";

import { formatDistanceToNow, format, isAfter, subDays } from "date-fns";
import { es } from "date-fns/locale";
import { Phone, MapPin, Clock, AlertTriangle, FileText, Droplets, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LocationMap } from "./location-map";
import { RequestActions } from "./request-actions";
import type { WaterRequest } from "@/lib/supabase/types";

interface RequestDetailsProps {
  request: WaterRequest;
}

// Amount badge color mapping - reused from request-card.tsx
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

function formatRequestTime(createdAt: string): string {
  const date = new Date(createdAt);
  const oneDayAgo = subDays(new Date(), 1);

  if (isAfter(date, oneDayAgo)) {
    // Recent: "hace 2 horas"
    return formatDistanceToNow(date, { addSuffix: true, locale: es });
  } else {
    // Older: "2 de diciembre, 2025"
    return format(date, "d 'de' MMMM, yyyy", { locale: es });
  }
}

function getStatusBadge(status: string): { label: string; className: string } {
  switch (status) {
    case "pending":
      return { label: "Pendiente", className: "bg-amber-100 text-amber-800 border-amber-200" };
    case "accepted":
      return { label: "Aceptada", className: "bg-blue-100 text-blue-800 border-blue-200" };
    case "delivered":
      return { label: "Entregada", className: "bg-green-100 text-green-800 border-green-200" };
    case "cancelled":
      return { label: "Cancelada", className: "bg-red-100 text-red-800 border-red-200" };
    default:
      return { label: status, className: "bg-gray-100 text-gray-800 border-gray-200" };
  }
}

export function RequestDetails({ request }: RequestDetailsProps) {
  const isUrgent = request.is_urgent === true;
  const customerName = request.guest_name || "Cliente";
  const statusBadge = getStatusBadge(request.status);

  return (
    <div className="space-y-6">
      {/* Main Details Card */}
      <Card data-testid="request-details-card">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Customer Name and Status */}
            <div className="flex items-center gap-3 flex-wrap">
              <CardTitle
                className="text-xl"
                data-testid="customer-name"
              >
                {customerName}
              </CardTitle>
              {isUrgent && (
                <span
                  className="flex items-center gap-1 text-sm text-red-600 font-medium bg-red-50 px-2 py-1 rounded-md"
                  data-testid="urgency-indicator"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Urgente
                </span>
              )}
              <Badge
                variant="outline"
                className={statusBadge.className}
                data-testid="status-badge"
              >
                {statusBadge.label}
              </Badge>
            </div>

            {/* Amount Badge */}
            <Badge
              variant="outline"
              className={`text-lg px-4 py-1 ${getAmountBadgeClasses(request.amount)}`}
              data-testid="amount-badge"
            >
              <Droplets className="w-4 h-4 mr-2" />
              {formatAmount(request.amount)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Contacto
            </h3>

            {/* Phone - Clickable tel: link */}
            <div className="flex items-start gap-3 pl-6">
              <div>
                <p className="text-sm text-gray-500">Teléfono</p>
                <a
                  href={`tel:${request.guest_phone}`}
                  className="text-primary hover:underline font-medium text-lg"
                  data-testid="phone-link"
                >
                  {request.guest_phone}
                </a>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Dirección
            </h3>
            <p
              className="text-gray-700 pl-6"
              data-testid="full-address"
            >
              {request.address}
            </p>
          </div>

          {/* Special Instructions */}
          {request.special_instructions && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Instrucciones Especiales
              </h3>
              <p
                className="text-gray-700 pl-6 whitespace-pre-wrap"
                data-testid="special-instructions"
              >
                {request.special_instructions}
              </p>
            </div>
          )}

          {/* Submission Time */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Tiempo de Solicitud
            </h3>
            <p
              className="text-gray-700 pl-6"
              data-testid="submission-time"
            >
              {formatRequestTime(request.created_at!)}
            </p>
          </div>

          {/* Delivery Window - for accepted/delivered requests */}
          {request.status !== "pending" && request.delivery_window && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Ventana de Entrega
              </h3>
              <p
                className="text-gray-700 pl-6"
                data-testid="delivery-window"
              >
                {request.delivery_window}
              </p>
            </div>
          )}

          {/* Delivered timestamp - for delivered requests */}
          {request.status === "delivered" && request.delivered_at && (
            <div className="space-y-4">
              <h3 className="font-semibold text-green-700 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Entregado
              </h3>
              <p
                className="text-green-700 pl-6 font-medium"
                data-testid="delivered-time"
              >
                {format(new Date(request.delivered_at), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Map Preview */}
      <LocationMap
        latitude={request.latitude}
        longitude={request.longitude}
        address={request.address}
      />

      {/* Action Buttons */}
      <RequestActions request={request} />
    </div>
  );
}

// Loading skeleton for RequestDetails
export function RequestDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-7 w-40" />
              <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-8 w-24" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Contact skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-6 w-36 ml-6" />
          </div>
          {/* Address skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-full ml-6" />
          </div>
          {/* Instructions skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-16 w-full ml-6" />
          </div>
          {/* Time skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-5 w-28 ml-6" />
          </div>
        </CardContent>
      </Card>

      {/* Map skeleton */}
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-48 w-full rounded-lg" />
        </CardContent>
      </Card>

      {/* Actions skeleton */}
      <div className="flex gap-3">
        <Skeleton className="h-12 flex-1" />
        <Skeleton className="h-12 flex-1" />
      </div>
    </div>
  );
}
