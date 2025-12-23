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
            // Redirect approved providers to new provider routes (Epic 8+)
            // Legacy /dashboard is being phased out
            router.push("/provider/requests");
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
    <div className="mt-4 pt-4 border-t border-gray-200">
      <div className="text-center mb-3">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Dev Mode
        </span>
        <p className="text-[11px] text-gray-500 mt-0.5">
          Email/Password login for local testing
        </p>
      </div>

      {/* Role selector buttons - more compact */}
      <div className="flex gap-1.5 mb-3">
        <Button
          type="button"
          variant={selectedRole === "consumer" ? "default" : "outline"}
          className="flex-1 text-xs h-8 px-2"
          onClick={() => handleRoleChange("consumer")}
          disabled={isLoading}
        >
          Consumer
        </Button>
        <Button
          type="button"
          variant={selectedRole === "supplier" ? "default" : "outline"}
          className="flex-1 text-xs h-8 px-2"
          onClick={() => handleRoleChange("supplier")}
          disabled={isLoading}
        >
          Supplier
        </Button>
        <Button
          type="button"
          variant={selectedRole === "newSupplier" ? "default" : "outline"}
          className="flex-1 text-xs h-8 px-2"
          onClick={() => handleRoleChange("newSupplier")}
          disabled={isLoading}
        >
          New Supplier
        </Button>
      </div>

      <form onSubmit={handleLogin} className="space-y-2.5">
        <div className="space-y-1">
          <Label htmlFor="email" className="text-xs">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={TEST_ACCOUNTS[selectedRole].email}
            disabled={isLoading}
            className="h-9 text-sm"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="password" className="text-xs">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={isLoading}
            className="h-9 text-sm"
          />
        </div>

        <Button
          type="submit"
          className="w-full h-9"
          disabled={isLoading}
          data-testid="dev-login-button"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Dev Login ({selectedRole})
        </Button>

        {error && (
          <p className="text-xs text-red-600 text-center" role="alert">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
