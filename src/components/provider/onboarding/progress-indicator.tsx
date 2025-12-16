"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps?: number;
  showBackButton?: boolean;
  onBack?: () => void;
}

/**
 * 6-step progress indicator for provider onboarding
 * Steps: Personal (1) → Documentos (2) → Vehículo (3) → Áreas (4) → Banco (5) → Revisión (6)
 */
export function ProgressIndicator({
  currentStep,
  totalSteps = 6,
  showBackButton = true,
  onBack,
}: ProgressIndicatorProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <div className="w-full">
      {/* Header with back button and step text */}
      <div className="flex items-center gap-3 mb-4">
        {showBackButton && (
          <button
            onClick={handleBack}
            className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-200 transition-colors"
            aria-label="Volver"
            data-testid="progress-back-button"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <span className="text-base font-semibold text-gray-700" data-testid="step-indicator">
          Paso {currentStep} de {totalSteps}
        </span>
      </div>

      {/* 6-segment progress bar */}
      <div className="flex gap-2" data-testid="progress-bar">
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepNumber = i + 1;
          const isActive = stepNumber <= currentStep;

          return (
            <div
              key={stepNumber}
              className={`flex-1 h-1 rounded-sm transition-colors ${
                isActive ? "bg-orange-500" : "bg-gray-200"
              }`}
              data-testid={`progress-segment-${stepNumber}`}
              aria-label={`Paso ${stepNumber}${isActive ? " completado" : ""}`}
            />
          );
        })}
      </div>
    </div>
  );
}
