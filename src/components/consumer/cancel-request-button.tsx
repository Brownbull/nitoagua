"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CancelDialog } from "@/components/consumer/cancel-dialog";
import { XCircle } from "lucide-react";
import { toast } from "sonner";

interface CancelRequestButtonProps {
  requestId: string;
  trackingToken?: string;
  variant?: "default" | "danger";
}

export function CancelRequestButton({
  requestId,
  trackingToken,
  variant = "default",
}: CancelRequestButtonProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleCancel() {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "cancel",
          ...(trackingToken && { trackingToken }),
        }),
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        const errorMessage =
          result.error?.message || "Error al cancelar la solicitud";
        toast.error(errorMessage);
        setIsDialogOpen(false);
        return;
      }

      toast.success("Solicitud cancelada exitosamente");
      setIsDialogOpen(false);
      router.refresh();
    } catch {
      toast.error("Error al cancelar la solicitud. Por favor intenta de nuevo.");
      setIsDialogOpen(false);
    } finally {
      setIsLoading(false);
    }
  }

  const buttonStyles = variant === "danger"
    ? "w-full border-[#FCA5A5] text-[#DC2626] hover:bg-red-50 rounded-xl py-3.5 text-sm font-semibold"
    : "w-full border-amber-300 text-amber-700 hover:bg-amber-100";

  return (
    <>
      <Button
        variant="outline"
        className={buttonStyles}
        onClick={() => setIsDialogOpen(true)}
      >
        <XCircle className="mr-2 h-4 w-4" />
        Cancelar Solicitud
      </Button>
      <CancelDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onConfirm={handleCancel}
        isLoading={isLoading}
      />
    </>
  );
}
