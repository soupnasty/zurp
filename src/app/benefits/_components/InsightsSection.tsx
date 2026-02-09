import type { ScoredInsight } from "@/lib/insights/types";
import { InsightCard } from "./InsightCard";

interface InsightsSectionProps {
  insights: ScoredInsight[];
}

export function InsightsSection({ insights }: InsightsSectionProps) {
  if (insights.length === 0) return null;

  return (
    <div className="mt-[var(--space-lg)]">
      <h2 className="label-caps mb-[var(--space-md)]">Insights</h2>
      <div className="grid grid-cols-1 gap-[var(--space-md)] sm:grid-cols-2 lg:grid-cols-3">
        {insights.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </div>
    </div>
  );
}
