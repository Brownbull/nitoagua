"use client";

import { Banknote, Building2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PAYMENT_METHOD_OPTIONS,
  type PaymentMethod,
} from "@/lib/validations/request";

interface PaymentSelectorProps {
  value: PaymentMethod;
  onChange: (value: PaymentMethod) => void;
  disabled?: boolean;
}

/**
 * Payment method selector component
 * Card-based selection for cash or bank transfer payment
 * AC12.2.1, AC12.2.2: Payment selection step with visual design
 */
export function PaymentSelector({
  value,
  onChange,
  disabled = false,
}: PaymentSelectorProps) {
  return (
    <div className="space-y-2" data-testid="payment-selector">
      <label className="text-sm font-medium text-gray-900">
        ¿Cómo prefieres pagar?
      </label>
      <div className="grid grid-cols-2 gap-3">
        {PAYMENT_METHOD_OPTIONS.map((option) => {
          const isSelected = value === option.value;
          const Icon = option.icon === "banknote" ? Banknote : Building2;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              disabled={disabled}
              data-testid={`payment-option-${option.value}`}
              className={cn(
                "relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all",
                "focus:outline-none focus:ring-2 focus:ring-[#0077B6] focus:ring-offset-2",
                isSelected
                  ? "border-[#0077B6] bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              aria-pressed={isSelected}
              aria-label={`${option.label}: ${option.subtitle}`}
            >
              {/* Selected checkmark */}
              {isSelected && (
                <div
                  className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#0077B6] rounded-full flex items-center justify-center"
                  data-testid={`payment-check-${option.value}`}
                >
                  <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                </div>
              )}

              {/* Icon */}
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  isSelected
                    ? "bg-[#0077B6] text-white"
                    : "bg-gray-100 text-gray-600"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>

              {/* Label */}
              <span
                className={cn(
                  "font-semibold text-sm",
                  isSelected ? "text-[#0077B6]" : "text-gray-900"
                )}
              >
                {option.label}
              </span>

              {/* Subtitle */}
              <span className="text-[10px] text-gray-500 text-center leading-tight">
                {option.subtitle}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
