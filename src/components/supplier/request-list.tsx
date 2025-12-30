"use client";

import { useState, useMemo, useCallback } from "react";
import { RequestCard } from "./request-card";
import { Button } from "@/components/ui/button";
import type { WaterRequest } from "@/lib/supabase/types";

interface RequestListProps {
  requests: WaterRequest[];
  showAcceptButton?: boolean;
  showDeliverButton?: boolean;
  onAcceptRequest?: (request: WaterRequest) => void;
  onDeliverRequest?: (request: WaterRequest) => void;
  pageSize?: number;
  currentTab?: string;
}

export function RequestList({
  requests,
  showAcceptButton = false,
  showDeliverButton = false,
  onAcceptRequest,
  onDeliverRequest,
  pageSize = 20,
  currentTab,
}: RequestListProps) {
  const [visibleCount, setVisibleCount] = useState(pageSize);

  // Memoize sorted requests - only recalculates when requests array changes
  const sortedRequests = useMemo(() => {
    return [...requests].sort((a, b) => {
      // Urgent requests first
      if (a.is_urgent && !b.is_urgent) return -1;
      if (!a.is_urgent && b.is_urgent) return 1;

      // Then by created_at (oldest first)
      const dateA = new Date(a.created_at!).getTime();
      const dateB = new Date(b.created_at!).getTime();
      return dateA - dateB;
    });
  }, [requests]);

  const visibleRequests = sortedRequests.slice(0, visibleCount);
  const hasMore = visibleCount < sortedRequests.length;

  // Memoize load more handler
  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => prev + pageSize);
  }, [pageSize]);

  return (
    <div className="space-y-3" data-testid="request-list">
      {visibleRequests.map((request) => (
        <RequestCard
          key={request.id}
          request={request}
          showAcceptButton={showAcceptButton}
          showDeliverButton={showDeliverButton}
          onAcceptRequest={onAcceptRequest}
          onDeliverRequest={onDeliverRequest}
          currentTab={currentTab}
        />
      ))}

      {hasMore && (
        <div className="text-center pt-4">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            data-testid="load-more-button"
          >
            Cargar más ({sortedRequests.length - visibleCount} restantes)
          </Button>
        </div>
      )}
    </div>
  );
}
