import "server-only";
import { db } from "@/db";
import { eq, desc, and, gte, lt } from "drizzle-orm";
import * as schema from "@/db/schema";
import { getCardDefinition } from "@/lib/cards";
import { getCurrentCycleBounds, daysRemainingInCycle } from "@/lib/engine/cycle-utils";
import type {
  CardSummary,
  BenefitUsageSummary,
  TransactionWithMatch,
  BenefitCycle,
} from "@/lib/types";

export async function getCardSummary(
  userId: string,
  cardProfileId?: string
): Promise<CardSummary | null> {
  const cardProfile = await db.query.cardProfiles.findFirst({
    where: cardProfileId
      ? and(eq(schema.cardProfiles.userId, userId), eq(schema.cardProfiles.id, cardProfileId))
      : and(eq(schema.cardProfiles.userId, userId), eq(schema.cardProfiles.isActive, true)),
  });

  if (!cardProfile) return null;

  const cardDef = getCardDefinition(cardProfile.cardType);
  if (!cardDef) return null;

  const usageRecords = await db.query.benefitUsage.findMany({
    where: and(
      eq(schema.benefitUsage.userId, userId),
      eq(schema.benefitUsage.cardProfileId, cardProfile.id)
    ),
  });

  const now = new Date();

  // Compute card year bounds for year-to-date creditsUsed
  const cardYearBounds = getCurrentCycleBounds(
    "annual_anniversary",
    now,
    cardProfile.anniversaryDate
  );

  // Year-to-date: sum all usage within the card year
  let creditsUsed = 0;
  for (const usage of usageRecords) {
    if (
      usage.cycleStart >= cardYearBounds.cycleStart &&
      usage.cycleEnd <= cardYearBounds.cycleEnd
    ) {
      creditsUsed += usage.amountUsed;
    }
  }

  // Per-current-cycle metrics: available, expired, value at risk
  let creditsAvailable = 0;
  let creditsExpired = 0;
  let nearestExpiry: number | null = null;
  let valueAtRisk = 0;

  for (const benefit of cardDef.benefits) {
    if (benefit.type === "subscription") continue;

    const bounds = getCurrentCycleBounds(
      benefit.cycle as BenefitCycle,
      now,
      cardProfile.anniversaryDate
    );

    const usage = usageRecords.find(
      (u) => u.benefitId === benefit.id && u.periodKey === bounds.periodKey
    );

    creditsAvailable += benefit.creditAmount;

    if (usage) {
      // Check if expired
      if (bounds.cycleEnd < now && usage.amountRemaining > 0) {
        creditsExpired += usage.amountRemaining;
      }
    }

    const days = daysRemainingInCycle(
      benefit.cycle as BenefitCycle,
      now,
      cardProfile.anniversaryDate
    );

    if (nearestExpiry === null || days < nearestExpiry) {
      nearestExpiry = days;
    }

    // Value at risk: unused credits expiring within 14 days
    if (days <= 14 && usage) {
      valueAtRisk += usage.amountRemaining;
    } else if (days <= 14 && !usage) {
      valueAtRisk += benefit.creditAmount;
    }
  }

  const effectiveFee = cardDef.annualFee - creditsUsed;
  const roiPercent =
    cardDef.annualFee > 0
      ? Math.round((creditsUsed / cardDef.annualFee) * 100)
      : 0;

  // What % of the card year has elapsed (for pace-based ROI coloring)
  const yearTotal = cardYearBounds.cycleEnd.getTime() - cardYearBounds.cycleStart.getTime();
  const yearElapsed = now.getTime() - cardYearBounds.cycleStart.getTime();
  const yearProgressPct = yearTotal > 0 ? Math.round((yearElapsed / yearTotal) * 100) : 0;

  return {
    cardId: cardDef.id,
    cardName: cardDef.name,
    annualFee: cardDef.annualFee,
    creditsAvailable,
    creditsUsed,
    creditsExpired,
    effectiveFee,
    roiPercent,
    yearProgressPct,
    daysUntilNextExpiry: nearestExpiry,
    valueAtRisk,
  };
}

export interface CreditsDebugRow {
  benefitId: string;
  benefitName: string;
  cycle: string;
  periodKey: string;
  amountUsed: number;
  creditAmount: number;
  cycleStart: string;
  cycleEnd: string;
  inCardYear: boolean;
}

export interface CreditsDebugData {
  cardYearStart: string;
  cardYearEnd: string;
  rows: CreditsDebugRow[];
  creditsUsedTotal: number;
}

export async function getCreditsDebugBreakdown(
  userId: string,
  cardProfileId?: string
): Promise<CreditsDebugData | null> {
  const cardProfile = await db.query.cardProfiles.findFirst({
    where: cardProfileId
      ? and(eq(schema.cardProfiles.userId, userId), eq(schema.cardProfiles.id, cardProfileId))
      : and(eq(schema.cardProfiles.userId, userId), eq(schema.cardProfiles.isActive, true)),
  });

  if (!cardProfile) return null;

  const cardDef = getCardDefinition(cardProfile.cardType);
  if (!cardDef) return null;

  const usageRecords = await db.query.benefitUsage.findMany({
    where: and(
      eq(schema.benefitUsage.userId, userId),
      eq(schema.benefitUsage.cardProfileId, cardProfile.id)
    ),
  });

  const now = new Date();
  const cardYearBounds = getCurrentCycleBounds(
    "annual_anniversary",
    now,
    cardProfile.anniversaryDate
  );

  let creditsUsedTotal = 0;
  const rows: CreditsDebugRow[] = [];

  for (const usage of usageRecords) {
    const benefit = cardDef.benefits.find((b) => b.id === usage.benefitId);
    const inCardYear =
      usage.cycleStart >= cardYearBounds.cycleStart &&
      usage.cycleEnd <= cardYearBounds.cycleEnd;

    if (inCardYear) {
      creditsUsedTotal += usage.amountUsed;
    }

    rows.push({
      benefitId: usage.benefitId,
      benefitName: benefit?.name ?? usage.benefitId,
      cycle: benefit?.cycle ?? "unknown",
      periodKey: usage.periodKey,
      amountUsed: usage.amountUsed,
      creditAmount: benefit?.creditAmount ?? 0,
      cycleStart: usage.cycleStart.toISOString(),
      cycleEnd: usage.cycleEnd.toISOString(),
      inCardYear,
    });
  }

  rows.sort((a, b) => a.benefitName.localeCompare(b.benefitName) || a.periodKey.localeCompare(b.periodKey));

  return {
    cardYearStart: cardYearBounds.cycleStart.toISOString(),
    cardYearEnd: cardYearBounds.cycleEnd.toISOString(),
    rows,
    creditsUsedTotal,
  };
}

export async function getBenefitUsageSummaries(
  userId: string,
  cardProfileId?: string
): Promise<BenefitUsageSummary[]> {
  const cardProfile = await db.query.cardProfiles.findFirst({
    where: cardProfileId
      ? and(eq(schema.cardProfiles.userId, userId), eq(schema.cardProfiles.id, cardProfileId))
      : and(eq(schema.cardProfiles.userId, userId), eq(schema.cardProfiles.isActive, true)),
  });

  if (!cardProfile) return [];

  const cardDef = getCardDefinition(cardProfile.cardType);
  if (!cardDef) return [];

  const usageRecords = await db.query.benefitUsage.findMany({
    where: and(
      eq(schema.benefitUsage.userId, userId),
      eq(schema.benefitUsage.cardProfileId, cardProfile.id)
    ),
  });

  const now = new Date();
  const summaries: BenefitUsageSummary[] = [];

  // Compute card year bounds for YTD aggregation on monthly benefits
  const cardYearBounds = getCurrentCycleBounds(
    "annual_anniversary",
    now,
    cardProfile.anniversaryDate
  );

  for (const benefit of cardDef.benefits) {
    const bounds = getCurrentCycleBounds(
      benefit.cycle as BenefitCycle,
      now,
      cardProfile.anniversaryDate
    );

    const usage = usageRecords.find(
      (u) => u.benefitId === benefit.id && u.periodKey === bounds.periodKey
    );

    const days = daysRemainingInCycle(
      benefit.cycle as BenefitCycle,
      now,
      cardProfile.anniversaryDate
    );

    // YTD: sum all usage for this benefit within the card year
    let ytdUsed = 0;
    if (benefit.cycle === "monthly") {
      for (const u of usageRecords) {
        if (
          u.benefitId === benefit.id &&
          u.cycleStart >= cardYearBounds.cycleStart &&
          u.cycleEnd <= cardYearBounds.cycleEnd
        ) {
          ytdUsed += u.amountUsed;
        }
      }
    }

    summaries.push({
      benefitId: benefit.id,
      benefitName: benefit.name,
      icon: benefit.icon,
      category: benefit.category,
      type: benefit.type,
      cycle: benefit.cycle,
      creditAmount: benefit.creditAmount,
      amountUsed: usage?.amountUsed ?? 0,
      amountRemaining: usage?.amountRemaining ?? benefit.creditAmount,
      isFullyUsed: usage?.isFullyUsed ?? false,
      manualOverride: usage?.manualOverride ?? false,
      daysRemaining: days,
      requiresActivation: benefit.requiresActivation,
      autoMatchable: benefit.autoMatchable,
      sunsetDate: benefit.sunsetDate,
      displayGroup: benefit.displayGroup,
      displayGroupName: benefit.displayGroupName,
      displayGroupIcon: benefit.displayGroupIcon,
      details: benefit.details,
      periodKey: bounds.periodKey,
      cycleStart: bounds.cycleStart,
      cycleEnd: bounds.cycleEnd,
      ytdUsed: benefit.cycle === "monthly" ? ytdUsed : undefined,
    });
  }

  return summaries;
}

export async function getRecentTransactions(
  userId: string,
  limit = 50,
  connectionId?: string,
  offset = 0,
  dateFilter?: { year: number; month: number }
): Promise<TransactionWithMatch[]> {
  const conditions = [eq(schema.transactions.userId, userId)];
  if (connectionId) {
    conditions.push(eq(schema.transactions.plaidConnectionId, connectionId));
  }
  if (dateFilter) {
    const startDate = new Date(Date.UTC(dateFilter.year, dateFilter.month - 1, 1));
    const endDate = new Date(Date.UTC(dateFilter.year, dateFilter.month, 1));
    conditions.push(gte(schema.transactions.date, startDate));
    conditions.push(lt(schema.transactions.date, endDate));
  }

  const txs = await db.query.transactions.findMany({
    where: and(...conditions),
    orderBy: desc(schema.transactions.date),
    limit,
    offset,
    with: {
      matches: {
        with: {
          benefitUsage: {
            with: { benefit: true },
          },
        },
      },
    },
  });

  return txs.map((tx) => {
    const match = tx.matches[0];
    return {
      id: tx.id,
      date: tx.date,
      merchantName: tx.merchantName,
      amount: tx.amount,
      matchedStatus: tx.matchedStatus as any,
      matchedBenefitName: match?.benefitUsage?.benefit?.name ?? null,
      benefitId: match?.benefitUsage?.benefit?.id ?? null,
      benefitUsageId: match?.benefitUsageId ?? null,
      creditApplied: match?.creditApplied ?? null,
      matchConfidence: (match?.matchConfidence as any) ?? null,
      matchMethod: (match?.matchMethod as any) ?? null,
    };
  });
}

export interface BenefitTransaction {
  id: string;
  benefitId: string;
  date: Date;
  merchantName: string | null;
  amount: number;
  creditApplied: number;
  periodKey: string;
  matchMethod: string;
}

/**
 * Get all transactions linked to a benefit (all periods within the card year).
 * Queries matchedTx → transaction for all benefitUsage rows of this benefit.
 */
export async function getBenefitTransactions(
  userId: string,
  benefitIds: string[],
  cardProfileId?: string
): Promise<BenefitTransaction[]> {
  const cardProfile = await db.query.cardProfiles.findFirst({
    where: cardProfileId
      ? and(eq(schema.cardProfiles.userId, userId), eq(schema.cardProfiles.id, cardProfileId))
      : and(eq(schema.cardProfiles.userId, userId), eq(schema.cardProfiles.isActive, true)),
  });

  if (!cardProfile) return [];

  const cardYearBounds = getCurrentCycleBounds(
    "annual_anniversary",
    new Date(),
    cardProfile.anniversaryDate
  );

  // Get all usage records for these benefits within card year
  const usageRecords = await db.query.benefitUsage.findMany({
    where: and(
      eq(schema.benefitUsage.userId, userId),
      eq(schema.benefitUsage.cardProfileId, cardProfile.id)
    ),
    with: {
      matches: {
        with: {
          transaction: true,
        },
      },
    },
  });

  const results: BenefitTransaction[] = [];

  for (const usage of usageRecords) {
    if (!benefitIds.includes(usage.benefitId)) continue;
    if (
      usage.cycleStart < cardYearBounds.cycleStart ||
      usage.cycleEnd > cardYearBounds.cycleEnd
    ) continue;

    for (const match of usage.matches) {
      if (!match.transaction) continue;
      results.push({
        id: match.transaction.id,
        benefitId: usage.benefitId,
        date: match.transaction.date,
        merchantName: match.transaction.merchantName,
        amount: match.transaction.amount,
        creditApplied: match.creditApplied,
        periodKey: usage.periodKey,
        matchMethod: match.matchMethod,
      });
    }
  }

  results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return results;
}

export async function getPlaidConnectionStatus(userId: string, cardProfileId?: string) {
  if (cardProfileId) {
    // Look up the card profile to get its plaidConnectionId
    const cardProfile = await db.query.cardProfiles.findFirst({
      where: and(
        eq(schema.cardProfiles.userId, userId),
        eq(schema.cardProfiles.id, cardProfileId)
      ),
    });
    if (!cardProfile) return [];

    const connections = await db.query.plaidConnections.findMany({
      where: and(
        eq(schema.plaidConnections.userId, userId),
        eq(schema.plaidConnections.id, cardProfile.plaidConnectionId)
      ),
    });

    return connections.map((c) => ({
      id: c.id,
      institutionName: c.institutionName,
      accountMask: c.accountMask,
      status: c.status,
      lastSyncedAt: c.lastSyncedAt,
    }));
  }

  const connections = await db.query.plaidConnections.findMany({
    where: eq(schema.plaidConnections.userId, userId),
  });

  return connections.map((c) => ({
    id: c.id,
    institutionName: c.institutionName,
    accountMask: c.accountMask,
    status: c.status,
    lastSyncedAt: c.lastSyncedAt,
  }));
}

export async function getCardProfiles(userId: string) {
  const profiles = await db.query.cardProfiles.findMany({
    where: eq(schema.cardProfiles.userId, userId),
    with: { plaidConnection: true },
  });

  return profiles.map((cp) => {
    const cardDef = getCardDefinition(cp.cardType);
    return {
      id: cp.id,
      cardType: cp.cardType,
      name: cardDef?.name ?? cp.cardType,
      issuer: cardDef?.issuer ?? "unknown",
      annualFee: cardDef?.annualFee ?? 0,
      isActive: cp.isActive,
      connectionId: cp.plaidConnectionId,
      institutionName: cp.plaidConnection.institutionName,
      accountMask: cp.plaidConnection.accountMask,
      createdAt: cp.createdAt,
    };
  });
}

export async function getUserAnniversaryStatus(userId: string, cardProfileId?: string) {
  const cardProfile = await db.query.cardProfiles.findFirst({
    where: cardProfileId
      ? and(eq(schema.cardProfiles.userId, userId), eq(schema.cardProfiles.id, cardProfileId))
      : and(eq(schema.cardProfiles.userId, userId), eq(schema.cardProfiles.isActive, true)),
  });

  if (!cardProfile) return null;

  return {
    cardProfileId: cardProfile.id,
    cardType: cardProfile.cardType,
    anniversaryDate: cardProfile.anniversaryDate,
    anniversarySource: cardProfile.anniversarySource,
  };
}
