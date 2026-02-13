import "server-only";
import { db } from "@/db";
import { eq, and, sql, desc, gte, lte, lt } from "drizzle-orm";
import * as schema from "@/db/schema";
import { classifyTransaction } from "@/lib/spending/categories";
import type { InsightImpressionHistory } from "./types";
import type { CompetitorMapEntry } from "./generators/types";
import type { CategorizedTransaction } from "@/lib/spending/types";

/** Get impression history for all insights belonging to a user. */
export async function getImpressionHistory(
  userId: string
): Promise<Map<string, InsightImpressionHistory>> {
  const insights = await db.query.insights.findMany({
    where: eq(schema.insights.userId, userId),
    with: { impressions: true },
  });

  const map = new Map<string, InsightImpressionHistory>();
  for (const insight of insights) {
    const impressions = insight.impressions || [];
    const showCount = impressions.length;
    const sorted = impressions
      .map((i) => i.shownAt)
      .sort((a, b) => a.getTime() - b.getTime());

    map.set(insight.dedupKey, {
      insightId: insight.id,
      showCount,
      firstShownAt: sorted[0] ?? null,
      lastShownAt: sorted[sorted.length - 1] ?? null,
    });
  }

  return map;
}

/** Get an existing insight by dedup key. */
export async function getExistingInsight(userId: string, dedupKey: string) {
  return db.query.insights.findFirst({
    where: and(
      eq(schema.insights.userId, userId),
      eq(schema.insights.dedupKey, dedupKey)
    ),
  });
}

/** Get all existing ROI milestone dedup keys for a user (optionally scoped to a card). */
export async function getRoiMilestonesReached(
  userId: string,
  cardId?: string
): Promise<string[]> {
  const pattern = cardId ? `c2:${cardId}:%` : "c2:%";
  const milestones = await db.query.insights.findMany({
    where: and(
      eq(schema.insights.userId, userId),
      sql`${schema.insights.dedupKey} LIKE ${pattern}`
    ),
    columns: { dedupKey: true },
  });

  return milestones.map((m) => m.dedupKey);
}

/** Get the points earning summary for the insights context. */
export async function getPointsSummaryForInsights(
  userId: string,
  cardProfileId: string
) {
  return db.query.pointsEarningSummary.findFirst({
    where: and(
      eq(schema.pointsEarningSummary.userId, userId),
      eq(schema.pointsEarningSummary.cardProfileId, cardProfileId),
      eq(schema.pointsEarningSummary.periodType, "anniversary_year")
    ),
  });
}

/** Get competitor map entries for a card type. */
export async function getCompetitorMap(
  cardType: string
): Promise<CompetitorMapEntry[]> {
  const entries = await db.query.competitorMap.findMany({
    where: eq(schema.competitorMap.cardType, cardType),
  });

  return entries.map((e) => ({
    benefitKey: e.benefitKey,
    benefitPartner: e.benefitPartner,
    competitorMerchant: e.competitorMerchant,
    plaidMerchantPattern: e.plaidMerchantPattern,
    category: e.category,
    insightType: e.insightType,
  }));
}

/** Get total benefits captured within a card year for a user+cardProfile. */
export async function getTotalBenefitsCaptured(
  userId: string,
  cardProfileId: string,
  cardYearStart: Date,
  cardYearEnd: Date
): Promise<number> {
  const result = await db
    .select({ total: sql<number>`coalesce(sum(${schema.benefitUsage.amountUsed}), 0)` })
    .from(schema.benefitUsage)
    .where(
      and(
        eq(schema.benefitUsage.userId, userId),
        eq(schema.benefitUsage.cardProfileId, cardProfileId),
        gte(schema.benefitUsage.cycleStart, cardYearStart),
        lte(schema.benefitUsage.cycleEnd, cardYearEnd)
      )
    );

  return Number(result[0]?.total ?? 0);
}

/** Lightweight check: does the user have any pending insights? */
export async function hasUnseenInsights(userId: string): Promise<boolean> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.insights)
    .where(
      and(eq(schema.insights.userId, userId), eq(schema.insights.state, "pending"))
    )
    .limit(1);
  return (result[0]?.count ?? 0) > 0;
}

/** Get insights for display, ordered by score. */
export async function getActiveInsights(userId: string) {
  return db.query.insights.findMany({
    where: and(
      eq(schema.insights.userId, userId),
      sql`${schema.insights.state} IN ('pending', 'shown')`
    ),
    orderBy: desc(schema.insights.totalScore),
  });
}

/**
 * Fetch all non-pending transactions within a date range.
 * Used by the insight orchestrator to cover all active benefit cycle periods.
 */
export async function getCycleTransactions(
  userId: string,
  from: Date,
  to: Date
): Promise<CategorizedTransaction[]> {
  const EXCLUDED_PRIMARY = new Set([
    "INCOME",
    "TRANSFER_IN",
    "LOAN_PAYMENTS",
    "BANK_FEES",
  ]);

  const rows = await db
    .select()
    .from(schema.transactions)
    .where(
      and(
        eq(schema.transactions.userId, userId),
        gte(schema.transactions.date, from),
        lt(schema.transactions.date, to),
        eq(schema.transactions.pending, false),
        eq(schema.transactions.isAnnualFee, false)
      )
    );

  return rows
    .filter((tx) => {
      if (tx.amount === 0) return false;
      if (tx.plaidCategoryPrimary && EXCLUDED_PRIMARY.has(tx.plaidCategoryPrimary)) return false;
      return true;
    })
    .map((tx) => ({
      id: tx.id,
      date: tx.date.toISOString(),
      merchantName: tx.merchantName,
      amount: Math.abs(tx.amount),
      category: classifyTransaction(
        tx.plaidCategoryPrimary,
        tx.plaidCategoryDetailed
      ),
      plaidCategoryPrimary: tx.plaidCategoryPrimary,
      plaidCategoryDetailed: tx.plaidCategoryDetailed,
    }));
}
