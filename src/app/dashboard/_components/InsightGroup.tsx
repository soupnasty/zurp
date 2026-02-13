"use client";

import { InsightCardV2 } from "./InsightCardV2";
import type { SerializedInsight } from "./types";

type DisplayGroup = "expiring" | "redirect" | "unused" | "milestone";

const GROUP_LABELS: Record<DisplayGroup, { title: string; subtitle: string; color: string }> = {
  expiring: {
    title: "Expiring soon",
    subtitle: "Credits resetting before you can use them",
    color: "var(--color-accent-amber)",
  },
  redirect: {
    title: "Redirect spending",
    subtitle: "Purchases that could earn you more elsewhere",
    color: "var(--color-accent-blue)",
  },
  unused: {
    title: "Unused benefits",
    subtitle: "Credits you're paying for but not using",
    color: "var(--color-danger)",
  },
  milestone: {
    title: "Milestones",
    subtitle: "Wins worth celebrating",
    color: "var(--color-success)",
  },
};

interface InsightGroupProps {
  group: DisplayGroup;
  insights: SerializedInsight[];
}

export function InsightGroupSection({ group, insights }: InsightGroupProps) {
  if (insights.length === 0) return null;

  const config = GROUP_LABELS[group];

  return (
    <div className="mt-8 first:mt-0">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-lg font-bold text-[var(--text-primary)]">
          {config.title}
        </h3>
        <span
          className="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
          style={{
            fontFamily: "var(--font-mono)",
            color: config.color,
            background: `color-mix(in srgb, ${config.color} 10%, transparent)`,
            border: `1px solid color-mix(in srgb, ${config.color} 15%, transparent)`,
          }}
        >
          {insights.length}
        </span>
        <span className="text-[13px] text-[var(--text-secondary)]">{config.subtitle}</span>
      </div>

      {/* Insight cards */}
      <div className="space-y-3">
        {insights.map((insight) => (
          <InsightCardV2 key={insight.id} insight={insight} displayGroup={group} />
        ))}
      </div>
    </div>
  );
}
