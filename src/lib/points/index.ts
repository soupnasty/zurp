import "server-only";
import { readComparison } from "./comparison-reader";
import { getCompareTransactions } from "./queries";
import { classifyForPoints } from "./categories";
import { getAllEarnConfigs } from "./earn-configs";
import { runSimulation } from "./simulator";
import { getCardProfiles, getCardSummary } from "@/lib/queries";
import { getLifestyleSelections } from "@/lib/lifestyle-queries";
import type { ComparisonOutput, CategoryAssignment } from "./types";

export type { ComparisonOutput } from "./types";
export { PERK_SECTIONS, CARD_REFERENCE_LINKS } from "./perk-matrix";
export type { PerkSection, CardReferenceLinks } from "./perk-matrix";

/**
 * Main orchestrator: compute a full card comparison for a user.
 * Tries precomputed DB data first, falls back to on-demand computation.
 * Returns null if insufficient data (< 1 month).
 */
export async function computeComparison(
  userId: string,
  options?: { portalMode?: boolean }
): Promise<ComparisonOutput | null> {
  const portalMode = options?.portalMode ?? false;

  // Try precomputed simulations first (fast path)
  const precomputed = await readComparison(userId, portalMode);
  if (precomputed) return precomputed;

  // Fall back to on-demand computation (first visit before sync)
  return computeComparisonOnDemand(userId, portalMode);
}

/**
 * On-demand fallback: full computation without precomputed data.
 */
async function computeComparisonOnDemand(
  userId: string,
  portalMode: boolean
): Promise<ComparisonOutput | null> {
  // Rolling 365-day cutoff
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setFullYear(cutoff.getFullYear() - 1);
  cutoff.setDate(cutoff.getDate() + 1);
  cutoff.setHours(0, 0, 0, 0);

  // 1. Get qualifying transactions within the 365-day window
  const rawTxns = await getCompareTransactions(userId, { since: cutoff });
  if (rawTxns.length === 0) return null;

  // 2. Derive period from filtered data
  const start = rawTxns[0].date; // sorted ascending by query
  const end = rawTxns[rawTxns.length - 1].date;
  const monthCount = Math.min(
    12,
    Math.max(
      1,
      (end.getFullYear() - start.getFullYear()) * 12 +
        (end.getMonth() - start.getMonth()) +
        1
    )
  );

  // 3. Classify each transaction
  const classifiedTxns = rawTxns.map((tx) => {
    const assignment = classifyForPoints(
      tx.merchantName,
      tx.plaidCategoryPrimary,
      tx.plaidCategoryDetailed
    );
    return {
      id: tx.id,
      date: tx.date,
      datetime: tx.datetime,
      merchantName: tx.merchantName,
      merchantNameRaw: tx.merchantNameRaw,
      amount: tx.amount,
      plaidCategoryPrimary: tx.plaidCategoryPrimary,
      plaidCategoryDetailed: tx.plaidCategoryDetailed,
      assignment,
    };
  });

  // 4. Get all earn configs
  const configs = getAllEarnConfigs();

  // 5. Get user's active card type
  const cardProfiles = await getCardProfiles(userId);
  const activeProfile = cardProfiles.find((cp) => cp.isActive) ?? cardProfiles[0];
  if (!activeProfile) return null;

  const usersCardId = activeProfile.cardType;

  // 6. Get captured benefits for user's card
  const summary = await getCardSummary(userId, activeProfile.id);
  const benefitsCaptured = summary?.creditsUsed ?? null;

  // 7. Get user's lifestyle selections for benefit assumption mode
  const lifestyleKeys = await getLifestyleSelections(userId);

  // 8. Run simulation
  const result = runSimulation({
    transactions: classifiedTxns,
    configs,
    usersCardId,
    benefitsCaptured,
    period: { start, end },
    monthCount,
    portalMode,
    lifestyleKeys,
  });

  return result;
}
