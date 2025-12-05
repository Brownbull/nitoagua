"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConsumerNav } from "@/components/layout/consumer-nav";
import { ConsumerProfileForm } from "@/components/consumer/profile-form";

interface Profile {
  name: string;
  phone: string;
  address: string | null;
  special_instructions: string | null;
  role: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setEmail(user.email ?? null);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("name, phone, address, special_instructions, role")
        .eq("id", user.id)
        .single();

      if (profileData) {
        // If supplier, redirect to supplier profile
        if (profileData.role === "supplier") {
          router.push("/perfil");
          return;
        }
        setProfile(profileData);
      } else {
        // No profile - redirect to onboarding
        router.push("/consumer/onboarding");
        return;
      }

      setLoading(false);
    }

    loadProfile();
  }, [router]);

  async function handleLogout() {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pb-16">
        <Loader2 className="h-8 w-8 animate-spin text-[#0077B6]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 pb-20">
      <div className="flex-1 p-4">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Mi Perfil</h1>

        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Información Personal</CardTitle>
          </CardHeader>
          <CardContent>
            {profile && (
              <ConsumerProfileForm
                initialData={profile}
                email={email}
              />
            )}
          </CardContent>
        </Card>

        <Button
          variant="outline"
          className="w-full text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cerrando sesión...
            </>
          ) : (
            <>
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </>
          )}
        </Button>
      </div>

      <ConsumerNav />
    </div>
  );
}
