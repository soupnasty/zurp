import type {
  EarnConfig,
  EarnCategory,
  CategoryAssignment,
  CapState,
  CardSimulation,
  CategoryEarnSummary,
  CategoryWinner,
  HeadlineVerdict,
  ComparisonOutput,
} from "./types";
import type { MatcherTransaction } from "@/lib/types";
import { calculatePointsForTransaction } from "./calculator";
import { valuatePoints, computeBenefitsValue } from "./valuation";
import { EARN_CATEGORY_LABELS, EARN_CATEGORY_ICONS } from "./categories";
import { runMatcher } from "@/lib/engine/matcher";
import { getCardDefinition } from "@/lib/cards";

interface SimulationTransaction {
  id: string;
  date: Date;
  datetime: Date | null;
  merchantName: string | null;
  merchantNameRaw: string | null;
  amount: number;
  plaidCategoryPrimary: string | null;
  plaidCategoryDetailed: string | null;
  assignment: CategoryAssignment;
}

interface SimulationInput {
  transactions: SimulationTransaction[];
  configs: EarnConfig[];
  usersCardId: string;
  benefitsCaptured: number | null;
  period: { start: Date; end: Date };
  monthCount: number;
  portalMode?: boolean;
}

const TRAVEL_CATEGORIES: EarnCategory[] = [
  "travel_flights",
  "travel_hotels",
  "travel_other",
];

/**
 * Run a full comparison simulation across all card configs.
 */
export function runSimulation(input: SimulationInput): ComparisonOutput {
  const {
    transactions,
    configs,
    usersCardId,
    benefitsCaptured,
    period,
    monthCount,
    portalMode = false,
  } = input;

  // If portal mode, reclassify travel categories as travel_portal
  const effectiveTxns = portalMode
    ? transactions.map((tx) => {
        if (TRAVEL_CATEGORIES.includes(tx.assignment.category)) {
          return {
            ...tx,
            assignment: {
              ...tx.assignment,
              category: "travel_portal" as EarnCategory,
            },
          };
        }
        return tx;
      })
    : transactions;

  // Sort transactions by date ascending for cap tracking
  const sortedTxns = [...effectiveTxns].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  const totalSpend = sortedTxns.reduce(
    (sum, tx) => sum + Math.abs(tx.amount),
    0
  );

  // Simulate each card
  const simulations: CardSimulation[] = configs.map((config) => {
    return simulateCard(
      config,
      sortedTxns,
      config.cardId === usersCardId,
      config.cardId === usersCardId ? benefitsCaptured : null
    );
  });

  // Simulate benefit matching for non-user cards using the actual matcher
  for (const sim of simulations) {
    if (!sim.isUsersCard) {
      const simulated = simulateBenefitsForCard(sim.cardId, sortedTxns);
      sim.benefitsSimulated = simulated;
      sim.netActual = round2(
        sim.pointsValueConservative + simulated - sim.annualFee
      );
    }
  }

  // Rank cards by netFloor descending (apples-to-apples: points only)
  const ranked = [...simulations].sort((a, b) => b.netFloor - a.netFloor);
  ranked.forEach((sim, i) => {
    sim.rank = i + 1;
  });

  // Order: user's card first, then top 2 alternatives by netFloor
  const usersCard = simulations.find((s) => s.isUsersCard)!;
  const alternatives = ranked
    .filter((s) => !s.isUsersCard)
    .slice(0, 2);

  const orderedCards = [usersCard, ...alternatives];

  // Build category breakdown with winners
  const categoryBreakdown = buildCategoryBreakdown(
    orderedCards,
    sortedTxns
  );

  // Build headline using floor (points-only) for fair comparison
  const headline = buildHeadline(usersCard, alternatives);

  return {
    analysisPeriod: period,
    monthCount,
    totalTransactions: transactions.length,
    totalSpend: Math.round(totalSpend * 100) / 100,
    totalCards: ranked.length,
    portalMode,
    cards: orderedCards,
    categoryBreakdown,
    headline,
  };
}

function simulateCard(
  config: EarnConfig,
  transactions: SimulationTransaction[],
  isUsersCard: boolean,
  benefitsCaptured: number | null
): CardSimulation {
  const capState: CapState = {};
  const categoryMap = new Map<
    EarnCategory,
    {
      spend: number;
      points: number;
      txCount: number;
      earnRates: Map<number, number>; // rate -> spend amount
      capNote: string | null;
    }
  >();

  let totalPoints = 0;

  for (const tx of transactions) {
    const result = calculatePointsForTransaction(
      {
        id: tx.id,
        merchantName: tx.merchantName,
        amount: Math.abs(tx.amount),
        category: tx.assignment.category,
        confidence: tx.assignment.confidence,
        date: tx.date,
        datetime: tx.datetime,
      },
      config,
      capState
    );

    // Handle refunds
    const effectivePoints = tx.amount < 0 ? -Math.abs(result.points) : result.points;
    totalPoints += effectivePoints;

    const cat = tx.assignment.category;
    if (!categoryMap.has(cat)) {
      categoryMap.set(cat, {
        spend: 0,
        points: 0,
        txCount: 0,
        earnRates: new Map(),
        capNote: null,
      });
    }
    const entry = categoryMap.get(cat)!;
    entry.spend += Math.abs(tx.amount);
    entry.points += effectivePoints;
    entry.txCount += 1;

    const prevSpend = entry.earnRates.get(result.earnRate) ?? 0;
    entry.earnRates.set(result.earnRate, prevSpend + Math.abs(tx.amount));

    if (result.capApplied) {
      const cap = config.caps.find((c) => c.categories.includes(cat));
      if (cap) {
        entry.capNote = `${config.cardName.split(" ").pop()} ${result.earnRate > config.baseRate ? `${result.earnRate}x` : "base rate"} capped at $${(cap.maxSpend / 1000).toFixed(0)}K/yr`;
      }
    }
  }

  // Apply anniversary bonus (CSP 10%)
  let bonusPoints = 0;
  if (config.anniversaryBonus) {
    bonusPoints = Math.round(totalPoints * config.anniversaryBonus);
    totalPoints += bonusPoints;
  }

  const values = valuatePoints(totalPoints, config);
  const benefitsValue = computeBenefitsValue(config.cardId);

  // Range-based net values (apples-to-apples for all cards)
  const netFloor = round2(values.conservative - config.annualFee);
  const netCeiling = round2(values.conservative + benefitsValue - config.annualFee);
  const netActual = isUsersCard && benefitsCaptured !== null
    ? round2(values.conservative + benefitsCaptured - config.annualFee)
    : netCeiling;

  // Build category summaries
  const categories: CategoryEarnSummary[] = [];
  for (const [cat, data] of categoryMap) {
    // Determine dominant earn rate (the one with most spend)
    let dominantRate = config.baseRate;
    let maxSpend = 0;
    for (const [rate, spend] of data.earnRates) {
      if (spend > maxSpend) {
        dominantRate = rate;
        maxSpend = spend;
      }
    }

    const catValues = valuatePoints(data.points, config);

    categories.push({
      category: cat,
      label: EARN_CATEGORY_LABELS[cat],
      icon: EARN_CATEGORY_ICONS[cat],
      totalSpend: round2(data.spend),
      transactionCount: data.txCount,
      earnRate: dominantRate,
      points: data.points,
      valueConservative: catValues.conservative,
      capNote: data.capNote,
    });
  }

  // Sort by spend descending
  categories.sort((a, b) => b.totalSpend - a.totalSpend);

  return {
    cardId: config.cardId,
    cardName: config.cardName,
    isUsersCard,
    annualFee: config.annualFee,
    totalPoints,
    bonusPoints,
    pointsValueConservative: values.conservative,
    pointsValueUpside: values.upside,
    benefitsValue,
    benefitsCaptured: isUsersCard ? benefitsCaptured : null,
    benefitsSimulated: null,
    netFloor,
    netCeiling,
    netActual,
    rank: 0, // set after ranking
    categories,
  };
}

/**
 * Run the benefit matching engine against a card's benefit catalog
 * using the user's actual transactions. Returns total credits matched.
 */
function simulateBenefitsForCard(
  cardId: string,
  transactions: SimulationTransaction[]
): number {
  const cardDef = getCardDefinition(cardId);
  if (!cardDef || cardDef.benefits.length === 0) return 0;

  // Convert to MatcherTransaction format (all treated as unmatched)
  const matcherTxns: MatcherTransaction[] = transactions
    .filter((tx) => tx.amount > 0)
    .map((tx) => ({
      id: tx.id,
      date: tx.date,
      merchantName: tx.merchantName,
      merchantNameRaw: tx.merchantNameRaw,
      amount: Math.abs(tx.amount),
      plaidCategoryPrimary: tx.plaidCategoryPrimary,
      plaidCategoryDetailed: tx.plaidCategoryDetailed,
      pending: false,
      matchedStatus: "unmatched" as const,
    }));

  // Run matcher with empty usage (fresh simulation) and no anniversary date
  const result = runMatcher(matcherTxns, {
    benefits: cardDef.benefits,
    usageMap: new Map(),
    anniversaryDate: null,
  });

  // Sum all credits matched
  const total = result.matches.reduce((sum, m) => sum + m.creditApplied, 0);
  return round2(total);
}

function buildCategoryBreakdown(
  cards: CardSimulation[],
  transactions: SimulationTransaction[]
): CategoryWinner[] {
  // Collect all categories with spend
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

    // Determine winner
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
      label: EARN_CATEGORY_LABELS[cat],
      icon: EARN_CATEGORY_ICONS[cat],
      totalSpend,
      transactionCount: txCount,
      cards: cardEntries,
    });
  }

  // Sort by total spend descending
  breakdown.sort((a, b) => b.totalSpend - a.totalSpend);

  return breakdown;
}

function buildHeadline(
  usersCard: CardSimulation,
  alternatives: CardSimulation[]
): HeadlineVerdict {
  // Use netFloor (points only) for fair apples-to-apples comparison
  const bestAlt =
    alternatives.length > 0 ? alternatives[0] : usersCard;
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
