"use client";

import { SummaryStrip } from "./SummaryStrip";
import { InsightGroupSection } from "./InsightGroup";
import type { SerializedInsight } from "./types";
import type { InsightCategory } from "@/lib/insights/types";

type DisplayGroup = "expiring" | "redirect" | "unused" | "milestone";

function mapToDisplayGroup(category: InsightCategory): DisplayGroup {
  switch (category) {
    case "B2":
      return "expiring";
    case "A1":
    case "A2":
    case "P2":
      return "redirect";
    case "B1":
    case "B3":
      return "unused";
    case "C0":
    case "C1":
    case "C2":
    case "P1":
      return "milestone";
    default:
      return "milestone";
  }
}

const GROUP_ORDER: DisplayGroup[] = ["expiring", "redirect", "unused", "milestone"];

interface InsightsTabProps {
  insights: SerializedInsight[];
  activeCardName: string;
}

export function InsightsTab({ insights, activeCardName }: InsightsTabProps) {
  // Group insights by display group
  const grouped: Record<DisplayGroup, SerializedInsight[]> = {
    expiring: [],
    redirect: [],
    unused: [],
    milestone: [],
  };

  for (const insight of insights) {
    const group = mapToDisplayGroup(insight.category);
    grouped[group].push(insight);
  }

  // Compute summary values
  const totalActive = insights.length;
  const potentialSavings = insights.reduce((sum, i) => {
    const amt = Number(i.templateVars.amount ?? i.templateVars.dollarAmount ?? 0);
    return sum + amt;
  }, 0);
  const expiringInsights = grouped.expiring;
  const expiringAmount = expiringInsights.reduce((sum, i) => {
    const amt = Number(i.templateVars.amount ?? i.templateVars.dollarAmount ?? 0);
    return sum + amt;
  }, 0);

  const summaryItems = [
    {
      label: "Active insights",
      value: String(totalActive),
      valueColor: "var(--color-accent-cyan)",
    },
    {
      label: "Potential savings",
      value: potentialSavings > 0 ? `$${Math.round(potentialSavings).toLocaleString()}/yr` : "$0",
      valueColor: "var(--color-success)",
    },
    {
      label: "Expiring soon",
      value: expiringAmount > 0 ? `$${Math.round(expiringAmount).toLocaleString()}` : "--",
      valueColor: expiringAmount > 0 ? "var(--color-accent-amber)" : "var(--text-secondary)",
      sub: expiringInsights.length > 0 ? `${expiringInsights.length} benefit${expiringInsights.length > 1 ? "s" : ""}` : undefined,
    },
  ];

  if (insights.length === 0) {
    return (
      <div>
        <SummaryStrip items={summaryItems} />
        <div className="mt-12 flex flex-col items-center justify-center">
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-8 py-10 text-center max-w-md">
            <p className="text-[var(--text-secondary)] text-sm">
              No insights yet. Keep using your card and we'll surface opportunities.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SummaryStrip items={summaryItems} />

      <div className="mt-8">
        {GROUP_ORDER.map((group) => (
          <InsightGroupSection
            key={group}
            group={group}
            insights={grouped[group]}
          />
        ))}
      </div>
    </div>
  );
}
