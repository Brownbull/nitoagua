"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

// Test admin account for local development
// This email must be in the admin_allowed_emails table
const ADMIN_TEST_ACCOUNT = {
  email: "admin@nitoagua.cl",
  password: "admin.123",
};

/**
 * Development-only login component for admin email/password authentication.
 * This is used for local testing without Google OAuth.
 * Only rendered when NEXT_PUBLIC_DEV_LOGIN=true
 */
export function AdminDevLogin() {
  const router = useRouter();
  const [email, setEmail] = useState<string>(ADMIN_TEST_ACCOUNT.email);
  const [password, setPassword] = useState<string>(ADMIN_TEST_ACCOUNT.password);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setIsLoading(false);
        return;
      }

      // Get the user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user || !user.email) {
        setError("Error al obtener usuario");
        setIsLoading(false);
        return;
      }

      // Check if user is in admin allowlist
      const { data: adminEmail } = await supabase
        .from("admin_allowed_emails")
        .select("email")
        .eq("email", user.email)
        .single();

      if (adminEmail) {
        // User is an admin, redirect to dashboard
        router.push("/admin/dashboard");
      } else {
        // User is not an admin
        router.push("/admin/not-authorized");
      }
    } catch {
      setError("Error al iniciar sesion");
      setIsLoading(false);
    }
  }

  return (
    <div className="mt-6 pt-6 border-t border-gray-300">
      <div className="text-center mb-4">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Dev Mode
        </span>
        <p className="text-xs text-gray-500 mt-1">
          Email/Password login for local testing
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="admin-email" className="text-gray-700">Email</Label>
          <Input
            id="admin-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={ADMIN_TEST_ACCOUNT.email}
            disabled={isLoading}
            className="bg-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="admin-password" className="text-gray-700">Password</Label>
          <Input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            disabled={isLoading}
            className="bg-white"
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-gray-800 hover:bg-gray-900"
          disabled={isLoading}
          data-testid="admin-dev-login-button"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Dev Login (Admin)
        </Button>

        {error && (
          <p className="text-sm text-red-600 text-center" role="alert">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
