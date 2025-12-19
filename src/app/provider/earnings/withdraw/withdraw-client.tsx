"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Banknote,
  Building2,
  Clock,
  Upload,
  FileImage,
  X,
  CheckCircle2,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { createClient } from "@/lib/supabase/client";
import {
  submitCommissionPayment,
  type PlatformBankDetails,
  type PendingWithdrawal,
} from "@/lib/actions/settlement";
import { formatCLP } from "@/lib/utils/commission";
import { cn } from "@/lib/utils";

interface Props {
  commissionPending: number;
  bankDetails: PlatformBankDetails | null;
  pendingWithdrawal: PendingWithdrawal | null;
  error?: string;
}

/**
 * Client component for commission settlement
 * AC: 8.7.1 - Amount due displayed prominently
 * AC: 8.7.2 - Platform bank details shown
 * AC: 8.7.3 - Upload receipt button functional
 * AC: 8.7.6 - Show pending verification status
 */
export function WithdrawClient({
  commissionPending,
  bankDetails,
  pendingWithdrawal,
  error,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // If there's a pending withdrawal, show the pending state
  if (pendingWithdrawal) {
    return (
      <PendingVerificationView
        withdrawal={pendingWithdrawal}
        commissionPending={commissionPending}
      />
    );
  }

  // If submission was successful, show success state
  if (isSubmitted) {
    return (
      <SubmissionSuccessView
        amount={commissionPending}
        onBack={() => router.push("/provider/earnings")}
      />
    );
  }

  // Error state
  if (error && !bankDetails) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  // No pending commission state
  if (commissionPending <= 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <CheckCircle2 className="w-12 h-12 text-green-400 mb-4" />
        <p className="text-lg font-medium text-gray-800">Sin comisión pendiente</p>
        <p className="text-gray-500 mt-2">No tienes pagos pendientes en este momento.</p>
      </div>
    );
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      setSubmitError("Solo se permiten archivos JPG, PNG, WebP o PDF");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setSubmitError("El archivo no debe superar 5MB");
      return;
    }

    setSubmitError(null);
    setUploadedFile(file);

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCopyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  const handleSubmit = async () => {
    if (!uploadedFile) {
      setSubmitError("Debes subir un comprobante de transferencia");
      return;
    }

    setSubmitError(null);

    startTransition(async () => {
      try {
        // 1. Upload file to Supabase Storage
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setSubmitError("Sesión expirada. Por favor, inicia sesión nuevamente.");
          return;
        }

        const ext = uploadedFile.name.split(".").pop() || "jpg";
        const timestamp = Date.now();
        const filePath = `${user.id}/${timestamp}-receipt.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("commission-receipts")
          .upload(filePath, uploadedFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("[Withdraw] Upload error:", uploadError);
          setSubmitError("Error al subir el comprobante. Intenta nuevamente.");
          return;
        }

        // 2. Submit payment with receipt path
        const result = await submitCommissionPayment(commissionPending, filePath);

        if (!result.success) {
          setSubmitError(result.error || "Error al enviar el pago");
          return;
        }

        // 3. Success!
        setIsSubmitted(true);
      } catch (err) {
        console.error("[Withdraw] Unexpected error:", err);
        setSubmitError("Error inesperado. Intenta nuevamente.");
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Amount Due Card - AC: 8.7.1 */}
      <div
        className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white"
        data-testid="amount-due-card"
      >
        <div className="flex items-center gap-2 mb-2">
          <Banknote className="w-5 h-5" />
          <span className="text-sm font-medium opacity-90">Comisión Pendiente</span>
        </div>
        <p className="text-3xl font-bold" data-testid="commission-amount">
          {formatCLP(commissionPending)}
        </p>
        <p className="text-sm opacity-75 mt-1">
          Transfiere este monto exacto a la cuenta indicada
        </p>
      </div>

      {/* Bank Details Card - AC: 8.7.2 */}
      {bankDetails && (
        <div
          className="bg-white border border-gray-200 rounded-xl p-4"
          data-testid="bank-details-card"
        >
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-gray-600" />
            <span className="font-semibold text-gray-800">Datos para Transferencia</span>
          </div>

          <div className="space-y-3">
            <BankDetailRow
              label="Banco"
              value={bankDetails.bank_name}
              field="bank"
              copiedField={copiedField}
              onCopy={handleCopyToClipboard}
            />
            <BankDetailRow
              label="Tipo de Cuenta"
              value={bankDetails.account_type}
              field="type"
              copiedField={copiedField}
              onCopy={handleCopyToClipboard}
            />
            <BankDetailRow
              label="Número de Cuenta"
              value={bankDetails.account_number}
              field="number"
              copiedField={copiedField}
              onCopy={handleCopyToClipboard}
            />
            <BankDetailRow
              label="Titular"
              value={bankDetails.account_holder}
              field="holder"
              copiedField={copiedField}
              onCopy={handleCopyToClipboard}
            />
            <BankDetailRow
              label="RUT"
              value={bankDetails.rut}
              field="rut"
              copiedField={copiedField}
              onCopy={handleCopyToClipboard}
            />
          </div>
        </div>
      )}

      {/* Receipt Upload - AC: 8.7.3 */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <FileImage className="w-5 h-5 text-gray-600" />
          <span className="font-semibold text-gray-800">Comprobante de Pago</span>
        </div>

        {!uploadedFile ? (
          <label
            className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors"
            data-testid="upload-area"
          >
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm font-medium text-gray-600">
              Subir comprobante
            </span>
            <span className="text-xs text-gray-400 mt-1">
              JPG, PNG, WebP o PDF (máx. 5MB)
            </span>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={handleFileSelect}
              data-testid="file-input"
            />
          </label>
        ) : (
          <div className="relative" data-testid="file-preview">
            {previewUrl ? (
              <div className="relative rounded-lg overflow-hidden">
                <img
                  src={previewUrl}
                  alt="Comprobante"
                  className="w-full h-48 object-cover"
                />
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <FileImage className="w-8 h-8 text-gray-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {uploadedFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(uploadedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={handleRemoveFile}
              className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow hover:bg-white transition-colors"
              data-testid="remove-file"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {submitError && (
        <div
          className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg"
          data-testid="submit-error"
        >
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{submitError}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={isPending || !uploadedFile}
        className={cn(
          "w-full py-3 rounded-lg font-semibold text-white transition-colors flex items-center justify-center gap-2",
          uploadedFile && !isPending
            ? "bg-orange-500 hover:bg-orange-600"
            : "bg-gray-300 cursor-not-allowed"
        )}
        data-testid="submit-payment"
      >
        {isPending ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Enviando...</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-5 h-5" />
            <span>Confirmar Pago</span>
          </>
        )}
      </button>
    </div>
  );
}

/**
 * Bank detail row with copy functionality
 */
function BankDetailRow({
  label,
  value,
  field,
  copiedField,
  onCopy,
}: {
  label: string;
  value: string;
  field: string;
  copiedField: string | null;
  onCopy: (text: string, field: string) => void;
}) {
  const isCopied = copiedField === field;

  return (
    <div className="flex items-center justify-between" data-testid={`bank-${field}`}>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-800">{value}</p>
      </div>
      <button
        onClick={() => onCopy(value, field)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        title="Copiar"
      >
        {isCopied ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <Copy className="w-4 h-4 text-gray-400" />
        )}
      </button>
    </div>
  );
}

/**
 * Pending verification view - AC: 8.7.6
 * Shows when there's already a pending withdrawal request
 */
function PendingVerificationView({
  withdrawal,
  commissionPending,
}: {
  withdrawal: PendingWithdrawal;
  commissionPending: number;
}) {
  return (
    <div className="space-y-4">
      {/* Status Card */}
      <div
        className="bg-amber-50 border border-amber-200 rounded-xl p-4"
        data-testid="pending-status-card"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="font-semibold text-amber-800">Pago enviado</p>
            <p className="text-sm text-amber-600">En verificación</p>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Monto:</span>
            <span className="font-medium text-gray-800">
              {formatCLP(withdrawal.amount)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Enviado:</span>
            <span className="font-medium text-gray-800">
              {format(new Date(withdrawal.created_at), "d MMM yyyy, HH:mm", {
                locale: es,
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Info Message */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-700">
          Tu pago está siendo revisado por nuestro equipo. Te notificaremos cuando
          sea aprobado. Este proceso normalmente toma 1-2 días hábiles.
        </p>
      </div>

      {/* Remaining Balance */}
      {commissionPending > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Comisión restante después de aprobación</p>
          <p className="text-lg font-bold text-gray-800">
            {formatCLP(Math.max(0, commissionPending - withdrawal.amount))}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Success view after submission
 */
function SubmissionSuccessView({
  amount,
  onBack,
}: {
  amount: number;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
        <CheckCircle2 className="w-8 h-8 text-green-600" />
      </div>

      <h2 className="text-xl font-bold text-gray-800 mb-2">Pago Enviado</h2>

      <p className="text-gray-600 mb-1">
        Tu pago de <span className="font-semibold">{formatCLP(amount)}</span> fue
        enviado exitosamente.
      </p>

      <p className="text-sm text-gray-500 mb-6">
        Te notificaremos cuando sea verificado por nuestro equipo.
      </p>

      <button
        onClick={onBack}
        className="px-6 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors"
        data-testid="back-to-earnings"
      >
        Volver a Ganancias
      </button>
    </div>
  );
}
