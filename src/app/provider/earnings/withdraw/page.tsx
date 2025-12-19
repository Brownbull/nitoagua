import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  getEarningsSummary,
  getPlatformBankDetails,
  getPendingWithdrawal,
} from "@/lib/actions/settlement";
import { WithdrawClient } from "./withdraw-client";

/**
 * Provider Commission Settlement Page
 * AC: 8.7.1 - Amount due displayed prominently
 * AC: 8.7.2 - Platform bank details shown
 * AC: 8.7.3 - Upload receipt button
 * AC: 8.7.6 - Show pending verification status
 */
export default async function WithdrawPage() {
  // Fetch all required data in parallel
  const [summaryResult, bankDetailsResult, pendingWithdrawalResult] = await Promise.all([
    getEarningsSummary("month"),
    getPlatformBankDetails(),
    getPendingWithdrawal(),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <Link
            href="/provider/earnings"
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            data-testid="back-to-earnings"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-lg font-bold text-gray-800">Pagar Comisión</h1>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-4 max-w-lg mx-auto">
        <Suspense fallback={<WithdrawLoadingSkeleton />}>
          <WithdrawClient
            commissionPending={summaryResult.success ? summaryResult.data?.commission_pending ?? 0 : 0}
            bankDetails={bankDetailsResult.success ? bankDetailsResult.data! : null}
            pendingWithdrawal={pendingWithdrawalResult.success ? (pendingWithdrawalResult.data ?? null) : null}
            error={
              !summaryResult.success ? summaryResult.error :
              !bankDetailsResult.success ? bankDetailsResult.error : undefined
            }
          />
        </Suspense>
      </div>
    </div>
  );
}

function WithdrawLoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Amount card skeleton */}
      <div className="h-28 bg-gray-200 rounded-xl" />

      {/* Bank details skeleton */}
      <div className="h-48 bg-gray-200 rounded-xl" />

      {/* Upload section skeleton */}
      <div className="h-40 bg-gray-200 rounded-xl" />
    </div>
  );
}
