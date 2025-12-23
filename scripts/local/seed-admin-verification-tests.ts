#!/usr/bin/env npx ts-node

/**
 * Seed Admin Verification Workflow Test Data
 *
 * Creates providers in various verification states with documents
 * for testing the A1-A4 admin verification workflow.
 *
 * Usage:
 *   npm run seed:verification          # Seed verification test data
 *   npm run seed:verification:clean    # Remove verification test data
 *
 * Test Providers Created:
 *   - pending-provider1@test.local    (pending, has documents)
 *   - pending-provider2@test.local    (pending, no documents)
 *   - moreinfo-provider@test.local    (more_info_needed, has documents)
 *   - rejected-provider@test.local    (rejected, with reason)
 *   - approved-provider@test.local    (approved, verified)
 */

import { createClient } from "@supabase/supabase-js";

// Local Supabase configuration (default)
const LOCAL_CONFIG = {
  url: "http://127.0.0.1:55326",
  serviceRoleKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU",
};

// Production config via environment variables
const PROD_CONFIG = {
  url: process.env.SUPABASE_URL || "",
  serviceRoleKey: process.env.SUPABASE_SERVICE_KEY || "",
};

// Use production if env vars are set, otherwise local
const useProduction = !!(PROD_CONFIG.url && PROD_CONFIG.serviceRoleKey);
const CONFIG = useProduction ? PROD_CONFIG : LOCAL_CONFIG;

// Deterministic UUIDs for test data
const TEST_PROVIDER_IDS = {
  pending1: "d1111111-1111-1111-1111-111111111111",
  pending2: "d2222222-2222-2222-2222-222222222222",
  moreInfo: "d3333333-3333-3333-3333-333333333333",
  rejected: "d4444444-4444-4444-4444-444444444444",
  approved: "d5555555-5555-5555-5555-555555555555",
};

const TEST_DOCUMENT_IDS = {
  pending1_carnet: "e1111111-1111-1111-1111-111111111111",
  pending1_truck: "e1111111-1111-1111-1111-111111111112",
  pending1_license: "e1111111-1111-1111-1111-111111111113",
  moreInfo_carnet: "e3333333-3333-3333-3333-333333333331",
  approved_carnet: "e5555555-5555-5555-5555-555555555551",
  approved_truck: "e5555555-5555-5555-5555-555555555552",
};

// Test providers with various verification states
const TEST_PROVIDERS = [
  {
    email: "pending-provider1@test.local",
    password: "TestPending1!",
    profile: {
      id: TEST_PROVIDER_IDS.pending1,
      role: "supplier",
      name: "Juan Pendiente Uno",
      phone: "+56911111111",
      service_area: "villarrica",
      verification_status: "pending",
      bank_name: "Banco Estado",
      bank_account: "1234567890",
    },
    documents: [
      {
        id: TEST_DOCUMENT_IDS.pending1_carnet,
        type: "cedula",
        storage_path: "test/pending1-cedula.jpg",
        original_filename: "cedula.jpg",
      },
      {
        id: TEST_DOCUMENT_IDS.pending1_truck,
        type: "vehiculo",
        storage_path: "test/pending1-camion.jpg",
        original_filename: "mi-camion.jpg",
      },
      {
        id: TEST_DOCUMENT_IDS.pending1_license,
        type: "licencia",
        storage_path: "test/pending1-licencia.jpg",
        original_filename: "licencia-conducir.jpg",
      },
    ],
  },
  {
    email: "pending-provider2@test.local",
    password: "TestPending2!",
    profile: {
      id: TEST_PROVIDER_IDS.pending2,
      role: "supplier",
      name: "Maria Pendiente Dos",
      phone: "+56922222222",
      service_area: "pucon",
      verification_status: "pending",
      bank_name: "Banco Santander",
      bank_account: "9876543210",
    },
    documents: [], // No documents - incomplete application
  },
  {
    email: "moreinfo-provider@test.local",
    password: "TestMoreInfo!",
    profile: {
      id: TEST_PROVIDER_IDS.moreInfo,
      role: "supplier",
      name: "Carlos Mas Info",
      phone: "+56933333333",
      service_area: "lican-ray",
      verification_status: "more_info_needed",
      rejection_reason: "Documentos faltantes: licencia, vehiculo",
      bank_name: "Banco de Chile",
      bank_account: "5555555555",
    },
    documents: [
      {
        id: TEST_DOCUMENT_IDS.moreInfo_carnet,
        type: "cedula",
        storage_path: "test/moreinfo-cedula.jpg",
        original_filename: "mi-cedula.jpg",
      },
    ],
  },
  {
    email: "rejected-provider@test.local",
    password: "TestRejected!",
    profile: {
      id: TEST_PROVIDER_IDS.rejected,
      role: "supplier",
      name: "Pedro Rechazado",
      phone: "+56944444444",
      service_area: "villarrica",
      verification_status: "rejected",
      rejection_reason: "Documentos ilegibles. Fotos borrosas del vehiculo.",
      bank_name: null,
      bank_account: null,
    },
    documents: [],
  },
  {
    email: "approved-provider@test.local",
    password: "TestApproved!",
    profile: {
      id: TEST_PROVIDER_IDS.approved,
      role: "supplier",
      name: "Ana Aprobada",
      phone: "+56955555555",
      service_area: "pucon",
      verification_status: "approved",
      is_available: true,
      bank_name: "Banco BCI",
      bank_account: "7777777777",
      internal_notes: "Proveedor verificado. Documentos en orden.",
    },
    documents: [
      {
        id: TEST_DOCUMENT_IDS.approved_carnet,
        type: "cedula",
        storage_path: "test/approved-cedula.jpg",
        original_filename: "cedula-verificada.jpg",
        verified_at: new Date().toISOString(),
      },
      {
        id: TEST_DOCUMENT_IDS.approved_truck,
        type: "vehiculo",
        storage_path: "test/approved-camion.jpg",
        original_filename: "camion-verificado.jpg",
        verified_at: new Date().toISOString(),
      },
    ],
  },
];

const isClean = process.argv.includes("--clean");

async function main() {
  const targetName = useProduction ? "PRODUCTION" : "LOCAL";
  console.log("\n🔐 Admin Verification Workflow Test Data");
  console.log(`   Target: ${targetName} (${CONFIG.url})`);
  console.log(`   Mode: ${isClean ? "CLEAN" : "SEED"}`);

  if (useProduction) {
    console.log("\n⚠️  WARNING: Operating on PRODUCTION database!");
  }

  const supabase = createClient(CONFIG.url, CONFIG.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  if (isClean) {
    await cleanTestData(supabase);
  } else {
    await seedTestData(supabase);
    await verifySeededData(supabase);
  }

  console.log("\n✅ Done!\n");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function seedTestData(supabase: any) {
  console.log("\n📧 Seeding test providers...");

  for (const provider of TEST_PROVIDERS) {
    // Check if user exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingUser = existingUsers?.users?.find((u: any) => u.email === provider.email);

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
      console.log(`   ⏭️  User exists: ${provider.email} (${userId.slice(0, 8)}...)`);
    } else {
      // Create auth user
      const { data, error } = await supabase.auth.admin.createUser({
        email: provider.email,
        password: provider.password,
        email_confirm: true,
      });

      if (error) {
        console.error(`   ❌ Error creating user ${provider.email}: ${error.message}`);
        continue;
      }

      userId = data.user!.id;
      console.log(`   ✓ Created user: ${provider.email} (${userId.slice(0, 8)}...)`);
    }

    // Upsert profile
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(
        {
          id: userId,
          email: provider.email,
          role: provider.profile.role,
          name: provider.profile.name,
          phone: provider.profile.phone,
          service_area: provider.profile.service_area,
          verification_status: provider.profile.verification_status,
          bank_name: provider.profile.bank_name,
          bank_account: provider.profile.bank_account,
          rejection_reason: (provider.profile as Record<string, unknown>).rejection_reason || null,
          internal_notes: (provider.profile as Record<string, unknown>).internal_notes || null,
          is_available: (provider.profile as Record<string, unknown>).is_available || false,
        },
        { onConflict: "id" }
      );

    if (profileError) {
      console.error(`   ❌ Error upserting profile: ${profileError.message}`);
    } else {
      console.log(`   ✓ Profile: ${provider.profile.name} (${provider.profile.verification_status})`);
    }

    // Add documents
    if (provider.documents.length > 0) {
      // Delete existing documents for this provider first
      await supabase
        .from("provider_documents")
        .delete()
        .eq("provider_id", userId);

      // Insert new documents
      const docs = provider.documents.map((doc) => ({
        ...doc,
        provider_id: userId,
        uploaded_at: new Date().toISOString(),
      }));

      const { error: docsError } = await supabase
        .from("provider_documents")
        .insert(docs);

      if (docsError) {
        console.error(`   ❌ Error adding documents: ${docsError.message}`);
      } else {
        console.log(`   ✓ Added ${docs.length} document(s)`);
      }
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function cleanTestData(supabase: any) {
  console.log("\n🗑️  Cleaning verification test data...");

  // Get all test user IDs
  const testEmails = TEST_PROVIDERS.map((p) => p.email);
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const testUserIds = existingUsers?.users
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ?.filter((u: any) => testEmails.includes(u.email))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((u: any) => u.id) || [];

  if (testUserIds.length === 0) {
    console.log("   ⏭️  No test users found");
    return;
  }

  // Delete documents first
  const { error: docsError, count: docsCount } = await supabase
    .from("provider_documents")
    .delete({ count: "exact" })
    .in("provider_id", testUserIds);

  if (docsError) {
    console.error(`   ❌ Error deleting documents: ${docsError.message}`);
  } else {
    console.log(`   ✓ Deleted ${docsCount || 0} documents`);
  }

  // Delete profiles
  const { error: profileError, count: profileCount } = await supabase
    .from("profiles")
    .delete({ count: "exact" })
    .in("id", testUserIds);

  if (profileError) {
    console.error(`   ❌ Error deleting profiles: ${profileError.message}`);
  } else {
    console.log(`   ✓ Deleted ${profileCount || 0} profiles`);
  }

  // Delete auth users
  for (const userId of testUserIds) {
    await supabase.auth.admin.deleteUser(userId);
  }
  console.log(`   ✓ Deleted ${testUserIds.length} auth users`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function verifySeededData(supabase: any) {
  console.log("\n🔍 Verifying seeded data...");

  const errors: string[] = [];

  // Count pending providers
  const { count: pendingCount, error: pendingError } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "supplier")
    .eq("verification_status", "pending");

  if (pendingError) {
    errors.push(`Failed to count pending providers: ${pendingError.message}`);
  } else if (pendingCount === 0) {
    errors.push("No pending providers found");
  } else {
    console.log(`   ✓ Found ${pendingCount} pending provider(s)`);
  }

  // Count more_info_needed providers
  const { count: moreInfoCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "supplier")
    .eq("verification_status", "more_info_needed");

  console.log(`   ✓ Found ${moreInfoCount || 0} more_info_needed provider(s)`);

  // Check documents exist
  const { count: docsCount, error: docsError } = await supabase
    .from("provider_documents")
    .select("*", { count: "exact", head: true })
    .like("storage_path", "test/%");

  if (docsError) {
    errors.push(`Failed to count documents: ${docsError.message}`);
  } else {
    console.log(`   ✓ Found ${docsCount || 0} test document(s)`);
  }

  if (errors.length > 0) {
    console.error("\n❌ Verification FAILED:");
    for (const error of errors) {
      console.error(`   - ${error}`);
    }
    throw new Error("Seeded data verification failed");
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ Verification Test Data Summary:");
  console.log("=".repeat(60));
  console.log("\nTest Providers Created:");
  for (const provider of TEST_PROVIDERS) {
    console.log(`   ${provider.profile.verification_status.padEnd(15)} | ${provider.email}`);
    if (provider.documents.length > 0) {
      console.log(`                   | └─ ${provider.documents.length} document(s)`);
    }
  }
  console.log("\n" + "=".repeat(60));
}

main().catch((error) => {
  console.error("\n❌ Error:", error);
  process.exit(1);
});
