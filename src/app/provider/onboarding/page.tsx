import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WelcomeScreen } from "@/components/provider/onboarding/welcome-screen";

export default async function ProviderOnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is already authenticated, check their profile
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, verification_status")
      .eq("id", user.id)
      .single();

    // If they have a provider profile, redirect based on status
    if (profile?.role === "provider" || profile?.role === "supplier") {
      if (profile.verification_status === "approved") {
        redirect("/supplier/dashboard");
      } else if (profile.verification_status === "pending") {
        redirect("/provider/onboarding/pending");
      } else if (profile.verification_status === "rejected") {
        redirect("/provider/onboarding/pending");
      } else if (profile.verification_status === "more_info_needed") {
        redirect("/provider/onboarding/pending");
      }
    }

    // If authenticated but no provider profile, continue to personal info
    redirect("/provider/onboarding/personal");
  }

  // Not authenticated - show welcome screen with Google OAuth
  return <WelcomeScreen />;
}
