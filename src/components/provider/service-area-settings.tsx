"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Check, Loader2, ArrowLeft, AlertTriangle, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";
import { COMUNAS } from "@/lib/validations/provider-registration";
import {
  updateServiceAreas,
  ServiceAreaWarning,
} from "@/lib/actions/provider-settings";
import { cn } from "@/lib/utils";

interface ServiceAreaSettingsProps {
  initialAreas: string[];
  backUrl?: string;
  hideBackButton?: boolean;
}

export function ServiceAreaSettings({ initialAreas, backUrl = "/provider/settings", hideBackButton = false }: ServiceAreaSettingsProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAreas, setSelectedAreas] = useState<string[]>(initialAreas);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [pendingWarnings, setPendingWarnings] = useState<ServiceAreaWarning[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Track if there are unsaved changes
  const hasChanges = useMemo(() => {
    if (selectedAreas.length !== initialAreas.length) return true;
    return !selectedAreas.every((area) => initialAreas.includes(area));
  }, [selectedAreas, initialAreas]);

  // Track areas being removed
  const areasBeingRemoved = useMemo(() => {
    return initialAreas.filter((area) => !selectedAreas.includes(area));
  }, [selectedAreas, initialAreas]);

  // Track areas being added
  const areasBeingAdded = useMemo(() => {
    return selectedAreas.filter((area) => !initialAreas.includes(area));
  }, [selectedAreas, initialAreas]);

  const toggleArea = (areaId: string) => {
    setError(null);

    // Prevent removing the last area
    if (selectedAreas.includes(areaId) && selectedAreas.length === 1) {
      setError("Debes tener al menos una comuna activa");
      return;
    }

    setSelectedAreas((prev) =>
      prev.includes(areaId)
        ? prev.filter((id) => id !== areaId)
        : [...prev, areaId]
    );
  };

  const handleSave = async (skipWarnings: boolean = false) => {
    if (selectedAreas.length === 0) {
      setError("Debes tener al menos una comuna activa");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await updateServiceAreas(selectedAreas, skipWarnings);

      if (!result.success) {
        // Check if this is a warning about pending requests
        if (result.warnings && result.warnings.length > 0) {
          setPendingWarnings(result.warnings);
          setShowWarningDialog(true);
          setIsSubmitting(false);
          return;
        }

        // Regular error
        setError(result.error || "Error al guardar cambios");
        toast.error(result.error || "Error al guardar cambios");
        setIsSubmitting(false);
        return;
      }

      // Success
      toast.success("Áreas de servicio actualizadas");

      // Refresh the page to get updated data
      router.refresh();
    } catch {
      setError("Error inesperado al guardar");
      toast.error("Error inesperado al guardar");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmWithWarnings = async () => {
    setShowWarningDialog(false);
    await handleSave(true);
  };

  const handleBack = () => {
    router.push(backUrl);
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 rounded-lg p-4">
        <p className="text-sm text-blue-700">
          Selecciona las comunas donde puedes realizar entregas de agua.
          Necesitas al menos una comuna activa.
        </p>
      </div>

      {/* Comuna Selection */}
      <div className="space-y-3">
        {COMUNAS.map((comuna) => {
          const isSelected = selectedAreas.includes(comuna.id);
          const isBeingAdded = areasBeingAdded.includes(comuna.id);
          const isBeingRemoved = areasBeingRemoved.includes(comuna.id);
          const isLastArea = isSelected && selectedAreas.length === 1;

          return (
            <button
              key={comuna.id}
              type="button"
              onClick={() => toggleArea(comuna.id)}
              disabled={isLastArea}
              className={cn(
                "w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all",
                isSelected
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-200 bg-white hover:border-orange-200",
                isLastArea && "cursor-not-allowed opacity-75",
                isBeingAdded && "ring-2 ring-green-300",
                isBeingRemoved && "ring-2 ring-red-300"
              )}
              data-testid={`comuna-${comuna.id}`}
              aria-pressed={isSelected}
              aria-disabled={isLastArea}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    isSelected ? "bg-orange-500" : "bg-gray-100"
                  )}
                >
                  <MapPin
                    className={cn(
                      "w-5 h-5",
                      isSelected ? "text-white" : "text-gray-500"
                    )}
                  />
                </div>
                <div className="text-left">
                  <span
                    className={cn(
                      "font-medium block",
                      isSelected ? "text-orange-700" : "text-gray-700"
                    )}
                  >
                    {comuna.name}
                  </span>
                  {isBeingAdded && (
                    <span className="text-xs text-green-600">Nuevo</span>
                  )}
                  {isBeingRemoved && (
                    <span className="text-xs text-red-600">Se eliminará</span>
                  )}
                  {isLastArea && (
                    <span className="text-xs text-gray-500">Mínimo requerido</span>
                  )}
                </div>
              </div>
              {isSelected && (
                <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700" role="alert">
            {error}
          </p>
        </div>
      )}

      {/* Changes Summary */}
      {hasChanges && (
        <div className="bg-amber-50 rounded-lg p-3">
          <p className="text-sm text-amber-700 font-medium mb-1">
            Cambios pendientes:
          </p>
          <ul className="text-sm text-amber-600 space-y-1">
            {areasBeingAdded.length > 0 && (
              <li>
                + {areasBeingAdded.length}{" "}
                {areasBeingAdded.length === 1 ? "comuna nueva" : "comunas nuevas"}
              </li>
            )}
            {areasBeingRemoved.length > 0 && (
              <li>
                - {areasBeingRemoved.length}{" "}
                {areasBeingRemoved.length === 1
                  ? "comuna a eliminar"
                  : "comunas a eliminar"}
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Selection Summary */}
      <div className="bg-gray-50 rounded-lg p-3">
        <p className="text-sm text-gray-600">
          <span className="font-medium text-gray-900">{selectedAreas.length}</span>{" "}
          {selectedAreas.length === 1 ? "comuna activa" : "comunas activas"}
        </p>
      </div>

      {/* Action Buttons */}
      <div className={cn("flex gap-3 pt-4", hideBackButton && "justify-end")}>
        {!hideBackButton && (
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            className="flex-1 h-12 rounded-xl"
            data-testid="back-button"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver
          </Button>
        )}
        <Button
          type="button"
          onClick={() => handleSave()}
          disabled={isSubmitting || !hasChanges}
          className={cn(
            "h-12 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl disabled:opacity-50",
            hideBackButton ? "w-full" : "flex-1"
          )}
          data-testid="save-button"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              Guardar cambios
            </>
          )}
        </Button>
      </div>

      {/* Warning Dialog for Pending Requests */}
      <AlertDialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Solicitudes Pendientes
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                <p className="mb-3">
                  Tienes solicitudes pendientes que podrían verse afectadas:
                </p>
                <ul className="space-y-2">
                  {pendingWarnings.map((warning) => (
                    <li
                      key={warning.comunaId}
                      className="bg-amber-50 p-2 rounded text-amber-700"
                    >
                      {warning.pendingCount} solicitud(es) pendiente(s) en{" "}
                      {warning.comunaName}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-sm">
                  Las solicitudes existentes NO se verán afectadas, pero no
                  recibirás nuevas solicitudes de las áreas eliminadas.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="warning-cancel">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmWithWarnings}
              className="bg-orange-500 hover:bg-orange-600"
              data-testid="warning-confirm"
            >
              Continuar de todos modos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
