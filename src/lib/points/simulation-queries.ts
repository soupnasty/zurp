import "server-only";
import { db } from "@/db";
import { eq, and, notInArray } from "drizzle-orm";
import * as schema from "@/db/schema";
import type { MatcherTransaction } from "@/lib/types";

const EXCLUDED_CATEGORIES = [
  "INCOME",
  "TRANSFER_IN",
  "LOAN_PAYMENTS",
  "BANK_FEES",
];

export interface SimulationRow {
  simulatedCardId: string;
  annualFee: number;
  totalPoints: number;
  bonusPoints: number;
  pointsValueConservative: number;
  pointsValueUpside: number;
  benefitsSimulated: number;
  benefitsValue: number;
  netFloor: number;
  netCeiling: number;
  netActual: number;
  categoryBreakdown: Array<{
    category: string;
    label: string;
    icon: string;
    totalSpend: number;
    transactionCount: number;
    earnRate: number;
    points: number;
    valueConservative: number;
    capNote: string | null;
  }>;
  analysisPeriodStart: Date;
  analysisPeriodEnd: Date;
  monthCount: number;
  totalSpend: number;
  totalTransactions: number;
}

/**
 * Get a precomputed simulation row for a specific card.
 */
export async function getSimulationForCard(
  cardProfileId: string,
  simulatedCardId: string,
  portalMode: boolean
): Promise<SimulationRow | null> {
  const row = await db.query.cardSimulations.findFirst({
    where: and(
      eq(schema.cardSimulations.cardProfileId, cardProfileId),
      eq(schema.cardSimulations.simulatedCardId, simulatedCardId),
      eq(schema.cardSimulations.portalMode, portalMode)
    ),
  });

  if (!row) return null;

  return {
    simulatedCardId: row.simulatedCardId,
    annualFee: row.annualFee,
    totalPoints: row.totalPoints,
    bonusPoints: row.bonusPoints,
    pointsValueConservative: row.pointsValueConservative,
    pointsValueUpside: row.pointsValueUpside,
    benefitsSimulated: row.benefitsSimulated,
    benefitsValue: row.benefitsValue,
    netFloor: row.netFloor,
    netCeiling: row.netCeiling,
    netActual: row.netActual,
    categoryBreakdown: row.categoryBreakdown,
    analysisPeriodStart: row.analysisPeriodStart,
    analysisPeriodEnd: row.analysisPeriodEnd,
    monthCount: row.monthCount,
    totalSpend: row.totalSpend,
    totalTransactions: row.totalTransactions,
  };
}

/**
 * Lightweight data stats (month count + transaction count) from the first simulation row.
 */
export async function getDataStats(
  cardProfileId: string
): Promise<{ monthCount: number; totalTransactions: number } | null> {
  const row = await db.query.cardSimulations.findFirst({
    where: eq(schema.cardSimulations.cardProfileId, cardProfileId),
    columns: { monthCount: true, totalTransactions: true },
  });
  if (!row) return null;
  return { monthCount: row.monthCount, totalTransactions: row.totalTransactions };
}

/**
 * Fetch transactions for a card profile's connection as MatcherTransaction[].
 * Used to run simulateBenefitsForCard() on-demand for per-benefit data.
 */
export async function getMatcherTransactionsForProfile(
  cardProfileId: string
): Promise<MatcherTransaction[]> {
  const cardProfile = await db.query.cardProfiles.findFirst({
    where: eq(schema.cardProfiles.id, cardProfileId),
    columns: { plaidConnectionId: true },
  });
  if (!cardProfile) return [];

  const txs = await db.query.transactions.findMany({
    where: and(
      eq(schema.transactions.plaidConnectionId, cardProfile.plaidConnectionId),
      eq(schema.transactions.pending, false),
      eq(schema.transactions.isAnnualFee, false),
      notInArray(
        schema.transactions.plaidCategoryPrimary,
        EXCLUDED_CATEGORIES
      )
    ),
    orderBy: (t, { asc }) => [asc(t.date)],
    columns: {
      id: true,
      date: true,
      merchantName: true,
      merchantNameRaw: true,
      amount: true,
      plaidCategoryPrimary: true,
      plaidCategoryDetailed: true,
      pending: true,
      matchedStatus: true,
    },
  });

  return txs.map((tx) => ({
    id: tx.id,
    date: tx.date,
    merchantName: tx.merchantName,
    merchantNameRaw: tx.merchantNameRaw,
    amount: Math.abs(tx.amount),
    plaidCategoryPrimary: tx.plaidCategoryPrimary,
    plaidCategoryDetailed: tx.plaidCategoryDetailed,
    pending: false,
    matchedStatus: "unmatched" as const,
  }));
}
