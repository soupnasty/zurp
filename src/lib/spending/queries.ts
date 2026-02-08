import "server-only";
import { db } from "@/db";
import { and, eq, gte, lt, sql } from "drizzle-orm";
import * as schema from "@/db/schema";
import { classifyTransaction } from "./categories";
import type { CategorizedTransaction, CategorySpending, MonthlyHeadline } from "./types";
import { CATEGORY_LABELS } from "./categories";

/**
 * Fetch all non-pending, non-annual-fee transactions for a given month.
 * Returns classified transactions with Zurp spending categories.
 */
export async function getMonthlyTransactions(
  userId: string,
  year: number,
  month: number
): Promise<CategorizedTransaction[]> {
  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 1));

  const rows = await db
    .select()
    .from(schema.transactions)
    .where(
      and(
        eq(schema.transactions.userId, userId),
        gte(schema.transactions.date, startDate),
        lt(schema.transactions.date, endDate),
        eq(schema.transactions.pending, false),
        eq(schema.transactions.isAnnualFee, false)
      )
    );

  // Exclude income, transfers-in, and loan payments — this is a spending view.
  // Use Math.abs() because Plaid sign conventions vary by environment.
  const EXCLUDED_PRIMARY = new Set([
    "INCOME",
    "TRANSFER_IN",
    "LOAN_PAYMENTS",
    "BANK_FEES",
  ]);

  return rows
    .filter((tx) => {
      if (tx.amount === 0) return false;
      if (tx.plaidCategoryPrimary && EXCLUDED_PRIMARY.has(tx.plaidCategoryPrimary)) return false;
      return true;
    })
    .map((tx) => ({
      id: tx.id,
      date: tx.date.toISOString(),
      merchantName: tx.merchantName,
      amount: Math.abs(tx.amount),
      category: classifyTransaction(
        tx.plaidCategoryPrimary,
        tx.plaidCategoryDetailed
      ),
      plaidCategoryPrimary: tx.plaidCategoryPrimary,
      plaidCategoryDetailed: tx.plaidCategoryDetailed,
    }));
}

/**
 * Compute monthly headline (total + month-over-month comparison).
 */
export async function getMonthlyHeadline(
  userId: string,
  year: number,
  month: number
): Promise<MonthlyHeadline> {
  // Previous month
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;

  const [currentTxs, previousTxs] = await Promise.all([
    getMonthlyTransactions(userId, year, month),
    getMonthlyTransactions(userId, prevYear, prevMonth),
  ]);

  const total = currentTxs.reduce((sum, tx) => sum + tx.amount, 0);
  const previousTotal =
    previousTxs.length > 0
      ? previousTxs.reduce((sum, tx) => sum + tx.amount, 0)
      : null;

  const percentChange =
    previousTotal !== null && previousTotal > 0
      ? Math.round(((total - previousTotal) / previousTotal) * 100)
      : null;

  return {
    total,
    previousTotal,
    percentChange,
    isFirstMonth: previousTxs.length === 0,
  };
}

/**
 * Group transactions into spending categories, sorted descending by total.
 * Pure function — no async.
 */
export function buildCategoryBreakdown(
  transactions: CategorizedTransaction[]
): CategorySpending[] {
  const buckets = new Map<string, CategorizedTransaction[]>();

  for (const tx of transactions) {
    const existing = buckets.get(tx.category);
    if (existing) {
      existing.push(tx);
    } else {
      buckets.set(tx.category, [tx]);
    }
  }

  const categories: CategorySpending[] = [];
  for (const [category, txs] of buckets) {
    const total = txs.reduce((sum, tx) => sum + tx.amount, 0);
    if (total === 0) continue;

    // Sort transactions by date descending
    txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    categories.push({
      category: category as CategorizedTransaction["category"],
      label: CATEGORY_LABELS[category as CategorizedTransaction["category"]] ?? category,
      total,
      transactions: txs,
    });
  }

  // Sort by total descending
  categories.sort((a, b) => b.total - a.total);
  return categories;
}

/**
 * Get the min/max transaction dates for a user (for month selector bounds).
 */
export async function getTransactionDateRange(
  userId: string
): Promise<{ minDate: Date | null; maxDate: Date | null }> {
  const result = await db
    .select({
      minDate: sql<string>`min(${schema.transactions.date})`,
      maxDate: sql<string>`max(${schema.transactions.date})`,
    })
    .from(schema.transactions)
    .where(eq(schema.transactions.userId, userId));

  const row = result[0];
  return {
    minDate: row?.minDate ? new Date(row.minDate) : null,
    maxDate: row?.maxDate ? new Date(row.maxDate) : null,
  };
}
