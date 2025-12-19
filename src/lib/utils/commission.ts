/**
 * Commission calculation utilities for provider earnings
 * AC: 8.2.2, 8.2.3 - Calculate commission and earnings from platform settings
 */

/**
 * Calculate commission amount from total price
 * @param amount - Total price in CLP
 * @param commissionPercent - Commission percentage (e.g., 15 for 15%)
 * @returns Commission amount in CLP
 */
export function calculateCommission(amount: number, commissionPercent: number): number {
  return Math.round(amount * (commissionPercent / 100));
}

/**
 * Calculate provider earnings after commission deduction
 * @param amount - Total price in CLP
 * @param commissionPercent - Commission percentage (e.g., 15 for 15%)
 * @returns Net earnings in CLP
 */
export function calculateEarnings(amount: number, commissionPercent: number): number {
  const commission = calculateCommission(amount, commissionPercent);
  return amount - commission;
}

/**
 * Format currency in Chilean Peso format
 * @param amount - Amount in CLP
 * @returns Formatted string (e.g., "$5.000")
 */
export function formatCLP(amount: number): string {
  return `$${amount.toLocaleString("es-CL")}`;
}

/**
 * Format amount in thousands for display
 * @param liters - Amount in liters
 * @returns Formatted string (e.g., "5.000 litros" or "5 mil litros")
 */
export function formatLiters(liters: number): string {
  if (liters >= 1000) {
    return `${(liters / 1000).toLocaleString("es-CL")} mil litros`;
  }
  return `${liters.toLocaleString("es-CL")} litros`;
}

/**
 * Get price in CLP for a water delivery based on amount in liters
 * Single source of truth for delivery pricing
 *
 * Price tiers:
 * - Up to 100L: $5,000 CLP
 * - Up to 1,000L: $20,000 CLP
 * - Up to 5,000L: $75,000 CLP
 * - Over 5,000L: $140,000 CLP
 *
 * @param amountLiters - Amount in liters
 * @returns Price in CLP (integer, no decimals)
 */
export function getDeliveryPrice(amountLiters: number): number {
  if (amountLiters <= 100) return 5000;
  if (amountLiters <= 1000) return 20000;
  if (amountLiters <= 5000) return 75000;
  return 140000;
}

/**
 * Calculate and format earnings preview for offer form
 * AC: 8.2.3 - "Ganarás: $XX,XXX (después de X% comisión)"
 */
export function formatEarningsPreview(price: number, commissionPercent: number): {
  earnings: number;
  commission: number;
  formattedEarnings: string;
  formattedCommission: string;
  message: string;
} {
  const commission = calculateCommission(price, commissionPercent);
  const earnings = calculateEarnings(price, commissionPercent);

  return {
    earnings,
    commission,
    formattedEarnings: formatCLP(earnings),
    formattedCommission: formatCLP(commission),
    message: `Ganarás: ${formatCLP(earnings)} (después de ${commissionPercent}% comisión)`,
  };
}
