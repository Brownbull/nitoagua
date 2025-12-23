#!/usr/bin/env npx ts-node

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

async function main() {
  const requestId = "fc833a0f-7cbe-4861-9530-dc63e8d607c5";

  const { data, error } = await adminClient
    .from("water_requests")
    .select("id, tracking_token, status, consumer_id")
    .eq("id", requestId)
    .single();

  if (error) {
    console.error("Error:", error);
    return;
  }

  console.log("Request info:");
  console.log(data);
  console.log("\nTracking URL: https://nitoagua.vercel.app/track/" + data.tracking_token);
}

main().catch(console.error);
