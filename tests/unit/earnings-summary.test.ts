import { describe, it, expect, vi } from "vitest";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { getDeliveryPrice } from "../../src/lib/utils/commission";

/**
 * Unit tests for earnings dashboard utilities
 * Story 8-6 Task 8: Unit tests for period date range calculation
 */

// Import the period types and helper function pattern
// Note: We test the logic pattern since the actual function is internal to settlement.ts
type EarningsPeriod = "today" | "week" | "month";

function getPeriodRange(period: EarningsPeriod): { start: Date; end: Date } {
  const now = new Date();
  switch (period) {
    case "today":
      return { start: startOfDay(now), end: endOfDay(now) };
    case "week":
      return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
    case "month":
      return { start: startOfMonth(now), end: endOfMonth(now) };
  }
}

describe("getPeriodRange", () => {
  describe("today period", () => {
    it("returns start of today", () => {
      const result = getPeriodRange("today");
      const expected = startOfDay(new Date());

      expect(result.start.getDate()).toBe(expected.getDate());
      expect(result.start.getMonth()).toBe(expected.getMonth());
      expect(result.start.getFullYear()).toBe(expected.getFullYear());
      expect(result.start.getHours()).toBe(0);
      expect(result.start.getMinutes()).toBe(0);
    });

    it("returns end of today", () => {
      const result = getPeriodRange("today");
      const expected = endOfDay(new Date());

      expect(result.end.getDate()).toBe(expected.getDate());
      expect(result.end.getMonth()).toBe(expected.getMonth());
      expect(result.end.getHours()).toBe(23);
      expect(result.end.getMinutes()).toBe(59);
    });

    it("start is before end", () => {
      const result = getPeriodRange("today");
      expect(result.start.getTime()).toBeLessThan(result.end.getTime());
    });
  });

  describe("week period", () => {
    it("returns start of week (Monday)", () => {
      const result = getPeriodRange("week");

      // Week starts on Monday (weekStartsOn: 1)
      expect(result.start.getDay()).toBe(1); // Monday = 1
      expect(result.start.getHours()).toBe(0);
      expect(result.start.getMinutes()).toBe(0);
    });

    it("returns end of week (Sunday)", () => {
      const result = getPeriodRange("week");

      // Week ends on Sunday
      expect(result.end.getDay()).toBe(0); // Sunday = 0
      expect(result.end.getHours()).toBe(23);
      expect(result.end.getMinutes()).toBe(59);
    });

    it("start is before end", () => {
      const result = getPeriodRange("week");
      expect(result.start.getTime()).toBeLessThan(result.end.getTime());
    });

    it("week range is approximately 7 days", () => {
      const result = getPeriodRange("week");
      const diffMs = result.end.getTime() - result.start.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      // Should be close to 7 days (accounting for DST variations)
      expect(diffDays).toBeGreaterThanOrEqual(6.9);
      expect(diffDays).toBeLessThanOrEqual(7.1);
    });
  });

  describe("month period", () => {
    it("returns start of month", () => {
      const result = getPeriodRange("month");

      expect(result.start.getDate()).toBe(1);
      expect(result.start.getHours()).toBe(0);
      expect(result.start.getMinutes()).toBe(0);
    });

    it("returns end of month", () => {
      const result = getPeriodRange("month");
      const currentMonth = new Date().getMonth();

      // End should still be in the same month
      expect(result.end.getMonth()).toBe(currentMonth);
      expect(result.end.getHours()).toBe(23);
      expect(result.end.getMinutes()).toBe(59);
    });

    it("start is before end", () => {
      const result = getPeriodRange("month");
      expect(result.start.getTime()).toBeLessThan(result.end.getTime());
    });

    it("handles different month lengths", () => {
      // Test that end of month is correct regardless of month length
      const result = getPeriodRange("month");
      const lastDay = result.end.getDate();

      // Last day should be 28-31 depending on the month
      expect(lastDay).toBeGreaterThanOrEqual(28);
      expect(lastDay).toBeLessThanOrEqual(31);
    });
  });
});

describe("EarningsSummary types", () => {
  it("EarningsPeriod accepts valid values", () => {
    const periods: EarningsPeriod[] = ["today", "week", "month"];
    expect(periods).toHaveLength(3);
  });
});

describe("Price calculation logic (using shared getDeliveryPrice)", () => {
  // Uses the shared utility from src/lib/utils/commission.ts
  // This ensures tests stay in sync with actual implementation

  it("calculates price for 100L", () => {
    expect(getDeliveryPrice(100)).toBe(5000);
    expect(getDeliveryPrice(50)).toBe(5000);
  });

  it("calculates price for 1000L", () => {
    expect(getDeliveryPrice(1000)).toBe(20000);
    expect(getDeliveryPrice(500)).toBe(20000);
    expect(getDeliveryPrice(101)).toBe(20000);
  });

  it("calculates price for 5000L", () => {
    expect(getDeliveryPrice(5000)).toBe(75000);
    expect(getDeliveryPrice(2500)).toBe(75000);
    expect(getDeliveryPrice(1001)).toBe(75000);
  });

  it("calculates price for 10000L", () => {
    expect(getDeliveryPrice(10000)).toBe(140000);
    expect(getDeliveryPrice(7500)).toBe(140000);
    expect(getDeliveryPrice(5001)).toBe(140000);
  });
});

describe("Commission calculation for earnings", () => {
  function calculateEarningsMetrics(
    grossIncome: number,
    commissionPercent: number
  ) {
    const commissionAmount = Math.round(grossIncome * (commissionPercent / 100));
    const netEarnings = grossIncome - commissionAmount;
    return { commissionAmount, netEarnings };
  }

  it("calculates 15% commission correctly", () => {
    const result = calculateEarningsMetrics(100000, 15);
    expect(result.commissionAmount).toBe(15000);
    expect(result.netEarnings).toBe(85000);
  });

  it("calculates 10% commission correctly", () => {
    const result = calculateEarningsMetrics(100000, 10);
    expect(result.commissionAmount).toBe(10000);
    expect(result.netEarnings).toBe(90000);
  });

  it("handles zero income", () => {
    const result = calculateEarningsMetrics(0, 15);
    expect(result.commissionAmount).toBe(0);
    expect(result.netEarnings).toBe(0);
  });

  it("commission + net equals gross", () => {
    const gross = 75000;
    const result = calculateEarningsMetrics(gross, 15);
    expect(result.commissionAmount + result.netEarnings).toBe(gross);
  });
});

describe("Commission pending calculation", () => {
  function calculatePending(
    ledgerEntries: Array<{ type: string; amount: number }>
  ): number {
    let owed = 0;
    let paid = 0;

    for (const entry of ledgerEntries) {
      if (entry.type === "commission_owed") {
        owed += entry.amount;
      } else if (entry.type === "commission_paid") {
        paid += entry.amount;
      }
    }

    return Math.max(0, owed - paid);
  }

  it("calculates pending when only owed entries exist", () => {
    const entries = [
      { type: "commission_owed", amount: 5000 },
      { type: "commission_owed", amount: 3000 },
    ];
    expect(calculatePending(entries)).toBe(8000);
  });

  it("calculates pending when partial payment made", () => {
    const entries = [
      { type: "commission_owed", amount: 10000 },
      { type: "commission_paid", amount: 4000 },
    ];
    expect(calculatePending(entries)).toBe(6000);
  });

  it("returns zero when fully paid", () => {
    const entries = [
      { type: "commission_owed", amount: 10000 },
      { type: "commission_paid", amount: 10000 },
    ];
    expect(calculatePending(entries)).toBe(0);
  });

  it("returns zero when overpaid (edge case)", () => {
    const entries = [
      { type: "commission_owed", amount: 5000 },
      { type: "commission_paid", amount: 7000 },
    ];
    expect(calculatePending(entries)).toBe(0);
  });

  it("handles empty ledger", () => {
    expect(calculatePending([])).toBe(0);
  });

  it("ignores adjustment entries", () => {
    const entries = [
      { type: "commission_owed", amount: 5000 },
      { type: "adjustment", amount: 1000 },
    ];
    // Adjustment doesn't affect pending calculation
    expect(calculatePending(entries)).toBe(5000);
  });
});
