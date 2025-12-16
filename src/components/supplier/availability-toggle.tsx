"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ActiveDelivery {
  id: string;
  address: string;
  status: string;
}

export interface ToggleAvailabilityResult {
  success: boolean;
  error?: string;
  needsConfirmation?: boolean;
  activeDeliveries?: ActiveDelivery[];
}

interface AvailabilityToggleProps {
  initialValue: boolean;
  onToggle: (isAvailable: boolean) => Promise<ToggleAvailabilityResult>;
  onConfirmToggle?: (isAvailable: boolean) => Promise<ToggleAvailabilityResult>;
  onNeedsConfirmation?: (deliveries: ActiveDelivery[]) => void;
  disabled?: boolean;
}

export function AvailabilityToggle({
  initialValue,
  onToggle,
  onConfirmToggle,
  onNeedsConfirmation,
  disabled = false,
}: AvailabilityToggleProps) {
  const [isAvailable, setIsAvailable] = useState(initialValue);
  const [isPending, startTransition] = useTransition();

  const handleToggle = async (checked: boolean) => {
    // Optimistic update
    setIsAvailable(checked);

    startTransition(async () => {
      const result = await onToggle(checked);

      if (result.needsConfirmation && result.activeDeliveries) {
        // Revert optimistic update - user needs to confirm
        setIsAvailable(!checked);
        if (onNeedsConfirmation) {
          onNeedsConfirmation(result.activeDeliveries);
        }
        return;
      }

      if (!result.success) {
        // Revert optimistic update on error
        setIsAvailable(!checked);
        toast.error(result.error || "No se pudo actualizar la disponibilidad");
        return;
      }

      // Show success toast
      toast.success(
        checked
          ? "Ahora puedes recibir solicitudes"
          : "Ya no recibirás nuevas solicitudes"
      );
    });
  };

  // Handle confirmed toggle (after user confirms active deliveries warning)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleConfirmedToggle = async (confirmed: boolean) => {
    if (!onConfirmToggle) return;

    setIsAvailable(confirmed);

    startTransition(async () => {
      const result = await onConfirmToggle(confirmed);

      if (!result.success) {
        setIsAvailable(!confirmed);
        toast.error(result.error || "No se pudo actualizar la disponibilidad");
        return;
      }

      toast.success("Ya no recibirás nuevas solicitudes");
    });
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors",
        isAvailable
          ? "bg-green-50 border-green-200"
          : "bg-gray-50 border-gray-200"
      )}
      data-testid="availability-toggle-container"
    >
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-3 h-3 rounded-full",
              isAvailable ? "bg-green-500" : "bg-gray-400"
            )}
            data-testid="availability-indicator"
          />
          <span
            className={cn(
              "font-semibold text-sm uppercase tracking-wide",
              isAvailable ? "text-green-700" : "text-gray-600"
            )}
            data-testid="availability-status-text"
          >
            {isAvailable ? "DISPONIBLE" : "NO DISPONIBLE"}
          </span>
        </div>
        <p
          className={cn(
            "text-xs mt-0.5",
            isAvailable ? "text-green-600" : "text-gray-500"
          )}
        >
          {isAvailable
            ? "Estás recibiendo solicitudes"
            : "No recibirás nuevas solicitudes"}
        </p>
      </div>

      <div className="relative">
        {isPending && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded">
            <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
          </div>
        )}
        <Switch
          checked={isAvailable}
          onCheckedChange={handleToggle}
          disabled={disabled || isPending}
          className="data-[state=checked]:bg-green-500"
          data-testid="availability-switch"
        />
      </div>
    </div>
  );
}

// Export the confirmed toggle handler for use in parent component
export type { AvailabilityToggleProps };
