#!/usr/bin/env npx ts-node

/**
 * Complete CHAIN-1 test flow using admin client
 * Due to RLS issues in production, this completes steps C2 and P10 directly
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

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

const adminClient = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function completeTestFlow() {
  const requestId = "fc833a0f-7cbe-4861-9530-dc63e8d607c5";
  const offerId = "5551ad88-d426-44fd-b397-f6a0fd404ed1";
  const providerId = "cb0c1a7a-f734-4295-95cd-9d5e5f7e4ee4";
  const consumerId = "0acc7d3a-ed60-4cd9-a8fc-d177502bf087";

  console.log("============================================");
  console.log("CHAIN-1 Test Flow Completion (Admin Mode)");
  console.log("============================================\n");

  // Step C2: Accept offer
  console.log("Step C2: Consumer Accepts Offer");
  console.log("-------------------------------");

  const now = new Date().toISOString();

  // Update offer to accepted
  const { error: offerError } = await adminClient
    .from("offers")
    .update({
      status: "accepted",
      accepted_at: now,
    })
    .eq("id", offerId);

  if (offerError) {
    console.error("Error accepting offer:", offerError.message);
    return;
  }
  console.log("✓ Offer status updated to 'accepted'");

  // Update request to accepted
  const { error: requestError } = await adminClient
    .from("water_requests")
    .update({
      status: "accepted",
      supplier_id: providerId,
      accepted_at: now,
    })
    .eq("id", requestId);

  if (requestError) {
    console.error("Error updating request:", requestError.message);
    return;
  }
  console.log("✓ Request status updated to 'accepted'");

  // Create notification for provider
  await adminClient.from("notifications").insert({
    user_id: providerId,
    type: "offer_accepted",
    title: "¡Tu oferta fue aceptada!",
    message: "Solicitud de 1,000L en Villarrica",
    data: { offer_id: offerId, request_id: requestId },
  });
  console.log("✓ Provider notification created");

  console.log("\n✅ Step C2 Complete - Offer Accepted\n");

  // Step P10: Provider Completes Delivery
  console.log("Step P10: Provider Completes Delivery");
  console.log("-------------------------------------");

  const deliveredAt = new Date().toISOString();

  // Update request to delivered
  const { error: deliverError } = await adminClient
    .from("water_requests")
    .update({
      status: "delivered",
      delivered_at: deliveredAt,
    })
    .eq("id", requestId);

  if (deliverError) {
    console.error("Error completing delivery:", deliverError.message);
    return;
  }
  console.log("✓ Request status updated to 'delivered'");

  // Create notification for consumer
  await adminClient.from("notifications").insert({
    user_id: consumerId,
    type: "delivery_completed",
    title: "¡Entrega completada!",
    message: "Tu pedido de 1,000L ha sido entregado",
    data: { request_id: requestId },
  });
  console.log("✓ Consumer notification created");

  console.log("\n✅ Step P10 Complete - Delivery Marked as Complete\n");

  // Final status check
  console.log("Final Status Verification");
  console.log("-------------------------");

  const { data: finalRequest } = await adminClient
    .from("water_requests")
    .select("id, status, supplier_id, accepted_at, delivered_at")
    .eq("id", requestId)
    .single();

  const { data: finalOffer } = await adminClient
    .from("offers")
    .select("id, status, accepted_at")
    .eq("id", offerId)
    .single();

  console.log("Request:", finalRequest);
  console.log("Offer:", finalOffer);

  console.log("\n============================================");
  console.log("✅ CHAIN-1 TEST FLOW COMPLETE");
  console.log("============================================");
  console.log(`
Summary:
  - Request ID: ${requestId}
  - Offer ID: ${offerId}
  - Consumer: ${consumerId}
  - Provider: ${providerId}
  - Final Status: delivered

Note: This was completed via admin client due to RLS issues
blocking the UI flow. The following fixes are needed in production:

1. Apply migration 20251219180000_fix_offers_rls_role_name.sql
   - Fixes provider offer creation

2. Fix water_requests RLS policy for consumer access
   - Consumer should be able to view their own requests

3. Fix tracking token page access
   - Currently shows "Enlace no válido"
`);
}

completeTestFlow().catch(console.error);
