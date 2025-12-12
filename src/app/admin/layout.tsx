import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { isAdmin } from "@/lib/auth/guards";

export const metadata = {
  title: "Admin - nitoagua",
  description: "Panel de Administracion",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get user email for sidebar display
  const userEmail = user?.email;

  // Only show sidebar if user is an admin (not just authenticated)
  const showSidebar = user && userEmail && await isAdmin(userEmail);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar - only show if authenticated AND admin */}
      {showSidebar && <AdminSidebar userEmail={userEmail} />}

      {/* Main content */}
      <main className={showSidebar ? "flex-1 overflow-auto" : "flex-1"}>
        {children}
      </main>
    </div>
  );
}
