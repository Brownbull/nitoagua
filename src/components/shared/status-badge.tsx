import { cva, type VariantProps } from "class-variance-authority";
import { Clock, CheckCircle, Package, XCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium",
  {
    variants: {
      status: {
        pending: "bg-[#FEF3C7] text-[#92400E]",
        accepted: "bg-[#DBEAFE] text-[#1E40AF]",
        delivered: "bg-[#D1FAE5] text-[#065F46]",
        cancelled: "bg-[#F3F4F6] text-[#4B5563]",
        no_offers: "bg-[#FFEDD5] text-[#C2410C]", // AC10.4.5: Orange badge for "Sin Ofertas"
      },
    },
    defaultVariants: {
      status: "pending",
    },
  }
);

export type RequestStatus = "pending" | "accepted" | "delivered" | "cancelled" | "no_offers";

export interface StatusBadgeProps
  extends VariantProps<typeof statusBadgeVariants> {
  status: RequestStatus;
  className?: string;
}

const statusConfig: Record<
  RequestStatus,
  { icon: typeof Clock; label: string }
> = {
  pending: { icon: Clock, label: "Pendiente" },
  accepted: { icon: CheckCircle, label: "Aceptada" },
  delivered: { icon: Package, label: "Entregada" },
  cancelled: { icon: XCircle, label: "Cancelada" },
  no_offers: { icon: AlertTriangle, label: "Sin Ofertas" }, // AC10.4.5
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={cn(statusBadgeVariants({ status }), className)}>
      <Icon className="h-4 w-4" aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
}
