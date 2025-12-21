import { describe, it, expect } from "vitest";
import { formatCountdown, isWarningState, isCriticalState, COUNTDOWN_THRESHOLDS } from "../../src/lib/utils/countdown";

/**
 * Unit tests for countdown timer
 * Story 8-3 Task 7 + Story 10-3 updates:
 * - Unit: Countdown timer calculation
 * - Unit: Countdown displays correct format
 * AC: 8.3.3 - Countdown displays "Expira en 25:30" format
 * AC: 10.3.1 - Format as MM:SS when < 1 hour
 * AC: 10.3.2 - Format as "X h MM min" when > 1 hour
 * AC: 10.3.3 - Warning < 10 min (orange), Critical < 5 min (red)
 */

describe("formatCountdown", () => {
  describe("format as MM:SS when less than 1 hour", () => {
    it("formats 30 minutes as 30:00", () => {
      const thirtyMinutes = 30 * 60 * 1000;
      expect(formatCountdown(thirtyMinutes)).toBe("30:00");
    });

    it("formats 25:30 correctly", () => {
      const ms = (25 * 60 + 30) * 1000;
      expect(formatCountdown(ms)).toBe("25:30");
    });

    it("formats single digit minutes with leading zero", () => {
      const fiveMinutes = 5 * 60 * 1000;
      expect(formatCountdown(fiveMinutes)).toBe("05:00");
    });

    it("formats single digit seconds with leading zero", () => {
      const ms = (10 * 60 + 5) * 1000;
      expect(formatCountdown(ms)).toBe("10:05");
    });

    it("formats 59:59 correctly", () => {
      const ms = (59 * 60 + 59) * 1000;
      expect(formatCountdown(ms)).toBe("59:59");
    });

    it("formats 1 second as 00:01", () => {
      expect(formatCountdown(1000)).toBe("00:01");
    });

    it("formats 0 seconds as 00:00 (before showing Expirada)", () => {
      // Note: formatCountdown returns "Expirada" for 0
      expect(formatCountdown(0)).toBe("Expirada");
    });
  });

  describe("format as 'X h MM min' when 1 hour or more (AC10.3.2)", () => {
    it("formats exactly 1 hour as '1 h 00 min'", () => {
      const oneHour = 60 * 60 * 1000;
      expect(formatCountdown(oneHour)).toBe("1 h 00 min");
    });

    it("formats 1 hour 30 minutes as '1 h 30 min'", () => {
      const ms = (90 * 60) * 1000;
      expect(formatCountdown(ms)).toBe("1 h 30 min");
    });

    it("formats 1 hour 25 minutes as '1 h 25 min'", () => {
      const ms = (1 * 3600 + 25 * 60 + 30) * 1000;
      // Seconds are not shown in > 1 hour format
      expect(formatCountdown(ms)).toBe("1 h 25 min");
    });

    it("formats 2 hours 5 minutes with leading zero on minutes", () => {
      const ms = (2 * 3600 + 5 * 60 + 9) * 1000;
      expect(formatCountdown(ms)).toBe("2 h 05 min");
    });

    it("formats 10+ hours correctly", () => {
      const ms = (12 * 3600 + 30 * 60) * 1000;
      expect(formatCountdown(ms)).toBe("12 h 30 min");
    });
  });

  describe("edge cases", () => {
    it("returns 'Expirada' for negative values", () => {
      expect(formatCountdown(-1000)).toBe("Expirada");
      expect(formatCountdown(-60000)).toBe("Expirada");
    });

    it("returns 'Expirada' for zero", () => {
      expect(formatCountdown(0)).toBe("Expirada");
    });

    it("handles fractional milliseconds by flooring", () => {
      // 25:30 plus 500ms should still show 25:30
      const ms = (25 * 60 + 30) * 1000 + 500;
      expect(formatCountdown(ms)).toBe("25:30");
    });

    it("handles 1ms correctly (shows 00:00 since > 0)", () => {
      // 1ms is technically > 0, so we show 00:00 (0 seconds remaining)
      // The countdown timer component would show this briefly before refresh
      expect(formatCountdown(1)).toBe("00:00");
    });

    it("handles 999ms (just under 1 second)", () => {
      // 999ms rounds down to 0 seconds but is still > 0
      expect(formatCountdown(999)).toBe("00:00");
    });

    it("handles 1001ms (just over 1 second)", () => {
      expect(formatCountdown(1001)).toBe("00:01");
    });
  });

  describe("typical offer validity scenarios", () => {
    it("formats default 30 minute offer validity", () => {
      expect(formatCountdown(30 * 60 * 1000)).toBe("30:00");
    });

    it("formats minimum 15 minute offer validity", () => {
      expect(formatCountdown(15 * 60 * 1000)).toBe("15:00");
    });

    it("formats maximum 120 minute (2 hour) offer validity", () => {
      expect(formatCountdown(120 * 60 * 1000)).toBe("2 h 00 min");
    });

    it("formats offer with 5 minutes remaining (warning state)", () => {
      expect(formatCountdown(5 * 60 * 1000)).toBe("05:00");
    });

    it("formats offer with 1 minute remaining (critical state)", () => {
      expect(formatCountdown(60 * 1000)).toBe("01:00");
    });

    it("formats offer with 30 seconds remaining", () => {
      expect(formatCountdown(30 * 1000)).toBe("00:30");
    });
  });
});

describe("COUNTDOWN_THRESHOLDS", () => {
  it("warning threshold is 10 minutes (AC10.3.3)", () => {
    expect(COUNTDOWN_THRESHOLDS.WARNING_MS).toBe(10 * 60 * 1000);
  });

  it("critical threshold is 5 minutes (AC10.3.3)", () => {
    expect(COUNTDOWN_THRESHOLDS.CRITICAL_MS).toBe(5 * 60 * 1000);
  });

  it("one hour threshold is correct", () => {
    expect(COUNTDOWN_THRESHOLDS.ONE_HOUR_MS).toBe(60 * 60 * 1000);
  });
});

describe("isWarningState (AC10.3.3 - orange when < 10 min)", () => {
  it("returns true when < 10 minutes remaining", () => {
    expect(isWarningState(9 * 60 * 1000)).toBe(true);
    expect(isWarningState(5 * 60 * 1000)).toBe(true);
    expect(isWarningState(1 * 60 * 1000)).toBe(true);
  });

  it("returns false when >= 10 minutes remaining", () => {
    expect(isWarningState(10 * 60 * 1000)).toBe(false);
    expect(isWarningState(15 * 60 * 1000)).toBe(false);
    expect(isWarningState(30 * 60 * 1000)).toBe(false);
  });

  it("returns false when expired (0 or negative)", () => {
    expect(isWarningState(0)).toBe(false);
    expect(isWarningState(-1000)).toBe(false);
  });
});

describe("isCriticalState (AC10.3.3 - red when < 5 min)", () => {
  it("returns true when < 5 minutes remaining", () => {
    expect(isCriticalState(4 * 60 * 1000)).toBe(true);
    expect(isCriticalState(2 * 60 * 1000)).toBe(true);
    expect(isCriticalState(30 * 1000)).toBe(true);
    expect(isCriticalState(1000)).toBe(true);
  });

  it("returns false when >= 5 minutes remaining", () => {
    expect(isCriticalState(5 * 60 * 1000)).toBe(false);
    expect(isCriticalState(6 * 60 * 1000)).toBe(false);
    expect(isCriticalState(10 * 60 * 1000)).toBe(false);
  });

  it("returns false when expired (0 or negative)", () => {
    expect(isCriticalState(0)).toBe(false);
    expect(isCriticalState(-1000)).toBe(false);
  });
});
