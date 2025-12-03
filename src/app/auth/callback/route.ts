import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");
  const origin = requestUrl.origin;

  // Handle OAuth errors from Google (user cancels, Google error, etc.)
  if (error) {
    console.error("[AUTH] OAuth error from Google:", { error, errorDescription });
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error)}`);
  }

  if (code) {
    const supabase = await createClient();

    // Exchange code for session
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("[AUTH] Code exchange error:", exchangeError.message);
      return NextResponse.redirect(`${origin}/login?error=auth_failed`);
    }

    // Get the user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("[AUTH] Get user error:", userError?.message);
      return NextResponse.redirect(`${origin}/login?error=auth_failed`);
    }

    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError && profileError.code !== "PGRST116") {
      // PGRST116 = no rows returned (expected for new users)
      console.error("[AUTH] Profile check error:", profileError.message);
    }

    if (!profile) {
      // New user - redirect to onboarding
      console.log("[AUTH] New user, redirecting to onboarding:", user.id);
      return NextResponse.redirect(`${origin}/onboarding`);
    }

    // Existing user - redirect based on role
    console.log("[AUTH] Existing user with role:", profile.role);
    if (profile.role === "supplier") {
      return NextResponse.redirect(`${origin}/dashboard`);
    } else {
      return NextResponse.redirect(`${origin}/`);
    }
  }

  // No code provided, redirect to login
  return NextResponse.redirect(`${origin}/login`);
}
