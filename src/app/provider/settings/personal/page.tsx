import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, User, Phone, Mail, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Información Personal - nitoagua Proveedor",
  description: "Tu información personal",
};

export const dynamic = "force-dynamic";

export default async function PersonalInfoSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "supplier") {
    redirect("/");
  }

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
        Información Personal
      </h1>

      {/* Info Cards */}
      <div className="space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <User className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-gray-500">Nombre</span>
          </div>
          <p className="text-gray-900 font-medium" data-testid="profile-name">
            {profile.name || "No especificado"}
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <Mail className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-gray-500">Email</span>
          </div>
          <p className="text-gray-900 font-medium" data-testid="profile-email">
            {user.email || "No especificado"}
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <Phone className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-gray-500">Teléfono</span>
          </div>
          <p className="text-gray-900 font-medium" data-testid="profile-phone">
            {profile.phone || "No especificado"}
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <MapPin className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-gray-500">Dirección</span>
          </div>
          <p className="text-gray-900 font-medium" data-testid="profile-address">
            {profile.address || "No especificada"}
          </p>
        </div>

      </div>

      {/* Note about editing */}
      <p className="text-sm text-gray-500 mt-6 text-center">
        Para modificar tu información, contacta a soporte.
      </p>
    </div>
  );
}
