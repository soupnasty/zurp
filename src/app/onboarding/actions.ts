"use server";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth-helpers";
import { initializeBenefitUsage } from "@/lib/engine/orchestrator";
import { computeComparison } from "@/lib/points";
import { getAllEarnConfigs } from "@/lib/points/earn-configs";

export async function createCardProfile(
  cardType: string,
  connectionId: string
) {
  const user = await requireAuth();

  const [cardProfile] = await db
    .insert(schema.cardProfiles)
    .values({
      userId: user.id!,
      plaidConnectionId: connectionId,
      cardType,
      isActive: true,
      anniversarySource: "pending",
    })
    .returning();

  return cardProfile;
}

export async function setAnniversaryDate(
  cardProfileId: string,
  date: Date
) {
  const user = await requireAuth();

  const cardProfile = await db.query.cardProfiles.findFirst({
    where: eq(schema.cardProfiles.id, cardProfileId),
  });

  if (!cardProfile || cardProfile.userId !== user.id!) {
    throw new Error("Unauthorized");
  }

  await db
    .update(schema.cardProfiles)
    .set({
      anniversaryDate: date,
      anniversarySource: "user_provided",
    })
    .where(eq(schema.cardProfiles.id, cardProfileId));

  // Initialize benefit usage records with the anniversary date
  await initializeBenefitUsage(user.id!, cardProfile.cardType, cardProfileId, date);

  return { success: true };
}

// ── Reveal Data ──

export interface RevealLeaderboardRow {
  rank: number;
  netValue: number;
  isUsersCard: boolean;
  pointsValue: number;
  benefitsValue: number;
  annualFee: number;
}

export interface RevealData {
  rank: number;
  totalCards: number;
  cardName: string;
  annualFee: number;
  netValue: number;
  headline: {
    type: "win" | "lose" | "close";
    margin: number;
    bestAlternativeName: string;
  };
  leaderboard: RevealLeaderboardRow[];
  belowCount: number;
  monthCount: number;
  totalTransactions: number;
}

export async function getRevealData(
  userId: string
): Promise<RevealData | null> {
  const comparison = await computeComparison(userId);
  if (!comparison) return null;

  const { cards, headline } = comparison;
  const usersCard = cards.find((c) => c.isUsersCard);
  if (!usersCard) return null;

  const totalCards = getAllEarnConfigs().length;
  const userRank = usersCard.rank;

  // Build 4-row leaderboard: always include #1 and user's card
  let selectedCards: typeof cards;
  if (userRank <= 4) {
    // User is in top 4 — show ranks 1-4
    selectedCards = cards.filter((c) => c.rank <= 4);
  } else {
    // Show #1, two cards above user, and user
    const rank1 = cards.find((c) => c.rank === 1)!;
    const above1 = cards.find((c) => c.rank === userRank - 2);
    const above2 = cards.find((c) => c.rank === userRank - 1);
    selectedCards = [rank1, above1, above2, usersCard].filter(
      Boolean
    ) as typeof cards;
  }

  // Sort by rank and take up to 4
  selectedCards.sort((a, b) => a.rank - b.rank);
  selectedCards = selectedCards.slice(0, 4);

  const leaderboard: RevealLeaderboardRow[] = selectedCards.map((c) => ({
    rank: c.rank,
    netValue: c.netActual,
    isUsersCard: c.isUsersCard,
    pointsValue: c.pointsValueConservative,
    benefitsValue: c.benefitsValue,
    annualFee: c.annualFee,
  }));

  return {
    rank: userRank,
    totalCards,
    cardName: usersCard.cardName,
    annualFee: usersCard.annualFee,
    netValue: usersCard.netActual,
    headline: {
      type: headline.type,
      margin: headline.margin,
      bestAlternativeName: headline.bestAlternativeName,
    },
    leaderboard,
    belowCount: totalCards - userRank,
    monthCount: comparison.monthCount,
    totalTransactions: comparison.totalTransactions,
  };
}
