import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * Unit tests for offer validation
 * Story 8-2 Task 7: Unit tests for delivery window validation
 */

// Test delivery window validation logic (extracted from offer-form.tsx)
function validateDeliveryWindow(
  deliveryStart: string,
  deliveryEnd: string,
  now: Date = new Date()
): string | null {
  const start = new Date(deliveryStart);
  const end = new Date(deliveryEnd);

  if (start <= now) {
    return "La hora de inicio debe ser en el futuro";
  }
  if (end <= start) {
    return "La hora de fin debe ser después de la hora de inicio";
  }
  return null;
}

describe("validateDeliveryWindow", () => {
  const fixedNow = new Date("2025-12-16T12:00:00Z");

  describe("start time validation", () => {
    it("rejects start time in the past", () => {
      const pastStart = "2025-12-16T11:00:00Z"; // 1 hour before now
      const futureEnd = "2025-12-16T14:00:00Z";

      const error = validateDeliveryWindow(pastStart, futureEnd, fixedNow);
      expect(error).toBe("La hora de inicio debe ser en el futuro");
    });

    it("rejects start time equal to current time", () => {
      const sameAsNow = "2025-12-16T12:00:00Z";
      const futureEnd = "2025-12-16T14:00:00Z";

      const error = validateDeliveryWindow(sameAsNow, futureEnd, fixedNow);
      expect(error).toBe("La hora de inicio debe ser en el futuro");
    });

    it("accepts start time in the future", () => {
      const futureStart = "2025-12-16T13:00:00Z"; // 1 hour after now
      const futureEnd = "2025-12-16T15:00:00Z";

      const error = validateDeliveryWindow(futureStart, futureEnd, fixedNow);
      expect(error).toBeNull();
    });
  });

  describe("end time validation", () => {
    it("rejects end time before start time", () => {
      const futureStart = "2025-12-16T14:00:00Z";
      const endBeforeStart = "2025-12-16T13:00:00Z";

      const error = validateDeliveryWindow(futureStart, endBeforeStart, fixedNow);
      expect(error).toBe("La hora de fin debe ser después de la hora de inicio");
    });

    it("rejects end time equal to start time", () => {
      const futureStart = "2025-12-16T14:00:00Z";
      const sameAsStart = "2025-12-16T14:00:00Z";

      const error = validateDeliveryWindow(futureStart, sameAsStart, fixedNow);
      expect(error).toBe("La hora de fin debe ser después de la hora de inicio");
    });

    it("accepts end time after start time", () => {
      const futureStart = "2025-12-16T14:00:00Z";
      const validEnd = "2025-12-16T16:00:00Z";

      const error = validateDeliveryWindow(futureStart, validEnd, fixedNow);
      expect(error).toBeNull();
    });
  });

  describe("typical use cases", () => {
    it("validates a 2-hour delivery window", () => {
      const start = "2025-12-16T13:00:00Z";
      const end = "2025-12-16T15:00:00Z";

      const error = validateDeliveryWindow(start, end, fixedNow);
      expect(error).toBeNull();
    });

    it("validates a 30-minute delivery window", () => {
      const start = "2025-12-16T13:00:00Z";
      const end = "2025-12-16T13:30:00Z";

      const error = validateDeliveryWindow(start, end, fixedNow);
      expect(error).toBeNull();
    });

    it("validates next-day delivery window", () => {
      const start = "2025-12-17T09:00:00Z";
      const end = "2025-12-17T11:00:00Z";

      const error = validateDeliveryWindow(start, end, fixedNow);
      expect(error).toBeNull();
    });
  });

  describe("edge cases", () => {
    it("handles 1 minute in the future", () => {
      const oneMinuteLater = new Date(fixedNow.getTime() + 60000).toISOString();
      const endTime = new Date(fixedNow.getTime() + 120 * 60000).toISOString();

      const error = validateDeliveryWindow(oneMinuteLater, endTime, fixedNow);
      expect(error).toBeNull();
    });

    it("handles very long delivery windows", () => {
      const start = "2025-12-16T13:00:00Z";
      const end = "2025-12-16T23:00:00Z"; // 10 hours

      const error = validateDeliveryWindow(start, end, fixedNow);
      expect(error).toBeNull();
    });
  });
});

describe("Message field validation", () => {
  const MAX_MESSAGE_LENGTH = 500;

  function validateMessage(message: string): string | null {
    if (message.length > MAX_MESSAGE_LENGTH) {
      return `El mensaje no puede exceder ${MAX_MESSAGE_LENGTH} caracteres`;
    }
    return null;
  }

  it("accepts empty message", () => {
    expect(validateMessage("")).toBeNull();
  });

  it("accepts message within limit", () => {
    const shortMessage = "Tengo disponibilidad inmediata";
    expect(validateMessage(shortMessage)).toBeNull();
  });

  it("accepts message at exactly 500 characters", () => {
    const exactMessage = "a".repeat(500);
    expect(validateMessage(exactMessage)).toBeNull();
  });

  it("rejects message over 500 characters", () => {
    const longMessage = "a".repeat(501);
    expect(validateMessage(longMessage)).toBe("El mensaje no puede exceder 500 caracteres");
  });
});

describe("Offer withdrawal validation - Story 8-4", () => {
  /**
   * Tests for offer withdrawal validation logic
   * AC8.4.2: Only active offers can be cancelled
   */

  type OfferStatus = "active" | "accepted" | "expired" | "cancelled" | "request_filled";

  interface Offer {
    id: string;
    provider_id: string;
    status: OfferStatus;
  }

  function validateWithdrawal(
    offer: Offer | null,
    userId: string
  ): { success: boolean; error?: string } {
    if (!offer) {
      return { success: false, error: "Oferta no encontrada" };
    }

    if (offer.provider_id !== userId) {
      return { success: false, error: "No tienes permiso para cancelar esta oferta" };
    }

    if (offer.status !== "active") {
      return { success: false, error: "Solo puedes cancelar ofertas pendientes" };
    }

    return { success: true };
  }

  describe("offer existence", () => {
    it("rejects null offer", () => {
      const result = validateWithdrawal(null, "user-123");
      expect(result.success).toBe(false);
      expect(result.error).toBe("Oferta no encontrada");
    });
  });

  describe("ownership validation", () => {
    it("rejects withdrawal by non-owner", () => {
      const offer: Offer = {
        id: "offer-123",
        provider_id: "provider-456",
        status: "active",
      };

      const result = validateWithdrawal(offer, "different-user-789");
      expect(result.success).toBe(false);
      expect(result.error).toBe("No tienes permiso para cancelar esta oferta");
    });

    it("allows withdrawal by owner", () => {
      const offer: Offer = {
        id: "offer-123",
        provider_id: "provider-456",
        status: "active",
      };

      const result = validateWithdrawal(offer, "provider-456");
      expect(result.success).toBe(true);
    });
  });

  describe("status validation", () => {
    it("allows cancellation of active offers", () => {
      const offer: Offer = {
        id: "offer-123",
        provider_id: "user-123",
        status: "active",
      };

      const result = validateWithdrawal(offer, "user-123");
      expect(result.success).toBe(true);
    });

    it("rejects cancellation of accepted offers", () => {
      const offer: Offer = {
        id: "offer-123",
        provider_id: "user-123",
        status: "accepted",
      };

      const result = validateWithdrawal(offer, "user-123");
      expect(result.success).toBe(false);
      expect(result.error).toBe("Solo puedes cancelar ofertas pendientes");
    });

    it("rejects cancellation of expired offers", () => {
      const offer: Offer = {
        id: "offer-123",
        provider_id: "user-123",
        status: "expired",
      };

      const result = validateWithdrawal(offer, "user-123");
      expect(result.success).toBe(false);
      expect(result.error).toBe("Solo puedes cancelar ofertas pendientes");
    });

    it("rejects cancellation of already cancelled offers", () => {
      const offer: Offer = {
        id: "offer-123",
        provider_id: "user-123",
        status: "cancelled",
      };

      const result = validateWithdrawal(offer, "user-123");
      expect(result.success).toBe(false);
      expect(result.error).toBe("Solo puedes cancelar ofertas pendientes");
    });

    it("rejects cancellation of request_filled offers", () => {
      const offer: Offer = {
        id: "offer-123",
        provider_id: "user-123",
        status: "request_filled",
      };

      const result = validateWithdrawal(offer, "user-123");
      expect(result.success).toBe(false);
      expect(result.error).toBe("Solo puedes cancelar ofertas pendientes");
    });
  });
});

describe("Offer expiration calculation", () => {
  it("calculates expires_at correctly", () => {
    const now = new Date("2025-12-16T12:00:00Z");
    const validityMinutes = 30;

    const expiresAt = new Date(now.getTime() + validityMinutes * 60 * 1000);

    expect(expiresAt.toISOString()).toBe("2025-12-16T12:30:00.000Z");
  });

  it("handles different validity periods", () => {
    const now = new Date("2025-12-16T12:00:00Z");

    // 15 minutes
    const expires15 = new Date(now.getTime() + 15 * 60 * 1000);
    expect(expires15.toISOString()).toBe("2025-12-16T12:15:00.000Z");

    // 120 minutes (2 hours)
    const expires120 = new Date(now.getTime() + 120 * 60 * 1000);
    expect(expires120.toISOString()).toBe("2025-12-16T14:00:00.000Z");
  });
});
