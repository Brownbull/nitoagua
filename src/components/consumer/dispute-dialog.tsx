"use client";

import { useState } from "react";
import { Loader2, AlertTriangle, Check } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
// Uses API route instead of server action to avoid RSC errors

// Define types and labels locally for client component
// These must match the server action types
type DisputeType =
  | "not_delivered"
  | "wrong_quantity"
  | "late_delivery"
  | "quality_issue"
  | "other";

// Display labels for dispute types (Spanish)
const DISPUTE_TYPE_LABELS: Record<DisputeType, string> = {
  not_delivered: "No recibí mi pedido",
  wrong_quantity: "Cantidad incorrecta",
  late_delivery: "Llegó tarde",
  quality_issue: "Mala calidad",
  other: "Otro problema",
};

interface DisputeDialogProps {
  requestId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDisputeCreated?: () => void;
}

// Dispute type options with icons for visual emphasis
const DISPUTE_OPTIONS: { type: DisputeType; icon: string; label: string }[] = [
  { type: "not_delivered", icon: "🚫", label: "No recibí mi pedido" },
  { type: "wrong_quantity", icon: "📉", label: "Cantidad incorrecta" },
  { type: "late_delivery", icon: "⏰", label: "Llegó tarde" },
  { type: "quality_issue", icon: "💧", label: "Mala calidad" },
  { type: "other", icon: "❓", label: "Otro problema" },
];

/**
 * Dispute Dialog Component
 *
 * Allows consumers to report problems with their delivered orders.
 * Implements AC12.7.5.2 (dispute types) and AC12.7.5.3 (submission flow).
 *
 * Flow:
 * 1. Select dispute type (required)
 * 2. Add description (optional)
 * 3. Confirm submission
 * 4. Success/error feedback
 */
export function DisputeDialog({
  requestId,
  open,
  onOpenChange,
  onDisputeCreated,
}: DisputeDialogProps) {
  // Form state
  const [selectedType, setSelectedType] = useState<DisputeType | null>(null);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Reset form when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isSubmitting) {
      setSelectedType(null);
      setDescription("");
      setShowConfirmation(false);
    }
    if (!isSubmitting) {
      onOpenChange(newOpen);
    }
  };

  // Handle type selection
  const handleTypeSelect = (type: DisputeType) => {
    setSelectedType(type);
  };

  // Show confirmation step
  const handleContinue = () => {
    if (!selectedType) {
      toast.error("Selecciona el tipo de problema");
      return;
    }
    setShowConfirmation(true);
  };

  // Go back to type selection
  const handleBack = () => {
    setShowConfirmation(false);
  };

  // Submit the dispute using API route
  const handleSubmit = async () => {
    if (!selectedType) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/disputes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          request_id: requestId,
          dispute_type: selectedType,
          description: description.trim() || undefined,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        toast.error("Error al reportar problema", {
          description: result.error || "Por favor, intenta de nuevo",
        });
        return;
      }

      // Success
      toast.success("Reporte enviado", {
        description: "Revisaremos tu caso y te contactaremos pronto",
      });

      // Close dialog and notify parent
      onOpenChange(false);
      onDisputeCreated?.();

      // Reset form
      setSelectedType(null);
      setDescription("");
      setShowConfirmation(false);
    } catch (err) {
      console.error("[DisputeDialog] Submit error:", err);
      toast.error("Error al reportar problema", {
        description: "Ocurrió un error inesperado. Por favor, intenta de nuevo.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        data-testid="dispute-dialog"
        showCloseButton={!isSubmitting}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" data-testid="dispute-dialog-title">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            {showConfirmation ? "Confirmar Reporte" : "Reportar Problema"}
          </DialogTitle>
          <DialogDescription>
            {showConfirmation
              ? "Por favor confirma que deseas enviar este reporte."
              : "Selecciona el tipo de problema que tuviste con tu entrega."}
          </DialogDescription>
        </DialogHeader>

        {!showConfirmation ? (
          // Step 1: Select dispute type
          <div className="space-y-4 py-2">
            {/* Dispute type selection - AC12.7.5.2 */}
            <div className="space-y-2" role="radiogroup" aria-label="Tipo de problema">
              {DISPUTE_OPTIONS.map(({ type, icon, label }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTypeSelect(type)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                    selectedType === type
                      ? "border-[#0077B6] bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                  data-testid={`dispute-type-${type}`}
                  role="radio"
                  aria-checked={selectedType === type}
                >
                  <span className="text-lg">{icon}</span>
                  <span
                    className={`flex-1 text-sm font-medium ${
                      selectedType === type ? "text-[#0077B6]" : "text-gray-700"
                    }`}
                  >
                    {label}
                  </span>
                  {selectedType === type && (
                    <Check className="h-5 w-5 text-[#0077B6]" />
                  )}
                </button>
              ))}
            </div>

            {/* Description textarea - AC12.7.5.3 */}
            <div className="space-y-2">
              <Label htmlFor="dispute-description" className="text-sm text-gray-600">
                Descripción (opcional)
              </Label>
              <Textarea
                id="dispute-description"
                placeholder="Cuéntanos más detalles sobre el problema..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="resize-none"
                rows={3}
                maxLength={500}
                data-testid="dispute-description"
              />
              <p className="text-xs text-gray-400 text-right">
                {description.length}/500
              </p>
            </div>
          </div>
        ) : (
          // Step 2: Confirmation - AC12.7.5.3
          <div className="space-y-4 py-2">
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
              <p className="text-sm font-medium text-amber-800 mb-2">
                Tipo de problema:
              </p>
              <p className="text-amber-900" data-testid="dispute-confirmation-type">
                {selectedType && DISPUTE_TYPE_LABELS[selectedType]}
              </p>

              {description && (
                <>
                  <p className="text-sm font-medium text-amber-800 mt-3 mb-2">
                    Descripción:
                  </p>
                  <p className="text-amber-900 text-sm" data-testid="dispute-confirmation-description">
                    {description}
                  </p>
                </>
              )}
            </div>

            <p className="text-sm text-gray-600 text-center">
              Al enviar este reporte, nuestro equipo revisará el caso y se
              pondrá en contacto contigo.
            </p>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          {!showConfirmation ? (
            // Step 1 buttons
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                data-testid="dispute-cancel-button"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleContinue}
                disabled={!selectedType || isSubmitting}
                className="bg-[#0077B6] hover:bg-[#005f8f]"
                data-testid="dispute-continue-button"
              >
                Continuar
              </Button>
            </>
          ) : (
            // Step 2 buttons (confirmation) - AC12.7.5.3
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={isSubmitting}
                data-testid="dispute-back-button"
              >
                Volver
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-amber-500 hover:bg-amber-600"
                data-testid="dispute-submit-button"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar Reporte"
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DisputeDialog;
