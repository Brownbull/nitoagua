#!/usr/bin/env npx ts-node

/**
 * UI Mockup Data Seeding Script
 *
 * Seeds the database with realistic data to validate UI against mockups.
 * Creates two states:
 *   - Populated: Rich data matching mockup scenarios
 *   - Empty: Clean state for empty UI validation
 *
 * Usage:
 *   npm run seed:mockup            # Seed populated state
 *   npm run seed:mockup:empty      # Clean to empty state
 *   npm run seed:mockup:clean      # Remove all mockup data
 *
 * Or directly:
 *   npx ts-node scripts/seed-ui-mockups.ts [--empty] [--clean]
 *
 * NOTE: Uses deterministic UUIDs prefixed with "ui-mockup-" to avoid conflicts
 *       with test data from seed-test-data.ts
 */

import { createClient } from "@supabase/supabase-js";

// Local Supabase configuration
const LOCAL_CONFIG = {
  url: "http://127.0.0.1:55326",
  serviceRoleKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU",
};

// =============================================================================
// UI MOCKUP DATA - Providers awaiting verification
// =============================================================================

// Deterministic UUIDs for mockup data (different prefix from test data)
const MOCKUP_PROVIDERS = [
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    email: "mockup-provider1@mockup.local",
    password: "MockupProvider1!",
    profile: {
      role: "supplier",
      name: "Carlos Rodriguez",
      phone: "+56912345001",
      service_area: "villarrica",
      verification_status: "pending",
      bank_name: "Banco Estado",
      bank_account: "12345678901",
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    },
    documents: [
      { type: "cedula", original_filename: "cedula_carlos.pdf" },
      { type: "licencia", original_filename: "licencia_conducir.pdf" },
    ],
  },
  {
    id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    email: "mockup-provider2@mockup.local",
    password: "MockupProvider2!",
    profile: {
      role: "supplier",
      name: "Ana Martinez",
      phone: "+56912345002",
      service_area: "pucon",
      verification_status: "pending",
      bank_name: "Banco Chile",
      bank_account: "98765432101",
      created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    },
    documents: [
      { type: "cedula", original_filename: "cedula_ana.jpg" },
      { type: "permiso_sanitario", original_filename: "permiso_sanitario.pdf" },
      { type: "vehiculo", original_filename: "permiso_vehiculo.pdf" },
    ],
  },
  {
    id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
    email: "mockup-provider3@mockup.local",
    password: "MockupProvider3!",
    profile: {
      role: "supplier",
      name: "Luis Fernandez",
      phone: "+56912345003",
      service_area: "villarrica",
      verification_status: "more_info_needed",
      bank_name: "Banco Santander",
      bank_account: "55555555501",
      internal_notes: "Necesita foto mas clara de la cedula",
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    },
    documents: [
      { type: "cedula", original_filename: "cedula_luis.pdf" },
    ],
  },
  {
    id: "dddddddd-dddd-dddd-dddd-dddddddddddd",
    email: "mockup-provider4@mockup.local",
    password: "MockupProvider4!",
    profile: {
      role: "supplier",
      name: "Maria Gonzalez",
      phone: "+56912345004",
      service_area: "curarrehue",
      verification_status: "pending",
      bank_name: "Banco BCI",
      bank_account: "11111111101",
      created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2 days ago
    },
    documents: [
      { type: "cedula", original_filename: "cedula_maria.jpg" },
      { type: "licencia", original_filename: "licencia.pdf" },
      { type: "certificacion", original_filename: "cert_agua.pdf" },
      { type: "vehiculo", original_filename: "camion.jpg" },
    ],
  },
  {
    id: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
    email: "mockup-provider5@mockup.local",
    password: "MockupProvider5!",
    profile: {
      role: "supplier",
      name: "Pedro Sanchez",
      phone: "+56912345005",
      service_area: "pucon",
      verification_status: "more_info_needed",
      bank_name: "Banco Falabella",
      bank_account: "22222222201",
      internal_notes: "Falta permiso sanitario",
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    },
    documents: [
      { type: "cedula", original_filename: "cedula_pedro.pdf" },
      { type: "licencia", original_filename: "licencia_pedro.pdf" },
    ],
  },
];

// Approved providers for Provider Directory (Section 4 of admin mockups)
const MOCKUP_APPROVED_PROVIDERS = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    email: "mockup-approved1@mockup.local",
    password: "ApprovedProvider1!",
    profile: {
      role: "supplier",
      name: "Francisco Herrera",
      phone: "+56912340001",
      service_area: "villarrica",
      verification_status: "approved",
      bank_name: "Banco Estado",
      bank_account: "33333333301",
      commission_override: null, // Uses default
      created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
    },
    deliveries: 45, // Will create this many completed requests
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    email: "mockup-approved2@mockup.local",
    password: "ApprovedProvider2!",
    profile: {
      role: "supplier",
      name: "Isabella Munoz",
      phone: "+56912340002",
      service_area: "pucon",
      verification_status: "approved",
      bank_name: "Banco Chile",
      bank_account: "44444444401",
      commission_override: 8.5, // Custom rate
      created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days ago
    },
    deliveries: 32,
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    email: "mockup-approved3@mockup.local",
    password: "ApprovedProvider3!",
    profile: {
      role: "supplier",
      name: "Diego Vargas",
      phone: "+56912340003",
      service_area: "curarrehue",
      verification_status: "approved",
      bank_name: "Banco Santander",
      bank_account: "55555555501",
      commission_override: null,
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    },
    deliveries: 18,
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    email: "mockup-suspended@mockup.local",
    password: "SuspendedProvider1!",
    profile: {
      role: "supplier",
      name: "Roberto Castillo",
      phone: "+56912340004",
      service_area: "villarrica",
      verification_status: "suspended",
      suspension_reason: "Multiples quejas de clientes sobre servicio",
      bank_name: "Banco BCI",
      bank_account: "66666666601",
      commission_override: null,
      created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
    },
    deliveries: 67,
  },
  {
    id: "55555555-5555-5555-5555-555555555555",
    email: "mockup-banned@mockup.local",
    password: "BannedProvider1!",
    profile: {
      role: "supplier",
      name: "Alejandro Fuentes",
      phone: "+56912340005",
      service_area: "pucon",
      verification_status: "banned",
      suspension_reason: "Fraude confirmado - cobro sin entrega",
      bank_name: "Banco Falabella",
      bank_account: "77777777701",
      commission_override: null,
      created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(), // 120 days ago
    },
    deliveries: 23,
  },
];

// Settlement data for Cash Settlement Tracking (Section 10 of admin mockups)
// Withdrawal requests - providers submitting payment receipts
// Using valid UUID format (hex digits only)
const MOCKUP_WITHDRAWAL_REQUESTS = [
  {
    id: "a1111111-1111-4111-8111-111111111111",
    provider_id: "11111111-1111-1111-1111-111111111111", // Francisco Herrera
    amount: 45000, // CLP
    receipt_path: "receipts/francisco_herrera_transfer.jpg",
    status: "pending",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  },
  {
    id: "a2222222-2222-4222-8222-222222222222",
    provider_id: "22222222-2222-2222-2222-222222222222", // Isabella Munoz
    amount: 32000,
    receipt_path: "receipts/isabella_munoz_deposit.jpg",
    status: "pending",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
  },
  {
    id: "a3333333-3333-4333-8333-333333333333",
    provider_id: "33333333-3333-3333-3333-333333333333", // Diego Vargas
    amount: 18000,
    receipt_path: null, // No receipt uploaded yet
    status: "pending",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
];

// Commission ledger entries - owed commissions from deliveries
const MOCKUP_COMMISSION_LEDGER = [
  // Francisco Herrera - 45 deliveries, owes $67,500 (45 * $1,500 avg commission)
  {
    id: "b1111111-1111-4111-8111-111111111111",
    provider_id: "11111111-1111-1111-1111-111111111111",
    type: "commission_owed",
    amount: 25000,
    description: "Comision entregas semana 1",
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "b1111111-1111-4111-8111-111111111112",
    provider_id: "11111111-1111-1111-1111-111111111111",
    type: "commission_owed",
    amount: 22500,
    description: "Comision entregas semana 2",
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "b1111111-1111-4111-8111-111111111113",
    provider_id: "11111111-1111-1111-1111-111111111111",
    type: "commission_owed",
    amount: 20000,
    description: "Comision entregas semana 3",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // Isabella Munoz - 32 deliveries, owes $48,000
  {
    id: "b2222222-2222-4222-8222-222222222221",
    provider_id: "22222222-2222-2222-2222-222222222222",
    type: "commission_owed",
    amount: 28000,
    description: "Comision entregas Nov",
    created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "b2222222-2222-4222-8222-222222222222",
    provider_id: "22222222-2222-2222-2222-222222222222",
    type: "commission_owed",
    amount: 20000,
    description: "Comision entregas Dic",
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // Diego Vargas - 18 deliveries, owes $27,000
  {
    id: "b3333333-3333-4333-8333-333333333331",
    provider_id: "33333333-3333-3333-3333-333333333333",
    type: "commission_owed",
    amount: 15000,
    description: "Comision entregas semana pasada",
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "b3333333-3333-4333-8333-333333333332",
    provider_id: "33333333-3333-3333-3333-333333333333",
    type: "commission_owed",
    amount: 12000,
    description: "Comision entregas esta semana",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // Some paid entries to show history
  {
    id: "c1111111-1111-4111-8111-111111111111",
    provider_id: "11111111-1111-1111-1111-111111111111",
    type: "commission_paid",
    amount: 30000,
    description: "Pago verificado",
    bank_reference: "TRF-2024-12345",
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "c2222222-2222-4222-8222-222222222222",
    provider_id: "22222222-2222-2222-2222-222222222222",
    type: "commission_paid",
    amount: 25000,
    description: "Pago verificado",
    bank_reference: "TRF-2024-67890",
    created_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Additional water requests for supplier dashboard mockups
const MOCKUP_REQUESTS = [
  {
    id: "aaaaaaaa-1111-1111-1111-111111111111",
    tracking_token: "mockup-pending-1",
    status: "pending",
    guest_phone: "+56987654001",
    guest_name: "Roberto Perez",
    guest_email: "roberto@example.com",
    address: "Av. Pedro de Valdivia 1234, Villarrica",
    amount: 1000,
    special_instructions: "Casa con porton negro",
    is_urgent: false,
    consumer_id: null,
    supplier_id: null,
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min ago
  },
  {
    id: "aaaaaaaa-2222-2222-2222-222222222222",
    tracking_token: "mockup-pending-2",
    status: "pending",
    guest_phone: "+56987654002",
    guest_name: "Carmen Lopez",
    guest_email: "carmen@example.com",
    address: "Calle Los Robles 567, Villarrica",
    amount: 5000,
    special_instructions: "Estanque azul al costado de la casa",
    is_urgent: true,
    consumer_id: null,
    supplier_id: null,
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 min ago
  },
  {
    id: "aaaaaaaa-3333-3333-3333-333333333333",
    tracking_token: "mockup-pending-3",
    status: "pending",
    guest_phone: "+56987654003",
    guest_name: "Jorge Vidal",
    guest_email: "jorge@example.com",
    address: "Parcela 45, Camino a Pucon",
    amount: 10000,
    special_instructions: "",
    is_urgent: false,
    consumer_id: null,
    supplier_id: null,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
];

// Comprehensive orders for the Orders Management page (Section 6 mockup)
// Note: DB constraints allow only status: pending, accepted, delivered, cancelled
// Note: DB constraints allow only amount: 100, 1000, 5000, 10000
const MOCKUP_ORDERS_FULL = [
  // Pending orders (waiting for offers)
  {
    id: "f1111111-1111-4111-8111-111111111111",
    tracking_token: "mockup-order-pending-1",
    status: "pending",
    guest_phone: "+56987650001",
    guest_name: "Rosa Martinez",
    guest_email: "rosa@example.com",
    address: "Los Canelos 123, Villarrica",
    amount: 1000,
    special_instructions: "Tocar timbre dos veces",
    is_urgent: false,
    supplier_id: null,
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 min ago
  },
  {
    id: "f2222222-2222-4222-8222-222222222222",
    tracking_token: "mockup-order-pending-2",
    status: "pending",
    guest_phone: "+56987650002",
    guest_name: "Eduardo Silva",
    guest_email: "eduardo@example.com",
    address: "Av. Bernardo O'Higgins 456, Pucon",
    amount: 5000,
    special_instructions: "Casa con rejas verdes",
    is_urgent: true,
    supplier_id: null,
    created_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(), // 20 min ago
  },
  // Another pending with offers (conceptually "offers_pending" but stored as pending)
  {
    id: "f3333333-3333-4333-8333-333333333333",
    tracking_token: "mockup-order-offers-1",
    status: "pending", // Using 'pending' since 'offers_pending' not in DB constraint
    guest_phone: "+56987650003",
    guest_name: "Patricia Rojas",
    guest_email: "patricia@example.com",
    address: "Calle Nueva 789, Villarrica",
    amount: 1000, // Valid amount
    special_instructions: "",
    is_urgent: false,
    supplier_id: null,
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
  },
  // Accepted orders (provider accepted - using 'accepted' status)
  {
    id: "f4444444-4444-4444-8444-444444444444",
    tracking_token: "mockup-order-assigned-1",
    status: "accepted", // 'assigned' -> 'accepted' to match DB constraint
    guest_phone: "+56987650004",
    guest_name: "Miguel Torres",
    guest_email: "miguel@example.com",
    address: "Parcela 12, Camino a Curarrehue",
    amount: 10000,
    special_instructions: "Entrada por camino de tierra",
    is_urgent: false,
    supplier_id: "11111111-1111-1111-1111-111111111111", // Francisco Herrera
    accepted_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  // Accepted orders (conceptually "en_route" but stored as accepted)
  {
    id: "f5555555-5555-4555-8555-555555555555",
    tracking_token: "mockup-order-enroute-1",
    status: "accepted", // 'en_route' -> 'accepted' to match DB constraint
    guest_phone: "+56987650005",
    guest_name: "Maria Lopez",
    guest_email: "maria@example.com",
    address: "Av. Providencia 1234, Depto 501, Villarrica",
    amount: 1000,
    special_instructions: "Llamar al llegar",
    is_urgent: false,
    supplier_id: "22222222-2222-2222-2222-222222222222", // Isabella Munoz
    accepted_at: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
  },
  {
    id: "f6666666-6666-4666-8666-666666666666",
    tracking_token: "mockup-order-enroute-2",
    status: "accepted", // 'en_route' -> 'accepted' to match DB constraint
    guest_phone: "+56987650006",
    guest_name: "Juan Carlos",
    guest_email: "juancarlos@example.com",
    address: "Los Arrayanes 567, Pucon",
    amount: 5000,
    special_instructions: "Estanque atras de la casa",
    is_urgent: true,
    supplier_id: "11111111-1111-1111-1111-111111111111", // Francisco Herrera
    accepted_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
  },
  // Delivered orders (completed today)
  {
    id: "f7777777-7777-4777-8777-777777777777",
    tracking_token: "mockup-order-delivered-1",
    status: "delivered",
    guest_phone: "+56987650007",
    guest_name: "Ana Sofia",
    guest_email: "anasofia@example.com",
    address: "Calle Principal 321, Villarrica",
    amount: 1000,
    special_instructions: "",
    is_urgent: false,
    supplier_id: "33333333-3333-3333-3333-333333333333", // Diego Vargas
    accepted_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    delivered_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
  },
  {
    id: "f8888888-8888-4888-8888-888888888888",
    tracking_token: "mockup-order-delivered-2",
    status: "delivered",
    guest_phone: "+56987650008",
    guest_name: "Carlos Mendez",
    guest_email: "carlos@example.com",
    address: "Las Encinas 890, Pucon",
    amount: 5000,
    special_instructions: "Porton automatico",
    is_urgent: false,
    supplier_id: "22222222-2222-2222-2222-222222222222", // Isabella Munoz
    accepted_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    delivered_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
  },
  // Cancelled order
  {
    id: "f9999999-9999-4999-8999-999999999999",
    tracking_token: "mockup-order-cancelled-1",
    status: "cancelled",
    guest_phone: "+56987650009",
    guest_name: "Fernando Reyes",
    guest_email: "fernando@example.com",
    address: "Camino Viejo 456, Curarrehue",
    amount: 10000,
    special_instructions: "",
    is_urgent: false,
    supplier_id: null,
    cancelled_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    cancellation_reason: "Cliente no disponible para recibir",
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
  },
];

// Offers for the orders - using actual DB schema (delivery_window_start/end, no price column)
// Valid offer statuses: active, accepted, expired, cancelled, request_filled
const MOCKUP_OFFERS = [
  // Offers for order f3333333 (pending with offers - Patricia Rojas)
  {
    id: "e1111111-1111-4111-8111-111111111111",
    request_id: "f3333333-3333-4333-8333-333333333333",
    provider_id: "11111111-1111-1111-1111-111111111111", // Francisco Herrera
    status: "active", // Active offer waiting for consumer selection
    delivery_window_start: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(), // 1 hour from now
    delivery_window_end: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours from now
    expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 50 * 60 * 1000).toISOString(), // 50 min ago
  },
  {
    id: "e2222222-2222-4222-8222-222222222222",
    request_id: "f3333333-3333-4333-8333-333333333333",
    provider_id: "22222222-2222-2222-2222-222222222222", // Isabella Munoz
    status: "active",
    delivery_window_start: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    delivery_window_end: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 min ago
  },
  {
    id: "e3333333-3333-4333-8333-333333333333",
    request_id: "f3333333-3333-4333-8333-333333333333",
    provider_id: "33333333-3333-3333-3333-333333333333", // Diego Vargas
    status: "active",
    delivery_window_start: new Date(Date.now() + 0.5 * 60 * 60 * 1000).toISOString(),
    delivery_window_end: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 40 * 60 * 1000).toISOString(), // 40 min ago
  },
  // Accepted offer for order f4444444 (assigned - Miguel Torres)
  {
    id: "e4444444-4444-4444-8444-444444444444",
    request_id: "f4444444-4444-4444-8444-444444444444",
    provider_id: "11111111-1111-1111-1111-111111111111", // Francisco Herrera
    status: "accepted",
    delivery_window_start: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
    delivery_window_end: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    accepted_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  // Offers history for delivered order f7777777 (Ana Sofia)
  {
    id: "e5555555-5555-4555-8555-555555555555",
    request_id: "f7777777-7777-4777-8777-777777777777",
    provider_id: "33333333-3333-3333-3333-333333333333", // Diego Vargas
    status: "accepted",
    delivery_window_start: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    delivery_window_end: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    accepted_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "e6666666-6666-4666-8666-666666666666",
    request_id: "f7777777-7777-4777-8777-777777777777",
    provider_id: "22222222-2222-2222-2222-222222222222", // Isabella Munoz
    status: "expired",
    delivery_window_start: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    delivery_window_end: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() - 4.5 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 4.8 * 60 * 60 * 1000).toISOString(),
  },
];

// =============================================================================
// SCRIPT LOGIC
// =============================================================================

const isClean = process.argv.includes("--clean");
const isEmpty = process.argv.includes("--empty");

async function main() {
  console.log("🎨 UI Mockup Data Seed Script");
  console.log(`   Target: LOCAL (${LOCAL_CONFIG.url})`);
  console.log(`   Mode: ${isClean ? "CLEAN" : isEmpty ? "EMPTY" : "POPULATED"}`);

  const supabase = createClient(LOCAL_CONFIG.url, LOCAL_CONFIG.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    if (isClean || isEmpty) {
      await cleanMockupData(supabase);
      if (isClean) {
        await deleteAuthUsers(supabase);
      }
    }

    if (!isClean && !isEmpty) {
      await seedProviders(supabase);
      await seedApprovedProviders(supabase);
      await seedRequests(supabase);
      await seedOrdersAndOffers(supabase);
      await seedSettlement(supabase);
      await verifyMockupData(supabase);
    }

    console.log("\n✅ Done!\n");
  } catch (error) {
    console.error("\n❌ Error:", error);
    process.exit(1);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function seedProviders(supabase: any) {
  console.log("\n👥 Seeding mockup providers for verification queue...");

  for (const provider of MOCKUP_PROVIDERS) {
    // Check if user exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingUser = existingUsers?.users?.find((u: any) => u.email === provider.email);

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
      console.log(`  ✓ Provider ${provider.profile.name} exists (ID: ${userId})`);
    } else {
      // Create auth user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: provider.email,
        password: provider.password,
        email_confirm: true,
        user_metadata: { name: provider.profile.name },
      });

      if (createError) {
        throw new Error(`Failed to create user ${provider.email}: ${createError.message}`);
      }

      userId = newUser.user.id;
      console.log(`  ✓ Created provider ${provider.profile.name} (ID: ${userId})`);
    }

    // Upsert profile with verification data
    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: userId,
        ...provider.profile,
      },
      { onConflict: "id" }
    );

    if (profileError) {
      throw new Error(`Failed to upsert profile: ${profileError.message}`);
    }

    // Add documents (let DB generate UUID)
    for (const doc of provider.documents) {
      // First check if document exists
      const { data: existingDoc } = await supabase
        .from("provider_documents")
        .select("id")
        .eq("provider_id", userId)
        .eq("type", doc.type)
        .single();

      if (existingDoc) {
        console.log(`    ✓ Document ${doc.type} already exists`);
        continue;
      }

      const { error: docError } = await supabase.from("provider_documents").insert(
        {
          provider_id: userId,
          type: doc.type,
          storage_path: `providers/${userId}/${doc.type}/${doc.original_filename}`,
          original_filename: doc.original_filename,
          uploaded_at: provider.profile.created_at,
        }
      );

      if (docError) {
        console.warn(`  ⚠ Failed to add document ${doc.type}: ${docError.message}`);
      }
    }

    console.log(`    - Status: ${provider.profile.verification_status}, Docs: ${provider.documents.length}`);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function seedApprovedProviders(supabase: any) {
  console.log("\n👥 Seeding approved providers for Provider Directory...");

  for (const provider of MOCKUP_APPROVED_PROVIDERS) {
    // Check if user exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingUser = existingUsers?.users?.find((u: any) => u.email === provider.email);

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
      console.log(`  ✓ Provider ${provider.profile.name} exists (ID: ${userId})`);
    } else {
      // Create auth user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: provider.email,
        password: provider.password,
        email_confirm: true,
        user_metadata: { name: provider.profile.name },
      });

      if (createError) {
        throw new Error(`Failed to create user ${provider.email}: ${createError.message}`);
      }

      userId = newUser.user.id;
      console.log(`  ✓ Created provider ${provider.profile.name} (ID: ${userId})`);
    }

    // Upsert profile
    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: userId,
        ...provider.profile,
      },
      { onConflict: "id" }
    );

    if (profileError) {
      throw new Error(`Failed to upsert profile: ${profileError.message}`);
    }

    // Create completed deliveries for this provider
    const completedRequests = [];
    for (let i = 0; i < provider.deliveries; i++) {
      const daysAgo = Math.floor(Math.random() * 60); // Random day in last 60 days
      // Generate valid UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (36 chars total with dashes)
      const indexHex = i.toString(16).padStart(4, "0");
      completedRequests.push({
        id: `${provider.id.slice(0, 8)}-${indexHex}-4000-8000-${provider.id.slice(0, 8)}${indexHex}`,
        tracking_token: `mockup-delivered-${provider.profile.name.split(" ")[0].toLowerCase()}-${i}`,
        status: "delivered",
        guest_phone: `+5698765${String(1000 + i).slice(-4)}`,
        guest_name: `Cliente ${i + 1}`,
        guest_email: `cliente${i + 1}@example.com`,
        address: `Direccion ${i + 1}, ${provider.profile.service_area}`,
        amount: [100, 1000, 5000, 10000][Math.floor(Math.random() * 4)],
        special_instructions: "",
        is_urgent: false,
        supplier_id: userId,
        created_at: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
        delivered_at: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
      });
    }

    // Insert completed requests (skip if exists)
    if (completedRequests.length > 0) {
      const { error: requestError } = await supabase
        .from("water_requests")
        .upsert(completedRequests, { onConflict: "id", ignoreDuplicates: true });

      if (requestError) {
        console.warn(`  ⚠ Failed to add deliveries: ${requestError.message}`);
      } else {
        console.log(`    - ${provider.deliveries} completed deliveries created`);
      }
    }

    console.log(`    - Status: ${provider.profile.verification_status}, Area: ${provider.profile.service_area}`);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function seedRequests(supabase: any) {
  console.log("\n📝 Seeding mockup water requests...");

  const { error } = await supabase
    .from("water_requests")
    .upsert(MOCKUP_REQUESTS, { onConflict: "id" });

  if (error) {
    throw new Error(`Failed to seed requests: ${error.message}`);
  }

  console.log(`  ✓ Seeded ${MOCKUP_REQUESTS.length} water requests`);
  for (const req of MOCKUP_REQUESTS) {
    console.log(`    - [${req.status}${req.is_urgent ? " URGENT" : ""}] ${req.guest_name} - ${req.amount}L`);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function seedOrdersAndOffers(supabase: any) {
  console.log("\n📦 Seeding comprehensive orders for Orders Management page...");

  // Get actual provider user IDs
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const providerEmailToId: Record<string, string> = {};

  for (const provider of MOCKUP_APPROVED_PROVIDERS) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = existingUsers?.users?.find((u: any) => u.email === provider.email);
    if (user) {
      providerEmailToId[provider.email] = user.id;
    }
  }

  // Map orders to actual provider IDs
  const ordersToInsert = MOCKUP_ORDERS_FULL.map((order) => {
    const newOrder = { ...order };
    if (order.supplier_id) {
      // Find the provider by mockup ID and get actual user ID
      const provider = MOCKUP_APPROVED_PROVIDERS.find((p) => p.id === order.supplier_id);
      if (provider) {
        newOrder.supplier_id = providerEmailToId[provider.email] || null;
      }
    }
    return newOrder;
  });

  // Insert orders
  const { error: ordersError } = await supabase
    .from("water_requests")
    .upsert(ordersToInsert, { onConflict: "id" });

  if (ordersError) {
    console.error(`  ✗ Failed to seed orders: ${ordersError.message}`);
  } else {
    console.log(`  ✓ Seeded ${ordersToInsert.length} orders`);
    for (const order of ordersToInsert) {
      const providerName = order.supplier_id
        ? MOCKUP_APPROVED_PROVIDERS.find((p) => providerEmailToId[p.email] === order.supplier_id)?.profile.name || "Unknown"
        : "Sin asignar";
      console.log(`    - [${order.status}${order.is_urgent ? " URGENT" : ""}] ${order.guest_name} - ${order.amount}L → ${providerName}`);
    }
  }

  // Map offers to actual provider IDs
  const offersToInsert = MOCKUP_OFFERS.map((offer) => {
    const newOffer = { ...offer };
    const provider = MOCKUP_APPROVED_PROVIDERS.find((p) => p.id === offer.provider_id);
    if (provider) {
      newOffer.provider_id = providerEmailToId[provider.email] || offer.provider_id;
    }
    return newOffer;
  });

  // Insert offers
  console.log("\n💰 Seeding offers for orders...");
  const { error: offersError } = await supabase
    .from("offers")
    .upsert(offersToInsert, { onConflict: "id" });

  if (offersError) {
    console.error(`  ✗ Failed to seed offers: ${offersError.message}`);
  } else {
    console.log(`  ✓ Seeded ${offersToInsert.length} offers`);
    for (const offer of offersToInsert) {
      const provider = MOCKUP_APPROVED_PROVIDERS.find((p) => providerEmailToId[p.email] === offer.provider_id);
      console.log(`    - [${offer.status}] ${offer.delivery_window_start?.slice(11, 16) || "N/A"}-${offer.delivery_window_end?.slice(11, 16) || "N/A"} by ${provider?.profile.name || "Unknown"}`);
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function seedSettlement(supabase: any) {
  console.log("\n💰 Seeding settlement data (commission ledger & withdrawal requests)...");

  // First, get the actual user IDs for the approved providers
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const providerEmailToId: Record<string, string> = {};

  for (const provider of MOCKUP_APPROVED_PROVIDERS) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = existingUsers?.users?.find((u: any) => u.email === provider.email);
    if (user) {
      providerEmailToId[provider.email] = user.id;
    }
  }

  // Map commission ledger entries to actual user IDs
  const ledgerEntries = MOCKUP_COMMISSION_LEDGER.map((entry) => {
    // Find the provider by the mockup ID
    const provider = MOCKUP_APPROVED_PROVIDERS.find((p) => p.id === entry.provider_id);
    const actualUserId = provider ? providerEmailToId[provider.email] : null;

    if (!actualUserId) {
      console.warn(`  ⚠ No user found for provider ${entry.provider_id}`);
      return null;
    }

    return {
      ...entry,
      provider_id: actualUserId,
    };
  }).filter(Boolean);

  // Seed commission ledger
  if (ledgerEntries.length > 0) {
    const { error: ledgerError } = await supabase
      .from("commission_ledger")
      .upsert(ledgerEntries, { onConflict: "id" });

    if (ledgerError) {
      console.error(`  ✗ Failed to seed commission ledger: ${ledgerError.message}`);
    } else {
      console.log(`  ✓ Seeded ${ledgerEntries.length} commission ledger entries`);
    }
  }

  // Map withdrawal requests to actual user IDs
  const withdrawalRequests = MOCKUP_WITHDRAWAL_REQUESTS.map((request) => {
    const provider = MOCKUP_APPROVED_PROVIDERS.find((p) => p.id === request.provider_id);
    const actualUserId = provider ? providerEmailToId[provider.email] : null;

    if (!actualUserId) {
      console.warn(`  ⚠ No user found for withdrawal request provider ${request.provider_id}`);
      return null;
    }

    return {
      ...request,
      provider_id: actualUserId,
    };
  }).filter(Boolean);

  // Seed withdrawal requests
  if (withdrawalRequests.length > 0) {
    const { error: withdrawalError } = await supabase
      .from("withdrawal_requests")
      .upsert(withdrawalRequests, { onConflict: "id" });

    if (withdrawalError) {
      console.error(`  ✗ Failed to seed withdrawal requests: ${withdrawalError.message}`);
    } else {
      console.log(`  ✓ Seeded ${withdrawalRequests.length} withdrawal requests`);
      for (const req of withdrawalRequests) {
        if (req) {
          const provider = MOCKUP_APPROVED_PROVIDERS.find((p) => providerEmailToId[p.email] === req.provider_id);
          console.log(`    - [${req.status}] ${provider?.profile.name || "Unknown"} - $${req.amount.toLocaleString()}`);
        }
      }
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function cleanMockupData(supabase: any) {
  console.log("\n🗑️  Cleaning mockup data...");

  // Delete offers first (foreign key to water_requests)
  const offerIds = MOCKUP_OFFERS.map((o) => o.id);
  const { error: offersError, count: offersCount } = await supabase
    .from("offers")
    .delete({ count: "exact" })
    .in("id", offerIds);

  if (offersError) {
    console.error(`  ✗ Failed to delete offers: ${offersError.message}`);
  } else {
    console.log(`  ✓ Deleted ${offersCount || 0} mockup offers`);
  }

  // Delete settlement data first (foreign key to profiles)
  const withdrawalIds = MOCKUP_WITHDRAWAL_REQUESTS.map((r) => r.id);
  const { error: withdrawalError, count: withdrawalCount } = await supabase
    .from("withdrawal_requests")
    .delete({ count: "exact" })
    .in("id", withdrawalIds);

  if (withdrawalError) {
    console.error(`  ✗ Failed to delete withdrawal requests: ${withdrawalError.message}`);
  } else {
    console.log(`  ✓ Deleted ${withdrawalCount || 0} withdrawal requests`);
  }

  const ledgerIds = MOCKUP_COMMISSION_LEDGER.map((l) => l.id);
  const { error: ledgerError, count: ledgerCount } = await supabase
    .from("commission_ledger")
    .delete({ count: "exact" })
    .in("id", ledgerIds);

  if (ledgerError) {
    console.error(`  ✗ Failed to delete commission ledger entries: ${ledgerError.message}`);
  } else {
    console.log(`  ✓ Deleted ${ledgerCount || 0} commission ledger entries`);
  }

  // Delete mockup documents (foreign key constraint)
  const { error: docError, count: docCount } = await supabase
    .from("provider_documents")
    .delete({ count: "exact" })
    .like("storage_path", "providers/%");

  if (docError) {
    console.error(`  ✗ Failed to delete documents: ${docError.message}`);
  } else {
    console.log(`  ✓ Deleted ${docCount || 0} mockup documents`);
  }

  // Delete comprehensive orders
  const orderIds = MOCKUP_ORDERS_FULL.map((o) => o.id);
  const { error: ordersError, count: ordersCount } = await supabase
    .from("water_requests")
    .delete({ count: "exact" })
    .in("id", orderIds);

  if (ordersError) {
    console.error(`  ✗ Failed to delete orders: ${ordersError.message}`);
  } else {
    console.log(`  ✓ Deleted ${ordersCount || 0} comprehensive orders`);
  }

  // Delete mockup water requests
  const requestIds = MOCKUP_REQUESTS.map((r) => r.id);
  const { error: requestError, count: requestCount } = await supabase
    .from("water_requests")
    .delete({ count: "exact" })
    .in("id", requestIds);

  if (requestError) {
    console.error(`  ✗ Failed to delete requests: ${requestError.message}`);
  } else {
    console.log(`  ✓ Deleted ${requestCount || 0} mockup water requests`);
  }

  // Delete delivery requests for approved providers
  const approvedIds = MOCKUP_APPROVED_PROVIDERS.map((p) => p.id.slice(0, 8));
  for (const prefix of approvedIds) {
    const { error: delError, count: delCount } = await supabase
      .from("water_requests")
      .delete({ count: "exact" })
      .like("id", `${prefix}-%`);

    if (!delError && delCount && delCount > 0) {
      console.log(`  ✓ Deleted ${delCount} delivery requests for provider ${prefix}`);
    }
  }

  // Reset verification status for mockup providers
  const mockupEmails = [
    ...MOCKUP_PROVIDERS.map((p) => p.email),
    ...MOCKUP_APPROVED_PROVIDERS.map((p) => p.email),
  ];
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
   
  const mockupUserIds = existingUsers?.users
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ?.filter((u: any) => mockupEmails.includes(u.email))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((u: any) => u.id) || [];

  if (mockupUserIds.length > 0) {
    const { error: profileError, count: profileCount } = await supabase
      .from("profiles")
      .delete({ count: "exact" })
      .in("id", mockupUserIds);

    if (profileError) {
      console.error(`  ✗ Failed to delete profiles: ${profileError.message}`);
    } else {
      console.log(`  ✓ Deleted ${profileCount || 0} mockup profiles`);
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function deleteAuthUsers(supabase: any) {
  console.log("\n🔐 Deleting mockup auth users...");

  const mockupEmails = [
    ...MOCKUP_PROVIDERS.map((p) => p.email),
    ...MOCKUP_APPROVED_PROVIDERS.map((p) => p.email),
  ];
  const { data: existingUsers } = await supabase.auth.admin.listUsers();

  for (const email of mockupEmails) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = existingUsers?.users?.find((u: any) => u.email === email);
    if (user) {
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      if (error) {
        console.error(`  ✗ Failed to delete user ${email}: ${error.message}`);
      } else {
        console.log(`  ✓ Deleted auth user: ${email}`);
      }
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function verifyMockupData(supabase: any) {
  console.log("\n🔍 Verifying mockup data...");

  // Check providers in verification queue
  const { data: pendingProviders, count: pendingCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .in("role", ["supplier", "provider"])
    .in("verification_status", ["pending", "more_info_needed"]);

  console.log(`  ✓ Verification queue: ${pendingCount || 0} providers`);
  if (pendingProviders) {
     
    for (const p of pendingProviders) {
      console.log(`    - [${p.verification_status}] ${p.name} (${p.service_area})`);
    }
  }

  // Check approved/suspended/banned providers for Provider Directory
  const { data: allProviders, count: totalCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .in("role", ["supplier", "provider"])
    .in("verification_status", ["approved", "suspended", "banned"]);

  console.log(`  ✓ Provider Directory: ${totalCount || 0} providers`);
  if (allProviders) {
     
    for (const p of allProviders) {
      const commissionInfo = p.commission_override ? `${p.commission_override}% custom` : "default";
      console.log(`    - [${p.verification_status}] ${p.name} (${p.service_area}) - ${commissionInfo}`);
    }
  }

  // Check documents
  const { count: docCount } = await supabase
    .from("provider_documents")
    .select("*", { count: "exact", head: true });

  console.log(`  ✓ Total provider documents: ${docCount || 0}`);

  // Check water requests
  const { data: requests } = await supabase
    .from("water_requests")
    .select("id, status, guest_name, amount")
    .like("tracking_token", "mockup-%");

  console.log(`  ✓ Mockup water requests: ${requests?.length || 0}`);

  // Check delivered requests (for Provider Directory delivery counts)
  const { count: deliveredCount } = await supabase
    .from("water_requests")
    .select("*", { count: "exact", head: true })
    .eq("status", "delivered")
    .like("tracking_token", "mockup-delivered-%");

  console.log(`  ✓ Completed deliveries (for directory): ${deliveredCount || 0}`);

  // Check settlement data
  const { count: ledgerCount } = await supabase
    .from("commission_ledger")
    .select("*", { count: "exact", head: true });

  console.log(`  ✓ Commission ledger entries: ${ledgerCount || 0}`);

  const { data: pendingWithdrawals, count: withdrawalCount } = await supabase
    .from("withdrawal_requests")
    .select("*", { count: "exact" })
    .eq("status", "pending");

  console.log(`  ✓ Pending withdrawal requests: ${withdrawalCount || 0}`);
  if (pendingWithdrawals) {
    for (const w of pendingWithdrawals) {
      console.log(`    - $${w.amount.toLocaleString()} (${w.receipt_path ? "with receipt" : "no receipt"})`);
    }
  }
}

main();
