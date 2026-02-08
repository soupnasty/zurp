import type { BenefitInsight } from "@/lib/spending/types";
import { InsightCard } from "./InsightCard";

interface InsightsSectionProps {
  insights: BenefitInsight[];
}

export function InsightsSection({ insights }: InsightsSectionProps) {
  if (insights.length === 0) return null;

  return (
    <div className="mt-[var(--space-lg)]">
      <h2 className="label-caps mb-[var(--space-md)]">Insights</h2>
      <div className="grid grid-cols-1 gap-[var(--space-md)] md:grid-cols-2">
        {insights.map((insight, i) => (
          <InsightCard key={i} insight={insight} />
        ))}
      </div>
    </div>
  );
}
