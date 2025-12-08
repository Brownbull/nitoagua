import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RequestStatusClient } from "@/components/consumer/request-status-client";
import {
  AlertTriangle,
  AlertCircle,
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
 * Request Status Page (Consumer View)
 *
 * Server component that fetches initial request data and passes it to
 * a client component that handles polling for status updates.
 *
 * Route: /request/[id]
 *
 * Key features:
 * - Requires authentication (consumer_id match)
 * - Shows full address (not masked like guest tracking)
 * - Cancel option for pending requests
 * - Polls for status updates every 30 seconds (AC5-3-3)
 * - Toast notifications on status change (AC5-3-1)
 *
 * Acceptance Criteria (Story 2-6 + Story 5-3):
 * - AC2-6-1: Status page accessible at /request/[id] for authenticated consumers
 * - AC2-6-2: StatusBadge shows current state with correct colors
 * - AC2-6-3: Timeline visualization displays progression
 * - AC2-6-4: Shows request details: date, amount, address, special instructions
 * - AC2-6-5: Pending status shows: "Esperando confirmacion del aguatero"
 * - AC2-6-6: Accepted status shows supplier info with phone
 * - AC2-6-7: Delivered status shows completion timestamp
 * - AC5-3-1: Toast notification on status change
 * - AC5-3-3: Page polls for updates every 30 seconds
 * - AC5-3-5: Graceful degradation if polling fails
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

  return <RequestStatusClient initialRequest={request as RequestWithSupplier} />;
}
