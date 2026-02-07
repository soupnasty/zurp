import { db } from "@/db";
import { eq, and, inArray } from "drizzle-orm";
import * as schema from "@/db/schema";
import type { MatcherTransaction, BenefitDefinition, MatchedStatus } from "@/lib/types";
import { runMatcher } from "./matcher";
import { detectAnniversary } from "./anniversary-detector";
import { getCurrentCycleBounds } from "./cycle-utils";
import { getCardDefinition } from "@/lib/cards";

/**
 * Process new transactions for a Plaid connection.
 * Reads from DB, runs the matching engine, and writes results.
 */
export async function processTransactionsForConnection(
  plaidConnectionId: string
) {
  // Get the connection and related data
  const connection = await db.query.plaidConnections.findFirst({
    where: eq(schema.plaidConnections.id, plaidConnectionId),
    with: {
      userCard: true,
    },
  });

  if (!connection) throw new Error(`Connection ${plaidConnectionId} not found`);

  const userCard = connection.userCard;
  if (!userCard) throw new Error(`Connection ${plaidConnectionId} has no linked card`);

  const cardDef = getCardDefinition(userCard.cardId);
  if (!cardDef) throw new Error(`Card definition ${userCard.cardId} not found`);

  // Fetch unmatched transactions for this connection
  const rawTransactions = await db.query.transactions.findMany({
    where: and(
      eq(schema.transactions.plaidConnectionId, plaidConnectionId),
      eq(schema.transactions.matchedStatus, "unmatched")
    ),
  });

  if (rawTransactions.length === 0) return;

  // Run anniversary detection
  const allTransactions = await db.query.transactions.findMany({
    where: eq(schema.transactions.plaidConnectionId, plaidConnectionId),
  });

  const txForDetection: MatcherTransaction[] = allTransactions.map(txToMatcherTx);

  if (userCard.anniversarySource === "pending") {
    const detection = detectAnniversary(
      txForDetection,
      cardDef.annualFee,
      cardDef.feeDescriptor
    );

    if (detection.detected && detection.anniversaryDate && detection.transactionId) {
      await db
        .update(schema.userCards)
        .set({
          anniversaryDate: detection.anniversaryDate,
          anniversarySource: "auto_detected",
        })
        .where(eq(schema.userCards.id, userCard.id));

      await db
        .update(schema.transactions)
        .set({ isAnnualFee: true })
        .where(eq(schema.transactions.id, detection.transactionId));

      userCard.anniversaryDate = detection.anniversaryDate;
    }
  }

  // Ensure benefit usage records exist for current periods
  await initializeBenefitUsage(
    connection.userId,
    userCard.cardId,
    userCard.anniversaryDate
  );

  // Get current usage
  const usageRecords = await db.query.benefitUsage.findMany({
    where: eq(schema.benefitUsage.userId, connection.userId),
  });

  const usageMap = new Map<string, { amountUsed: number; creditAmount: number }>();
  for (const usage of usageRecords) {
    const benefit = cardDef.benefits.find((b) => b.id === usage.benefitId);
    if (benefit) {
      // Only include current period usage
      const currentBounds = getCurrentCycleBounds(
        benefit.cycle as any,
        new Date(),
        userCard.anniversaryDate
      );
      if (usage.periodKey === currentBounds.periodKey) {
        usageMap.set(benefit.id, {
          amountUsed: usage.amountUsed,
          creditAmount: benefit.creditAmount,
        });
      }
    }
  }

  // Run matcher
  const matcherTx: MatcherTransaction[] = rawTransactions.map(txToMatcherTx);

  const result = runMatcher(matcherTx, {
    benefits: cardDef.benefits,
    usageMap,
    anniversaryDate: userCard.anniversaryDate,
  });

  // Fetch removed flags for this user to skip flagged-out matches
  const removedFlags = await db.query.transactionFlags.findMany({
    where: and(
      eq(schema.transactionFlags.userId, connection.userId),
      eq(schema.transactionFlags.flagType, "removed")
    ),
  });

  const removedFlagSet = new Set(
    removedFlags.map((f) => `${f.transactionId}:${f.benefitId}`)
  );

  // Write matches to DB
  for (const match of result.matches) {
    // Skip if user has a removed flag for this transaction+benefit pair
    if (removedFlagSet.has(`${match.transactionId}:${match.benefitId}`)) {
      continue;
    }
    // Find the benefit usage record for this benefit's current period
    const benefit = cardDef.benefits.find((b) => b.id === match.benefitId)!;
    const bounds = getCurrentCycleBounds(
      benefit.cycle as any,
      new Date(),
      userCard.anniversaryDate
    );

    const usageRecord = usageRecords.find(
      (u) => u.benefitId === match.benefitId && u.periodKey === bounds.periodKey
    );

    if (!usageRecord) continue;

    // Create matched_tx record
    await db.insert(schema.matchedTx).values({
      transactionId: match.transactionId,
      benefitUsageId: usageRecord.id,
      creditApplied: match.creditApplied,
      matchMethod: match.matchMethod,
      matchConfidence: match.matchConfidence,
    });

    // Update benefit usage
    const newUsed = usageRecord.amountUsed + match.creditApplied;
    const effectiveCredit =
      benefit.carriesOver && benefit.maxAccrued
        ? benefit.maxAccrued
        : benefit.creditAmount;

    await db
      .update(schema.benefitUsage)
      .set({
        amountUsed: newUsed,
        amountRemaining: Math.max(0, effectiveCredit - newUsed),
        isFullyUsed: newUsed >= effectiveCredit,
        updatedAt: new Date(),
      })
      .where(eq(schema.benefitUsage.id, usageRecord.id));

    // Update transaction matched status
    await db
      .update(schema.transactions)
      .set({ matchedStatus: "matched" as MatchedStatus })
      .where(eq(schema.transactions.id, match.transactionId));
  }

  // Mark ambiguous transactions
  for (const txId of result.ambiguousTransactions) {
    await db
      .update(schema.transactions)
      .set({ matchedStatus: "ambiguous" as MatchedStatus })
      .where(eq(schema.transactions.id, txId));
  }
}

/**
 * Initialize benefit usage records for all current-period benefits.
 */
export async function initializeBenefitUsage(
  userId: string,
  cardId: string,
  anniversaryDate: Date | null
) {
  const cardDef = getCardDefinition(cardId);
  if (!cardDef) return;

  for (const benefit of cardDef.benefits) {
    if (benefit.type === "subscription") continue;

    const bounds = getCurrentCycleBounds(
      benefit.cycle as any,
      new Date(),
      anniversaryDate
    );

    // Check if record already exists
    const existing = await db.query.benefitUsage.findFirst({
      where: and(
        eq(schema.benefitUsage.userId, userId),
        eq(schema.benefitUsage.benefitId, benefit.id),
        eq(schema.benefitUsage.periodKey, bounds.periodKey)
      ),
    });

    if (!existing) {
      const effectiveCredit =
        benefit.carriesOver && benefit.maxAccrued
          ? benefit.maxAccrued
          : benefit.creditAmount;

      await db.insert(schema.benefitUsage).values({
        userId,
        benefitId: benefit.id,
        cardId,
        periodKey: bounds.periodKey,
        cycleStart: bounds.cycleStart,
        cycleEnd: bounds.cycleEnd,
        amountUsed: 0,
        amountRemaining: effectiveCredit,
        isFullyUsed: false,
        carriedFrom: null,
        carriedAmount: 0,
      });
    }
  }
}

/**
 * Reprocess all transactions for a user card (e.g., when anniversary date changes).
 */
export async function reprocessAllTransactions(userCardId: string) {
  const userCard = await db.query.userCards.findFirst({
    where: eq(schema.userCards.id, userCardId),
  });

  if (!userCard) return;

  const connections = await db.query.plaidConnections.findMany({
    where: eq(schema.plaidConnections.userCardId, userCardId),
  });

  // Reset all matched transactions to unmatched
  for (const conn of connections) {
    await db
      .update(schema.transactions)
      .set({ matchedStatus: "unmatched" as MatchedStatus })
      .where(eq(schema.transactions.plaidConnectionId, conn.id));
  }

  // Clear existing matches and usage
  const usageRecords = await db.query.benefitUsage.findMany({
    where: eq(schema.benefitUsage.userId, userCard.userId),
  });

  for (const usage of usageRecords) {
    await db
      .delete(schema.matchedTx)
      .where(eq(schema.matchedTx.benefitUsageId, usage.id));
  }

  await db
    .delete(schema.benefitUsage)
    .where(eq(schema.benefitUsage.userId, userCard.userId));

  // Re-run processing for each connection
  for (const conn of connections) {
    await processTransactionsForConnection(conn.id);
  }
}

function txToMatcherTx(tx: typeof schema.transactions.$inferSelect): MatcherTransaction {
  return {
    id: tx.id,
    date: tx.date,
    merchantName: tx.merchantName,
    merchantNameRaw: tx.merchantNameRaw,
    amount: tx.amount,
    plaidCategoryPrimary: tx.plaidCategoryPrimary,
    plaidCategoryDetailed: tx.plaidCategoryDetailed,
    pending: tx.pending,
    matchedStatus: tx.matchedStatus as any,
  };
}
