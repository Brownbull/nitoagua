"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

type Period = "week" | "month" | "year";

// Generate weeks for the current month
const getWeeksOfMonth = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const lastDay = new Date(year, month + 1, 0);
  const weeks: { label: string; value: string }[] = [];

  let weekStart = 1;
  let weekNum = 1;

  while (weekStart <= lastDay.getDate()) {
    const weekEnd = Math.min(weekStart + 6, lastDay.getDate());
    weeks.push({
      label: `${weekStart} - ${weekEnd} Dic`,
      value: `week-${weekNum}`,
    });
    weekStart = weekEnd + 1;
    weekNum++;
  }

  return weeks;
};

// Months of the year
const MONTHS = [
  { label: "Enero", value: "01" },
  { label: "Febrero", value: "02" },
  { label: "Marzo", value: "03" },
  { label: "Abril", value: "04" },
  { label: "Mayo", value: "05" },
  { label: "Junio", value: "06" },
  { label: "Julio", value: "07" },
  { label: "Agosto", value: "08" },
  { label: "Septiembre", value: "09" },
  { label: "Octubre", value: "10" },
  { label: "Noviembre", value: "11" },
  { label: "Diciembre", value: "12" },
];

// Available years (placeholder - would come from data)
const YEARS = [
  { label: "2025", value: "2025" },
  { label: "2024", value: "2024" },
  { label: "2023", value: "2023" },
];

export function DashboardPeriodSelector() {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("month");
  const [dropdownOpen, setDropdownOpen] = useState<Period | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<string>("week-1");
  const [selectedMonth, setSelectedMonth] = useState<string>("12"); // December
  const [selectedYear, setSelectedYear] = useState<string>("2025");

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const weeks = getWeeksOfMonth();

  const handlePeriodClick = (period: Period) => {
    if (selectedPeriod === period) {
      // Toggle dropdown if same period clicked
      setDropdownOpen(dropdownOpen === period ? null : period);
    } else {
      // Select period and open dropdown
      setSelectedPeriod(period);
      setDropdownOpen(period);
    }
  };

  const getSelectedLabel = (period: Period) => {
    switch (period) {
      case "week":
        const week = weeks.find((w) => w.value === selectedWeek);
        return week?.label || "Semana";
      case "month":
        const month = MONTHS.find((m) => m.value === selectedMonth);
        return month?.label || "Mes";
      case "year":
        return selectedYear;
    }
  };

  return (
    <div className="flex gap-2 relative" data-testid="dashboard-period-selector" ref={dropdownRef}>
      {/* Week Button */}
      <div className="flex-1 relative">
        <button
          onClick={() => handlePeriodClick("week")}
          className={`w-full py-2 px-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 ${
            selectedPeriod === "week"
              ? "bg-gray-800 text-white"
              : "bg-white text-gray-600 border border-gray-200"
          }`}
          data-testid="period-week"
        >
          <span className="truncate">{selectedPeriod === "week" ? getSelectedLabel("week") : "Semana"}</span>
          <ChevronDown
            className={`w-3 h-3 shrink-0 transition-transform ${dropdownOpen === "week" ? "rotate-180" : ""}`}
          />
        </button>
        {dropdownOpen === "week" && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
            {weeks.map((week) => (
              <button
                key={week.value}
                onClick={() => {
                  setSelectedWeek(week.value);
                  setSelectedPeriod("week");
                  setDropdownOpen(null);
                }}
                className={`w-full px-3 py-2 text-left text-xs hover:bg-gray-100 ${
                  selectedWeek === week.value ? "bg-gray-100 font-semibold" : ""
                }`}
              >
                {week.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Month Button */}
      <div className="flex-1 relative">
        <button
          onClick={() => handlePeriodClick("month")}
          className={`w-full py-2 px-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 ${
            selectedPeriod === "month"
              ? "bg-gray-800 text-white"
              : "bg-white text-gray-600 border border-gray-200"
          }`}
          data-testid="period-month"
        >
          <span className="truncate">{selectedPeriod === "month" ? getSelectedLabel("month") : "Mes"}</span>
          <ChevronDown
            className={`w-3 h-3 shrink-0 transition-transform ${dropdownOpen === "month" ? "rotate-180" : ""}`}
          />
        </button>
        {dropdownOpen === "month" && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
            {MONTHS.map((month) => (
              <button
                key={month.value}
                onClick={() => {
                  setSelectedMonth(month.value);
                  setSelectedPeriod("month");
                  setDropdownOpen(null);
                }}
                className={`w-full px-3 py-2 text-left text-xs hover:bg-gray-100 ${
                  selectedMonth === month.value ? "bg-gray-100 font-semibold" : ""
                }`}
              >
                {month.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Year Button */}
      <div className="flex-1 relative">
        <button
          onClick={() => handlePeriodClick("year")}
          className={`w-full py-2 px-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 ${
            selectedPeriod === "year"
              ? "bg-gray-800 text-white"
              : "bg-white text-gray-600 border border-gray-200"
          }`}
          data-testid="period-year"
        >
          <span className="truncate">{selectedPeriod === "year" ? getSelectedLabel("year") : "Año"}</span>
          <ChevronDown
            className={`w-3 h-3 shrink-0 transition-transform ${dropdownOpen === "year" ? "rotate-180" : ""}`}
          />
        </button>
        {dropdownOpen === "year" && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
            {YEARS.map((year) => (
              <button
                key={year.value}
                onClick={() => {
                  setSelectedYear(year.value);
                  setSelectedPeriod("year");
                  setDropdownOpen(null);
                }}
                className={`w-full px-3 py-2 text-left text-xs hover:bg-gray-100 ${
                  selectedYear === year.value ? "bg-gray-100 font-semibold" : ""
                }`}
              >
                {year.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
