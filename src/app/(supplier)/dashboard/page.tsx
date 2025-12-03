import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplets, ClipboardList } from "lucide-react";

export default async function SupplierDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get supplier profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/onboarding");
  }

  if (profile.role !== "supplier") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#0077B6] text-white px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="w-6 h-6" />
            <span className="font-bold text-lg">nitoagua</span>
          </div>
          <span className="text-sm">Hola, {profile.name}</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Panel de Proveedor</h1>

        {/* Placeholder Dashboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5" />
              Solicitudes de Agua
            </CardTitle>
            <CardDescription>
              Gestiona las solicitudes de agua de tus clientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500">
              <ClipboardList className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No hay solicitudes pendientes</p>
              <p className="text-sm mt-2">
                Las solicitudes de agua aparecerán aquí cuando los clientes las envíen
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Profile Summary */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Tu Perfil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="font-medium">Área de servicio:</span> {profile.service_area}</p>
            <p><span className="font-medium">Teléfono:</span> {profile.phone}</p>
            <p>
              <span className="font-medium">Estado:</span>{" "}
              <span className={profile.is_available ? "text-green-600" : "text-red-600"}>
                {profile.is_available ? "Disponible" : "No disponible"}
              </span>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
