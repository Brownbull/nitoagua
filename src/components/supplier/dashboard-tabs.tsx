"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { RequestList } from "./request-list";
import { EmptyState } from "./empty-state";
import type { WaterRequest } from "@/lib/supabase/types";

type TabValue = "pending" | "accepted" | "completed";

interface DashboardTabsProps {
  pendingRequests: WaterRequest[];
  acceptedRequests: WaterRequest[];
  completedRequests: WaterRequest[];
  defaultTab?: TabValue;
}

export function DashboardTabs({
  pendingRequests,
  acceptedRequests,
  completedRequests,
  defaultTab = "pending",
}: DashboardTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get current tab from URL or use default
  const currentTab = (searchParams.get("tab") as TabValue) || defaultTab;

  const handleTabChange = (value: string) => {
    // Update URL with new tab value
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleAccept = (requestId: string) => {
    // Navigate to request details for accept flow (Story 3-5)
    router.push(`/requests/${requestId}`);
  };

  return (
    <Tabs
      value={currentTab}
      onValueChange={handleTabChange}
      className="w-full"
      data-testid="dashboard-tabs"
    >
      <TabsList className="w-full grid grid-cols-3" data-testid="tabs-list">
        <TabsTrigger
          value="pending"
          className="flex items-center gap-2"
          data-testid="tab-pending"
        >
          Pendientes
          {pendingRequests.length > 0 && (
            <Badge
              variant="secondary"
              className="h-5 min-w-[20px] px-1.5"
              data-testid="pending-badge"
            >
              {pendingRequests.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger
          value="accepted"
          className="flex items-center gap-2"
          data-testid="tab-accepted"
        >
          Aceptadas
          {acceptedRequests.length > 0 && (
            <Badge
              variant="secondary"
              className="h-5 min-w-[20px] px-1.5"
              data-testid="accepted-badge"
            >
              {acceptedRequests.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger
          value="completed"
          className="flex items-center gap-2"
          data-testid="tab-completed"
        >
          Completadas
          {completedRequests.length > 0 && (
            <Badge
              variant="secondary"
              className="h-5 min-w-[20px] px-1.5"
              data-testid="completed-badge"
            >
              {completedRequests.length}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="pending" className="mt-4" data-testid="content-pending">
        {pendingRequests.length > 0 ? (
          <RequestList
            requests={pendingRequests}
            showAcceptButton={true}
            onAccept={handleAccept}
            currentTab="pending"
          />
        ) : (
          <EmptyState tab="pending" />
        )}
      </TabsContent>

      <TabsContent value="accepted" className="mt-4" data-testid="content-accepted">
        {acceptedRequests.length > 0 ? (
          <RequestList requests={acceptedRequests} currentTab="accepted" />
        ) : (
          <EmptyState tab="accepted" />
        )}
      </TabsContent>

      <TabsContent value="completed" className="mt-4" data-testid="content-completed">
        {completedRequests.length > 0 ? (
          <RequestList requests={completedRequests} currentTab="completed" />
        ) : (
          <EmptyState tab="completed" />
        )}
      </TabsContent>
    </Tabs>
  );
}
