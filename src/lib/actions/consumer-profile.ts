"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  consumerOnboardingSchema,
  type ConsumerOnboardingInput,
} from "@/lib/validations/consumer-profile";

interface ActionResult {
  success: boolean;
  error?: string;
}

export async function createConsumerProfile(
  input: ConsumerOnboardingInput
): Promise<ActionResult> {
  // Validate input
  const validationResult = consumerOnboardingSchema.safeParse(input);

  if (!validationResult.success) {
    // Zod v4 uses 'issues' instead of 'errors'
    const firstIssue = validationResult.error.issues[0];
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

  if (userError || !user) {
    console.error("[CONSUMER-PROFILE] User not authenticated:", userError?.message);
    return {
      success: false,
      error: "Debes iniciar sesión para crear un perfil",
    };
  }

  // Check if profile already exists
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (existingProfile) {
    return {
      success: false,
      error: "Ya tienes un perfil creado",
    };
  }

  // Use admin client to bypass RLS for profile creation
  const adminClient = createAdminClient();

  const { error: insertError } = await adminClient.from("profiles").insert({
    id: user.id,
    role: "consumer",
    name: data.name,
    phone: data.phone,
    address: data.address,
    special_instructions: data.specialInstructions,
  });

  if (insertError) {
    console.error("[CONSUMER-PROFILE] Insert error:", insertError.message);
    return {
      success: false,
      error: "Error al crear el perfil. Intenta de nuevo.",
    };
  }

  console.log("[CONSUMER-PROFILE] Created consumer profile for user:", user.id);

  return {
    success: true,
  };
}

// Update profile input type (same as onboarding)
interface UpdateProfileInput {
  name: string;
  phone: string;
  address: string;
  specialInstructions: string;
}

export async function updateConsumerProfile(
  input: UpdateProfileInput
): Promise<ActionResult> {
  // Validate input using the same schema
  const validationResult = consumerOnboardingSchema.safeParse(input);

  if (!validationResult.success) {
    const firstIssue = validationResult.error.issues[0];
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

  if (userError || !user) {
    console.error("[CONSUMER-PROFILE] User not authenticated:", userError?.message);
    return {
      success: false,
      error: "Debes iniciar sesión para actualizar tu perfil",
    };
  }

  // Use admin client to bypass RLS for profile update
  const adminClient = createAdminClient();

  const { error: updateError } = await adminClient
    .from("profiles")
    .update({
      name: data.name,
      phone: data.phone,
      address: data.address,
      special_instructions: data.specialInstructions,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (updateError) {
    console.error("[CONSUMER-PROFILE] Update error:", updateError.message);
    return {
      success: false,
      error: "Error al actualizar el perfil. Intenta de nuevo.",
    };
  }

  console.log("[CONSUMER-PROFILE] Updated consumer profile for user:", user.id);

  return {
    success: true,
  };
}
