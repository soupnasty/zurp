import { isNull, notInArray, or, type SQL } from "drizzle-orm";
import * as schema from "@/db/schema";

/**
 * Plaid primary categories that never earn points (not real spend).
 */
export const EXCLUDED_CATEGORIES = [
  "INCOME",
  "TRANSFER_IN",
  "LOAN_PAYMENTS",
  "BANK_FEES",
];

/**
 * SQL predicate: transaction category is not one of the excluded categories.
 *
 * `plaidCategoryPrimary` is nullable, and SQL `col NOT IN (...)` evaluates to
 * NULL (falsy) when col is NULL — which would silently drop every
 * uncategorized transaction. Uncategorized spend is still spend, so NULL
 * must pass the filter.
 */
export function categoryNotExcluded(): SQL {
  return or(
    isNull(schema.transactions.plaidCategoryPrimary),
    notInArray(schema.transactions.plaidCategoryPrimary, EXCLUDED_CATEGORIES)
  )!;
}
