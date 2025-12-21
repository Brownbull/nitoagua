import { cva, type VariantProps } from "class-variance-authority";
import { Clock, CheckCircle, Package, XCircle, AlertTriangle, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full font-medium",
  {
    variants: {
      status: {
        pending: "bg-[#FEF3C7] text-[#92400E]",
        accepted: "bg-[#DBEAFE] text-[#1E40AF]",
        in_transit: "bg-[#E0E7FF] text-[#3730A3]", // AC10.5.1: Purple/indigo for "En Camino"
        delivered: "bg-[#D1FAE5] text-[#065F46]",
        cancelled: "bg-[#F3F4F6] text-[#4B5563]",
        no_offers: "bg-[#FFEDD5] text-[#C2410C]", // AC10.4.5: Orange badge for "Sin Ofertas"
      },
      size: {
        default: "gap-1.5 px-3 py-1.5 text-sm",
        sm: "gap-1 px-2 py-1 text-[10px]",
      },
    },
    defaultVariants: {
      status: "pending",
      size: "default",
    },
  }
);

export type RequestStatus = "pending" | "accepted" | "in_transit" | "delivered" | "cancelled" | "no_offers";

export interface StatusBadgeProps
  extends VariantProps<typeof statusBadgeVariants> {
  status: RequestStatus;
  size?: "default" | "sm";
  className?: string;
}

const statusConfig: Record<
  RequestStatus,
  { icon: typeof Clock; label: string }
> = {
  pending: { icon: Clock, label: "Pendiente" },
  accepted: { icon: CheckCircle, label: "Aceptada" },
  in_transit: { icon: Truck, label: "En Camino" }, // AC10.5.1
  delivered: { icon: Package, label: "Entregada" },
  cancelled: { icon: XCircle, label: "Cancelada" },
  no_offers: { icon: AlertTriangle, label: "Sin Ofertas" }, // AC10.4.5
};

export function StatusBadge({ status, size = "default", className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const iconSize = size === "sm" ? "h-3 w-3" : "h-4 w-4";

  return (
    <span className={cn(statusBadgeVariants({ status, size }), className)}>
      <Icon className={iconSize} aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
}
