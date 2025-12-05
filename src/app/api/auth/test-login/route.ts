import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Test login is ONLY available in development with explicit opt-in
const isTestLoginEnabled = () => {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.ENABLE_TEST_LOGIN === "true"
  );
};

// Predefined test users
const TEST_USERS = {
  "test-consumer@test.local": { role: "consumer" as const },
  "test-supplier@test.local": { role: "supplier" as const },
} as const;

interface TestLoginRequest {
  email: string;
  role?: "consumer" | "supplier";
}

export async function POST(request: Request) {
  // Security: Return 404 in production or when not enabled
  if (!isTestLoginEnabled()) {
    console.log("[TEST-LOGIN] Disabled - returning 404");
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const body = (await request.json()) as TestLoginRequest;
    const { email, role } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Validate email is in our test user list
    const testUser = TEST_USERS[email as keyof typeof TEST_USERS];
    if (!testUser) {
      return NextResponse.json(
        {
          error: "Invalid test email. Use: test-consumer@test.local or test-supplier@test.local",
        },
        { status: 400 }
      );
    }

    // Use the role from request if provided, otherwise use the default for this test email
    const userRole = role || testUser.role;

    console.log("[TEST-LOGIN] Creating test session for:", email, "role:", userRole);

    const adminClient = createAdminClient();

    // Check if user exists
    const { data: existingUsers, error: listError } = await adminClient.auth.admin.listUsers();

    if (listError) {
      console.error("[TEST-LOGIN] Error listing users:", listError);
      return NextResponse.json(
        { error: "Failed to check existing users" },
        { status: 500 }
      );
    }

    let userId: string;
    const existingUser = existingUsers.users.find((u) => u.email === email);

    if (existingUser) {
      userId = existingUser.id;
      console.log("[TEST-LOGIN] Found existing test user:", userId);
    } else {
      // Create test user
      const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { test_user: true },
      });

      if (createError || !newUser.user) {
        console.error("[TEST-LOGIN] Error creating user:", createError);
        return NextResponse.json(
          { error: "Failed to create test user" },
          { status: 500 }
        );
      }

      userId = newUser.user.id;
      console.log("[TEST-LOGIN] Created new test user:", userId);

      // Create profile for new user
      const { error: profileError } = await adminClient.from("profiles").insert({
        id: userId,
        role: userRole,
        name: userRole === "consumer" ? "Test Consumer" : "Test Supplier",
        phone: "+56912345678",
        // Add supplier-specific fields if role is supplier
        ...(userRole === "supplier" && {
          service_area: "villarrica",
          price_100l: 5000,
          price_1000l: 15000,
          price_5000l: 50000,
          price_10000l: 90000,
          is_available: true,
        }),
      });

      if (profileError) {
        console.error("[TEST-LOGIN] Error creating profile:", profileError);
        // User was created but profile failed - delete user and return error
        await adminClient.auth.admin.deleteUser(userId);
        return NextResponse.json(
          { error: "Failed to create test user profile" },
          { status: 500 }
        );
      }

      console.log("[TEST-LOGIN] Created profile for user:", userId);
    }

    // Generate a session token for the user
    // Use generateLink to create a magic link, then extract the token
    const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
      type: "magiclink",
      email,
    });

    if (linkError || !linkData) {
      console.error("[TEST-LOGIN] Error generating link:", linkError);
      return NextResponse.json(
        { error: "Failed to generate session" },
        { status: 500 }
      );
    }

    // Return success with redirect instructions
    // Client should call verifyOTP with this token
    console.log("[TEST-LOGIN] Generated magic link for:", email);

    return NextResponse.json({
      success: true,
      userId,
      email,
      role: userRole,
      // Return the verification URL that the test should navigate to
      verifyUrl: `${linkData.properties.action_link}`,
      message: "Navigate to verifyUrl to complete login, or use the token with verifyOtp",
    });
  } catch (error) {
    console.error("[TEST-LOGIN] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Also support GET for simple testing (returns 404 if disabled)
export async function GET() {
  if (!isTestLoginEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    enabled: true,
    message: "Test login is enabled. POST with { email, role } to create a test session.",
    testEmails: Object.keys(TEST_USERS),
  });
}
