"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BigActionButton } from "@/components/consumer/big-action-button";
import { ConsumerNav } from "@/components/layout/consumer-nav";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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
      </main>
      <ConsumerNav />
    </div>
  );
}
