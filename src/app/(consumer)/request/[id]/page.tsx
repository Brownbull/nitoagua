import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, type RequestStatus } from "@/components/shared/status-badge";
import { StatusTracker } from "@/components/consumer/status-tracker";
import { TrackingRefresh } from "@/components/consumer/tracking-refresh";
import { CancelRequestButton } from "@/components/consumer/cancel-request-button";
import {
  formatDateSpanish,
  formatShortDate,
  formatPhone,
} from "@/lib/utils/format";
import {
  AlertTriangle,
  Phone,
  Droplets,
  MapPin,
  Calendar,
  Truck,
  Clock,
  Package,
  FileText,
  AlertCircle,
  CheckCircle,
  RotateCcw,
  XCircle,
} from "lucide-react";
import Link from "next/link";

interface RequestStatusPageProps {
  params: Promise<{ id: string }>;
}

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

/**
 * Error page when request is not found or user is not authorized
 */
function RequestNotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-8 pb-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-amber-600" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Solicitud no encontrada
          </h1>
          <p className="text-gray-600 mb-6">
            La solicitud que buscas no existe o no tienes acceso a ella
          </p>
          <Button asChild className="w-full">
            <Link href="/">Volver al Inicio</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Error page when user is not authenticated
 */
function AuthRequiredPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-8 pb-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-blue-600" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Inicio de sesion requerido
          </h1>
          <p className="text-gray-600 mb-6">
            Debes iniciar sesion para ver los detalles de tu solicitud
          </p>
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/">Volver al Inicio</Link>
            </Button>
            <p className="text-sm text-gray-500">
              Si eres un visitante, usa el enlace de seguimiento que te enviamos por correo
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Main request status content component
 */
function RequestStatusContent({ request }: { request: RequestWithSupplier }) {
  const status = request.status as RequestStatus;
  const isAccepted = status === "accepted";
  const isDelivered = status === "delivered";
  const isPending = status === "pending";
  const isCancelled = status === "cancelled";

  return (
    <div className="py-6 px-4">
      <TrackingRefresh />

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
                  Esperando confirmacion del aguatero
                </p>
                <p className="text-sm text-amber-700">
                  Te notificaremos cuando sea aceptada
                </p>
              </div>
            </CardContent>
            {/* Cancel button for pending requests */}
            <div className="px-6 pb-6">
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

/**
 * Request Status Page (Consumer View)
 *
 * Server component that displays the detailed status of a consumer's request.
 * Requires authentication - user must be logged in and can only view their own requests.
 *
 * Route: /request/[id]
 *
 * Key differences from guest tracking page (/track/[token]):
 * - Requires authentication
 * - Access via consumer_id match instead of tracking token
 * - Shows full address (not masked)
 * - Shows cancel option for pending requests
 *
 * Acceptance Criteria:
 * - AC2-6-1: Status page accessible at /request/[id] for authenticated consumers
 * - AC2-6-2: StatusBadge shows current state with correct colors
 * - AC2-6-3: Timeline visualization displays progression
 * - AC2-6-4: Shows request details: date, amount, address, special instructions
 * - AC2-6-5: Pending status shows: "Esperando confirmacion del aguatero"
 * - AC2-6-6: Accepted status shows supplier info with phone
 * - AC2-6-7: Delivered status shows completion timestamp
 */
export default async function RequestStatusPage({ params }: RequestStatusPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  // If not authenticated, show auth required page
  if (!user) {
    return <AuthRequiredPage />;
  }

  // Query for the request with supplier info
  // Consumer can only see their own requests (consumer_id = user.id)
  const { data: request, error } = await supabase
    .from("water_requests")
    .select(`
      id,
      status,
      amount,
      address,
      special_instructions,
      is_urgent,
      created_at,
      accepted_at,
      delivered_at,
      delivery_window,
      supplier_id,
      profiles!water_requests_supplier_id_fkey (
        name,
        phone
      )
    `)
    .eq("id", id)
    .eq("consumer_id", user.id)
    .single();

  // If request not found or error, show not found page
  if (error || !request) {
    return <RequestNotFoundPage />;
  }

  return <RequestStatusContent request={request as RequestWithSupplier} />;
}
