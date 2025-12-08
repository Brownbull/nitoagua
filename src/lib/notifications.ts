import { toast } from "sonner";

/**
 * Display toast notification when request status changes
 *
 * Only used for registered consumers (in-app notifications).
 * Guests receive email notifications instead (Story 5-2).
 *
 * @param newStatus - The new status of the request
 * @param deliveryWindow - Optional delivery window (for accepted status)
 */
export function notifyStatusChange(
  newStatus: string,
  deliveryWindow?: string | null
): void {
  switch (newStatus) {
    case "accepted":
      toast.success("Tu solicitud fue aceptada", {
        description: deliveryWindow
          ? `Entrega estimada: ${deliveryWindow}`
          : "El aguatero te contactara pronto",
        duration: 5000,
      });
      break;

    case "delivered":
      toast.success("Entrega completada", {
        description: "Disfruta tu agua!",
        duration: 5000,
      });
      break;

    case "cancelled":
      toast.info("Solicitud cancelada", {
        description: "Tu solicitud ha sido cancelada",
        duration: 5000,
      });
      break;

    default:
      // No notification for other status changes
      break;
  }
}
