import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAvailableRequests } from "@/lib/actions/offers";
import { RequestBrowserClient } from "./request-browser-client";
import { RequestCardSkeleton } from "@/components/provider/request-card";

export const dynamic = "force-dynamic";

export default async function ProviderRequestsPage() {
  const supabase = await createClient();

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/provider/requests");
  }

  // Check if user is a provider
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, verification_status, is_available")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "supplier") {
    redirect("/");
  }

  // If provider is pending verification, redirect to pending page
  if (profile.verification_status === "pending") {
    redirect("/provider/onboarding/pending");
  }

  // Get initial data
  const result = await getAvailableRequests();

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Solicitudes Disponibles
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Solicitudes de agua en tus áreas de servicio
          </p>
        </div>

        {/* Request list */}
        <Suspense fallback={<RequestListSkeleton />}>
          <RequestBrowserClient
            initialRequests={result.requests ?? []}
            providerStatus={result.providerStatus}
            error={result.error}
          />
        </Suspense>
      </div>
    </div>
  );
}

function RequestListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <RequestCardSkeleton key={i} />
      ))}
    </div>
  );
}
