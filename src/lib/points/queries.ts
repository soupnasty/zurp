import "server-only";
import { db } from "@/db";
import { eq, and, ne, notInArray, sql } from "drizzle-orm";
import * as schema from "@/db/schema";

const EXCLUDED_CATEGORIES = [
  "INCOME",
  "TRANSFER_IN",
  "LOAN_PAYMENTS",
  "BANK_FEES",
];

export interface CompareTransaction {
  id: string;
  date: Date;
  merchantName: string | null;
  merchantNameRaw: string | null;
  amount: number;
  plaidCategoryPrimary: string | null;
  plaidCategoryDetailed: string | null;
}

/**
 * Get all qualifying transactions for comparison simulation.
 * Excludes: pending, annual fee, income, transfers in, loans, bank fees.
 * Sorted by date ascending for cap tracking.
 */
export async function getCompareTransactions(
  userId: string
): Promise<CompareTransaction[]> {
  const txs = await db.query.transactions.findMany({
    where: and(
      eq(schema.transactions.userId, userId),
      eq(schema.transactions.pending, false),
      eq(schema.transactions.isAnnualFee, false),
      notInArray(schema.transactions.plaidCategoryPrimary, EXCLUDED_CATEGORIES)
    ),
    orderBy: (t, { asc }) => [asc(t.date)],
    columns: {
      id: true,
      date: true,
      merchantName: true,
      merchantNameRaw: true,
      amount: true,
      plaidCategoryPrimary: true,
      plaidCategoryDetailed: true,
    },
  });

  return txs.map((tx) => ({
    ...tx,
    amount: Math.abs(tx.amount), // Normalize to positive (refunds tracked separately)
  }));
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
        notInArray(schema.transactions.plaidCategoryPrimary, EXCLUDED_CATEGORIES)
      )
    );

  const row = result[0];
  if (!row?.minDate || !row?.maxDate) return null;

  const start = new Date(row.minDate);
  const end = new Date(row.maxDate);

  // Calculate month count
  const monthCount = Math.max(
    1,
    (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth()) +
      1
  );

  return { start, end, monthCount };
}
