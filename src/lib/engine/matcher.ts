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
import { roundCents } from "./money";

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
 * 7. Flag ambiguous transactions (only non-auto benefits match)
 *
 * Refunds (negative amounts) match the same way and release credit from
 * the benefit's usage in the refund's own period, floored at zero.
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

  // Filter eligible transactions (skip pending and already matched;
  // negatives are refunds and release credit)
  const eligibleTx = transactions.filter(
    (tx) => !tx.pending && tx.matchedStatus === "unmatched" && tx.amount !== 0
  );

  // Sort benefits by priority (ascending)
  const sortedBenefits = [...benefits]
    .filter((b) => b.type === "credit")
    .sort((a, b) => a.priority - b.priority);

  for (const tx of eligibleTx) {
    const normalizedName = normalizeMerchantName(tx.merchantName || tx.merchantNameRaw);
    const isRefund = tx.amount < 0;

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

      // Check if benefit is active in this month.
      // Transaction dates are calendar dates stored at UTC midnight —
      // always read them with UTC getters.
      if (benefit.activeMonths && !benefit.activeMonths.includes(tx.date.getUTCMonth())) {
        continue;
      }

      // Check if benefit has expired (sunset)
      if (benefit.sunsetDate && tx.date > new Date(benefit.sunsetDate)) {
        continue;
      }

      // Per-period usage check: purchases need remaining credit;
      // refunds need existing usage to release.
      const bounds = getCurrentCycleBounds(benefit.cycle, tx.date, anniversaryDate);
      const usageKey = `${benefit.id}:${bounds.periodKey}`;
      const currentUsed = usageMap.get(usageKey) ?? 0;
      const effectiveCredit = getEffectiveCredit(benefit, config);
      if (isRefund ? currentUsed <= 0 : currentUsed >= effectiveCredit) continue;

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

    // Pick best auto-matchable benefit (lowest priority number = highest priority)
    const autoMatches = eligibleBenefits.filter(
      (eb) => eb.benefit.autoMatchable
    );

    if (autoMatches.length === 0) {
      // Only non-auto benefits match. Purchases go to manual review;
      // refunds stay unmatched (there's no credit change to review).
      if (isRefund) {
        unmatchedTransactionIds.push(tx.id);
      } else {
        ambiguousTransactions.push(tx.id);
      }
      continue;
    }

    // Sort by priority (already sorted by benefit order, but re-sort for safety)
    autoMatches.sort((a, b) => a.benefit.priority - b.benefit.priority);

    const bestMatch = autoMatches[0];
    const { benefit, confidence, usageKey } = bestMatch;

    // Compute credit applied (per-period). Purchases consume remaining
    // credit; refunds release usage, floored at zero.
    const currentUsed = usageMap.get(usageKey) ?? 0;
    const effectiveCredit = getEffectiveCredit(benefit, config);
    const creditApplied = isRefund
      ? -roundCents(Math.min(-tx.amount, currentUsed))
      : roundCents(Math.min(tx.amount, effectiveCredit - currentUsed));

    if (creditApplied === 0) {
      unmatchedTransactionIds.push(tx.id);
      continue;
    }

    // Update usage tracking (per-period)
    usageMap.set(usageKey, roundCents(currentUsed + creditApplied));
    usageUpdates.set(
      usageKey,
      roundCents((usageUpdates.get(usageKey) ?? 0) + creditApplied)
    );

    matches.push({
      transactionId: tx.id,
      benefitId: benefit.id,
      creditApplied,
      matchMethod: "auto",
      matchConfidence: confidence,
    });
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
