"use server";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth-helpers";
import { initializeBenefitUsage } from "@/lib/engine/orchestrator";
import { computeComparison } from "@/lib/points";
import { getAllEarnConfigs } from "@/lib/points/earn-configs";
import { setLifestyleSelections } from "@/lib/lifestyle-queries";
import { revalidatePath } from "next/cache";

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

// ── Lifestyle Selections ──

export async function saveLifestyleSelections(
  selectedKeys: string[]
): Promise<{ success: boolean; error?: string }> {
  const user = await requireAuth();

  try {
    await setLifestyleSelections(user.id!, selectedKeys);
    revalidatePath("/dashboard/compare");
    return { success: true };
  } catch (e) {
    console.error("[saveLifestyleSelections] error:", e);
    return { success: false, error: String(e) };
  }
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

  // Use the same defaults as the compare page: realistic + my_picks
  const vMode = "realistic" as const;
  const bMode = "my_picks" as const;

  // Re-rank cards using the same mode as the compare page
  const ranked = [...comparison.cards].sort(
    (a, b) => b.netByMode[vMode][bMode] - a.netByMode[vMode][bMode]
  );
  ranked.forEach((c, i) => { c.rank = i + 1; });

  const usersCard = ranked.find((c) => c.isUsersCard);
  if (!usersCard) return null;

  const totalCards = getAllEarnConfigs().length;
  const userRank = usersCard.rank;

  // Build 4-row leaderboard: always include #1 and user's card
  let selectedCards: typeof ranked;
  if (userRank <= 4) {
    selectedCards = ranked.filter((c) => c.rank <= 4);
  } else {
    const rank1 = ranked.find((c) => c.rank === 1)!;
    const above1 = ranked.find((c) => c.rank === userRank - 2);
    const above2 = ranked.find((c) => c.rank === userRank - 1);
    selectedCards = [rank1, above1, above2, usersCard].filter(
      Boolean
    ) as typeof ranked;
  }

  selectedCards.sort((a, b) => a.rank - b.rank);
  selectedCards = selectedCards.slice(0, 4);

  const getNet = (c: typeof ranked[0]) => c.netByMode[vMode][bMode];
  const getPoints = (c: typeof ranked[0]) => c.pointsValueRealistic;
  const getBenefits = (c: typeof ranked[0]) => c.benefitsByMode[bMode];

  const leaderboard: RevealLeaderboardRow[] = selectedCards.map((c) => ({
    rank: c.rank,
    netValue: getNet(c),
    isUsersCard: c.isUsersCard,
    pointsValue: getPoints(c),
    benefitsValue: getBenefits(c),
    annualFee: c.annualFee,
  }));

  // Headline margin: difference between #1 and user's card
  const bestAlt = ranked.find((c) => !c.isUsersCard);
  const margin = bestAlt
    ? Math.round(Math.abs(getNet(usersCard) - getNet(bestAlt)) * 100) / 100
    : 0;
  const isWin = !bestAlt || getNet(usersCard) >= getNet(bestAlt);
  const isClose = margin < 50 && bestAlt != null;

  return {
    rank: userRank,
    totalCards,
    cardName: usersCard.cardName,
    annualFee: usersCard.annualFee,
    netValue: getNet(usersCard),
    headline: {
      type: isWin ? (isClose ? "close" : "win") : isClose ? "close" : "lose",
      margin,
      bestAlternativeName: bestAlt?.cardName ?? usersCard.cardName,
    },
    leaderboard,
    belowCount: totalCards - userRank,
    monthCount: comparison.monthCount,
    totalTransactions: comparison.totalTransactions,
  };
}
