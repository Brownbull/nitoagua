"use client";

import { useState, useEffect, useCallback } from "react";
import type { ProviderRegistrationData } from "@/lib/validations/provider-registration";

const STORAGE_KEY = "nitoagua_provider_onboarding";

type PartialRegistrationData = Partial<ProviderRegistrationData>;

interface OnboardingProgress {
  currentStep: number;
  data: PartialRegistrationData;
  lastUpdated: string;
}

const INITIAL_DATA: PartialRegistrationData = {
  // Step 1: Personal info
  name: "",
  phone: "",
  rut: "",
  avatarUrl: undefined,
  // Step 4: Service areas
  comunaIds: [],
  // Step 3: Vehicle (per UX mockup Section 13.4)
  vehicleType: undefined,
  vehicleCapacity: undefined,
  workingHours: undefined,
  workingDays: undefined,
  // Step 2: Documents
  documents: {
    cedula: [],
    licencia_conducir: [],
    vehiculo: [],
    permiso_sanitario: [],
    certificacion: [],
  },
  // Step 5: Bank info
  bankName: "",
  accountType: "",
  accountNumber: "",
};

export function useOnboardingProgress() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<PartialRegistrationData>(INITIAL_DATA);

  // Load from localStorage on mount
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: OnboardingProgress = JSON.parse(saved);
        setCurrentStep(parsed.currentStep);
        setData(parsed.data);
      }
    } catch (error) {
      console.error("[Onboarding] Failed to load progress:", error);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage on changes
  const saveProgress = useCallback(
    (step: number, newData: PartialRegistrationData) => {
      try {
        const progress: OnboardingProgress = {
          currentStep: step,
          data: newData,
          lastUpdated: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      } catch (error) {
        console.error("[Onboarding] Failed to save progress:", error);
      }
    },
    []
  );

  // Update data for current step
  const updateData = useCallback(
    (updates: PartialRegistrationData) => {
      setData((prev) => {
        const newData = { ...prev, ...updates };
        saveProgress(currentStep, newData);
        return newData;
      });
    },
    [currentStep, saveProgress]
  );

  // Go to next step
  const nextStep = useCallback(() => {
    setCurrentStep((prev) => {
      const next = prev + 1;
      saveProgress(next, data);
      return next;
    });
  }, [data, saveProgress]);

  // Go to previous step
  const prevStep = useCallback(() => {
    setCurrentStep((prev) => {
      const next = Math.max(1, prev - 1);
      saveProgress(next, data);
      return next;
    });
  }, [data, saveProgress]);

  // Go to specific step
  const goToStep = useCallback(
    (step: number) => {
      setCurrentStep(step);
      saveProgress(step, data);
    },
    [data, saveProgress]
  );

  // Clear progress (on successful submission)
  const clearProgress = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setCurrentStep(1);
      setData(INITIAL_DATA);
    } catch (error) {
      console.error("[Onboarding] Failed to clear progress:", error);
    }
  }, []);

  return {
    isLoaded,
    currentStep,
    data,
    updateData,
    nextStep,
    prevStep,
    goToStep,
    clearProgress,
  };
}
