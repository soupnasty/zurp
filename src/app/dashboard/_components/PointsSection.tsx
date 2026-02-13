"use client";

import type { SerializedPointsSummary } from "./types";

// Two-tone: blue for bonus, muted for base
const COLOR_BONUS = "#60a5fa";
const COLOR_BASE = "#7a8ba8";

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

function RatePill({ rate, color, isCashBack }: { rate: number; color: string; isCashBack: boolean }) {
  return (
    <span
      className="inline-block text-center rounded border px-1.5 md:px-2 py-0.5 text-[10px] md:text-xs font-bold"
      style={{
        fontFamily: "var(--font-mono)",
        color,
        borderColor: `${color}33`,
        background: `${color}08`,
      }}
    >
      {fmtRate(rate, isCashBack)}
    </span>
  );
}

interface MultiplierGroup {
  rate: number;
  color: string;
  categories: Array<{
    category: string;
    spend: number;
    points: number;
    earnRate: number;
    valueConservative: number;
  }>;
  totalSpend: number;
  totalValue: number;
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

  // Group categories by earn rate
  const groupMap = new Map<number, MultiplierGroup>();
  for (const cat of cats) {
    let group = groupMap.get(cat.earnRate);
    if (!group) {
      group = {
        rate: cat.earnRate,
        color: cat.earnRate > 1 ? COLOR_BONUS : COLOR_BASE,
        categories: [],
        totalSpend: 0,
        totalValue: 0,
      };
      groupMap.set(cat.earnRate, group);
    }
    group.categories.push(cat);
    group.totalSpend += cat.spend;
    group.totalValue += cat.valueConservative;
  }

  // Sort groups: highest rate first
  const groups = Array.from(groupMap.values()).sort((a, b) => b.rate - a.rate);

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

      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="mb-5 md:mb-6">
          <span
            className="text-[24px] md:text-[28px] font-bold text-[var(--color-accent-blue)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ${Math.round(totalValue).toLocaleString()}
          </span>
          <span className="ml-2 text-xs md:text-sm text-[var(--text-secondary)]">
            total points value this year
          </span>
        </div>

        {/* Two-tone bar: bonus vs base */}
        {groups.length > 0 && (() => {
          const bonusValue = groups.filter((g) => g.rate > 1).reduce((s, g) => s + g.totalValue, 0);
          const baseValue = groups.filter((g) => g.rate <= 1).reduce((s, g) => s + g.totalValue, 0);
          const bonusPct = totalValue > 0 ? (bonusValue / totalValue) * 100 : 0;
          const basePct = totalValue > 0 ? (baseValue / totalValue) * 100 : 0;
          return (
            <div className="mb-5 md:mb-6 flex overflow-hidden rounded-md" style={{ height: 12 }}>
              {bonusPct > 0 && (
                <div style={{ width: `${bonusPct}%`, background: "linear-gradient(90deg, #3b82f6, #60a5fa)" }} />
              )}
              {basePct > 0 && (
                <div style={{ width: `${basePct}%`, background: "linear-gradient(90deg, #64748b, #7a8ba8)" }} />
              )}
            </div>
          );
        })()}

        {/* Multiplier groups */}
        <div>
          {groups.map((group, gi) => {
            const isSingleCategory = group.categories.length === 1;
            const cat0 = group.categories[0];
            const borderClass = gi < groups.length - 1 ? "border-b border-[var(--border-subtle)]" : "";

            // Single category in group: render as a flat row
            if (isSingleCategory) {
              return (
                <div key={group.rate} className={borderClass}>
                  {/* Mobile: flex row */}
                  <div className="flex items-center gap-2 py-2.5 md:hidden">
                    <span className="h-2 w-2 shrink-0 rounded-sm" style={{ background: group.color }} />
                    <span className="flex-1 min-w-0 truncate text-[13px] font-semibold text-[var(--text-primary)]">
                      {CATEGORY_LABELS[cat0.category] ?? cat0.category}
                    </span>
                    <RatePill rate={group.rate} color={group.color} isCashBack={isCashBack} />
                    <span
                      className="shrink-0 text-[13px] font-bold"
                      style={{ fontFamily: "var(--font-mono)", color: group.color }}
                    >
                      ${Math.round(cat0.valueConservative).toLocaleString()}
                    </span>
                  </div>
                  {/* Desktop: grid row */}
                  <div className="points-row-desktop hidden md:grid py-3">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ background: group.color }} />
                    <span className="text-sm font-semibold text-[var(--text-primary)]">
                      {CATEGORY_LABELS[cat0.category] ?? cat0.category}
                    </span>
                    <RatePill rate={group.rate} color={group.color} isCashBack={isCashBack} />
                    <span className="text-right text-xs text-[var(--text-secondary)]" style={{ fontFamily: "var(--font-mono)" }}>
                      ${Math.round(cat0.spend).toLocaleString()}
                    </span>
                    <span className="text-right text-sm font-bold" style={{ fontFamily: "var(--font-mono)", color: group.color }}>
                      ${Math.round(cat0.valueConservative).toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            }

            // Multiple categories: group header + sub-rows
            return (
              <div key={group.rate} className={borderClass}>
                {/* Mobile header */}
                <div className="flex items-center gap-2 pt-2.5 pb-1 md:hidden">
                  <span className="h-2 w-2 shrink-0 rounded-sm" style={{ background: group.color }} />
                  <span
                    className="text-[10px] font-bold uppercase tracking-[2px] text-[var(--text-secondary)]"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {group.rate === 1 ? "Base" : "Bonus"}
                  </span>
                  <RatePill rate={group.rate} color={group.color} isCashBack={isCashBack} />
                  <span className="flex-1" />
                  <span
                    className="shrink-0 text-[13px] font-bold"
                    style={{ fontFamily: "var(--font-mono)", color: group.color }}
                  >
                    ${Math.round(group.totalValue).toLocaleString()}
                  </span>
                </div>
                {/* Desktop header */}
                <div className="points-row-desktop hidden md:grid pt-3 pb-1">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: group.color }} />
                  <span
                    className="text-[10px] font-bold uppercase tracking-[2px] text-[var(--text-secondary)]"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {group.rate === 1 ? "Base" : "Bonus"}
                  </span>
                  <RatePill rate={group.rate} color={group.color} isCashBack={isCashBack} />
                  <span className="text-right text-xs text-[var(--text-secondary)]" style={{ fontFamily: "var(--font-mono)" }}>
                    ${Math.round(group.totalSpend).toLocaleString()}
                  </span>
                  <span className="text-right text-sm font-bold" style={{ fontFamily: "var(--font-mono)", color: group.color }}>
                    ${Math.round(group.totalValue).toLocaleString()}
                  </span>
                </div>

                {/* Sub-rows */}
                {group.categories.map((cat) => (
                  <div key={cat.category}>
                    {/* Mobile sub-row */}
                    <div className="flex items-center justify-between pl-5 py-1 md:hidden">
                      <span className="text-[12px] text-[var(--text-secondary)]">
                        {CATEGORY_LABELS[cat.category] ?? cat.category}
                      </span>
                      <span
                        className="text-[12px] font-bold"
                        style={{ fontFamily: "var(--font-mono)", color: group.color, opacity: 0.7 }}
                      >
                        ${Math.round(cat.valueConservative).toLocaleString()}
                      </span>
                    </div>
                    {/* Desktop sub-row */}
                    <div className="points-subrow-desktop hidden md:grid py-1.5">
                      <span />
                      <span className="text-[13px] text-[var(--text-secondary)]">
                        {CATEGORY_LABELS[cat.category] ?? cat.category}
                      </span>
                      <span />
                      <span
                        className="text-right text-[11px] text-[var(--text-secondary)]"
                        style={{ fontFamily: "var(--font-mono)", opacity: 0.7 }}
                      >
                        ${Math.round(cat.spend).toLocaleString()}
                      </span>
                      <span
                        className="text-right text-[13px] font-bold"
                        style={{ fontFamily: "var(--font-mono)", color: group.color, opacity: 0.7 }}
                      >
                        ${Math.round(cat.valueConservative).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}

                <div className="h-1.5 md:h-2" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
