"use client";

import { type LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";

export interface MetricCardProps {
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
  label: string;
  value: string | number;
  subtext?: string;
  trend?: number;
  trendLabel?: string;
  href?: string;
  variant?: "default" | "primary" | "revenue";
  testId?: string;
}

export function MetricCard({
  icon: Icon,
  iconBgColor,
  iconColor,
  label,
  value,
  subtext,
  trend,
  trendLabel,
  href,
  variant = "default",
  testId,
}: MetricCardProps) {
  const isRevenue = variant === "revenue";

  const content = (
    <div
      className={`rounded-xl p-3.5 shadow-sm ${
        isRevenue
          ? "bg-gradient-to-br from-gray-700 to-gray-900 text-white"
          : "bg-white"
      } ${href ? "hover:shadow-md transition-shadow cursor-pointer" : ""}`}
      data-testid={testId}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className={`w-7 h-7 ${iconBgColor} rounded-lg flex items-center justify-center`}
        >
          <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
        </div>
        <span
          className={`text-xs ${isRevenue ? "text-gray-300" : "text-gray-500"}`}
        >
          {label}
        </span>
      </div>

      <p
        className={`text-xl font-extrabold ${
          isRevenue ? "text-white" : "text-gray-900"
        }`}
      >
        {value}
      </p>

      {/* Trend indicator or subtext */}
      <div className="flex items-center gap-1.5 mt-0.5">
        {trend !== undefined && trend !== 0 ? (
          <>
            {trend > 0 ? (
              <TrendingUp className="w-3 h-3 text-green-500" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-500" />
            )}
            <span
              className={`text-xs font-medium ${
                trend > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend > 0 ? "+" : ""}
              {trend}%
            </span>
            {trendLabel && (
              <span
                className={`text-xs ${
                  isRevenue ? "text-gray-400" : "text-gray-400"
                }`}
              >
                {trendLabel}
              </span>
            )}
          </>
        ) : subtext ? (
          <span
            className={`text-xs ${
              isRevenue ? "text-gray-400" : "text-gray-400"
            }`}
          >
            {subtext}
          </span>
        ) : trend === 0 ? (
          <span className="text-xs text-gray-400">Sin cambio</span>
        ) : null}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

/**
 * Mini metric card for smaller displays (2x2 grid)
 */
export function MiniMetricCard({
  icon: Icon,
  iconBgColor,
  iconColor,
  label,
  value,
  subtext,
  testId,
}: Omit<MetricCardProps, "trend" | "trendLabel" | "href" | "variant">) {
  return (
    <div className="bg-white rounded-xl p-3 shadow-sm" data-testid={testId}>
      <div className="flex items-center gap-2 mb-1">
        <div
          className={`w-6 h-6 ${iconBgColor} rounded-md flex items-center justify-center`}
        >
          <Icon className={`w-3 h-3 ${iconColor}`} />
        </div>
        <span className="text-[10px] text-gray-500 uppercase font-semibold">
          {label}
        </span>
      </div>
      <p className="text-base font-extrabold text-gray-900">{value}</p>
      {subtext && <p className="text-[10px] text-gray-400">{subtext}</p>}
    </div>
  );
}
