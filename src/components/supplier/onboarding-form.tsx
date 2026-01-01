"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  supplierProfileSchema,
  type SupplierProfileInput,
  SERVICE_AREAS,
} from "@/lib/validations/supplier-profile";
import { createSupplierProfile } from "@/lib/actions/supplier-profile";

export function OnboardingForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SupplierProfileInput>({
    resolver: zodResolver(supplierProfileSchema),
    defaultValues: {
      name: "",
      phone: "+56",
      serviceArea: "",
      price100l: 0,
      price1000l: 0,
      price5000l: 0,
      price10000l: 0,
      isAvailable: true,
    },
  });

  async function onSubmit(data: SupplierProfileInput) {
    setIsSubmitting(true);

    try {
      const result = await createSupplierProfile(data);

      if (!result.success) {
        toast.error(result.error);
        setIsSubmitting(false);
        return;
      }

      toast.success("¡Bienvenido a nitoagua!");
      router.push("/dashboard");
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
              <FormLabel>Nombre completo</FormLabel>
              <FormControl>
                <Input
                  placeholder="Juan Pérez"
                  {...field}
                  data-testid="name-input"
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
              <FormLabel>Teléfono</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="+56912345678"
                  {...field}
                  data-testid="phone-input"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Service Area Field */}
        <FormField
          control={form.control}
          name="serviceArea"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Área de servicio</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="service-area-select">
                    <SelectValue placeholder="Selecciona tu área" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {SERVICE_AREAS.map((area) => (
                    <SelectItem key={area.value} value={area.value}>
                      {area.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Price Fields */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Precios (CLP)</Label>
          <p className="text-sm text-gray-500 -mt-2">
            Define tus precios por cantidad de agua
          </p>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="price100l"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>100 litros</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="5000"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      data-testid="price-100l-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price1000l"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>1,000 litros</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="15000"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      data-testid="price-1000l-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price5000l"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>5,000 litros</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="50000"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      data-testid="price-5000l-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price10000l"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>10,000 litros</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="90000"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      data-testid="price-10000l-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-12 text-base bg-[#0077B6] hover:bg-[#006699]"
          disabled={isSubmitting}
          data-testid="submit-button"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Creando perfil...
            </>
          ) : (
            "Crear perfil de proveedor"
          )}
        </Button>
      </form>
    </Form>
  );
}
