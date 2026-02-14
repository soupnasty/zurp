import "server-only";
import { cache } from "react";
import { db } from "@/db";
import { eq, desc, and, gte, lt } from "drizzle-orm";
import * as schema from "@/db/schema";
import { getCardDefinition } from "@/lib/cards";
import { getCurrentCycleBounds, daysRemainingInCycle } from "@/lib/engine/cycle-utils";
import { getEarnConfig } from "@/lib/points/earn-configs";
import type {
  CardSummary,
  BenefitUsageSummary,
  TransactionWithMatch,
  BenefitCycle,
  CycleBounds,
} from "@/lib/types";

export async function getCardSummary(
  userId: string,
  cardProfileId?: string
): Promise<CardSummary | null> {
  const cardProfile = await getActiveCardProfile(userId, cardProfileId);
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
    if (isUsageInCardYear(usage, cardYearBounds)) {
      creditsUsed += usage.amountUsed;
    }
  }

  let creditsAvailable = 0;

  // Fetch activation overrides for subscription benefits
  const activationOverrides = await db.query.benefitOverrides.findMany({
    where: and(
      eq(schema.benefitOverrides.userId, userId),
      eq(schema.benefitOverrides.overrideType, "activated")
    ),
  });

  // Add activated subscription value to creditsUsed and creditsAvailable
  for (const benefit of cardDef.benefits) {
    if (benefit.type !== "subscription" || benefit.creditAmount <= 0) continue;

    const activation = activationOverrides.find(
      (o) => o.benefitId === benefit.id
    );
    if (!activation) continue;

    const activationDate = parseActivationDate(activation.periodKey);
    if (!activationDate) continue;

    // Determine sunset date
    const sunsetDate = benefit.sunsetDate
      ? new Date(benefit.sunsetDate + "T00:00:00Z")
      : null;

    // Elapsed months: from max(activationDate, cardYearStart) to min(now, sunsetDate, cardYearEnd)
    const rangeStart = activationDate > cardYearBounds.cycleStart
      ? activationDate
      : cardYearBounds.cycleStart;
    const rangeEndCandidates = [now, cardYearBounds.cycleEnd];
    if (sunsetDate) rangeEndCandidates.push(sunsetDate);
    const rangeEnd = new Date(Math.min(...rangeEndCandidates.map((d) => d.getTime())));

    if (rangeEnd < rangeStart) continue;

    // +1 because the activation month itself counts (subscription is active that month)
    const monthsElapsed = countFullMonths(rangeStart, rangeEnd) + 1;
    creditsUsed += benefit.creditAmount * monthsElapsed;

    // Total months for creditsAvailable: from max(activationDate, cardYearStart) to min(sunsetDate, cardYearEnd)
    const totalEndCandidates = [cardYearBounds.cycleEnd];
    if (sunsetDate) totalEndCandidates.push(sunsetDate);
    const totalEnd = new Date(Math.min(...totalEndCandidates.map((d) => d.getTime())));

    if (totalEnd > rangeStart) {
      const totalMonths = countFullMonths(rangeStart, totalEnd);
      creditsAvailable += benefit.creditAmount * totalMonths;
    }
  }

  // Per-current-cycle metrics: available, expired, value at risk
  // Note: This includes all non-subscription benefits in the current cycle,
  // regardless of whether they are autoMatchable or require manual activation.
  let creditsExpired = 0;
  let nearestExpiry: number | null = null;
  let valueAtRisk = 0;

  for (const benefit of cardDef.benefits) {
    if (benefit.type === "subscription") continue;

    // Skip benefits not active in the current month (e.g., Amex Platinum Uber Cash)
    if (benefit.activeMonths && !benefit.activeMonths.includes(now.getMonth())) continue;

    const bounds = getCurrentCycleBounds(
      benefit.cycle as BenefitCycle,
      now,
      cardProfile.anniversaryDate
    );

    const usage = usageRecords.find(
      (u) => u.benefitId === benefit.id && u.periodKey === bounds.periodKey
    );

    // Add the benefit's creditAmount to available (includes both autoMatchable and manual benefits)
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

  // Fetch points earning summary
  const pointsSummary = await db.query.pointsEarningSummary.findFirst({
    where: and(
      eq(schema.pointsEarningSummary.userId, userId),
      eq(schema.pointsEarningSummary.cardProfileId, cardProfile.id),
      eq(schema.pointsEarningSummary.periodType, "anniversary_year")
    ),
  });

  const earnConfig = getEarnConfig(cardProfile.cardType);
  const pointsEarned = pointsSummary?.totalPoints ?? null;
  const pointsValueConservative = pointsSummary?.valueConservative ?? null;
  const pointsValueUpside = pointsSummary?.valueUpside ?? null;
  const conservativeCpp = earnConfig?.valuation.conservativeCpp ?? null;
  const netValue =
    pointsValueConservative !== null
      ? creditsUsed + pointsValueConservative - cardDef.annualFee
      : creditsUsed - cardDef.annualFee;

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
    pointsEarned,
    pointsValueConservative,
    pointsValueUpside,
    conservativeCpp,
    netValue,
  };
}

export async function getBenefitUsageSummaries(
  userId: string,
  cardProfileId?: string
): Promise<BenefitUsageSummary[]> {
  const cardProfile = await getActiveCardProfile(userId, cardProfileId);
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

  // Fetch activation overrides for subscription benefits
  const activationOverrides = await db.query.benefitOverrides.findMany({
    where: and(
      eq(schema.benefitOverrides.userId, userId),
      eq(schema.benefitOverrides.overrideType, "activated")
    ),
  });

  for (const benefit of cardDef.benefits) {
    // Skip benefits not active in the current month
    if (benefit.activeMonths && !benefit.activeMonths.includes(now.getMonth())) {
      continue;
    }

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
    let ytdUsed: number | undefined;
    if (benefit.cycle === "monthly") {
      ytdUsed = 0;
      for (const u of usageRecords) {
        if (
          u.benefitId === benefit.id &&
          isUsageInCardYear(u, cardYearBounds)
        ) {
          ytdUsed += u.amountUsed;
        }
      }
    }

    // Resolve activation state for subscription benefits
    let isActivated: boolean | undefined;
    let activatedAt: string | null | undefined;

    if (benefit.type === "subscription") {
      const activation = activationOverrides.find(
        (o) => o.benefitId === benefit.id
      );
      isActivated = !!activation;
      if (activation) {
        const activationDate = parseActivationDate(activation.periodKey);
        if (activationDate) {
          activatedAt = activationDate.toISOString();

          // Compute YTD for activated subscriptions using card year bounds
          // +1 because the activation month itself counts
          const rangeStart = activationDate > cardYearBounds.cycleStart
            ? activationDate
            : cardYearBounds.cycleStart;
          if (now >= rangeStart) {
            ytdUsed = benefit.creditAmount * (countFullMonths(rangeStart, now) + 1);
          } else {
            ytdUsed = 0;
          }
        } else {
          activatedAt = null;
        }
      } else {
        activatedAt = null;
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
      merchantPatterns: benefit.merchantPatterns,
      plaidCategories: benefit.plaidCategories,
      sunsetDate: benefit.sunsetDate,
      displayGroup: benefit.displayGroup,
      displayGroupName: benefit.displayGroupName,
      displayGroupIcon: benefit.displayGroupIcon,
      details: benefit.details,
      periodKey: bounds.periodKey,
      cycleStart: bounds.cycleStart,
      cycleEnd: bounds.cycleEnd,
      ytdUsed,
      isActivated,
      activatedAt,
      activeMonths: benefit.activeMonths,
      brandSlug: benefit.brandSlug,
    });
  }

  return summaries;
}

export async function getRecentTransactions(
  userId: string,
  limit = 50,
  connectionId?: string,
  offset = 0,
  dateFilter?: { year: number; month: number },
  options?: { excludeCategories?: string[] }
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

  const excluded = options?.excludeCategories?.length
    ? new Set(options.excludeCategories)
    : null;

  return txs.filter((tx) => {
    if (excluded && tx.plaidCategoryPrimary && excluded.has(tx.plaidCategoryPrimary)) return false;
    return true;
  }).map((tx) => {
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
      plaidCategoryPrimary: tx.plaidCategoryPrimary ?? null,
      plaidCategoryDetailed: tx.plaidCategoryDetailed ?? null,
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
  const cardProfile = await getActiveCardProfile(userId, cardProfileId);
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
    if (!isUsageInCardYear(usage, cardYearBounds)) continue;

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

export const getCardProfiles = cache(async function getCardProfiles(userId: string) {
  const profiles = await db.query.cardProfiles.findMany({
    where: eq(schema.cardProfiles.userId, userId),
    with: { plaidConnection: true },
    orderBy: (cp, { asc }) => [asc(cp.createdAt)],
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
      connectionStatus: cp.plaidConnection?.status ?? null,
      syncStatus: (cp.plaidConnection?.syncStatus ?? "pending") as "pending" | "initial" | "complete",
      lastSyncedAt: cp.plaidConnection?.lastSyncedAt ?? null,
      institutionName: cp.plaidConnection.institutionName,
      accountMask: cp.plaidConnection.accountMask,
      createdAt: cp.createdAt,
      anniversaryDate: cp.anniversaryDate,
      anniversarySource: cp.anniversarySource,
    };
  });
});

export async function getUserAnniversaryStatus(userId: string, cardProfileId?: string) {
  const cardProfile = await getActiveCardProfile(userId, cardProfileId);
  if (!cardProfile) return null;

  return {
    cardProfileId: cardProfile.id,
    cardType: cardProfile.cardType,
    anniversaryDate: cardProfile.anniversaryDate,
    anniversarySource: cardProfile.anniversarySource,
  };
}

// ── Internal helpers ────────────────────────────────────────────────

async function getActiveCardProfile(userId: string, cardProfileId?: string) {
  return db.query.cardProfiles.findFirst({
    where: cardProfileId
      ? and(eq(schema.cardProfiles.userId, userId), eq(schema.cardProfiles.id, cardProfileId))
      : and(eq(schema.cardProfiles.userId, userId), eq(schema.cardProfiles.isActive, true)),
  });
}

function parseActivationDate(periodKey: string): Date | null {
  const match = periodKey.match(/^ACTIVATED:(\d{2})-(\d{4})$/);
  if (!match) return null;
  return new Date(Date.UTC(parseInt(match[2], 10), parseInt(match[1], 10) - 1, 1));
}

function isUsageInCardYear(
  usage: { cycleStart: Date; cycleEnd: Date },
  cardYearBounds: CycleBounds
): boolean {
  return usage.cycleStart >= cardYearBounds.cycleStart && usage.cycleEnd <= cardYearBounds.cycleEnd;
}

/**
 * Count full elapsed months between two UTC dates.
 * e.g. Jan 1 → Mar 1 = 2 months, Jan 1 → Mar 15 = 2 months.
 */
function countFullMonths(start: Date, end: Date): number {
  const startYear = start.getUTCFullYear();
  const startMonth = start.getUTCMonth();
  const endYear = end.getUTCFullYear();
  const endMonth = end.getUTCMonth();
  return (endYear - startYear) * 12 + (endMonth - startMonth);
}
