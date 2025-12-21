"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin, Loader2, Info, Crosshair } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { AmountSelector } from "@/components/consumer/amount-selector";
import { requestSchema, type RequestInput } from "@/lib/validations/request";
import { cn } from "@/lib/utils";

interface RequestFormProps {
  onSubmit: (data: RequestInput) => Promise<void>;
  initialData?: Partial<RequestInput>;
  loading?: boolean;
}

/**
 * Mockup-styled input wrapper component
 */
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

/**
 * RequestForm - Guest water request form component
 * Implements mockup-aligned styling with validation
 */
export function RequestForm({
  onSubmit,
  initialData,
  loading = false,
}: RequestFormProps) {
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationCaptured, setLocationCaptured] = useState(false);

  const form = useForm<RequestInput>({
    resolver: zodResolver(requestSchema),
    mode: "onSubmit",
    defaultValues: {
      name: initialData?.name ?? "",
      phone: initialData?.phone ?? "",
      email: initialData?.email ?? "",
      address: initialData?.address ?? "",
      specialInstructions: initialData?.specialInstructions ?? "",
      amount: initialData?.amount,
      isUrgent: initialData?.isUrgent ?? false,
      latitude: initialData?.latitude,
      longitude: initialData?.longitude,
    },
  });

  const handleSubmit = async (data: RequestInput) => {
    try {
      await onSubmit(data);
    } catch {
      toast.error("Error al enviar la solicitud", {
        description: "Por favor intenta de nuevo",
      });
    }
  };

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

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-0"
        data-testid="request-form"
      >
        {/* Name Field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <FormItem>
              <InputWrapper label="Tu Nombre" error={fieldState.error?.message}>
                <FormControl>
                  <input
                    {...field}
                    placeholder="Ej: María González"
                    className="w-full border-none text-base font-medium text-gray-900 bg-transparent outline-none placeholder:text-gray-400"
                    data-testid="name-input"
                  />
                </FormControl>
              </InputWrapper>
            </FormItem>
          )}
        />

        {/* Phone Field */}
        <FormField
          control={form.control}
          name="phone"
          render={({ field, fieldState }) => (
            <FormItem>
              <InputWrapper
                label="Tu Teléfono"
                hint="Te llamamos para confirmar tu pedido"
                error={fieldState.error?.message}
              >
                <FormControl>
                  <input
                    {...field}
                    type="tel"
                    placeholder="9 1234 5678"
                    className="w-full border-none text-base font-medium text-gray-900 bg-transparent outline-none placeholder:text-gray-400"
                    data-testid="phone-input"
                  />
                </FormControl>
              </InputWrapper>
            </FormItem>
          )}
        />

        {/* Email Field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <FormItem>
              <InputWrapper
                label="Tu Email (opcional)"
                error={fieldState.error?.message}
              >
                <FormControl>
                  <input
                    {...field}
                    type="text"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="correo@ejemplo.com"
                    className="w-full border-none text-base font-medium text-gray-900 bg-transparent outline-none placeholder:text-gray-400"
                    data-testid="email-input"
                  />
                </FormControl>
              </InputWrapper>
            </FormItem>
          )}
        />

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

        {/* Geolocation Button - Mockup styled */}
        <div className="mb-4">
          <button
            type="button"
            onClick={handleGetLocation}
            disabled={isGettingLocation || loading}
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

        {/* Amount Selector */}
        <FormField
          control={form.control}
          name="amount"
          render={({ field, fieldState }) => (
            <FormItem>
              <div className="mb-4">
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2.5">
                  Cantidad de agua
                </label>
                <FormControl>
                  <AmountSelector
                    value={field.value}
                    onChange={field.onChange}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage>{fieldState.error?.message}</FormMessage>
              </div>
            </FormItem>
          )}
        />

        {/* Urgency Toggle - Mockup styled */}
        <FormField
          control={form.control}
          name="isUrgent"
          render={({ field }) => (
            <FormItem>
              <div className="mb-6">
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2.5">
                  ¿Es urgente?
                </label>
                <div
                  className="flex gap-3"
                  role="radiogroup"
                  aria-label="Seleccionar urgencia"
                  data-testid="urgency-toggle"
                >
                  <button
                    type="button"
                    onClick={() => field.onChange(false)}
                    disabled={loading}
                    className={cn(
                      "flex-1 py-3 px-4 rounded-xl border-2 flex flex-col items-center gap-1 transition-all",
                      !field.value
                        ? "bg-[#CAF0F8] border-[#0077B6] text-[#0077B6]"
                        : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                    )}
                    role="radio"
                    aria-checked={!field.value}
                    data-testid="urgency-normal"
                  >
                    <span className="text-xl">🙂</span>
                    <span className="text-sm font-semibold">Normal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => field.onChange(true)}
                    disabled={loading}
                    className={cn(
                      "flex-1 py-3 px-4 rounded-xl border-2 flex flex-col items-center gap-1 transition-all",
                      field.value
                        ? "bg-orange-50 border-orange-400 text-orange-600"
                        : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                    )}
                    role="radio"
                    aria-checked={field.value}
                    data-testid="urgency-urgent"
                  >
                    <span className="text-xl">⚡</span>
                    <span className="text-sm font-semibold">Urgente (+10%)</span>
                  </button>
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
                  <Info className="w-3.5 h-3.5" />
                  Urgente prioriza tu pedido con un cargo adicional del 10%
                </div>
              </div>
            </FormItem>
          )}
        />

        {/* Submit Button - Mockup styled */}
        <Button
          type="submit"
          className="w-full py-4 bg-[#0077B6] hover:bg-[#005f8f] text-white rounded-xl text-base font-semibold shadow-[0_4px_14px_rgba(0,119,182,0.3)]"
          disabled={loading}
          data-testid="submit-button"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Enviando...
            </>
          ) : (
            "Continuar →"
          )}
        </Button>
      </form>
    </Form>
  );
}
