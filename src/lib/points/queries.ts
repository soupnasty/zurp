import "server-only";
import { db } from "@/db";
import { eq, and, ne, sql, gte } from "drizzle-orm";
import * as schema from "@/db/schema";
import { categoryNotExcluded } from "./tx-filter";

export interface CompareTransaction {
  id: string;
  date: Date;
  datetime: Date | null;
  merchantName: string | null;
  merchantNameRaw: string | null;
  merchantEntityId: string | null;
  amount: number;
  plaidCategoryPrimary: string | null;
  plaidCategoryDetailed: string | null;
  paymentChannel: string | null;
}

/**
 * Get all qualifying transactions for comparison simulation.
 * Excludes: pending, annual fee, income, transfers in, loans, bank fees.
 * Sorted by date ascending for cap tracking.
 */
export async function getCompareTransactions(
  userId: string,
  options?: { since?: Date }
): Promise<CompareTransaction[]> {
  const conditions = [
    eq(schema.transactions.userId, userId),
    eq(schema.transactions.pending, false),
    eq(schema.transactions.isAnnualFee, false),
    categoryNotExcluded(),
  ];
  if (options?.since) {
    conditions.push(gte(schema.transactions.date, options.since));
  }

  const txs = await db.query.transactions.findMany({
    where: and(...conditions),
    orderBy: (t, { asc }) => [asc(t.date)],
    columns: {
      id: true,
      date: true,
      datetime: true,
      merchantName: true,
      merchantNameRaw: true,
      merchantEntityId: true,
      amount: true,
      plaidCategoryPrimary: true,
      plaidCategoryDetailed: true,
      paymentChannel: true,
    },
  });

  // Preserve original sign: negative = refund, positive = purchase.
  // Downstream code (simulator.ts, calculator.ts) handles both correctly.
  return txs;
}

export interface PointsEarningSummaryRow {
  cardId: string;
  totalSpend: number;
  totalPoints: number;
  valueConservative: number;
  valueUpside: number;
  categoryBreakdown: Array<{
    category: string;
    spend: number;
    points: number;
    earnRate: number;
    valueConservative: number;
  }>;
  lastTransactionDate: Date | null;
}

/**
 * Get the persisted points earning summary for a card profile.
 */
export async function getPointsEarningSummary(
  userId: string,
  cardProfileId: string,
  periodType = "anniversary_year"
): Promise<PointsEarningSummaryRow | null> {
  const row = await db.query.pointsEarningSummary.findFirst({
    where: and(
      eq(schema.pointsEarningSummary.userId, userId),
      eq(schema.pointsEarningSummary.cardProfileId, cardProfileId),
      eq(schema.pointsEarningSummary.periodType, periodType)
    ),
  });

  if (!row) return null;

  return {
    cardId: row.cardId,
    totalSpend: row.totalSpend,
    totalPoints: row.totalPoints,
    valueConservative: row.valueConservative,
    valueUpside: row.valueUpside,
    categoryBreakdown: row.categoryBreakdown,
    lastTransactionDate: row.lastTransactionDate,
  };
}

export interface TransactionPeriod {
  start: Date;
  end: Date;
  monthCount: number;
}

/**
 * Get the date range of user's transactions + month count.
 * Returns null if no qualifying data.
 */
export async function getTransactionPeriod(
  userId: string
): Promise<TransactionPeriod | null> {
  const result = await db
    .select({
      minDate: sql<Date>`MIN(${schema.transactions.date})`,
      maxDate: sql<Date>`MAX(${schema.transactions.date})`,
    })
    .from(schema.transactions)
    .where(
      and(
        eq(schema.transactions.userId, userId),
        eq(schema.transactions.pending, false),
        eq(schema.transactions.isAnnualFee, false),
        categoryNotExcluded()
      )
    );

  const row = result[0];
  if (!row?.minDate || !row?.maxDate) return null;

  const start = new Date(row.minDate);
  const end = new Date(row.maxDate);

  // Calculate month count
  const monthCount = Math.min(
    12,
    Math.max(
      1,
      (end.getFullYear() - start.getFullYear()) * 12 +
        (end.getMonth() - start.getMonth()) +
        1
    )
  );

  return { start, end, monthCount };
}
