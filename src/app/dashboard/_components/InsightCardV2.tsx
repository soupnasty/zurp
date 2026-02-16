"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, ArrowRightLeft, XCircle, Star, X } from "lucide-react";
import type { SerializedInsight } from "./types";

type DisplayGroup = "expiring" | "redirect" | "unused" | "milestone";

const GROUP_CONFIG: Record<
  DisplayGroup,
  {
    color: string;
    icon: typeof Clock;
    savingsLabel: string;
  }
> = {
  expiring: {
    color: "var(--color-accent-amber)",
    icon: Clock,
    savingsLabel: "at risk",
  },
  redirect: {
    color: "var(--color-accent-blue)",
    icon: ArrowRightLeft,
    savingsLabel: "in unused credit",
  },
  unused: {
    color: "var(--color-danger)",
    icon: XCircle,
    savingsLabel: "going to waste",
  },
  milestone: {
    color: "var(--color-success)",
    icon: Star,
    savingsLabel: "net value this year",
  },
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface InsightCardV2Props {
  insight: SerializedInsight;
  displayGroup: DisplayGroup;
}

export function InsightCardV2({ insight, displayGroup }: InsightCardV2Props) {
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);
  const config = GROUP_CONFIG[displayGroup];
  const Icon = config.icon;

  async function handleDismiss() {
    setDismissed(true);
    try {
      await fetch("/api/insights/dismiss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ insightId: insight.id }),
      });
    } catch {
      setDismissed(false);
    }
  }

  if (dismissed) return null;

  // Pick the right dollar figure and label per insight type:
  // - A1/A2 redirects: show the remaining credit (what you could capture), label "unused credit"
  // - B1/B3 unused/underused: show remaining credit, label "going to waste"
  // - B2 nearly maxed: show remaining, label "at risk"
  // - C0/C1/C2 milestones: show the total value, label from group config
  // - P1/P2 points: show extra value, label from group config
  const dollarAmount = (() => {
    const vars = insight.templateVars;
    switch (insight.category) {
      case "A1":
      case "A2":
        return vars.remaining ?? vars.annual ?? 0;
      case "B1":
      case "B2":
      case "B3":
        return vars.remaining ?? vars.annual ?? 0;
      default:
        return vars.amount ?? vars.dollarAmount ?? vars.total ?? 0;
    }
  })();

  const savingsLabel = (() => {
    switch (insight.category) {
      case "A1":
        return "in unused credit";
      case "A2":
        return "per year";
      case "B1":
      case "B3":
        return "going to waste";
      case "B2":
        return "left to capture";
      default:
        return config.savingsLabel;
    }
  })();

  return (
    <div
      className="relative rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden transition-colors hover:bg-[var(--bg-card-hover)]"
    >
      {/* Left edge bar */}
      <div
        className="absolute left-0 top-3 bottom-3 md:top-4 md:bottom-4 w-[3px] rounded-full"
        style={{ background: config.color }}
      />

      {/* Top edge glow */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: `linear-gradient(90deg, ${config.color}33, ${config.color}11, transparent 60%)`,
        }}
      />

      <div className="pl-4 pr-3 py-3 md:pl-6 md:pr-4 md:py-5">
        {/* Header */}
        <div className="flex items-start gap-2 md:gap-3 mb-2 md:mb-3">
          <div
            className="flex items-center justify-center rounded-lg shrink-0"
            style={{
              width: 28,
              height: 28,
              background: `color-mix(in srgb, ${config.color} 8%, transparent)`,
            }}
          >
            <Icon size={14} strokeWidth={1.75} style={{ color: config.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <span
              className="text-[9px] md:text-[10px] font-bold uppercase tracking-[1.5px] line-clamp-2"
              style={{ fontFamily: "var(--font-mono)", color: config.color }}
            >
              {insight.renderedTitle}
            </span>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
            <span className="text-[10px] md:text-[11px] text-[var(--text-secondary)]">
              {relativeTime(insight.generatedAt)}
            </span>
            <button
              onClick={handleDismiss}
              className="rounded p-0.5 md:p-1 text-[var(--text-dim)] transition-colors hover:bg-[rgba(255,255,255,0.04)] hover:text-[var(--text-secondary)]"
              title="Dismiss"
            >
              <X size={14} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Body */}
        <p className="text-[13px] md:text-[15px] leading-relaxed text-[var(--text-secondary)] mb-2.5 md:mb-4">
          {insight.renderedBody}
        </p>

        {/* Bottom row */}
        {Number(dollarAmount) > 0 && (
          <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-2 md:pt-3">
            <div className="flex items-baseline gap-1.5 md:gap-2">
              <span
                className="text-[17px] md:text-[22px] font-bold"
                style={{ fontFamily: "var(--font-mono)", color: config.color }}
              >
                ${Math.round(Number(dollarAmount)).toLocaleString()}
              </span>
              <span className="text-[11px] md:text-xs text-[var(--text-secondary)]">{savingsLabel}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
