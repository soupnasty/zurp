import { Lightbulb, CheckCircle2 } from "lucide-react";
import type { BenefitInsight } from "@/lib/spending/types";

interface InsightCardProps {
  insight: BenefitInsight;
}

export function InsightCard({ insight }: InsightCardProps) {
  const isPositive = insight.type === "positive_reinforcement";

  return (
    <div
      className={`rounded-[var(--radius-lg)] border border-[var(--border-default)] p-[var(--space-md)] ${
        isPositive
          ? "bg-[var(--color-success)]/5"
          : "bg-[var(--accent)]/5"
      }`}
    >
      <div className="flex gap-[var(--space-sm)]">
        <div className="shrink-0 mt-0.5">
          {isPositive ? (
            <CheckCircle2
              size={16}
              className="text-[var(--color-success)]"
            />
          ) : (
            <Lightbulb size={16} className="text-[var(--accent)]" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-[var(--text-body)] font-medium text-[var(--text-primary)]">
            {insight.title}
          </p>
          <p className="mt-0.5 text-[var(--text-caption)] text-[var(--text-secondary)]">
            {insight.body}
          </p>
        </div>
      </div>
    </div>
  );
}
