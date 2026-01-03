import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAllOffers } from "@/lib/actions/offers";
import { OffersListClient } from "./offers-list-client";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ new?: string }>;
}

/**
 * Provider's Offers List Page (v2.6.0 - Unified List)
 * Single filterable/sortable list with pagination
 */
export default async function ProviderOffersPage({ searchParams }: PageProps) {
  const { new: newOfferId } = await searchParams;
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/provider/offers");
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

  // Get provider's offers as flat list for unified view
  const result = await getAllOffers();

  if (!result.success || !result.offers) {
    // Handle error case
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        <div className="max-w-lg mx-auto px-4 py-6">
          <div className="text-center py-12">
            <p className="text-red-500">{result.error || "Error al cargar ofertas"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <OffersListClient
      initialOffers={result.offers}
      newOfferId={newOfferId}
      providerId={user.id}
    />
  );
}
