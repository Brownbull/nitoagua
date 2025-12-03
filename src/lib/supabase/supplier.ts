import { createClient } from "@/lib/supabase/server";

/**
 * Get supplier phone number for MVP (single supplier)
 * Queries the profiles table for the first supplier
 * @returns Phone number string or null if not found
 */
export async function getSupplierPhone(): Promise<string | null> {
  const supabase = await createClient();

  const { data: supplier } = await supabase
    .from("profiles")
    .select("phone")
    .eq("role", "supplier")
    .limit(1)
    .single();

  return supplier?.phone ?? null;
}
