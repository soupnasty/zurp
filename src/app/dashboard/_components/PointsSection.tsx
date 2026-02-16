"use client";

import type { SerializedPointsSummary } from "./types";

const COLOR_BONUS = "#60a5fa";
const COLOR_BASE = "var(--text-dim)";

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
  travel_other: "Travel",
  car_rentals: "Car Rentals",
  parking: "Parking",
  transit: "Transit",
  gas_stations: "Gas",
  entertainment: "Entertainment",
  fitness: "Fitness",
  shopping_online: "Online Shopping",
  shopping_instore: "In-Store Shopping",
  drugstores: "Drugstores",
  home_improvement: "Home Improvement",
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
  const totalSpend = pointsSummary.totalSpend;
  const effectiveRate = totalSpend > 0 ? ((totalValue / totalSpend) * 100).toFixed(1) : "0.0";
  const maxSpend = Math.max(...cats.map((c) => c.spend), 1);

  return (
    <div className="mt-8">
      <h2
        className="text-[10px] font-bold uppercase tracking-[2px] text-[var(--text-secondary)] mb-3"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Points Earned
      </h2>
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

      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="flex items-baseline justify-between mb-4">
          <div className="flex items-baseline gap-2">
            <span
              className="text-[22px] md:text-[28px] font-bold text-[var(--color-accent-blue)]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              ${Math.round(totalValue).toLocaleString()}
            </span>
            <span className="text-xs md:text-sm text-[var(--text-secondary)]">
              points earned this year
            </span>
          </div>
          <span
            className="text-xs text-[var(--text-dim)]"
            style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}
          >
            ${Math.round(totalSpend).toLocaleString()} total spend
          </span>
        </div>

        {/* Category rows */}
        <div className="flex flex-col">
          {cats.map((cat) => {
            const isBonus = cat.earnRate > 1;
            const color = isBonus ? COLOR_BONUS : COLOR_BASE;
            const barPct = (cat.spend / maxSpend) * 100;

            return (
              <div
                key={cat.category}
                className="grid items-center gap-2 py-2.5 border-t border-[var(--border-subtle)]"
                style={{
                  gridTemplateColumns: "minmax(70px, 110px) 40px 1fr auto auto",
                }}
              >
                {/* Category name */}
                <span
                  className="text-[13px] font-semibold text-[var(--text-primary)] truncate"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {CATEGORY_LABELS[cat.category] ?? cat.category}
                </span>

                {/* Rate pill */}
                <span
                  className="inline-flex items-center justify-center rounded text-[10px] font-bold"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: isBonus ? COLOR_BONUS : "var(--text-secondary)",
                    borderWidth: 1,
                    borderColor: isBonus ? "rgba(96,165,250,0.25)" : "rgba(255,255,255,0.08)",
                    background: isBonus ? "rgba(96,165,250,0.08)" : "transparent",
                    padding: "2px 6px",
                  }}
                >
                  {fmtRate(cat.earnRate, isCashBack)}
                </span>

                {/* Spend bar */}
                <div
                  className="overflow-hidden rounded-full"
                  style={{ height: 6, background: "rgba(255,255,255,0.04)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${barPct}%`,
                      background: isBonus
                        ? "linear-gradient(90deg, #3b82f6, #60a5fa)"
                        : "var(--color-accent-blue)",
                      opacity: isBonus ? 1 : 0.5,
                    }}
                  />
                </div>

                {/* Spend amount */}
                <span
                  className="text-[11px] text-[var(--text-dim)] text-right"
                  style={{ fontFamily: "var(--font-mono)", fontWeight: 700, minWidth: 48 }}
                >
                  ${Math.round(cat.spend).toLocaleString()}
                </span>

                {/* Points value */}
                <span
                  className="text-[13px] font-bold text-right"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: "var(--color-accent-blue)",
                    minWidth: 36,
                  }}
                >
                  ${Math.round(cat.valueConservative).toLocaleString()}
                </span>
              </div>
            );
          })}

          {/* Total row */}
          <div
            className="grid items-center gap-2 pt-3 mt-1 border-t border-[var(--border-subtle)]"
            style={{
              gridTemplateColumns: "minmax(70px, 110px) 40px 1fr auto auto",
            }}
          >
            <span
              className="text-[13px] font-bold text-[var(--text-secondary)]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Total
            </span>
            <span />
            <span />
            <span
              className="text-[11px] text-[var(--text-dim)] text-right"
              style={{ fontFamily: "var(--font-mono)", fontWeight: 700, minWidth: 48 }}
            >
              ${Math.round(totalSpend).toLocaleString()}
            </span>
            <span
              className="text-[13px] font-bold text-right"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--color-accent-blue)",
                minWidth: 36,
              }}
            >
              ${Math.round(totalValue).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
