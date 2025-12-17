import { describe, it, expect } from "vitest";
import {
  calculateCommission,
  calculateEarnings,
  formatCLP,
  formatLiters,
  formatEarningsPreview,
} from "../../src/lib/utils/commission";

/**
 * Unit tests for commission calculation utilities
 * Story 8-2 Task 7: Unit tests for commission calculation
 */

describe("calculateCommission", () => {
  it("calculates 15% commission correctly", () => {
    expect(calculateCommission(10000, 15)).toBe(1500);
    expect(calculateCommission(20000, 15)).toBe(3000);
    expect(calculateCommission(75000, 15)).toBe(11250);
  });

  it("calculates 10% commission correctly", () => {
    expect(calculateCommission(10000, 10)).toBe(1000);
    expect(calculateCommission(50000, 10)).toBe(5000);
  });

  it("handles 0% commission", () => {
    expect(calculateCommission(10000, 0)).toBe(0);
  });

  it("handles 100% commission", () => {
    expect(calculateCommission(10000, 100)).toBe(10000);
  });

  it("rounds to nearest integer", () => {
    // 5000 * 15% = 750
    expect(calculateCommission(5000, 15)).toBe(750);
    // 5001 * 15% = 750.15 -> 750
    expect(calculateCommission(5001, 15)).toBe(750);
    // 5003 * 15% = 750.45 -> 750
    expect(calculateCommission(5003, 15)).toBe(750);
    // 5005 * 15% = 750.75 -> 751
    expect(calculateCommission(5005, 15)).toBe(751);
  });
});

describe("calculateEarnings", () => {
  it("calculates earnings after 15% commission", () => {
    expect(calculateEarnings(10000, 15)).toBe(8500);
    expect(calculateEarnings(20000, 15)).toBe(17000);
    expect(calculateEarnings(75000, 15)).toBe(63750);
  });

  it("calculates earnings after 10% commission", () => {
    expect(calculateEarnings(10000, 10)).toBe(9000);
    expect(calculateEarnings(50000, 10)).toBe(45000);
  });

  it("returns full amount with 0% commission", () => {
    expect(calculateEarnings(10000, 0)).toBe(10000);
  });

  it("returns 0 with 100% commission", () => {
    expect(calculateEarnings(10000, 100)).toBe(0);
  });

  it("earnings + commission = original amount", () => {
    const amount = 25000;
    const percent = 15;
    const commission = calculateCommission(amount, percent);
    const earnings = calculateEarnings(amount, percent);
    expect(commission + earnings).toBe(amount);
  });
});

describe("formatCLP", () => {
  it("formats amounts with peso sign and thousands separator", () => {
    expect(formatCLP(5000)).toMatch(/\$5[.,]?000/);
    expect(formatCLP(20000)).toMatch(/\$20[.,]?000/);
  });

  it("formats large amounts correctly", () => {
    expect(formatCLP(140000)).toMatch(/\$140[.,]?000/);
    expect(formatCLP(1000000)).toMatch(/\$1[.,]?000[.,]?000/);
  });

  it("formats zero", () => {
    expect(formatCLP(0)).toBe("$0");
  });
});

describe("formatLiters", () => {
  it("formats amounts under 1000 in liters", () => {
    expect(formatLiters(100)).toMatch(/100\s*litros/);
    expect(formatLiters(500)).toMatch(/500\s*litros/);
  });

  it("formats amounts >= 1000 in thousands", () => {
    expect(formatLiters(1000)).toMatch(/1\s*mil\s*litros/);
    expect(formatLiters(5000)).toMatch(/5\s*mil\s*litros/);
    expect(formatLiters(10000)).toMatch(/10\s*mil\s*litros/);
  });
});

describe("formatEarningsPreview", () => {
  it("returns correct earnings preview object", () => {
    const result = formatEarningsPreview(20000, 15);

    expect(result.earnings).toBe(17000);
    expect(result.commission).toBe(3000);
    expect(result.formattedEarnings).toMatch(/\$17[.,]?000/);
    expect(result.formattedCommission).toMatch(/\$3[.,]?000/);
    expect(result.message).toContain("Ganarás:");
    expect(result.message).toContain("15%");
    expect(result.message).toContain("comisión");
  });

  it("message format matches AC8.2.3", () => {
    const result = formatEarningsPreview(10000, 10);

    // AC8.2.3: "Ganarás: $XX,XXX (después de X% comisión)"
    expect(result.message).toMatch(/Ganarás:.*\$.*\(después de \d+% comisión\)/);
  });
});
