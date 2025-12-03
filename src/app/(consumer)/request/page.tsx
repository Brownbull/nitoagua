"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { RequestForm } from "@/components/consumer/request-form";
import { RequestReview } from "@/components/consumer/request-review";
import type { RequestInput } from "@/lib/validations/request";
import {
  queueRequest,
  isOnline,
  registerOnlineListener,
  processQueue,
} from "@/lib/utils/offline-queue";

/**
 * Request flow states:
 * - form: User is filling out the request form
 * - review: User is reviewing their request before submission
 * - submitting: Request is being submitted to the server
 * - submitted: Request has been successfully submitted
 */
type RequestState = "form" | "review" | "submitting" | "submitted";

export default function RequestPage() {
  const router = useRouter();
  const [state, setState] = useState<RequestState>("form");
  const [formData, setFormData] = useState<RequestInput | null>(null);

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

  // Handle form submission - transition to review state
  const handleFormSubmit = async (data: RequestInput) => {
    setFormData(data);
    setState("review");
  };

  // Handle edit - return to form with preserved data
  const handleEdit = () => {
    setState("form");
  };

  // Handle final submission
  const handleSubmit = async () => {
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
        setState("review");
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
        queueRequest(formData);
        toast.info("Solicitud guardada. Se enviará cuando tengas conexión.", {
          duration: 5000,
        });
        router.push("/");
      } else {
        setState("review");
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

  return (
    <div className="flex flex-col px-4 py-6">
      {/* Header with back navigation */}
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          asChild={state === "form"}
          onClick={state !== "form" ? handleEdit : undefined}
          className="min-h-[44px] min-w-[44px]"
          data-testid="back-button"
        >
          {state === "form" ? (
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Volver al inicio</span>
            </Link>
          ) : (
            <>
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Volver al formulario</span>
            </>
          )}
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {state === "form" ? "Solicitar Agua" : "Revisar Solicitud"}
        </h1>
      </div>

      {/* Form State */}
      {state === "form" && (
        <RequestForm
          onSubmit={handleFormSubmit}
          initialData={formData ?? undefined}
          loading={false}
        />
      )}

      {/* Review State */}
      {(state === "review" || state === "submitting") && formData && (
        <RequestReview
          data={formData}
          onEdit={handleEdit}
          onSubmit={handleSubmit}
          loading={state === "submitting"}
        />
      )}
    </div>
  );
}
