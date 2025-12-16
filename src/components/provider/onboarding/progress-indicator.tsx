"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const STEP_LABELS = [
  "Inicio",
  "Datos",
  "Áreas",
  "Documentos",
  "Banco",
  "Revisar",
];

export function ProgressIndicator({
  currentStep,
  totalSteps,
}: ProgressIndicatorProps) {
  return (
    <div className="w-full px-4 py-4">
      {/* Progress bar */}
      <div className="relative">
        {/* Background line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200" />
        {/* Progress line */}
        <div
          className="absolute top-4 left-0 h-0.5 bg-orange-500 transition-all duration-300"
          style={{
            width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`,
          }}
        />

        {/* Steps */}
        <div className="relative flex justify-between">
          {Array.from({ length: totalSteps }, (_, i) => {
            const stepNumber = i + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;

            return (
              <div
                key={stepNumber}
                className="flex flex-col items-center"
              >
                {/* Circle */}
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                    isCompleted && "bg-orange-500 text-white",
                    isCurrent && "bg-orange-500 text-white ring-4 ring-orange-100",
                    !isCompleted && !isCurrent && "bg-gray-200 text-gray-500"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    stepNumber
                  )}
                </div>
                {/* Label */}
                <span
                  className={cn(
                    "mt-2 text-xs",
                    isCurrent && "text-orange-600 font-medium",
                    isCompleted && "text-gray-600",
                    !isCompleted && !isCurrent && "text-gray-400"
                  )}
                >
                  {STEP_LABELS[i]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
