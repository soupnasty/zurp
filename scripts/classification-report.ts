/**
 * Classification observability report.
 *
 * Answers: what share of spend is classified, by which tier, and which
 * unclassified merchant strings account for the most dollars (i.e. what
 * should be added to the merchant map next).
 *
 * Usage: npx tsx scripts/classification-report.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/db/schema";
import { classifyForPoints } from "../src/lib/points/categories";
import { isPaymentTransaction } from "../src/lib/points/calculator";
import { EXCLUDED_CATEGORIES } from "../src/lib/points/tx-filter";
import { normalizeMerchantName } from "../src/lib/engine/normalize";

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const pct = (num: number, den: number) => (den > 0 ? ((num / den) * 100).toFixed(1) + "%" : "–");

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required (put it in .env.local)");
  }
  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle({ client: sql, schema });

  const txs = await db.query.transactions.findMany({
    columns: {
      userId: true,
      merchantName: true,
      merchantNameRaw: true,
      amount: true,
      plaidCategoryPrimary: true,
      plaidCategoryDetailed: true,
      paymentChannel: true,
      pending: true,
      isAnnualFee: true,
    },
  });

  // Mirror the compare pipeline's filters: purchases only.
  const purchases = txs.filter(
    (tx) =>
      !tx.pending &&
      !tx.isAnnualFee &&
      !EXCLUDED_CATEGORIES.includes(tx.plaidCategoryPrimary ?? "") &&
      tx.amount > 0 &&
      !isPaymentTransaction(tx)
  );

  let totalSpend = 0;
  let classifiedSpend = 0;
  const byTier = new Map<string, { spend: number; count: number }>();
  const byCategory = new Map<string, { spend: number; count: number }>();
  const unclassified = new Map<
    string,
    { spend: number; count: number; plaid: Map<string, number> }
  >();
  const byUser = new Map<string, { spend: number; classified: number; count: number }>();

  for (const tx of purchases) {
    const a = classifyForPoints(
      tx.merchantName,
      tx.plaidCategoryPrimary,
      tx.plaidCategoryDetailed,
      { paymentChannel: tx.paymentChannel }
    );
    totalSpend += tx.amount;

    const tier =
      a.matchSource === "merchant_name"
        ? "tier1 merchant map (high)"
        : a.matchSource === "plaid_category"
          ? a.confidence === "medium"
            ? "tier2 plaid detailed (medium)"
            : "tier2b plaid primary (low)"
          : "tier3 unclassified";
    const t = byTier.get(tier) ?? { spend: 0, count: 0 };
    t.spend += tx.amount;
    t.count++;
    byTier.set(tier, t);

    const c = byCategory.get(a.category) ?? { spend: 0, count: 0 };
    c.spend += tx.amount;
    c.count++;
    byCategory.set(a.category, c);

    const u0 = byUser.get(tx.userId) ?? { spend: 0, classified: 0, count: 0 };
    u0.spend += tx.amount;
    u0.count++;
    if (a.category !== "other") u0.classified += tx.amount;
    byUser.set(tx.userId, u0);

    if (a.category !== "other") {
      classifiedSpend += tx.amount;
    } else {
      const key =
        normalizeMerchantName(tx.merchantName) ||
        tx.merchantNameRaw?.toLowerCase().trim() ||
        "(no merchant name)";
      const u = unclassified.get(key) ?? { spend: 0, count: 0, plaid: new Map() };
      u.spend += tx.amount;
      u.count++;
      const plaidKey = tx.plaidCategoryDetailed ?? tx.plaidCategoryPrimary ?? "(none)";
      u.plaid.set(plaidKey, (u.plaid.get(plaidKey) ?? 0) + 1);
      unclassified.set(key, u);
    }
  }

  console.log("═".repeat(72));
  console.log("CLASSIFICATION REPORT");
  console.log("═".repeat(72));
  console.log(
    `${purchases.length} purchases | ${fmt(totalSpend)} total | ` +
      `${pct(classifiedSpend, totalSpend)} of spend classified`
  );

  console.log("\n── By user ──");
  for (const [userId, u] of [...byUser.entries()].sort((a, b) => b[1].spend - a[1].spend)) {
    console.log(
      `  ${userId.slice(0, 12).padEnd(14)} ${fmt(u.spend).padStart(10)}  ${pct(u.classified, u.spend).padStart(5)} classified  (${u.count} txns)`
    );
  }

  console.log("\n── By tier ──");
  for (const [tier, t] of [...byTier.entries()].sort((a, b) => b[1].spend - a[1].spend)) {
    console.log(
      `  ${tier.padEnd(32)} ${fmt(t.spend).padStart(10)}  (${pct(t.spend, totalSpend).padStart(5)}, ${t.count} txns)`
    );
  }

  console.log("\n── By category ──");
  for (const [cat, c] of [...byCategory.entries()].sort((a, b) => b[1].spend - a[1].spend)) {
    console.log(
      `  ${cat.padEnd(20)} ${fmt(c.spend).padStart(10)}  (${pct(c.spend, totalSpend).padStart(5)}, ${c.count} txns)`
    );
  }

  console.log("\n── Top unclassified merchants by spend (the next map entries) ──");
  const top = [...unclassified.entries()].sort((a, b) => b[1].spend - a[1].spend).slice(0, 30);
  for (const [name, u] of top) {
    const plaidTop = [...u.plaid.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
    console.log(
      `  ${fmt(u.spend).padStart(9)}  ×${String(u.count).padEnd(4)} ${name.padEnd(36)} ${plaidTop}`
    );
  }

  const topSpend = top.reduce((s, [, u]) => s + u.spend, 0);
  console.log(
    `\n  These ${top.length} merchants cover ${fmt(topSpend)} of ${fmt(totalSpend - classifiedSpend)} unclassified ` +
      `(${pct(topSpend, totalSpend - classifiedSpend)})`
  );
}

main().then(() => process.exit(0));
