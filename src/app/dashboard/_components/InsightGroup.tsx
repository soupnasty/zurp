"use client";

import { InsightCardV2 } from "./InsightCardV2";
import type { SerializedInsight } from "./types";

type DisplayGroup = "expiring" | "redirect" | "unused" | "milestone";

const GROUP_LABELS: Record<DisplayGroup, { title: string; color: string }> = {
  expiring: {
    title: "Expiring soon",
    color: "var(--color-accent-amber)",
  },
  redirect: {
    title: "Redirect spending",
    color: "var(--color-accent-blue)",
  },
  unused: {
    title: "Unused benefits",
    color: "var(--color-danger)",
  },
  milestone: {
    title: "Milestones",
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
    <div className="mt-6 first:mt-0">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-2.5">
        <span
          className="text-[10px] font-bold uppercase tracking-[2px]"
          style={{ fontFamily: "var(--font-mono)", color: config.color }}
        >
          {config.title}
        </span>
        <span
          className="rounded-full px-1.5 py-px text-[9px] font-bold"
          style={{
            fontFamily: "var(--font-mono)",
            color: config.color,
            background: `color-mix(in srgb, ${config.color} 10%, transparent)`,
          }}
        >
          {insights.length}
        </span>
      </div>

      {/* Insight cards */}
      <div className="space-y-2">
        {insights.map((insight) => (
          <InsightCardV2 key={insight.id} insight={insight} displayGroup={group} />
        ))}
      </div>
    </div>
  );
}
