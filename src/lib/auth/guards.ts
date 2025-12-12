import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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
 * Check if a user email is in the admin allowlist
 * Does not redirect - returns boolean for conditional logic
 */
export async function isAdmin(email: string | undefined | null): Promise<boolean> {
  if (!email) return false;

  const supabase = await createClient();
  const { data: adminEmail } = await supabase
    .from("admin_allowed_emails")
    .select("email")
    .eq("email", email)
    .single();

  return !!adminEmail;
}
