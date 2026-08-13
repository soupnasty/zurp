import "server-only";
import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import * as schema from "@/db/schema";
import { classifyForPoints } from "./categories";
import { EARN_CATEGORY_LABELS, EARN_CATEGORY_ICONS } from "./category-labels";
import {
  calculatePointsForTransaction,
  isPaymentTransaction,
} from "./calculator";
import { getAllEarnConfigs } from "./earn-configs";
import { valuatePoints, computeBenefitsValue } from "./valuation";

import { simulateBenefitsForCard } from "@/lib/engine/benefit-simulator";
import type {
  CapState,
  EarnCategory,
  EarnConfig,
  CategoryEarnSummary,
} from "./types";
import type { MatcherTransaction } from "@/lib/types";
import { categoryNotExcluded } from "./tx-filter";

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
      categoryNotExcluded()
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

  // Rolling 365-day window ending today (or less if not enough data)
  const now = new Date();
  const windowStart = new Date(now);
  windowStart.setFullYear(windowStart.getFullYear() - 1);
  windowStart.setDate(windowStart.getDate() + 1);
  windowStart.setHours(0, 0, 0, 0);
  const windowEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const bounds = {
    periodKey: `${now.getFullYear()}-ANN`,
    cycleStart: windowStart,
    cycleEnd: windowEnd,
  };

  // Filter to transactions within the window
  const yearTxs = txs.filter(
    (tx) => tx.date >= bounds.cycleStart && tx.date <= bounds.cycleEnd
  );

  if (yearTxs.length === 0) return;

  // The displayed analysis period must describe the transactions actually
  // simulated (the windowed set) — not the full synced history, which can
  // reach back further than the rolling 365-day window. (yearTxs is sorted
  // ascending by date.)
  const analysisPeriodStart = yearTxs[0].date;
  const analysisPeriodEnd = yearTxs[yearTxs.length - 1].date;
  const monthCount = Math.min(
    12,
    Math.max(
      1,
      (analysisPeriodEnd.getUTCFullYear() - analysisPeriodStart.getUTCFullYear()) * 12 +
        (analysisPeriodEnd.getUTCMonth() - analysisPeriodStart.getUTCMonth()) +
        1
    )
  );

  // Pre-classify all transactions (portal-independent)
  const classifiedTxns = yearTxs.map((tx) => {
    const assignment = classifyForPoints(
      tx.merchantName,
      tx.plaidCategoryPrimary,
      tx.plaidCategoryDetailed
    );
    return { ...tx, assignment };
  });

  // Build MatcherTransaction array for benefit simulation (once, shared
  // across cards). Signed amounts: refunds must not count as purchases.
  const matcherTxns: MatcherTransaction[] = yearTxs.map((tx) => ({
    id: tx.id,
    date: tx.date,
    merchantName: tx.merchantName,
    merchantNameRaw: tx.merchantNameRaw,
    amount: tx.amount,
    plaidCategoryPrimary: tx.plaidCategoryPrimary,
    plaidCategoryDetailed: tx.plaidCategoryDetailed,
    pending: false,
    matchedStatus: "unmatched" as const,
  }));

  // Net spend: refunds subtract; card payments are not spend at all.
  const totalSpend = classifiedTxns.reduce(
    (sum, tx) => (isPaymentTransaction(tx) ? sum : sum + tx.amount),
    0
  );
  const totalTransactions = classifiedTxns.length;

  const configs = getAllEarnConfigs();
  const upserts: (typeof schema.cardSimulations.$inferInsert)[] = [];

  for (const config of configs) {
    // Run benefit simulation once per card (portal-mode-independent).
    // Pass period start as synthetic anniversary date so annual benefits
    // get one budget across the 365-day window.
    const benefitSim = simulateBenefitsForCard(
      config.cardId,
      matcherTxns,
      analysisPeriodStart
    );
    const benefitsSimulated = benefitSim.total;
    const matchedPerBenefit = Object.fromEntries(benefitSim.perBenefit);
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
        simResult.pointsValueConservative + benefitsValue - config.annualFee
      );
      const netActual = round2(
        simResult.pointsValueConservative + benefitsSimulated - config.annualFee
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
        matchedPerBenefit,
        benefitsValue,
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

  // Delete existing rows for this card profile, then insert fresh ones.
  // Using DELETE + INSERT instead of ON CONFLICT DO UPDATE because
  // Drizzle's onConflictDoUpdate can fail to update JSONB columns
  // (categoryBreakdown), leaving stale data from previous computations.
  await db
    .delete(schema.cardSimulations)
    .where(eq(schema.cardSimulations.cardProfileId, cardProfileId));

  for (const row of upserts) {
    await db.insert(schema.cardSimulations).values(row);
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

    // Card payments ("PAYMENT THANK YOU", autopay) are not spend — skip.
    if (isPaymentTransaction(tx)) continue;

    // Pass the signed amount: the calculator returns negative points for
    // refunds and releases their spend from category caps.
    const result = calculatePointsForTransaction(
      {
        id: tx.id,
        merchantName: tx.merchantName,
        amount: tx.amount,
        category,
        confidence: tx.assignment.confidence,
        date: tx.date,
        datetime: tx.datetime,
      },
      config,
      capState
    );

    totalPoints += result.points;

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
    entry.spend += tx.amount;
    entry.points += result.points;
    entry.txCount += 1;

    const prevSpend = entry.earnRates.get(result.earnRate) ?? 0;
    entry.earnRates.set(result.earnRate, prevSpend + tx.amount);

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
    categories,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
