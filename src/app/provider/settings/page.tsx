import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  User,
  Truck,
  CreditCard,
  MapPin,
  ChevronRight,
  BadgeCheck,
  LogOut,
} from "lucide-react";
import { AvailabilityToggleWrapper } from "@/components/supplier";
import { SignOutButton } from "./sign-out-button";

export const metadata: Metadata = {
  title: "Ajustes - nitoagua Proveedor",
  description: "Configura tu cuenta de proveedor",
};

export const dynamic = "force-dynamic";

const settingsItems = [
  {
    href: "/provider/settings/personal",
    icon: User,
    title: "Información Personal",
    description: "Nombre, teléfono, dirección",
  },
  {
    href: "/provider/settings/vehicle",
    icon: Truck,
    title: "Vehículo",
    description: "Tipo de vehículo, capacidad",
  },
  {
    href: "/provider/settings/bank",
    icon: CreditCard,
    title: "Datos Bancarios",
    description: "Cuenta para transferencias",
  },
  {
    href: "/dashboard/settings/areas",
    icon: MapPin,
    title: "Zonas de Servicio",
    description: "Comunas donde operas",
  },
];

export default async function ProviderSettingsPage() {
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

  // Get initials for avatar
  const initials = profile.name
    ? profile.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  const isVerified = profile.verification_status === "approved";

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      {/* Page Header */}
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Ajustes</h1>

      {/* Profile Card */}
      <div
        className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6"
        data-testid="profile-card"
      >
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
            <span className="text-xl font-bold text-orange-600">{initials}</span>
          </div>

          {/* Name and Status */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900">
                {profile.name || "Sin nombre"}
              </h2>
              {isVerified && (
                <BadgeCheck
                  className="w-5 h-5 text-blue-500"
                  data-testid="verified-badge"
                />
              )}
            </div>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Availability Toggle - Only for approved providers */}
      {isVerified && (
        <div className="mb-6" data-testid="availability-section">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Estado de Disponibilidad
          </h3>
          <AvailabilityToggleWrapper
            initialValue={profile.is_available ?? false}
          />
        </div>
      )}

      {/* Settings Menu */}
      <div className="space-y-2 mb-8">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Configuración de Cuenta
        </h3>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {settingsItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors ${
                  index !== settingsItems.length - 1
                    ? "border-b border-gray-100"
                    : ""
                }`}
                data-testid={`settings-item-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-orange-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Sign Out Button */}
      <div className="pt-4 border-t border-gray-200">
        <SignOutButton />
      </div>
    </div>
  );
}
