"use client";

import Link from "next/link";
import { Calendar } from "lucide-react";
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
  ];

  const { cycleLabel, renewalLabel } = (() => {
    if (!anniversaryDate) {
      return {
        cycleLabel: activeCardFee > 0 ? `$${activeCardFee}/yr fee` : "$0 annual fee",
        renewalLabel: null,
      };
    }
    const anniv = new Date(anniversaryDate);
    const now = new Date();
    // UTC getters — anniversary dates are calendar dates stored at UTC midnight
    const annivMonth = anniv.getUTCMonth();
    const annivDay = anniv.getUTCDate();
    let yearStart = new Date(now.getFullYear(), annivMonth, annivDay);
    if (yearStart > now) {
      yearStart = new Date(now.getFullYear() - 1, annivMonth, annivDay);
    }
    const yearEnd = new Date(yearStart.getFullYear() + 1, annivMonth, annivDay - 1);
    const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    let nextRenewal = new Date(now.getFullYear(), annivMonth, annivDay);
    if (nextRenewal <= now) {
      nextRenewal = new Date(now.getFullYear() + 1, annivMonth, annivDay);
    }
    const renewalStr = activeCardFee > 0
      ? `$${activeCardFee} fee renews ${fmt(nextRenewal)}`
      : null;

    return {
      cycleLabel: `${fmt(yearStart)} – ${fmt(yearEnd)}`,
      renewalLabel: renewalStr,
    };
  })();

  const cardHeader = (
    <>
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
          className="text-[10px] md:text-[12px] text-[var(--text-dim)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {cycleLabel}
          {renewalLabel && (
            <>
              <span className="hidden md:inline"> · {renewalLabel}</span>
              <span className="block md:hidden mt-0.5">{renewalLabel}</span>
            </>
          )}
        </span>
      </div>

      {/* Missing anniversary date banner */}
      {!anniversaryDate && (
        <Link
          href="/settings"
          className="mb-5 flex items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:brightness-110"
          style={{
            background: "rgba(251,191,36,0.06)",
            border: "1px solid rgba(251,191,36,0.15)",
          }}
        >
          <Calendar className="h-4 w-4 shrink-0" style={{ color: "#fbbf24" }} />
          <span className="text-sm text-[var(--text-secondary)]">
            Set your card anniversary date for accurate benefit tracking
          </span>
          <span
            className="ml-auto shrink-0 text-xs font-medium"
            style={{ color: "#fbbf24" }}
          >
            Settings →
          </span>
        </Link>
      )}
    </>
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
