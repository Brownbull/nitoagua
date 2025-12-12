import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Admin OAuth callback handler
 * Exchanges OAuth code for session and checks admin allowlist
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");
  const origin = requestUrl.origin;

  // Handle OAuth errors from Google (user cancels, Google error, etc.)
  if (error) {
    console.error("[ADMIN AUTH] OAuth error from Google:", { error, errorDescription });
    return NextResponse.redirect(`${origin}/admin/login?error=${encodeURIComponent(error)}`);
  }

  if (code) {
    const supabase = await createClient();

    // Exchange code for session
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("[ADMIN AUTH] Code exchange error:", exchangeError.message);
      return NextResponse.redirect(`${origin}/admin/login?error=auth_failed`);
    }

    // Get the user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user || !user.email) {
      console.error("[ADMIN AUTH] Get user error:", userError?.message);
      return NextResponse.redirect(`${origin}/admin/login?error=auth_failed`);
    }

    // Check if user email is in admin allowlist
    const { data: adminEmail, error: adminCheckError } = await supabase
      .from("admin_allowed_emails")
      .select("email")
      .eq("email", user.email as string)
      .single();

    if (adminCheckError && adminCheckError.code !== "PGRST116") {
      // PGRST116 = no rows returned (expected for non-admin users)
      console.error("[ADMIN AUTH] Admin check error:", adminCheckError.message);
    }

    if (adminEmail) {
      // User is an admin, redirect to dashboard
      console.log("[ADMIN AUTH] Admin login successful:", user.email);
      return NextResponse.redirect(`${origin}/admin/dashboard`);
    } else {
      // User is NOT in admin allowlist
      console.log("[ADMIN AUTH] Unauthorized admin access attempt:", user.email);
      return NextResponse.redirect(`${origin}/admin/not-authorized`);
    }
  }

  // No code provided, redirect to login
  return NextResponse.redirect(`${origin}/admin/login`);
}
