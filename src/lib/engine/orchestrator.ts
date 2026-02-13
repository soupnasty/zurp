import { db } from "@/db";
import { eq, and, inArray } from "drizzle-orm";
import * as schema from "@/db/schema";
import type { MatcherTransaction, MatchedStatus } from "@/lib/types";
import { runMatcher } from "./matcher";
import { detectAnniversary } from "./anniversary-detector";
import { getCurrentCycleBounds } from "./cycle-utils";
import { getCardDefinition } from "@/lib/cards";
import { generateAndPersistInsights } from "@/lib/insights/orchestrator";
import { computeAndPersistPointsSummary, clearPointsSummary } from "@/lib/points/persistence";
import { computeAndPersistSimulations, clearSimulations } from "@/lib/points/simulation-persistence";

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

  // Only attempt anniversary detection for cards with annual fees.
  // $0-fee cards (CFF, CFU) never charge a fee, so there's nothing to detect.
  if (cardProfile.anniversarySource === "pending" && cardDef.annualFee > 0) {
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

  // Ensure benefit usage records exist for current periods + transaction months
  await initializeBenefitUsage(
    connection.userId,
    cardProfile.cardType,
    cardProfile.id,
    cardProfile.anniversaryDate,
    rawTransactions.map((tx) => tx.date)
  );

  // Pre-fetch all usage records (used by overrides, matcher, match writing, and flag replay)
  const usageRecords = await db.query.benefitUsage.findMany({
    where: and(
      eq(schema.benefitUsage.userId, connection.userId),
      eq(schema.benefitUsage.cardProfileId, cardProfile.id)
    ),
  });

  // Build lookup map keyed by "benefitId:periodKey"
  const usageLookup = new Map<string, typeof usageRecords[number]>();
  for (const usage of usageRecords) {
    usageLookup.set(`${usage.benefitId}:${usage.periodKey}`, usage);
  }

  // Replay durable manual redemption overrides (before auto-matching)
  const overrides = await db.query.benefitOverrides.findMany({
    where: and(
      eq(schema.benefitOverrides.userId, connection.userId),
      eq(schema.benefitOverrides.cardProfileId, cardProfile.id)
    ),
  });

  const overrideUpdates: Promise<any>[] = [];
  for (const override of overrides) {
    const benefitDef = cardDef.benefits.find((b) => b.id === override.benefitId);
    if (!benefitDef) continue;

    const usageRecord = usageLookup.get(`${override.benefitId}:${override.periodKey}`);
    if (usageRecord && !usageRecord.isFullyUsed) {
      // Mutate in-memory so downstream code sees overridden state
      usageRecord.amountUsed = benefitDef.creditAmount;
      usageRecord.amountRemaining = 0;
      usageRecord.isFullyUsed = true;
      usageRecord.manualOverride = true;

      overrideUpdates.push(
        db
          .update(schema.benefitUsage)
          .set({
            amountUsed: benefitDef.creditAmount,
            amountRemaining: 0,
            isFullyUsed: true,
            manualOverride: true,
            updatedAt: new Date(),
          })
          .where(eq(schema.benefitUsage.id, usageRecord.id))
      );
    }
  }
  if (overrideUpdates.length > 0) {
    await Promise.all(overrideUpdates);
  }

  // Build usage map keyed by "benefitId:periodKey" — includes ALL periods
  // so cross-month transaction batches resolve against correct usage data
  const usageMap = new Map<string, number>();
  for (const usage of usageRecords) {
    usageMap.set(`${usage.benefitId}:${usage.periodKey}`, usage.amountUsed);
  }

  // Run matcher — sort transactions by date so older ones match first
  const matcherTx: MatcherTransaction[] = rawTransactions
    .map(txToMatcherTx)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

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

  // Track running usage totals per benefit+period (avoids stale reads)
  const runningUsage = new Map<string, number>();
  for (const usage of usageRecords) {
    runningUsage.set(`${usage.benefitId}:${usage.periodKey}`, usage.amountUsed);
  }

  // Build tx lookup for date-aware period resolution
  const txLookup = new Map(rawTransactions.map((tx) => [tx.id, tx]));

  // Phase 1: Process matches in-memory, collecting batch operations
  const matchedTxInserts: (typeof schema.matchedTx.$inferInsert)[] = [];
  const matchedTransactionIds: string[] = [];
  // Track final state per usage record: id → {newUsed, effectiveCredit}
  const usageFinalState = new Map<string, { newUsed: number; effectiveCredit: number }>();

  for (const match of result.matches) {
    if (removedFlagSet.has(`${match.transactionId}:${match.benefitId}`)) {
      continue;
    }

    const benefit = cardDef.benefits.find((b) => b.id === match.benefitId)!;
    const matchTx = txLookup.get(match.transactionId);
    const bounds = getCurrentCycleBounds(
      benefit.cycle as any,
      matchTx?.date ?? new Date(),
      cardProfile.anniversaryDate
    );

    const usageRecord = usageLookup.get(`${match.benefitId}:${bounds.periodKey}`);
    if (!usageRecord) continue;

    const effectiveCredit =
      benefit.carriesOver && benefit.maxAccrued
        ? benefit.maxAccrued
        : benefit.creditAmount;

    const usageKey = `${benefit.id}:${bounds.periodKey}`;
    const currentUsed = runningUsage.get(usageKey) ?? 0;
    if (currentUsed >= effectiveCredit) continue;
    const creditApplied = Math.min(match.creditApplied, effectiveCredit - currentUsed);

    matchedTxInserts.push({
      transactionId: match.transactionId,
      benefitUsageId: usageRecord.id,
      creditApplied,
      matchMethod: match.matchMethod,
      matchConfidence: match.matchConfidence,
    });
    matchedTransactionIds.push(match.transactionId);

    const newUsed = currentUsed + creditApplied;
    runningUsage.set(usageKey, newUsed);
    usageFinalState.set(usageRecord.id, { newUsed, effectiveCredit });
  }

  // Phase 2: Batch writes
  if (matchedTxInserts.length > 0) {
    await db
      .insert(schema.matchedTx)
      .values(matchedTxInserts)
      .onConflictDoNothing();
  }
  if (matchedTransactionIds.length > 0) {
    await db
      .update(schema.transactions)
      .set({ matchedStatus: "matched" as MatchedStatus })
      .where(inArray(schema.transactions.id, matchedTransactionIds));
  }
  if (usageFinalState.size > 0) {
    await Promise.all(
      Array.from(usageFinalState.entries()).map(([usageId, { newUsed, effectiveCredit }]) =>
        db
          .update(schema.benefitUsage)
          .set({
            amountUsed: newUsed,
            amountRemaining: Math.max(0, effectiveCredit - newUsed),
            isFullyUsed: newUsed >= effectiveCredit,
            updatedAt: new Date(),
          })
          .where(eq(schema.benefitUsage.id, usageId))
      )
    );
  }

  // Batch mark ambiguous transactions
  if (result.ambiguousTransactions.length > 0) {
    await db
      .update(schema.transactions)
      .set({ matchedStatus: "ambiguous" as MatchedStatus })
      .where(inArray(schema.transactions.id, result.ambiguousTransactions));
  }

  // Replay "skipped" flags — batch override ambiguous back to skipped
  const skippedFlags = await db.query.transactionFlags.findMany({
    where: and(
      eq(schema.transactionFlags.userId, connection.userId),
      eq(schema.transactionFlags.flagType, "skipped")
    ),
  });

  const skippedTxIds = skippedFlags.map((f) => f.transactionId);
  if (skippedTxIds.length > 0) {
    await db
      .update(schema.transactions)
      .set({ matchedStatus: "skipped" as MatchedStatus })
      .where(
        and(
          inArray(schema.transactions.id, skippedTxIds),
          eq(schema.transactions.matchedStatus, "ambiguous")
        )
      );
  }

  // Replay "added" flags — recreate manual matches that survived reprocessing
  const addedFlags = await db.query.transactionFlags.findMany({
    where: and(
      eq(schema.transactionFlags.userId, connection.userId),
      eq(schema.transactionFlags.flagType, "added")
    ),
  });

  if (addedFlags.length > 0) {
    // Bulk pre-fetch: existing matchedTx for relevant usage records
    const flagUsageIds = new Set<string>();
    const flagTxIds = new Set<string>();
    const flagBoundsMap = new Map<string, ReturnType<typeof getCurrentCycleBounds>>();

    for (const flag of addedFlags) {
      const benefitDef = cardDef.benefits.find((b) => b.id === flag.benefitId);
      if (!benefitDef) continue;

      const bounds = getCurrentCycleBounds(
        benefitDef.cycle as any,
        new Date(),
        cardProfile.anniversaryDate
      );
      flagBoundsMap.set(flag.id, bounds);

      const usageRecord = usageLookup.get(`${flag.benefitId}:${bounds.periodKey}`);
      if (usageRecord) {
        flagUsageIds.add(usageRecord.id);
        flagTxIds.add(flag.transactionId);
      }
    }

    // Bulk fetch existing matches and transactions
    const [existingMatches, flagTransactions] = await Promise.all([
      flagUsageIds.size > 0
        ? db.query.matchedTx.findMany({
            where: inArray(schema.matchedTx.benefitUsageId, Array.from(flagUsageIds)),
          })
        : Promise.resolve([]),
      flagTxIds.size > 0
        ? db.query.transactions.findMany({
            where: inArray(schema.transactions.id, Array.from(flagTxIds)),
          })
        : Promise.resolve([]),
    ]);

    const existingMatchSet = new Set(
      existingMatches.map((m) => `${m.transactionId}:${m.benefitUsageId}`)
    );
    const flagTxMap = new Map(flagTransactions.map((tx) => [tx.id, tx]));

    // Process in-memory, tracking running usage across flags
    const flagMatchInserts: (typeof schema.matchedTx.$inferInsert)[] = [];
    const flagMatchedTxIds: string[] = [];
    const flagUsageUpdates = new Map<string, { newUsed: number; effectiveCredit: number }>();

    for (const flag of addedFlags) {
      const benefitDef = cardDef.benefits.find((b) => b.id === flag.benefitId);
      if (!benefitDef) continue;

      const bounds = flagBoundsMap.get(flag.id);
      if (!bounds) continue;

      const usageRecord = usageLookup.get(`${flag.benefitId}:${bounds.periodKey}`);
      if (!usageRecord) continue;

      if (existingMatchSet.has(`${flag.transactionId}:${usageRecord.id}`)) continue;

      const tx = flagTxMap.get(flag.transactionId);
      if (!tx) continue;

      const effectiveCredit =
        benefitDef.carriesOver && benefitDef.maxAccrued
          ? benefitDef.maxAccrued
          : benefitDef.creditAmount;

      // Use running total from earlier phases (auto-match may have updated it)
      const usageKey = `${benefitDef.id}:${bounds.periodKey}`;
      const currentUsed = runningUsage.get(usageKey) ?? usageRecord.amountUsed;
      const remaining = Math.max(0, effectiveCredit - currentUsed);

      const creditApplied = Math.min(tx.amount, remaining);
      if (creditApplied <= 0) continue;

      flagMatchInserts.push({
        transactionId: flag.transactionId,
        benefitUsageId: usageRecord.id,
        creditApplied,
        matchMethod: "manual",
        matchConfidence: "high",
      });
      flagMatchedTxIds.push(flag.transactionId);

      const newUsed = currentUsed + creditApplied;
      runningUsage.set(usageKey, newUsed);
      flagUsageUpdates.set(usageRecord.id, { newUsed, effectiveCredit });
    }

    // Batch writes
    if (flagMatchInserts.length > 0) {
      await db
        .insert(schema.matchedTx)
        .values(flagMatchInserts)
        .onConflictDoNothing();
    }
    if (flagMatchedTxIds.length > 0) {
      await db
        .update(schema.transactions)
        .set({ matchedStatus: "matched" as MatchedStatus })
        .where(inArray(schema.transactions.id, flagMatchedTxIds));
    }
    if (flagUsageUpdates.size > 0) {
      await Promise.all(
        Array.from(flagUsageUpdates.entries()).map(([usageId, { newUsed, effectiveCredit }]) =>
          db
            .update(schema.benefitUsage)
            .set({
              amountUsed: newUsed,
              amountRemaining: Math.max(0, effectiveCredit - newUsed),
              isFullyUsed: newUsed >= effectiveCredit,
              updatedAt: new Date(),
            })
            .where(eq(schema.benefitUsage.id, usageId))
        )
      );
    }
  }

  // Compute and persist points earning summary
  try {
    await computeAndPersistPointsSummary(
      connection.userId,
      cardProfile.id,
      cardProfile.cardType,
      cardProfile.anniversaryDate
    );
  } catch (err) {
    console.error("Points summary failed:", err);
  }

  // Precompute card simulations (6 cards × 2 portal modes)
  try {
    await computeAndPersistSimulations(
      connection.userId,
      cardProfile.id,
      cardProfile.anniversaryDate
    );
  } catch (err) {
    console.error("Card simulations failed:", err);
  }

  // Generate insights after all matches are written
  try {
    await generateAndPersistInsights(connection.userId);
  } catch (err) {
    console.error("Insight generation failed:", err);
    // Non-fatal: don't block transaction processing
  }

  // Write debug transaction report (dev only, tree-shaken in production)
  if (process.env.NODE_ENV === "development") {
    try {
      const { writeDebugReport } = await import("./debug-report");
      await writeDebugReport(plaidConnectionId);
    } catch (err) {
      console.error("Debug report failed:", err);
    }
  }
}

/**
 * Initialize benefit usage records for current period + any periods
 * that have unmatched transactions (so cross-month matching works).
 */
export async function initializeBenefitUsage(
  userId: string,
  cardType: string,
  cardProfileId: string,
  anniversaryDate: Date | null,
  transactionDates?: Date[]
) {
  const cardDef = getCardDefinition(cardType);
  if (!cardDef) return;

  // Collect one reference date per (year, month) — current + transaction months
  const refDates = new Map<string, Date>();
  const now = new Date();
  refDates.set(`${now.getFullYear()}-${now.getMonth()}`, now);
  if (transactionDates) {
    for (const d of transactionDates) {
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!refDates.has(key)) refDates.set(key, d);
    }
  }

  // Pre-compute all needed usage records, deduplicating by benefitId:periodKey
  const usageInserts = new Map<string, typeof schema.benefitUsage.$inferInsert>();

  for (const benefit of cardDef.benefits) {
    if (benefit.type === "subscription") continue;

    for (const [, refDate] of refDates) {
      if (benefit.activeMonths && !benefit.activeMonths.includes(refDate.getMonth())) {
        continue;
      }

      const bounds = getCurrentCycleBounds(
        benefit.cycle as any,
        refDate,
        anniversaryDate
      );

      const dedupKey = `${benefit.id}:${bounds.periodKey}`;
      if (usageInserts.has(dedupKey)) continue;

      const effectiveCredit =
        benefit.carriesOver && benefit.maxAccrued
          ? benefit.maxAccrued
          : benefit.creditAmount;

      usageInserts.set(dedupKey, {
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

  // Single bulk insert — unique constraint (userId, benefitId, periodKey) handles dedup
  const insertValues = Array.from(usageInserts.values());
  if (insertValues.length > 0) {
    await db
      .insert(schema.benefitUsage)
      .values(insertValues)
      .onConflictDoNothing();
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

  // Clear points summary and simulations for this card profile
  await clearPointsSummary(cardProfileId);
  await clearSimulations(cardProfileId);

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

  const usageIds = usageRecords.map((u) => u.id);
  if (usageIds.length > 0) {
    await db
      .delete(schema.matchedTx)
      .where(inArray(schema.matchedTx.benefitUsageId, usageIds));
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
