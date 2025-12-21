"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { RequestHeader } from "@/components/consumer/request-header";
import { RequestStep1Details, type Step1Data } from "@/components/consumer/request-step1-details";
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

/**
 * Request flow states (3-step wizard):
 * - loading: Loading user profile data
 * - step1: Contact + Location info (name, phone, email, comuna, address, instructions)
 * - step2: Amount (water quantity, urgency)
 * - step3: Review screen - verify all info before submission
 * - submitting: Request is being submitted to the server
 * - submitted: Request has been successfully submitted
 */
type RequestState = "loading" | "step1" | "step2" | "step3" | "submitting" | "submitted";

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
  const step2Ref = useRef<Step3Ref>(null);

  // Load user profile on mount
  useEffect(() => {
    async function loadProfile() {
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

    loadProfile();
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
    };
  };

  // Step 1 handlers
  const handleStep1Next = (data: Step1Data) => {
    setWizardData(prev => ({ ...prev, step1: data }));
    setState("step2");
  };

  // Step 2 handlers
  const handleStep2Next = (data: Step3Data) => {
    setWizardData(prev => ({ ...prev, step2: data }));
    setState("step3");
  };

  const handleStep2Back = () => {
    setState("step1");
  };

  // Handle step 2 "Siguiente" click from header
  const handleStep2HeaderNext = useCallback(() => {
    step2Ref.current?.submit();
  }, []);

  // Handle step 3 "Confirmar" click from header
  const handleStep3HeaderSubmit = useCallback(() => {
    handleSubmit();
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

  // Loading state
  if (state === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0077B6]" />
      </div>
    );
  }

  // Get step info based on state
  const getStepInfo = () => {
    switch (state) {
      case "step1":
        return {
          step: 1,
          title: "Pedir Agua",
          subtitle: "Tus datos y dirección",
          onBack: undefined,
          onNext: undefined,
          showNavButtons: false,
          nextDisabled: false,
          nextLabel: "Continuar",
        };
      case "step2":
        return {
          step: 2,
          title: "¿Cuánta agua?",
          subtitle: "Elige la cantidad",
          onBack: handleStep2Back,
          onNext: handleStep2HeaderNext,
          showNavButtons: true,
          nextDisabled: !step2Valid,
          nextLabel: "Siguiente",
        };
      case "step3":
      case "submitting":
        return {
          step: 3,
          title: "Revisa tu pedido",
          subtitle: "Confirma que todo esté bien",
          onBack: handleStep3Back,
          onNext: handleStep3HeaderSubmit,
          showNavButtons: true,
          nextDisabled: state === "submitting",
          nextLabel: "Confirmar",
          nextVariant: "success" as const,
        };
      default:
        return {
          step: 1,
          title: "Pedir Agua",
          subtitle: "Tus datos y dirección",
          onBack: undefined,
          onNext: undefined,
          showNavButtons: false,
          nextDisabled: false,
          nextLabel: "Continuar",
        };
    }
  };

  const stepInfo = getStepInfo();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header with progress */}
      <RequestHeader
        title={stepInfo.title}
        subtitle={stepInfo.subtitle}
        step={stepInfo.step}
        totalSteps={3}
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
            }}
            onNext={handleStep1Next}
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
          />
        )}
      </div>
    </div>
  );
}
