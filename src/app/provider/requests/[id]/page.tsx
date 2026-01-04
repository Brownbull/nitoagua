import { Suspense } from "react";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Droplets,
  Clock,
  Users,
  Zap,
  AlertCircle,
  FileText,
  CheckCircle,
  Banknote,
  Building2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getRequestDetail, getOfferSettings } from "@/lib/actions/offers";
import { OfferForm, OfferFormSkeleton } from "@/components/provider/offer-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { formatLiters } from "@/lib/utils/commission";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Request Detail Page - Redesigned for driver usability (Story 12.7-10)
 * AC: 12.7.10.1 - Hero cards, prominent earnings, simplified time selection
 * AC: 12.7.10.3 - Mobile-first, no scrolling for critical actions
 */
export default async function RequestDetailPage({ params }: PageProps) {
  const { id: requestId } = await params;

  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
      <div className="min-h-dvh bg-gradient-to-b from-orange-50 to-white">
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
    <div className="min-h-dvh bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-lg mx-auto px-4 py-3">
        {/* Header with back button */}
        <BackButton />

        {/* AC12.7.10.1 - Hero Cards Section - Compact for mobile */}
        <div
          className="grid grid-cols-2 gap-2 mt-2 mb-3"
          data-testid="hero-cards"
        >
          {/* Amount Card */}
          <div
            className="bg-white rounded-lg border border-gray-200 p-3 flex flex-col items-center justify-center"
            data-testid="amount-card"
          >
            <div className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-blue-500" />
              <p className="text-xl font-bold text-gray-900">
                {formatLiters(request.amount)}
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-1">
              <span className="flex items-center gap-0.5">
                <Clock className="h-3 w-3" />
                {timePosted}
              </span>
              <span>•</span>
              <span className="flex items-center gap-0.5">
                <Users className="h-3 w-3" />
                {request.offer_count === 0
                  ? "Sin ofertas"
                  : `${request.offer_count} oferta${request.offer_count > 1 ? "s" : ""}`}
              </span>
            </div>
          </div>

          {/* Location Card */}
          <div
            className="bg-white rounded-lg border border-gray-200 p-3 flex flex-col items-center justify-center"
            data-testid="location-card"
          >
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-orange-500" />
              <p className="text-base font-bold text-gray-900">
                {request.comuna_name}
              </p>
            </div>
            <p className="text-[11px] text-gray-500 text-center line-clamp-1 mt-1">
              {request.address}
            </p>
          </div>
        </div>

        {/* AC12.7.10.1 - Details Row: Payment + Instructions + Urgent */}
        <div
          className="flex flex-wrap items-center gap-2 mb-4"
          data-testid="details-row"
        >
          {/* Urgent Badge */}
          {request.is_urgent && (
            <Badge
              variant="destructive"
              className="flex items-center gap-1 h-7 px-2"
              data-testid="urgent-badge"
            >
              <Zap className="h-3.5 w-3.5" />
              Urgente
            </Badge>
          )}

          {/* Payment Method Badge */}
          <Badge
            variant="outline"
            className={`flex items-center gap-1 h-7 px-2 ${
              request.payment_method === "transfer"
                ? "border-purple-300 bg-purple-50 text-purple-700"
                : "border-green-300 bg-green-50 text-green-700"
            }`}
            data-testid="payment-badge"
          >
            {request.payment_method === "transfer" ? (
              <Building2 className="h-3.5 w-3.5" />
            ) : (
              <Banknote className="h-3.5 w-3.5" />
            )}
            {request.payment_method === "transfer" ? "Transferencia" : "Efectivo"}
          </Badge>

          {/* Special Instructions Badge */}
          {request.special_instructions && (
            <Badge
              variant="outline"
              className="flex items-center gap-1 h-7 px-2 border-amber-300 bg-amber-50 text-amber-700 max-w-[200px]"
              data-testid="instructions-badge"
            >
              <FileText className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{request.special_instructions}</span>
            </Badge>
          )}
        </div>

        {/* Special Instructions - Full text if truncated above */}
        {request.special_instructions && request.special_instructions.length > 30 && (
          <div
            className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4"
            data-testid="instructions-full"
          >
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-amber-800">
                  Instrucciones especiales
                </p>
                <p className="text-sm text-amber-700 mt-0.5">
                  {request.special_instructions}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Offer Form or Already Has Offer Message */}
        {request.provider_has_offer ? (
          <Alert className="bg-green-50 border-green-200 py-3">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800 text-sm">
              Ya tienes una oferta
            </AlertTitle>
            <AlertDescription className="text-green-700 text-sm">
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
          <Alert variant="destructive" className="py-3">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="text-sm">Error de configuración</AlertTitle>
            <AlertDescription className="text-sm">
              No se pudieron cargar los precios del sistema. Por favor, intenta
              de nuevo.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}

function BackButton() {
  return (
    <Button
      asChild
      variant="ghost"
      size="sm"
      className="mb-1 -ml-2 h-8 text-sm"
    >
      <Link href="/provider/requests">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Volver
      </Link>
    </Button>
  );
}
