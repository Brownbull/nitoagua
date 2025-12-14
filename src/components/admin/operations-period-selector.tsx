"use client";

import type { Period } from "@/lib/queries/admin-metrics";

interface OperationsPeriodSelectorProps {
  value: Period;
  onChange: (period: Period) => void;
}

/**
 * Simple tab-based period selector for Operations Dashboard
 * Uses "Hoy / Esta Semana / Este Mes" per UX mockups
 */
export function OperationsPeriodSelector({
  value,
  onChange,
}: OperationsPeriodSelectorProps) {
  const periods: { value: Period; label: string }[] = [
    { value: "today", label: "Hoy" },
    { value: "week", label: "Esta Semana" },
    { value: "month", label: "Este Mes" },
  ];

  return (
    <div
      className="flex gap-2 bg-white p-1 rounded-lg shadow-sm"
      data-testid="operations-period-selector"
    >
      {periods.map((period) => (
        <button
          key={period.value}
          onClick={() => onChange(period.value)}
          className={`flex-1 py-2 px-3 rounded-md text-xs font-semibold transition-colors ${
            value === period.value
              ? "bg-gray-800 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
          data-testid={`period-${period.value}`}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
}
