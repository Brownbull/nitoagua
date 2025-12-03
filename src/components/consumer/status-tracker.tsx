import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RequestStatus } from "@/components/shared/status-badge";

export interface StatusTrackerProps {
  currentStatus: RequestStatus;
  createdAt: string;
  acceptedAt?: string | null;
  deliveredAt?: string | null;
  formatDate: (date: string) => string;
}

interface TimelineStep {
  id: number;
  label: string;
  status: "completed" | "current" | "pending";
  timestamp?: string | null;
}

function getTimelineSteps(
  currentStatus: RequestStatus,
  createdAt: string,
  acceptedAt?: string | null,
  deliveredAt?: string | null
): TimelineStep[] {
  const statusOrder = ["pending", "accepted", "delivered"];
  const currentIndex = statusOrder.indexOf(currentStatus);

  // Handle cancelled status - show timeline up to where it was cancelled
  if (currentStatus === "cancelled") {
    return [
      {
        id: 1,
        label: "Pendiente",
        status: "completed",
        timestamp: createdAt,
      },
      {
        id: 2,
        label: "Aceptada",
        status: acceptedAt ? "completed" : "pending",
        timestamp: acceptedAt,
      },
      {
        id: 3,
        label: "Entregada",
        status: "pending",
        timestamp: null,
      },
    ];
  }

  return [
    {
      id: 1,
      label: "Pendiente",
      status: currentIndex > 0 ? "completed" : "current",
      timestamp: createdAt,
    },
    {
      id: 2,
      label: "Aceptada",
      status:
        currentIndex > 1 ? "completed" : currentIndex === 1 ? "current" : "pending",
      timestamp: acceptedAt,
    },
    {
      id: 3,
      label: "Entregada",
      status: currentIndex === 2 ? "current" : "pending",
      timestamp: deliveredAt,
    },
  ];
}

export function StatusTracker({
  currentStatus,
  createdAt,
  acceptedAt,
  deliveredAt,
  formatDate,
}: StatusTrackerProps) {
  const steps = getTimelineSteps(currentStatus, createdAt, acceptedAt, deliveredAt);

  return (
    <div className="w-full">
      {/* Mobile: Vertical layout */}
      <div className="md:hidden">
        <ol className="relative border-l-2 border-gray-200 ml-4">
          {steps.map((step, index) => (
            <li
              key={step.id}
              className={cn("pb-8 pl-6", index === steps.length - 1 && "pb-0")}
            >
              {/* Step indicator */}
              <span
                className={cn(
                  "absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-white",
                  step.status === "completed" && "bg-[#10B981]",
                  step.status === "current" && "bg-[#0077B6]",
                  step.status === "pending" && "bg-white border-2 border-[#D1D5DB]"
                )}
              >
                {(step.status === "completed" || step.status === "current") && (
                  <Check className="h-3.5 w-3.5 text-white" aria-hidden="true" />
                )}
              </span>

              {/* Step content */}
              <div className="flex flex-col">
                <span
                  className={cn(
                    "font-medium",
                    step.status === "pending" ? "text-gray-500" : "text-gray-900"
                  )}
                >
                  {step.label}
                </span>
                {step.timestamp && (step.status === "completed" || step.status === "current") && (
                  <span className="text-sm text-gray-500">
                    {formatDate(step.timestamp)}
                  </span>
                )}
              </div>

              {/* Connecting line styling - dashed for pending */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "absolute left-[-1px] top-6 h-[calc(100%-24px)] w-0.5",
                    steps[index + 1].status === "pending"
                      ? "border-l-2 border-dashed border-[#D1D5DB] bg-transparent"
                      : "bg-[#10B981]"
                  )}
                  style={{ marginLeft: "-1px" }}
                />
              )}
            </li>
          ))}
        </ol>
      </div>

      {/* Tablet+: Horizontal layout */}
      <div className="hidden md:block">
        <ol className="flex items-center justify-between">
          {steps.map((step, index) => (
            <li key={step.id} className="flex flex-1 items-center">
              <div className="flex flex-col items-center text-center">
                {/* Step indicator */}
                <span
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full",
                    step.status === "completed" && "bg-[#10B981]",
                    step.status === "current" && "bg-[#0077B6]",
                    step.status === "pending" && "bg-white border-2 border-[#D1D5DB]"
                  )}
                >
                  {(step.status === "completed" || step.status === "current") && (
                    <Check className="h-5 w-5 text-white" aria-hidden="true" />
                  )}
                </span>

                {/* Step label */}
                <span
                  className={cn(
                    "mt-2 font-medium",
                    step.status === "pending" ? "text-gray-500" : "text-gray-900"
                  )}
                >
                  {step.label}
                </span>

                {/* Timestamp */}
                {step.timestamp && (step.status === "completed" || step.status === "current") && (
                  <span className="text-sm text-gray-500">
                    {formatDate(step.timestamp)}
                  </span>
                )}
              </div>

              {/* Connecting line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-4",
                    steps[index + 1].status === "pending"
                      ? "border-t-2 border-dashed border-[#D1D5DB]"
                      : "bg-[#10B981]"
                  )}
                />
              )}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
