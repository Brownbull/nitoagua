"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Truck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { resolveDispute, type ResolutionType } from "@/lib/actions/admin-disputes";

interface DisputeResolutionProps {
  disputeId: string;
}

export function DisputeResolution({ disputeId }: DisputeResolutionProps) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [selectedResolution, setSelectedResolution] = useState<ResolutionType | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResolve = (resolution: ResolutionType) => {
    if (!notes.trim()) {
      setError("Debes agregar notas antes de resolver");
      return;
    }
    setSelectedResolution(resolution);
    setShowConfirmDialog(true);
  };

  const handleConfirm = async () => {
    if (!selectedResolution) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await resolveDispute({
        disputeId,
        resolution: selectedResolution,
        notes: notes.trim(),
      });

      if (!result.success) {
        setError(result.error || "Error al resolver la disputa");
        setShowConfirmDialog(false);
        return;
      }

      // Redirect to disputes list to show updated status
      setShowConfirmDialog(false);
      router.push("/admin/disputes");
    } catch (err) {
      console.error("Error resolving dispute:", err);
      setError("Error inesperado. Intenta de nuevo.");
      setShowConfirmDialog(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resolutionLabel =
    selectedResolution === "resolved_consumer"
      ? "a favor del consumidor"
      : "a favor del proveedor";

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
        Resolver Disputa
      </h2>

      {/* Notes textarea */}
      <div className="mb-4">
        <label htmlFor="resolution-notes" className="block text-sm font-medium text-gray-700 mb-2">
          Notas internas (obligatorias)
        </label>
        <Textarea
          id="resolution-notes"
          placeholder="Describe el resultado de la investigación y el motivo de la resolución..."
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            setError(null);
          }}
          rows={4}
          className="resize-none"
          data-testid="resolution-notes"
        />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      {/* Resolution buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-2 border-green-200 hover:bg-green-50 hover:border-green-300"
          onClick={() => handleResolve("resolved_consumer")}
          data-testid="resolve-consumer"
        >
          <User className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium text-green-700">A favor del Consumidor</span>
          <span className="text-xs text-gray-500">El consumidor tiene razón</span>
        </Button>

        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
          onClick={() => handleResolve("resolved_provider")}
          data-testid="resolve-provider"
        >
          <Truck className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">A favor del Proveedor</span>
          <span className="text-xs text-gray-500">El proveedor tiene razón</span>
        </Button>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Resolución</DialogTitle>
            <DialogDescription>
              Vas a resolver esta disputa <strong>{resolutionLabel}</strong>. Esta acción no se
              puede deshacer y ambas partes serán notificadas.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-gray-50 rounded-lg p-4 my-4">
            <p className="text-sm text-gray-600 font-medium mb-2">Notas de resolución:</p>
            <p className="text-sm text-gray-800">{notes}</p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isSubmitting}
              className={
                selectedResolution === "resolved_consumer"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }
              data-testid="confirm-resolution"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                "Confirmar Resolución"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
