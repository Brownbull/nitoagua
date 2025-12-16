import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { VerificationStatusDisplay } from "@/components/provider/onboarding/verification-status";

export default async function PendingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Must be authenticated to access this page
  if (!user) {
    redirect("/provider/onboarding");
  }

  // Get profile with verification status
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, verification_status, rejection_reason")
    .eq("id", user.id)
    .single();

  // If no profile or not a provider, redirect to start
  if (!profile || (profile.role !== "provider" && profile.role !== "supplier")) {
    redirect("/provider/onboarding");
  }

  // If approved, could redirect to dashboard, but let them see the success message first
  // They can click through to the dashboard

  // Determine status to display
  const status = (profile.verification_status || "pending") as
    | "pending"
    | "approved"
    | "rejected"
    | "more_info_needed";

  // Parse missing documents from rejection_reason for more_info_needed status
  let missingDocuments: string[] = [];
  if (status === "more_info_needed" && profile.rejection_reason) {
    const docsMatch = profile.rejection_reason.match(/Documentos faltantes: (.+)$/m);
    if (docsMatch) {
      missingDocuments = docsMatch[1].split(", ").map((d: string) => d.trim());
    }
  }

  return (
    <VerificationStatusDisplay
      status={status}
      rejectionReason={profile.rejection_reason}
      missingDocuments={missingDocuments}
    />
  );
}
