"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import type { CategorySpending } from "@/lib/spending/types";

interface CategoryBreakdownProps {
  categories: CategorySpending[];
}

export function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  if (categories.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-secondary)] p-[var(--space-xl)] text-center">
        <p className="text-[var(--text-secondary)]">
          No spending data for this month.
        </p>
      </div>
    );
  }

  const maxTotal = categories[0].total; // already sorted descending

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-secondary)] overflow-hidden">
      {categories.map((cat, i) => {
        const isExpanded = expandedCategory === cat.category;
        const barWidth = maxTotal > 0 ? (cat.total / maxTotal) * 100 : 0;

        return (
          <div key={cat.category}>
            <button
              onClick={() =>
                setExpandedCategory(isExpanded ? null : cat.category)
              }
              className={`flex w-full items-center gap-[var(--space-sm)] px-[var(--space-md)] py-[var(--space-sm)] text-left transition-colors hover:bg-[var(--bg-tertiary)] ${
                i > 0 ? "border-t border-[var(--border-default)]" : ""
              }`}
            >
              <ChevronRight
                size={14}
                className={`shrink-0 text-[var(--text-secondary)] transition-transform duration-200 ${
                  isExpanded ? "rotate-90" : ""
                }`}
              />

              <span className="w-28 shrink-0 text-[var(--text-body)] font-medium text-[var(--text-primary)]">
                {cat.label}
              </span>

              <div className="flex-1 min-w-0">
                <div className="h-2 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>

              <span className="ml-[var(--space-sm)] shrink-0 font-data text-[var(--text-body)] text-[var(--text-primary)] tabular-nums">
                ${Math.round(cat.total).toLocaleString()}
              </span>
            </button>

            {isExpanded && (
              <div className="border-t border-[var(--border-default)] bg-[var(--bg-primary)]">
                {cat.transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between px-[var(--space-md)] py-[var(--space-xs)] pl-[calc(var(--space-md)+14px+var(--space-sm))] text-[var(--text-caption)]"
                  >
                    <div className="flex items-center gap-[var(--space-md)] min-w-0">
                      <span className="shrink-0 font-data text-[var(--text-secondary)] tabular-nums">
                        {new Date(tx.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className="truncate text-[var(--text-primary)]">
                        {tx.merchantName ?? "Unknown"}
                      </span>
                    </div>
                    <span className="shrink-0 font-data text-[var(--text-primary)] tabular-nums">
                      ${tx.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
