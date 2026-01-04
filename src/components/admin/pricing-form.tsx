"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Droplet, Percent, DollarSign, Info, Save, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import {
  pricingSettingsSchema,
  type PricingSettingsInput,
  AMOUNT_TIERS,
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

// Format liter amount for display
function formatAmount(liters: number): string {
  if (liters >= 1000) {
    return `${(liters / 1000).toFixed(0)}K L`;
  }
  return `${liters} L`;
}

// Price tier card component for each amount
interface PriceTierCardProps {
  amount: number;
  tierKey: "price_100l" | "price_1000l" | "price_5000l" | "price_10000l";
  register: ReturnType<typeof useForm<PricingSettingsInput>>["register"];
  errors: ReturnType<typeof useForm<PricingSettingsInput>>["formState"]["errors"];
  watch: ReturnType<typeof useForm<PricingSettingsInput>>["watch"];
  isExpanded: boolean;
  onToggle: () => void;
}

function PriceTierCard({
  amount,
  tierKey,
  register,
  errors,
  watch,
  isExpanded,
  onToggle,
}: PriceTierCardProps) {
  const tierValues = watch(tierKey);
  const tierErrors = errors[tierKey];

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
      {/* Header - always visible */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Droplet className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-gray-900">{formatAmount(amount)}</p>
            <p className="text-xs text-gray-500">
              {formatCLP(tierValues?.suggested || 0)} sugerido
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">
            {formatCLP(tierValues?.min || 0)} - {formatCLP(tierValues?.max || 0)}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expandable content */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 space-y-3 border-t border-gray-200">
          {/* Min Price */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Precio Mínimo
            </label>
            <div className="flex items-center gap-1 px-3 py-2 bg-white border-2 border-gray-200 rounded-lg focus-within:border-blue-500">
              <span className="text-sm text-gray-500">$</span>
              <input
                type="number"
                {...register(`${tierKey}.min`, { valueAsNumber: true })}
                className="flex-1 min-w-0 bg-transparent text-sm font-semibold text-gray-900 outline-none"
                data-testid={`input-${tierKey}-min`}
              />
            </div>
            {tierErrors?.min && (
              <p className="text-xs text-red-500 mt-1">{tierErrors.min.message}</p>
            )}
          </div>

          {/* Suggested Price */}
          <div>
            <label className="block text-xs font-medium text-blue-600 mb-1">
              Precio Sugerido (por defecto)
            </label>
            <div className="flex items-center gap-1 px-3 py-2 bg-blue-50 border-2 border-blue-200 rounded-lg focus-within:border-blue-500">
              <span className="text-sm text-blue-600">$</span>
              <input
                type="number"
                {...register(`${tierKey}.suggested`, { valueAsNumber: true })}
                className="flex-1 min-w-0 bg-transparent text-sm font-semibold text-blue-700 outline-none"
                data-testid={`input-${tierKey}-suggested`}
              />
            </div>
            {tierErrors?.suggested && (
              <p className="text-xs text-red-500 mt-1">{tierErrors.suggested.message}</p>
            )}
          </div>

          {/* Max Price */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Precio Máximo
            </label>
            <div className="flex items-center gap-1 px-3 py-2 bg-white border-2 border-gray-200 rounded-lg focus-within:border-blue-500">
              <span className="text-sm text-gray-500">$</span>
              <input
                type="number"
                {...register(`${tierKey}.max`, { valueAsNumber: true })}
                className="flex-1 min-w-0 bg-transparent text-sm font-semibold text-gray-900 outline-none"
                data-testid={`input-${tierKey}-max`}
              />
            </div>
            {tierErrors?.max && (
              <p className="text-xs text-red-500 mt-1">{tierErrors.max.message}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function PricingForm({ initialSettings }: PricingFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingData, setPendingData] = useState<PricingSettingsInput | null>(null);
  const [expandedTier, setExpandedTier] = useState<string | null>(null);

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

  // Calculate commission preview using suggested price
  const exampleAmount = price1000l?.suggested || 20000;
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

  const toggleTier = (tier: string) => {
    setExpandedTier(expandedTier === tier ? null : tier);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              <p className="text-xs text-gray-400">
                Toca para expandir y editar rangos
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <PriceTierCard
              amount={100}
              tierKey="price_100l"
              register={register}
              errors={errors}
              watch={watch}
              isExpanded={expandedTier === "100l"}
              onToggle={() => toggleTier("100l")}
            />
            <PriceTierCard
              amount={1000}
              tierKey="price_1000l"
              register={register}
              errors={errors}
              watch={watch}
              isExpanded={expandedTier === "1000l"}
              onToggle={() => toggleTier("1000l")}
            />
            <PriceTierCard
              amount={5000}
              tierKey="price_5000l"
              register={register}
              errors={errors}
              watch={watch}
              isExpanded={expandedTier === "5000l"}
              onToggle={() => toggleTier("5000l")}
            />
            <PriceTierCard
              amount={10000}
              tierKey="price_10000l"
              register={register}
              errors={errors}
              watch={watch}
              isExpanded={expandedTier === "10000l"}
              onToggle={() => toggleTier("10000l")}
            />
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
