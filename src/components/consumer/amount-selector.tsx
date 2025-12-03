"use client";

import { cn } from "@/lib/utils";
import { AMOUNT_OPTIONS, formatPrice } from "@/lib/validations/request";

interface AmountSelectorProps {
  value: string | undefined;
  onChange: (value: string) => void;
  prices?: Record<"100" | "1000" | "5000" | "10000", number>;
  disabled?: boolean;
}

/**
 * AmountSelector component - 2x2 grid for water volume selection
 * Displays 4 options: 100L, 1000L, 5000L, 10000L with prices
 * Radio-button style selection behavior
 */
export function AmountSelector({
  value,
  onChange,
  prices,
  disabled = false,
}: AmountSelectorProps) {
  const getPrice = (optionValue: string): number => {
    if (prices && optionValue in prices) {
      return prices[optionValue as keyof typeof prices];
    }
    const option = AMOUNT_OPTIONS.find((opt) => opt.value === optionValue);
    return option?.price ?? 0;
  };

  return (
    <div
      className="grid grid-cols-2 gap-3"
      role="radiogroup"
      aria-label="Cantidad de agua"
      data-testid="amount-selector"
    >
      {AMOUNT_OPTIONS.map((option) => {
        const isSelected = value === option.value;
        const price = getPrice(option.value);

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            data-testid={`amount-option-${option.value}`}
            className={cn(
              // Base styles - minimum 44x44px touch target
              "flex min-h-[88px] min-w-[44px] flex-col items-center justify-center",
              "rounded-lg border-2 p-4 transition-all",
              // Focus styles
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              // Disabled styles
              disabled && "cursor-not-allowed opacity-50",
              // Selected styles
              isSelected
                ? "border-primary bg-primary/10 text-primary"
                : "border-input bg-background hover:border-primary/50 hover:bg-muted/50"
            )}
          >
            <span className="text-lg font-bold">{option.label}</span>
            <span
              className={cn(
                "mt-1 text-sm",
                isSelected ? "text-primary" : "text-muted-foreground"
              )}
            >
              {formatPrice(price)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
