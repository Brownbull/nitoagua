"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { z } from "zod";

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
import { updateConsumerProfile } from "@/lib/actions/consumer-profile";

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
  };
  email: string | null;
}

export function ConsumerProfileForm({ initialData, email }: ConsumerProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ConsumerProfileFormData>({
    resolver: zodResolver(consumerProfileSchema),
    defaultValues: {
      name: initialData.name || "",
      phone: initialData.phone || "+56",
      address: initialData.address || "",
      specialInstructions: initialData.special_instructions || "",
    },
  });

  async function onSubmit(data: ConsumerProfileFormData) {
    setIsSubmitting(true);

    try {
      const result = await updateConsumerProfile(data);

      if (result.error) {
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
        {/* Email (read-only) */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <Input
            value={email || ""}
            disabled
            className="bg-gray-100"
          />
          <p className="text-xs text-gray-500">El email no se puede modificar</p>
        </div>

        {/* Name Field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input
                  placeholder="Tu nombre completo"
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
              <FormLabel>Teléfono <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="+56912345678"
                  {...field}
                />
              </FormControl>
              <FormDescription>Formato: +56912345678</FormDescription>
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
              <FormLabel>Dirección <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input
                  placeholder="Calle, número, ciudad"
                  {...field}
                />
              </FormControl>
              <FormDescription>Tu dirección de entrega habitual</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Special Instructions Field */}
        <FormField
          control={form.control}
          name="specialInstructions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instrucciones de entrega <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ej: Después del puente, casa azul con portón verde"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Ayuda al proveedor a encontrar tu ubicación
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full h-12 bg-[#0077B6] hover:bg-[#006699]"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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
