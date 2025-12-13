"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { verifyProvider, type VerificationDecision } from "@/lib/actions/verification";

interface VerificationActionsProps {
  providerId: string;
  providerName: string;
  currentStatus: string | null;
  currentNotes: string | null;
}

type ActionMode = "none" | "approve" | "reject" | "more_info";

const DOCUMENT_TYPES = [
  { id: "cedula", label: "Cedula de Identidad" },
  { id: "licencia", label: "Licencia de Conducir" },
  { id: "permiso_sanitario", label: "Permiso Sanitario" },
  { id: "certificacion", label: "Certificacion" },
  { id: "vehiculo", label: "Fotos Vehiculo" },
];

export function VerificationActions({
  providerId,
  providerName,
  currentStatus: _currentStatus,
  currentNotes,
}: VerificationActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [actionMode, setActionMode] = useState<ActionMode>("none");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState(currentNotes || "");
  const [missingDocs, setMissingDocs] = useState<string[]>([]);

  function handleDocToggle(docId: string) {
    setMissingDocs((prev) =>
      prev.includes(docId)
        ? prev.filter((id) => id !== docId)
        : [...prev, docId]
    );
  }

  async function handleSubmit(decision: VerificationDecision) {
    // Validation
    if (decision === "rejected" && !reason.trim()) {
      toast.error("Debes proporcionar un motivo de rechazo");
      return;
    }

    if (decision === "more_info_needed" && missingDocs.length === 0) {
      toast.error("Selecciona los documentos faltantes");
      return;
    }

    startTransition(async () => {
      const result = await verifyProvider({
        providerId,
        decision,
        reason: reason.trim() || undefined,
        notes: notes.trim() || undefined,
        missingDocs: missingDocs.length > 0 ? missingDocs : undefined,
      });

      if (result.success) {
        toast.success(
          decision === "approved"
            ? `${providerName} ha sido aprobado`
            : decision === "rejected"
            ? `${providerName} ha sido rechazado`
            : `Se ha solicitado mas informacion a ${providerName}`
        );
        router.push("/admin/verification");
        router.refresh();
      } else {
        toast.error(result.error || "Error al procesar la solicitud");
      }
    });
  }

  function resetActionMode() {
    setActionMode("none");
    setReason("");
    setMissingDocs([]);
  }

  return (
    <section className="space-y-4" data-testid="verification-actions">
      {/* Main action buttons - show when no mode selected */}
      {actionMode === "none" && (
        <div className="space-y-3">
          {/* Approve button */}
          <button
            onClick={() => setActionMode("approve")}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:from-green-600 hover:to-green-700 transition-all shadow-lg"
            data-testid="btn-approve"
          >
            <Check className="w-5 h-5" />
            Aprobar
          </button>

          {/* Secondary actions */}
          <div className="flex gap-3">
            <button
              onClick={() => setActionMode("more_info")}
              className="flex-1 py-3 bg-white text-yellow-600 border-2 border-yellow-400 rounded-xl font-semibold hover:bg-yellow-50 transition-colors"
              data-testid="btn-more-info"
            >
              Mas Info
            </button>
            <button
              onClick={() => setActionMode("reject")}
              className="flex-1 py-3 bg-white text-red-600 border-2 border-red-400 rounded-xl font-semibold hover:bg-red-50 transition-colors"
              data-testid="btn-reject"
            >
              Rechazar
            </button>
          </div>

          {/* Notes textarea */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
              Notas Internas (Opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Agregar notas internas sobre este proveedor..."
              className="w-full h-20 p-3 border-2 border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:border-gray-400"
              data-testid="notes-input"
            />
          </div>
        </div>
      )}

      {/* Approval confirmation */}
      {actionMode === "approve" && (
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4" data-testid="approve-confirmation">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Confirmar Aprobacion</p>
              <p className="text-sm text-gray-500">
                {providerName} podra operar en la plataforma
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={resetActionMode}
              disabled={isPending}
              className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              data-testid="btn-cancel-approve"
            >
              Cancelar
            </button>
            <button
              onClick={() => handleSubmit("approved")}
              disabled={isPending}
              className="flex-1 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
              data-testid="btn-confirm-approve"
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Confirmar
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Rejection form */}
      {actionMode === "reject" && (
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4" data-testid="reject-form">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <X className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Rechazar Solicitud</p>
              <p className="text-sm text-gray-500">
                El proveedor sera notificado
              </p>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
              Motivo del Rechazo *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explica el motivo del rechazo..."
              className="w-full h-24 p-3 border-2 border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:border-red-300"
              data-testid="reject-reason-input"
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={resetActionMode}
              disabled={isPending}
              className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              data-testid="btn-cancel-reject"
            >
              Cancelar
            </button>
            <button
              onClick={() => handleSubmit("rejected")}
              disabled={isPending || !reason.trim()}
              className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              data-testid="btn-confirm-reject"
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <X className="w-5 h-5" />
                  Rechazar
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Request more info form */}
      {actionMode === "more_info" && (
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4" data-testid="more-info-form">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Solicitar Mas Informacion</p>
              <p className="text-sm text-gray-500">
                Selecciona los documentos faltantes
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
              Documentos Faltantes *
            </label>
            {DOCUMENT_TYPES.map((doc) => (
              <label
                key={doc.id}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                  missingDocs.includes(doc.id)
                    ? "bg-yellow-50 border-2 border-yellow-300"
                    : "bg-gray-50 border-2 border-transparent hover:bg-gray-100"
                }`}
              >
                <input
                  type="checkbox"
                  checked={missingDocs.includes(doc.id)}
                  onChange={() => handleDocToggle(doc.id)}
                  className="w-4 h-4 text-yellow-500 rounded focus:ring-yellow-400"
                  data-testid={`checkbox-${doc.id}`}
                />
                <span className="text-sm font-medium text-gray-900">{doc.label}</span>
              </label>
            ))}
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
              Mensaje Adicional (Opcional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Instrucciones adicionales para el proveedor..."
              className="w-full h-20 p-3 border-2 border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:border-yellow-300"
              data-testid="more-info-message-input"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={resetActionMode}
              disabled={isPending}
              className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              data-testid="btn-cancel-more-info"
            >
              Cancelar
            </button>
            <button
              onClick={() => handleSubmit("more_info_needed")}
              disabled={isPending || missingDocs.length === 0}
              className="flex-1 py-3 bg-yellow-500 text-white rounded-xl font-semibold hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              data-testid="btn-confirm-more-info"
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <AlertCircle className="w-5 h-5" />
                  Enviar Solicitud
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
