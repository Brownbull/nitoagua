"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  adminSettingsSchema,
  DEFAULT_ADMIN_SETTINGS,
  type AdminSettingsInput,
  pricingSettingsSchema,
  DEFAULT_PRICING_SETTINGS,
  type PricingSettingsInput,
} from "@/lib/validations/admin";
import { AUTH_ERROR_MESSAGE } from "@/lib/types/action-result";

/**
 * Local ActionResult interface that maintains backward compatibility
 * while adding requiresLogin flag for session expiry handling
 * AC12.6.2.4: Added requiresLogin flag for admin actions
 */
interface ActionResult<T = void> {
  success: boolean;
  error?: string;
  data?: T;
  /** AC12.6.2.4: True when user needs to re-authenticate */
  requiresLogin?: boolean;
}

/**
 * Get current admin settings from database
 * Falls back to defaults if settings don't exist
 */
export async function getSettings(): Promise<ActionResult<AdminSettingsInput>> {
  try {
    const supabase = await createClient();

    // Verify user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    // AC12.6.2.4: Return requiresLogin flag for auth failures
    if (userError || !user) {
      return {
        success: false,
        error: AUTH_ERROR_MESSAGE,
        requiresLogin: true,
      };
    }

    // Use admin client to read settings (bypasses RLS)
    const adminClient = createAdminClient();
    const { data: settings, error } = await adminClient
      .from("admin_settings")
      .select("key, value");

    if (error) {
      console.error("[ADMIN] Error fetching settings:", error.message);
      return {
        success: false,
        error: "Error al cargar configuracion",
      };
    }

    // Build settings object from database rows
    const settingsMap: Record<string, number> = {};
    for (const setting of settings || []) {
      // JSONB value is stored as { value: number }
      const value = typeof setting.value === "object" && setting.value !== null
        ? (setting.value as { value: number }).value
        : setting.value as number;
      settingsMap[setting.key] = value;
    }

    // Merge with defaults for any missing settings
    const result: AdminSettingsInput = {
      offer_validity_default:
        settingsMap.offer_validity_default ??
        DEFAULT_ADMIN_SETTINGS.offer_validity_default,
      offer_validity_min:
        settingsMap.offer_validity_min ??
        DEFAULT_ADMIN_SETTINGS.offer_validity_min,
      offer_validity_max:
        settingsMap.offer_validity_max ??
        DEFAULT_ADMIN_SETTINGS.offer_validity_max,
      request_timeout_hours:
        settingsMap.request_timeout_hours ??
        DEFAULT_ADMIN_SETTINGS.request_timeout_hours,
    };

    console.log("[ADMIN] Settings loaded for user:", user.email);

    return {
      success: true,
      data: result,
    };
  } catch (err) {
    console.error("[ADMIN] Unexpected error in getSettings:", err);
    return {
      success: false,
      error: "Error inesperado al cargar configuracion",
    };
  }
}

/**
 * Update admin settings
 * Validates input and upserts each setting to database
 */
export async function updateSettings(
  input: AdminSettingsInput
): Promise<ActionResult<AdminSettingsInput>> {
  try {
    // Validate input
    const validationResult = adminSettingsSchema.safeParse(input);

    if (!validationResult.success) {
      const firstIssue = validationResult.error.issues[0];
      return {
        success: false,
        error: firstIssue?.message || "Datos invalidos",
      };
    }

    const data = validationResult.data;

    // Get current user
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    // AC12.6.2.4: Return requiresLogin flag for auth failures
    if (userError || !user) {
      console.error("[ADMIN] User not authenticated:", userError?.message);
      return {
        success: false,
        error: AUTH_ERROR_MESSAGE,
        requiresLogin: true,
      };
    }

    // Verify user is admin
    const { data: adminEmail } = await supabase
      .from("admin_allowed_emails")
      .select("email")
      .eq("email", user.email as string)
      .single();

    if (!adminEmail) {
      console.error("[ADMIN] Non-admin attempting to update settings:", user.email);
      return {
        success: false,
        error: "No tienes permisos de administrador",
      };
    }

    // Use admin client to update settings
    const adminClient = createAdminClient();

    // Get user's profile ID for updated_by
    const { data: profile } = await adminClient
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    const updatedBy = profile?.id || null;
    const timestamp = new Date().toISOString();

    // Prepare settings to upsert
    const settingsToUpsert = [
      {
        key: "offer_validity_default",
        value: { value: data.offer_validity_default },
        updated_by: updatedBy,
        updated_at: timestamp,
      },
      {
        key: "offer_validity_min",
        value: { value: data.offer_validity_min },
        updated_by: updatedBy,
        updated_at: timestamp,
      },
      {
        key: "offer_validity_max",
        value: { value: data.offer_validity_max },
        updated_by: updatedBy,
        updated_at: timestamp,
      },
      {
        key: "request_timeout_hours",
        value: { value: data.request_timeout_hours },
        updated_by: updatedBy,
        updated_at: timestamp,
      },
    ];

    // Upsert all settings
    const { error: upsertError } = await adminClient
      .from("admin_settings")
      .upsert(settingsToUpsert, { onConflict: "key" });

    if (upsertError) {
      console.error("[ADMIN] Error updating settings:", upsertError.message);
      return {
        success: false,
        error: "Error al guardar configuracion",
      };
    }

    console.log(
      `[ADMIN] Settings updated by ${user.email} at ${timestamp}:`,
      JSON.stringify(data)
    );

    return {
      success: true,
      data: data,
    };
  } catch (err) {
    console.error("[ADMIN] Unexpected error in updateSettings:", err);
    return {
      success: false,
      error: "Error inesperado al guardar configuracion",
    };
  }
}

/**
 * Helper to parse price tier from database value
 * Handles both new format {min, suggested, max} and legacy format (single number)
 */
function parsePriceTier(
  dbValue: unknown,
  defaultTier: { min: number; suggested: number; max: number }
): { min: number; suggested: number; max: number } {
  if (!dbValue || typeof dbValue !== "object") {
    return defaultTier;
  }

  const obj = dbValue as Record<string, unknown>;

  // New format: { min, suggested, max }
  if ("min" in obj && "suggested" in obj && "max" in obj) {
    return {
      min: typeof obj.min === "number" ? obj.min : defaultTier.min,
      suggested: typeof obj.suggested === "number" ? obj.suggested : defaultTier.suggested,
      max: typeof obj.max === "number" ? obj.max : defaultTier.max,
    };
  }

  // Legacy format: { value: number } - use as suggested, calculate min/max
  if ("value" in obj && typeof obj.value === "number") {
    const suggested = obj.value;
    return {
      min: Math.round(suggested * 0.8), // 20% below suggested
      suggested,
      max: Math.round(suggested * 1.3), // 30% above suggested
    };
  }

  return defaultTier;
}

/**
 * Get current pricing settings from database
 * Falls back to defaults if settings don't exist
 * Supports both new format (min/suggested/max) and legacy format (single value)
 */
export async function getPricingSettings(): Promise<ActionResult<PricingSettingsInput>> {
  try {
    const supabase = await createClient();

    // Verify user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    // AC12.6.2.4: Return requiresLogin flag for auth failures
    if (userError || !user) {
      return {
        success: false,
        error: AUTH_ERROR_MESSAGE,
        requiresLogin: true,
      };
    }

    // Use admin client to read settings (bypasses RLS)
    const adminClient = createAdminClient();
    const { data: settings, error } = await adminClient
      .from("admin_settings")
      .select("key, value");

    if (error) {
      console.error("[ADMIN] Error fetching pricing settings:", error.message);
      return {
        success: false,
        error: "Error al cargar configuracion de precios",
      };
    }

    // Build settings map from database rows
    const settingsMap: Record<string, unknown> = {};
    for (const setting of settings || []) {
      settingsMap[setting.key] = setting.value;
    }

    // Parse price tiers (handles both new and legacy formats)
    const result: PricingSettingsInput = {
      price_100l: parsePriceTier(settingsMap.price_100l, DEFAULT_PRICING_SETTINGS.price_100l),
      price_1000l: parsePriceTier(settingsMap.price_1000l, DEFAULT_PRICING_SETTINGS.price_1000l),
      price_5000l: parsePriceTier(settingsMap.price_5000l, DEFAULT_PRICING_SETTINGS.price_5000l),
      price_10000l: parsePriceTier(settingsMap.price_10000l, DEFAULT_PRICING_SETTINGS.price_10000l),
      urgency_surcharge_percent: (() => {
        const val = settingsMap.urgency_surcharge_percent;
        if (typeof val === "object" && val !== null && "value" in val) {
          return (val as { value: number }).value;
        }
        return typeof val === "number" ? val : DEFAULT_PRICING_SETTINGS.urgency_surcharge_percent;
      })(),
      default_commission_percent: (() => {
        const val = settingsMap.default_commission_percent;
        if (typeof val === "object" && val !== null && "value" in val) {
          return (val as { value: number }).value;
        }
        return typeof val === "number" ? val : DEFAULT_PRICING_SETTINGS.default_commission_percent;
      })(),
    };

    console.log("[ADMIN] Pricing settings loaded for user:", user.email);

    return {
      success: true,
      data: result,
    };
  } catch (err) {
    console.error("[ADMIN] Unexpected error in getPricingSettings:", err);
    return {
      success: false,
      error: "Error inesperado al cargar configuracion de precios",
    };
  }
}

/**
 * Update pricing settings
 * Validates input and upserts each setting to database
 * Stores price tiers with min/suggested/max structure
 */
export async function updatePricingSettings(
  input: PricingSettingsInput
): Promise<ActionResult<PricingSettingsInput>> {
  try {
    // Validate input
    const validationResult = pricingSettingsSchema.safeParse(input);

    if (!validationResult.success) {
      const firstIssue = validationResult.error.issues[0];
      return {
        success: false,
        error: firstIssue?.message || "Datos invalidos",
      };
    }

    const data = validationResult.data;

    // Get current user
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    // AC12.6.2.4: Return requiresLogin flag for auth failures
    if (userError || !user) {
      console.error("[ADMIN] User not authenticated:", userError?.message);
      return {
        success: false,
        error: AUTH_ERROR_MESSAGE,
        requiresLogin: true,
      };
    }

    // Verify user is admin
    const { data: adminEmail } = await supabase
      .from("admin_allowed_emails")
      .select("email")
      .eq("email", user.email as string)
      .single();

    if (!adminEmail) {
      console.error("[ADMIN] Non-admin attempting to update pricing:", user.email);
      return {
        success: false,
        error: "No tienes permisos de administrador",
      };
    }

    // Use admin client to update settings
    const adminClient = createAdminClient();

    // Get user's profile ID for updated_by
    const { data: profile } = await adminClient
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    const updatedBy = profile?.id || null;
    const timestamp = new Date().toISOString();

    // Prepare settings to upsert - price tiers now have min/suggested/max structure
    const settingsToUpsert = [
      {
        key: "price_100l",
        value: data.price_100l, // { min, suggested, max }
        updated_by: updatedBy,
        updated_at: timestamp,
      },
      {
        key: "price_1000l",
        value: data.price_1000l, // { min, suggested, max }
        updated_by: updatedBy,
        updated_at: timestamp,
      },
      {
        key: "price_5000l",
        value: data.price_5000l, // { min, suggested, max }
        updated_by: updatedBy,
        updated_at: timestamp,
      },
      {
        key: "price_10000l",
        value: data.price_10000l, // { min, suggested, max }
        updated_by: updatedBy,
        updated_at: timestamp,
      },
      {
        key: "urgency_surcharge_percent",
        value: { value: data.urgency_surcharge_percent },
        updated_by: updatedBy,
        updated_at: timestamp,
      },
      {
        key: "default_commission_percent",
        value: { value: data.default_commission_percent },
        updated_by: updatedBy,
        updated_at: timestamp,
      },
    ];

    // Upsert all settings
    const { error: upsertError } = await adminClient
      .from("admin_settings")
      .upsert(settingsToUpsert, { onConflict: "key" });

    if (upsertError) {
      console.error("[ADMIN] Error updating pricing settings:", upsertError.message);
      return {
        success: false,
        error: "Error al guardar configuracion de precios",
      };
    }

    console.log(
      `[ADMIN] Pricing settings updated by ${user.email} at ${timestamp}:`,
      JSON.stringify(data)
    );

    return {
      success: true,
      data: data,
    };
  } catch (err) {
    console.error("[ADMIN] Unexpected error in updatePricingSettings:", err);
    return {
      success: false,
      error: "Error inesperado al guardar configuracion de precios",
    };
  }
}

/**
 * Get urgency surcharge percentage from admin settings
 * Public function - no authentication required (read-only)
 * Story 12-4: AC12.4.2 - Dynamic surcharge display
 *
 * @returns Urgency surcharge percentage (default 10 if not set)
 */
export async function getUrgencySurchargePercent(): Promise<number> {
  try {
    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from("admin_settings")
      .select("value")
      .eq("key", "urgency_surcharge_percent")
      .single();

    if (error || !data) {
      console.log("[ADMIN] Urgency surcharge not found in DB, using default 10%");
      return DEFAULT_PRICING_SETTINGS.urgency_surcharge_percent;
    }

    // JSONB value is stored as { value: number }
    const value = typeof data.value === "object" && data.value !== null
      ? (data.value as { value: number }).value
      : (data.value as number);

    return value ?? DEFAULT_PRICING_SETTINGS.urgency_surcharge_percent;
  } catch (err) {
    console.error("[ADMIN] Error fetching urgency surcharge:", err);
    return DEFAULT_PRICING_SETTINGS.urgency_surcharge_percent;
  }
}
