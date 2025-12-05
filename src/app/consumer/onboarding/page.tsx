import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ConsumerOnboardingForm } from "@/components/consumer/onboarding-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplets } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crear Cuenta - nitoagua",
  description: "Crea tu cuenta de consumidor para solicitar agua más rápido",
};

export default async function ConsumerOnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Not authenticated, redirect to login with consumer role
    redirect("/login?role=consumer");
  }

  // Check if user already has a profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile) {
    // Profile exists, redirect based on role
    if (profile.role === "supplier") {
      redirect("/dashboard");
    } else {
      redirect("/");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-8">
      <div className="max-w-md mx-auto">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#0077B6] mb-4">
            <Droplets className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#0077B6]">nitoagua</h1>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Completa tu perfil</CardTitle>
            <CardDescription>
              Solo necesitamos tu nombre y teléfono para agilizar tus próximas solicitudes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ConsumerOnboardingForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
