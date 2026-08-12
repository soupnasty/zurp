import "server-only";
import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import * as schema from "@/db/schema";
import { classifyForPoints } from "./categories";
import {
  calculatePointsForTransaction,
  isPaymentTransaction,
} from "./calculator";
import { getEarnConfig } from "./earn-configs";
import { getCurrentCycleBounds } from "@/lib/engine/cycle-utils";
import { categoryNotExcluded } from "./tx-filter";

import type { CapState, EarnCategory } from "./types";

interface PeriodOptions {
  periodType: "anniversary_year" | "rolling_365";
  anniversaryDate?: Date | null;
}

/**
 * Compute points earning summary for a card profile and persist to DB.
 * Called after transaction matching in the sync pipeline.
 *
 * When periodType is "anniversary_year", uses anniversary-based bounds (for Track page).
 * When periodType is "rolling_365", uses a rolling 365-day window (for Compare/simulations).
 */
export async function computeAndPersistPointsSummary(
  userId: string,
  cardProfileId: string,
  cardType: string,
  options: PeriodOptions,
) {
  // Look up the connection for this card profile
  const cardProfile = await db.query.cardProfiles.findFirst({
    where: eq(schema.cardProfiles.id, cardProfileId),
    columns: { plaidConnectionId: true },
  });
  if (!cardProfile) return;

  const config = getEarnConfig(cardType);
  if (!config) return;

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
      amount: true,
      plaidCategoryPrimary: true,
      plaidCategoryDetailed: true,
    },
  });

  if (txs.length === 0) return;

  // Compute window bounds based on period type
  const now = new Date();
  let bounds: { periodKey: string; cycleStart: Date; cycleEnd: Date };

  if (options.periodType === "anniversary_year") {
    const cycleBounds = getCurrentCycleBounds(
      "annual_anniversary",
      now,
      options.anniversaryDate ?? null
    );
    bounds = cycleBounds;
  } else {
    // Rolling 365-day window ending today
    const windowStart = new Date(now);
    windowStart.setFullYear(windowStart.getFullYear() - 1);
    windowStart.setDate(windowStart.getDate() + 1);
    windowStart.setHours(0, 0, 0, 0);
    const windowEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    bounds = {
      periodKey: `${now.getFullYear()}-R365`,
      cycleStart: windowStart,
      cycleEnd: windowEnd,
    };
  }

  // Filter to transactions within the window
  const yearTxs = txs.filter(
    (tx) => tx.date >= bounds.cycleStart && tx.date <= bounds.cycleEnd
  );

  if (yearTxs.length === 0) return;

  // Calculate points per transaction
  const capState: CapState = {};
  let totalSpend = 0;
  let totalPoints = 0;
  const categoryAccum = new Map<
    EarnCategory,
    { spend: number; points: number; rateSpendProduct: number }
  >();

  for (const tx of yearTxs) {
    // Card payments ("PAYMENT THANK YOU", autopay) are not spend — skip.
    if (isPaymentTransaction(tx)) continue;

    const classification = classifyForPoints(
      tx.merchantName,
      tx.plaidCategoryPrimary,
      tx.plaidCategoryDetailed
    );

    // Pass the signed amount: the calculator returns negative points for
    // refunds and releases their spend from category caps.
    const result = calculatePointsForTransaction(
      {
        id: tx.id,
        merchantName: tx.merchantName,
        amount: tx.amount,
        category: classification.category,
        confidence: classification.confidence,
        date: tx.date,
        datetime: tx.datetime,
      },
      config,
      capState
    );

    totalSpend += tx.amount;
    totalPoints += result.points;

    const accum = categoryAccum.get(classification.category) ?? {
      spend: 0,
      points: 0,
      rateSpendProduct: 0,
    };
    accum.spend += tx.amount;
    accum.points += result.points;
    accum.rateSpendProduct += result.earnRate * tx.amount;
    categoryAccum.set(classification.category, accum);
  }

  // Apply anniversary bonus if applicable (e.g. CSP 10%)
  if (config.anniversaryBonus && totalPoints > 0) {
    const bonusPoints = Math.round(totalPoints * config.anniversaryBonus);
    totalPoints += bonusPoints;
  }

  // Compute dollar values
  const valueConservative = Math.round(
    (totalPoints * config.valuation.conservativeCpp) / 100
  );
  const valueUpside = Math.round(
    (totalPoints * config.valuation.upsideCpp) / 100
  );

  // Build category breakdown sorted by spend desc
  const categoryBreakdown = Array.from(categoryAccum.entries())
    .filter(([, v]) => v.spend > 0)
    .map(([category, v]) => ({
      category,
      spend: Math.round(v.spend * 100) / 100,
      points: v.points,
      earnRate:
        v.spend > 0 ? Math.round((v.rateSpendProduct / v.spend) * 10) / 10 : 0,
      valueConservative: Math.round(
        (v.points * config.valuation.conservativeCpp) / 100
      ),
    }))
    .sort((a, b) => b.spend - a.spend);

  const lastTx = yearTxs[yearTxs.length - 1];

  // Upsert into points_earning_summary
  await db
    .insert(schema.pointsEarningSummary)
    .values({
      userId,
      cardProfileId,
      cardId: config.cardId,
      periodType: options.periodType,
      periodStart: bounds.cycleStart,
      periodEnd: bounds.cycleEnd,
      totalSpend: Math.round(totalSpend * 100) / 100,
      totalPoints,
      valueConservative,
      valueUpside,
      categoryBreakdown,
      lastTransactionDate: lastTx?.date ?? null,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [
        schema.pointsEarningSummary.cardProfileId,
        schema.pointsEarningSummary.periodType,
        schema.pointsEarningSummary.periodStart,
      ],
      set: {
        totalSpend: Math.round(totalSpend * 100) / 100,
        totalPoints,
        valueConservative,
        valueUpside,
        categoryBreakdown,
        lastTransactionDate: lastTx?.date ?? null,
        updatedAt: new Date(),
      },
    });
}

/**
 * Clear all points earning summaries for a card profile.
 * Called during reprocessing (card type change, etc).
 */
export async function clearPointsSummary(cardProfileId: string) {
  await db
    .delete(schema.pointsEarningSummary)
    .where(eq(schema.pointsEarningSummary.cardProfileId, cardProfileId));
}
