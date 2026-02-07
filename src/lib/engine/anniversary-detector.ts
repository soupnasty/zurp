import type { AnniversaryDetectionResult, MatcherTransaction } from "@/lib/types";
import { normalizeMerchantName } from "./normalize";

/**
 * Detect the card anniversary date by scanning for the annual fee charge.
 *
 * Criteria:
 * - Amount within 5% tolerance of the expected annual fee
 * - Merchant name matches the card's fee descriptor
 * - Optionally matches BANK_FEES plaid category
 *
 * If multiple matches found, the most recent one wins.
 */
export function detectAnniversary(
  transactions: MatcherTransaction[],
  annualFee: number,
  feeDescriptor: string
): AnniversaryDetectionResult {
  const tolerance = annualFee * 0.05;
  const minAmount = annualFee - tolerance;
  const maxAmount = annualFee + tolerance;
  const normalizedDescriptor = feeDescriptor.toLowerCase();

  const candidates = transactions
    .filter((tx) => {
      // Amount must be within tolerance of annual fee
      if (tx.amount < minAmount || tx.amount > maxAmount) return false;

      // Merchant name must match fee descriptor
      const normalized = normalizeMerchantName(tx.merchantName || tx.merchantNameRaw);
      if (!normalized.includes(normalizedDescriptor)) return false;

      return true;
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime()); // Most recent first

  if (candidates.length === 0) {
    return {
      detected: false,
      transactionId: null,
      anniversaryDate: null,
      confidence: "low",
    };
  }

  const best = candidates[0];

  // Determine confidence
  const hasCategory =
    best.plaidCategoryPrimary?.includes("BANK_FEES") ||
    best.plaidCategoryDetailed?.includes("BANK_FEES");

  return {
    detected: true,
    transactionId: best.id,
    anniversaryDate: best.date,
    confidence: hasCategory ? "high" : "medium",
  };
}
