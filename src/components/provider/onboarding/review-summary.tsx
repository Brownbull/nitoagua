"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Phone,
  MapPin,
  FileCheck,
  Building2,
  ArrowLeft,
  Loader2,
  Check,
  AlertCircle,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressIndicator } from "./progress-indicator";
import {
  COMUNAS,
  CHILEAN_BANKS,
  ACCOUNT_TYPES,
  VEHICLE_CAPACITIES,
  DOCUMENT_LABELS,
  type DocumentType,
} from "@/lib/validations/provider-registration";
import { submitProviderRegistration } from "@/lib/actions/provider-registration";
import { cn } from "@/lib/utils";

interface ReviewData {
  name?: string;
  phone?: string;
  comunaIds?: string[];
  vehicleCapacity?: number;
  documents?: {
    cedula?: string[];
    permiso_sanitario?: string[];
    vehiculo?: string[];
    certificacion?: string[];
  };
  bankName?: string;
  accountType?: string;
  accountNumber?: string;
  rut?: string;
}

export function ReviewSummary() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ReviewData>({});

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("nitoagua_provider_onboarding");
      if (saved) {
        const parsed = JSON.parse(saved);
        setData(parsed.data || {});
      }
    } catch {
      // Ignore errors
    }
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await submitProviderRegistration({
        name: data.name || "",
        phone: data.phone || "",
        comunaIds: data.comunaIds || [],
        vehicleCapacity: data.vehicleCapacity || 0,
        documents: {
          cedula: data.documents?.cedula || [],
          permiso_sanitario: data.documents?.permiso_sanitario || [],
          vehiculo: data.documents?.vehiculo || [],
          certificacion: data.documents?.certificacion,
        },
        bankName: data.bankName || "",
        accountType: data.accountType || "",
        accountNumber: data.accountNumber || "",
        rut: data.rut || "",
      });

      if (!result.success) {
        setError(result.error || "Error al enviar la solicitud");
        setIsSubmitting(false);
        return;
      }

      // Clear localStorage
      localStorage.removeItem("nitoagua_provider_onboarding");

      // Redirect to pending page
      router.push("/provider/onboarding/pending");
    } catch (err) {
      console.error("[Review] Submit error:", err);
      setError("Error inesperado. Por favor intenta de nuevo.");
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.push("/provider/onboarding/bank");
  };

  const handleEdit = (step: string) => {
    router.push(`/provider/onboarding/${step}`);
  };

  // Get display values
  const comunaNames = (data.comunaIds || [])
    .map((id) => COMUNAS.find((c) => c.id === id)?.name)
    .filter(Boolean);

  const bankLabel = CHILEAN_BANKS.find((b) => b.value === data.bankName)?.label;
  const accountTypeLabel = ACCOUNT_TYPES.find(
    (t) => t.value === data.accountType
  )?.label;
  const vehicleCapacityLabel = VEHICLE_CAPACITIES.find(
    (v) => v.value === data.vehicleCapacity
  )?.label;

  const documentCount = Object.values(data.documents || {}).reduce(
    (acc, arr) => acc + (arr?.length || 0),
    0
  );

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      <ProgressIndicator currentStep={6} totalSteps={6} />

      <div className="flex-1 px-4 py-6">
        <div className="max-w-md mx-auto">
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Revisa tu Solicitud
          </h1>
          <p className="text-gray-600 text-sm mb-6">
            Verifica que toda la información esté correcta antes de enviar
          </p>

          <div className="space-y-4">
            {/* Personal Info Section */}
            <SectionCard
              icon={User}
              title="Información Personal"
              onEdit={() => handleEdit("personal")}
            >
              <InfoRow label="Nombre" value={data.name} />
              <InfoRow label="Teléfono" value={data.phone} />
            </SectionCard>

            {/* Service Areas Section */}
            <SectionCard
              icon={MapPin}
              title="Áreas de Servicio"
              onEdit={() => handleEdit("areas")}
            >
              <InfoRow
                label="Comunas"
                value={comunaNames.join(", ") || "No seleccionadas"}
              />
            </SectionCard>

            {/* Documents Section */}
            <SectionCard
              icon={FileCheck}
              title="Documentos"
              onEdit={() => handleEdit("documents")}
            >
              {(["cedula", "permiso_sanitario", "vehiculo", "certificacion"] as DocumentType[]).map(
                (type) => {
                  const files = data.documents?.[type] || [];
                  return (
                    <InfoRow
                      key={type}
                      label={DOCUMENT_LABELS[type]}
                      value={
                        files.length > 0 ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <Check className="w-4 h-4" />
                            {files.length} archivo{files.length !== 1 ? "s" : ""}
                          </span>
                        ) : (
                          <span className="text-gray-400">No subido</span>
                        )
                      }
                    />
                  );
                }
              )}
              <InfoRow
                label="Capacidad vehículo"
                value={vehicleCapacityLabel || "No seleccionada"}
              />
            </SectionCard>

            {/* Bank Info Section */}
            <SectionCard
              icon={Building2}
              title="Información Bancaria"
              onEdit={() => handleEdit("bank")}
            >
              <InfoRow label="Banco" value={bankLabel} />
              <InfoRow label="Tipo de cuenta" value={accountTypeLabel} />
              <InfoRow
                label="Número de cuenta"
                value={
                  data.accountNumber
                    ? `****${data.accountNumber.slice(-4)}`
                    : undefined
                }
              />
              <InfoRow label="RUT" value={data.rut} />
            </SectionCard>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Terms */}
          <p className="mt-6 text-xs text-gray-500 text-center">
            Al enviar tu solicitud, aceptas los términos y condiciones de
            nitoagua y autorizas la verificación de tus documentos.
          </p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4">
        <div className="max-w-md mx-auto flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={isSubmitting}
            className="flex-1 h-12 rounded-xl"
            data-testid="back-button"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Atrás
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 h-12 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl"
            data-testid="submit-button"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Check className="w-5 h-5 mr-2" />
                Enviar Solicitud
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Helper Components

interface SectionCardProps {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  onEdit: () => void;
}

function SectionCard({ icon: Icon, title, children, onEdit }: SectionCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-gray-500" />
          <h3 className="font-medium text-gray-700">{title}</h3>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="text-orange-600 hover:text-orange-700 p-1"
        >
          <Pencil className="w-4 h-4" />
        </button>
      </div>
      <div className="px-4 py-3 space-y-2">{children}</div>
    </div>
  );
}

interface InfoRowProps {
  label: string;
  value?: React.ReactNode;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-gray-500">{label}</span>
      <span
        className={cn(
          "text-sm font-medium",
          value ? "text-gray-900" : "text-gray-400"
        )}
      >
        {value || "No especificado"}
      </span>
    </div>
  );
}
