"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Info, Droplets } from "lucide-react";
import { useEffect, useImperativeHandle, forwardRef } from "react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { AMOUNT_OPTIONS, formatPrice } from "@/lib/validations/request";

const step3Schema = z.object({
  amount: z.enum(["100", "1000", "5000", "10000"], {
    message: "Selecciona una cantidad",
  }),
  isUrgent: z.boolean(),
});

export type Step3Data = z.infer<typeof step3Schema>;

export interface Step3Ref {
  submit: () => void;
  isValid: () => boolean;
}

interface Step3Props {
  initialData?: Partial<Step3Data>;
  onNext: (data: Step3Data) => void;
  onBack: () => void;
  onValidChange?: (isValid: boolean) => void;
}

export const RequestStep3Amount = forwardRef<Step3Ref, Step3Props>(function RequestStep3Amount(
  { initialData, onNext, onValidChange },
  ref
) {
  const form = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    mode: "onChange",
    defaultValues: {
      amount: initialData?.amount,
      isUrgent: initialData?.isUrgent ?? false,
    },
  });

  const handleSubmit = (data: Step3Data) => {
    onNext(data);
  };

  const selectedAmount = form.watch("amount");
  const isUrgent = form.watch("isUrgent");

  // Expose submit method to parent via ref
  useImperativeHandle(ref, () => ({
    submit: () => {
      form.handleSubmit(handleSubmit)();
    },
    isValid: () => !!selectedAmount,
  }));

  // Notify parent of validity changes
  useEffect(() => {
    onValidChange?.(!!selectedAmount);
  }, [selectedAmount, onValidChange]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-0">
        {/* Amount Selection - Compact */}
        <FormField
          control={form.control}
          name="amount"
          render={({ field, fieldState }) => (
            <FormItem>
              <div className="mb-3">
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Cantidad de agua
                </label>
                <FormControl>
                  <div className="space-y-2">
                    {AMOUNT_OPTIONS.map((option) => {
                      const isSelected = field.value === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => field.onChange(option.value)}
                          className={cn(
                            "w-full flex items-center justify-between py-2.5 px-3 rounded-xl border-2 transition-all",
                            isSelected
                              ? "border-[#0077B6] bg-[#CAF0F8]"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          )}
                          data-testid={`amount-${option.value}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center",
                                isSelected ? "bg-[#0077B6]" : "bg-gray-100"
                              )}
                            >
                              <Droplets
                                className={cn(
                                  "w-4 h-4",
                                  isSelected ? "text-white" : "text-gray-400"
                                )}
                                fill={isSelected ? "currentColor" : "none"}
                              />
                            </div>
                            <div className="text-left">
                              <p
                                className={cn(
                                  "text-sm font-semibold leading-tight",
                                  isSelected ? "text-[#0077B6]" : "text-gray-900"
                                )}
                              >
                                {option.label}
                              </p>
                              <p className="text-[11px] text-gray-500">
                                {option.value === "1000"
                                  ? "Más popular ⭐"
                                  : option.value === "100"
                                  ? "Para 1-2 personas"
                                  : option.value === "5000"
                                  ? "Familia grande"
                                  : "Estanque completo"}
                              </p>
                            </div>
                          </div>
                          <span
                            className={cn(
                              "text-base font-bold",
                              isSelected ? "text-[#0077B6]" : "text-gray-700"
                            )}
                          >
                            {formatPrice(option.price)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </FormControl>
                <FormMessage>{fieldState.error?.message}</FormMessage>
              </div>
            </FormItem>
          )}
        />

        {/* Urgency Toggle - Compact */}
        <FormField
          control={form.control}
          name="isUrgent"
          render={({ field }) => (
            <FormItem>
              <div className="mb-3">
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  ¿Es urgente?
                </label>
                <div
                  className="flex gap-2"
                  role="radiogroup"
                  aria-label="Seleccionar urgencia"
                  data-testid="urgency-toggle"
                >
                  <button
                    type="button"
                    onClick={() => field.onChange(false)}
                    className={cn(
                      "flex-1 py-2.5 px-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all",
                      !field.value
                        ? "bg-[#CAF0F8] border-[#0077B6] text-[#0077B6]"
                        : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                    )}
                    role="radio"
                    aria-checked={!field.value}
                    data-testid="urgency-normal"
                  >
                    <span className="text-base">🙂</span>
                    <span className="text-sm font-semibold">Normal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => field.onChange(true)}
                    className={cn(
                      "flex-1 py-2.5 px-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all",
                      field.value
                        ? "bg-orange-50 border-orange-400 text-orange-600"
                        : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                    )}
                    role="radio"
                    aria-checked={field.value}
                    data-testid="urgency-urgent"
                  >
                    <span className="text-base">⚡</span>
                    <span className="text-sm font-semibold">Urgente (+10%)</span>
                  </button>
                </div>
                <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-gray-500">
                  <Info className="w-3 h-3" />
                  Urgente prioriza tu pedido con un cargo adicional del 10%
                </div>
              </div>
            </FormItem>
          )}
        />

        {/* Summary if amount selected - Compact */}
        {selectedAmount && (
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Precio estimado:</span>
              <span className="text-base font-bold text-[#0077B6]">
                {formatPrice(
                  (AMOUNT_OPTIONS.find((o) => o.value === selectedAmount)?.price ?? 0) *
                    (isUrgent ? 1.1 : 1)
                )}
              </span>
            </div>
            {isUrgent && (
              <p className="text-[11px] text-orange-600 mt-1">Incluye cargo de urgencia (+10%)</p>
            )}
          </div>
        )}

        {/* Hidden submit button for form submission via ref */}
        <button type="submit" className="hidden" data-testid="review-button" />
      </form>
    </Form>
  );
});
