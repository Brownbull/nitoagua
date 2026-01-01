"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MapPinPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CHILEAN_PHONE_REGEX } from "@/lib/validations/request";
import {
  getAvailableComunas,
  type AvailableComuna,
} from "@/lib/actions/consumer-profile";

const step1Schema = z.object({
  name: z
    .string()
    .min(2, "El nombre es requerido")
    .max(100, "El nombre es demasiado largo"),
  phone: z.string().regex(CHILEAN_PHONE_REGEX, "Formato: +56912345678"),
  email: z.string().refine(
    (val) => val === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
    { message: "Email inválido" }
  ),
  comunaId: z.string().min(1, "Selecciona una comuna"),
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

export type Step1Data = z.infer<typeof step1Schema>;

interface Step1Props {
  initialData?: Partial<Step1Data>;
  onNext: (data: Step1Data) => void;
  onOpenMap: (currentData: Partial<Step1Data>) => void;
}

export function RequestStep1Details({ initialData, onNext, onOpenMap }: Step1Props) {
  const [comunas, setComunas] = useState<AvailableComuna[]>([]);
  const [loadingComunas, setLoadingComunas] = useState(true);

  const form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    mode: "onSubmit",
    defaultValues: {
      name: initialData?.name ?? "",
      phone: initialData?.phone ?? "",
      email: initialData?.email ?? "",
      comunaId: initialData?.comunaId ?? "",
      address: initialData?.address ?? "",
      specialInstructions: initialData?.specialInstructions ?? "",
      latitude: initialData?.latitude,
      longitude: initialData?.longitude,
    },
  });

  // Load available comunas on mount
  useEffect(() => {
    async function loadComunas() {
      const available = await getAvailableComunas();
      setComunas(available);
      setLoadingComunas(false);
    }
    loadComunas();
  }, []);

  const handleSubmit = (data: Step1Data) => {
    onNext(data);
  };

  // Open map to select location - passes current form data so it can be preserved
  const handleOpenMap = () => {
    const currentData = form.getValues();
    onOpenMap(currentData);
  };

  const hasLocation = form.watch("latitude") && form.watch("longitude");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Contact Info Section */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            Información de contacto
          </h3>

          {/* Name and Phone - side by side */}
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Tu nombre"
                      className={cn(
                        "h-11 rounded-xl border-gray-200 text-sm placeholder:text-xs placeholder:text-gray-400",
                        fieldState.error && "border-red-400"
                      )}
                      data-testid="name-input"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      type="tel"
                      placeholder="Tu Teléfono"
                      className={cn(
                        "h-11 rounded-xl border-gray-200 text-sm placeholder:text-xs placeholder:text-gray-400",
                        fieldState.error && "border-red-400"
                      )}
                      data-testid="phone-input"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>

          {/* Email - full width */}
          <FormField
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="tu@email.com (opcional)"
                    className={cn(
                      "h-11 rounded-xl border-gray-200 text-sm placeholder:text-xs placeholder:text-gray-400",
                      fieldState.error && "border-red-400"
                    )}
                    data-testid="email-input"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        {/* Location Section */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            Dirección de entrega
          </h3>

          {/* Comuna dropdown */}
          <FormField
            control={form.control}
            name="comunaId"
            render={({ field, fieldState }) => (
              <FormItem>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={loadingComunas}
                >
                  <FormControl>
                    <SelectTrigger
                      className={cn(
                        "h-11 rounded-xl border-gray-200 text-sm",
                        !field.value && "text-gray-400",
                        fieldState.error && "border-red-400"
                      )}
                      data-testid="comuna-select"
                    >
                      <SelectValue placeholder={loadingComunas ? "Cargando..." : "Selecciona tu comuna"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {comunas.map((comuna) => (
                      <SelectItem
                        key={comuna.id}
                        value={comuna.id}
                        data-testid={`comuna-option-${comuna.id}`}
                      >
                        {comuna.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Address with geolocation button */}
          <div className="flex gap-2">
            <FormField
              control={form.control}
              name="address"
              render={({ field, fieldState }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Calle, número, referencia"
                      className={cn(
                        "h-11 rounded-xl border-gray-200 text-sm placeholder:text-xs placeholder:text-gray-400",
                        fieldState.error && "border-red-400"
                      )}
                      data-testid="address-input"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleOpenMap}
              className={cn(
                "h-11 w-11 rounded-xl border-gray-200 shrink-0",
                hasLocation && "border-green-500 text-green-600 bg-green-50"
              )}
              data-testid="open-map-button"
              title="Seleccionar ubicación en mapa"
            >
              <MapPinPlus className={cn("h-4 w-4", hasLocation && "fill-current")} />
            </Button>
          </div>

          {hasLocation && (
            <p className="text-xs text-green-600">Ubicación capturada</p>
          )}

          {/* Special Instructions */}
          <FormField
            control={form.control}
            name="specialInstructions"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="¿Cómo es tu casa? Ej: Casa azul con portón verde, después del puente..."
                    className={cn(
                      "min-h-[70px] rounded-xl border-gray-200 text-sm placeholder:text-xs placeholder:text-gray-400 resize-none",
                      fieldState.error && "border-red-400"
                    )}
                    data-testid="instructions-input"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-12 bg-[#0077B6] hover:bg-[#005f8f] text-white rounded-xl text-base font-semibold shadow-[0_4px_14px_rgba(0,119,182,0.3)]"
          data-testid="next-button"
        >
          Siguiente →
        </Button>
      </form>
    </Form>
  );
}
