import { normalizeMerchantName } from "@/lib/engine/normalize";
import type { InsightCandidate } from "../types";
import type { GeneratorContext } from "./types";
import { getCardDefinition } from "@/lib/cards";

/**
 * A2: Subscription Swap
 * Detect recurring charges at subscription competitors.
 * Recurring heuristic: same merchant 3+ times, amounts within 20%, intervals 25-35 days.
 *
 * Two template paths:
 * - "subscription" benefit type → a2_free (free alternative, e.g. Apple Music via CSR)
 * - "credit" benefit type → a2_swap (credit-pool swap suggestion, e.g. streaming credit via Platinum)
 */
export function generateA2(ctx: GeneratorContext): InsightCandidate[] {
  const { transactions, competitorEntries, cardType } = ctx;
  const a2Entries = competitorEntries.filter((e) => e.insightType === "A2");
  if (a2Entries.length === 0) return [];

  // Group transactions by normalized merchant
  const merchantTxs = new Map<
    string,
    { amounts: number[]; dates: Date[]; raw: string }
  >();

  for (const tx of transactions) {
    if (!tx.merchantName) continue;
    const normalized = normalizeMerchantName(tx.merchantName);
    if (!normalized) continue;

    const existing = merchantTxs.get(normalized);
    if (existing) {
      existing.amounts.push(tx.amount);
      existing.dates.push(new Date(tx.date));
    } else {
      merchantTxs.set(normalized, {
        amounts: [tx.amount],
        dates: [new Date(tx.date)],
        raw: tx.merchantName,
      });
    }
  }

  // Look up card definition for benefit type resolution
  const cardDef = getCardDefinition(cardType);

  const insights: InsightCandidate[] = [];
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  for (const [normalized, data] of merchantTxs) {
    // Check if this merchant matches any A2 competitor
    const matchedEntry = a2Entries.find((e) =>
      normalized.includes(e.plaidMerchantPattern.toLowerCase())
    );
    if (!matchedEntry) continue;

    // Check recurring heuristic
    if (!isRecurring(data.amounts, data.dates)) continue;

    const monthlyAmount = Math.round(
      data.amounts.reduce((s, a) => s + a, 0) / data.amounts.length
    );
    const annualAmount = monthlyAmount * 12;

    // Determine template based on benefit type
    const benefitDef = cardDef?.benefits.find((b) => b.id === matchedEntry.benefitKey);
    const isPoolCredit = benefitDef?.type === "credit";

    if (isPoolCredit) {
      // Pool-based credit (e.g. plat_digital_entertainment) → swap suggestion with lower confidence
      insights.push({
        category: "A2",
        benefitId: matchedEntry.benefitKey,
        templateKey: "a2_swap",
        templateVars: {
          amount: monthlyAmount,
          service: matchedEntry.competitorMerchant,
          partner: matchedEntry.benefitPartner,
          credit_name: benefitDef.name,
          credit: benefitDef.creditAmount,
          annual: annualAmount,
        },
        dedupKey: `a2:${normalized}:${monthKey}`,
        triggeredByTransactionId: null,
        periodStart: null,
        periodEnd: null,
        dollarAmount: annualAmount,
        daysRemaining: null,
        actionability: "plan_future",
        confidence: "category_match",
      });
    } else {
      // Direct subscription (e.g. csr_apple_music) → free alternative
      insights.push({
        category: "A2",
        benefitId: matchedEntry.benefitKey,
        templateKey: "a2_free",
        templateVars: {
          amount: monthlyAmount,
          service: matchedEntry.competitorMerchant,
          partner: matchedEntry.benefitPartner,
          annual: annualAmount,
        },
        dedupKey: `a2:${normalized}:${monthKey}`,
        triggeredByTransactionId: null,
        periodStart: null,
        periodEnd: null,
        dollarAmount: annualAmount,
        daysRemaining: null,
        actionability: "change_recurring",
        confidence: "exact_confirmed",
      });
    }
  }

  return insights;
}

/**
 * Recurring heuristic: 3+ charges, amounts within 20%, intervals 25-35 days.
 */
function isRecurring(amounts: number[], dates: Date[]): boolean {
  if (amounts.length < 3) return false;

  // Check amounts within 20% of each other
  const avgAmount = amounts.reduce((s, a) => s + a, 0) / amounts.length;
  const allWithinRange = amounts.every(
    (a) => Math.abs(a - avgAmount) / avgAmount <= 0.2
  );
  if (!allWithinRange) return false;

  // Check intervals between 25-35 days
  const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime());
  let validIntervals = 0;
  for (let i = 1; i < sorted.length; i++) {
    const diff =
      (sorted[i].getTime() - sorted[i - 1].getTime()) / (1000 * 60 * 60 * 24);
    if (diff >= 25 && diff <= 35) validIntervals++;
  }

  // At least half the intervals should be in range
  return validIntervals >= Math.floor((sorted.length - 1) / 2);
}
