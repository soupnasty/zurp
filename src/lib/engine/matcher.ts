import type {
  BenefitDefinition,
  MatcherConfig,
  MatcherTransaction,
  MatcherOutput,
  MatchResult,
  MatchConfidence,
} from "@/lib/types";
import { normalizeMerchantName, matchesMerchantPattern } from "./normalize";
import { getCurrentCycleBounds, isDateInCycle } from "./cycle-utils";

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

  // Clone usage map to track running totals
  const usageMap = new Map<string, number>();
  for (const [key, val] of config.usageMap) {
    usageMap.set(key, val.amountUsed);
  }

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
    }> = [];

    for (const benefit of sortedBenefits) {
      // Check if cycle is active for this transaction date
      if (
        benefit.cycle !== "subscription" &&
        !isDateInCycle(tx.date, benefit.cycle, tx.date, anniversaryDate)
      ) {
        continue;
      }

      // Check if benefit is active in this month
      if (benefit.activeMonths && !benefit.activeMonths.includes(tx.date.getMonth())) {
        continue;
      }

      // Check if benefit has remaining credit
      const currentUsed = usageMap.get(benefit.id) ?? 0;
      const effectiveCredit = getEffectiveCredit(benefit, config);
      if (currentUsed >= effectiveCredit) continue;

      // Check merchant pattern match
      const merchantMatch = matchesMerchantPattern(
        normalizedName,
        benefit.merchantPatterns
      );

      // Check plaid category match
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

      // For travel credit (negative matching): skip if a more specific benefit matched
      if (benefit.priority >= 30 && !merchantMatch && categoryMatch) {
        // Only match on category if no merchant-specific benefit would match
        const hasSpecificMatch = eligibleBenefits.some(
          (eb) => eb.benefit.priority < 30
        );
        if (hasSpecificMatch) continue;
      }

      eligibleBenefits.push({ benefit, confidence });
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
    const { benefit, confidence } = bestMatch;

    // Compute credit applied
    const currentUsed = usageMap.get(benefit.id) ?? 0;
    const effectiveCredit = getEffectiveCredit(benefit, config);
    const remaining = effectiveCredit - currentUsed;
    const creditApplied = Math.min(tx.amount, remaining);

    // Update usage tracking
    usageMap.set(benefit.id, currentUsed + creditApplied);
    usageUpdates.set(
      benefit.id,
      (usageUpdates.get(benefit.id) ?? 0) + creditApplied
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
