import "server-only";
import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import * as schema from "@/db/schema";
import { getCardProfiles, getCardSummary } from "@/lib/queries";
import { getEarnConfig } from "./earn-configs";
import type {
  ComparisonOutput,
  CardSimulation,
  CategoryWinner,
  CategoryEarnSummary,
  HeadlineVerdict,
  EarnCategory,
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

  // Build CardSimulation array from DB rows
  const simulations: CardSimulation[] = rows.map((row) => {
    const config = getEarnConfig(row.simulatedCardId);
    const isUsersCard = row.simulatedCardId === usersCardId;

    // For the user's card, override with actual captured benefits
    const actualBenefitsCaptured = isUsersCard ? benefitsCaptured : null;
    const netActual = isUsersCard && benefitsCaptured !== null
      ? round2(row.pointsValueConservative + benefitsCaptured - row.annualFee)
      : row.netActual;

    return {
      cardId: row.simulatedCardId,
      cardName: config?.cardName ?? row.simulatedCardId,
      isUsersCard,
      annualFee: row.annualFee,
      totalPoints: row.totalPoints,
      bonusPoints: row.bonusPoints,
      pointsValueConservative: row.pointsValueConservative,
      pointsValueUpside: row.pointsValueUpside,
      benefitsValue: row.benefitsValue,
      parallelValue: row.parallelValue ?? 0,
      benefitsCaptured: actualBenefitsCaptured,
      benefitsSimulated: isUsersCard ? null : row.benefitsSimulated,
      netFloor: row.netFloor,
      netCeiling: row.netCeiling,
      netActual,
      rank: 0,
      categories: (row.categoryBreakdown as CategoryEarnSummary[]) ?? [],
    };
  });

  // Rank cards by netFloor descending
  const ranked = [...simulations].sort((a, b) => b.netFloor - a.netFloor);
  ranked.forEach((sim, i) => {
    sim.rank = i + 1;
  });

  // Order: user's card first, then top 2 alternatives by netFloor
  const usersCard = simulations.find((s) => s.isUsersCard);
  if (!usersCard) return null; // User's card not in simulation set
  const alternatives = ranked.filter((s) => !s.isUsersCard).slice(0, 2);
  const orderedCards = [usersCard, ...alternatives];

  // Build category breakdown with winners
  const categoryBreakdown = buildCategoryBreakdown(orderedCards);

  // Build headline
  const headline = buildHeadline(usersCard, alternatives);

  // Use metadata from first row (all rows share the same period/spend data)
  const firstRow = rows[0];

  return {
    analysisPeriod: {
      start: firstRow.analysisPeriodStart,
      end: firstRow.analysisPeriodEnd,
    },
    monthCount: firstRow.monthCount,
    totalTransactions: firstRow.totalTransactions,
    totalSpend: firstRow.totalSpend,
    totalCards: ranked.length,
    portalMode,
    cards: orderedCards,
    categoryBreakdown,
    headline,
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

  if (alternatives.length === 0 || usersCard.netFloor >= bestAlt.netFloor) {
    if (margin < 50 && alternatives.length > 0) {
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

  if (margin < 50) {
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

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
