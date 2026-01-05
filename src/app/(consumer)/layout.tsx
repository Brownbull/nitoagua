import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ConsumerLayoutWrapper } from "@/components/layout/consumer-layout-wrapper";
import { getRoleRedirectUrl } from "@/lib/auth/role-redirect";

export const metadata: Metadata = {
  title: "nitoagua - Solicitar Agua",
  description: "Solicita tu entrega de agua de manera fácil y rápida",
};

/**
 * Consumer Layout with Role Guard
 *
 * Story 12.8-2: Role-Based Route Guards (BUG-R2-004)
 *
 * Backup protection: Redirects non-consumers to their appropriate dashboard.
 * Primary protection is in middleware, this is a defense-in-depth layer.
 */
export default async function ConsumerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If authenticated, check role
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    // Non-consumers get redirected to their dashboard
    if (profile?.role && profile.role !== "consumer") {
      redirect(getRoleRedirectUrl(profile.role));
    }
  }

  return <ConsumerLayoutWrapper>{children}</ConsumerLayoutWrapper>;
}
