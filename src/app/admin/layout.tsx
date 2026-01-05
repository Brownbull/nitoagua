import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminBottomNav } from "@/components/admin/admin-bottom-nav";
import { isAdmin } from "@/lib/auth/guards";

export const metadata = {
  title: "Admin - nitoagua",
  description: "Panel de Administracion",
};

/**
 * Admin Layout
 *
 * Story 12.8-2: Role-Based Route Guards (BUG-R2-004)
 *
 * NOTE: Role-based redirects are handled by middleware.
 * This layout only conditionally shows navigation UI for authenticated admins.
 * The login and not-authorized pages render without the sidebar/nav.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get user email for sidebar display
  const userEmail = user?.email;

  // Only show navigation if user is an admin (not just authenticated)
  // Middleware handles the actual access control; this just controls UI visibility
  const adminCheck = user && userEmail ? await isAdmin(userEmail) : false;
  const showNav = user && userEmail && adminCheck;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar - desktop only, show if authenticated AND admin */}
      {showNav && <AdminSidebar userEmail={userEmail} />}

      {/* Main content - add bottom padding on mobile for bottom nav + safe area */}
      <main className={showNav ? "flex-1 overflow-auto pb-20 lg:pb-0" : "flex-1"}>
        {children}
      </main>

      {/* Bottom nav - mobile only, show if authenticated AND admin */}
      {showNav && <AdminBottomNav />}
    </div>
  );
}
