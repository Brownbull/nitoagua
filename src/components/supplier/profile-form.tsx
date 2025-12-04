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
import { Switch } from "@/components/ui/switch";
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
  type SupplierProfile,
  SERVICE_AREAS,
} from "@/lib/validations/supplier-profile";
import { createClient } from "@/lib/supabase/client";

interface ProfileFormProps {
  initialData: SupplierProfile;
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const form = useForm<SupplierProfileInput>({
    resolver: zodResolver(supplierProfileSchema),
    defaultValues: {
      name: initialData.name,
      phone: initialData.phone,
      serviceArea: initialData.serviceArea,
      price100l: initialData.price100l,
      price1000l: initialData.price1000l,
      price5000l: initialData.price5000l,
      price10000l: initialData.price10000l,
      isAvailable: initialData.isAvailable,
    },
  });

  async function onSubmit(data: SupplierProfileInput) {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/supplier/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        toast.error(result.error?.message || "Error al actualizar el perfil");
        setIsSubmitting(false);
        return;
      }

      // Update form with returned data
      if (result.data) {
        form.reset({
          name: result.data.name,
          phone: result.data.phone,
          serviceArea: result.data.serviceArea,
          price100l: result.data.price100l,
          price1000l: result.data.price1000l,
          price5000l: result.data.price5000l,
          price10000l: result.data.price10000l,
          isAvailable: result.data.isAvailable,
        });
      }

      toast.success("Perfil actualizado");
      router.refresh();
    } catch {
      toast.error("Error al actualizar el perfil. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
    } catch {
      toast.error("Error al cerrar sesión");
      setIsLoggingOut(false);
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
              <FormLabel>Nombre completo *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Juan Pérez"
                  {...field}
                  data-testid="profile-name-input"
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
              <FormLabel>Teléfono *</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="+56912345678"
                  {...field}
                  data-testid="profile-phone-input"
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
              <FormLabel>Área de servicio *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="profile-service-area-select">
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
          <Label className="text-base font-semibold">Precios (CLP) *</Label>
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
                      value={field.value || ""}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      data-testid="profile-price-100l-input"
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
                      value={field.value || ""}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      data-testid="profile-price-1000l-input"
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
                      value={field.value || ""}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      data-testid="profile-price-5000l-input"
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
                      value={field.value || ""}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      data-testid="profile-price-10000l-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Availability Toggle */}
        <FormField
          control={form.control}
          name="isAvailable"
          render={({ field }) => (
            <FormItem className="flex flex-col space-y-2 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Disponibilidad</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    {field.value ? (
                      <span className="text-green-600 font-medium">Disponible</span>
                    ) : (
                      <span className="text-gray-500 font-medium">No disponible (vacaciones)</span>
                    )}
                  </p>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    data-testid="profile-availability-toggle"
                  />
                </FormControl>
              </div>
            </FormItem>
          )}
        />

        {/* Action Buttons - positioned for right-handed users */}
        <div className="flex flex-col gap-3 pt-4">
          <Button
            type="submit"
            className="w-full h-12 text-base bg-[#0077B6] hover:bg-[#006699]"
            disabled={isSubmitting}
            data-testid="profile-save-button"
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

          <Button
            type="button"
            variant="outline"
            className="w-full h-12 text-base"
            onClick={handleLogout}
            disabled={isLoggingOut}
            data-testid="profile-logout-button"
          >
            {isLoggingOut ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Cerrando sesión...
              </>
            ) : (
              "Cerrar sesión"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
