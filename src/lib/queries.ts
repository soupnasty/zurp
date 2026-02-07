import "server-only";
import { db } from "@/db";
import { eq, desc, and } from "drizzle-orm";
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
  userId: string
): Promise<CardSummary | null> {
  const userCard = await db.query.userCards.findFirst({
    where: eq(schema.userCards.userId, userId),
    with: { card: true },
  });

  if (!userCard) return null;

  const cardDef = getCardDefinition(userCard.cardId);
  if (!cardDef) return null;

  const usageRecords = await db.query.benefitUsage.findMany({
    where: and(
      eq(schema.benefitUsage.userId, userId),
      eq(schema.benefitUsage.cardId, userCard.cardId)
    ),
  });

  const now = new Date();
  let creditsUsed = 0;
  let creditsAvailable = 0;
  let creditsExpired = 0;
  let nearestExpiry: number | null = null;
  let valueAtRisk = 0;

  for (const benefit of cardDef.benefits) {
    if (benefit.type === "subscription") continue;

    const bounds = getCurrentCycleBounds(
      benefit.cycle as BenefitCycle,
      now,
      userCard.anniversaryDate
    );

    const usage = usageRecords.find(
      (u) => u.benefitId === benefit.id && u.periodKey === bounds.periodKey
    );

    creditsAvailable += benefit.creditAmount;

    if (usage) {
      creditsUsed += usage.amountUsed;

      // Check if expired
      if (bounds.cycleEnd < now && usage.amountRemaining > 0) {
        creditsExpired += usage.amountRemaining;
      }
    }

    const days = daysRemainingInCycle(
      benefit.cycle as BenefitCycle,
      now,
      userCard.anniversaryDate
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

  return {
    cardId: cardDef.id,
    cardName: cardDef.name,
    annualFee: cardDef.annualFee,
    creditsAvailable,
    creditsUsed,
    creditsExpired,
    effectiveFee,
    roiPercent,
    daysUntilNextExpiry: nearestExpiry,
    valueAtRisk,
  };
}

export async function getBenefitUsageSummaries(
  userId: string
): Promise<BenefitUsageSummary[]> {
  const userCard = await db.query.userCards.findFirst({
    where: eq(schema.userCards.userId, userId),
  });

  if (!userCard) return [];

  const cardDef = getCardDefinition(userCard.cardId);
  if (!cardDef) return [];

  const usageRecords = await db.query.benefitUsage.findMany({
    where: and(
      eq(schema.benefitUsage.userId, userId),
      eq(schema.benefitUsage.cardId, userCard.cardId)
    ),
  });

  const now = new Date();
  const summaries: BenefitUsageSummary[] = [];

  for (const benefit of cardDef.benefits) {
    const bounds = getCurrentCycleBounds(
      benefit.cycle as BenefitCycle,
      now,
      userCard.anniversaryDate
    );

    const usage = usageRecords.find(
      (u) => u.benefitId === benefit.id && u.periodKey === bounds.periodKey
    );

    const days = daysRemainingInCycle(
      benefit.cycle as BenefitCycle,
      now,
      userCard.anniversaryDate
    );

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
      daysRemaining: days,
      requiresActivation: benefit.requiresActivation,
      autoMatchable: benefit.autoMatchable,
      sunsetDate: benefit.sunsetDate,
      displayGroup: benefit.displayGroup,
      displayGroupName: benefit.displayGroupName,
      displayGroupIcon: benefit.displayGroupIcon,
      periodKey: bounds.periodKey,
      cycleStart: bounds.cycleStart,
      cycleEnd: bounds.cycleEnd,
    });
  }

  return summaries;
}

export async function getRecentTransactions(
  userId: string,
  limit = 50
): Promise<TransactionWithMatch[]> {
  const txs = await db.query.transactions.findMany({
    where: eq(schema.transactions.userId, userId),
    orderBy: desc(schema.transactions.date),
    limit,
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
      creditApplied: match?.creditApplied ?? null,
      matchConfidence: (match?.matchConfidence as any) ?? null,
      matchMethod: (match?.matchMethod as any) ?? null,
    };
  });
}

export async function getPlaidConnectionStatus(userId: string) {
  const connections = await db.query.plaidConnections.findMany({
    where: eq(schema.plaidConnections.userId, userId),
  });

  return connections.map((c) => ({
    id: c.id,
    institutionName: c.institutionName,
    status: c.status,
    lastSyncedAt: c.lastSyncedAt,
  }));
}

export async function getUserAnniversaryStatus(userId: string) {
  const userCard = await db.query.userCards.findFirst({
    where: eq(schema.userCards.userId, userId),
  });

  if (!userCard) return null;

  return {
    userCardId: userCard.id,
    cardId: userCard.cardId,
    anniversaryDate: userCard.anniversaryDate,
    anniversarySource: userCard.anniversarySource,
  };
}
