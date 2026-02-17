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

    // Check recurring heuristic (two-tier detection)
    const recurringResult = detectRecurring(normalized, data.amounts, data.dates);
    if (!recurringResult.isRecurring) continue;

    // Check staleness of competitor map entry
    const STALE_THRESHOLD_MS = 180 * 24 * 60 * 60 * 1000;
    const isStale = matchedEntry.lastVerifiedAt
      ? Date.now() - matchedEntry.lastVerifiedAt.getTime() > STALE_THRESHOLD_MS
      : false;

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
        daysRemaining: -1, // ongoing cost sentinel — user is paying monthly
        actionability: "plan_future",
        confidence: isStale ? "stale_data" : recurringResult.confidence,
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
        daysRemaining: -1, // ongoing cost sentinel — user is paying monthly
        actionability: "change_recurring",
        confidence: isStale ? "stale_data" : recurringResult.confidence,
      });
    }
  }

  return insights;
}

/** Known subscription services — single-charge detection for common subs. */
const KNOWN_SUBSCRIPTIONS = new Set([
  "netflix", "spotify", "hulu", "disney+", "disney plus", "hbo max", "max",
  "youtube premium", "youtube music", "apple music", "apple tv+", "apple tv",
  "amazon prime", "prime video", "audible", "paramount+", "paramount plus",
  "peacock", "crunchyroll", "espn+", "espn plus", "sling", "fubo",
  "adobe", "dropbox", "icloud", "google one", "microsoft 365",
]);

interface RecurringResult {
  isRecurring: boolean;
  confidence: "exact_confirmed" | "amount_heuristic";
}

/**
 * Two-tier recurring detection:
 *
 * Tier A (exact_confirmed): Strict heuristic — 2+ charges, amounts within 5%,
 * intervals 28-32 days. OR 3+ charges with original relaxed heuristic.
 *
 * Tier B (amount_heuristic): Relaxed — 2+ charges within 50%, intervals 25-95 days,
 * OR 1 charge at a known subscription merchant.
 */
function detectRecurring(
  normalizedMerchant: string,
  amounts: number[],
  dates: Date[]
): RecurringResult {
  // Tier A: High confidence
  if (amounts.length >= 2) {
    const avgAmount = amounts.reduce((s, a) => s + a, 0) / amounts.length;
    const tightAmounts = amounts.every(
      (a) => Math.abs(a - avgAmount) / avgAmount <= 0.05
    );
    const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime());

    if (tightAmounts && amounts.length >= 2) {
      // Check for tight intervals (28-32 days)
      let tightIntervals = 0;
      for (let i = 1; i < sorted.length; i++) {
        const diff = (sorted[i].getTime() - sorted[i - 1].getTime()) / (1000 * 60 * 60 * 24);
        if (diff >= 28 && diff <= 32) tightIntervals++;
      }
      if (tightIntervals >= Math.max(1, Math.floor((sorted.length - 1) / 2))) {
        return { isRecurring: true, confidence: "exact_confirmed" };
      }
    }

    // Original 3+ heuristic (amounts within 20%, intervals 25-35 days)
    if (amounts.length >= 3) {
      const relaxedAmounts = amounts.every(
        (a) => Math.abs(a - avgAmount) / avgAmount <= 0.2
      );
      if (relaxedAmounts) {
        let validIntervals = 0;
        for (let i = 1; i < sorted.length; i++) {
          const diff = (sorted[i].getTime() - sorted[i - 1].getTime()) / (1000 * 60 * 60 * 24);
          if (diff >= 25 && diff <= 35) validIntervals++;
        }
        if (validIntervals >= Math.floor((sorted.length - 1) / 2)) {
          return { isRecurring: true, confidence: "exact_confirmed" };
        }
      }
    }
  }

  // Tier B: Lower confidence — relaxed intervals OR known subscription
  if (amounts.length >= 2) {
    const avgAmount = amounts.reduce((s, a) => s + a, 0) / amounts.length;
    const looseAmounts = amounts.every(
      (a) => Math.abs(a - avgAmount) / avgAmount <= 0.5
    );
    if (looseAmounts) {
      const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime());
      let validIntervals = 0;
      for (let i = 1; i < sorted.length; i++) {
        const diff = (sorted[i].getTime() - sorted[i - 1].getTime()) / (1000 * 60 * 60 * 24);
        if (diff >= 25 && diff <= 95) validIntervals++;
      }
      if (validIntervals >= 1) {
        return { isRecurring: true, confidence: "amount_heuristic" };
      }
    }
  }

  // Single charge at known subscription merchant
  if (amounts.length >= 1) {
    for (const known of KNOWN_SUBSCRIPTIONS) {
      if (normalizedMerchant.includes(known)) {
        return { isRecurring: true, confidence: "amount_heuristic" };
      }
    }
  }

  return { isRecurring: false, confidence: "amount_heuristic" };
}
