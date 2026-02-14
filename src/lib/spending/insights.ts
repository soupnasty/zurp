import type { BenefitUsageSummary } from "@/lib/types";
import type { CategorizedTransaction, BenefitInsight } from "./types";
import { runAllGenerators } from "@/lib/insights/generators";
import { scoreCandidate } from "@/lib/insights/scoring";
import { renderTemplate } from "@/lib/insights/templates";
import type { GeneratorContext } from "@/lib/insights/generators/types";

/**
 * Generate prioritized benefit-aware insights from spending data.
 * Backward-compat bridge: calls v2 generators internally,
 * converts back to BenefitInsight[] for existing UI.
 */
export function generateInsights(
  transactions: CategorizedTransaction[],
  benefitUsages: BenefitUsageSummary[],
  max = 2
): BenefitInsight[] {
  const ctx: GeneratorContext = {
    userId: "",
    transactions,
    benefitUsages,
    annualFee: 795,
    cardType: "csr",
    competitorEntries: [],
    totalBenefitsCaptured: 0,
    existingMilestoneKeys: [],
    priorCycleBenefitUsages: [],
  };

  const candidates = runAllGenerators(ctx);

  // Score and sort candidates
  const scored = candidates.map((c) => {
    const scores = scoreCandidate(c, null);
    const rendered = renderTemplate(c.templateKey, c.templateVars);
    return { candidate: c, scores, rendered };
  });

  scored.sort((a, b) => b.scores.totalScore - a.scores.totalScore);

  // Convert to legacy BenefitInsight format
  const CATEGORY_TO_TYPE: Record<string, BenefitInsight["type"]> = {
    A1: "missed_platform",
    A2: "missed_platform",
    B1: "unused_credit",
    B2: "underused_credit",
    B3: "underused_credit",
    C0: "positive_reinforcement",
    C1: "positive_reinforcement",
    C2: "positive_reinforcement",
  };

  return scored.slice(0, max).map(({ candidate, scores, rendered }) => ({
    type: CATEGORY_TO_TYPE[candidate.category] || "unused_credit",
    title: rendered.title,
    body: rendered.body,
    dollarImpact: candidate.dollarAmount,
    timeUrgency: candidate.daysRemaining ?? 999,
    actionability: candidate.category.startsWith("C") ? 3 : 1,
  }));
}
