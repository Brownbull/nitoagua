import Link from "next/link";
import { Droplets, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function RequestNotFound() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#0077B6] text-white px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="w-6 h-6" />
            <span className="font-bold text-lg">nitoagua</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-4">
        <Card className="mt-8" data-testid="not-found-message">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Solicitud no encontrada
            </h1>
            <p className="text-gray-600 mb-6">
              La solicitud que buscas no existe o ha sido eliminada.
            </p>
            <Button asChild>
              <Link href="/dashboard">Volver al Panel</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
