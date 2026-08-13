import "server-only";
import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import * as schema from "@/db/schema";
import { getCardDefinition } from "@/lib/cards";
import { getCardSummary } from "@/lib/queries";
import { getPointsEarningSummary } from "@/lib/points/queries";
import { computeCaptureRate, type CaptureRate } from "./capture-rate";

export type { CaptureRate } from "./capture-rate";

export interface RenewalStatus {
  /** ISO date of the next fee renewal. */
  renewsAt: string;
  daysUntil: number;
  annualFee: number;
  /** Credits captured this card year. */
  creditsCaptured: number;
  /** Points value this card year (realistic valuation). */
  pointsValue: number;
  /** creditsCaptured + pointsValue - fee. Positive = past break-even. */
  netSoFar: number;
  tracking: "keep" | "behind";
}

export interface ExpiringCredit {
  /** displayGroup key or benefitId. */
  key: string;
  name: string;
  remaining: number;
  daysLeft: number;
}

export interface CompareSnapshot {
  rank: number;
  totalCards: number;
}

async function getProfile(userId: string, cardProfileId?: string) {
  return db.query.cardProfiles.findFirst({
    where: cardProfileId
      ? and(
          eq(schema.cardProfiles.userId, userId),
          eq(schema.cardProfiles.id, cardProfileId)
        )
      : and(
          eq(schema.cardProfiles.userId, userId),
          eq(schema.cardProfiles.isActive, true)
        ),
  });
}

/**
 * Trailing-365-day capture rate for a card profile.
 * Null on fresh accounts with no completed benefit periods yet.
 */
export async function getCaptureRate(
  userId: string,
  cardProfileId?: string
): Promise<CaptureRate | null> {
  const profile = await getProfile(userId, cardProfileId);
  if (!profile) return null;

  const rows = await db.query.benefitUsage.findMany({
    where: and(
      eq(schema.benefitUsage.userId, userId),
      eq(schema.benefitUsage.cardProfileId, profile.id)
    ),
    columns: { amountUsed: true, amountRemaining: true, cycleEnd: true },
  });

  return computeCaptureRate(rows);
}

/**
 * Renewal tracking for the Home tile: where the user stands against the
 * annual fee, and when it next posts. Null when the card has no fee or
 * no anniversary date yet.
 */
export async function getRenewalStatus(
  userId: string,
  cardProfileId?: string
): Promise<RenewalStatus | null> {
  const profile = await getProfile(userId, cardProfileId);
  if (!profile || !profile.anniversaryDate) return null;

  const cardDef = getCardDefinition(profile.cardType);
  if (!cardDef || cardDef.annualFee <= 0) return null;

  // Next renewal: anniversary advanced year by year until it's in the future
  const now = new Date();
  const renewal = new Date(profile.anniversaryDate);
  while (renewal <= now) {
    renewal.setUTCFullYear(renewal.getUTCFullYear() + 1);
  }
  const daysUntil = Math.ceil(
    (renewal.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
  );

  const [summary, points] = await Promise.all([
    getCardSummary(userId, profile.id),
    getPointsEarningSummary(userId, profile.id, "anniversary_year"),
  ]);

  const creditsCaptured = Math.round(summary?.creditsUsed ?? 0);
  // Realistic valuation: midpoint of conservative and upside, matching
  // the Compare page's default mode.
  const pointsValue = points
    ? Math.round((points.valueConservative + points.valueUpside) / 2)
    : 0;
  const netSoFar = Math.round(creditsCaptured + pointsValue - cardDef.annualFee);

  return {
    renewsAt: renewal.toISOString(),
    daysUntil,
    annualFee: cardDef.annualFee,
    creditsCaptured,
    pointsValue,
    netSoFar,
    tracking: netSoFar > 0 ? "keep" : "behind",
  };
}

/**
 * Credits with remaining balance whose period ends within `windowDays`.
 * Sub-credits sharing a displayGroup (e.g. DoorDash) are combined.
 */
export async function getExpiringCredits(
  userId: string,
  cardProfileId?: string,
  windowDays = 14
): Promise<ExpiringCredit[]> {
  const profile = await getProfile(userId, cardProfileId);
  if (!profile) return [];

  const cardDef = getCardDefinition(profile.cardType);
  if (!cardDef) return [];

  const rows = await db.query.benefitUsage.findMany({
    where: and(
      eq(schema.benefitUsage.userId, userId),
      eq(schema.benefitUsage.cardProfileId, profile.id)
    ),
    columns: {
      benefitId: true,
      amountRemaining: true,
      cycleEnd: true,
    },
  });

  const now = new Date();
  const windowEnd = now.getTime() + windowDays * 24 * 60 * 60 * 1000;

  const grouped = new Map<string, ExpiringCredit>();
  for (const row of rows) {
    const end = row.cycleEnd.getTime();
    if (end < now.getTime() || end > windowEnd) continue;
    if (row.amountRemaining <= 0) continue;

    const benefit = cardDef.benefits.find((b) => b.id === row.benefitId);
    if (!benefit) continue;

    const key = benefit.displayGroup ?? benefit.id;
    const name = benefit.displayGroupName ?? benefit.name;
    const daysLeft = Math.max(
      0,
      Math.ceil((end - now.getTime()) / (24 * 60 * 60 * 1000))
    );

    const existing = grouped.get(key);
    if (existing) {
      existing.remaining =
        Math.round((existing.remaining + row.amountRemaining) * 100) / 100;
      existing.daysLeft = Math.min(existing.daysLeft, daysLeft);
    } else {
      grouped.set(key, {
        key,
        name,
        remaining: Math.round(row.amountRemaining * 100) / 100,
        daysLeft,
      });
    }
  }

  return Array.from(grouped.values()).sort((a, b) => b.remaining - a.remaining);
}

/**
 * Lightweight leaderboard position from persisted simulations.
 * Null before the first simulation run.
 */
export async function getCompareSnapshot(
  userId: string,
  cardProfileId?: string
): Promise<CompareSnapshot | null> {
  const profile = await getProfile(userId, cardProfileId);
  if (!profile) return null;

  const rows = await db.query.cardSimulations.findMany({
    where: and(
      eq(schema.cardSimulations.cardProfileId, profile.id),
      eq(schema.cardSimulations.portalMode, false)
    ),
    columns: { simulatedCardId: true, netActual: true },
  });

  if (rows.length === 0) return null;

  const ranked = [...rows].sort((a, b) => b.netActual - a.netActual);
  const rank = ranked.findIndex((r) => r.simulatedCardId === profile.cardType) + 1;
  if (rank === 0) return null;

  return { rank, totalCards: ranked.length };
}
