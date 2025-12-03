import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, type RequestStatus } from "@/components/shared/status-badge";
import { StatusTracker } from "@/components/consumer/status-tracker";
import { TrackingRefresh } from "@/components/consumer/tracking-refresh";
import {
  formatDateSpanish,
  formatShortDate,
  maskAddress,
  formatPhone,
} from "@/lib/utils/format";
import { AlertTriangle, Phone, Droplets, MapPin, Calendar, Truck } from "lucide-react";
import Link from "next/link";

interface TrackingPageProps {
  params: Promise<{ token: string }>;
}

interface RequestWithSupplier {
  id: string;
  status: string;
  amount: number;
  address: string;
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

function TrackingErrorPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-8 pb-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-amber-600" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Solicitud no encontrada
          </h1>
          <p className="text-gray-600 mb-6">
            El enlace puede haber expirado o ser incorrecto
          </p>
          <Button asChild className="w-full">
            <Link href="/">Volver al Inicio</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

function TrackingContent({ request }: { request: RequestWithSupplier }) {
  const status = request.status as RequestStatus;
  const isAccepted = status === "accepted";
  const isDelivered = status === "delivered";
  const isPending = status === "pending";

  return (
    <main className="min-h-screen bg-gray-50 py-6 px-4">
      <TrackingRefresh />

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
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

        {/* Request Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Detalles de la solicitud</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Amount */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Droplets className="h-5 w-5 text-blue-600" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Cantidad</p>
                <p className="font-medium">{request.amount.toLocaleString("es-CL")}L</p>
              </div>
            </div>

            {/* Address (masked for privacy) */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-green-600" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Dirección</p>
                <p className="font-medium">{maskAddress(request.address)}</p>
              </div>
            </div>

            {/* Request Date */}
            {request.created_at && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-purple-600" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fecha de solicitud</p>
                  <p className="font-medium">{formatDateSpanish(request.created_at)}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status-specific content */}
        {isPending && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <p className="text-center text-amber-800">
                Esperando confirmación del aguatero
              </p>
            </CardContent>
          </Card>
        )}

        {isAccepted && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-lg text-blue-800">
                ¡Tu solicitud fue aceptada!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Delivery Window */}
              {request.delivery_window && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Truck className="h-5 w-5 text-blue-600" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-600">Ventana de entrega</p>
                    <p className="font-medium text-blue-900">
                      {request.delivery_window}
                    </p>
                  </div>
                </div>
              )}

              {/* Supplier Phone */}
              {request.profiles?.phone ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-blue-600" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-600">
                      {request.profiles.name ? `Aguatero: ${request.profiles.name}` : "Contacto del aguatero"}
                    </p>
                    <a
                      href={`tel:${request.profiles.phone}`}
                      className="font-medium text-blue-900 hover:underline flex items-center gap-1"
                    >
                      {formatPhone(request.profiles.phone)}
                    </a>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-blue-700">
                  Información del aguatero no disponible
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {isDelivered && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6 text-center">
              <p className="text-lg font-semibold text-green-800 mb-2">
                ¡Tu agua fue entregada!
              </p>
              {request.delivered_at && (
                <p className="text-green-700">
                  {formatDateSpanish(request.delivered_at)}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Back to home button */}
        <div className="text-center pt-4">
          <Button variant="outline" asChild>
            <Link href="/">Volver al Inicio</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

export default async function TrackingPage({ params }: TrackingPageProps) {
  const { token } = await params;
  // Use admin client to bypass RLS - guest tracking via token is intentional
  const supabase = createAdminClient();

  const { data: request, error } = await supabase
    .from("water_requests")
    .select(
      `
      id,
      status,
      amount,
      address,
      created_at,
      accepted_at,
      delivered_at,
      delivery_window,
      supplier_id,
      profiles!water_requests_supplier_id_fkey (
        name,
        phone
      )
    `
    )
    .eq("tracking_token", token)
    .single();

  if (error || !request) {
    return <TrackingErrorPage />;
  }

  return <TrackingContent request={request as RequestWithSupplier} />;
}
