"use client";

import { useState } from "react";
import { RequestCard } from "./request-card";
import { Button } from "@/components/ui/button";
import type { WaterRequest } from "@/lib/supabase/types";

interface RequestListProps {
  requests: WaterRequest[];
  showAcceptButton?: boolean;
  onAccept?: (requestId: string) => void;
  pageSize?: number;
  currentTab?: string;
}

export function RequestList({
  requests,
  showAcceptButton = false,
  onAccept,
  pageSize = 20,
  currentTab,
}: RequestListProps) {
  const [visibleCount, setVisibleCount] = useState(pageSize);

  // Sort requests: urgent first, then by created_at (oldest first)
  const sortedRequests = [...requests].sort((a, b) => {
    // Urgent requests first
    if (a.is_urgent && !b.is_urgent) return -1;
    if (!a.is_urgent && b.is_urgent) return 1;

    // Then by created_at (oldest first)
    const dateA = new Date(a.created_at!).getTime();
    const dateB = new Date(b.created_at!).getTime();
    return dateA - dateB;
  });

  const visibleRequests = sortedRequests.slice(0, visibleCount);
  const hasMore = visibleCount < sortedRequests.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + pageSize);
  };

  return (
    <div className="space-y-3" data-testid="request-list">
      {visibleRequests.map((request) => (
        <RequestCard
          key={request.id}
          request={request}
          showAcceptButton={showAcceptButton}
          onAccept={onAccept}
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
