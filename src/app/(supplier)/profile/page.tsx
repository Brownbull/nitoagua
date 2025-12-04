import { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Droplets, ArrowLeft } from "lucide-react";
import { ProfileForm } from "@/components/supplier/profile-form";
import type { SupplierProfile } from "@/lib/validations/supplier-profile";

export const metadata: Metadata = {
  title: "Mi Perfil - nitoagua",
  description: "Gestiona tu información de proveedor",
};

export default async function SupplierProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get supplier profile (user and role already verified by layout)
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  // Transform database profile to SupplierProfile type
  const supplierProfile: SupplierProfile = {
    id: profile!.id,
    role: "supplier",
    name: profile!.name || "",
    phone: profile!.phone || "",
    serviceArea: profile!.service_area || "",
    price100l: profile!.price_100l || 0,
    price1000l: profile!.price_1000l || 0,
    price5000l: profile!.price_5000l || 0,
    price10000l: profile!.price_10000l || 0,
    isAvailable: profile!.is_available ?? true,
    createdAt: profile!.created_at || new Date().toISOString(),
    updatedAt: profile!.updated_at || new Date().toISOString(),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#0077B6] text-white px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="w-6 h-6" />
            <span className="font-bold text-lg">nitoagua</span>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-sm hover:underline"
            data-testid="back-to-dashboard-link"
          >
            <ArrowLeft className="w-4 h-4" />
            Panel
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Mi Perfil</h1>

        <div className="bg-white rounded-lg shadow p-6">
          <ProfileForm initialData={supplierProfile} />
        </div>
      </main>
    </div>
  );
}
