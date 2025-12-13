#!/usr/bin/env npx ts-node

/**
 * Seed admin user for local development
 */

import { createClient } from "@supabase/supabase-js";

const LOCAL_CONFIG = {
  url: "http://127.0.0.1:55326",
  serviceRoleKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU",
};

const ADMIN_USER = {
  email: "admin@nitoagua.cl",
  password: "Admin123!",
  profile: {
    role: "consumer",
    name: "Admin Test User",
    phone: "+56900000000",
  },
};

async function createAdmin() {
  console.log("🔐 Creating admin user...");

  const supabase = createClient(LOCAL_CONFIG.url, LOCAL_CONFIG.serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existingUser = existingUsers?.users?.find(u => u.email === ADMIN_USER.email);

  if (existingUser) {
    console.log("✓ Admin user already exists:", existingUser.id);

    // Check if profile exists
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", existingUser.id)
      .single();

    if (!profile) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: existingUser.id,
        ...ADMIN_USER.profile,
      });

      if (profileError) {
        console.error("Error creating profile:", profileError.message);
        process.exit(1);
      }
      console.log("✓ Profile created for existing user");
    }
    return;
  }

  const { data: newUser, error } = await supabase.auth.admin.createUser({
    email: ADMIN_USER.email,
    password: ADMIN_USER.password,
    email_confirm: true,
  });

  if (error) {
    console.error("Error creating admin user:", error.message);
    process.exit(1);
  }

  console.log("✓ Created admin user:", newUser.user.id);

  const { error: profileError } = await supabase.from("profiles").insert({
    id: newUser.user.id,
    ...ADMIN_USER.profile,
  });

  if (profileError) {
    console.error("Error creating profile:", profileError.message);
    process.exit(1);
  }

  console.log("\n✅ Admin user created successfully!");
  console.log("   Email:", ADMIN_USER.email);
  console.log("   Password:", ADMIN_USER.password);
}

createAdmin().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
