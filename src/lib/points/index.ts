import "server-only";
import { getCompareTransactions, getTransactionPeriod } from "./queries";
import { classifyForPoints } from "./categories";
import { getAllEarnConfigs } from "./earn-configs";
import { runSimulation } from "./simulator";
import { getCardProfiles, getCardSummary } from "@/lib/queries";
import type { ComparisonOutput, CategoryAssignment } from "./types";

export type { ComparisonOutput } from "./types";
export { PERK_SECTIONS, CARD_REFERENCE_LINKS } from "./perk-matrix";
export type { PerkSection, CardReferenceLinks } from "./perk-matrix";

/**
 * Main orchestrator: compute a full card comparison for a user.
 * Returns null if insufficient data (< 1 month).
 */
export async function computeComparison(
  userId: string
): Promise<ComparisonOutput | null> {
  // 1. Get transaction period
  const period = await getTransactionPeriod(userId);
  if (!period || period.monthCount < 1) return null;

  // 2. Get all qualifying transactions
  const rawTxns = await getCompareTransactions(userId);
  if (rawTxns.length === 0) return null;

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

  // 7. Run simulation
  const result = runSimulation({
    transactions: classifiedTxns,
    configs,
    usersCardId,
    benefitsCaptured,
    period: { start: period.start, end: period.end },
    monthCount: period.monthCount,
  });

  return result;
}
