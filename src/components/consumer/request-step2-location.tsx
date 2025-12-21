"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Info, Crosshair, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";

const step2Schema = z.object({
  address: z
    .string()
    .min(5, "La dirección es requerida")
    .max(200, "La dirección es demasiado larga"),
  specialInstructions: z
    .string()
    .min(1, "Las instrucciones son requeridas")
    .max(500, "Las instrucciones son demasiado largas"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export type Step2Data = z.infer<typeof step2Schema>;

interface Step2Props {
  initialData?: Partial<Step2Data>;
  onNext: (data: Step2Data) => void;
  onBack: () => void;
}

function InputWrapper({
  label,
  children,
  hint,
  error,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  error?: string;
}) {
  return (
    <div className="mb-4">
      <div
        className={cn(
          "bg-white rounded-[14px] px-4 py-3 border-2 transition-all",
          "focus-within:border-[#0077B6] focus-within:shadow-[0_0_0_3px_#CAF0F8]",
          error ? "border-red-300" : "border-gray-200"
        )}
      >
        <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
          {label}
        </label>
        {children}
      </div>
      {hint && (
        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-500">
          <Info className="w-3.5 h-3.5" />
          {hint}
        </div>
      )}
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
    </div>
  );
}

export function RequestStep2Location({ initialData, onNext, onBack }: Step2Props) {
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationCaptured, setLocationCaptured] = useState(
    !!(initialData?.latitude && initialData?.longitude)
  );

  const form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    mode: "onSubmit",
    defaultValues: {
      address: initialData?.address ?? "",
      specialInstructions: initialData?.specialInstructions ?? "",
      latitude: initialData?.latitude,
      longitude: initialData?.longitude,
    },
  });

  const handleGetLocation = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocalización no disponible", {
        description: "Tu navegador no soporta geolocalización",
      });
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        form.setValue("latitude", position.coords.latitude);
        form.setValue("longitude", position.coords.longitude);
        setLocationCaptured(true);
        setIsGettingLocation(false);
        toast.success("Ubicación capturada", {
          description: "Tu ubicación ha sido guardada",
        });
      },
      (error) => {
        setIsGettingLocation(false);
        let message = "No se pudo obtener la ubicación";
        if (error.code === error.PERMISSION_DENIED) {
          message = "Permiso de ubicación denegado";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = "Ubicación no disponible";
        } else if (error.code === error.TIMEOUT) {
          message = "Tiempo de espera agotado";
        }
        toast.error(message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleSubmit = (data: Step2Data) => {
    onNext(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-0">
        {/* Address Field */}
        <FormField
          control={form.control}
          name="address"
          render={({ field, fieldState }) => (
            <FormItem>
              <InputWrapper label="Dirección" error={fieldState.error?.message}>
                <FormControl>
                  <input
                    {...field}
                    placeholder="Calle y número, comuna"
                    className="w-full border-none text-base font-medium text-gray-900 bg-transparent outline-none placeholder:text-gray-400"
                    data-testid="address-input"
                  />
                </FormControl>
              </InputWrapper>
            </FormItem>
          )}
        />

        {/* Geolocation Button */}
        <div className="mb-4">
          <button
            type="button"
            onClick={handleGetLocation}
            disabled={isGettingLocation}
            className={cn(
              "w-full flex items-center gap-3 bg-white rounded-[14px] p-4 border-2 transition-all",
              locationCaptured
                ? "border-green-400 bg-green-50"
                : "border-gray-200 hover:border-[#0077B6]"
            )}
            data-testid="geolocation-button"
          >
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                locationCaptured ? "bg-green-100" : "bg-[#CAF0F8]"
              )}
            >
              {isGettingLocation ? (
                <Loader2 className="w-5 h-5 animate-spin text-[#0077B6]" />
              ) : (
                <Crosshair
                  className={cn(
                    "w-5 h-5",
                    locationCaptured ? "text-green-600" : "text-[#0077B6]"
                  )}
                />
              )}
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-900">
                {locationCaptured ? "✓ Ubicación capturada" : "📍 Usar mi ubicación"}
              </p>
              <p className="text-xs text-gray-500">
                {locationCaptured
                  ? "Tu ubicación ha sido guardada"
                  : "Toca para que te encontremos"}
              </p>
            </div>
          </button>
        </div>

        {/* Special Instructions Field */}
        <FormField
          control={form.control}
          name="specialInstructions"
          render={({ field, fieldState }) => (
            <FormItem>
              <InputWrapper
                label="¿Cómo es tu casa?"
                hint="Ayuda al repartidor a encontrarte"
                error={fieldState.error?.message}
              >
                <FormControl>
                  <textarea
                    {...field}
                    placeholder="Ej: Casa azul con portón verde"
                    className="w-full border-none text-base font-medium text-gray-900 bg-transparent outline-none placeholder:text-gray-400 resize-none min-h-[70px]"
                    data-testid="instructions-input"
                  />
                </FormControl>
              </InputWrapper>
            </FormItem>
          )}
        />

        {/* Buttons */}
        <div className="pt-4 space-y-3">
          <Button
            type="submit"
            className="w-full py-4 bg-[#0077B6] hover:bg-[#005f8f] text-white rounded-xl text-base font-semibold shadow-[0_4px_14px_rgba(0,119,182,0.3)]"
            data-testid="next-button"
          >
            Siguiente →
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="w-full py-4 rounded-xl text-base font-semibold border-gray-200"
            data-testid="back-button"
          >
            ← Anterior
          </Button>
        </div>
      </form>
    </Form>
  );
}
