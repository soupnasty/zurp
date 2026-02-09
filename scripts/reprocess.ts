/**
 * Clear all benefit usage + matched transactions and reprocess from scratch.
 * Usage: npx tsx scripts/reprocess.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, and } from "drizzle-orm";
import * as schema from "../src/db/schema";
import { getCardDefinition } from "../src/lib/cards";
import { runMatcher } from "../src/lib/engine/matcher";
import { getCurrentCycleBounds } from "../src/lib/engine/cycle-utils";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function main() {
  const userCards = await db.query.userCards.findMany();

  if (userCards.length === 0) {
    console.log("No user cards found.");
    return;
  }

  for (const uc of userCards) {
    console.log(`\nReprocessing card ${uc.cardId} for user ${uc.userId}...`);

    // 1. Delete all matchedTx for this user's benefit usage
    const usageRecords = await db.query.benefitUsage.findMany({
      where: eq(schema.benefitUsage.userId, uc.userId),
    });

    for (const usage of usageRecords) {
      await db
        .delete(schema.matchedTx)
        .where(eq(schema.matchedTx.benefitUsageId, usage.id));
    }
    console.log(`  Cleared matchedTx for ${usageRecords.length} usage records`);

    // 2. Delete all benefit usage
    await db
      .delete(schema.benefitUsage)
      .where(eq(schema.benefitUsage.userId, uc.userId));
    console.log(`  Cleared ${usageRecords.length} benefit usage records`);

    // 3. Reset all transactions to unmatched
    const connections = await db.query.plaidConnections.findMany({
      where: eq(schema.plaidConnections.userCardId, uc.id),
    });

    for (const conn of connections) {
      await db
        .update(schema.transactions)
        .set({ matchedStatus: "unmatched" })
        .where(eq(schema.transactions.plaidConnectionId, conn.id));
    }
    console.log(`  Reset transactions to unmatched for ${connections.length} connections`);

    // 4. Re-run matching (inline version of processTransactionsForConnection)
    const cardDef = getCardDefinition(uc.cardId);
    if (!cardDef) {
      console.log(`  No card definition for ${uc.cardId}, skipping.`);
      continue;
    }

    for (const conn of connections) {
      const rawTxs = await db.query.transactions.findMany({
        where: and(
          eq(schema.transactions.plaidConnectionId, conn.id),
          eq(schema.transactions.matchedStatus, "unmatched")
        ),
      });

      if (rawTxs.length === 0) {
        console.log(`  No unmatched transactions for connection ${conn.id}`);
        continue;
      }

      console.log(`  Processing ${rawTxs.length} unmatched transactions...`);

      // Initialize benefit usage for current periods
      const now = new Date();
      for (const benefit of cardDef.benefits) {
        if (benefit.type === "subscription") continue;
        const bounds = getCurrentCycleBounds(benefit.cycle as any, now, uc.anniversaryDate);
        const existing = await db.query.benefitUsage.findFirst({
          where: and(
            eq(schema.benefitUsage.userId, uc.userId),
            eq(schema.benefitUsage.benefitId, benefit.id),
            eq(schema.benefitUsage.periodKey, bounds.periodKey)
          ),
        });
        if (!existing) {
          const effectiveCredit = benefit.carriesOver && benefit.maxAccrued ? benefit.maxAccrued : benefit.creditAmount;
          await db.insert(schema.benefitUsage).values({
            userId: uc.userId,
            benefitId: benefit.id,
            cardId: uc.cardId,
            periodKey: bounds.periodKey,
            cycleStart: bounds.cycleStart,
            cycleEnd: bounds.cycleEnd,
            amountUsed: 0,
            amountRemaining: effectiveCredit,
            isFullyUsed: false,
          });
        }
      }

      // Get fresh usage records
      const freshUsage = await db.query.benefitUsage.findMany({
        where: eq(schema.benefitUsage.userId, uc.userId),
      });

      const usageMap = new Map<string, { amountUsed: number; creditAmount: number }>();
      for (const usage of freshUsage) {
        const benefit = cardDef.benefits.find((b) => b.id === usage.benefitId);
        if (benefit) {
          const bounds = getCurrentCycleBounds(benefit.cycle as any, now, uc.anniversaryDate);
          if (usage.periodKey === bounds.periodKey) {
            usageMap.set(benefit.id, { amountUsed: usage.amountUsed, creditAmount: benefit.creditAmount });
          }
        }
      }

      // Run matcher
      const matcherTxs = rawTxs.map((tx) => ({
        id: tx.id,
        date: tx.date,
        merchantName: tx.merchantName,
        merchantNameRaw: tx.merchantNameRaw,
        amount: tx.amount,
        plaidCategoryPrimary: tx.plaidCategoryPrimary,
        plaidCategoryDetailed: tx.plaidCategoryDetailed,
        pending: tx.pending,
        matchedStatus: tx.matchedStatus as any,
      }));

      const result = runMatcher(matcherTxs, {
        benefits: cardDef.benefits,
        usageMap,
        anniversaryDate: uc.anniversaryDate,
      });

      console.log(`  Matcher produced ${result.matches.length} matches`);

      // Track running usage and write matches
      const runningUsage = new Map<string, number>();
      for (const usage of freshUsage) {
        runningUsage.set(usage.benefitId, usage.amountUsed);
      }

      let written = 0;
      for (const match of result.matches) {
        const benefit = cardDef.benefits.find((b) => b.id === match.benefitId)!;
        const bounds = getCurrentCycleBounds(benefit.cycle as any, now, uc.anniversaryDate);
        const usageRecord = freshUsage.find(
          (u) => u.benefitId === match.benefitId && u.periodKey === bounds.periodKey
        );
        if (!usageRecord) continue;

        const effectiveCredit = benefit.carriesOver && benefit.maxAccrued ? benefit.maxAccrued : benefit.creditAmount;
        const currentUsed = runningUsage.get(benefit.id) ?? 0;
        if (currentUsed >= effectiveCredit) continue;
        const creditApplied = Math.min(match.creditApplied, effectiveCredit - currentUsed);

        await db.insert(schema.matchedTx).values({
          transactionId: match.transactionId,
          benefitUsageId: usageRecord.id,
          creditApplied,
          matchMethod: match.matchMethod,
          matchConfidence: match.matchConfidence,
        });

        const newUsed = currentUsed + creditApplied;
        runningUsage.set(benefit.id, newUsed);

        await db
          .update(schema.benefitUsage)
          .set({
            amountUsed: newUsed,
            amountRemaining: Math.max(0, effectiveCredit - newUsed),
            isFullyUsed: newUsed >= effectiveCredit,
            updatedAt: new Date(),
          })
          .where(eq(schema.benefitUsage.id, usageRecord.id));

        await db
          .update(schema.transactions)
          .set({ matchedStatus: "matched" })
          .where(eq(schema.transactions.id, match.transactionId));

        written++;
      }

      console.log(`  Wrote ${written} matches to DB`);
    }
  }

  console.log("\nDone.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Reprocess failed:", err);
  process.exit(1);
});
