#!/usr/bin/env npx ts-node

/**
 * Create test offer using admin client (bypasses RLS)
 * For E2E testing when RLS policies are blocking
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

// Load env
function loadEnvFile(filename: string) {
  try {
    const envPath = join(process.cwd(), filename);
    const content = readFileSync(envPath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=");
        const value = valueParts.join("=");
        if (key && value && !process.env[key]) {
          process.env[key] = value;
        }
      }
    }
    return true;
  } catch {
    return false;
  }
}

if (!loadEnvFile(".env.production.local")) {
  loadEnvFile(".env.local");
}

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing env vars");
  process.exit(1);
}

// Admin client bypasses RLS
const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function createTestOffer() {
  const requestId = "fc833a0f-7cbe-4861-9530-dc63e8d607c5"; // The test request
  const providerId = "cb0c1a7a-f734-4295-95cd-9d5e5f7e4ee4"; // Test provider

  console.log("Creating test offer using admin client...\n");

  // Check if request exists and is pending
  const { data: request, error: requestError } = await adminClient
    .from("water_requests")
    .select("id, status, amount, consumer_id")
    .eq("id", requestId)
    .single();

  if (requestError || !request) {
    console.error("Request not found:", requestError?.message);
    return;
  }

  console.log("Request:", request);

  if (request.status !== "pending") {
    console.log("Request status is not pending:", request.status);
    return;
  }

  // Check if offer already exists
  const { data: existingOffer } = await adminClient
    .from("offers")
    .select("id, status")
    .eq("request_id", requestId)
    .eq("provider_id", providerId)
    .single();

  if (existingOffer) {
    console.log("Offer already exists:", existingOffer);
    return;
  }

  // Calculate dates
  const now = new Date();
  const deliveryStart = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
  const deliveryEnd = new Date(now.getTime() + 48 * 60 * 60 * 1000); // Day after tomorrow
  const expiresAt = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes from now

  // Create offer via admin client
  const { data: offer, error: insertError } = await adminClient
    .from("offers")
    .insert({
      request_id: requestId,
      provider_id: providerId,
      delivery_window_start: deliveryStart.toISOString(),
      delivery_window_end: deliveryEnd.toISOString(),
      message: "Oferta de prueba E2E - Disponibilidad inmediata",
      expires_at: expiresAt.toISOString(),
      status: "active",
    })
    .select("id, status, delivery_window_start, delivery_window_end")
    .single();

  if (insertError) {
    console.error("Error creating offer:", insertError);
    return;
  }

  console.log("\n✓ Offer created successfully!");
  console.log("Offer ID:", offer.id);
  console.log("Status:", offer.status);
  console.log("Delivery window:", offer.delivery_window_start, "to", offer.delivery_window_end);

  // Create notification for consumer
  if (request.consumer_id) {
    const { error: notifError } = await adminClient
      .from("notifications")
      .insert({
        user_id: request.consumer_id,
        type: "new_offer",
        title: "Nueva oferta recibida",
        message: `Un proveedor ha enviado una oferta para tu solicitud de ${request.amount} litros`,
        data: { offer_id: offer.id, request_id: requestId },
      });

    if (notifError) {
      console.warn("Warning: Could not create notification:", notifError.message);
    } else {
      console.log("✓ Consumer notification created");
    }
  }
}

createTestOffer().catch(console.error);
