"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Clock, XCircle, AlertTriangle, RotateCcw, MessageCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatTimeAgo, formatDateSpanish } from "@/lib/utils/format";

/**
 * Support contact configuration
 * AC12.3.4: Support contact visible on all negative states
 */
const SUPPORT_WHATSAPP = "56912345678"; // TODO: Replace with actual support number from admin_settings
const SUPPORT_EMAIL = "soporte@nitoagua.cl";

export type NegativeStatusVariant = "no_offers" | "cancelled_by_user" | "cancelled_by_provider";

interface NegativeStatusCardProps {
  variant: NegativeStatusVariant;
  createdAt?: string | null; // For time elapsed calculation on no_offers
  cancelledAt?: string | null; // For cancelled states
  cancellationReason?: string | null; // Provider/user reason
}

/**
 * Variant configurations for negative status cards
 * AC12.3.1: No Offers with orange/amber styling
 * AC12.3.2: Cancelled by User with gray styling
 * AC12.3.3: Cancelled by Provider with gray/red styling
 */
const variantConfig = {
  no_offers: {
    // AC12.3.1: Orange/amber styling
    bg: "bg-[#FFEDD5]",
    border: "border-[#FDBA74]",
    iconBg: "bg-[#FED7AA]",
    iconColor: "text-[#C2410C]",
    titleColor: "text-[#C2410C]",
    descColor: "text-[#EA580C]",
    Icon: Clock,
    title: "Sin Ofertas",
    description: "No hay aguateros disponibles ahora",
    primaryAction: {
      text: "Intentar de nuevo",
      href: "/",
      className: "bg-[#EA580C] hover:bg-[#C2410C] text-white",
    },
  },
  cancelled_by_user: {
    // AC12.3.2: Gray styling
    bg: "bg-gray-100",
    border: "border-gray-300",
    iconBg: "bg-gray-200",
    iconColor: "text-gray-500",
    titleColor: "text-gray-600",
    descColor: "text-gray-500",
    Icon: XCircle,
    title: "Cancelada",
    description: "Cancelaste esta solicitud",
    primaryAction: {
      text: "Nueva Solicitud",
      href: "/",
      className: "bg-gray-600 hover:bg-gray-700 text-white",
    },
  },
  cancelled_by_provider: {
    // AC12.3.3: Gray/red styling
    bg: "bg-red-50",
    border: "border-red-200",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    titleColor: "text-red-700",
    descColor: "text-red-600",
    Icon: AlertTriangle,
    title: "Cancelada por Proveedor",
    description: "El proveedor canceló tu solicitud",
    primaryAction: {
      text: "Intentar de nuevo",
      href: "/",
      className: "bg-red-600 hover:bg-red-700 text-white",
    },
  },
};

/**
 * NegativeStatusCard Component
 *
 * Dedicated component for negative status states with appropriate styling,
 * messaging, and actionable next steps.
 *
 * Story 12-3 Acceptance Criteria:
 * - AC12.3.1: No Offers / Timeout State
 * - AC12.3.2: Cancelled by User State
 * - AC12.3.3: Cancelled by Provider State
 * - AC12.3.4: Support Contact Visibility
 * - AC12.3.5: Visual Consistency
 */
export function NegativeStatusCard({
  variant,
  createdAt,
  cancelledAt,
  cancellationReason,
}: NegativeStatusCardProps) {
  const config = variantConfig[variant];
  const Icon = config.Icon;

  // Calculate time elapsed for no_offers variant
  const timeElapsed = variant === "no_offers" && createdAt
    ? formatTimeAgo(createdAt)
    : null;

  // Format cancellation timestamp for cancelled variants
  const cancellationTime = cancelledAt
    ? formatDateSpanish(cancelledAt)
    : null;

  return (
    <div
      className={cn(
        "rounded-2xl p-5 mb-4 text-center border",
        config.bg,
        config.border
      )}
      data-testid={`negative-status-${variant}`}
    >
      {/* Centered icon */}
      <div
        className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3",
          config.iconBg
        )}
      >
        <Icon className={cn("w-7 h-7", config.iconColor)} aria-hidden="true" />
      </div>

      {/* Title */}
      <h3
        className={cn("text-base font-bold mb-1", config.titleColor)}
        data-testid="negative-status-title"
      >
        {config.title}
      </h3>

      {/* Description */}
      <p className={cn("text-sm", config.descColor)} data-testid="negative-status-message">
        {config.description}
      </p>

      {/* Time info - conditional based on variant */}
      {variant === "no_offers" && timeElapsed && (
        <p className="text-xs text-gray-500 mt-2" data-testid="time-elapsed">
          Solicitado {timeElapsed}
        </p>
      )}

      {(variant === "cancelled_by_user" || variant === "cancelled_by_provider") && cancellationTime && (
        <p className="text-xs text-gray-500 mt-2" data-testid="cancellation-time">
          Cancelado el {cancellationTime}
        </p>
      )}

      {/* Cancellation reason - prominent for provider cancellation */}
      {cancellationReason && (
        <div
          className={cn(
            "mt-3 p-3 rounded-xl text-left",
            variant === "cancelled_by_provider" ? "bg-red-100" : "bg-gray-50"
          )}
          data-testid="cancellation-reason"
        >
          <p className="text-xs font-medium text-gray-600 mb-1">
            {variant === "cancelled_by_provider" ? "Motivo del proveedor:" : "Motivo:"}
          </p>
          <p className={cn(
            "text-sm",
            variant === "cancelled_by_provider" ? "text-red-700" : "text-gray-700"
          )}>
            {cancellationReason}
          </p>
        </div>
      )}

      {/* No offers additional message */}
      {variant === "no_offers" && (
        <p className="text-xs text-[#C2410C] mt-3" data-testid="no-offers-help">
          Tu solicitud no recibió ofertas. Esto puede ocurrir en horarios de baja demanda.
        </p>
      )}

      {/* Primary action button */}
      <Button
        asChild
        className={cn(
          "w-full rounded-xl py-4 text-base font-semibold mt-4",
          config.primaryAction.className
        )}
        data-testid="primary-action-button"
      >
        <Link href={config.primaryAction.href}>
          <RotateCcw className="mr-2 h-5 w-5" />
          {config.primaryAction.text}
        </Link>
      </Button>

      {/* Support Contact Section */}
      {/* AC12.3.4: Each negative state includes support contact section */}
      <div className="mt-4 pt-4 border-t border-gray-200" data-testid="support-contact">
        <p className="text-xs text-gray-500 mb-3">
          ¿Necesitas ayuda?
        </p>
        <div className="flex gap-2 justify-center">
          {/* WhatsApp contact */}
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-green-500 text-green-600 hover:bg-green-50"
            data-testid="whatsapp-support"
          >
            <a
              href={`https://wa.me/${SUPPORT_WHATSAPP}?text=Hola,%20necesito%20ayuda%20con%20mi%20solicitud%20de%20agua`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="mr-1.5 h-4 w-4" />
              WhatsApp
            </a>
          </Button>

          {/* Email contact */}
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-blue-500 text-blue-600 hover:bg-blue-50"
            data-testid="email-support"
          >
            <a href={`mailto:${SUPPORT_EMAIL}?subject=Ayuda%20con%20solicitud%20de%20agua`}>
              <Mail className="mr-1.5 h-4 w-4" />
              Email
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
