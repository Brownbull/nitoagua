"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  providerRegistrationSchema,
  type ProviderRegistrationData,
} from "@/lib/validations/provider-registration";
import { createAuthError, type ActionResult } from "@/lib/types/action-result";

export async function submitProviderRegistration(
  input: ProviderRegistrationData
): Promise<ActionResult> {
  console.log("[Provider Registration] Starting submission");

  // Validate input
  const validationResult = providerRegistrationSchema.safeParse(input);

  if (!validationResult.success) {
    const firstIssue = validationResult.error.issues[0];
    console.error("[Provider Registration] Validation failed:", firstIssue);
    return {
      success: false,
      error: firstIssue?.message || "Datos inválidos",
    };
  }

  const data = validationResult.data;

  // Get current user
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  // AC12.6.2.3: Return requiresLogin flag for auth failures
  if (userError || !user) {
    console.error("[Provider Registration] User not authenticated:", userError?.message);
    return createAuthError();
  }

  // Use admin client for database operations
  const adminClient = createAdminClient();

  // Check if profile already exists with verification status
  const { data: existingProfile } = await adminClient
    .from("profiles")
    .select("id, role, verification_status")
    .eq("id", user.id)
    .single();

  if (existingProfile?.verification_status) {
    console.log("[Provider Registration] User already has verification status:", existingProfile.verification_status);
    return {
      success: false,
      error: "Ya tienes una solicitud de registro enviada",
    };
  }

  try {
    // Start a transaction-like sequence
    // 1. Create or update profile
    // Note: Database only allows 'consumer' or 'supplier' as roles
    // Providers are suppliers that go through this registration flow
    const profileData = {
      id: user.id,
      role: "supplier" as const, // Providers are suppliers in the database
      name: data.name,
      phone: data.phone,
      email: user.email,
      rut: data.rut,
      avatar_url: data.avatarUrl || null,
      verification_status: "pending",
      bank_name: data.bankName,
      bank_account: `${data.accountType}|${data.accountNumber}|${data.rut}`,
      is_available: false, // Not available until approved
      // Vehicle info (Step 3 - UX alignment)
      vehicle_type: data.vehicleType,
      vehicle_capacity: data.vehicleCapacity,
      working_hours: data.workingHours || null,
      working_days: data.workingDays || null,
    };

    if (existingProfile) {
      // Update existing profile
      const { error: updateError } = await adminClient
        .from("profiles")
        .update(profileData)
        .eq("id", user.id);

      if (updateError) {
        console.error("[Provider Registration] Profile update error:", updateError);
        throw new Error("Error al actualizar perfil");
      }
    } else {
      // Create new profile
      const { error: insertError } = await adminClient
        .from("profiles")
        .insert(profileData);

      if (insertError) {
        console.error("[Provider Registration] Profile insert error:", insertError);
        throw new Error("Error al crear perfil");
      }
    }

    console.log("[Provider Registration] Profile created/updated for user:", user.id);

    // 2. Create provider_documents records
    const documentTypes = ["cedula", "licencia_conducir", "vehiculo", "permiso_sanitario", "certificacion"] as const;
    const documentRecords: {
      provider_id: string;
      type: string;
      storage_path: string;
      original_filename: string;
    }[] = [];

    for (const type of documentTypes) {
      const paths = data.documents[type];
      if (paths && paths.length > 0) {
        for (const path of paths) {
          documentRecords.push({
            provider_id: user.id,
            type,
            storage_path: path,
            original_filename: path.split("/").pop() || path,
          });
        }
      }
    }

    if (documentRecords.length > 0) {
      // First, delete any existing documents for this provider
      await adminClient
        .from("provider_documents")
        .delete()
        .eq("provider_id", user.id);

      // Insert new documents
      const { error: docsError } = await adminClient
        .from("provider_documents")
        .insert(documentRecords);

      if (docsError) {
        console.error("[Provider Registration] Documents insert error:", docsError);
        throw new Error("Error al guardar documentos");
      }

      console.log("[Provider Registration] Documents saved:", documentRecords.length);
    }

    // 3. Create provider_service_areas records
    if (data.comunaIds.length > 0) {
      // First, delete any existing service areas for this provider
      await adminClient
        .from("provider_service_areas")
        .delete()
        .eq("provider_id", user.id);

      // Insert new service areas
      const serviceAreaRecords = data.comunaIds.map((comunaId) => ({
        provider_id: user.id,
        comuna_id: comunaId,
      }));

      const { error: areasError } = await adminClient
        .from("provider_service_areas")
        .insert(serviceAreaRecords);

      if (areasError) {
        console.error("[Provider Registration] Service areas insert error:", areasError);
        throw new Error("Error al guardar áreas de servicio");
      }

      console.log("[Provider Registration] Service areas saved:", data.comunaIds);
    }

    // 4. Create admin notification
    // Get admin users to notify
    const { data: adminEmails } = await adminClient
      .from("admin_allowed_emails")
      .select("email");

    if (adminEmails && adminEmails.length > 0) {
      // Get admin profiles
      const { data: adminProfiles } = await adminClient
        .from("profiles")
        .select("id")
        .in("email", adminEmails.map((a) => a.email));

      if (adminProfiles && adminProfiles.length > 0) {
        const notificationRecords = adminProfiles.map((admin) => ({
          user_id: admin.id,
          type: "new_provider_application",
          title: "Nueva solicitud de proveedor",
          message: `${data.name} ha solicitado ser proveedor en ${data.comunaIds.join(", ")}`,
          data: { provider_id: user.id, provider_name: data.name },
        }));

        await adminClient.from("notifications").insert(notificationRecords);
        console.log("[Provider Registration] Admin notifications created");
      }
    }

    console.log("[Provider Registration] Completed successfully for user:", user.id);

    return {
      success: true,
    };
  } catch (error) {
    console.error("[Provider Registration] Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error inesperado",
    };
  }
}

/**
 * Resubmit documents for a provider with "more_info_needed" status
 * Updates provider_documents table and resets verification_status to "pending"
 */
export async function resubmitDocuments(
  uploadedPaths: Record<string, string[]>
): Promise<ActionResult> {
  console.log("[Provider Resubmit] Starting document resubmission");

  // Get current user
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  // AC12.6.2.3: Return requiresLogin flag for auth failures
  if (userError || !user) {
    console.error("[Provider Resubmit] User not authenticated:", userError?.message);
    return createAuthError();
  }

  // Use admin client for database operations
  const adminClient = createAdminClient();

  // Check if profile exists and is in "more_info_needed" status
  const { data: profile, error: profileError } = await adminClient
    .from("profiles")
    .select("id, verification_status")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    console.error("[Provider Resubmit] Profile not found:", profileError?.message);
    return {
      success: false,
      error: "Perfil no encontrado",
    };
  }

  if (profile.verification_status !== "more_info_needed") {
    console.warn("[Provider Resubmit] Invalid status for resubmission:", profile.verification_status);
    return {
      success: false,
      error: "Tu solicitud no requiere documentos adicionales en este momento",
    };
  }

  try {
    // 1. Add new document records (don't delete old ones, add new versions)
    const documentRecords: {
      provider_id: string;
      type: string;
      storage_path: string;
      original_filename: string;
    }[] = [];

    for (const [docType, paths] of Object.entries(uploadedPaths)) {
      for (const path of paths) {
        documentRecords.push({
          provider_id: user.id,
          type: docType,
          storage_path: path,
          original_filename: path.split("/").pop() || path,
        });
      }
    }

    if (documentRecords.length > 0) {
      const { error: docsError } = await adminClient
        .from("provider_documents")
        .insert(documentRecords);

      if (docsError) {
        console.error("[Provider Resubmit] Documents insert error:", docsError);
        throw new Error("Error al guardar documentos");
      }

      console.log("[Provider Resubmit] Documents saved:", documentRecords.length);
    }

    // 2. Update profile status back to "pending"
    const { error: updateError } = await adminClient
      .from("profiles")
      .update({
        verification_status: "pending",
        rejection_reason: null, // Clear the previous rejection reason
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("[Provider Resubmit] Profile update error:", updateError);
      throw new Error("Error al actualizar estado");
    }

    // 3. Create admin notification about resubmission
    const { data: adminEmails } = await adminClient
      .from("admin_allowed_emails")
      .select("email");

    if (adminEmails && adminEmails.length > 0) {
      const { data: adminProfiles } = await adminClient
        .from("profiles")
        .select("id")
        .in("email", adminEmails.map((a) => a.email));

      if (adminProfiles && adminProfiles.length > 0) {
        const { data: providerProfile } = await adminClient
          .from("profiles")
          .select("name")
          .eq("id", user.id)
          .single();

        const notificationRecords = adminProfiles.map((admin) => ({
          user_id: admin.id,
          type: "provider_documents_resubmitted",
          title: "Documentos reenviados",
          message: `${providerProfile?.name || "Un proveedor"} ha reenviado documentos solicitados`,
          data: { provider_id: user.id, document_types: Object.keys(uploadedPaths) },
        }));

        await adminClient.from("notifications").insert(notificationRecords);
        console.log("[Provider Resubmit] Admin notifications created");
      }
    }

    console.log("[Provider Resubmit] Completed successfully for user:", user.id);

    return {
      success: true,
    };
  } catch (error) {
    console.error("[Provider Resubmit] Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error inesperado",
    };
  }
}
