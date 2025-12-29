import { Suspense } from "react";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Droplets, Clock, Users, Zap, AlertCircle, FileText, CheckCircle, Banknote, Building2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getRequestDetail, getOfferSettings } from "@/lib/actions/offers";
import { OfferForm, OfferFormSkeleton } from "@/components/provider/offer-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { formatLiters } from "@/lib/utils/commission";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RequestDetailPage({ params }: PageProps) {
  const { id: requestId } = await params;

  const supabase = await createClient();

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/login?redirect=/provider/requests/${requestId}`);
  }

  // Get request detail
  const result = await getRequestDetail(requestId);

  if (!result.success) {
    if (result.error === "Solicitud no encontrada") {
      notFound();
    }
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        <div className="max-w-lg mx-auto px-4 py-6">
          <BackButton />
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{result.error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const request = result.request!;

  // Get platform settings for offer form
  const settingsResult = await getOfferSettings(request.amount, request.is_urgent);
  const settings = settingsResult.settings;

  // Format time posted
  const timePosted = request.created_at
    ? formatDistanceToNow(new Date(request.created_at), {
        addSuffix: true,
        locale: es,
      })
    : "Recién publicado";

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-lg mx-auto px-4 py-3">
        {/* Header with back button */}
        <BackButton />

        {/* Request Details - Compact section without Card overhead */}
        <div className="bg-white rounded-xl border border-gray-200 p-3 mt-2 mb-3">
          {/* Title row */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-900">Detalles de la Solicitud</span>
            {request.is_urgent && (
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

          {/* Location */}
          <div className="flex items-start gap-2 mb-2">
            <MapPin className="h-3.5 w-3.5 text-orange-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-xs text-gray-900">{request.comuna_name}</p>
              <p className="text-[11px] text-gray-600 leading-tight">{request.address}</p>
            </div>
          </div>

          {/* Amount + Time + Offers + Payment - Single row */}
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
              <Droplets className="h-3 w-3" />
              <span className="font-medium">{formatLiters(request.amount)}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500">
              <Clock className="h-3 w-3" />
              <span>{timePosted}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500">
              <Users className="h-3 w-3" />
              <span>
                {request.offer_count === 0
                  ? "Sin ofertas"
                  : `${request.offer_count} oferta${request.offer_count > 1 ? "s" : ""}`}
              </span>
            </div>
            {/* Payment Method - AC12.2.4 */}
            <div
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${
                request.payment_method === "transfer"
                  ? "bg-purple-50 text-purple-700"
                  : "bg-green-50 text-green-700"
              }`}
              data-testid="payment-badge"
            >
              {request.payment_method === "transfer" ? (
                <Building2 className="h-3 w-3" />
              ) : (
                <Banknote className="h-3 w-3" />
              )}
              <span className="font-medium">
                {request.payment_method === "transfer" ? "Transferencia" : "Efectivo"}
              </span>
            </div>
          </div>

          {/* Special instructions */}
          {request.special_instructions && (
            <div className="flex items-start gap-2 pt-2 mt-2 border-t border-gray-100">
              <FileText className="h-3 w-3 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-medium text-gray-600">Instrucciones</p>
                <p className="text-[11px] text-gray-600 leading-tight">{request.special_instructions}</p>
              </div>
            </div>
          )}
        </div>

        {/* Offer Form or Already Has Offer Message */}
        {request.provider_has_offer ? (
          <Alert className="bg-green-50 border-green-200 py-2">
            <CheckCircle className="h-3.5 w-3.5 text-green-600" />
            <AlertTitle className="text-green-800 text-xs">Ya tienes una oferta</AlertTitle>
            <AlertDescription className="text-green-700 text-[11px]">
              Ya enviaste una oferta para esta solicitud.{" "}
              <Link
                href="/provider/offers"
                className="font-medium underline hover:text-green-900"
              >
                Ver mis ofertas
              </Link>
            </AlertDescription>
          </Alert>
        ) : settings ? (
          <Suspense fallback={<OfferFormSkeleton />}>
            <OfferForm request={request} settings={settings} />
          </Suspense>
        ) : (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-3.5 w-3.5" />
            <AlertTitle className="text-xs">Error de configuración</AlertTitle>
            <AlertDescription className="text-[11px]">
              No se pudieron cargar los precios del sistema. Por favor, intenta de nuevo.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}

function BackButton() {
  return (
    <Button asChild variant="ghost" size="sm" className="mb-1 -ml-2 h-7 text-xs">
      <Link href="/provider/requests">
        <ArrowLeft className="h-3 w-3 mr-1" />
        Volver
      </Link>
    </Button>
  );
}
