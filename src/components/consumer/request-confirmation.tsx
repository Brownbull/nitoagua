"use client";

import { CheckCircle2, Eye, Plus, Phone, Mail } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ConsumerNav } from "@/components/layout/consumer-nav";

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
 * - Gradient header matching app design
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Gradient Header */}
      <div
        className="shrink-0 px-5 pt-8 pb-6 text-center"
        style={{
          background: "linear-gradient(180deg, #CAF0F8 0%, white 100%)",
        }}
      >
        {/* Success Icon */}
        <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-emerald-100 border-4 border-emerald-200 mb-4">
          <CheckCircle2
            className="w-8 h-8 text-emerald-500"
            strokeWidth={2.5}
            aria-hidden="true"
          />
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">
          ¡Solicitud Enviada!
        </h1>

        {/* Request ID */}
        <p className="text-sm text-gray-500">
          Solicitud{" "}
          <span className="font-mono font-semibold text-gray-700">
            #{shortId}
          </span>
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 py-4 pb-24">
        {/* Contact Message Card */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center mb-3">
          <p className="text-[15px] font-medium text-gray-900 mb-2">
            El aguatero te contactará pronto
          </p>

          {/* Supplier Phone */}
          {formattedPhone ? (
            <a
              href={`tel:${supplierPhone}`}
              className="inline-flex items-center gap-2 text-[#0077B6] hover:text-[#005f8f] font-semibold text-sm"
              aria-label={`Llamar al aguatero: ${formattedPhone}`}
            >
              <Phone className="w-4 h-4" aria-hidden="true" />
              {formattedPhone}
            </a>
          ) : (
            <p className="text-xs text-gray-400">
              Teléfono no disponible
            </p>
          )}
        </div>

        {/* Guest Email Message */}
        {isGuest && (
          <div className="flex gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl mb-4">
            <Mail
              className="w-4 h-4 text-blue-600 shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div className="text-xs text-blue-900">
              <p className="font-semibold">
                Te enviamos un email con el enlace para seguir tu solicitud
              </p>
              <p className="font-mono text-blue-600 mt-1 break-all">
                nitoagua.cl/track/{trackingToken.slice(0, 8)}...
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="space-y-3">
          {/* Ver Estado Button (Primary) */}
          <Button
            asChild
            className="w-full h-11 bg-[#0077B6] hover:bg-[#005f8f] text-white rounded-xl text-sm font-semibold"
          >
            <Link href={trackingUrl}>
              <Eye className="w-4 h-4 mr-2" aria-hidden="true" />
              Ver Estado
            </Link>
          </Button>

          {/* Nueva Solicitud Button (Secondary) */}
          <Button
            asChild
            variant="outline"
            className="w-full h-11 rounded-xl border-gray-200 text-gray-700 text-sm font-semibold"
          >
            <Link href="/request">
              <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
              Nueva Solicitud
            </Link>
          </Button>
        </div>
      </div>

      <ConsumerNav />
    </div>
  );
}
