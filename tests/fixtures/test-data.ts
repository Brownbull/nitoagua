/**
 * Seeded Test Data Constants
 *
 * Fixed identifiers for seeded test data that can be referenced in E2E tests.
 * Run `npm run seed:test` to seed this data before running integration tests.
 *
 * IMPORTANT: These are deterministic values that the seeding script will use.
 * Tests can import these constants to reference seeded data directly.
 */

// =============================================================================
// USER PROFILES
// =============================================================================

export const TEST_SUPPLIER = {
  id: "11111111-1111-1111-1111-111111111111",
  email: "test-supplier@test.local",
  password: "TestSupplier123!",
  profile: {
    role: "supplier" as const,
    name: "Don Pedro (Test Supplier)",
    phone: "+56911111111",
    service_area: "villarrica",
    price_100l: 5000,
    price_1000l: 15000,
    price_5000l: 50000,
    price_10000l: 80000,
    is_available: true,
  },
};

export const TEST_CONSUMER = {
  id: "22222222-2222-2222-2222-222222222222",
  email: "test-consumer@test.local",
  password: "TestConsumer123!",
  profile: {
    role: "consumer" as const,
    name: "Doña María (Test Consumer)",
    phone: "+56922222222",
    address: "Calle Test 123, Villarrica",
    special_instructions: "Casa con reja verde",
  },
};

// =============================================================================
// WATER REQUESTS
// =============================================================================

/**
 * Request in PENDING state - waiting for supplier acceptance
 * Use for: cancel button tests, pending UI tests
 */
export const SEEDED_PENDING_REQUEST = {
  id: "33333333-3333-3333-3333-333333333333",
  tracking_token: "seed-token-pending",
  status: "pending",
  guest_phone: "+56933333333",
  guest_name: "Guest Pending",
  guest_email: "pending@test.local",
  address: "Avenida Pendiente 100, Villarrica, Chile",
  amount: 1000,
  special_instructions: "Pending request for testing",
  is_urgent: false,
  consumer_id: null, // Guest request
  supplier_id: null,
};

/**
 * Request owned by TEST_CONSUMER in PENDING state
 * Use for: authenticated user cancel tests, consumer request history
 */
export const SEEDED_CONSUMER_PENDING_REQUEST = {
  id: "33333333-3333-3333-3333-333333333334",
  tracking_token: "seed-token-consumer-pending",
  status: "pending",
  guest_phone: TEST_CONSUMER.profile.phone,
  guest_name: TEST_CONSUMER.profile.name,
  guest_email: TEST_CONSUMER.email,
  address: TEST_CONSUMER.profile.address || "Calle Consumidor 456",
  amount: 5000,
  special_instructions: "Consumer pending request",
  is_urgent: false,
  consumer_id: TEST_CONSUMER.id,
  supplier_id: null,
};

/**
 * Request in ACCEPTED state - supplier has accepted, awaiting delivery
 * Use for: accepted status UI tests, delivery window tests
 */
export const SEEDED_ACCEPTED_REQUEST = {
  id: "44444444-4444-4444-4444-444444444444",
  tracking_token: "seed-token-accepted",
  status: "accepted",
  guest_phone: "+56944444444",
  guest_name: "Guest Accepted",
  guest_email: "accepted@test.local",
  address: "Calle Aceptada 200, Villarrica, Chile",
  amount: 1000,
  special_instructions: "Accepted request for testing",
  is_urgent: false,
  consumer_id: null,
  supplier_id: TEST_SUPPLIER.id,
  delivery_window: "14:00 - 16:00",
  accepted_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
};

/**
 * Request in DELIVERED state - completed successfully
 * Use for: delivered status UI tests, completion message tests
 */
export const SEEDED_DELIVERED_REQUEST = {
  id: "55555555-5555-5555-5555-555555555555",
  tracking_token: "seed-token-delivered",
  status: "delivered",
  guest_phone: "+56955555555",
  guest_name: "Guest Delivered",
  guest_email: "delivered@test.local",
  address: "Calle Entregada 300, Villarrica, Chile",
  amount: 5000,
  special_instructions: "Delivered request for testing",
  is_urgent: false,
  consumer_id: null,
  supplier_id: TEST_SUPPLIER.id,
  delivery_window: "10:00 - 12:00",
  accepted_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  delivered_at: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(), // 22 hours ago
};

/**
 * Request owned by TEST_CONSUMER in DELIVERED state
 * Use for: consumer request history with completed request
 */
export const SEEDED_CONSUMER_DELIVERED_REQUEST = {
  id: "55555555-5555-5555-5555-555555555556",
  tracking_token: "seed-token-consumer-delivered",
  status: "delivered",
  guest_phone: TEST_CONSUMER.profile.phone,
  guest_name: TEST_CONSUMER.profile.name,
  guest_email: TEST_CONSUMER.email,
  address: TEST_CONSUMER.profile.address || "Calle Consumidor 456",
  amount: 10000,
  special_instructions: "Consumer delivered request",
  is_urgent: false,
  consumer_id: TEST_CONSUMER.id,
  supplier_id: TEST_SUPPLIER.id,
  delivery_window: "09:00 - 11:00",
  accepted_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2 days ago
  delivered_at: new Date(Date.now() - 46 * 60 * 60 * 1000).toISOString(), // 46 hours ago
};

/**
 * Request in CANCELLED state (cancelled by user)
 * Use for: cancelled status UI tests, "Nueva Solicitud" button tests
 * AC12.3.2: Cancelled by User State
 */
export const SEEDED_CANCELLED_REQUEST = {
  id: "66666666-6666-6666-6666-666666666666",
  tracking_token: "seed-token-cancelled",
  status: "cancelled",
  guest_phone: "+56966666666",
  guest_name: "Guest Cancelled",
  guest_email: "cancelled@test.local",
  address: "Calle Cancelada 400, Villarrica, Chile",
  amount: 100,
  special_instructions: "Cancelled request for testing",
  is_urgent: false,
  consumer_id: null,
  supplier_id: null,
  cancelled_by: null, // null means cancelled by consumer/guest
  cancellation_reason: null,
  cancelled_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
};

/**
 * Request in CANCELLED state (cancelled by provider)
 * Use for: provider cancellation UI tests (AC12.3.3)
 * Shows different messaging and styling than user cancellation
 */
export const SEEDED_CANCELLED_BY_PROVIDER_REQUEST = {
  id: "66666666-6666-6666-6666-666666666669",
  tracking_token: "seed-token-cancelled-by-provider",
  status: "cancelled",
  guest_phone: "+56966666669",
  guest_name: "Guest Cancelled By Provider",
  guest_email: "cancelled-by-provider@test.local",
  address: "Calle Cancelada Por Proveedor 450, Villarrica, Chile",
  amount: 5000,
  special_instructions: "Request that was cancelled by provider",
  is_urgent: false,
  consumer_id: null,
  supplier_id: TEST_SUPPLIER.id,
  cancelled_by: TEST_SUPPLIER.id, // Cancelled by provider
  cancellation_reason: "No tengo disponibilidad para esta zona en este momento",
  cancelled_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
};

/**
 * Request in NO_OFFERS state - timed out without offers (Story 10.4)
 * Use for: timeout notification UI tests, retry button tests
 * Note: no timed_out_at column in production - status alone indicates timeout
 */
export const SEEDED_NO_OFFERS_REQUEST = {
  id: "66666666-6666-6666-6666-666666666667",
  tracking_token: "seed-token-no-offers",
  status: "no_offers",
  guest_phone: "+56966666667",
  guest_name: "Guest No Offers",
  guest_email: "nooffers@test.local",
  address: "Calle Sin Ofertas 500, Villarrica, Chile",
  amount: 1000,
  special_instructions: "Request that timed out without offers",
  is_urgent: false,
  consumer_id: null,
  supplier_id: null,
};

/**
 * Request owned by TEST_CONSUMER in NO_OFFERS state (Story 11-13: C5-C7)
 * Use for: consumer history with timeout, retry with pre-fill, in-app notification tests
 */
export const SEEDED_CONSUMER_NO_OFFERS_REQUEST = {
  id: "66666666-6666-6666-6666-666666666668",
  tracking_token: "seed-token-consumer-no-offers",
  status: "no_offers",
  guest_phone: TEST_CONSUMER.profile.phone,
  guest_name: TEST_CONSUMER.profile.name,
  guest_email: TEST_CONSUMER.email,
  address: TEST_CONSUMER.profile.address || "Calle Consumidor 456",
  amount: 5000,
  special_instructions: "Consumer request that timed out",
  is_urgent: false,
  consumer_id: TEST_CONSUMER.id,
  supplier_id: null,
};

// =============================================================================
// CONVENIENCE EXPORTS FOR TESTS
// =============================================================================

/**
 * All tracking tokens mapped by status for easy test reference
 */
export const TRACKING_TOKENS = {
  pending: SEEDED_PENDING_REQUEST.tracking_token,
  consumerPending: SEEDED_CONSUMER_PENDING_REQUEST.tracking_token,
  accepted: SEEDED_ACCEPTED_REQUEST.tracking_token,
  delivered: SEEDED_DELIVERED_REQUEST.tracking_token,
  consumerDelivered: SEEDED_CONSUMER_DELIVERED_REQUEST.tracking_token,
  cancelled: SEEDED_CANCELLED_REQUEST.tracking_token,
  cancelledByProvider: SEEDED_CANCELLED_BY_PROVIDER_REQUEST.tracking_token,
  noOffers: SEEDED_NO_OFFERS_REQUEST.tracking_token,
  consumerNoOffers: SEEDED_CONSUMER_NO_OFFERS_REQUEST.tracking_token,
} as const;

/**
 * All request IDs mapped by status for easy test reference
 */
export const REQUEST_IDS = {
  pending: SEEDED_PENDING_REQUEST.id,
  consumerPending: SEEDED_CONSUMER_PENDING_REQUEST.id,
  accepted: SEEDED_ACCEPTED_REQUEST.id,
  delivered: SEEDED_DELIVERED_REQUEST.id,
  consumerDelivered: SEEDED_CONSUMER_DELIVERED_REQUEST.id,
  cancelled: SEEDED_CANCELLED_REQUEST.id,
  cancelledByProvider: SEEDED_CANCELLED_BY_PROVIDER_REQUEST.id,
  noOffers: SEEDED_NO_OFFERS_REQUEST.id,
  consumerNoOffers: SEEDED_CONSUMER_NO_OFFERS_REQUEST.id,
} as const;

/**
 * All seeded requests as an array for bulk operations
 */
export const ALL_SEEDED_REQUESTS = [
  SEEDED_PENDING_REQUEST,
  SEEDED_CONSUMER_PENDING_REQUEST,
  SEEDED_ACCEPTED_REQUEST,
  SEEDED_DELIVERED_REQUEST,
  SEEDED_CONSUMER_DELIVERED_REQUEST,
  SEEDED_CANCELLED_REQUEST,
  SEEDED_CANCELLED_BY_PROVIDER_REQUEST,
  SEEDED_NO_OFFERS_REQUEST,
  SEEDED_CONSUMER_NO_OFFERS_REQUEST,
];

/**
 * All seeded profiles as an array
 */
export const ALL_SEEDED_PROFILES = [TEST_SUPPLIER, TEST_CONSUMER];

// =============================================================================
// OFFER TEST DATA (run `npm run seed:offers` to seed)
// =============================================================================

/**
 * Offer test data constants for E2E testing of Stories 8-3, 8-4
 * These match the data seeded by scripts/local/seed-offer-tests.ts
 */
export const OFFER_TEST_DATA = {
  /**
   * Requests created for offer testing
   */
  requests: {
    pendingWithActiveOffer: {
      id: "77777777-7777-7777-7777-777777777771",
      tracking_token: "offer-test-pending-1",
      status: "pending" as const,
      guest_name: "Cliente Pendiente 1",
      comuna_id: "villarrica", // Matches seed-offer-tests.ts (Araucanía region - target market)
      amount: 1000,
    },
    pendingWithActiveOfferUrgent: {
      id: "77777777-7777-7777-7777-777777777772",
      tracking_token: "offer-test-pending-2",
      status: "pending" as const,
      guest_name: "Cliente Pendiente 2",
      comuna_id: "pucon", // Matches seed-offer-tests.ts
      amount: 5000,
      is_urgent: true,
    },
    pendingWithCancelledOffer: {
      id: "77777777-7777-7777-7777-777777777773",
      tracking_token: "offer-test-pending-3",
      status: "pending" as const,
      guest_name: "Cliente Pendiente 3",
      comuna_id: "lican-ray", // Matches seed-offer-tests.ts
      amount: 10000,
    },
    acceptedWithOffer: {
      id: "77777777-7777-7777-7777-777777777774",
      tracking_token: "offer-test-accepted",
      status: "accepted" as const,
      guest_name: "Cliente Aceptado",
      comuna_id: "curarrehue", // Matches seed-offer-tests.ts
      amount: 1000,
    },
  },

  /**
   * Offers created for testing withdrawal and history
   */
  offers: {
    /** Active offer #1 - can be withdrawn (Story 8-4 AC8.4.1-8.4.3) */
    activeOffer1: {
      id: "88888888-8888-8888-8888-888888888881",
      request_id: "77777777-7777-7777-7777-777777777771",
      status: "active" as const,
    },
    /** Active offer #2 - can be withdrawn (urgent request) */
    activeOffer2: {
      id: "88888888-8888-8888-8888-888888888882",
      request_id: "77777777-7777-7777-7777-777777777772",
      status: "active" as const,
    },
    /** Cancelled offer - for re-submission testing (Story 8-4 AC8.4.5) */
    cancelledOffer: {
      id: "88888888-8888-8888-8888-888888888883",
      request_id: "77777777-7777-7777-7777-777777777773",
      status: "cancelled" as const,
    },
    /** Accepted offer - for "Ver Entrega" button testing */
    acceptedOffer: {
      id: "88888888-8888-8888-8888-888888888884",
      request_id: "77777777-7777-7777-7777-777777777774",
      status: "accepted" as const,
    },
    /** Expired offer - for history section */
    expiredOffer: {
      id: "88888888-8888-8888-8888-888888888885",
      request_id: "77777777-7777-7777-7777-777777777771",
      status: "expired" as const,
    },
  },

  /** Service areas configured for the test provider (Villarrica-area, Araucanía) */
  serviceAreas: ["villarrica", "pucon", "lican-ray", "curarrehue"],
} as const;

/**
 * Use this to check if offer test data is seeded
 */
export const OFFER_TEST_OFFER_IDS = [
  OFFER_TEST_DATA.offers.activeOffer1.id,
  OFFER_TEST_DATA.offers.activeOffer2.id,
  OFFER_TEST_DATA.offers.cancelledOffer.id,
  OFFER_TEST_DATA.offers.acceptedOffer.id,
  OFFER_TEST_DATA.offers.expiredOffer.id,
];

export const OFFER_TEST_REQUEST_IDS = [
  OFFER_TEST_DATA.requests.pendingWithActiveOffer.id,
  OFFER_TEST_DATA.requests.pendingWithActiveOfferUrgent.id,
  OFFER_TEST_DATA.requests.pendingWithCancelledOffer.id,
  OFFER_TEST_DATA.requests.acceptedWithOffer.id,
];

// =============================================================================
// EARNINGS TEST DATA (run `npm run seed:earnings` to seed)
// =============================================================================

/**
 * Earnings test data constants for E2E testing of Story 8-6
 * These match the data seeded by scripts/local/seed-earnings-tests.ts
 *
 * Price tiers (from getPrice function):
 * - 100L  -> $5,000 CLP
 * - 1000L -> $20,000 CLP
 * - 5000L -> $75,000 CLP
 * - 10000L -> $140,000 CLP
 */
export const EARNINGS_TEST_DATA = {
  /**
   * Delivered requests for earnings calculations
   */
  requests: {
    // Today's deliveries (3 requests)
    today: [
      {
        id: "eeeeeeee-eeee-eeee-eeee-eeeeeeee0001",
        tracking_token: "earnings-test-today-1",
        guest_name: "María García",
        amount: 1000, // $20,000
        price: 20000,
      },
      {
        id: "eeeeeeee-eeee-eeee-eeee-eeeeeeee0002",
        tracking_token: "earnings-test-today-2",
        guest_name: "Carlos Ruiz",
        amount: 100, // $5,000
        price: 5000,
      },
      {
        id: "eeeeeeee-eeee-eeee-eeee-eeeeeeee0003",
        tracking_token: "earnings-test-today-3",
        guest_name: "Ana Martínez",
        amount: 5000, // $75,000
        price: 75000,
      },
    ],
    // This week's additional deliveries (4 more, not including today)
    thisWeekAdditional: [
      {
        id: "eeeeeeee-eeee-eeee-eeee-eeeeeeee0004",
        tracking_token: "earnings-test-week-1",
        guest_name: "Pedro Soto",
        amount: 1000, // $20,000
        price: 20000,
      },
      {
        id: "eeeeeeee-eeee-eeee-eeee-eeeeeeee0005",
        tracking_token: "earnings-test-week-2",
        guest_name: "Laura Vega",
        amount: 100, // $5,000
        price: 5000,
      },
      {
        id: "eeeeeeee-eeee-eeee-eeee-eeeeeeee0006",
        tracking_token: "earnings-test-week-3",
        guest_name: "Diego Fernández",
        amount: 10000, // $140,000
        price: 140000,
      },
      {
        id: "eeeeeeee-eeee-eeee-eeee-eeeeeeee0007",
        tracking_token: "earnings-test-week-4",
        guest_name: "Sofía Muñoz",
        amount: 5000, // $75,000
        price: 75000,
      },
    ],
    // This month's additional deliveries (3 more, older than 7 days)
    thisMonthAdditional: [
      {
        id: "eeeeeeee-eeee-eeee-eeee-eeeeeeee0008",
        tracking_token: "earnings-test-month-1",
        guest_name: "Roberto Díaz",
        amount: 1000, // $20,000
        price: 20000,
      },
      {
        id: "eeeeeeee-eeee-eeee-eeee-eeeeeeee0009",
        tracking_token: "earnings-test-month-2",
        guest_name: "Carmen López",
        amount: 5000, // $75,000
        price: 75000,
      },
      {
        id: "eeeeeeee-eeee-eeee-eeee-eeeeeeee0010",
        tracking_token: "earnings-test-month-3",
        guest_name: "Felipe Rojas",
        amount: 1000, // $20,000
        price: 20000,
      },
    ],
  },

  /**
   * Expected totals for verification (assuming 15% commission)
   * Note: Actual values depend on when deliveries fall within period boundaries
   */
  expectedTotals: {
    // These are approximate - actual values depend on current date
    today: {
      deliveries: 3,
      grossIncome: 100000, // $20,000 + $5,000 + $75,000
      commission: 15000, // 15% of $100,000
      netEarnings: 85000,
    },
    thisWeek: {
      deliveries: 7, // 3 today + 4 this week
      grossIncome: 340000,
      commission: 51000,
      netEarnings: 289000,
    },
    thisMonth: {
      deliveries: 10, // all 10 deliveries
      grossIncome: 455000,
      commission: 68250,
      netEarnings: 386750,
    },
  },

  /**
   * Commission ledger entries for pending commission display
   */
  ledger: {
    owed: [
      { id: "eeee0001-0001-0001-0001-000000000001", amount: 3000 },
      { id: "eeee0001-0001-0001-0001-000000000002", amount: 11250 },
      { id: "eeee0001-0001-0001-0001-000000000003", amount: 3000 },
    ],
    paid: [
      { id: "eeee0001-0001-0001-0001-000000000004", amount: 5000 },
    ],
    totalOwed: 17250,
    totalPaid: 5000,
    pending: 12250, // This should show the "Pagar" button
  },
} as const;

/**
 * All earnings test request IDs for cleanup/verification
 */
export const EARNINGS_TEST_REQUEST_IDS = [
  ...EARNINGS_TEST_DATA.requests.today.map((r) => r.id),
  ...EARNINGS_TEST_DATA.requests.thisWeekAdditional.map((r) => r.id),
  ...EARNINGS_TEST_DATA.requests.thisMonthAdditional.map((r) => r.id),
];

/**
 * All earnings test ledger IDs for cleanup/verification
 */
export const EARNINGS_TEST_LEDGER_IDS = [
  ...EARNINGS_TEST_DATA.ledger.owed.map((e) => e.id),
  ...EARNINGS_TEST_DATA.ledger.paid.map((e) => e.id),
];

// =============================================================================
// CONSUMER-FACING OFFERS (Story 10-1) - run `npm run seed:offers` to seed
// =============================================================================

/**
 * Consumer-facing offer test data for Story 10-1
 * These offers are seeded for SEEDED_PENDING_REQUEST to test:
 * - AC10.1.2: Offer card display (provider name, delivery window, price, countdown)
 * - AC10.1.3: Offers sorted by delivery window (soonest first)
 */
export const CONSUMER_OFFERS_TEST_DATA = {
  /**
   * Secondary and tertiary test providers created by seed:offers
   */
  providers: {
    secondary: {
      email: "aguatero2@nitoagua.local",
      name: "Pedro Aguatero",
    },
    tertiary: {
      email: "aguatero3@nitoagua.local",
      name: "María Cisterna",
    },
  },

  /**
   * Consumer-facing offers for SEEDED_PENDING_REQUEST
   * Sorted by delivery_window_start (earliest first)
   */
  offers: {
    /** Earliest delivery - should appear first in sorted list */
    earliest: {
      id: "cccccccc-cccc-cccc-cccc-cccccccccc01",
      request_id: SEEDED_PENDING_REQUEST.id,
      providerName: "Pedro Aguatero",
      status: "active" as const,
    },
    /** Medium delivery time - should appear second */
    medium: {
      id: "cccccccc-cccc-cccc-cccc-cccccccccc02",
      request_id: SEEDED_PENDING_REQUEST.id,
      providerName: "María Cisterna",
      status: "active" as const,
    },
    /** Latest delivery - should appear last (from dev provider) */
    latest: {
      id: "cccccccc-cccc-cccc-cccc-cccccccccc03",
      request_id: SEEDED_PENDING_REQUEST.id,
      providerName: "Supplier Test", // Dev provider name
      status: "active" as const,
    },
  },

  /** Total number of offers for SEEDED_PENDING_REQUEST */
  totalOffers: 3,

  /** Expected sort order (by provider name for verification) */
  expectedSortOrder: ["Pedro Aguatero", "María Cisterna", "Supplier Test"],
} as const;

/**
 * All consumer-facing offer IDs for verification/cleanup
 */
export const CONSUMER_OFFERS_IDS = [
  CONSUMER_OFFERS_TEST_DATA.offers.earliest.id,
  CONSUMER_OFFERS_TEST_DATA.offers.medium.id,
  CONSUMER_OFFERS_TEST_DATA.offers.latest.id,
];

// =============================================================================
// PROVIDER NOTIFICATIONS (Story 11-3: P8) - run `npm run seed:offers` to seed
// =============================================================================

/**
 * Provider notification test data for Story 11-3: P8 - Acceptance Notification
 * These are seeded by scripts/local/seed-offer-tests.ts
 */
export const PROVIDER_NOTIFICATIONS_TEST_DATA = {
  /**
   * Unread notification for accepted offer
   */
  unreadAcceptance: {
    id: "a0000000-0000-0000-0000-000000000001",
    type: "offer_accepted",
    title: "¡Tu oferta fue aceptada!",
    read: false,
  },

  /**
   * Read notification for historical offer
   */
  readAcceptance: {
    id: "a0000000-0000-0000-0000-000000000002",
    type: "offer_accepted",
    title: "¡Tu oferta fue aceptada!",
    read: true,
  },

  /** Total expected notifications */
  totalNotifications: 2,
  unreadCount: 1,
} as const;

/**
 * All provider notification IDs for verification/cleanup
 */
export const PROVIDER_NOTIFICATION_IDS = [
  PROVIDER_NOTIFICATIONS_TEST_DATA.unreadAcceptance.id,
  PROVIDER_NOTIFICATIONS_TEST_DATA.readAcceptance.id,
];
