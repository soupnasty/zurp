"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRightLeft,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  X,
} from "lucide-react";
import type { ScoredInsight } from "@/lib/insights/types";
import { insightGroup } from "@/lib/insights/types";

interface InsightCardProps {
  insight: ScoredInsight;
}

export function InsightCard({ insight }: InsightCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const group = insightGroup(insight.category);
  const isC0 = insight.category === "C0";

  const { icon, bgClass } = getIconConfig(group, insight.category, isC0);

  async function handleDismiss() {
    startTransition(async () => {
      await fetch("/api/insights/dismiss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ insightId: insight.id }),
      });
      router.refresh();
    });
  }

  return (
    <div
      className={`relative rounded-[var(--radius-lg)] border border-[var(--border-default)] p-[var(--space-md)] transition-opacity ${bgClass} ${isPending ? "opacity-40" : ""}`}
    >
      <button
        onClick={handleDismiss}
        disabled={isPending}
        className="absolute top-2 right-2 rounded-[var(--radius-sm)] p-1 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-elevated)] hover:text-[var(--text-secondary)]"
        aria-label="Dismiss insight"
      >
        <X size={14} />
      </button>

      <div className="flex gap-[var(--space-sm)] pr-5">
        <div className="shrink-0 mt-0.5">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[var(--text-body)] font-medium text-[var(--text-primary)]">
            {insight.renderedTitle}
          </p>
          <p className="mt-0.5 text-[var(--text-caption)] text-[var(--text-secondary)]">
            {insight.renderedBody}
          </p>
        </div>
      </div>
    </div>
  );
}

function getIconConfig(group: string, category: string, isC0: boolean) {
  if (isC0) {
    return {
      icon: <Sparkles size={16} className="text-[var(--color-signal)]" />,
      color: "signal",
      bgClass: "bg-[var(--accent)]/5",
    };
  }

  switch (group) {
    case "A":
      return {
        icon: <ArrowRightLeft size={16} className="text-[var(--color-signal)]" />,
        color: "signal",
        bgClass: "bg-[var(--accent)]/5",
      };
    case "B":
      if (category === "B1") {
        return {
          icon: <AlertTriangle size={16} className="text-[var(--color-warning)]" />,
          color: "warning",
          bgClass: "bg-[var(--color-warning)]/5",
        };
      }
      return {
        icon: <Lightbulb size={16} className="text-[var(--color-signal)]" />,
        color: "signal",
        bgClass: "bg-[var(--accent)]/5",
      };
    case "C":
      return {
        icon: <CheckCircle2 size={16} className="text-[var(--color-success)]" />,
        color: "success",
        bgClass: "bg-[var(--color-success)]/5",
      };
    default:
      return {
        icon: <Lightbulb size={16} className="text-[var(--accent)]" />,
        color: "signal",
        bgClass: "bg-[var(--accent)]/5",
      };
  }
}
