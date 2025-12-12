import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

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

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar - only show if authenticated */}
      {user && <AdminSidebar userEmail={userEmail} />}

      {/* Main content */}
      <main className={user ? "flex-1 overflow-auto" : "flex-1"}>
        {children}
      </main>
    </div>
  );
}
