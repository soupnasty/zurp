import type { MatcherTransaction, BenefitDefinition } from "@/lib/types";
import { getCardDefinition } from "@/lib/cards";
import { runMatcher } from "./matcher";

/**
 * Simulate benefit matching for a card against a set of transactions.
 * Forces all benefits to autoMatchable=true so activation-gated benefits
 * (Resy credits, hotel credits, etc.) are included in the simulation.
 *
 * Category C benefits (no patterns, e.g. VX Travel $300) correctly get $0
 * from the matcher since there's nothing to match on. Their value is captured
 * in the catalog ceiling (benefitsValue).
 */
export function simulateBenefitsForCard(
  cardId: string,
  transactions: MatcherTransaction[],
  anniversaryDate: Date | null
): { total: number; perBenefit: Map<string, number> } {
  const cardDef = getCardDefinition(cardId);
  if (!cardDef || cardDef.benefits.length === 0) {
    return { total: 0, perBenefit: new Map() };
  }

  // Clone benefits with autoMatchable forced to true
  const simulationBenefits: BenefitDefinition[] = cardDef.benefits.map((b) => ({
    ...b,
    autoMatchable: true,
  }));

  // Filter to positive, non-pending transactions (fresh simulation)
  const matcherTxns: MatcherTransaction[] = transactions
    .filter((tx) => tx.amount > 0 && !tx.pending)
    .map((tx) => ({
      ...tx,
      matchedStatus: "unmatched" as const,
    }));

  // Run matcher with empty usage (fresh simulation)
  const result = runMatcher(matcherTxns, {
    benefits: simulationBenefits,
    usageMap: new Map(),
    anniversaryDate,
  });

  // Aggregate per-benefit totals
  const perBenefit = new Map<string, number>();
  let total = 0;

  for (const match of result.matches) {
    const prev = perBenefit.get(match.benefitId) ?? 0;
    perBenefit.set(match.benefitId, prev + match.creditApplied);
    total += match.creditApplied;
  }

  return {
    total: Math.round(total * 100) / 100,
    perBenefit,
  };
}
