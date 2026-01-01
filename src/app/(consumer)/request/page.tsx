"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { RequestHeader } from "@/components/consumer/request-header";
import { RequestStep1Details, type Step1Data } from "@/components/consumer/request-step1-details";
import { LocationPinpointWrapper } from "@/components/consumer/location-pinpoint-wrapper";
import { RequestStep3Amount, type Step3Data, type Step3Ref } from "@/components/consumer/request-step3-amount";
import { RequestReview } from "@/components/consumer/request-review";
import type { RequestInput } from "@/lib/validations/request";
import {
  queueRequest,
  isOnline,
  registerOnlineListener,
  processQueue,
} from "@/lib/utils/offline-queue";
import { createClient } from "@/lib/supabase/client";
import { getUrgencySurchargePercent } from "@/lib/actions/admin";

/**
 * Request flow states (4-step wizard with map pinpoint):
 * - loading: Loading user profile data
 * - step1: Contact + Location info (name, phone, email, comuna, address, instructions)
 * - map: Map pinpoint - confirm/adjust exact location (Story 12-1)
 * - step2: Amount (water quantity, urgency)
 * - step3: Review screen - verify all info before submission
 * - submitting: Request is being submitted to the server
 * - submitted: Request has been successfully submitted
 */
type RequestState = "loading" | "step1" | "map" | "step2" | "step3" | "submitting" | "submitted";

interface UserProfile {
  name: string;
  phone: string;
  address: string | null;
  special_instructions: string | null;
  comuna_id: string | null;
}

// Step data types combined
interface WizardData {
  step1?: Step1Data;
  step2?: Step3Data;
}

export default function RequestPage() {
  const router = useRouter();
  const [state, setState] = useState<RequestState>("loading");
  const [wizardData, setWizardData] = useState<WizardData>({});
  const [profileData, setProfileData] = useState<Partial<RequestInput>>({});
  const [step2Valid, setStep2Valid] = useState(false);
  const [urgencySurcharge, setUrgencySurcharge] = useState<number>(10); // Default 10%, AC12.4.2
  const step2Ref = useRef<Step3Ref>(null);
  const handleSubmitRef = useRef<() => void>(() => {});

  // Load user profile and urgency surcharge on mount
  useEffect(() => {
    async function loadInitialData() {
      // Fetch urgency surcharge percentage from admin settings - AC12.4.2
      const surcharge = await getUrgencySurchargePercent();
      setUrgencySurcharge(surcharge);

      // Load user profile
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Get user email
        const email = user.email || "";

        // Get profile data including saved comuna
        const { data: profile } = await supabase
          .from("profiles")
          .select("name, phone, address, special_instructions, comuna_id")
          .eq("id", user.id)
          .single();

        if (profile) {
          const typedProfile = profile as UserProfile;
          setProfileData({
            name: typedProfile.name || "",
            phone: typedProfile.phone || "",
            email: email,
            address: typedProfile.address || "",
            specialInstructions: typedProfile.special_instructions || "",
            comunaId: typedProfile.comuna_id || undefined,
          });
        } else {
          // No profile but has email
          setProfileData({ email });
        }
      }

      setState("step1");
    }

    loadInitialData();
  }, []);

  // Register online listener to process queued requests
  useEffect(() => {
    const cleanup = registerOnlineListener(async (results) => {
      const successful = results.filter((r) => r.success);
      if (successful.length > 0) {
        toast.success(
          `${successful.length} solicitud(es) pendiente(s) enviada(s) correctamente`
        );
      }
    });

    // Also try to process queue on mount if online
    if (isOnline()) {
      processQueue().then((results) => {
        const successful = results.filter((r) => r.success);
        if (successful.length > 0) {
          toast.success(
            `${successful.length} solicitud(es) pendiente(s) enviada(s) correctamente`
          );
        }
      });
    }

    return cleanup;
  }, []);

  // Build complete form data from wizard steps
  const buildFormData = (): RequestInput | null => {
    const { step1, step2 } = wizardData;
    if (!step1 || !step2) return null;

    return {
      name: step1.name,
      phone: step1.phone,
      email: step1.email,
      address: step1.address,
      specialInstructions: step1.specialInstructions,
      latitude: step1.latitude,
      longitude: step1.longitude,
      comunaId: step1.comunaId,
      amount: step2.amount,
      isUrgent: step2.isUrgent,
      paymentMethod: step2.paymentMethod ?? "cash",
    };
  };

  // Step 1 handlers - goes directly to step 2 (map is optional via icon)
  const handleStep1Next = (data: Step1Data) => {
    setWizardData(prev => ({ ...prev, step1: data }));
    setState("step2"); // Go directly to amount step
  };

  // Open map from Step 1 when user clicks the location icon
  const handleOpenMap = useCallback((currentData: Partial<Step1Data>) => {
    // Save current form data before opening map
    setWizardData(prev => ({
      ...prev,
      step1: { ...prev.step1, ...currentData } as Step1Data,
    }));
    setState("map");
  }, []);

  // Map step handlers - AC12.1.3
  const handleMapConfirm = useCallback((latitude: number, longitude: number) => {
    // Update step1 data with confirmed coordinates and return to step1
    setWizardData(prev => ({
      ...prev,
      step1: prev.step1 ? { ...prev.step1, latitude, longitude } : undefined,
    }));
    setState("step1"); // Return to step 1 with coordinates set
  }, []);

  const handleMapBack = useCallback(() => {
    setState("step1");
  }, []);

  const handleMapSkip = useCallback(() => {
    // Skip without coordinates - return to step 1
    setState("step1");
  }, []);

  // Step 2 handlers
  const handleStep2Next = (data: Step3Data) => {
    setWizardData(prev => ({ ...prev, step2: data }));
    setState("step3");
  };

  const handleStep2Back = () => {
    setState("step1"); // Go back to step 1
  };

  // Handle step 2 "Siguiente" click from header
  const handleStep2HeaderNext = useCallback(() => {
    step2Ref.current?.submit();
  }, []);

  // Handle step 3 "Confirmar" click from header
  const handleStep3HeaderSubmit = useCallback(() => {
    handleSubmitRef.current();
  }, []);

  // Handle step 2 validity changes
  const handleStep2ValidChange = useCallback((isValid: boolean) => {
    setStep2Valid(isValid);
  }, []);

  // Step 3 (Review) handlers
  const handleStep3Back = () => {
    setState("step2");
  };

  // Handle edit from review - return to step 1
  const handleEditContact = () => {
    setState("step1");
  };

  const handleEditAmount = () => {
    setState("step2");
  };

  // Handle final submission
  const handleSubmit = async () => {
    const formData = buildFormData();
    if (!formData) return;

    // Check if online
    if (!isOnline()) {
      // Queue request for later submission
      queueRequest(formData);
      toast.info("Solicitud guardada. Se enviará cuando tengas conexión.", {
        duration: 5000,
      });
      // Navigate back to home
      router.push("/");
      return;
    }

    setState("submitting");

    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.data && !result.error) {
        // Success - store response in sessionStorage for confirmation page
        sessionStorage.setItem(
          "nitoagua_last_request",
          JSON.stringify(result.data)
        );
        setState("submitted");
        router.push(`/request/${result.data.id}/confirmation`);
      } else {
        // API returned an error
        setState("step3");
        toast.error(result.error?.message || "Error al enviar", {
          action: {
            label: "Reintentar",
            onClick: () => handleSubmit(),
          },
          style: {
            backgroundColor: "hsl(var(--destructive))",
            color: "hsl(var(--destructive-foreground))",
          },
        });
      }
    } catch {
      // Network error - check if we're offline now
      if (!isOnline()) {
        const formData = buildFormData();
        if (formData) {
          queueRequest(formData);
        }
        toast.info("Solicitud guardada. Se enviará cuando tengas conexión.", {
          duration: 5000,
        });
        router.push("/");
      } else {
        setState("step3");
        toast.error("Error al enviar la solicitud", {
          action: {
            label: "Reintentar",
            onClick: () => handleSubmit(),
          },
          style: {
            backgroundColor: "hsl(var(--destructive))",
            color: "hsl(var(--destructive-foreground))",
          },
        });
      }
    }
  };

  // Keep ref in sync with handleSubmit
  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  });

  // Loading state
  if (state === "loading") {
    return (
      <div className="min-h-dvh bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0077B6]" />
      </div>
    );
  }

  // Get step info based on state - now includes map step (Story 12-1)
  // Visual step numbers: 1=details, 2=map, 3=amount, 4=review (but user sees 3-step progress)
  const getStepInfo = () => {
    switch (state) {
      case "step1":
        return {
          step: 1,
          totalSteps: 3,
          title: "Pedir Agua",
          subtitle: "Tus datos y dirección",
          onBack: undefined,
          onNext: undefined,
          showNavButtons: false,
          nextDisabled: false,
          nextLabel: "Continuar",
          showHeader: true,
        };
      case "map":
        return {
          step: 1, // Same visual step as step1 - sub-step for location
          totalSteps: 3,
          title: "Confirma tu ubicación",
          subtitle: "Ajusta el marcador si es necesario",
          onBack: handleMapBack,
          onNext: undefined,
          showNavButtons: false, // Map has its own buttons
          nextDisabled: false,
          nextLabel: "Confirmar",
          showHeader: false, // Map is full-screen
        };
      case "step2":
        return {
          step: 2,
          totalSteps: 3,
          title: "¿Cuánta agua?",
          subtitle: "Elige la cantidad",
          onBack: handleStep2Back,
          onNext: handleStep2HeaderNext,
          showNavButtons: true,
          nextDisabled: !step2Valid,
          nextLabel: "Siguiente",
          showHeader: true,
        };
      case "step3":
      case "submitting":
        return {
          step: 3,
          totalSteps: 3,
          title: "Revisa tu pedido",
          subtitle: "Confirma que todo esté bien",
          onBack: handleStep3Back,
          onNext: handleStep3HeaderSubmit,
          showNavButtons: true,
          nextDisabled: state === "submitting",
          nextLabel: "Confirmar",
          nextVariant: "success" as const,
          showHeader: true,
        };
      default:
        return {
          step: 1,
          totalSteps: 3,
          title: "Pedir Agua",
          subtitle: "Tus datos y dirección",
          onBack: undefined,
          onNext: undefined,
          showNavButtons: false,
          nextDisabled: false,
          nextLabel: "Continuar",
          showHeader: true,
        };
    }
  };

  const stepInfo = getStepInfo();

  // Map step is full-screen without header - Story 12-1
  // BUG-001 FIX: Use h-dvh (explicit height) instead of min-h-dvh (min height)
  // Leaflet requires explicit container height for tile rendering
  // min-height doesn't provide a computed height for h-full children in all browsers
  if (state === "map") {
    return (
      <div className="h-dvh bg-gray-50 flex flex-col" data-testid="map-step">
        <LocationPinpointWrapper
          address={wizardData.step1?.address || ""}
          initialLatitude={wizardData.step1?.latitude}
          initialLongitude={wizardData.step1?.longitude}
          onConfirm={handleMapConfirm}
          onBack={handleMapBack}
          onSkip={handleMapSkip}
        />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-gray-50 flex flex-col">
      {/* Header with progress */}
      <RequestHeader
        title={stepInfo.title}
        subtitle={stepInfo.subtitle}
        step={stepInfo.step}
        totalSteps={stepInfo.totalSteps}
        onBack={stepInfo.onBack}
        onNext={stepInfo.onNext}
        backHref="/"
        showNavButtons={stepInfo.showNavButtons}
        nextDisabled={stepInfo.nextDisabled}
        nextLabel={stepInfo.nextLabel}
        nextVariant={stepInfo.nextVariant}
      />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 bg-gray-50">
        {/* Step 1: Contact + Location */}
        {state === "step1" && (
          <RequestStep1Details
            initialData={wizardData.step1 ?? {
              name: profileData.name,
              phone: profileData.phone,
              email: profileData.email,
              comunaId: profileData.comunaId,
              address: profileData.address,
              specialInstructions: profileData.specialInstructions,
              latitude: profileData.latitude,
              longitude: profileData.longitude,
            }}
            onNext={handleStep1Next}
            onOpenMap={handleOpenMap}
          />
        )}

        {/* Step 2: Amount */}
        {state === "step2" && (
          <RequestStep3Amount
            ref={step2Ref}
            initialData={wizardData.step2}
            onNext={handleStep2Next}
            onBack={handleStep2Back}
            onValidChange={handleStep2ValidChange}
            urgencySurchargePercent={urgencySurcharge}
          />
        )}

        {/* Step 3: Review */}
        {(state === "step3" || state === "submitting") && (
          <RequestReview
            data={buildFormData()!}
            onEditContact={handleEditContact}
            onEditAmount={handleEditAmount}
            onSubmit={handleSubmit}
            loading={state === "submitting"}
            urgencySurchargePercent={urgencySurcharge}
          />
        )}
      </div>
    </div>
  );
}
