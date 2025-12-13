"use client";

import { useState } from "react";
import { VerificationQueue } from "./verification-queue";
import type { ProviderApplication } from "@/app/admin/verification/page";

type FilterTab = "pending" | "more_info_needed";

interface VerificationFilterTabsProps {
  applications: ProviderApplication[];
}

export function VerificationFilterTabs({ applications }: VerificationFilterTabsProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("pending");

  const pendingApplications = applications.filter(
    (a) => a.verification_status === "pending"
  );
  const reviewingApplications = applications.filter(
    (a) => a.verification_status === "more_info_needed"
  );

  const filteredApplications =
    activeTab === "pending" ? pendingApplications : reviewingApplications;

  return (
    <>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab("pending")}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === "pending"
              ? "bg-gray-800 text-white"
              : "bg-white text-gray-600 border-2 border-gray-200"
          }`}
          data-testid="filter-pending"
        >
          Pendientes ({pendingApplications.length})
        </button>
        <button
          onClick={() => setActiveTab("more_info_needed")}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === "more_info_needed"
              ? "bg-gray-800 text-white"
              : "bg-white text-gray-600 border-2 border-gray-200"
          }`}
          data-testid="filter-more-info"
        >
          Revisando ({reviewingApplications.length})
        </button>
      </div>

      {/* Queue */}
      <VerificationQueue applications={filteredApplications} />
    </>
  );
}
