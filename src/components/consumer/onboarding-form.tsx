"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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
import {
  consumerOnboardingSchema,
  type ConsumerOnboardingInput,
} from "@/lib/validations/consumer-profile";
import { createConsumerProfile } from "@/lib/actions/consumer-profile";

export function ConsumerOnboardingForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ConsumerOnboardingInput>({
    resolver: zodResolver(consumerOnboardingSchema),
    defaultValues: {
      name: "",
      phone: "+56",
      address: "",
      specialInstructions: "",
    },
  });

  async function onSubmit(data: ConsumerOnboardingInput) {
    setIsSubmitting(true);

    try {
      const result = await createConsumerProfile(data);

      if (result.error) {
        toast.error(result.error);
        setIsSubmitting(false);
        return;
      }

      toast.success("¡Cuenta creada! Ya puedes solicitar agua más rápido");
      router.push("/");
    } catch {
      toast.error("Error al crear el perfil. Intenta de nuevo.");
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Name Field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tu nombre <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input
                  placeholder="Tu nombre completo"
                  {...field}
                  data-testid="consumer-name-input"
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
                  data-testid="consumer-phone-input"
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
                  data-testid="consumer-address-input"
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
                  placeholder="Ej: Después del puente, casa azul con portón verde. Tocar el timbre dos veces."
                  className="min-h-[100px]"
                  {...field}
                  data-testid="consumer-instructions-input"
                />
              </FormControl>
              <FormDescription>
                Ayuda al proveedor a encontrar tu ubicación fácilmente
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full h-12 text-base bg-[#0077B6] hover:bg-[#006699]"
          disabled={isSubmitting}
          data-testid="consumer-submit-button"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Creando cuenta...
            </>
          ) : (
            "Crear cuenta"
          )}
        </Button>
      </form>
    </Form>
  );
}
