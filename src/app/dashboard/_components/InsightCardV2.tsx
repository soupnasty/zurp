"use client";

import { useState } from "react";
import { Clock, ArrowRightLeft, XCircle, Star, Check, ChevronRight } from "lucide-react";
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

interface InsightCardV2Props {
  insight: SerializedInsight;
  displayGroup: DisplayGroup;
}

export function InsightCardV2({ insight, displayGroup }: InsightCardV2Props) {
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const config = GROUP_CONFIG[displayGroup];
  const Icon = config.icon;

  async function handleDismiss(e: React.MouseEvent) {
    e.stopPropagation();
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

  const hasDollar = Number(dollarAmount) > 0;

  return (
    <div
      className="relative rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden transition-colors hover:bg-[var(--bg-card-hover)] cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      {/* Left edge bar */}
      <div
        className="absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-full"
        style={{ background: config.color }}
      />

      <div className="pl-4 pr-3 py-2.5 md:pl-5 md:pr-4 md:py-3">
        {/* Compact row: icon + title + dollar + chevron */}
        <div className="flex items-center gap-2.5">
          <div
            className="flex items-center justify-center rounded-lg shrink-0"
            style={{
              width: 26,
              height: 26,
              background: `color-mix(in srgb, ${config.color} 8%, transparent)`,
            }}
          >
            <Icon size={13} strokeWidth={1.75} style={{ color: config.color }} />
          </div>

          <span
            className="flex-1 min-w-0 text-[13px] md:text-[14px] font-semibold text-[var(--text-primary)] truncate"
          >
            {insight.renderedTitle}
          </span>

          {hasDollar && (
            <span
              className="shrink-0 text-[13px] md:text-[15px] font-bold"
              style={{ fontFamily: "var(--font-mono)", color: config.color }}
            >
              ${Math.round(Number(dollarAmount)).toLocaleString()}
            </span>
          )}

          <ChevronRight
            size={16}
            strokeWidth={2}
            className={`shrink-0 text-[var(--text-dim)] transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
          />
        </div>

        {/* Expanded detail */}
        {expanded && (
          <div className="mt-2.5 pt-2.5 border-t border-[var(--border-subtle)]">
            <p className="text-[13px] md:text-[14px] leading-relaxed text-[var(--text-secondary)]">
              {insight.renderedBody}
            </p>

            {hasDollar && (
              <div className="flex items-baseline gap-1.5 mt-2.5">
                <span
                  className="text-[15px] md:text-[18px] font-bold"
                  style={{ fontFamily: "var(--font-mono)", color: config.color }}
                >
                  ${Math.round(Number(dollarAmount)).toLocaleString()}
                </span>
                <span className="text-[11px] text-[var(--text-secondary)]">{savingsLabel}</span>
              </div>
            )}

            <div className="flex items-center justify-end mt-2">
              <button
                onClick={handleDismiss}
                className="flex items-center gap-1 rounded px-2 py-1 text-[11px] text-[var(--text-dim)] transition-colors hover:bg-[rgba(255,255,255,0.04)] hover:text-[var(--text-secondary)]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                <Check size={12} strokeWidth={2} />
                Got it
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
