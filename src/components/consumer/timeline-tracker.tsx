import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RequestStatus } from "@/components/shared/status-badge";

export interface TimelineTrackerProps {
  currentStatus: RequestStatus;
  createdAt: string;
  acceptedAt?: string | null;
  inTransitAt?: string | null;
  deliveredAt?: string | null;
  formatDate: (date: string) => string;
}

interface TimelineStep {
  id: number;
  label: string;
  status: "completed" | "current" | "pending";
  timestamp?: string | null;
}

/**
 * Get timeline steps for the vertical timeline matching mockup design
 * Steps: Solicitud enviada → Repartidor confirmó → En camino → Entregado
 */
function getTimelineSteps(
  currentStatus: RequestStatus,
  createdAt: string,
  acceptedAt?: string | null,
  inTransitAt?: string | null,
  deliveredAt?: string | null
): TimelineStep[] {
  const statusOrder = ["pending", "accepted", "in_transit", "delivered"];
  const currentIndex = statusOrder.indexOf(currentStatus);

  // Handle cancelled status
  if (currentStatus === "cancelled") {
    return [
      {
        id: 1,
        label: "Solicitud enviada",
        status: "completed",
        timestamp: createdAt,
      },
      {
        id: 2,
        label: "Repartidor confirmó",
        status: acceptedAt ? "completed" : "pending",
        timestamp: acceptedAt,
      },
      {
        id: 3,
        label: "En camino",
        status: inTransitAt ? "completed" : "pending",
        timestamp: inTransitAt,
      },
      {
        id: 4,
        label: "Entregado",
        status: "pending",
        timestamp: null,
      },
    ];
  }

  // Handle no_offers status
  if (currentStatus === "no_offers") {
    return [
      {
        id: 1,
        label: "Solicitud enviada",
        status: "completed",
        timestamp: createdAt,
      },
      {
        id: 2,
        label: "Recibiendo ofertas",
        status: "pending",
        timestamp: null,
      },
      {
        id: 3,
        label: "Seleccionar oferta",
        status: "pending",
        timestamp: null,
      },
      {
        id: 4,
        label: "Entrega",
        status: "pending",
        timestamp: null,
      },
    ];
  }

  // For pending status, show offer-focused steps
  if (currentStatus === "pending") {
    return [
      {
        id: 1,
        label: "Solicitud enviada",
        status: "completed",
        timestamp: createdAt,
      },
      {
        id: 2,
        label: "Recibiendo ofertas",
        status: "current",
        timestamp: null,
      },
      {
        id: 3,
        label: "Seleccionar oferta",
        status: "pending",
        timestamp: null,
      },
      {
        id: 4,
        label: "Entrega",
        status: "pending",
        timestamp: null,
      },
    ];
  }

  // For accepted/in_transit/delivered statuses
  return [
    {
      id: 1,
      label: "Solicitud enviada",
      status: "completed",
      timestamp: createdAt,
    },
    {
      id: 2,
      label: "Repartidor confirmó",
      status: currentIndex >= 1 ? "completed" : "pending",
      timestamp: acceptedAt,
    },
    {
      id: 3,
      label: "En camino",
      status:
        currentIndex > 2 ? "completed" : currentIndex === 2 ? "current" : "pending",
      timestamp: inTransitAt,
    },
    {
      id: 4,
      label: "Entregado",
      status: currentIndex === 3 ? "completed" : "pending",
      timestamp: deliveredAt,
    },
  ];
}

/**
 * Vertical timeline component matching mockup design
 *
 * Features:
 * - White card with shadow
 * - Vertical timeline with left-aligned dots
 * - Green checkmark for completed steps
 * - Blue ring animation for current step
 * - Gray for pending steps
 * - Timestamps shown for completed/current steps
 */
export function TimelineTracker({
  currentStatus,
  createdAt,
  acceptedAt,
  inTransitAt,
  deliveredAt,
  formatDate,
}: TimelineTrackerProps) {
  const steps = getTimelineSteps(currentStatus, createdAt, acceptedAt, inTransitAt, deliveredAt);

  return (
    <div className="bg-white rounded-2xl p-5 mb-4 shadow-sm" data-testid="timeline">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Progreso</h3>

      <div className="relative pl-7">
        {/* Vertical line */}
        <div
          className="absolute left-[9px] top-0 bottom-0 w-0.5 bg-gray-200"
          aria-hidden="true"
        />

        <ol className="space-y-5">
          {steps.map((step, index) => (
            <li key={step.id} className="relative" data-testid={`timeline-step-${step.id}`} data-status={step.status}>
              {/* Step dot */}
              <span
                className={cn(
                  "absolute -left-7 top-0 w-5 h-5 rounded-full flex items-center justify-center",
                  step.status === "completed" && "bg-[#10B981]",
                  step.status === "current" && "bg-white border-2 border-[#0077B6] shadow-[0_0_0_4px_#CAF0F8]",
                  step.status === "pending" && "bg-white border-2 border-gray-300"
                )}
              >
                {step.status === "completed" && (
                  <Check className="h-3 w-3 text-white" aria-hidden="true" />
                )}
              </span>

              {/* Step content */}
              <div>
                <span
                  className={cn(
                    "text-sm font-semibold",
                    step.status === "pending" ? "text-gray-400" : "text-gray-900"
                  )}
                >
                  {step.label}
                </span>
                {step.timestamp && step.status !== "pending" && (
                  <span className="block text-xs text-gray-500 mt-0.5">
                    {formatDate(step.timestamp)}
                  </span>
                )}
                {step.status === "current" && !step.timestamp && (
                  <span className="block text-xs text-gray-500 mt-0.5">
                    En progreso...
                  </span>
                )}
              </div>

              {/* Segment line override for completed sections */}
              {index < steps.length - 1 && steps[index + 1].status !== "pending" && (
                <div
                  className="absolute -left-[19px] top-5 w-0.5 h-[calc(100%+4px)] bg-[#10B981]"
                  style={{ marginLeft: "-1px" }}
                  aria-hidden="true"
                />
              )}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
