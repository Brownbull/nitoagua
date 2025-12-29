"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RequestStatusClient } from "@/components/consumer/request-status-client";
import {
  AlertTriangle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface RequestWithSupplier {
  id: string;
  status: string;
  amount: number;
  address: string;
  special_instructions: string | null;
  is_urgent: boolean;
  created_at: string | null;
  accepted_at: string | null;
  in_transit_at: string | null;
  delivered_at: string | null;
  delivery_window: string | null;
  supplier_id: string | null;
  consumer_id: string | null; // AC12.3: To compare with cancelled_by
  cancelled_by: string | null; // AC12.3.2/3: Who cancelled the request
  cancellation_reason: string | null; // AC12.3.2/3: Reason for cancellation
  cancelled_at: string | null; // AC12.3.2/3: When it was cancelled
  active_offer_count?: number; // AC10.5.7: Offer count for pending requests
  profiles: {
    name: string;
    phone: string;
  } | null;
}

/**
 * Loading state while fetching request
 */
function LoadingState() {
  return (
    <div className="min-h-dvh bg-gray-50 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-[#0077B6]" />
    </div>
  );
}

/**
 * Error page when request is not found or user is not authorized
 */
function RequestNotFoundPage() {
  return (
    <div className="min-h-dvh bg-gray-50 flex flex-col items-center justify-center p-4">
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
    <div className="min-h-dvh bg-gray-50 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-8 pb-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-blue-600" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Inicio de sesión requerido
          </h1>
          <p className="text-gray-600 mb-6">
            Debes iniciar sesión para ver los detalles de tu solicitud
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
 * Request Status Page (Consumer View)
 *
 * Client component that displays the detailed status of a consumer's request.
 * Uses client-side Supabase to match auth state with History page.
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
export default function RequestStatusPage() {
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [request, setRequest] = useState<RequestWithSupplier | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function loadRequest() {
      const supabase = createClient();

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      setIsAuthenticated(true);

      // Query for the request with supplier info
      // Consumer can only see their own requests (consumer_id = user.id)
      // AC12.3: Include cancellation fields for negative status states
      const { data: requestData, error } = await supabase
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
          in_transit_at,
          delivered_at,
          delivery_window,
          supplier_id,
          consumer_id,
          cancelled_by,
          cancellation_reason,
          cancelled_at,
          profiles!water_requests_supplier_id_fkey (
            name,
            phone
          )
        `)
        .eq("id", id)
        .eq("consumer_id", user.id)
        .single();

      if (error || !requestData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      // AC10.5.7: Get active offer count for pending requests
      let activeOfferCount = 0;
      if (requestData.status === "pending") {
        const { count } = await supabase
          .from("offers")
          .select("*", { count: "exact", head: true })
          .eq("request_id", id)
          .eq("status", "active");
        activeOfferCount = count ?? 0;
      }

      setRequest({
        ...requestData,
        active_offer_count: activeOfferCount,
      } as RequestWithSupplier);
      setLoading(false);
    }

    loadRequest();
  }, [id]);

  if (loading) {
    return <LoadingState />;
  }

  if (!isAuthenticated) {
    return <AuthRequiredPage />;
  }

  if (notFound || !request) {
    return <RequestNotFoundPage />;
  }

  return <RequestStatusClient initialRequest={request} />;
}
