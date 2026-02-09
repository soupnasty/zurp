import { db } from "@/db";
import { eq, and, lt, notInArray, sql } from "drizzle-orm";
import * as schema from "@/db/schema";
import { runAllGenerators } from "./generators";
import { scoreCandidate } from "./scoring";
import { renderTemplate } from "./templates";
import {
  getImpressionHistory,
  getExistingInsight,
  getCompetitorMap,
  getRoiMilestonesReached,
  getTotalBenefitsCaptured,
  getActiveInsights,
  getCycleTransactions,
} from "./queries";
import { getBenefitUsageSummaries, getUserCards } from "@/lib/queries";
import { getCardDefinition } from "@/lib/cards";
import { getCurrentCycleBounds } from "@/lib/engine/cycle-utils";
import { insightGroup } from "./types";
import type { ScoredInsight, InsightCandidate } from "./types";
import type { GeneratorContext } from "./generators/types";

/**
 * Generate insights for a user, score them, and persist to DB.
 * Called after transaction sync (manual, webhook, cron).
 */
export async function generateAndPersistInsights(userId: string) {
  const userCards = await getUserCards(userId);
  if (userCards.length === 0) return;

  const activeCard = userCards.find((c) => c.isPrimary) || userCards[0];
  const cardDef = getCardDefinition(activeCard.cardId);
  if (!cardDef) return;

  const now = new Date();

  // Fetch anniversary date for card year scoping
  const userCardRow = await db.query.userCards.findFirst({
    where: and(
      eq(schema.userCards.userId, userId),
      eq(schema.userCards.id, activeCard.id)
    ),
    columns: { anniversaryDate: true },
  });
  const anniversaryDate = userCardRow?.anniversaryDate ?? null;

  // Compute card year bounds (anniversary-based if available, else calendar year)
  const cardYearBounds = getCurrentCycleBounds(
    "annual_anniversary",
    now,
    anniversaryDate
  );

  const benefits = await getBenefitUsageSummaries(userId, activeCard.id);

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
    impressionHistory,
  ] = await Promise.all([
    getCompetitorMap("csr"),
    getRoiMilestonesReached(userId),
    getTotalBenefitsCaptured(
      userId,
      activeCard.cardId,
      cardYearBounds.cycleStart,
      cardYearBounds.cycleEnd
    ),
    getImpressionHistory(userId),
  ]);

  const ctx: GeneratorContext = {
    userId,
    transactions,
    benefitUsages: benefits,
    annualFee: cardDef.annualFee,
    cardType: "csr",
    competitorEntries,
    totalBenefitsCaptured: totalCaptured,
    existingMilestoneKeys: milestoneKeys,
  };

  const candidates = runAllGenerators(ctx);

  // Score and persist each candidate
  for (const candidate of candidates) {
    const history = impressionHistory.get(candidate.dedupKey) ?? null;
    const scores = scoreCandidate(candidate, history);
    const { title, body } = renderTemplate(
      candidate.templateKey,
      candidate.templateVars
    );

    const existing = await getExistingInsight(userId, candidate.dedupKey);

    if (existing) {
      // Update in place: recalculate vars/copy/scores but preserve lifecycle
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
          // state, generatedAt, shownAt preserved
        })
        .where(eq(schema.insights.id, existing.id));
    } else {
      // Insert new insight
      await db.insert(schema.insights).values({
        userId,
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

  // Expire active insights whose conditions are no longer true
  // (i.e. no candidate was generated for them this run)
  const activeDedupKeys = candidates.map((c) => c.dedupKey);

  if (activeDedupKeys.length > 0) {
    await db
      .update(schema.insights)
      .set({ state: "superseded", resolvedAt: new Date() })
      .where(
        and(
          eq(schema.insights.userId, userId),
          sql`${schema.insights.state} IN ('pending', 'shown')`,
          notInArray(schema.insights.dedupKey, activeDedupKeys)
        )
      );
  } else {
    // No candidates at all — expire everything active
    await db
      .update(schema.insights)
      .set({ state: "superseded", resolvedAt: new Date() })
      .where(
        and(
          eq(schema.insights.userId, userId),
          sql`${schema.insights.state} IN ('pending', 'shown')`
        )
      );
  }
}

/**
 * Get ranked insights for display on a page.
 * Applies display rules from the spec.
 */
export async function getInsightsForDisplay(
  userId: string,
  surface: string,
  max = 3
): Promise<ScoredInsight[]> {
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

  // Rule 2: Max 1 insight per benefit
  const seenBenefits = new Set<string>();
  insights = insights.filter((i) => {
    if (!i.benefitId) return true;
    if (seenBenefits.has(i.benefitId)) return false;
    seenBenefits.add(i.benefitId);
    return true;
  });

  // Rule 5: Group A outranks Group B when scores within 10 points
  insights.sort((a, b) => {
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

  // Mark as SHOWN and record impressions server-side
  for (const insight of selected) {
    if (insight.state === "pending") {
      await db
        .update(schema.insights)
        .set({ state: "shown", shownAt: new Date() })
        .where(eq(schema.insights.id, insight.id));
      insight.state = "shown";
      insight.shownAt = new Date();
    }

    await db.insert(schema.insightImpressions).values({
      insightId: insight.id,
      surface,
    });
  }

  return selected.slice(0, max);
}

/**
 * Mark insights as expired where periodEnd < now.
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
        eq(schema.insights.state, "pending")
      )
    );

  await db
    .update(schema.insights)
    .set({ state: "expired", resolvedAt: now })
    .where(
      and(
        eq(schema.insights.userId, userId),
        lt(schema.insights.periodEnd, now),
        eq(schema.insights.state, "shown")
      )
    );
}
