#!/usr/bin/env npx ts-node

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

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function updateProviderVehicle() {
  const providerId = "cb0c1a7a-f734-4295-95cd-9d5e5f7e4ee4";

  console.log("Updating provider vehicle info...");

  // Update profile with vehicle info
  const { error } = await supabase
    .from("profiles")
    .update({
      vehicle_type: "camion",
      vehicle_capacity: 10000,
      verification_status: "approved",
      is_available: true
    })
    .eq("id", providerId);

  if (error) {
    console.error("Error:", error.message);
  } else {
    console.log("✓ Provider vehicle info updated");
  }

  // Verify
  const { data } = await supabase
    .from("profiles")
    .select("vehicle_type, vehicle_capacity, verification_status, is_available")
    .eq("id", providerId)
    .single();

  console.log("Provider profile:", data);
}

updateProviderVehicle().catch(console.error);
