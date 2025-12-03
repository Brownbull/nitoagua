"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  supplierProfileSchema,
  type SupplierProfileInput,
} from "@/lib/validations/supplier-profile";

interface ActionResult {
  success: boolean;
  error?: string;
}

export async function createSupplierProfile(
  input: SupplierProfileInput
): Promise<ActionResult> {
  // Validate input
  const validationResult = supplierProfileSchema.safeParse(input);

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
    console.error("[PROFILE] User not authenticated:", userError?.message);
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
    role: "supplier",
    name: data.name,
    phone: data.phone,
    service_area: data.serviceArea,
    price_100l: data.price100l,
    price_1000l: data.price1000l,
    price_5000l: data.price5000l,
    price_10000l: data.price10000l,
    is_available: true,
  });

  if (insertError) {
    console.error("[PROFILE] Insert error:", insertError.message);
    return {
      success: false,
      error: "Error al crear el perfil. Intenta de nuevo.",
    };
  }

  console.log("[PROFILE] Created supplier profile for user:", user.id);

  return {
    success: true,
  };
}
