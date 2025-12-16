import { Droplets } from "lucide-react";

export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header with Logo */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-orange-100">
        <div className="flex items-center justify-center py-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500">
              <Droplets className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-orange-600">nitoagua</span>
            <span className="text-xs text-gray-500 ml-1">Proveedor</span>
          </div>
        </div>
      </header>

      <main className="pb-8">{children}</main>
    </div>
  );
}
