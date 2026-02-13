"use client";

import type { SerializedPointsSummary } from "./types";

// Blue shade palette for category bar
const BLUE_SHADES = [
  "#60a5fa", "#3b82f6", "#2563eb", "#1d4ed8", "#1e40af",
  "#4f87f7", "#6b9fff", "#8ab5ff", "#a5c8ff", "#bedaff",
];

const CATEGORY_LABELS: Record<string, string> = {
  dining: "Dining",
  groceries: "Groceries",
  grocery_online: "Online Grocery",
  food_delivery: "Food Delivery",
  coffee: "Coffee",
  streaming: "Streaming",
  rideshare: "Rideshare",
  travel_flights: "Flights",
  travel_hotels: "Hotels",
  travel_portal: "Travel Portal",
  travel_other: "Travel Other",
  car_rentals: "Car Rentals",
  parking: "Parking",
  transit: "Transit",
  gas_stations: "Gas",
  entertainment: "Entertainment",
  fitness: "Fitness",
  shopping_online: "Online Shopping",
  shopping_instore: "In-Store Shopping",
  drugstores: "Drugstores",
  home_improvement: "Home",
  wholesale_clubs: "Wholesale",
  phone_services: "Phone",
  bills_utilities: "Bills/Utilities",
  insurance: "Insurance",
  other: "Other",
};

function fmtRate(rate: number, isCashBack: boolean): string {
  if (isCashBack) return `${rate}%`;
  return `${rate}x`;
}

interface PointsSectionProps {
  pointsSummary: SerializedPointsSummary;
  conservativeCpp: number;
  isCashBack?: boolean;
}

export function PointsSection({
  pointsSummary,
  conservativeCpp,
  isCashBack = false,
}: PointsSectionProps) {
  const cats = pointsSummary.categoryBreakdown
    .filter((c) => c.points > 0)
    .sort((a, b) => b.valueConservative - a.valueConservative);

  const totalValue = pointsSummary.valueConservative;
  const maxValue = cats.length > 0 ? Math.max(...cats.map((c) => c.valueConservative)) : 0;

  return (
    <div
      className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden"
      style={{ position: "relative" }}
    >
      {/* Top edge glow */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(96,165,250,0.2), transparent)",
        }}
      />

      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <span
            className="text-[28px] font-bold text-[var(--color-accent-blue)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ${Math.round(totalValue).toLocaleString()}
          </span>
          <span className="ml-2 text-sm text-[var(--text-secondary)]">
            total points value this year
          </span>
        </div>

        {/* Proportional category bar */}
        {cats.length > 0 && (
          <div className="mb-6 flex overflow-hidden rounded-md" style={{ height: 12 }}>
            {cats.map((cat, i) => {
              const pct = totalValue > 0 ? (cat.valueConservative / totalValue) * 100 : 0;
              if (pct < 1) return null;
              return (
                <div
                  key={cat.category}
                  style={{
                    width: `${pct}%`,
                    background: BLUE_SHADES[i % BLUE_SHADES.length],
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Category rows */}
        <div className="space-y-0">
          {cats.map((cat, i) => (
            <div
              key={cat.category}
              className="grid items-center gap-3 py-2.5 border-b border-[var(--border-subtle)] last:border-0"
              style={{
                gridTemplateColumns: "10px 1fr 70px 60px 80px",
              }}
            >
              {/* Color dot */}
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{ background: BLUE_SHADES[i % BLUE_SHADES.length] }}
              />

              {/* Category name */}
              <div className="min-w-0">
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  {CATEGORY_LABELS[cat.category] ?? cat.category}
                </span>
              </div>

              {/* Rate pill */}
              <span
                className="text-center rounded border border-[var(--border-subtle)] px-2 py-0.5 text-xs font-bold"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "var(--text-secondary)",
                  background: "rgba(96,165,250,0.03)",
                }}
              >
                {fmtRate(cat.earnRate, isCashBack)}
              </span>

              {/* Spend */}
              <span
                className="hidden md:block text-right text-xs text-[var(--text-secondary)]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                ${Math.round(cat.spend).toLocaleString()}
              </span>

              {/* Earned */}
              <span
                className="text-right text-sm font-bold text-[var(--color-accent-blue)]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                ${Math.round(cat.valueConservative).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
