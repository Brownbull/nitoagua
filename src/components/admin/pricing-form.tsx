"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Droplet, Percent, DollarSign, Info, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  pricingSettingsSchema,
  type PricingSettingsInput,
} from "@/lib/validations/admin";
import { updatePricingSettings } from "@/lib/actions/admin";
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

interface PricingFormProps {
  initialSettings: PricingSettingsInput;
}

// Format number as CLP currency
function formatCLP(value: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function PricingForm({ initialSettings }: PricingFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingData, setPendingData] = useState<PricingSettingsInput | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
    reset,
  } = useForm<PricingSettingsInput>({
    resolver: zodResolver(pricingSettingsSchema),
    defaultValues: initialSettings,
  });

  // Watch commission percent for preview calculation
  const commissionPercent = watch("default_commission_percent");
  const price1000l = watch("price_1000l");

  // Calculate commission preview
  const exampleAmount = price1000l || 20000;
  const commissionAmount = Math.round(exampleAmount * (commissionPercent || 15) / 100);

  const onSubmit = (data: PricingSettingsInput) => {
    setPendingData(data);
    setShowConfirmDialog(true);
  };

  const handleConfirm = async () => {
    if (!pendingData) return;

    setShowConfirmDialog(false);
    setIsSaving(true);

    try {
      const result = await updatePricingSettings(pendingData);

      if (result.success) {
        toast.success("Precios actualizados", {
          description: "Los cambios se aplicaran a las nuevas solicitudes.",
        });
        reset(pendingData);
      } else {
        toast.error("Error al guardar", {
          description: result.error || "No se pudieron guardar los cambios.",
        });
      }
    } catch {
      toast.error("Error inesperado", {
        description: "Por favor, intenta de nuevo.",
      });
    } finally {
      setIsSaving(false);
      setPendingData(null);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Water Pricing Section */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Droplet className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">
                Precios por Cantidad
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {/* 100L */}
            <div className="flex items-center gap-3">
              <div className="w-16 text-center">
                <p className="text-sm font-bold text-gray-900">100L</p>
              </div>
              <div className="flex-1 flex items-center gap-1 px-3 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus-within:border-blue-500">
                <span className="text-sm text-gray-500">$</span>
                <input
                  type="number"
                  {...register("price_100l", { valueAsNumber: true })}
                  className="flex-1 bg-transparent text-sm font-semibold text-gray-900 outline-none"
                  data-testid="input-price-100l"
                />
                <span className="text-xs text-gray-400">CLP</span>
              </div>
            </div>
            {errors.price_100l && (
              <p className="text-xs text-red-500 ml-19">{errors.price_100l.message}</p>
            )}

            {/* 1000L */}
            <div className="flex items-center gap-3">
              <div className="w-16 text-center">
                <p className="text-sm font-bold text-gray-900">1,000L</p>
              </div>
              <div className="flex-1 flex items-center gap-1 px-3 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus-within:border-blue-500">
                <span className="text-sm text-gray-500">$</span>
                <input
                  type="number"
                  {...register("price_1000l", { valueAsNumber: true })}
                  className="flex-1 bg-transparent text-sm font-semibold text-gray-900 outline-none"
                  data-testid="input-price-1000l"
                />
                <span className="text-xs text-gray-400">CLP</span>
              </div>
            </div>
            {errors.price_1000l && (
              <p className="text-xs text-red-500 ml-19">{errors.price_1000l.message}</p>
            )}

            {/* 5000L */}
            <div className="flex items-center gap-3">
              <div className="w-16 text-center">
                <p className="text-sm font-bold text-gray-900">5,000L</p>
              </div>
              <div className="flex-1 flex items-center gap-1 px-3 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus-within:border-blue-500">
                <span className="text-sm text-gray-500">$</span>
                <input
                  type="number"
                  {...register("price_5000l", { valueAsNumber: true })}
                  className="flex-1 bg-transparent text-sm font-semibold text-gray-900 outline-none"
                  data-testid="input-price-5000l"
                />
                <span className="text-xs text-gray-400">CLP</span>
              </div>
            </div>
            {errors.price_5000l && (
              <p className="text-xs text-red-500 ml-19">{errors.price_5000l.message}</p>
            )}

            {/* 10000L */}
            <div className="flex items-center gap-3">
              <div className="w-16 text-center">
                <p className="text-sm font-bold text-gray-900">10,000L</p>
              </div>
              <div className="flex-1 flex items-center gap-1 px-3 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus-within:border-blue-500">
                <span className="text-sm text-gray-500">$</span>
                <input
                  type="number"
                  {...register("price_10000l", { valueAsNumber: true })}
                  className="flex-1 bg-transparent text-sm font-semibold text-gray-900 outline-none"
                  data-testid="input-price-10000l"
                />
                <span className="text-xs text-gray-400">CLP</span>
              </div>
            </div>
            {errors.price_10000l && (
              <p className="text-xs text-red-500 ml-19">{errors.price_10000l.message}</p>
            )}
          </div>
        </div>

        {/* Urgency Surcharge Section */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <Percent className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">
                Recargo Urgencia
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-1 px-3 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus-within:border-blue-500">
              <input
                type="number"
                {...register("urgency_surcharge_percent", { valueAsNumber: true })}
                className="flex-1 bg-transparent text-sm font-semibold text-gray-900 outline-none text-center"
                data-testid="input-urgency-surcharge"
              />
              <span className="text-sm text-gray-500">%</span>
            </div>
          </div>
          {errors.urgency_surcharge_percent && (
            <p className="text-xs text-red-500 mt-1">{errors.urgency_surcharge_percent.message}</p>
          )}
          <p className="text-xs text-gray-500 mt-2">
            Porcentaje adicional para pedidos urgentes
          </p>
        </div>

        {/* Commission Section */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">
                Comision Plataforma
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-1 px-3 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus-within:border-blue-500">
              <input
                type="number"
                {...register("default_commission_percent", { valueAsNumber: true })}
                className="flex-1 bg-transparent text-sm font-semibold text-gray-900 outline-none text-center"
                data-testid="input-commission"
              />
              <span className="text-sm text-gray-500">%</span>
            </div>
          </div>
          {errors.default_commission_percent && (
            <p className="text-xs text-red-500 mt-1">{errors.default_commission_percent.message}</p>
          )}

          {/* Commission Preview */}
          <div className="flex items-center gap-2 mt-3 p-3 bg-gray-50 rounded-lg">
            <Info className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <p className="text-xs text-gray-500" data-testid="commission-preview">
              En un pedido de {formatCLP(exampleAmount)}, la plataforma gana{" "}
              <span className="font-semibold text-gray-700">{formatCLP(commissionAmount)}</span>
            </p>
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={isSaving || !isDirty}
          className="w-full py-4 bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid="save-pricing-button"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Guardar Cambios
            </>
          )}
        </button>
      </form>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar cambios de precios</AlertDialogTitle>
            <AlertDialogDescription>
              Los nuevos precios se aplicaran inmediatamente a todas las nuevas
              solicitudes. Las solicitudes existentes mantendran sus precios originales.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              Confirmar Cambios
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
