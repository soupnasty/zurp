import { db } from "@/db";
import { eq, and, lt, notInArray, sql } from "drizzle-orm";
import * as schema from "@/db/schema";
import { runAllGenerators } from "./generators";
import { scoreCandidate } from "./scoring";
import { renderTemplate } from "./templates";
import {
  getImpressionHistory,
  getExistingInsightsByUser,
  getCompetitorMap,
  getRoiMilestonesReached,
  getTotalBenefitsCaptured,
  getActiveInsights,
  getCycleTransactions,
  getPointsSummaryForInsights,
  getPriorBenefitUsages,
  markInsightsShown,
  recordImpressions,
  cleanupDismissedInsights,
  getSuppressedKeys,
  deriveSuppressionKey,
} from "./queries";
import { getBenefitUsageSummaries, getCardProfiles } from "@/lib/queries";
import { getCardDefinition } from "@/lib/cards";
import { getEarnConfig } from "@/lib/points/earn-configs";
import { getCurrentCycleBounds } from "@/lib/engine/cycle-utils";
import { insightGroup } from "./types";
import type { ScoredInsight, InsightCandidate } from "./types";
import type { GeneratorContext } from "./generators/types";

/**
 * Generate insights for a user, score them, and persist to DB.
 * Called after transaction sync (manual, webhook, cron).
 * Processes ALL linked cards (not just the active one).
 */
export async function generateAndPersistInsights(userId: string) {
  // Expire stale insights and clean up old dismissed ones first
  await expireStaleInsights(userId);
  await cleanupDismissedInsights(userId);

  const cardProfilesList = await getCardProfiles(userId);
  if (cardProfilesList.length === 0) return;

  // Batch-fetch user-wide data once (shared across all cards)
  const [impressionHistory, existingByKey, suppressedKeys] = await Promise.all([
    getImpressionHistory(userId),
    getExistingInsightsByUser(userId),
    getSuppressedKeys(userId),
  ]);

  // Process each card profile independently
  for (const cardProfile of cardProfilesList) {
    const cardDef = getCardDefinition(cardProfile.cardType);
    if (!cardDef) continue;

    const now = new Date();

    // Fetch anniversary date from card profile
    const cardProfileRow = await db.query.cardProfiles.findFirst({
      where: and(
        eq(schema.cardProfiles.userId, userId),
        eq(schema.cardProfiles.id, cardProfile.id)
      ),
      columns: { anniversaryDate: true },
    });
    const anniversaryDate = cardProfileRow?.anniversaryDate ?? null;

    // Compute card year bounds (anniversary-based if available, else calendar year)
    const cardYearBounds = getCurrentCycleBounds(
      "annual_anniversary",
      now,
      anniversaryDate
    );

    const benefits = await getBenefitUsageSummaries(userId, cardProfile.id);

    // Determine the date range covering all active benefit cycles
    // Use the earliest cycleStart so generators see all relevant transactions
    const earliestCycleStart = benefits.reduce(
      (earliest, b) =>
        b.cycleStart < earliest ? b.cycleStart : earliest,
      now
    );
    const transactions = await getCycleTransactions(
      userId,
      earliestCycleStart,
      now
    );

    const [
      competitorEntries,
      milestoneKeys,
      totalCaptured,
      pointsSummaryRow,
      priorCycleBenefitUsages,
    ] = await Promise.all([
      getCompetitorMap(cardProfile.cardType),
      getRoiMilestonesReached(userId, cardDef.id),
      getTotalBenefitsCaptured(
        userId,
        cardProfile.id,
        cardYearBounds.cycleStart,
        cardYearBounds.cycleEnd
      ),
      getPointsSummaryForInsights(userId, cardProfile.id),
      getPriorBenefitUsages(userId, cardProfile.id, cardProfile.cardType, anniversaryDate),
    ]);

    // Build points data context
    const earnConfig = getEarnConfig(cardProfile.cardType);
    const pointsData = pointsSummaryRow && earnConfig
      ? {
          totalPoints: pointsSummaryRow.totalPoints,
          valueConservative: pointsSummaryRow.valueConservative,
          conservativeCpp: earnConfig.valuation.conservativeCpp,
          cardId: earnConfig.cardId,
          baseRate: earnConfig.baseRate,
          categories: pointsSummaryRow.categoryBreakdown,
        }
      : null;

    const ctx: GeneratorContext = {
      userId,
      transactions,
      benefitUsages: benefits,
      annualFee: cardDef.annualFee,
      cardType: cardProfile.cardType,
      competitorEntries,
      totalBenefitsCaptured: totalCaptured,
      existingMilestoneKeys: milestoneKeys,
      priorCycleBenefitUsages,
      pointsData,
    };

    const candidates = runAllGenerators(ctx);

    // Score and persist each candidate (using batch-fetched existingByKey map)
    for (const candidate of candidates) {
      const existing = existingByKey.get(candidate.dedupKey) ?? null;

      // Skip recently dismissed insights — don't waste a DB write re-scoring them
      if (existing?.state === "dismissed") continue;

      // Skip insights whose pattern has been suppressed (3+ dismissals)
      if (suppressedKeys.has(deriveSuppressionKey(candidate.dedupKey))) continue;

      const history = impressionHistory.get(candidate.dedupKey) ?? null;
      const scores = scoreCandidate(candidate, history);
      const { title, body } = renderTemplate(
        candidate.templateKey,
        candidate.templateVars
      );

      if (existing) {
        // Revive insights that were superseded/expired but are relevant again
        // (e.g. user switched card type away and back)
        const revive =
          existing.state === "superseded" || existing.state === "expired";

        await db
          .update(schema.insights)
          .set({
            templateKey: candidate.templateKey,
            templateVars: candidate.templateVars,
            renderedTitle: title,
            renderedBody: body,
            dollarImpactScore: scores.dollarImpactScore,
            urgencyScore: scores.urgencyScore,
            actionabilityScore: scores.actionabilityScore,
            // noveltyScore preserved from original
            confidenceScore: scores.confidenceScore,
            totalScore: scores.totalScore,
            floorOverride: scores.floorOverride,
            // Revive dead insights back to pending; preserve lifecycle for active ones
            ...(revive
              ? { state: "pending", resolvedAt: null, shownAt: null }
              : {}),
          })
          .where(eq(schema.insights.id, existing.id));
      } else {
        // Insert new insight
        await db.insert(schema.insights).values({
          userId,
          cardProfileId: cardProfile.id,
          category: candidate.category,
          benefitId: candidate.benefitId,
          templateKey: candidate.templateKey,
          templateVars: candidate.templateVars,
          renderedTitle: title,
          renderedBody: body,
          dollarImpactScore: scores.dollarImpactScore,
          urgencyScore: scores.urgencyScore,
          actionabilityScore: scores.actionabilityScore,
          noveltyScore: scores.noveltyScore,
          confidenceScore: scores.confidenceScore,
          totalScore: scores.totalScore,
          floorOverride: scores.floorOverride,
          state: "pending",
          dedupKey: candidate.dedupKey,
          triggeredByTransactionId: candidate.triggeredByTransactionId,
          periodStart: candidate.periodStart,
          periodEnd: candidate.periodEnd,
        });
      }
    }

    // Expire active insights whose conditions are no longer true for THIS card
    // (i.e. no candidate was generated for them this run)
    const activeDedupKeys = candidates.map((c) => c.dedupKey);

    if (activeDedupKeys.length > 0) {
      await db
        .update(schema.insights)
        .set({ state: "superseded", resolvedAt: new Date() })
        .where(
          and(
            eq(schema.insights.userId, userId),
            eq(schema.insights.cardProfileId, cardProfile.id),
            sql`${schema.insights.state} IN ('pending', 'shown')`,
            notInArray(schema.insights.dedupKey, activeDedupKeys)
          )
        );
    } else {
      // No candidates at all for this card — expire everything active for it
      await db
        .update(schema.insights)
        .set({ state: "superseded", resolvedAt: new Date() })
        .where(
          and(
            eq(schema.insights.userId, userId),
            eq(schema.insights.cardProfileId, cardProfile.id),
            sql`${schema.insights.state} IN ('pending', 'shown')`
          )
        );
    }
  }
}

/**
 * Get ranked insights for display on a page.
 * Applies display rules from the spec.
 * Returns primary (top `max`) and expanded (additional insights for "see all").
 */
export async function getInsightsForDisplay(
  userId: string,
  surface: string,
  max = 3,
  expandedMax = 10
): Promise<{ primary: ScoredInsight[]; expanded: ScoredInsight[] }> {
  const rows = await getActiveInsights(userId);

  // Convert to ScoredInsight
  let insights: ScoredInsight[] = rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    category: r.category as ScoredInsight["category"],
    benefitId: r.benefitId,
    templateKey: r.templateKey,
    templateVars: r.templateVars as Record<string, string | number>,
    renderedTitle: r.renderedTitle,
    renderedBody: r.renderedBody,
    dollarImpactScore: r.dollarImpactScore,
    urgencyScore: r.urgencyScore,
    actionabilityScore: r.actionabilityScore,
    noveltyScore: r.noveltyScore,
    confidenceScore: r.confidenceScore,
    totalScore: r.totalScore,
    floorOverride: r.floorOverride,
    state: r.state as ScoredInsight["state"],
    dedupKey: r.dedupKey,
    triggeredByTransactionId: r.triggeredByTransactionId,
    periodStart: r.periodStart,
    periodEnd: r.periodEnd,
    generatedAt: r.generatedAt,
    shownAt: r.shownAt,
    resolvedAt: r.resolvedAt,
  }));

  // Rule 4: Filter out insights below score threshold (unless floor override)
  insights = insights.filter((i) => i.totalScore >= 30 || i.floorOverride);

  // A1/P2 mutual exclusion: if A1 exists for a merchant, filter out P2 for same merchant
  const a1Merchants = new Set(
    insights
      .filter((i) => i.category === "A1")
      .map((i) => String(i.templateVars.merchant ?? "").toLowerCase())
      .filter(Boolean)
  );
  if (a1Merchants.size > 0) {
    insights = insights.filter((i) => {
      if (i.category !== "P2") return true;
      const merchant = String(i.templateVars.merchant ?? "").toLowerCase();
      return !a1Merchants.has(merchant);
    });
  }

  // Rule 2: Max 1 insight per benefit
  const seenBenefits = new Set<string>();
  insights = insights.filter((i) => {
    if (!i.benefitId) return true;
    if (seenBenefits.has(i.benefitId)) return false;
    seenBenefits.add(i.benefitId);
    return true;
  });

  // Rule 5: Group A outranks Group B when scores within 10 points
  // Floor override insights sort above non-override at same group level
  insights.sort((a, b) => {
    // Floor override always wins over non-override
    if (a.floorOverride && !b.floorOverride) return -1;
    if (!a.floorOverride && b.floorOverride) return 1;

    const groupA = insightGroup(a.category);
    const groupB = insightGroup(b.category);
    const scoreDiff = Math.abs(a.totalScore - b.totalScore);

    if (scoreDiff <= 10 && groupA === "A" && groupB === "B") return -1;
    if (scoreDiff <= 10 && groupA === "B" && groupB === "A") return 1;

    return b.totalScore - a.totalScore;
  });

  // Rule 6: C0 in pending state always ranks first
  const c0Index = insights.findIndex(
    (i) => i.category === "C0" && i.state === "pending"
  );
  if (c0Index > 0) {
    const [c0] = insights.splice(c0Index, 1);
    insights.unshift(c0);
  }

  // Rule 3: Include at least 1 Group C if available
  const selected: ScoredInsight[] = [];
  const nonC = insights.filter((i) => insightGroup(i.category) !== "C");
  const groupC = insights.filter((i) => insightGroup(i.category) === "C");

  // Fill with top scoring, but reserve a slot for Group C
  if (groupC.length > 0 && max >= 2) {
    // Take top (max-1) non-C, then 1 C
    for (const insight of nonC) {
      if (selected.length >= max - 1) break;
      selected.push(insight);
    }
    selected.push(groupC[0]);
  } else {
    // No Group C available or max=1, just take top
    for (const insight of insights) {
      if (selected.length >= max) break;
      selected.push(insight);
    }
  }

  // Fill remaining slots
  const selectedIds = new Set(selected.map((s) => s.id));
  for (const insight of insights) {
    if (selected.length >= max) break;
    if (!selectedIds.has(insight.id)) {
      selected.push(insight);
      selectedIds.add(insight.id);
    }
  }

  // Re-apply Rule 6: C0 pending must be first even after Rule 3 reordering
  const c0SelectedIdx = selected.findIndex(
    (i) => i.category === "C0" && i.state === "pending"
  );
  if (c0SelectedIdx > 0) {
    const [c0Item] = selected.splice(c0SelectedIdx, 1);
    selected.unshift(c0Item);
  }

  // Build expanded list from remaining insights (beyond primary selection)
  const primarySet = new Set(selected.map((s) => s.id));
  const expanded: ScoredInsight[] = [];
  for (const insight of insights) {
    if (expanded.length >= expandedMax - max) break;
    if (!primarySet.has(insight.id)) {
      expanded.push(insight);
    }
  }

  const primary = selected.slice(0, max);

  // Batch mark primary pending insights as shown (Issues 15: single UPDATE instead of loop)
  // Expanded insights are NOT marked shown until the user actually expands
  const pendingIds = primary
    .filter((i) => i.state === "pending")
    .map((i) => i.id);
  await markInsightsShown(pendingIds);

  // Update in-memory state for return value
  for (const insight of primary) {
    if (insight.state === "pending") {
      insight.state = "shown";
      insight.shownAt = new Date();
    }
  }

  // Batch record impressions server-side for primary only
  // Note: Issue 13 will move this to client-side Intersection Observer,
  // but for now keep server-side recording as fallback
  await recordImpressions(
    primary.map((i) => ({ insightId: i.id, surface }))
  );

  return { primary, expanded };
}

/**
 * Mark insights as expired where periodEnd < now.
 * Called from generateAndPersistInsights and cron.
 */
export async function expireStaleInsights(userId: string) {
  const now = new Date();

  await db
    .update(schema.insights)
    .set({ state: "expired", resolvedAt: now })
    .where(
      and(
        eq(schema.insights.userId, userId),
        lt(schema.insights.periodEnd, now),
        sql`${schema.insights.state} IN ('pending', 'shown')`
      )
    );
}
