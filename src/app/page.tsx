"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { BigActionButton } from "@/components/consumer/big-action-button";
import { ConsumerNav } from "@/components/layout/consumer-nav";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Check initial auth state
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setCheckingAuth(false);
    });

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleRequestClick = () => {
    setLoading(true);
    router.push("/request");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-16">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Bienvenido a nitoagua
          </h1>
          <p className="mt-2 text-gray-600">Tu agua, cuando la necesitas</p>
        </div>

        <BigActionButton onClick={handleRequestClick} loading={loading} />

        <p className="mt-8 text-center text-sm text-gray-500">
          Toca el botón para solicitar tu entrega de agua
        </p>

        {/* Crear Cuenta link - only show for non-logged-in users */}
        {!checkingAuth && !user && (
          <Link
            href="/login?role=consumer"
            className="mt-4 text-sm text-[#0077B6] hover:underline"
            data-testid="crear-cuenta-link"
          >
            Crear Cuenta
          </Link>
        )}
      </main>
      <ConsumerNav />
    </div>
  );
}
