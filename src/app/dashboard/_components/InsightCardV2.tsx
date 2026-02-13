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

  const dollarAmount = insight.templateVars.amount ?? insight.templateVars.dollarAmount ?? 0;

  return (
    <div
      className="relative rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden transition-colors hover:bg-[var(--bg-card-hover)]"
    >
      {/* Left edge bar */}
      <div
        className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full"
        style={{ background: config.color }}
      />

      {/* Top edge glow */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: `linear-gradient(90deg, ${config.color}33, ${config.color}11, transparent 60%)`,
        }}
      />

      <div className="pl-6 pr-4 py-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div
            className="flex items-center justify-center rounded-lg shrink-0"
            style={{
              width: 32,
              height: 32,
              background: `color-mix(in srgb, ${config.color} 8%, transparent)`,
            }}
          >
            <Icon size={16} strokeWidth={1.75} style={{ color: config.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <span
              className="text-[10px] font-bold uppercase tracking-[1.5px]"
              style={{ fontFamily: "var(--font-mono)", color: config.color }}
            >
              {insight.renderedTitle}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-[var(--text-secondary)]">
              {relativeTime(insight.generatedAt)}
            </span>
            <button
              onClick={handleDismiss}
              className="rounded p-1 text-[var(--text-dim)] transition-colors hover:bg-[rgba(255,255,255,0.04)] hover:text-[var(--text-secondary)]"
              title="Dismiss"
            >
              <X size={14} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Body */}
        <p className="text-[15px] leading-relaxed text-[var(--text-secondary)] mb-4">
          {insight.renderedBody}
        </p>

        {/* Bottom row */}
        {Number(dollarAmount) > 0 && (
          <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-3">
            <div className="flex items-baseline gap-2">
              <span
                className="text-[22px] font-bold"
                style={{ fontFamily: "var(--font-mono)", color: config.color }}
              >
                ${Math.round(Number(dollarAmount)).toLocaleString()}
              </span>
              <span className="text-xs text-[var(--text-secondary)]">{config.savingsLabel}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
