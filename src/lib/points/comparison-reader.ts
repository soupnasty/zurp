import "server-only";
import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import * as schema from "@/db/schema";
import { getCardProfiles, getCardSummary } from "@/lib/queries";
import { getLifestyleSelections } from "@/lib/lifestyle-queries";
import { getEarnConfig } from "./earn-configs";
import { computeBenefitsValue, valuatePoints } from "./valuation";
import { computeLifestyleBenefits } from "./lifestyle-valuation";
import { isEffectivelyTied } from "./tie-band";
import type {
  ComparisonOutput,
  CardSimulation,
  CategoryWinner,
  CategoryEarnSummary,
  HeadlineVerdict,
  EarnCategory,
  BenefitAssumptionMode,
} from "./types";

/**
 * Read precomputed card simulations from DB and assemble a ComparisonOutput.
 * Returns null if no simulations have been computed yet.
 */
export async function readComparison(
  userId: string,
  portalMode: boolean
): Promise<ComparisonOutput | null> {
  // Get user's active card profile
  const cardProfiles = await getCardProfiles(userId);
  const activeProfile = cardProfiles.find((cp) => cp.isActive) ?? cardProfiles[0];
  if (!activeProfile) return null;

  const usersCardId = activeProfile.cardType;

  // Read all simulation rows for this card profile + portal mode
  const rows = await db.query.cardSimulations.findMany({
    where: and(
      eq(schema.cardSimulations.cardProfileId, activeProfile.id),
      eq(schema.cardSimulations.portalMode, portalMode)
    ),
  });

  if (rows.length === 0) return null;

  // Get user's actual captured benefits for their card
  const summary = await getCardSummary(userId, activeProfile.id);
  const benefitsCaptured = summary?.creditsUsed ?? null;

  // Get user's lifestyle selections for benefit assumption mode
  const lifestyleKeys = await getLifestyleSelections(userId);
  const selectedLifestyle = new Set(lifestyleKeys);

  // Build CardSimulation array from DB rows.
  // Recompute all dollar values from current earn config to guard against
  // stale DB data (JSONB update bug) and config changes (updated cpp).
  const simulations: CardSimulation[] = rows.map((row) => {
    const config = getEarnConfig(row.simulatedCardId);
    const isUsersCard = row.simulatedCardId === usersCardId;

    // Recompute category values from stored raw points + current earn config
    // to guard against stale DB data and config changes (updated cpp).
    const categories = recomputeCategoryValues(
      (row.categoryBreakdown as CategoryEarnSummary[]) ?? [],
      config
    );

    // Derive points dollar values from the sum of positive category values.
    // Negative categories (refunds/reversals) are excluded from display,
    // so the leaderboard total should match the visible category breakdown.
    const positiveCatSum = round2(
      categories.reduce((s, c) => s + Math.max(0, c.valueConservative), 0)
    );
    const pointsValueConservative = positiveCatSum || row.pointsValueConservative;

    // Scale realistic/upside from conservative using cpp ratios
    let pointsValueRealistic: number;
    let pointsValueUpside: number;
    if (config && pointsValueConservative > 0) {
      const { conservativeCpp, upsideCpp } = config.valuation;
      const realisticRatio = conservativeCpp > 0
        ? ((conservativeCpp + upsideCpp) / 2) / conservativeCpp
        : 1;
      const upsideRatio = conservativeCpp > 0
        ? upsideCpp / conservativeCpp
        : 1;
      pointsValueRealistic = round2(pointsValueConservative * realisticRatio);
      pointsValueUpside = round2(pointsValueConservative * upsideRatio);
    } else {
      pointsValueRealistic = round2(
        (row.pointsValueConservative + row.pointsValueUpside) / 2
      );
      pointsValueUpside = row.pointsValueUpside;
    }

    const proven = row.benefitsSimulated ?? 0;

    const perBenefit = (row.matchedPerBenefit as Record<string, number>) ?? {};
    const myPicks = computeLifestyleBenefits(row.simulatedCardId, perBenefit, selectedLifestyle);
    const allCredits = computeBenefitsValue(row.simulatedCardId);

    const pointsModes = {
      conservative: pointsValueConservative,
      realistic: pointsValueRealistic,
      upside: pointsValueUpside,
    } as const;

    const benefitModes = {
      proven,
      my_picks: myPicks,
      all_credits: allCredits,
    } as const;

    const netByMode = {} as CardSimulation["netByMode"];
    for (const vMode of ["conservative", "realistic", "upside"] as const) {
      netByMode[vMode] = {} as Record<BenefitAssumptionMode, number>;
      for (const bMode of ["proven", "my_picks", "all_credits"] as const) {
        netByMode[vMode][bMode] = round2(
          pointsModes[vMode] + benefitModes[bMode] - row.annualFee
        );
      }
    }

    // Recompute net values from fresh points
    const netFloor = round2(pointsValueConservative - row.annualFee);
    const netCeiling = round2(pointsValueConservative + row.benefitsValue - row.annualFee);
    const netActual = round2(pointsValueConservative + proven - row.annualFee);

    return {
      cardId: row.simulatedCardId,
      cardName: config?.cardName ?? row.simulatedCardId,
      isUsersCard,
      annualFee: row.annualFee,
      totalPoints: row.totalPoints,
      bonusPoints: row.bonusPoints,
      pointsValueConservative,
      pointsValueRealistic,
      pointsValueUpside,
      benefitsValue: row.benefitsValue,
      benefitsCaptured: isUsersCard ? benefitsCaptured : null,
      benefitsSimulated: row.benefitsSimulated,
      matchedPerBenefit: perBenefit,
      benefitsByMode: benefitModes,
      netFloor,
      netCeiling,
      netActual,
      netByMode,
      rank: 0,
      categories,
    };
  });

  // Rank cards by netActual descending (matches leaderboard sort)
  const ranked = [...simulations].sort((a, b) => b.netActual - a.netActual);
  ranked.forEach((sim, i) => {
    sim.rank = i + 1;
  });

  // Identify user's card and top 2 alternatives for head-to-head
  const usersCard = simulations.find((s) => s.isUsersCard);
  if (!usersCard) return null; // User's card not in simulation set
  const alternatives = ranked.filter((s) => !s.isUsersCard).slice(0, 2);
  const h2hCards = [usersCard, ...alternatives];

  // Build category breakdown with winners
  const categoryBreakdown = buildCategoryBreakdown(h2hCards);

  // Build headline
  const headline = buildHeadline(usersCard, alternatives);

  // Use metadata from first row (all rows share the same period/spend data)
  const firstRow = rows[0];

  // Classification coverage: use the value persisted at simulation time
  // (computed over gross purchase spend, identical to the on-demand path
  // in simulator.ts). Rows written before the column existed fall back to
  // reconstructing from the stored per-category NET spend — close, but
  // refund handling differs, which is why the persisted value wins.
  let classifiedSpendPct = firstRow.classifiedSpendPct;
  if (classifiedSpendPct == null) {
    const firstBreakdown = (firstRow.categoryBreakdown as CategoryEarnSummary[]) ?? [];
    const breakdownSpend = firstBreakdown.reduce(
      (s, c) => s + Math.max(0, c.totalSpend),
      0
    );
    const otherSpend = Math.max(
      0,
      firstBreakdown.find((c) => c.category === "other")?.totalSpend ?? 0
    );
    classifiedSpendPct =
      breakdownSpend > 0
        ? Math.round(((breakdownSpend - otherSpend) / breakdownSpend) * 100)
        : null;
  }
  const lowConfidenceSpendPct = firstRow.lowConfidenceSpendPct ?? null;

  return {
    analysisPeriod: {
      start: firstRow.analysisPeriodStart,
      end: firstRow.analysisPeriodEnd,
    },
    monthCount: Math.min(12, firstRow.monthCount),
    totalTransactions: firstRow.totalTransactions,
    totalSpend: firstRow.totalSpend,
    totalCards: ranked.length,
    portalMode,
    cards: ranked,
    categoryBreakdown,
    headline,
    classifiedSpendPct,
    lowConfidenceSpendPct,
  };
}

function buildCategoryBreakdown(cards: CardSimulation[]): CategoryWinner[] {
  const allCategories = new Set<EarnCategory>();
  for (const card of cards) {
    for (const cat of card.categories) {
      allCategories.add(cat.category);
    }
  }

  const breakdown: CategoryWinner[] = [];

  for (const cat of allCategories) {
    const cardEntries = cards.map((card) => {
      const catData = card.categories.find((c) => c.category === cat);
      return {
        cardId: card.cardId,
        cardName: card.cardName,
        earnRate: catData?.earnRate ?? 0,
        points: catData?.points ?? 0,
        value: catData?.valueConservative ?? 0,
        isWinner: false,
        marginOverSecond: null as number | null,
        capNote: catData?.capNote ?? null,
      };
    });

    const sorted = [...cardEntries].sort((a, b) => b.value - a.value);
    if (sorted.length > 0 && sorted[0].value > 0) {
      const winner = cardEntries.find((c) => c.cardId === sorted[0].cardId)!;
      winner.isWinner = true;
      winner.marginOverSecond =
        sorted.length > 1
          ? round2(sorted[0].value - sorted[1].value)
          : sorted[0].value;
    }

    const firstCatData = cards[0]?.categories.find((c) => c.category === cat);
    const totalSpend = firstCatData?.totalSpend ?? 0;
    const txCount = firstCatData?.transactionCount ?? 0;

    breakdown.push({
      category: cat,
      label: firstCatData?.label ?? cat,
      icon: firstCatData?.icon ?? "circle",
      totalSpend,
      transactionCount: txCount,
      cards: cardEntries,
    });
  }

  breakdown.sort((a, b) => b.totalSpend - a.totalSpend);
  return breakdown;
}

function buildHeadline(
  usersCard: CardSimulation,
  alternatives: CardSimulation[]
): HeadlineVerdict {
  const bestAlt = alternatives.length > 0 ? alternatives[0] : usersCard;
  const margin = round2(Math.abs(usersCard.netFloor - bestAlt.netFloor));
  const tied = isEffectivelyTied(usersCard.netFloor, bestAlt.netFloor);

  if (alternatives.length === 0 || usersCard.netFloor >= bestAlt.netFloor) {
    if (tied && alternatives.length > 0) {
      return {
        type: "close",
        usersCardName: usersCard.cardName,
        usersCardNetValue: usersCard.netFloor,
        bestAlternativeName: bestAlt.cardName,
        bestAlternativeNetValue: bestAlt.netFloor,
        margin,
      };
    }
    return {
      type: "win",
      usersCardName: usersCard.cardName,
      usersCardNetValue: usersCard.netFloor,
      bestAlternativeName: bestAlt.cardName,
      bestAlternativeNetValue: bestAlt.netFloor,
      margin,
    };
  }

  if (tied) {
    return {
      type: "close",
      usersCardName: usersCard.cardName,
      usersCardNetValue: usersCard.netFloor,
      bestAlternativeName: bestAlt.cardName,
      bestAlternativeNetValue: bestAlt.netFloor,
      margin,
    };
  }

  return {
    type: "lose",
    usersCardName: usersCard.cardName,
    usersCardNetValue: usersCard.netFloor,
    bestAlternativeName: bestAlt.cardName,
    bestAlternativeNetValue: bestAlt.netFloor,
    margin,
  };
}

/**
 * Recompute category dollar values from stored points and current earn config.
 * Guards against stale JSONB valueConservative data in the DB.
 */
function recomputeCategoryValues(
  categories: CategoryEarnSummary[],
  config: ReturnType<typeof getEarnConfig>
): CategoryEarnSummary[] {
  if (!config) return categories;
  return categories.map((cat) => ({
    ...cat,
    valueConservative: valuatePoints(cat.points, config).conservative,
  }));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
