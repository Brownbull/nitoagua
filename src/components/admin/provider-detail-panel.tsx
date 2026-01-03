"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Package,
  DollarSign,
  AlertTriangle,
  Ban,
  RotateCcw,
  Percent,
  FileText,
  Loader2,
} from "lucide-react";
import type { ProviderDirectoryEntry } from "@/app/admin/providers/page";
import {
  suspendProvider,
  unsuspendProvider,
  banProvider,
  updateCommissionOverride,
} from "@/lib/actions/provider-management";
import { toast } from "sonner";

interface ProviderDetailPanelProps {
  provider: ProviderDirectoryEntry;
  onClose: () => void;
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(amount);
}

function getStatusInfo(status: string | null) {
  switch (status) {
    case "approved":
      return { label: "Aprobado", color: "text-green-700", bg: "bg-green-50" };
    case "suspended":
      return { label: "Suspendido", color: "text-orange-700", bg: "bg-orange-50" };
    case "banned":
      return { label: "Baneado", color: "text-red-700", bg: "bg-red-50" };
    case "pending":
      return { label: "Pendiente", color: "text-amber-700", bg: "bg-amber-50" };
    case "rejected":
      return { label: "Rechazado", color: "text-gray-700", bg: "bg-gray-100" };
    default:
      return { label: "Desconocido", color: "text-gray-700", bg: "bg-gray-100" };
  }
}

export function ProviderDetailPanel({
  provider,
  onClose,
}: ProviderDetailPanelProps) {
  const router = useRouter();
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showCommissionDialog, setShowCommissionDialog] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [commissionRate, setCommissionRate] = useState<string>(
    provider.commission_override?.toString() || ""
  );
  const [isLoading, setIsLoading] = useState(false);

  const statusInfo = getStatusInfo(provider.verification_status);

  const handleSuspend = async () => {
    if (!suspendReason.trim()) {
      toast.error("Debes proporcionar un motivo");
      return;
    }

    setIsLoading(true);
    try {
      const result = await suspendProvider(provider.id, suspendReason);
      if (result.success) {
        toast.success("Proveedor suspendido");
        setShowSuspendDialog(false);
        setSuspendReason("");
        router.refresh();
        onClose();
      } else {
        toast.error(result.error || "Error al suspender proveedor");
      }
    } catch {
      toast.error("Error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsuspend = async () => {
    setIsLoading(true);
    try {
      const result = await unsuspendProvider(provider.id);
      if (result.success) {
        toast.success("Proveedor reactivado");
        router.refresh();
        onClose();
      } else {
        toast.error(result.error || "Error al reactivar proveedor");
      }
    } catch {
      toast.error("Error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBan = async () => {
    setIsLoading(true);
    try {
      const result = await banProvider(provider.id);
      if (result.success) {
        toast.success("Proveedor baneado permanentemente");
        setShowBanDialog(false);
        router.refresh();
        onClose();
      } else {
        toast.error(result.error || "Error al banear proveedor");
      }
    } catch {
      toast.error("Error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCommission = async () => {
    setIsLoading(true);
    try {
      const rate = commissionRate.trim() ? parseFloat(commissionRate) : null;

      if (rate !== null && (isNaN(rate) || rate < 0 || rate > 100)) {
        toast.error("La tasa debe ser entre 0 y 100");
        setIsLoading(false);
        return;
      }

      const result = await updateCommissionOverride(provider.id, rate);
      if (result.success) {
        toast.success(
          rate !== null
            ? `Comision actualizada a ${rate}%`
            : "Comision restaurada a valor predeterminado"
        );
        setShowCommissionDialog(false);
        router.refresh();
        onClose();
      } else {
        toast.error(result.error || "Error al actualizar comision");
      }
    } catch {
      toast.error("Error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  const canSuspend =
    provider.verification_status === "approved" ||
    provider.verification_status === "pending";
  const canUnsuspend = provider.verification_status === "suspended";
  const canBan = provider.verification_status !== "banned";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
        data-testid="panel-backdrop"
      />

      {/* Panel - z-60 to be above bottom nav (z-50) */}
      <div
        className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl z-60 flex flex-col"
        data-testid="provider-detail-panel"
      >
        {/* Header */}
        <div className="shrink-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Detalles del Proveedor</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            data-testid="close-panel"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Profile Header */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900">{provider.name}</h3>
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${statusInfo.bg} ${statusInfo.color}`}
              >
                {statusInfo.label}
              </span>
            </div>
          </div>

          {/* Contact Info */}
          <section className="bg-gray-50 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Informacion de Contacto
            </h4>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-900">{provider.phone}</span>
              </div>
              {provider.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900">{provider.email}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-900">
                  {provider.service_area || "Sin area de servicio"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-900">
                  Registrado {formatDate(provider.created_at)}
                </span>
              </div>
            </div>
          </section>

          {/* Statistics */}
          <section className="bg-gray-50 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Estadisticas
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Package className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500">Entregas</span>
                </div>
                <p className="text-xl font-bold text-gray-900">
                  {provider.deliveries_count}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500">Comision Adeudada</span>
                </div>
                <p className="text-xl font-bold text-gray-900">
                  {provider.commission_owed > 0
                    ? formatCurrency(provider.commission_owed)
                    : "$0"}
                </p>
              </div>
            </div>
          </section>

          {/* Commission Override */}
          <section className="bg-gray-50 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Tasa de Comision
            </h4>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-900">
                  {provider.commission_override !== null
                    ? `${provider.commission_override}% (personalizado)`
                    : "10% (predeterminado)"}
                </span>
              </div>
              <button
                onClick={() => setShowCommissionDialog(true)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                data-testid="edit-commission-btn"
              >
                Editar
              </button>
            </div>
          </section>

          {/* Documents Link */}
          <section className="bg-gray-50 rounded-xl p-4">
            <a
              href={`/admin/verification/${provider.id}`}
              className="flex items-center gap-3 text-sm text-blue-600 hover:text-blue-700"
            >
              <FileText className="w-4 h-4" />
              Ver documentos y perfil completo
            </a>
          </section>
        </div>

        {/* Sticky Action Buttons - Always visible at bottom, with padding for mobile bottom nav */}
        <div className="shrink-0 bg-white border-t border-gray-100 p-4 pb-20 lg:pb-4 space-y-3 safe-area-bottom">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Acciones
          </h4>

          {canUnsuspend && (
            <button
              onClick={handleUnsuspend}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
              data-testid="unsuspend-btn"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RotateCcw className="w-4 h-4" />
              )}
              Reactivar Proveedor
            </button>
          )}

          {canSuspend && (
            <button
              onClick={() => setShowSuspendDialog(true)}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 transition-colors"
              data-testid="suspend-btn"
            >
              <AlertTriangle className="w-4 h-4" />
              Suspender Proveedor
            </button>
          )}

          {canBan && (
            <button
              onClick={() => setShowBanDialog(true)}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
              data-testid="ban-btn"
            >
              <Ban className="w-4 h-4" />
              Banear Proveedor
            </button>
          )}
        </div>
      </div>

      {/* Suspend Dialog */}
      {showSuspendDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div
            className="bg-white rounded-xl max-w-sm w-full p-5 space-y-4"
            data-testid="suspend-dialog"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Suspender Proveedor
              </h3>
            </div>
            <p className="text-sm text-gray-600">
              El proveedor no podra recibir nuevos pedidos mientras este
              suspendido. Puedes reactivarlo en cualquier momento.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Motivo de la suspension *
              </label>
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="Describe el motivo..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
                rows={3}
                data-testid="suspend-reason-input"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSuspendDialog(false);
                  setSuspendReason("");
                }}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSuspend}
                disabled={isLoading || !suspendReason.trim()}
                className="flex-1 px-4 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"
                data-testid="confirm-suspend-btn"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Suspender
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ban Dialog */}
      {showBanDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div
            className="bg-white rounded-xl max-w-sm w-full p-5 space-y-4"
            data-testid="ban-dialog"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Ban className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Banear Proveedor</h3>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-lg p-3">
              <p className="text-sm text-red-800 font-medium">
                ⚠️ Esta accion es permanente
              </p>
              <p className="text-xs text-red-600 mt-1">
                El proveedor sera baneado permanentemente y no podra volver a usar
                la plataforma.
              </p>
            </div>
            <p className="text-sm text-gray-600">
              ¿Estas seguro de que deseas banear a <strong>{provider.name}</strong>
              ?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBanDialog(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleBan}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                data-testid="confirm-ban-btn"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Banear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Commission Dialog */}
      {showCommissionDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div
            className="bg-white rounded-xl max-w-sm w-full p-5 space-y-4"
            data-testid="commission-dialog"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Percent className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Tasa de Comision
              </h3>
            </div>
            <p className="text-sm text-gray-600">
              Establece una tasa de comision personalizada para este proveedor.
              Deja vacio para usar el valor predeterminado (10%).
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tasa de comision (%)
              </label>
              <input
                type="number"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                placeholder="10"
                min="0"
                max="100"
                step="0.5"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                data-testid="commission-rate-input"
              />
              <p className="text-xs text-gray-500 mt-1">
                Actual:{" "}
                {provider.commission_override !== null
                  ? `${provider.commission_override}% (personalizado)`
                  : "10% (predeterminado)"}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCommissionDialog(false);
                  setCommissionRate(provider.commission_override?.toString() || "");
                }}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateCommission}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                data-testid="confirm-commission-btn"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
