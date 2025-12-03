import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

/**
 * Format a date in Spanish for display
 * Output: "3 de diciembre, 2025 a las 14:30"
 */
export function formatDateSpanish(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;

  // Format: "3 de diciembre, 2025 a las 14:30"
  const day = format(d, "d", { locale: es });
  const month = format(d, "MMMM", { locale: es });
  const year = format(d, "yyyy", { locale: es });
  const time = format(d, "HH:mm", { locale: es });

  return `${day} de ${month}, ${year} a las ${time}`;
}

/**
 * Format a date as relative time in Spanish
 * Output: "hace 2 horas", "hace 1 día"
 */
export function formatTimeAgo(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: es });
}

/**
 * Format a short date in Spanish (for timeline)
 * Output: "3 dic, 14:30"
 */
export function formatShortDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "d MMM, HH:mm", { locale: es });
}

/**
 * Mask an address for privacy (show first 20 chars + "...")
 */
export function maskAddress(address: string): string {
  if (address.length <= 20) {
    return address;
  }
  return `${address.substring(0, 20)}...`;
}

/**
 * Format a phone number for display
 * Input: "+56912345678"
 * Output: "+56 9 1234 5678"
 */
export function formatPhone(phone: string): string {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, "");

  // Handle Chilean format: +56 9 XXXX XXXX
  if (cleaned.startsWith("+56") && cleaned.length === 12) {
    return `+56 ${cleaned.slice(3, 4)} ${cleaned.slice(4, 8)} ${cleaned.slice(8)}`;
  }

  // Handle without + prefix
  if (cleaned.startsWith("56") && cleaned.length === 11) {
    return `+56 ${cleaned.slice(2, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`;
  }

  // Return as-is if format doesn't match
  return phone;
}
