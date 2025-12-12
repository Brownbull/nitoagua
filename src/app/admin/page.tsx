import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/guards";

/**
 * Admin root page - redirects based on auth state
 * AC6.1.1: Admin can navigate to /admin and see login page
 */
export default async function AdminRootPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Not authenticated, go to login
    redirect("/admin/login");
  }

  // Check if user is admin
  const userIsAdmin = await isAdmin(user.email);

  if (userIsAdmin) {
    // Admin user, go to dashboard
    redirect("/admin/dashboard");
  } else {
    // Not an admin, show not-authorized
    redirect("/admin/not-authorized");
  }
}
