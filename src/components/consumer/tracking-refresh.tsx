"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface TrackingRefreshProps {
  /** Interval in milliseconds (default: 30000 = 30 seconds) */
  interval?: number;
}

export function TrackingRefresh({ interval = 30000 }: TrackingRefreshProps) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const handleRefresh = () => {
      // Don't refresh if the page is hidden
      if (document.hidden) {
        return;
      }

      setIsRefreshing(true);
      router.refresh();

      // Clear the refreshing state after a short delay
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    };

    const intervalId = setInterval(handleRefresh, interval);

    // Also set up visibility change handler to immediately refresh when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        handleRefresh();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [router, interval]);

  // Show subtle refreshing indicator
  if (isRefreshing) {
    return (
      <div className="fixed top-4 right-4 text-xs text-gray-500 animate-pulse">
        Actualizando...
      </div>
    );
  }

  return null;
}
