"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProgressIndicator } from "./progress-indicator";
import {
  bankInfoSchema,
  type BankInfoInput,
  type AccountType,
  CHILEAN_BANKS,
  ACCOUNT_TYPES,
} from "@/lib/validations/provider-registration";

export function BankForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<BankInfoInput>({
    resolver: zodResolver(bankInfoSchema),
    defaultValues: {
      bankName: "",
      accountType: "vista", // Default to "Cuenta Vista" per UX mockup
      accountNumber: "",
      rut: "",
    },
  });

  // Watch account type for toggle button styling
  const selectedAccountType = watch("accountType");

  // Load from localStorage on mount - pre-fill RUT from personal info step
  useEffect(() => {
    try {
      const saved = localStorage.getItem("nitoagua_provider_onboarding");
      if (saved) {
        const { data } = JSON.parse(saved);
        // Pre-fill bank data if exists
        if (data.bankName) setValue("bankName", data.bankName);
        if (data.accountType && (data.accountType === "vista" || data.accountType === "corriente")) {
          setValue("accountType", data.accountType as AccountType);
        }
        if (data.accountNumber) setValue("accountNumber", data.accountNumber);
        // Pre-fill RUT from personal info step (AC7.10.7)
        if (data.rut) setValue("rut", data.rut);
      }
    } catch {
      // Ignore errors
    }
  }, [setValue]);

  const onSubmit = async (data: BankInfoInput) => {
    setIsSubmitting(true);

    // Save to localStorage
    try {
      const existing = localStorage.getItem("nitoagua_provider_onboarding");
      const progress = existing ? JSON.parse(existing) : { currentStep: 5, data: {} };
      progress.data = { ...progress.data, ...data };
      progress.currentStep = 6; // Move to review step
      localStorage.setItem("nitoagua_provider_onboarding", JSON.stringify(progress));
    } catch {
      // Ignore errors
    }

    // Navigate to review step
    router.push("/provider/onboarding/review");
  };

  const handleBack = () => {
    // Go back to areas step (Step 4)
    router.push("/provider/onboarding/areas");
  };

  // Handle account type toggle button click
  const handleAccountTypeChange = (type: AccountType) => {
    setValue("accountType", type);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header with gradient - Per UX mockup Section 13.5 */}
      <div
        className="px-5 pt-4 pb-4"
        style={{
          background: "linear-gradient(180deg, rgba(254, 215, 170, 0.5) 0%, white 100%)",
        }}
      >
        {/* Step 5 of 6: Personal -> Documentos -> Vehiculo -> Areas -> Banco -> Revisión */}
        <ProgressIndicator currentStep={5} totalSteps={6} onBack={handleBack} />

        {/* AC7.10.2: "Cuenta bancaria" title */}
        <h1 className="text-2xl font-bold text-gray-900 mt-4">Cuenta bancaria</h1>
        {/* AC7.10.3: Description text */}
        <p className="text-sm text-gray-500 mt-1">
          Ingresa los datos de la cuenta donde recibirás tus ganancias.
        </p>
      </div>

      <div className="flex-1 px-5 py-4 overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* AC7.10.4: Bank Selection (unchanged - dropdown) */}
          <div className="space-y-2">
            <Label htmlFor="bankName" className="text-sm font-medium text-gray-700">
              Banco
            </Label>
            <Select
              value={watch("bankName")}
              onValueChange={(value) => setValue("bankName", value)}
            >
              <SelectTrigger className="h-12 rounded-xl" data-testid="bank-name">
                <SelectValue placeholder="Selecciona tu banco" />
              </SelectTrigger>
              <SelectContent>
                {CHILEAN_BANKS.map((bank) => (
                  <SelectItem key={bank.value} value={bank.value}>
                    {bank.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.bankName && (
              <p className="text-sm text-red-500">{errors.bankName.message}</p>
            )}
          </div>

          {/* AC7.10.5: Account Type as Toggle Buttons (smaller, compact) */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Tipo de cuenta
            </Label>
            <div className="flex gap-2" data-testid="account-type-toggle">
              {ACCOUNT_TYPES.map((type) => {
                const isSelected = selectedAccountType === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleAccountTypeChange(type.value as AccountType)}
                    data-testid={`account-type-${type.value}`}
                    className={`
                      py-2 px-3 rounded-lg text-xs font-medium transition-all
                      ${isSelected
                        ? "bg-orange-50 border-2 border-orange-500 text-orange-500"
                        : "bg-white border border-gray-200 text-gray-700 hover:border-gray-300"
                      }
                    `}
                  >
                    {type.label}
                  </button>
                );
              })}
            </div>
            {errors.accountType && (
              <p className="text-sm text-red-500">{errors.accountType.message}</p>
            )}
          </div>

          {/* AC7.10.6: Account Number (unchanged) */}
          <div className="space-y-2">
            <Label htmlFor="accountNumber" className="text-sm font-medium text-gray-700">
              Número de cuenta
            </Label>
            <Input
              id="accountNumber"
              {...register("accountNumber")}
              placeholder="12345678"
              className="h-12 rounded-xl"
              data-testid="account-number"
            />
            {errors.accountNumber && (
              <p className="text-sm text-red-500">
                {errors.accountNumber.message}
              </p>
            )}
          </div>

          {/* AC7.10.7 & AC7.10.8: RUT field pre-filled from personal info step (Task 2) */}
          <div className="space-y-2">
            <Label htmlFor="rut" className="text-sm font-medium text-gray-700">
              RUT del titular
            </Label>
            <Input
              id="rut"
              {...register("rut")}
              placeholder="12.345.678-9"
              className="h-12 rounded-xl bg-gray-50 text-gray-500"
              data-testid="rut-input"
              disabled
            />
            {errors.rut && (
              <p className="text-sm text-red-500">{errors.rut.message}</p>
            )}
            {/* AC7.10.8: Hint text */}
            <p className="text-xs text-gray-500">
              La cuenta debe estar a tu nombre
            </p>
          </div>

          {/* Info Box - Payment visibility warning (direct consumer-to-provider payments) */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-amber-700 mb-1">
                  Información visible al consumidor
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Esta cuenta será mostrada al consumidor para realizar los pagos. Asegúrate de confirmar con él que tiene los datos correctos al momento de procesar la entrega.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Bottom Button - AC7.10.10: "Completar registro" (Task 4) */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 p-5">
        <Button
          type="button"
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-base"
          data-testid="submit-button"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            "Completar registro"
          )}
        </Button>
      </div>
    </div>
  );
}
