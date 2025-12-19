import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft } from "lucide-react";
import { ServiceAreaSettings } from "@/components/provider/service-area-settings";

export const metadata: Metadata = {
  title: "Zonas de Servicio - nitoagua Proveedor",
  description: "Configura las comunas donde realizas entregas",
};

export const dynamic = "force-dynamic";

export default async function AreasSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, verification_status")
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
    <div className="px-4 py-6 max-w-lg mx-auto">
      {/* Back Button */}
      <Link
        href="/provider/settings"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        data-testid="back-to-settings"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Zonas de Servicio
      </h1>

      {/* Service Area Settings Component */}
      <ServiceAreaSettings
        initialAreas={currentAreas}
        backUrl="/provider/settings"
        hideBackButton={true}
      />
    </div>
  );
}
