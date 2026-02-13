import type {
  BenefitDefinition,
  MatcherConfig,
  MatcherTransaction,
  MatcherOutput,
  MatchResult,
  MatchConfidence,
} from "@/lib/types";
import { normalizeMerchantName, matchesMerchantPattern } from "./normalize";
import { getCurrentCycleBounds } from "./cycle-utils";

/**
 * Core matching engine — pure function, no DB calls.
 *
 * Algorithm:
 * 1. Filter out pending and already-matched transactions
 * 2. Normalize merchant names
 * 3. For each transaction, collect eligible benefits
 * 4. Sort eligible benefits by priority (ascending = higher priority)
 * 5. Assign to highest-priority match
 * 6. Compute credit applied (min of tx amount and remaining benefit)
 * 7. Flag ambiguous transactions (match non-auto benefits)
 */
export function runMatcher(
  transactions: MatcherTransaction[],
  config: MatcherConfig
): MatcherOutput {
  const { benefits, anniversaryDate, referenceDate = new Date() } = config;

  // Clone usage map (already keyed by benefitId:periodKey from orchestrator)
  const usageMap = new Map<string, number>(config.usageMap);

  const matches: MatchResult[] = [];
  const ambiguousTransactions: string[] = [];
  const unmatchedTransactionIds: string[] = [];
  const usageUpdates = new Map<string, number>();

  // Filter eligible transactions (skip pending, already matched, and refunds/negatives)
  const eligibleTx = transactions.filter(
    (tx) => !tx.pending && tx.matchedStatus === "unmatched" && tx.amount > 0
  );

  // Sort benefits by priority (ascending)
  const sortedBenefits = [...benefits]
    .filter((b) => b.type === "credit")
    .sort((a, b) => a.priority - b.priority);

  for (const tx of eligibleTx) {
    const normalizedName = normalizeMerchantName(tx.merchantName || tx.merchantNameRaw);

    // Collect all matching benefits for this transaction
    const eligibleBenefits: Array<{
      benefit: BenefitDefinition;
      confidence: MatchConfidence;
      usageKey: string;
    }> = [];

    for (const benefit of sortedBenefits) {
      // Cycle correctness is enforced by getCurrentCycleBounds below, which
      // computes the period key from tx.date. Month gating uses activeMonths.
      // Temporal validity uses sunsetDate.

      // Check if benefit is active in this month
      if (benefit.activeMonths && !benefit.activeMonths.includes(tx.date.getMonth())) {
        continue;
      }

      // Check if benefit has expired (sunset)
      if (benefit.sunsetDate && tx.date > new Date(benefit.sunsetDate)) {
        continue;
      }

      // Check if benefit has remaining credit (per-period)
      const bounds = getCurrentCycleBounds(benefit.cycle as any, tx.date, anniversaryDate);
      const usageKey = `${benefit.id}:${bounds.periodKey}`;
      const currentUsed = usageMap.get(usageKey) ?? 0;
      const effectiveCredit = getEffectiveCredit(benefit, config);
      if (currentUsed >= effectiveCredit) continue;

      // Check merchant pattern match
      const merchantMatch = matchesMerchantPattern(
        normalizedName,
        benefit.merchantPatterns
      );

      // Check plaid category match.
      // Plaid categories are hierarchical (e.g., TRAVEL → TRAVEL_FLIGHTS).
      // We use .includes() intentionally so "TRAVEL" matches "TRAVEL_FLIGHTS".
      const categoryMatch =
        benefit.plaidCategories.length > 0 &&
        (benefit.plaidCategories.some(
          (cat) =>
            tx.plaidCategoryPrimary?.includes(cat) ||
            tx.plaidCategoryDetailed?.includes(cat)
        ));

      // Determine if this benefit matches
      if (!merchantMatch && !categoryMatch) continue;

      // Determine confidence
      let confidence: MatchConfidence;
      if (merchantMatch && categoryMatch) {
        confidence = "high";
      } else if (merchantMatch) {
        confidence = "medium";
      } else {
        confidence = "low";
      }

      // Category fallback benefits (e.g., broad travel credit) only match by
      // category if no merchant-specific (non-fallback) benefit also matched.
      if (benefit.isCategoryFallback && !merchantMatch && categoryMatch) {
        const hasMerchantMatch = eligibleBenefits.some(
          (eb) => !eb.benefit.isCategoryFallback
        );
        if (hasMerchantMatch) continue;
      }

      eligibleBenefits.push({ benefit, confidence, usageKey });
    }

    if (eligibleBenefits.length === 0) {
      unmatchedTransactionIds.push(tx.id);
      continue;
    }

    // Check for non-auto-matchable benefits
    const nonAutoMatches = eligibleBenefits.filter(
      (eb) => !eb.benefit.autoMatchable
    );
    if (nonAutoMatches.length > 0 && eligibleBenefits.every((eb) => !eb.benefit.autoMatchable)) {
      ambiguousTransactions.push(tx.id);
      continue;
    }

    // Pick best auto-matchable benefit (lowest priority number = highest priority)
    const autoMatches = eligibleBenefits.filter(
      (eb) => eb.benefit.autoMatchable
    );

    if (autoMatches.length === 0) {
      ambiguousTransactions.push(tx.id);
      continue;
    }

    // Sort by priority (already sorted by benefit order, but re-sort for safety)
    autoMatches.sort((a, b) => a.benefit.priority - b.benefit.priority);

    const bestMatch = autoMatches[0];
    const { benefit, confidence, usageKey } = bestMatch;

    // Compute credit applied (per-period)
    const currentUsed = usageMap.get(usageKey) ?? 0;
    const effectiveCredit = getEffectiveCredit(benefit, config);
    const remaining = effectiveCredit - currentUsed;
    const creditApplied = Math.min(tx.amount, remaining);

    // Update usage tracking (per-period)
    usageMap.set(usageKey, currentUsed + creditApplied);
    usageUpdates.set(
      usageKey,
      (usageUpdates.get(usageKey) ?? 0) + creditApplied
    );

    matches.push({
      transactionId: tx.id,
      benefitId: benefit.id,
      creditApplied,
      matchMethod: "auto",
      matchConfidence: confidence,
    });

    // Also flag if non-auto benefits could have matched
    if (nonAutoMatches.length > 0) {
      ambiguousTransactions.push(tx.id);
    }
  }

  return {
    matches,
    usageUpdates,
    ambiguousTransactions,
    unmatchedTransactionIds,
  };
}

/**
 * Get the effective credit amount, including any carryover.
 */
function getEffectiveCredit(
  benefit: BenefitDefinition,
  config: MatcherConfig
): number {
  if (benefit.carriesOver && benefit.maxAccrued) {
    return benefit.maxAccrued;
  }
  return benefit.creditAmount;
}
