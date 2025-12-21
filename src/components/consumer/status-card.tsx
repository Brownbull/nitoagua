import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Clock, Truck, Package, XCircle, AlertTriangle, User, Phone } from "lucide-react";
import type { RequestStatus } from "@/components/shared/status-badge";

interface StatusCardProps {
  status: RequestStatus;
  title: string;
  description: string;
  children?: ReactNode;
}

/**
 * Status card component matching mockup design
 *
 * Features:
 * - Centered icon in rounded square
 * - Status-specific background and border colors
 * - Title and description text
 * - Optional children for additional content
 */
export function StatusCard({ status, title, description, children }: StatusCardProps) {
  const statusStyles = {
    pending: {
      bg: "bg-[#FEF3C7]",
      border: "border-[#FCD34D]",
      iconBg: "bg-[#FDE68A]",
      iconColor: "text-[#92400E]",
      titleColor: "text-[#92400E]",
      descColor: "text-[#A16207]",
      Icon: Clock,
    },
    accepted: {
      bg: "bg-[#DBEAFE]",
      border: "border-[#93C5FD]",
      iconBg: "bg-[#BFDBFE]",
      iconColor: "text-[#1E40AF]",
      titleColor: "text-[#1E40AF]",
      descColor: "text-[#3B82F6]",
      Icon: Truck,
    },
    in_transit: {
      bg: "bg-[#E0E7FF]",
      border: "border-[#A5B4FC]",
      iconBg: "bg-[#C7D2FE]",
      iconColor: "text-[#3730A3]",
      titleColor: "text-[#3730A3]",
      descColor: "text-[#4F46E5]",
      Icon: Truck,
    },
    delivered: {
      bg: "bg-[#D1FAE5]",
      border: "border-[#6EE7B7]",
      iconBg: "bg-[#A7F3D0]",
      iconColor: "text-[#065F46]",
      titleColor: "text-[#065F46]",
      descColor: "text-[#059669]",
      Icon: Package,
    },
    cancelled: {
      bg: "bg-gray-100",
      border: "border-gray-300",
      iconBg: "bg-gray-200",
      iconColor: "text-gray-500",
      titleColor: "text-gray-600",
      descColor: "text-gray-500",
      Icon: XCircle,
    },
    no_offers: {
      bg: "bg-[#FFEDD5]",
      border: "border-[#FDBA74]",
      iconBg: "bg-[#FED7AA]",
      iconColor: "text-[#C2410C]",
      titleColor: "text-[#C2410C]",
      descColor: "text-[#EA580C]",
      Icon: AlertTriangle,
    },
  };

  const styles = statusStyles[status];
  const Icon = styles.Icon;

  return (
    <div
      className={cn(
        "rounded-2xl p-5 mb-4 text-center border",
        styles.bg,
        styles.border
      )}
    >
      {/* Centered icon */}
      <div
        className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3",
          styles.iconBg
        )}
      >
        <Icon className={cn("w-7 h-7", styles.iconColor)} aria-hidden="true" />
      </div>

      {/* Title */}
      <h3 className={cn("text-base font-bold mb-1", styles.titleColor)}>
        {title}
      </h3>

      {/* Description */}
      <p className={cn("text-sm", styles.descColor)}>
        {description}
      </p>

      {/* Children (supplier info, buttons, etc.) */}
      {children}
    </div>
  );
}

interface SupplierInfoProps {
  name: string;
  phone?: string;
  variant?: "accepted" | "in_transit";
}

/**
 * Supplier info card that goes inside StatusCard
 * Matches mockup white card with row layout
 */
export function SupplierInfo({ name, phone, variant = "accepted" }: SupplierInfoProps) {
  const colors = {
    accepted: {
      iconBg: "bg-[#DBEAFE]",
      iconColor: "text-[#1E40AF]",
      labelColor: "text-[#3B82F6]",
      valueColor: "text-[#1E3A8A]",
    },
    in_transit: {
      iconBg: "bg-[#E0E7FF]",
      iconColor: "text-[#3730A3]",
      labelColor: "text-[#4F46E5]",
      valueColor: "text-[#312E81]",
    },
  };

  const styles = colors[variant];

  return (
    <div className="bg-white rounded-xl p-3.5 mt-3 text-left">
      {/* Provider name row */}
      <div className="flex items-center gap-2.5 mb-2">
        <div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            styles.iconBg
          )}
        >
          <User className={cn("w-4 h-4", styles.iconColor)} aria-hidden="true" />
        </div>
        <div>
          <p className={cn("text-[11px] font-medium", styles.labelColor)}>
            Repartidor
          </p>
          <p className={cn("text-sm font-semibold", styles.valueColor)} data-testid="provider-name">
            {name}
          </p>
        </div>
      </div>

      {/* Phone row */}
      {phone && (
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              styles.iconBg
            )}
          >
            <Phone className={cn("w-4 h-4", styles.iconColor)} aria-hidden="true" />
          </div>
          <div>
            <p className={cn("text-[11px] font-medium", styles.labelColor)}>
              Teléfono
            </p>
            <p className={cn("text-sm font-semibold", styles.valueColor)}>
              {phone}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

interface CallButtonProps {
  phone: string;
}

/**
 * Green call button matching mockup design
 */
export function CallButton({ phone }: CallButtonProps) {
  return (
    <a
      href={`tel:${phone}`}
      className="flex items-center justify-center gap-2 w-full mt-3 py-3 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl font-semibold text-sm transition-colors"
      data-testid="call-provider-button"
    >
      <Phone className="w-4 h-4" aria-hidden="true" />
      Llamar al repartidor
    </a>
  );
}
