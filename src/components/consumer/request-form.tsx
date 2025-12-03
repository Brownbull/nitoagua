"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
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
 * RequestForm - Guest water request form component
 * Implements all fields with validation per Story 2-2 acceptance criteria
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
        className="space-y-6"
        data-testid="request-form"
      >
        {/* Name Field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Nombre <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Tu nombre completo"
                  data-testid="name-input"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Phone Field */}
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Teléfono <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="+56912345678"
                  data-testid="phone-input"
                  {...field}
                />
              </FormControl>
              <FormDescription data-testid="phone-hint">
                Formato: +56912345678
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email Field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Email <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="tu@email.com"
                  data-testid="email-input"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Address Field */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Dirección <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Calle, número, ciudad"
                  data-testid="address-input"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Geolocation Button */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleGetLocation}
            disabled={isGettingLocation || loading}
            className={cn(
              "min-h-[44px] min-w-[44px]",
              locationCaptured && "border-green-500 text-green-600"
            )}
            data-testid="geolocation-button"
          >
            {isGettingLocation ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <MapPin className="mr-2 h-4 w-4" />
            )}
            {locationCaptured ? "Ubicación capturada" : "Usar mi ubicación"}
          </Button>
        </div>

        {/* Special Instructions Field */}
        <FormField
          control={form.control}
          name="specialInstructions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Instrucciones especiales <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ej: Después del puente, casa azul con portón verde"
                  className="min-h-[100px]"
                  data-testid="instructions-input"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Indica referencias para encontrar tu ubicación
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Amount Selector */}
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Cantidad de agua <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <AmountSelector
                  value={field.value}
                  onChange={field.onChange}
                  disabled={loading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Urgency Toggle */}
        <FormField
          control={form.control}
          name="isUrgent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Urgencia</FormLabel>
              <div
                className="flex gap-2"
                role="radiogroup"
                aria-label="Seleccionar urgencia"
                data-testid="urgency-toggle"
              >
                <Button
                  type="button"
                  variant={!field.value ? "default" : "outline"}
                  onClick={() => field.onChange(false)}
                  disabled={loading}
                  className="min-h-[44px] flex-1"
                  role="radio"
                  aria-checked={!field.value}
                  data-testid="urgency-normal"
                >
                  Normal
                </Button>
                <Button
                  type="button"
                  variant={field.value ? "default" : "outline"}
                  onClick={() => field.onChange(true)}
                  disabled={loading}
                  className="min-h-[44px] flex-1"
                  role="radio"
                  aria-checked={field.value}
                  data-testid="urgency-urgent"
                >
                  Urgente
                </Button>
              </div>
              <FormDescription>
                Las solicitudes urgentes pueden tener costo adicional
              </FormDescription>
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full min-h-[48px]"
          disabled={loading}
          data-testid="submit-button"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            "Continuar"
          )}
        </Button>
      </form>
    </Form>
  );
}
