import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function SupplierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If not authenticated, redirect to login
  if (!user) {
    console.log("[AUTH] Unauthenticated access to supplier area, redirecting to login");
    redirect("/login");
  }

  // Check if user has a profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // If no profile, redirect to provider onboarding (new registration flow)
  if (!profile) {
    console.log("[AUTH] No profile found for user, redirecting to provider onboarding:", user.id);
    redirect("/provider/onboarding/personal");
  }

  // If not a supplier, redirect to consumer home
  if (profile.role !== "supplier") {
    console.log("[AUTH] Non-supplier accessing supplier area, redirecting to home:", profile.role);
    redirect("/");
  }

  return <>{children}</>;
}
