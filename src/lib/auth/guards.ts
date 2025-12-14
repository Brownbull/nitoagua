import { redirect } from "next/navigation";
import { unstable_cache } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { User } from "@supabase/supabase-js";

/**
 * Admin auth guard - ensures user is authenticated and in admin allowlist
 * Use in server components or layouts that require admin access
 *
 * @returns The authenticated admin user
 * @throws Redirects to /admin/login if not authenticated
 * @throws Redirects to /admin/not-authorized if not an admin
 */
export async function requireAdmin(): Promise<User> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If not authenticated or no email, redirect to admin login
  if (!user || !user.email) {
    console.log("[AUTH GUARD] Unauthenticated access to admin area, redirecting to login");
    redirect("/admin/login");
  }

  // Check if user email is in admin allowlist
  const { data: adminEmail, error: adminCheckError } = await supabase
    .from("admin_allowed_emails")
    .select("email")
    .eq("email", user.email as string)
    .single();

  if (adminCheckError && adminCheckError.code !== "PGRST116") {
    // PGRST116 = no rows returned (expected for non-admin users)
    console.error("[AUTH GUARD] Admin check error:", adminCheckError.message);
  }

  // If not in admin allowlist, redirect to not-authorized
  if (!adminEmail) {
    console.log("[AUTH GUARD] Non-admin accessing admin area, redirecting:", user.email);
    redirect("/admin/not-authorized");
  }

  return user;
}

/**
 * Cached admin check - caches the result for 5 minutes per email
 * Uses admin client since unstable_cache cannot access request cookies
 */
const getCachedAdminStatus = unstable_cache(
  async (email: string) => {
    // Use admin client (service role) since we're inside unstable_cache
    // which doesn't have access to request cookies
    const adminClient = createAdminClient();
    const { data: adminEmail } = await adminClient
      .from("admin_allowed_emails")
      .select("email")
      .eq("email", email)
      .single();
    return !!adminEmail;
  },
  ["admin-status"],
  { revalidate: 300, tags: ["admin-status"] } // Cache for 5 minutes
);

/**
 * Check if a user email is in the admin allowlist
 * Does not redirect - returns boolean for conditional logic
 * Results are cached for 5 minutes to improve performance
 */
export async function isAdmin(email: string | undefined | null): Promise<boolean> {
  if (!email) return false;
  return getCachedAdminStatus(email);
}
