"use client";

import { useState, useEffect, useCallback } from "react";
import { OperationsPeriodSelector } from "./operations-period-selector";
import { DashboardMetrics } from "./dashboard-metrics";
import type { DashboardMetrics as Metrics, Period } from "@/lib/queries/admin-metrics";
import { Loader2 } from "lucide-react";

interface OperationsDashboardProps {
  initialMetrics: Metrics;
}

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// In-memory cache for metrics
const metricsCache = new Map<Period, { data: Metrics; timestamp: number }>();

export function OperationsDashboard({ initialMetrics }: OperationsDashboardProps) {
  const [period, setPeriod] = useState<Period>(initialMetrics.period);
  const [metrics, setMetrics] = useState<Metrics>(initialMetrics);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Store initial metrics in cache
  useEffect(() => {
    metricsCache.set(initialMetrics.period, {
      data: initialMetrics,
      timestamp: Date.now(),
    });
  }, [initialMetrics]);

  // Fetch metrics for a period
  const fetchMetrics = useCallback(async (targetPeriod: Period, forceRefresh = false) => {
    // Check cache first (unless forcing refresh)
    if (!forceRefresh) {
      const cached = metricsCache.get(targetPeriod);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setMetrics(cached.data);
        return;
      }
    }

    setIsLoading(!forceRefresh);
    setIsRefreshing(forceRefresh);

    try {
      const response = await fetch(`/api/admin/metrics?period=${targetPeriod}`);
      if (!response.ok) {
        throw new Error("Failed to fetch metrics");
      }
      const data: Metrics = await response.json();

      // Update cache
      metricsCache.set(targetPeriod, {
        data,
        timestamp: Date.now(),
      });

      setMetrics(data);
    } catch (error) {
      console.error("[Dashboard] Error fetching metrics:", error);
      // Keep showing cached/current data on error
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Handle period change
  const handlePeriodChange = useCallback(
    (newPeriod: Period) => {
      setPeriod(newPeriod);
      fetchMetrics(newPeriod);
    },
    [fetchMetrics]
  );

  // Handle manual refresh
  const handleRefresh = useCallback(() => {
    fetchMetrics(period, true);
  }, [fetchMetrics, period]);

  return (
    <div className="space-y-4">
      {/* Period Selector */}
      <OperationsPeriodSelector value={period} onChange={handlePeriodChange} />

      {/* Metrics Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          <span className="ml-2 text-sm text-gray-500">Cargando metricas...</span>
        </div>
      ) : (
        <DashboardMetrics
          metrics={metrics}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />
      )}
    </div>
  );
}
