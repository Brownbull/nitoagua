import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ServiceAreaSettings } from "@/components/provider/service-area-settings";

export const metadata: Metadata = {
  title: "Áreas de Servicio - nitoagua",
  description: "Configura tus áreas de servicio",
};

export const dynamic = "force-dynamic";

export default async function ServiceAreasSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is an approved provider
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, verification_status, name")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "supplier") {
    redirect("/");
  }

  // Only approved providers can access this page
  if (profile.verification_status !== "approved") {
    redirect("/provider/onboarding/pending");
  }

  // Get current service areas
  const { data: serviceAreas } = await supabase
    .from("provider_service_areas")
    .select("comuna_id")
    .eq("provider_id", user.id);

  const currentAreas = serviceAreas?.map((sa) => sa.comuna_id) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#0077B6] text-white px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-bold">Áreas de Servicio</h1>
          <p className="text-sm text-white/80 mt-1">
            Configura las comunas donde realizas entregas
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-4">
        <ServiceAreaSettings initialAreas={currentAreas} backUrl="/provider/settings" />
      </main>
    </div>
  );
}
