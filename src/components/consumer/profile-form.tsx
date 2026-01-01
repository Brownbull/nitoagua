"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, MapPin } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import {
  updateConsumerProfile,
  getAvailableComunas,
  type AvailableComuna,
} from "@/lib/actions/consumer-profile";

// Chilean phone format: +56 followed by 9 digits
const chileanPhoneRegex = /^\+56[0-9]{9}$/;

const consumerProfileSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  phone: z
    .string()
    .regex(chileanPhoneRegex, "Formato inválido. Ejemplo: +56912345678"),
  comunaId: z.string().optional(),
  address: z
    .string()
    .min(5, "La dirección debe tener al menos 5 caracteres")
    .max(200, "La dirección no puede exceder 200 caracteres"),
  specialInstructions: z
    .string()
    .min(10, "Las instrucciones deben tener al menos 10 caracteres")
    .max(500, "Las instrucciones no pueden exceder 500 caracteres"),
});

type ConsumerProfileFormData = z.infer<typeof consumerProfileSchema>;

interface ConsumerProfileFormProps {
  initialData: {
    name: string;
    phone: string;
    address: string | null;
    special_instructions: string | null;
    comuna_id: string | null;
  };
  email: string | null;
}

export function ConsumerProfileForm({ initialData, email }: ConsumerProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comunas, setComunas] = useState<AvailableComuna[]>([]);
  const [loadingComunas, setLoadingComunas] = useState(true);

  // Load available comunas on mount
  useEffect(() => {
    async function loadComunas() {
      const available = await getAvailableComunas();
      setComunas(available);
      setLoadingComunas(false);
    }
    loadComunas();
  }, []);

  const form = useForm<ConsumerProfileFormData>({
    resolver: zodResolver(consumerProfileSchema),
    defaultValues: {
      name: initialData.name || "",
      phone: initialData.phone || "+56",
      comunaId: initialData.comuna_id || "",
      address: initialData.address || "",
      specialInstructions: initialData.special_instructions || "",
    },
  });

  async function onSubmit(data: ConsumerProfileFormData) {
    setIsSubmitting(true);

    try {
      const result = await updateConsumerProfile(data);

      if (!result.success) {
        toast.error(result.error);
        setIsSubmitting(false);
        return;
      }

      toast.success("Perfil actualizado correctamente");
      setIsSubmitting(false);
    } catch {
      toast.error("Error al actualizar el perfil. Intenta de nuevo.");
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Contact Section */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            Información de contacto
          </h3>

          {/* Email (read-only) */}
          <div>
            <Input
              value={email || ""}
              disabled
              className="h-11 rounded-xl border-gray-200 bg-gray-50 text-sm text-gray-500"
            />
            <p className="text-[10px] text-gray-400 mt-1">El email no se puede modificar</p>
          </div>

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
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>
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
                    >
                      <SelectValue placeholder={loadingComunas ? "Cargando..." : "Selecciona tu comuna"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {comunas.map((comuna) => (
                      <SelectItem key={comuna.id} value={comuna.id}>
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
              disabled
              className="h-11 w-11 rounded-xl border-gray-200 shrink-0 opacity-50"
              title="Usar mi ubicación (próximamente)"
            >
              <MapPin className="h-4 w-4" />
            </Button>
          </div>

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
          className="w-full h-11 bg-[#0077B6] hover:bg-[#005f8f] text-white rounded-xl text-sm font-semibold shadow-[0_4px_14px_rgba(0,119,182,0.3)]"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            "Guardar Cambios"
          )}
        </Button>
      </form>
    </Form>
  );
}
