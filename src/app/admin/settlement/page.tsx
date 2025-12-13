import { requireAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { SettlementDashboard } from "@/components/admin/settlement-dashboard";
import { DollarSign, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { differenceInDays } from "date-fns";

export const metadata = {
  title: "Liquidaciones - Admin nitoagua",
  description: "Gestion de liquidaciones y pagos de proveedores",
};

// Types for settlement data
export interface PendingPayment {
  id: string;
  provider_id: string;
  provider_name: string;
  amount: number;
  receipt_path: string | null;
  created_at: string;
  status: string;
}

export interface ProviderBalance {
  provider_id: string;
  provider_name: string;
  total_owed: number;
  current_bucket: number;    // < 7 days
  week_bucket: number;       // 7-14 days
  overdue_bucket: number;    // > 14 days
  days_outstanding: number;
  last_payment_date: string | null;
}

export interface SettlementSummary {
  total_pending: number;
  total_overdue: number;
  pending_verifications: number;
}

async function getSettlementData(): Promise<{
  summary: SettlementSummary;
  pendingPayments: PendingPayment[];
  providerBalances: ProviderBalance[];
}> {
  const adminClient = createAdminClient();
  const now = new Date();

  // 1. Get pending withdrawal requests (for verification)
  const { data: withdrawalRequests, error: wrError } = await adminClient
    .from("withdrawal_requests")
    .select(`
      id,
      provider_id,
      amount,
      receipt_path,
      created_at,
      status
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (wrError) {
    console.error("[ADMIN] Error fetching withdrawal requests:", wrError.message);
  }

  // Get provider names for withdrawal requests
  const wrProviderIds = (withdrawalRequests || []).map(wr => wr.provider_id);
  const { data: wrProviders } = await adminClient
    .from("profiles")
    .select("id, name")
    .in("id", wrProviderIds.length > 0 ? wrProviderIds : ["none"]);

  const wrProviderMap = new Map((wrProviders || []).map(p => [p.id, p.name]));

  const pendingPayments: PendingPayment[] = (withdrawalRequests || []).map(wr => ({
    id: wr.id,
    provider_id: wr.provider_id,
    provider_name: wrProviderMap.get(wr.provider_id) || "Desconocido",
    amount: wr.amount,
    receipt_path: wr.receipt_path,
    created_at: wr.created_at || new Date().toISOString(),
    status: wr.status || "pending",
  }));

  // 2. Get all commission ledger entries
  const { data: ledgerEntries, error: ledgerError } = await adminClient
    .from("commission_ledger")
    .select(`
      id,
      provider_id,
      type,
      amount,
      created_at
    `)
    .order("created_at", { ascending: true });

  if (ledgerError) {
    console.error("[ADMIN] Error fetching commission ledger:", ledgerError.message);
  }

  // Calculate provider balances from ledger
  const providerLedger = new Map<string, {
    total_owed: number;
    total_paid: number;
    entries: Array<{ amount: number; type: string; created_at: string }>;
    last_payment_date: string | null;
  }>();

  (ledgerEntries || []).forEach(entry => {
    if (!providerLedger.has(entry.provider_id)) {
      providerLedger.set(entry.provider_id, {
        total_owed: 0,
        total_paid: 0,
        entries: [],
        last_payment_date: null,
      });
    }
    const provider = providerLedger.get(entry.provider_id)!;

    if (entry.type === "commission_owed") {
      provider.total_owed += entry.amount;
      provider.entries.push({
        amount: entry.amount,
        type: entry.type,
        created_at: entry.created_at,
      });
    } else if (entry.type === "commission_paid" || entry.type === "adjustment") {
      provider.total_paid += entry.amount;
      if (entry.type === "commission_paid") {
        provider.last_payment_date = entry.created_at;
      }
    }
  });

  // Get provider names
  const providerIds = Array.from(providerLedger.keys());
  const { data: providers } = await adminClient
    .from("profiles")
    .select("id, name")
    .in("id", providerIds.length > 0 ? providerIds : ["none"]);

  const providerNameMap = new Map((providers || []).map(p => [p.id, p.name]));

  // Calculate balances with aging buckets
  const providerBalances: ProviderBalance[] = [];
  let totalPending = 0;
  let totalOverdue = 0;

  providerLedger.forEach((data, providerId) => {
    const balance = data.total_owed - data.total_paid;
    if (balance <= 0) return; // Skip providers with no balance

    totalPending += balance;

    // Calculate aging buckets from unpaid commission_owed entries
    let currentBucket = 0;
    let weekBucket = 0;
    let overdueBucket = 0;
    let oldestUnpaidDays = 0;
    let remainingBalance = balance;

    // Process entries from oldest to newest to calculate aging
    const owedEntries = data.entries.filter(e => e.type === "commission_owed");
    for (const entry of owedEntries) {
      if (remainingBalance <= 0) break;

      const entryAmount = Math.min(entry.amount, remainingBalance);
      const daysOld = differenceInDays(now, new Date(entry.created_at));

      if (daysOld > oldestUnpaidDays) {
        oldestUnpaidDays = daysOld;
      }

      if (daysOld < 7) {
        currentBucket += entryAmount;
      } else if (daysOld <= 14) {
        weekBucket += entryAmount;
      } else {
        overdueBucket += entryAmount;
        totalOverdue += entryAmount;
      }

      remainingBalance -= entryAmount;
    }

    providerBalances.push({
      provider_id: providerId,
      provider_name: providerNameMap.get(providerId) || "Desconocido",
      total_owed: balance,
      current_bucket: currentBucket,
      week_bucket: weekBucket,
      overdue_bucket: overdueBucket,
      days_outstanding: oldestUnpaidDays,
      last_payment_date: data.last_payment_date,
    });
  });

  // Sort by days outstanding (most overdue first)
  providerBalances.sort((a, b) => b.days_outstanding - a.days_outstanding);

  const summary: SettlementSummary = {
    total_pending: totalPending,
    total_overdue: totalOverdue,
    pending_verifications: pendingPayments.length,
  };

  return { summary, pendingPayments, providerBalances };
}

export default async function SettlementPage() {
  // Require admin access
  const user = await requireAdmin();

  // Fetch settlement data
  const { summary, pendingPayments, providerBalances } = await getSettlementData();

  console.log(`[ADMIN] Settlement dashboard loaded by ${user.email}: ${pendingPayments.length} pending payments, ${providerBalances.length} provider balances`);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-200 to-white px-5 py-3">
        <div className="flex items-center gap-2 mb-3">
          <Link
            href="/admin/dashboard"
            className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
            data-testid="back-to-dashboard"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <span className="font-logo text-xl text-gray-700">nitoagua</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">Finanzas</h1>
            <p className="text-gray-500 text-sm">
              Diciembre 2025
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-4 lg:p-6">
        <SettlementDashboard
          summary={summary}
          pendingPayments={pendingPayments}
          providerBalances={providerBalances}
        />
      </div>
    </div>
  );
}
