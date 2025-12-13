#!/usr/bin/env npx ts-node

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "http://127.0.0.1:55326",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU",
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function resetAdmin() {
  const EMAIL = "admin@nitoagua.local";
  const PASSWORD = "admin.123";

  console.log("🔐 Resetting admin user...");
  console.log(`   Email: ${EMAIL}`);
  console.log(`   Password: ${PASSWORD}`);

  // Find and delete existing admin
  const { data: users } = await supabase.auth.admin.listUsers();
  const admin = users?.users?.find((u) => u.email === EMAIL);

  if (admin) {
    console.log("\n🗑️  Deleting existing admin user...");
    await supabase.from("profiles").delete().eq("id", admin.id);
    await supabase.auth.admin.deleteUser(admin.id);
    console.log(`   ✓ Deleted user: ${admin.id}`);
  }

  // Create new admin with correct password
  console.log("\n✨ Creating new admin user...");
  const { data, error } = await supabase.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { name: "Admin Test User" },
  });

  if (error) {
    console.error("   ✗ Error:", error.message);
    process.exit(1);
  }

  console.log(`   ✓ Created user: ${data.user.id}`);

  // Create profile (role must be 'consumer' or 'supplier' per constraint)
  const { error: profileError } = await supabase.from("profiles").upsert({
    id: data.user.id,
    email: EMAIL,
    role: "consumer", // Admin access is via admin_users table, not profile role
    name: "Admin Test User",
    phone: "+56900000000",
  });

  if (profileError) {
    console.error("   ✗ Profile error:", profileError.message);
    process.exit(1);
  }

  console.log("   ✓ Profile created");

  // Add to admin_allowed_emails table for admin access
  const { error: adminError } = await supabase.from("admin_allowed_emails").upsert(
    {
      email: EMAIL,
      added_by: data.user.id  // Self-added for initial setup
    },
    { onConflict: "email" }
  );

  if (adminError) {
    console.error("   ✗ Admin allowlist error:", adminError.message);
    process.exit(1);
  }

  console.log("   ✓ Added to admin_allowed_emails");
  console.log("\n✅ Admin user ready!");
  console.log(`   Login at: http://localhost:3000/admin/login`);
}

resetAdmin();
