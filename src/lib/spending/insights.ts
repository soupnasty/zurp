import type { BenefitUsageSummary } from "@/lib/types";
import type { CategorizedTransaction, BenefitInsight } from "./types";
import { findCompetitorMatch } from "./competitors";

/**
 * Generate prioritized benefit-aware insights from spending data.
 * Pure function — no DB dependencies.
 */
export function generateInsights(
  transactions: CategorizedTransaction[],
  benefitUsages: BenefitUsageSummary[],
  max = 2
): BenefitInsight[] {
  const insights: BenefitInsight[] = [];

  insights.push(...detectMissedPlatform(transactions, benefitUsages));
  insights.push(...detectUnderusedCredit(transactions, benefitUsages));
  insights.push(...detectUnusedCredit(benefitUsages));
  insights.push(...detectSpendingWithoutBenefit(transactions, benefitUsages));
  insights.push(...detectPositiveReinforcement(benefitUsages));

  // Prioritize: highest dollar impact, then most urgent, then most actionable
  insights.sort((a, b) => {
    if (b.dollarImpact !== a.dollarImpact) return b.dollarImpact - a.dollarImpact;
    if (a.timeUrgency !== b.timeUrgency) return a.timeUrgency - b.timeUrgency;
    return a.actionability - b.actionability;
  });

  return insights.slice(0, max);
}

/**
 * Competitor spending with unused benefit credit remaining.
 * Aggregates by partner to produce a single insight per competitor.
 */
function detectMissedPlatform(
  transactions: CategorizedTransaction[],
  benefitUsages: BenefitUsageSummary[]
): BenefitInsight[] {
  const partnerSpend = new Map<string, { total: number; merchantNames: Set<string> }>();

  for (const tx of transactions) {
    const match = findCompetitorMatch(tx.merchantName);
    if (!match) continue;

    // Check if the matched benefit has remaining credit
    const hasCredit = match.benefitIds.some((id) => {
      const usage = benefitUsages.find((u) => u.benefitId === id);
      return usage && usage.amountRemaining > 0;
    });

    if (!hasCredit) continue;

    const existing = partnerSpend.get(match.benefitPartner);
    if (existing) {
      existing.total += tx.amount;
      if (tx.merchantName) existing.merchantNames.add(tx.merchantName);
    } else {
      partnerSpend.set(match.benefitPartner, {
        total: tx.amount,
        merchantNames: new Set(tx.merchantName ? [tx.merchantName] : []),
      });
    }
  }

  const insights: BenefitInsight[] = [];
  for (const [partner, data] of partnerSpend) {
    const merchantList = [...data.merchantNames].slice(0, 2).join(" and ");
    const relevantBenefits = benefitUsages.filter((u) =>
      u.type === "credit" && u.amountRemaining > 0
    );
    const daysRemaining = relevantBenefits.length
      ? Math.min(...relevantBenefits.map((u) => u.daysRemaining))
      : 365;

    insights.push({
      type: "missed_platform",
      title: `You spent $${Math.round(data.total)} at ${merchantList}`,
      body: `Your ${partner} credit is unused — consider buying there next time to save.`,
      dollarImpact: data.total,
      timeUrgency: daysRemaining,
      actionability: 1,
    });
  }

  return insights;
}

/**
 * Benefit partially used but user has category spend exceeding it.
 */
function detectUnderusedCredit(
  transactions: CategorizedTransaction[],
  benefitUsages: BenefitUsageSummary[]
): BenefitInsight[] {
  const insights: BenefitInsight[] = [];

  for (const usage of benefitUsages) {
    if (usage.type !== "credit") continue;
    if (usage.amountUsed === 0 || usage.isFullyUsed) continue;

    const remaining = usage.amountRemaining;
    if (remaining <= 0) continue;

    insights.push({
      type: "underused_credit",
      title: `${usage.benefitName} partially used`,
      body: `You've used $${Math.round(usage.amountUsed)} of $${Math.round(usage.creditAmount)}. $${Math.round(remaining)} still available with ${usage.daysRemaining} days left.`,
      dollarImpact: remaining,
      timeUrgency: usage.daysRemaining,
      actionability: 2,
    });
  }

  return insights;
}

/**
 * $0 used, cycle >50% elapsed.
 */
function detectUnusedCredit(
  benefitUsages: BenefitUsageSummary[]
): BenefitInsight[] {
  const insights: BenefitInsight[] = [];

  for (const usage of benefitUsages) {
    if (usage.type !== "credit") continue;
    if (usage.amountUsed > 0) continue;
    if (usage.creditAmount === 0) continue;

    // Calculate cycle progress
    const cycleStart = new Date(usage.cycleStart).getTime();
    const cycleEnd = new Date(usage.cycleEnd).getTime();
    const now = Date.now();
    const totalDuration = cycleEnd - cycleStart;
    const elapsed = now - cycleStart;
    const progress = totalDuration > 0 ? elapsed / totalDuration : 0;

    if (progress < 0.5) continue;

    insights.push({
      type: "unused_credit",
      title: `${usage.benefitName} is untouched`,
      body: `You have $${Math.round(usage.creditAmount)} unused with ${usage.daysRemaining} days left before it resets.`,
      dollarImpact: usage.creditAmount,
      timeUrgency: usage.daysRemaining,
      actionability: 2,
    });
  }

  return insights;
}

/**
 * requiresActivation benefit with $0 used but matching merchant transactions.
 */
function detectSpendingWithoutBenefit(
  transactions: CategorizedTransaction[],
  benefitUsages: BenefitUsageSummary[]
): BenefitInsight[] {
  const insights: BenefitInsight[] = [];

  for (const usage of benefitUsages) {
    if (!usage.requiresActivation) continue;
    if (usage.amountUsed > 0) continue;
    if (usage.type !== "credit") continue;

    // Count matching transactions — simplified check via benefit name
    const benefitName = usage.benefitName.toLowerCase();
    const matchCount = transactions.filter((tx) => {
      if (!tx.merchantName) return false;
      const normalized = tx.merchantName.toLowerCase();
      // Check if merchant matches benefit (e.g., "lyft" in "Lyft Credit")
      return benefitName.split(" ").some(
        (word) => word.length > 3 && normalized.includes(word)
      );
    }).length;

    if (matchCount === 0) continue;

    insights.push({
      type: "spending_without_benefit",
      title: `Activate your ${usage.benefitName}`,
      body: `You have ${matchCount} matching transaction${matchCount > 1 ? "s" : ""} this month. Activate to start saving $${Math.round(usage.creditAmount)}/cycle.`,
      dollarImpact: usage.creditAmount,
      timeUrgency: usage.daysRemaining,
      actionability: 1,
    });
  }

  return insights;
}

/**
 * Positive reinforcement for fully used benefits.
 */
function detectPositiveReinforcement(
  benefitUsages: BenefitUsageSummary[]
): BenefitInsight[] {
  const insights: BenefitInsight[] = [];

  for (const usage of benefitUsages) {
    if (!usage.isFullyUsed) continue;
    if (usage.type !== "credit") continue;

    insights.push({
      type: "positive_reinforcement",
      title: `${usage.benefitName} maxed out`,
      body: `Nice — you've captured the full $${Math.round(usage.creditAmount)} credit this period.`,
      dollarImpact: usage.creditAmount,
      timeUrgency: 999, // low urgency — it's a good thing
      actionability: 3,
    });
  }

  return insights;
}
