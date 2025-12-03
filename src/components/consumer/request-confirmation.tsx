"use client";

import { CheckCircle2, Eye, Plus, Phone, Mail } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/**
 * RequestConfirmation Component Props
 * Displays confirmation details after successful water request submission
 */
export interface RequestConfirmationProps {
  requestId: string;
  trackingToken: string;
  supplierPhone: string | null;
  isGuest: boolean;
}

/**
 * RequestConfirmation Component
 *
 * Displays a success confirmation after water request submission with:
 * - Success icon (green checkmark)
 * - "¡Solicitud Enviada!" heading
 * - Request ID (first 8 chars)
 * - "El aguatero te contactará pronto" message
 * - Clickable supplier phone number
 * - Navigation buttons (Ver Estado / Nueva Solicitud)
 * - Guest-specific tracking URL message
 */
export function RequestConfirmation({
  requestId,
  trackingToken,
  supplierPhone,
  isGuest,
}: RequestConfirmationProps) {
  const shortId = requestId.slice(0, 8).toUpperCase();

  // Determine navigation URL based on user type
  const trackingUrl = isGuest ? `/track/${trackingToken}` : `/request/${requestId}`;

  // Format phone for display and tel: link
  const formattedPhone = supplierPhone
    ? supplierPhone.replace(/^\+56/, "+56 ")
    : null;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="flex flex-col items-center text-center space-y-6 pt-8 pb-8">
        {/* Success Icon - AC2-4-1 */}
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100">
          <CheckCircle2
            className="w-10 h-10 text-emerald-500"
            strokeWidth={2}
            aria-hidden="true"
          />
        </div>

        {/* Heading - AC2-4-2 */}
        <h1 className="text-2xl font-bold text-gray-900">
          ¡Solicitud Enviada!
        </h1>

        {/* Request ID - AC2-4-3 */}
        <p className="text-sm text-muted-foreground">
          Solicitud{" "}
          <span className="font-mono font-semibold text-gray-700">
            #{shortId}
          </span>
        </p>

        {/* Contact Message - AC2-4-4 */}
        <p className="text-base text-gray-600">
          El aguatero te contactará pronto
        </p>

        {/* Supplier Phone - AC2-4-5 */}
        {formattedPhone ? (
          <a
            href={`tel:${supplierPhone}`}
            className="inline-flex items-center gap-2 text-primary hover:underline font-medium min-h-[44px] px-4"
            aria-label={`Llamar al aguatero: ${formattedPhone}`}
          >
            <Phone className="w-5 h-5" aria-hidden="true" />
            {formattedPhone}
          </a>
        ) : (
          <p className="text-sm text-muted-foreground">
            Teléfono no disponible
          </p>
        )}

        {/* Guest Email Message - AC2-4-8 */}
        {isGuest && (
          <div className="w-full p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-start gap-3">
              <Mail
                className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
                aria-hidden="true"
              />
              <div className="text-left">
                <p className="text-sm text-blue-800">
                  Te enviamos un email con el enlace para seguir tu solicitud
                </p>
                <p className="text-xs font-mono text-blue-600 mt-2 break-all">
                  nitoagua.cl/track/{trackingToken.slice(0, 8)}...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons - AC2-4-6, AC2-4-7 */}
        <div className="w-full space-y-3 pt-2">
          {/* Ver Estado Button (Primary) - AC2-4-6 */}
          <Button
            asChild
            className="w-full min-h-[48px]"
            size="lg"
          >
            <Link href={trackingUrl}>
              <Eye className="w-5 h-5 mr-2" aria-hidden="true" />
              Ver Estado
            </Link>
          </Button>

          {/* Nueva Solicitud Button (Secondary) - AC2-4-7 */}
          <Button
            asChild
            variant="outline"
            className="w-full min-h-[48px]"
            size="lg"
          >
            <Link href="/request">
              <Plus className="w-5 h-5 mr-2" aria-hidden="true" />
              Nueva Solicitud
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
