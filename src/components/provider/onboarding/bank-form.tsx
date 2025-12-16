"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  CreditCard,
  Hash,
  ArrowRight,
  ArrowLeft,
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
  CHILEAN_BANKS,
  ACCOUNT_TYPES,
  formatRut,
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
      accountType: undefined,
      accountNumber: "",
      rut: "",
    },
  });

  // Watch RUT to format it
  const rutValue = watch("rut");

  // Format RUT as user types
  useEffect(() => {
    if (rutValue) {
      const formatted = formatRut(rutValue);
      if (formatted !== rutValue) {
        setValue("rut", formatted);
      }
    }
  }, [rutValue, setValue]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("nitoagua_provider_onboarding");
      if (saved) {
        const { data } = JSON.parse(saved);
        if (data.bankName) setValue("bankName", data.bankName);
        if (data.accountType) setValue("accountType", data.accountType as "corriente" | "vista" | "ahorro");
        if (data.accountNumber) setValue("accountNumber", data.accountNumber);
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
      progress.currentStep = 6;
      localStorage.setItem("nitoagua_provider_onboarding", JSON.stringify(progress));
    } catch {
      // Ignore errors
    }

    // Navigate to review step
    router.push("/provider/onboarding/review");
  };

  const handleBack = () => {
    router.push("/provider/onboarding/documents");
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      <ProgressIndicator currentStep={5} totalSteps={6} />

      <div className="flex-1 px-4 py-6">
        <div className="max-w-md mx-auto">
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Información Bancaria
          </h1>
          <p className="text-gray-600 text-sm mb-6">
            Estos datos se usarán para transferirte tus ganancias
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Bank Name */}
            <div className="space-y-2">
              <Label htmlFor="bankName" className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-gray-500" />
                Banco
              </Label>
              <Select
                value={watch("bankName")}
                onValueChange={(value) => setValue("bankName", value)}
              >
                <SelectTrigger className="h-12" data-testid="bank-name">
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

            {/* Account Type */}
            <div className="space-y-2">
              <Label htmlFor="accountType" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-gray-500" />
                Tipo de cuenta
              </Label>
              <Select
                value={watch("accountType")}
                onValueChange={(value) => setValue("accountType", value as "corriente" | "vista" | "ahorro")}
              >
                <SelectTrigger className="h-12" data-testid="account-type">
                  <SelectValue placeholder="Selecciona tipo de cuenta" />
                </SelectTrigger>
                <SelectContent>
                  {ACCOUNT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.accountType && (
                <p className="text-sm text-red-500">{errors.accountType.message}</p>
              )}
            </div>

            {/* Account Number */}
            <div className="space-y-2">
              <Label htmlFor="accountNumber" className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-gray-500" />
                Número de cuenta
              </Label>
              <Input
                id="accountNumber"
                {...register("accountNumber")}
                placeholder="123456789"
                className="h-12"
                data-testid="account-number"
              />
              {errors.accountNumber && (
                <p className="text-sm text-red-500">
                  {errors.accountNumber.message}
                </p>
              )}
            </div>

            {/* RUT */}
            <div className="space-y-2">
              <Label htmlFor="rut" className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-gray-500" />
                RUT
              </Label>
              <Input
                id="rut"
                {...register("rut")}
                placeholder="12.345.678-9"
                className="h-12"
                data-testid="rut-input"
              />
              {errors.rut && (
                <p className="text-sm text-red-500">{errors.rut.message}</p>
              )}
              <p className="text-xs text-gray-500">
                Formato: 12.345.678-9
              </p>
            </div>

            {/* Security Note */}
            <div className="bg-orange-50 border border-orange-100 rounded-lg p-3">
              <p className="text-xs text-orange-700">
                Tu información bancaria está protegida y solo se usará para
                transferir tus ganancias por entregas completadas.
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4">
        <div className="max-w-md mx-auto flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            className="flex-1 h-12 rounded-xl"
            data-testid="back-button"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Atrás
          </Button>
          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="flex-1 h-12 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl"
            data-testid="next-button"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                Siguiente
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
