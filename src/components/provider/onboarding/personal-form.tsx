"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Phone, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProgressIndicator } from "./progress-indicator";
import {
  personalInfoSchema,
  type PersonalInfoInput,
  formatPhone,
} from "@/lib/validations/provider-registration";

interface PersonalFormProps {
  initialData?: {
    name?: string;
    phone?: string;
  };
  userEmail?: string;
  userName?: string;
}

export function PersonalForm({
  initialData,
  userName,
}: PersonalFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PersonalInfoInput>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      name: initialData?.name || userName || "",
      phone: initialData?.phone || "+56",
    },
  });

  // Watch phone to format it
  const phoneValue = watch("phone");

  // Format phone as user types
  useEffect(() => {
    const formatted = formatPhone(phoneValue);
    if (formatted !== phoneValue && formatted.length <= 12) {
      setValue("phone", formatted);
    }
  }, [phoneValue, setValue]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("nitoagua_provider_onboarding");
      if (saved) {
        const { data } = JSON.parse(saved);
        if (data.name) setValue("name", data.name);
        if (data.phone) setValue("phone", data.phone);
      }
    } catch {
      // Ignore errors
    }
  }, [setValue]);

  const onSubmit = async (data: PersonalInfoInput) => {
    setIsSubmitting(true);

    // Save to localStorage
    try {
      const existing = localStorage.getItem("nitoagua_provider_onboarding");
      const progress = existing ? JSON.parse(existing) : { currentStep: 2, data: {} };
      progress.data = { ...progress.data, ...data };
      progress.currentStep = 3;
      localStorage.setItem("nitoagua_provider_onboarding", JSON.stringify(progress));
    } catch {
      // Ignore errors
    }

    // Navigate to next step
    router.push("/provider/onboarding/areas");
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      <ProgressIndicator currentStep={2} totalSteps={6} />

      <div className="flex-1 px-4 py-6">
        <div className="max-w-md mx-auto">
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Información Personal
          </h1>
          <p className="text-gray-600 text-sm mb-6">
            Estos datos se mostrarán a los clientes cuando aceptes sus
            solicitudes
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                Nombre completo
              </Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Juan Pérez"
                className="h-12"
                data-testid="name-input"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                Teléfono
              </Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="+56912345678"
                className="h-12"
                data-testid="phone-input"
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
              <p className="text-xs text-gray-500">
                Formato: +56912345678 (9 dígitos después del +56)
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl"
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
          </form>
        </div>
      </div>
    </div>
  );
}
