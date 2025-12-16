"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

// Test accounts for local development
const TEST_ACCOUNTS = {
  supplier: { email: "supplier@nitoagua.cl", password: "supplier.123" },
  consumer: { email: "consumer@nitoagua.cl", password: "consumer.123" },
  // New supplier (for testing onboarding flow) - no profile yet
  newSupplier: { email: "provider2@nitoagua.cl", password: "provider2.123" },
} as const;

type Role = "consumer" | "supplier" | "newSupplier";

/**
 * Development-only login component for email/password authentication.
 * This is used for local testing without Google OAuth.
 * Only rendered when NEXT_PUBLIC_DEV_LOGIN=true
 */
export function DevLogin() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role>("consumer");
  const [email, setEmail] = useState<string>(TEST_ACCOUNTS.consumer.email);
  const [password, setPassword] = useState<string>(TEST_ACCOUNTS.consumer.password);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleRoleChange(role: Role) {
    setSelectedRole(role);
    setEmail(TEST_ACCOUNTS[role].email);
    setPassword(TEST_ACCOUNTS[role].password);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setIsLoading(false);
        return;
      }

      // Check if profile exists
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile) {
          if (profile.role === "supplier") {
            router.push("/dashboard");
          } else {
            router.push("/");
          }
        } else {
          // No profile - redirect to appropriate onboarding based on selected role
          if (selectedRole === "supplier" || selectedRole === "newSupplier") {
            router.push("/provider/onboarding/personal");
          } else {
            router.push("/consumer/onboarding");
          }
        }
      }
    } catch {
      setError("Error al iniciar sesión");
      setIsLoading(false);
    }
  }

  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <div className="text-center mb-4">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Dev Mode
        </span>
        <p className="text-xs text-gray-500 mt-1">
          Email/Password login for local testing
        </p>
      </div>

      {/* Role selector buttons */}
      <div className="flex gap-2 mb-4">
        <Button
          type="button"
          variant={selectedRole === "consumer" ? "default" : "outline"}
          className="flex-1 text-sm"
          onClick={() => handleRoleChange("consumer")}
          disabled={isLoading}
        >
          Consumer
        </Button>
        <Button
          type="button"
          variant={selectedRole === "supplier" ? "default" : "outline"}
          className="flex-1 text-sm"
          onClick={() => handleRoleChange("supplier")}
          disabled={isLoading}
        >
          Supplier
        </Button>
        <Button
          type="button"
          variant={selectedRole === "newSupplier" ? "default" : "outline"}
          className="flex-1 text-sm"
          onClick={() => handleRoleChange("newSupplier")}
          disabled={isLoading}
        >
          New Supplier
        </Button>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={TEST_ACCOUNTS[selectedRole].email}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={isLoading}
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
          data-testid="dev-login-button"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Dev Login ({selectedRole})
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
