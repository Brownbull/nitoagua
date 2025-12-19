import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMapData } from "@/lib/actions/map";
import { MapWrapper } from "./map-wrapper";

export const dynamic = "force-dynamic";

/**
 * Provider Map Page
 * AC: 8.10.1 - Map page accessible at /provider/map
 */
export default async function ProviderMapPage() {
  const supabase = await createClient();

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/provider/map");
  }

  // Check if user is a provider
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, verification_status")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "supplier") {
    redirect("/");
  }

  // If provider is pending verification, redirect to pending page
  if (profile.verification_status === "pending") {
    redirect("/provider/onboarding/pending");
  }

  // Get map data
  const result = await getMapData();

  return (
    <div className="fixed inset-0 z-0" data-testid="provider-map-page">
      <MapWrapper
        initialRequests={result.requests ?? []}
        serviceAreas={result.serviceAreas ?? []}
        providerStatus={result.providerStatus ?? {
          isVerified: false,
          isAvailable: false,
          hasServiceAreas: false,
        }}
      />
    </div>
  );
}
