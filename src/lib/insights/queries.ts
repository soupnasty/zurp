import "server-only";
import { db } from "@/db";
import { eq, and, sql, desc, gte, lte, lt, inArray } from "drizzle-orm";
import * as schema from "@/db/schema";
import { classifyTransaction } from "@/lib/spending/categories";
import { getCardDefinition } from "@/lib/cards";
import { getPreviousCycleBounds } from "@/lib/engine/cycle-utils";
import type { InsightImpressionHistory } from "./types";
import type { CompetitorMapEntry, PriorCycleUsage } from "./generators/types";
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

/** Get all existing ROI milestone and C0 snapshot dedup keys for a user (optionally scoped to a card). */
export async function getRoiMilestonesReached(
  userId: string,
  cardId?: string
): Promise<string[]> {
  const c2Pattern = cardId ? `c2:${cardId}:%` : "c2:%";
  const c0Pattern = cardId ? `c0:${cardId}%` : "c0:%";
  const milestones = await db.query.insights.findMany({
    where: and(
      eq(schema.insights.userId, userId),
      sql`(${schema.insights.dedupKey} LIKE ${c2Pattern} OR ${schema.insights.dedupKey} LIKE ${c0Pattern})`
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
    lastVerifiedAt: e.lastVerifiedAt ?? null,
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

/** Batch-fetch all existing insights for a user, keyed by dedupKey. */
export async function getExistingInsightsByUser(
  userId: string
): Promise<Map<string, Awaited<ReturnType<typeof getExistingInsight>>>> {
  const rows = await db.query.insights.findMany({
    where: eq(schema.insights.userId, userId),
  });
  const map = new Map<string, (typeof rows)[number]>();
  for (const row of rows) {
    map.set(row.dedupKey, row);
  }
  return map;
}

/** Batch mark insights as shown. */
export async function markInsightsShown(insightIds: string[]) {
  if (insightIds.length === 0) return;
  const now = new Date();
  await db
    .update(schema.insights)
    .set({ state: "shown", shownAt: now })
    .where(
      and(
        inArray(schema.insights.id, insightIds),
        eq(schema.insights.state, "pending")
      )
    );
}

/** Batch record impression entries. */
export async function recordImpressions(
  entries: Array<{ insightId: string; surface: string }>
) {
  if (entries.length === 0) return;
  await db.insert(schema.insightImpressions).values(
    entries.map((e) => ({ insightId: e.insightId, surface: e.surface }))
  );
}

/** Delete dismissed insights older than a cutoff (cleanup). */
export async function cleanupDismissedInsights(userId: string, cutoffDays = 90) {
  const cutoff = new Date(Date.now() - cutoffDays * 24 * 60 * 60 * 1000);
  await db
    .delete(schema.insights)
    .where(
      and(
        eq(schema.insights.userId, userId),
        eq(schema.insights.state, "dismissed"),
        lt(schema.insights.generatedAt, cutoff)
      )
    );
}

// ── Dismiss suppression ──

/**
 * Derive a suppression key from a dedup key by stripping the temporal segment.
 * e.g., "a1:doordash_credit:2026-02" → "a1:doordash_credit"
 *       "b1:csr_doordash:2026-m02"  → "b1:csr_doordash"
 *       "c2:csr:100pct"             → "c2:csr:100pct" (no temporal segment)
 */
export function deriveSuppressionKey(dedupKey: string): string {
  // Strip trailing date-like segments: YYYY-MM, YYYY-mMM, YYYY-qN, YYYY
  return dedupKey.replace(/:\d{4}(-m?\d{2}|-q\d)?$/, "");
}

/** Get all suppressed suppression keys for a user. */
export async function getSuppressedKeys(userId: string): Promise<Set<string>> {
  const rows = await db.query.insightDismissals.findMany({
    where: and(
      eq(schema.insightDismissals.userId, userId),
      eq(schema.insightDismissals.suppressed, true)
    ),
    columns: { suppressionKey: true },
  });
  return new Set(rows.map((r) => r.suppressionKey));
}

/** Record a dismissal — increment count, suppress after 3. */
export async function recordDismissal(userId: string, dedupKey: string) {
  const suppressionKey = deriveSuppressionKey(dedupKey);
  const now = new Date();

  // Upsert: increment dismiss count, check threshold
  const existing = await db.query.insightDismissals.findFirst({
    where: and(
      eq(schema.insightDismissals.userId, userId),
      eq(schema.insightDismissals.suppressionKey, suppressionKey)
    ),
  });

  if (existing) {
    const newCount = existing.dismissCount + 1;
    await db
      .update(schema.insightDismissals)
      .set({
        dismissCount: newCount,
        lastDismissedAt: now,
        suppressed: newCount >= 3,
      })
      .where(eq(schema.insightDismissals.id, existing.id));
  } else {
    await db.insert(schema.insightDismissals).values({
      userId,
      suppressionKey,
      dismissCount: 1,
      lastDismissedAt: now,
      suppressed: false,
    });
  }
}

/**
 * Get prior cycle benefit usage for each benefit on a card.
 * Fetches up to `maxCycles` prior cycles for pattern detection (B1/B3 repeat awareness).
 */
export async function getPriorBenefitUsages(
  userId: string,
  cardProfileId: string,
  cardType: string,
  anniversaryDate: Date | null,
  maxCycles = 6
): Promise<PriorCycleUsage[]> {
  const cardDef = getCardDefinition(cardType);
  if (!cardDef) return [];

  // Compute up to maxCycles prior period keys for each benefit
  const now = new Date();
  const allPriorPeriodKeys = new Set<string>();
  // Map: benefitId → [periodKey1, periodKey2, ...] (ordered from most recent)
  const benefitPriorKeysMap = new Map<string, string[]>();

  for (const benefit of cardDef.benefits) {
    if (benefit.type === "subscription") continue;

    const priorKeys: string[] = [];
    let refDate = now;

    for (let i = 0; i < maxCycles; i++) {
      const prior = getPreviousCycleBounds(benefit.cycle, refDate, anniversaryDate);
      priorKeys.push(prior.periodKey);
      allPriorPeriodKeys.add(prior.periodKey);
      // Move reference date to start of prior cycle to get the one before it
      refDate = new Date(prior.cycleStart.getTime() - 1);
    }

    benefitPriorKeysMap.set(benefit.id, priorKeys);
  }

  if (allPriorPeriodKeys.size === 0) return [];

  // Batch-fetch all usage records matching any prior period key
  const usageRecords = await db.query.benefitUsage.findMany({
    where: and(
      eq(schema.benefitUsage.userId, userId),
      eq(schema.benefitUsage.cardProfileId, cardProfileId),
      inArray(schema.benefitUsage.periodKey, Array.from(allPriorPeriodKeys))
    ),
  });

  // Filter to only records matching valid prior periods for each benefit
  const results: PriorCycleUsage[] = [];
  for (const record of usageRecords) {
    const expectedKeys = benefitPriorKeysMap.get(record.benefitId);
    if (!expectedKeys?.includes(record.periodKey)) continue;

    const benefitDef = cardDef.benefits.find((b) => b.id === record.benefitId);
    if (!benefitDef) continue;

    results.push({
      benefitId: record.benefitId,
      periodKey: record.periodKey,
      cycle: benefitDef.cycle,
      creditAmount: benefitDef.creditAmount,
      amountUsed: record.amountUsed,
      isFullyUsed: record.isFullyUsed,
      cycleStart: record.cycleStart,
      cycleEnd: record.cycleEnd,
    });
  }

  return results;
}
