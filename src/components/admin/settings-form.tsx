"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, Save, AlertCircle, Check, Timer } from "lucide-react";
import { toast } from "sonner";

import {
  adminSettingsSchema,
  type AdminSettingsInput,
} from "@/lib/validations/admin";
import { updateSettings } from "@/lib/actions/admin";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SettingsFormProps {
  initialSettings: AdminSettingsInput;
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingValues, setPendingValues] = useState<AdminSettingsInput | null>(
    null
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    reset,
  } = useForm<AdminSettingsInput>({
    resolver: zodResolver(adminSettingsSchema),
    defaultValues: initialSettings,
  });

  const currentValues = watch();

  // Check if values have actually changed
  const hasChanges =
    currentValues.offer_validity_default !== initialSettings.offer_validity_default ||
    currentValues.offer_validity_min !== initialSettings.offer_validity_min ||
    currentValues.offer_validity_max !== initialSettings.offer_validity_max ||
    currentValues.request_timeout_hours !== initialSettings.request_timeout_hours;

  const onSubmit = (data: AdminSettingsInput) => {
    // Show confirmation dialog before saving
    setPendingValues(data);
    setShowConfirmDialog(true);
  };

  const handleConfirm = () => {
    if (!pendingValues) return;

    startTransition(async () => {
      const result = await updateSettings(pendingValues);

      if (result.success) {
        toast.success("Configuracion guardada", {
          description: "Los cambios se aplicaran a las nuevas ofertas",
        });
        // Reset form with new values to clear dirty state
        reset(pendingValues);
      } else {
        toast.error("Error al guardar", {
          description: result.error || "Intenta de nuevo",
        });
      }

      setShowConfirmDialog(false);
      setPendingValues(null);
    });
  };

  const getChanges = () => {
    if (!pendingValues) return [];

    const changes: { label: string; from: number; to: number; unit: string }[] =
      [];

    if (
      pendingValues.offer_validity_default !==
      initialSettings.offer_validity_default
    ) {
      changes.push({
        label: "Validez por defecto",
        from: initialSettings.offer_validity_default,
        to: pendingValues.offer_validity_default,
        unit: "min",
      });
    }
    if (
      pendingValues.offer_validity_min !== initialSettings.offer_validity_min
    ) {
      changes.push({
        label: "Validez minima",
        from: initialSettings.offer_validity_min,
        to: pendingValues.offer_validity_min,
        unit: "min",
      });
    }
    if (
      pendingValues.offer_validity_max !== initialSettings.offer_validity_max
    ) {
      changes.push({
        label: "Validez maxima",
        from: initialSettings.offer_validity_max,
        to: pendingValues.offer_validity_max,
        unit: "min",
      });
    }
    if (
      pendingValues.request_timeout_hours !==
      initialSettings.request_timeout_hours
    ) {
      changes.push({
        label: "Timeout de pedidos",
        from: initialSettings.request_timeout_hours,
        to: pendingValues.request_timeout_hours,
        unit: "hrs",
      });
    }

    return changes;
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Offer Validity Section */}
        <div
          className="bg-white rounded-xl p-3.5 shadow-sm"
          data-testid="offer-validity-section"
        >
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Validez de Ofertas</h2>
              <p className="text-xs text-gray-500">
                Tiempo que una oferta permanece activa
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {/* Min validity */}
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div>
                <label
                  htmlFor="offer_validity_min"
                  className="text-sm font-semibold text-gray-900"
                >
                  Validez minima
                </label>
                <p className="text-[11px] text-gray-500">
                  Tiempo minimo para una oferta
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  id="offer_validity_min"
                  type="number"
                  {...register("offer_validity_min", { valueAsNumber: true })}
                  className="w-16 px-2 py-1.5 text-right text-sm font-bold text-gray-900 bg-gray-100 rounded-lg border-0 focus:ring-2 focus:ring-gray-700"
                  data-testid="input-offer-validity-min"
                />
                <span className="text-xs text-gray-500">min</span>
              </div>
            </div>
            {errors.offer_validity_min && (
              <p
                className="text-xs text-red-600 flex items-center gap-1"
                data-testid="error-offer-validity-min"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.offer_validity_min.message}
              </p>
            )}

            {/* Default validity */}
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div>
                <label
                  htmlFor="offer_validity_default"
                  className="text-sm font-semibold text-gray-900"
                >
                  Validez por defecto
                </label>
                <p className="text-[11px] text-gray-500">
                  Valor inicial al crear oferta
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  id="offer_validity_default"
                  type="number"
                  {...register("offer_validity_default", {
                    valueAsNumber: true,
                  })}
                  className="w-16 px-2 py-1.5 text-right text-sm font-bold text-gray-900 bg-gray-100 rounded-lg border-0 focus:ring-2 focus:ring-gray-700"
                  data-testid="input-offer-validity-default"
                />
                <span className="text-xs text-gray-500">min</span>
              </div>
            </div>
            {errors.offer_validity_default && (
              <p
                className="text-xs text-red-600 flex items-center gap-1"
                data-testid="error-offer-validity-default"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.offer_validity_default.message}
              </p>
            )}

            {/* Max validity */}
            <div className="flex items-center justify-between py-2">
              <div>
                <label
                  htmlFor="offer_validity_max"
                  className="text-sm font-semibold text-gray-900"
                >
                  Validez maxima
                </label>
                <p className="text-[11px] text-gray-500">
                  Tiempo maximo permitido
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  id="offer_validity_max"
                  type="number"
                  {...register("offer_validity_max", { valueAsNumber: true })}
                  className="w-16 px-2 py-1.5 text-right text-sm font-bold text-gray-900 bg-gray-100 rounded-lg border-0 focus:ring-2 focus:ring-gray-700"
                  data-testid="input-offer-validity-max"
                />
                <span className="text-xs text-gray-500">min</span>
              </div>
            </div>
            {errors.offer_validity_max && (
              <p
                className="text-xs text-red-600 flex items-center gap-1"
                data-testid="error-offer-validity-max"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.offer_validity_max.message}
              </p>
            )}
          </div>

          {/* Preview */}
          <div className="mt-3 p-2.5 bg-gray-50 rounded-lg">
            <p className="text-[11px] text-gray-500">Rango configurado:</p>
            <p className="text-xs font-semibold text-gray-900">
              {currentValues.offer_validity_min}-{currentValues.offer_validity_max} min (defecto: {currentValues.offer_validity_default})
            </p>
          </div>
        </div>

        {/* Request Timeout Section */}
        <div
          className="bg-white rounded-xl p-3.5 shadow-sm"
          data-testid="request-timeout-section"
        >
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <Timer className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Timeout de Pedidos</h2>
              <p className="text-xs text-gray-500">
                Tiempo antes de notificar si no hay ofertas
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <label
                htmlFor="request_timeout_hours"
                className="text-sm font-semibold text-gray-900"
              >
                Sin ofertas
              </label>
              <p className="text-[11px] text-gray-500">
                Notificar admin si no hay ofertas
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                id="request_timeout_hours"
                type="number"
                {...register("request_timeout_hours", { valueAsNumber: true })}
                className="w-16 px-2 py-1.5 text-right text-sm font-bold text-gray-900 bg-amber-50 rounded-lg border-0 focus:ring-2 focus:ring-amber-500"
                data-testid="input-request-timeout-hours"
              />
              <span className="text-xs text-gray-500">hrs</span>
            </div>
          </div>
          {errors.request_timeout_hours && (
            <p
              className="text-xs text-red-600 flex items-center gap-1 mt-2"
              data-testid="error-request-timeout-hours"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.request_timeout_hours.message}
            </p>
          )}
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={!hasChanges || isPending}
          className="w-full py-3 bg-gradient-to-r from-gray-700 to-gray-900 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          data-testid="save-settings-button"
        >
          <Save className="w-4 h-4" />
          {isPending ? "Guardando..." : "Guardar Cambios"}
        </button>
      </form>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent data-testid="confirmation-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              Confirmar Cambios
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                <p className="mb-3">
                  Se aplicaran los siguientes cambios a la configuracion:
                </p>
                <div className="space-y-2">
                  {getChanges().map((change, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded-lg"
                    >
                      <span className="font-medium text-gray-900">
                        {change.label}
                      </span>
                      <span className="text-sm">
                        <span className="text-gray-500">
                          {change.from} {change.unit}
                        </span>
                        <span className="mx-2 text-gray-400">→</span>
                        <span className="text-green-600 font-semibold">
                          {change.to} {change.unit}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-gray-500">
                  Los cambios se aplicaran inmediatamente a las nuevas ofertas.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isPending}
              data-testid="cancel-confirmation"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={isPending}
              className="bg-gray-800 hover:bg-gray-900"
              data-testid="confirm-save"
            >
              {isPending ? "Guardando..." : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
