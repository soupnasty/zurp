import { db } from "@/db";
import { and, eq } from "drizzle-orm";
import * as schema from "@/db/schema";
import { classifyForPoints } from "./categories";
import { isPaymentTransaction } from "./calculator";
import { categoryNotExcluded } from "./tx-filter";
import { normalizeMerchantName } from "@/lib/engine/normalize";
import { getMerchantClassificationsMap } from "./llm-classifier";
import { isEarnCategory } from "./category-labels";
import type { EarnCategory } from "./types";

export { isEarnCategory };

/**
 * Load a user's category corrections as a lookup map keyed by normalized
 * merchant name. Passed into classifyForPoints via ClassifyContext.
 */
export async function getCategoryOverridesMap(
  userId: string
): Promise<Map<string, EarnCategory>> {
  const rows = await db.query.categoryOverrides.findMany({
    where: eq(schema.categoryOverrides.userId, userId),
    columns: { normalizedMerchant: true, category: true },
  });

  const map = new Map<string, EarnCategory>();
  for (const row of rows) {
    if (isEarnCategory(row.category)) {
      map.set(row.normalizedMerchant, row.category);
    }
  }
  return map;
}

export interface UnclassifiedMerchant {
  /** Normalized merchant name — the override key. */
  merchant: string;
  /** Most frequent display name among this merchant's transactions. */
  displayName: string;
  spend: number;
  count: number;
}

/**
 * Top unclassified merchants by dollars for a user — the rows the
 * "Unclassified spend" panel offers for reclassification. Merchants the
 * user has already overridden are excluded (even overrides to "other":
 * that's a resolved answer, not a gap).
 */
export async function getUnclassifiedMerchants(
  userId: string,
  limit = 12
): Promise<UnclassifiedMerchant[]> {
  const [overrides, llmClassifications] = await Promise.all([
    getCategoryOverridesMap(userId),
    getMerchantClassificationsMap(),
  ]);

  const txs = await db.query.transactions.findMany({
    where: and(
      eq(schema.transactions.userId, userId),
      eq(schema.transactions.pending, false),
      eq(schema.transactions.isAnnualFee, false),
      categoryNotExcluded()
    ),
    columns: {
      merchantName: true,
      merchantEntityId: true,
      amount: true,
      plaidCategoryPrimary: true,
      plaidCategoryDetailed: true,
      paymentChannel: true,
    },
  });

  const groups = new Map<
    string,
    { spend: number; count: number; names: Map<string, number> }
  >();

  for (const tx of txs) {
    if (tx.amount <= 0 || isPaymentTransaction(tx)) continue;

    const assignment = classifyForPoints(
      tx.merchantName,
      tx.plaidCategoryPrimary,
      tx.plaidCategoryDetailed,
      {
        paymentChannel: tx.paymentChannel,
        merchantEntityId: tx.merchantEntityId,
        overrides,
        llmClassifications,
      }
    );
    if (assignment.category !== "other") continue;
    if (assignment.matchSource === "user_override") continue;

    const key = normalizeMerchantName(tx.merchantName);
    if (!key) continue;

    const group = groups.get(key) ?? { spend: 0, count: 0, names: new Map() };
    group.spend += tx.amount;
    group.count++;
    const display = tx.merchantName ?? key;
    group.names.set(display, (group.names.get(display) ?? 0) + 1);
    groups.set(key, group);
  }

  return [...groups.entries()]
    .sort((a, b) => b[1].spend - a[1].spend)
    .slice(0, limit)
    .map(([merchant, g]) => ({
      merchant,
      displayName:
        [...g.names.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? merchant,
      spend: g.spend,
      count: g.count,
    }));
}
