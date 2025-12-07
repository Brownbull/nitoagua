"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { RequestList } from "./request-list";
import { EmptyState } from "./empty-state";
import { DeliveryModal } from "./delivery-modal";
import { DeliverConfirmDialog } from "./deliver-confirm-dialog";
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

  // Modal state for accept
  const [selectedAcceptRequest, setSelectedAcceptRequest] = useState<WaterRequest | null>(null);
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);

  // Dialog state for deliver
  const [selectedDeliverRequest, setSelectedDeliverRequest] = useState<WaterRequest | null>(null);
  const [isDeliverDialogOpen, setIsDeliverDialogOpen] = useState(false);
  const [isDelivering, setIsDelivering] = useState(false);

  // Optimistic state for immediate UI updates
  const [optimisticallyAccepted, setOptimisticallyAccepted] = useState<Set<string>>(new Set());
  const [optimisticallyDelivered, setOptimisticallyDelivered] = useState<Set<string>>(new Set());

  // Clear optimistic state when fresh server data arrives (props change)
  // This prevents stale optimistic IDs from accumulating and ensures
  // tab badge counts stay consistent with actual server data
  useEffect(() => {
    setOptimisticallyAccepted(new Set());
    setOptimisticallyDelivered(new Set());
  }, [pendingRequests, acceptedRequests, completedRequests]);

  // Get current tab from URL or use default
  const currentTab = (searchParams.get("tab") as TabValue) || defaultTab;

  const handleTabChange = (value: string) => {
    // Update URL with new tab value
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.push(`?${params.toString()}`, { scroll: false });
    // Force a server refresh to get fresh data
    // This is needed because router.push uses the client-side Router Cache
    // which may serve stale data for the same route with different query params
    router.refresh();
  };

  const handleAcceptClick = (request: WaterRequest) => {
    setSelectedAcceptRequest(request);
    setIsAcceptModalOpen(true);
  };

  const handleDeliverClick = (request: WaterRequest) => {
    setSelectedDeliverRequest(request);
    setIsDeliverDialogOpen(true);
  };

  const handleConfirmAccept = async (requestId: string, deliveryWindow?: string) => {
    // Optimistic update: immediately hide the request from pending
    setOptimisticallyAccepted((prev) => new Set(prev).add(requestId));

    try {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "accept",
          deliveryWindow,
        }),
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        // Rollback optimistic update
        setOptimisticallyAccepted((prev) => {
          const next = new Set(prev);
          next.delete(requestId);
          return next;
        });
        toast.error(result.error?.message || "Error al aceptar la solicitud");
        return;
      }

      // Success!
      toast.success("Solicitud aceptada");

      // Refresh the page data to get updated lists
      router.refresh();
    } catch (error) {
      // Rollback optimistic update
      setOptimisticallyAccepted((prev) => {
        const next = new Set(prev);
        next.delete(requestId);
        return next;
      });
      console.error("Accept request error:", error);
      toast.error("Error de conexión. Por favor intenta de nuevo.");
    }
  };

  const handleConfirmDeliver = async () => {
    if (!selectedDeliverRequest) return;

    const requestId = selectedDeliverRequest.id;

    // Optimistic update: immediately hide the request from accepted
    setOptimisticallyDelivered((prev) => new Set(prev).add(requestId));
    setIsDelivering(true);

    try {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "deliver",
        }),
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        // Rollback optimistic update
        setOptimisticallyDelivered((prev) => {
          const next = new Set(prev);
          next.delete(requestId);
          return next;
        });
        toast.error(result.error?.message || "Error al marcar como entregado");
        return;
      }

      // Success!
      toast.success("Entrega completada");
      setIsDeliverDialogOpen(false);

      // Refresh the page data to get updated lists
      router.refresh();
    } catch (error) {
      // Rollback optimistic update
      setOptimisticallyDelivered((prev) => {
        const next = new Set(prev);
        next.delete(requestId);
        return next;
      });
      console.error("Deliver request error:", error);
      toast.error("Error de conexión. Por favor intenta de nuevo.");
    } finally {
      setIsDelivering(false);
    }
  };

  // Filter out optimistically accepted requests from pending list
  const filteredPendingRequests = pendingRequests.filter(
    (r) => !optimisticallyAccepted.has(r.id)
  );

  // Filter out optimistically delivered requests from accepted list
  const filteredAcceptedRequests = acceptedRequests.filter(
    (r) => !optimisticallyDelivered.has(r.id)
  );

  return (
    <>
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
            {filteredPendingRequests.length > 0 && (
              <Badge
                variant="secondary"
                className="h-5 min-w-[20px] px-1.5"
                data-testid="pending-badge"
              >
                {filteredPendingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="accepted"
            className="flex items-center gap-2"
            data-testid="tab-accepted"
          >
            Aceptadas
            {filteredAcceptedRequests.length > 0 && (
              <Badge
                variant="secondary"
                className="h-5 min-w-[20px] px-1.5"
                data-testid="accepted-badge"
              >
                {filteredAcceptedRequests.length}
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
          {filteredPendingRequests.length > 0 ? (
            <RequestList
              requests={filteredPendingRequests}
              showAcceptButton={true}
              onAcceptRequest={handleAcceptClick}
              currentTab="pending"
            />
          ) : (
            <EmptyState tab="pending" />
          )}
        </TabsContent>

        <TabsContent value="accepted" className="mt-4" data-testid="content-accepted">
          {filteredAcceptedRequests.length > 0 ? (
            <RequestList
              requests={filteredAcceptedRequests}
              showDeliverButton={true}
              onDeliverRequest={handleDeliverClick}
              currentTab="accepted"
            />
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

      {/* Accept Modal */}
      <DeliveryModal
        request={selectedAcceptRequest}
        open={isAcceptModalOpen}
        onOpenChange={setIsAcceptModalOpen}
        onConfirm={handleConfirmAccept}
      />

      {/* Deliver Confirm Dialog */}
      <DeliverConfirmDialog
        request={selectedDeliverRequest}
        open={isDeliverDialogOpen}
        onOpenChange={setIsDeliverDialogOpen}
        onConfirm={handleConfirmDeliver}
        isLoading={isDelivering}
      />
    </>
  );
}
