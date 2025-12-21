"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";

const CHILEAN_PHONE_REGEX = /^\+56[0-9]{9}$/;

const step1Schema = z.object({
  name: z
    .string()
    .min(2, "El nombre es requerido")
    .max(100, "El nombre es demasiado largo"),
  phone: z
    .string()
    .regex(CHILEAN_PHONE_REGEX, "Formato: +56912345678"),
  email: z
    .string()
    .refine(
      (val) => val === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      { message: "Email inválido" }
    ),
});

export type Step1Data = z.infer<typeof step1Schema>;

interface Step1Props {
  initialData?: Partial<Step1Data>;
  onNext: (data: Step1Data) => void;
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

export function RequestStep1Contact({ initialData, onNext }: Step1Props) {
  const form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    mode: "onSubmit",
    defaultValues: {
      name: initialData?.name ?? "",
      phone: initialData?.phone ?? "+56",
      email: initialData?.email ?? "",
    },
  });

  const handleSubmit = (data: Step1Data) => {
    onNext(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-0">
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
                    placeholder="+56912345678"
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

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            className="w-full py-4 bg-[#0077B6] hover:bg-[#005f8f] text-white rounded-xl text-base font-semibold shadow-[0_4px_14px_rgba(0,119,182,0.3)]"
            data-testid="next-button"
          >
            Siguiente →
          </Button>
        </div>
      </form>
    </Form>
  );
}
