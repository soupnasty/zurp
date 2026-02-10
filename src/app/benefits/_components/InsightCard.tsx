import {
  ArrowRightLeft,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import type { ScoredInsight } from "@/lib/insights/types";
import { insightGroup } from "@/lib/insights/types";

interface InsightCardProps {
  insight: ScoredInsight;
}

export function InsightCard({ insight }: InsightCardProps) {
  const group = insightGroup(insight.category);
  const isC0 = insight.category === "C0";

  const { icon, color, bgClass } = getIconConfig(group, insight.category, isC0);

  return (
    <div
      className={`rounded-[var(--radius-lg)] border border-[var(--border-default)] p-[var(--space-md)] ${bgClass}`}
    >
      <div className="flex gap-[var(--space-sm)]">
        <div className="shrink-0 mt-0.5">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[var(--text-body)] font-medium text-[var(--text-primary)]">
              {insight.renderedTitle}
            </p>
            {insight.dollarImpactScore >= 60 && (
              <span className="shrink-0 font-data text-[var(--text-caption)] text-[var(--accent)]">
                ${insight.templateVars.amount || insight.templateVars.remaining || insight.templateVars.total || insight.templateVars.value || insight.templateVars.annual || ""}
              </span>
            )}
          </div>
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
