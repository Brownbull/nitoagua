"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, ArrowRight, ArrowLeft, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressIndicator } from "./progress-indicator";
import { COMUNAS } from "@/lib/validations/provider-registration";
import { cn } from "@/lib/utils";

export function ServiceAreaPicker() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedComunas, setSelectedComunas] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("nitoagua_provider_onboarding");
      if (saved) {
        const { data } = JSON.parse(saved);
        if (data.comunaIds && data.comunaIds.length > 0) {
          setSelectedComunas(data.comunaIds);
        }
      }
    } catch {
      // Ignore errors
    }
  }, []);

  const toggleComuna = (comunaId: string) => {
    setError(null);
    setSelectedComunas((prev) =>
      prev.includes(comunaId)
        ? prev.filter((id) => id !== comunaId)
        : [...prev, comunaId]
    );
  };

  const handleSubmit = async () => {
    if (selectedComunas.length === 0) {
      setError("Selecciona al menos una comuna de servicio");
      return;
    }

    setIsSubmitting(true);

    // Save to localStorage
    try {
      const existing = localStorage.getItem("nitoagua_provider_onboarding");
      const progress = existing ? JSON.parse(existing) : { currentStep: 3, data: {} };
      progress.data = { ...progress.data, comunaIds: selectedComunas };
      progress.currentStep = 4;
      localStorage.setItem("nitoagua_provider_onboarding", JSON.stringify(progress));
    } catch {
      // Ignore errors
    }

    // Navigate to next step
    router.push("/provider/onboarding/documents");
  };

  const handleBack = () => {
    router.push("/provider/onboarding/personal");
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      <ProgressIndicator currentStep={3} totalSteps={6} />

      <div className="flex-1 px-4 py-6">
        <div className="max-w-md mx-auto">
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Áreas de Servicio
          </h1>
          <p className="text-gray-600 text-sm mb-6">
            Selecciona las comunas donde puedes realizar entregas de agua
          </p>

          {/* Comuna Selection */}
          <div className="space-y-3 mb-6">
            {COMUNAS.map((comuna) => {
              const isSelected = selectedComunas.includes(comuna.id);
              return (
                <button
                  key={comuna.id}
                  type="button"
                  onClick={() => toggleComuna(comuna.id)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all",
                    isSelected
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 bg-white hover:border-orange-200"
                  )}
                  data-testid={`comuna-${comuna.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        isSelected ? "bg-orange-500" : "bg-gray-100"
                      )}
                    >
                      <MapPin
                        className={cn(
                          "w-5 h-5",
                          isSelected ? "text-white" : "text-gray-500"
                        )}
                      />
                    </div>
                    <span
                      className={cn(
                        "font-medium",
                        isSelected ? "text-orange-700" : "text-gray-700"
                      )}
                    >
                      {comuna.name}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-sm text-red-500 text-center mb-4" role="alert">
              {error}
            </p>
          )}

          {/* Selection Summary */}
          {selectedComunas.length > 0 && (
            <div className="bg-orange-50 rounded-lg p-3 mb-6">
              <p className="text-sm text-orange-700">
                <span className="font-medium">{selectedComunas.length}</span>{" "}
                {selectedComunas.length === 1 ? "comuna seleccionada" : "comunas seleccionadas"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4">
        <div className="max-w-md mx-auto flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            className="flex-1 h-12 rounded-xl"
            data-testid="back-button"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Atrás
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || selectedComunas.length === 0}
            className="flex-1 h-12 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl"
            data-testid="next-button"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                Siguiente
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
