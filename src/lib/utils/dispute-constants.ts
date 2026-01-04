/**
 * Shared constants for dispute-related functionality
 * Used by admin dispute pages and server actions
 */

// Dispute type labels in Spanish
export const DISPUTE_TYPE_LABELS: Record<string, string> = {
  not_delivered: "No recibí mi pedido",
  wrong_quantity: "Cantidad incorrecta",
  late_delivery: "Llegó tarde",
  quality_issue: "Mala calidad",
  other: "Otro problema",
};

// Status configuration for badges
export const DISPUTE_STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  open: { label: "Abierta", color: "text-red-700", bgColor: "bg-red-100" },
  under_review: { label: "En Revisión", color: "text-amber-700", bgColor: "bg-amber-100" },
  resolved_consumer: {
    label: "Resuelta (Consumidor)",
    color: "text-green-700",
    bgColor: "bg-green-100",
  },
  resolved_provider: {
    label: "Resuelta (Proveedor)",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
  },
  closed: { label: "Cerrada", color: "text-gray-700", bgColor: "bg-gray-100" },
};

// Valid resolution types
export type ResolutionType = "resolved_consumer" | "resolved_provider";

// Statuses that can be resolved
export const RESOLVABLE_STATUSES = ["open", "under_review"] as const;

/**
 * Format a Chilean phone number for WhatsApp URL
 * Handles various formats: +56912345678, 56912345678, 912345678
 */
export function formatPhoneForWhatsApp(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "");

  // If it starts with 56, use as-is; otherwise prepend 56
  if (digits.startsWith("56")) {
    return digits;
  }

  // Assume Chilean number, prepend country code
  return `56${digits}`;
}
