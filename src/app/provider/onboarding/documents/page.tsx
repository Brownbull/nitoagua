import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DocumentUpload } from "@/components/provider/onboarding/document-upload";

export default async function DocumentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Must be authenticated to access this page
  if (!user) {
    redirect("/provider/onboarding");
  }

  // Check if user already has a provider profile with verification status
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, verification_status")
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

  return <DocumentUpload userId={user.id} />;
}
