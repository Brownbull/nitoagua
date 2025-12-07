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
 * Request in CANCELLED state
 * Use for: cancelled status UI tests, "Nueva Solicitud" button tests
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
  cancelled_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
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
];

/**
 * All seeded profiles as an array
 */
export const ALL_SEEDED_PROFILES = [TEST_SUPPLIER, TEST_CONSUMER];
