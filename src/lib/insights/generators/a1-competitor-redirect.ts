import { normalizeMerchantName } from "@/lib/engine/normalize";
import type { InsightCandidate } from "../types";
import type { GeneratorContext } from "./types";

/**
 * A1: Competitor Redirect
 * User spent at a competitor of a benefit partner with unused credit.
 */
export function generateA1(ctx: GeneratorContext): InsightCandidate[] {
  const { transactions, benefitUsages, competitorEntries } = ctx;
  const a1Entries = competitorEntries.filter((e) => e.insightType === "A1");
  if (a1Entries.length === 0) return [];

  // Sort entries so longer (more specific) patterns match first
  // e.g. "uber eats" before "uber" to avoid false matches
  const sortedEntries = [...a1Entries].sort(
    (a, b) => b.plaidMerchantPattern.length - a.plaidMerchantPattern.length
  );

  const STALE_THRESHOLD_MS = 180 * 24 * 60 * 60 * 1000; // 180 days

  // Aggregate spend by benefit partner
  const partnerSpend = new Map<
    string,
    {
      total: number;
      merchantNames: Set<string>;
      benefitKey: string;
      partner: string;
      isStale: boolean;
    }
  >();

  for (const tx of transactions) {
    if (!tx.merchantName) continue;
    if (tx.amount <= 0) continue; // skip refunds
    const normalized = normalizeMerchantName(tx.merchantName);
    if (!normalized) continue;

    for (const entry of sortedEntries) {
      if (!normalized.includes(entry.plaidMerchantPattern.toLowerCase())) continue;

      // Check if the matched benefit has remaining credit
      const usage = benefitUsages.find(
        (u) => u.benefitId === entry.benefitKey
      );
      if (!usage || usage.amountRemaining <= 0) continue;

      const isStale = entry.lastVerifiedAt
        ? Date.now() - entry.lastVerifiedAt.getTime() > STALE_THRESHOLD_MS
        : false;

      const existing = partnerSpend.get(entry.benefitPartner);
      if (existing) {
        existing.total += tx.amount;
        existing.merchantNames.add(tx.merchantName);
        if (isStale) existing.isStale = true;
      } else {
        partnerSpend.set(entry.benefitPartner, {
          total: tx.amount,
          merchantNames: new Set([tx.merchantName]),
          benefitKey: entry.benefitKey,
          partner: entry.benefitPartner,
          isStale,
        });
      }
      break; // first match wins per transaction
    }
  }

  const insights: InsightCandidate[] = [];
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  for (const [partner, data] of partnerSpend) {
    const usage = benefitUsages.find((u) => u.benefitId === data.benefitKey);
    if (!usage) continue;

    const merchantList = [...data.merchantNames].slice(0, 2).join(" and ");
    const amount = Math.round(data.total);
    const remaining = Math.round(usage.amountRemaining);
    const count = data.merchantNames.size;

    const useCountTemplate = count >= 3;
    const templateKey = useCountTemplate ? "a1_with_count" : "a1_standard";

    const templateVars: Record<string, string | number> = useCountTemplate
      ? { count, merchant: merchantList, amount, remaining, benefit: partner }
      : {
          amount,
          merchant: merchantList,
          benefit: `${partner} credit`,
          remaining,
          action: `switch to ${partner} next time`,
        };

    insights.push({
      category: "A1",
      benefitId: data.benefitKey,
      templateKey,
      templateVars,
      dedupKey: `a1:${data.benefitKey}:${monthKey}`,
      triggeredByTransactionId: null,
      periodStart: usage.cycleStart,
      periodEnd: usage.cycleEnd,
      dollarAmount: Math.min(amount, remaining),
      daysRemaining: usage.daysRemaining,
      actionability: "switch_platform",
      confidence: data.isStale ? "stale_data" : "exact_confirmed",
    });
  }

  return insights;
}
