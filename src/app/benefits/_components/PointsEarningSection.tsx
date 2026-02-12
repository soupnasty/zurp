"use client";

import { EARN_CATEGORY_LABELS } from "@/lib/points/category-labels";
import type { EarnCategory } from "@/lib/points/types";

interface CategoryRow {
  category: string;
  spend: number;
  points: number;
  earnRate: number;
  valueConservative: number;
}

interface PointsEarningSectionProps {
  totalPoints: number;
  totalValueConservative: number;
  conservativeCpp: number;
  categories: CategoryRow[];
}

export function PointsEarningSection({
  totalPoints,
  totalValueConservative,
  conservativeCpp,
  categories,
}: PointsEarningSectionProps) {
  if (totalPoints <= 0) return null;

  const maxPoints = Math.max(...categories.map((c) => c.points), 1);

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-secondary)] p-[var(--space-md)]">
      {/* Total line */}
      <div className="flex items-baseline gap-2 mb-[var(--space-md)]">
        <span className="font-data text-h3 font-semibold" style={{ color: "var(--accent)" }}>
          ~{totalPoints.toLocaleString()} pts
        </span>
        <span className="text-[var(--text-secondary)]">&middot;</span>
        <span className="font-data text-[var(--text-body)] text-[var(--text-primary)]">
          ~${totalValueConservative.toLocaleString()} value
        </span>
        <span className="ml-auto text-[var(--text-caption)] text-[var(--text-secondary)]">
          Current Year
        </span>
      </div>

      {/* Category rows */}
      <div className="space-y-3">
        {categories.map((cat) => {
          const label =
            EARN_CATEGORY_LABELS[cat.category as EarnCategory] ??
            cat.category;
          const barWidth = Math.max(
            4,
            Math.round((cat.points / maxPoints) * 100)
          );

          return (
            <div key={cat.category}>
              <div className="flex items-center justify-between text-[var(--text-body)] mb-1">
                <span className="text-[var(--text-primary)]">{label}</span>
                <div className="flex items-center gap-3 font-data text-[var(--text-secondary)]">
                  <span>${Math.round(cat.spend).toLocaleString()} spend</span>
                  <span>{Number.isInteger(cat.earnRate) ? cat.earnRate : cat.earnRate.toFixed(1).replace(/\.0$/, "")}x</span>
                  <span className="text-[var(--text-primary)]">
                    {cat.points.toLocaleString()} pts
                  </span>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-[var(--bg-tertiary)]">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor: "var(--accent)",
                    opacity: 0.7 + (cat.points / maxPoints) * 0.3,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <p className="mt-[var(--space-md)] text-[var(--text-caption)] text-[var(--text-secondary)]">
        Points valued at {conservativeCpp}¢ each (conservative). Transfer
        partners may yield more.
      </p>
    </div>
  );
}
