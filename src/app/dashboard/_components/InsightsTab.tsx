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
  activeCardFee: number;
  anniversaryDate: string | null;
}

export function InsightsTab({ insights, activeCardName, activeCardFee, anniversaryDate }: InsightsTabProps) {
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

  // Extract the actionable dollar value per insight (not competitor spend)
  function getInsightValue(i: SerializedInsight): number {
    const vars = i.templateVars;
    switch (i.category) {
      case "A1":
      case "A2":
        return Number(vars.remaining ?? vars.annual ?? 0);
      case "B1":
      case "B2":
      case "B3":
        return Number(vars.remaining ?? vars.annual ?? 0);
      default:
        return Number(vars.amount ?? vars.dollarAmount ?? vars.total ?? 0);
    }
  }

  // Compute summary values
  const totalActive = insights.length;
  const potentialSavings = insights.reduce((sum, i) => sum + getInsightValue(i), 0);
  const expiringInsights = grouped.expiring;
  const expiringAmount = expiringInsights.reduce((sum, i) => sum + getInsightValue(i), 0);

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

  const cardHeader = (
    <div className="mb-5">
      <span
        className="text-[10px] font-bold uppercase tracking-[2.5px] text-[var(--text-secondary)]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Your card
      </span>
      <h1 className="mt-1 text-xl md:text-2xl font-bold text-[var(--text-primary)]">
        {activeCardName}
      </h1>
      <span
        className="text-[12px] text-[var(--text-dim)]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {(() => {
          if (!anniversaryDate) return activeCardFee > 0 ? `$${activeCardFee}/yr fee` : "$0 annual fee";
          const anniv = new Date(anniversaryDate);
          const now = new Date();
          const annivMonth = anniv.getMonth();
          const annivDay = anniv.getDate();
          let yearStart = new Date(now.getFullYear(), annivMonth, annivDay);
          if (yearStart > now) {
            yearStart = new Date(now.getFullYear() - 1, annivMonth, annivDay);
          }
          const yearEnd = new Date(yearStart.getFullYear() + 1, annivMonth, annivDay - 1);
          const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
          return `${fmt(yearStart)} – ${fmt(yearEnd)}`;
        })()}
      </span>
    </div>
  );

  if (insights.length === 0) {
    return (
      <div>
        {cardHeader}
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
      {cardHeader}
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
