import { getSupplierPhone } from "@/lib/supabase/supplier";
import { ConfirmationClient } from "@/components/consumer/confirmation-client";

interface ConfirmationPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Confirmation Page
 *
 * Server component that:
 * 1. Fetches supplier phone number server-side (single supplier for MVP)
 * 2. Renders ConfirmationClient with request ID and supplier info
 *
 * The ConfirmationClient handles sessionStorage reading and cleanup on the client.
 *
 * Route: /request/[id]/confirmation
 *
 * Acceptance Criteria:
 * - AC2-4-1: Success icon (green checkmark)
 * - AC2-4-2: "¡Solicitud Enviada!" heading
 * - AC2-4-3: Request ID display
 * - AC2-4-4: "El aguatero te contactará pronto" message
 * - AC2-4-5: Clickable supplier phone
 * - AC2-4-6: "Ver Estado" button navigation
 * - AC2-4-7: "Nueva Solicitud" button navigation
 * - AC2-4-8: Guest email message with tracking URL
 */
export default async function ConfirmationPage({
  params,
}: ConfirmationPageProps) {
  const { id } = await params;

  // Fetch supplier phone server-side (single supplier for MVP)
  const supplierPhone = await getSupplierPhone();

  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 min-h-[calc(100vh-120px)]">
      <ConfirmationClient requestId={id} supplierPhone={supplierPhone} />
    </div>
  );
}
