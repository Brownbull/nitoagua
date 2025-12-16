import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PersonalForm } from "@/components/provider/onboarding/personal-form";

export default async function PersonalInfoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Must be authenticated to access this page
  if (!user) {
    redirect("/provider/onboarding");
  }

  // Check if user already has a provider profile
  // Note: rut and avatar_url columns added in migration 20251215220000
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, verification_status, name, phone")
    .eq("id", user.id)
    .single();

  // If already a provider with verification status, redirect
  if (profile?.role === "provider" || profile?.role === "supplier") {
    if (profile.verification_status === "approved") {
      redirect("/supplier/dashboard");
    } else if (profile.verification_status) {
      redirect("/provider/onboarding/pending");
    }
  }

  // Get user info from auth metadata
  const userName = user.user_metadata?.full_name || user.user_metadata?.name || "";

  return (
    <PersonalForm
      initialData={{
        name: profile?.name || userName,
        phone: profile?.phone || "",
        // rut and avatarUrl loaded from localStorage if available
        // (columns added in migration 20251215220000)
      }}
      userEmail={user.email}
      userName={userName}
      userId={user.id}
    />
  );
}
