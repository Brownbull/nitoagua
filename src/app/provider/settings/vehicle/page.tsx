import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, Truck, Droplets } from "lucide-react";

export const metadata: Metadata = {
  title: "Vehículo - nitoagua Proveedor",
  description: "Información de tu vehículo",
};

export const dynamic = "force-dynamic";

// Vehicle type labels
const vehicleTypeLabels: Record<string, string> = {
  camion_aljibe: "Camión Aljibe",
  camioneta: "Camioneta",
  furgon: "Furgón",
  otro: "Otro",
};

export default async function VehicleSettingsPage() {
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

  const vehicleTypeLabel =
    profile.vehicle_type && vehicleTypeLabels[profile.vehicle_type]
      ? vehicleTypeLabels[profile.vehicle_type]
      : profile.vehicle_type || "No especificado";

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
        Información del Vehículo
      </h1>

      {/* Info Cards */}
      <div className="space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <Truck className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-gray-500">Tipo de Vehículo</span>
          </div>
          <p className="text-gray-900 font-medium" data-testid="vehicle-type">
            {vehicleTypeLabel}
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <Droplets className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-gray-500">Capacidad</span>
          </div>
          <p className="text-gray-900 font-medium" data-testid="vehicle-capacity">
            {profile.vehicle_capacity
              ? `${profile.vehicle_capacity.toLocaleString("es-CL")} litros`
              : "No especificada"}
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
