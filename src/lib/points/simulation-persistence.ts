import "server-only";
import { db } from "@/db";
import { eq, and, notInArray } from "drizzle-orm";
import * as schema from "@/db/schema";
import { classifyForPoints } from "./categories";
import { EARN_CATEGORY_LABELS, EARN_CATEGORY_ICONS } from "./category-labels";
import { calculatePointsForTransaction } from "./calculator";
import { getAllEarnConfigs } from "./earn-configs";
import { valuatePoints, computeBenefitsValue } from "./valuation";
import { getCurrentCycleBounds } from "@/lib/engine/cycle-utils";
import { simulateBenefitsForCard } from "@/lib/engine/benefit-simulator";
import { getTransactionPeriod } from "./queries";
import type {
  CapState,
  EarnCategory,
  EarnConfig,
  CategoryEarnSummary,
} from "./types";
import type { MatcherTransaction } from "@/lib/types";

const EXCLUDED_CATEGORIES = [
  "INCOME",
  "TRANSFER_IN",
  "LOAN_PAYMENTS",
  "BANK_FEES",
];

const TRAVEL_CATEGORIES: EarnCategory[] = [
  "travel_flights",
  "travel_hotels",
  "travel_other",
  "car_rentals",
];

/**
 * Compute card simulations for all 6 cards × 2 portal modes and upsert to DB.
 * Called after transaction matching + points summary in the sync pipeline.
 */
export async function computeAndPersistSimulations(
  userId: string,
  cardProfileId: string,
  anniversaryDate: Date | null
) {
  // Look up the connection for this card profile
  const cardProfile = await db.query.cardProfiles.findFirst({
    where: eq(schema.cardProfiles.id, cardProfileId),
    columns: { plaidConnectionId: true },
  });
  if (!cardProfile) return;

  // Fetch qualifying transactions for this connection
  const txs = await db.query.transactions.findMany({
    where: and(
      eq(schema.transactions.plaidConnectionId, cardProfile.plaidConnectionId),
      eq(schema.transactions.pending, false),
      eq(schema.transactions.isAnnualFee, false),
      notInArray(schema.transactions.plaidCategoryPrimary, EXCLUDED_CATEGORIES)
    ),
    orderBy: (t, { asc }) => [asc(t.date)],
    columns: {
      id: true,
      date: true,
      datetime: true,
      merchantName: true,
      merchantNameRaw: true,
      amount: true,
      plaidCategoryPrimary: true,
      plaidCategoryDetailed: true,
    },
  });

  if (txs.length === 0) return;

  // Compute anniversary year period bounds
  const now = new Date();
  const bounds = getCurrentCycleBounds("annual_anniversary", now, anniversaryDate);

  // Filter to transactions within the anniversary year
  const yearTxs = txs.filter(
    (tx) => tx.date >= bounds.cycleStart && tx.date < bounds.cycleEnd
  );

  if (yearTxs.length === 0) return;

  // Get transaction period for month count
  const period = await getTransactionPeriod(userId);
  const monthCount = period?.monthCount ?? 1;
  const analysisPeriodStart = period?.start ?? bounds.cycleStart;
  const analysisPeriodEnd = period?.end ?? bounds.cycleEnd;

  // Pre-classify all transactions (portal-independent)
  const classifiedTxns = yearTxs.map((tx) => {
    const assignment = classifyForPoints(
      tx.merchantName,
      tx.plaidCategoryPrimary,
      tx.plaidCategoryDetailed
    );
    return { ...tx, assignment };
  });

  // Build MatcherTransaction array for benefit simulation (once, shared across cards)
  const matcherTxns: MatcherTransaction[] = yearTxs.map((tx) => ({
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

  const totalSpend = classifiedTxns.reduce(
    (sum, tx) => sum + Math.abs(tx.amount),
    0
  );
  const totalTransactions = classifiedTxns.length;

  const configs = getAllEarnConfigs();
  const upserts: (typeof schema.cardSimulations.$inferInsert)[] = [];

  for (const config of configs) {
    // Run benefit simulation once per card (portal-mode-independent)
    const benefitSim = simulateBenefitsForCard(
      config.cardId,
      matcherTxns,
      anniversaryDate
    );
    const benefitsSimulated = benefitSim.total;
    const benefitsValue = computeBenefitsValue(config.cardId);

    // Run points simulation for each portal mode
    for (const portalMode of [false, true]) {
      const simResult = simulatePointsForCard(
        config,
        classifiedTxns,
        portalMode
      );

      const netFloor = round2(simResult.pointsValueConservative - config.annualFee);
      const netCeiling = round2(
        simResult.pointsValueConservative + benefitsValue + simResult.parallelValue - config.annualFee
      );
      const netActual = round2(
        simResult.pointsValueConservative + benefitsSimulated + simResult.parallelValue - config.annualFee
      );

      upserts.push({
        userId,
        cardProfileId,
        simulatedCardId: config.cardId,
        portalMode,
        annualFee: config.annualFee,
        totalPoints: simResult.totalPoints,
        bonusPoints: simResult.bonusPoints,
        pointsValueConservative: simResult.pointsValueConservative,
        pointsValueUpside: simResult.pointsValueUpside,
        benefitsSimulated,
        benefitsValue,
        parallelValue: simResult.parallelValue,
        netFloor,
        netCeiling,
        netActual,
        categoryBreakdown: simResult.categories,
        analysisPeriodStart,
        analysisPeriodEnd,
        monthCount,
        totalSpend: round2(totalSpend),
        totalTransactions,
        updatedAt: new Date(),
      });
    }
  }

  // Upsert all 12 rows
  for (const row of upserts) {
    await db
      .insert(schema.cardSimulations)
      .values(row)
      .onConflictDoUpdate({
        target: [
          schema.cardSimulations.cardProfileId,
          schema.cardSimulations.simulatedCardId,
          schema.cardSimulations.portalMode,
        ],
        set: {
          annualFee: row.annualFee,
          totalPoints: row.totalPoints,
          bonusPoints: row.bonusPoints,
          pointsValueConservative: row.pointsValueConservative,
          pointsValueUpside: row.pointsValueUpside,
          benefitsSimulated: row.benefitsSimulated,
          benefitsValue: row.benefitsValue,
          parallelValue: row.parallelValue,
          netFloor: row.netFloor,
          netCeiling: row.netCeiling,
          netActual: row.netActual,
          categoryBreakdown: row.categoryBreakdown,
          analysisPeriodStart: row.analysisPeriodStart,
          analysisPeriodEnd: row.analysisPeriodEnd,
          monthCount: row.monthCount,
          totalSpend: row.totalSpend,
          totalTransactions: row.totalTransactions,
          updatedAt: new Date(),
        },
      });
  }
}

/**
 * Clear all simulation rows for a card profile.
 * Called during reprocessing (card type change, etc).
 */
export async function clearSimulations(cardProfileId: string) {
  await db
    .delete(schema.cardSimulations)
    .where(eq(schema.cardSimulations.cardProfileId, cardProfileId));
}

// ── Internal helpers ──

interface ClassifiedTransaction {
  id: string;
  date: Date;
  datetime: Date | null;
  merchantName: string | null;
  amount: number;
  assignment: { category: EarnCategory; confidence: "high" | "medium" | "low" };
}

function simulatePointsForCard(
  config: EarnConfig,
  transactions: ClassifiedTransaction[],
  portalMode: boolean
): {
  totalPoints: number;
  bonusPoints: number;
  pointsValueConservative: number;
  pointsValueUpside: number;
  parallelValue: number;
  categories: CategoryEarnSummary[];
} {
  const capState: CapState = {};
  const categoryMap = new Map<
    EarnCategory,
    {
      spend: number;
      points: number;
      txCount: number;
      earnRates: Map<number, number>;
      capNote: string | null;
    }
  >();

  let totalPoints = 0;

  for (const tx of transactions) {
    // Portal mode: reclassify travel categories
    const category =
      portalMode && TRAVEL_CATEGORIES.includes(tx.assignment.category)
        ? ("travel_portal" as EarnCategory)
        : tx.assignment.category;

    const result = calculatePointsForTransaction(
      {
        id: tx.id,
        merchantName: tx.merchantName,
        amount: Math.abs(tx.amount),
        category,
        confidence: tx.assignment.confidence,
        date: tx.date,
        datetime: tx.datetime,
      },
      config,
      capState
    );

    const isRefund = tx.amount < 0;
    const effectivePoints = isRefund ? -Math.abs(result.points) : result.points;
    totalPoints += effectivePoints;

    if (!categoryMap.has(category)) {
      categoryMap.set(category, {
        spend: 0,
        points: 0,
        txCount: 0,
        earnRates: new Map(),
        capNote: null,
      });
    }
    const entry = categoryMap.get(category)!;
    entry.spend += Math.abs(tx.amount);
    entry.points += effectivePoints;
    entry.txCount += 1;

    const prevSpend = entry.earnRates.get(result.earnRate) ?? 0;
    entry.earnRates.set(result.earnRate, prevSpend + Math.abs(tx.amount));

    if (result.capApplied) {
      const cap = config.caps.find((c) => c.categories.includes(category));
      if (cap) {
        entry.capNote = `${config.cardName.split(" ").pop()} ${result.earnRate > config.baseRate ? `${result.earnRate}x` : "base rate"} capped at $${(cap.maxSpend / 1000).toFixed(0)}K/yr`;
      }
    }
  }

  // Apply anniversary bonus
  let bonusPoints = 0;
  if (config.anniversaryBonus && totalPoints > 0) {
    bonusPoints = Math.round(totalPoints * config.anniversaryBonus);
    totalPoints += bonusPoints;
  }

  const values = valuatePoints(totalPoints, config);

  // Parallel earnings (e.g., Bilt Cash 4% on all non-rent purchases)
  let parallelValue = 0;
  if (config.parallelEarnings) {
    const cardTotalSpend = Array.from(categoryMap.values()).reduce(
      (sum, entry) => sum + entry.spend,
      0
    );
    parallelValue = round2(cardTotalSpend * (config.parallelEarnings.ratePercent / 100));
  }

  // Build category summaries
  const categories: CategoryEarnSummary[] = [];
  for (const [cat, data] of categoryMap) {
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
      label: EARN_CATEGORY_LABELS[cat] ?? cat,
      icon: EARN_CATEGORY_ICONS[cat] ?? "circle",
      totalSpend: round2(data.spend),
      transactionCount: data.txCount,
      earnRate: dominantRate,
      points: data.points,
      valueConservative: catValues.conservative,
      capNote: data.capNote,
    });
  }

  categories.sort((a, b) => b.totalSpend - a.totalSpend);

  return {
    totalPoints,
    bonusPoints,
    pointsValueConservative: values.conservative,
    pointsValueUpside: values.upside,
    parallelValue,
    categories,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
