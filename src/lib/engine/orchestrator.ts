import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import * as schema from "@/db/schema";
import type { MatcherTransaction, MatchedStatus } from "@/lib/types";
import { runMatcher } from "./matcher";
import { detectAnniversary } from "./anniversary-detector";
import { getCurrentCycleBounds } from "./cycle-utils";
import { getCardDefinition } from "@/lib/cards";
import { generateAndPersistInsights } from "@/lib/insights/orchestrator";

/**
 * Process new transactions for a Plaid connection.
 * Reads from DB, runs the matching engine, and writes results.
 */
export async function processTransactionsForConnection(
  plaidConnectionId: string
) {
  // Get the connection
  const connection = await db.query.plaidConnections.findFirst({
    where: eq(schema.plaidConnections.id, plaidConnectionId),
  });

  if (!connection) throw new Error(`Connection ${plaidConnectionId} not found`);

  // Find the active card profile for this connection
  const cardProfile = await db.query.cardProfiles.findFirst({
    where: and(
      eq(schema.cardProfiles.plaidConnectionId, plaidConnectionId),
      eq(schema.cardProfiles.isActive, true)
    ),
  });

  if (!cardProfile) throw new Error(`Connection ${plaidConnectionId} has no active card profile`);

  const cardDef = getCardDefinition(cardProfile.cardType);
  if (!cardDef) throw new Error(`Card definition ${cardProfile.cardType} not found`);

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

  if (cardProfile.anniversarySource === "pending") {
    const detection = detectAnniversary(
      txForDetection,
      cardDef.annualFee,
      cardDef.feeDescriptor
    );

    if (detection.detected && detection.anniversaryDate && detection.transactionId) {
      await db
        .update(schema.cardProfiles)
        .set({
          anniversaryDate: detection.anniversaryDate,
          anniversarySource: "auto_detected",
        })
        .where(eq(schema.cardProfiles.id, cardProfile.id));

      await db
        .update(schema.transactions)
        .set({ isAnnualFee: true })
        .where(eq(schema.transactions.id, detection.transactionId));

      cardProfile.anniversaryDate = detection.anniversaryDate;
    }
  }

  // Ensure benefit usage records exist for current periods
  await initializeBenefitUsage(
    connection.userId,
    cardProfile.cardType,
    cardProfile.id,
    cardProfile.anniversaryDate
  );

  // Replay durable manual redemption overrides (before auto-matching)
  const overrides = await db.query.benefitOverrides.findMany({
    where: and(
      eq(schema.benefitOverrides.userId, connection.userId),
      eq(schema.benefitOverrides.cardProfileId, cardProfile.id)
    ),
  });

  for (const override of overrides) {
    // Only replay if this benefit exists in the current card definition
    const benefitDef = cardDef.benefits.find((b) => b.id === override.benefitId);
    if (!benefitDef) continue;

    const usageRecord = await db.query.benefitUsage.findFirst({
      where: and(
        eq(schema.benefitUsage.userId, connection.userId),
        eq(schema.benefitUsage.benefitId, override.benefitId),
        eq(schema.benefitUsage.periodKey, override.periodKey)
      ),
    });

    if (usageRecord && !usageRecord.isFullyUsed) {
      await db
        .update(schema.benefitUsage)
        .set({
          amountUsed: benefitDef.creditAmount,
          amountRemaining: 0,
          isFullyUsed: true,
          manualOverride: true,
          updatedAt: new Date(),
        })
        .where(eq(schema.benefitUsage.id, usageRecord.id));
    }
  }

  // Get current usage
  const usageRecords = await db.query.benefitUsage.findMany({
    where: and(
      eq(schema.benefitUsage.userId, connection.userId),
      eq(schema.benefitUsage.cardProfileId, cardProfile.id)
    ),
  });

  const usageMap = new Map<string, { amountUsed: number; creditAmount: number }>();
  for (const usage of usageRecords) {
    const benefit = cardDef.benefits.find((b) => b.id === usage.benefitId);
    if (benefit) {
      // Only include current period usage
      const currentBounds = getCurrentCycleBounds(
        benefit.cycle as any,
        new Date(),
        cardProfile.anniversaryDate
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
    anniversaryDate: cardProfile.anniversaryDate,
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

  // Track running usage totals per benefit (avoids stale reads)
  const runningUsage = new Map<string, number>();
  for (const usage of usageRecords) {
    runningUsage.set(usage.benefitId, usage.amountUsed);
  }

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
      cardProfile.anniversaryDate
    );

    const usageRecord = usageRecords.find(
      (u) => u.benefitId === match.benefitId && u.periodKey === bounds.periodKey
    );

    if (!usageRecord) continue;

    const effectiveCredit =
      benefit.carriesOver && benefit.maxAccrued
        ? benefit.maxAccrued
        : benefit.creditAmount;

    // Cap creditApplied at remaining credit for this benefit
    const currentUsed = runningUsage.get(benefit.id) ?? 0;
    if (currentUsed >= effectiveCredit) continue; // Benefit already full
    const creditApplied = Math.min(match.creditApplied, effectiveCredit - currentUsed);

    // Create matched_tx record
    await db.insert(schema.matchedTx).values({
      transactionId: match.transactionId,
      benefitUsageId: usageRecord.id,
      creditApplied,
      matchMethod: match.matchMethod,
      matchConfidence: match.matchConfidence,
    });

    // Update running total and persist to DB
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

  // Replay "added" flags — recreate manual matches that survived reprocessing
  const addedFlags = await db.query.transactionFlags.findMany({
    where: and(
      eq(schema.transactionFlags.userId, connection.userId),
      eq(schema.transactionFlags.flagType, "added")
    ),
  });

  for (const flag of addedFlags) {
    // Only replay if this benefit exists in the current card definition
    const benefitDef = cardDef.benefits.find((b) => b.id === flag.benefitId);
    if (!benefitDef) continue;

    const bounds = getCurrentCycleBounds(
      benefitDef.cycle as any,
      new Date(),
      cardProfile.anniversaryDate
    );

    // Re-fetch usage record (may have been updated by auto-matcher or overrides)
    const usageRecord = await db.query.benefitUsage.findFirst({
      where: and(
        eq(schema.benefitUsage.userId, connection.userId),
        eq(schema.benefitUsage.benefitId, flag.benefitId),
        eq(schema.benefitUsage.periodKey, bounds.periodKey)
      ),
    });

    if (!usageRecord) continue;

    // Check if a matchedTx already exists for this pair (auto-matcher may have handled it)
    const existingMatch = await db.query.matchedTx.findFirst({
      where: and(
        eq(schema.matchedTx.transactionId, flag.transactionId),
        eq(schema.matchedTx.benefitUsageId, usageRecord.id)
      ),
    });

    if (existingMatch) continue;

    // Get the transaction to determine credit amount
    const tx = await db.query.transactions.findFirst({
      where: eq(schema.transactions.id, flag.transactionId),
    });

    if (!tx) continue;

    const creditApplied = Math.min(tx.amount, usageRecord.amountRemaining);
    if (creditApplied <= 0) continue;

    // Create manual match
    await db.insert(schema.matchedTx).values({
      transactionId: flag.transactionId,
      benefitUsageId: usageRecord.id,
      creditApplied,
      matchMethod: "manual",
      matchConfidence: "high",
    });

    // Update usage
    const newUsed = usageRecord.amountUsed + creditApplied;
    const effectiveCredit =
      benefitDef.carriesOver && benefitDef.maxAccrued
        ? benefitDef.maxAccrued
        : benefitDef.creditAmount;

    await db
      .update(schema.benefitUsage)
      .set({
        amountUsed: newUsed,
        amountRemaining: Math.max(0, effectiveCredit - newUsed),
        isFullyUsed: newUsed >= effectiveCredit,
        updatedAt: new Date(),
      })
      .where(eq(schema.benefitUsage.id, usageRecord.id));

    // Update transaction status
    await db
      .update(schema.transactions)
      .set({ matchedStatus: "matched" as MatchedStatus })
      .where(eq(schema.transactions.id, flag.transactionId));
  }

  // Generate insights after all matches are written
  try {
    await generateAndPersistInsights(connection.userId);
  } catch (err) {
    console.error("Insight generation failed:", err);
    // Non-fatal: don't block transaction processing
  }
}

/**
 * Initialize benefit usage records for all current-period benefits.
 */
export async function initializeBenefitUsage(
  userId: string,
  cardType: string,
  cardProfileId: string,
  anniversaryDate: Date | null
) {
  const cardDef = getCardDefinition(cardType);
  if (!cardDef) return;

  for (const benefit of cardDef.benefits) {
    if (benefit.type === "subscription") continue;

    // Skip benefits that aren't active in the current month
    if (benefit.activeMonths && !benefit.activeMonths.includes(new Date().getMonth())) {
      continue;
    }

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
        cardProfileId,
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
 * Reprocess all transactions for a card profile (e.g., when anniversary date changes).
 */
export async function reprocessAllTransactions(cardProfileId: string) {
  const cardProfile = await db.query.cardProfiles.findFirst({
    where: eq(schema.cardProfiles.id, cardProfileId),
  });

  if (!cardProfile) return;

  const connectionId = cardProfile.plaidConnectionId;

  // Reset all matched transactions to unmatched
  await db
    .update(schema.transactions)
    .set({ matchedStatus: "unmatched" as MatchedStatus })
    .where(eq(schema.transactions.plaidConnectionId, connectionId));

  // Clear existing matches and usage
  const usageRecords = await db.query.benefitUsage.findMany({
    where: and(
      eq(schema.benefitUsage.userId, cardProfile.userId),
      eq(schema.benefitUsage.cardProfileId, cardProfileId)
    ),
  });

  for (const usage of usageRecords) {
    await db
      .delete(schema.matchedTx)
      .where(eq(schema.matchedTx.benefitUsageId, usage.id));
  }

  await db
    .delete(schema.benefitUsage)
    .where(and(
      eq(schema.benefitUsage.userId, cardProfile.userId),
      eq(schema.benefitUsage.cardProfileId, cardProfileId)
    ));

  // Re-run processing for the connection
  await processTransactionsForConnection(connectionId);
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
