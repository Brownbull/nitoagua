import { Suspense } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RequestDetails, RequestDetailsSkeleton } from "@/components/supplier/request-details";
import type { WaterRequest } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Detalles de Solicitud - nitoagua",
  description: "Ver detalles de una solicitud de agua",
};

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}

async function fetchRequest(id: string): Promise<WaterRequest | null> {
  const supabase = await createClient();

  const { data: request, error } = await supabase
    .from("water_requests")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !request) {
    return null;
  }

  return request;
}

export default async function RequestDetailsPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { from } = await searchParams;

  // Validate UUID format to prevent unnecessary DB query
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    notFound();
  }

  const request = await fetchRequest(id);

  if (!request) {
    notFound();
  }

  // Determine back URL - preserve tab if coming from dashboard
  const backUrl = from ? `/dashboard?tab=${from}` : "/dashboard";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#0077B6] text-white px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="w-6 h-6" />
            <span className="font-bold text-lg">nitoagua</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-4">
        {/* Back Button */}
        <Button
          variant="ghost"
          asChild
          className="mb-4 -ml-2"
          data-testid="back-button"
        >
          <Link href={backUrl}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Link>
        </Button>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Detalles de Solicitud
        </h1>

        {/* Request Details */}
        <Suspense fallback={<RequestDetailsSkeleton />}>
          <RequestDetails request={request} />
        </Suspense>
      </main>
    </div>
  );
}
