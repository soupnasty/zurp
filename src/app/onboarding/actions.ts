"use server";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth-helpers";
import { initializeBenefitUsage } from "@/lib/engine/orchestrator";

export async function addUserCard(cardId: string) {
  const user = await requireAuth();

  const [userCard] = await db
    .insert(schema.userCards)
    .values({
      userId: user.id!,
      cardId,
      isPrimary: true,
      anniversarySource: "pending",
    })
    .returning();

  return userCard;
}

export async function setAnniversaryDate(
  userCardId: string,
  date: Date
) {
  const user = await requireAuth();

  const userCard = await db.query.userCards.findFirst({
    where: eq(schema.userCards.id, userCardId),
  });

  if (!userCard || userCard.userId !== user.id!) {
    throw new Error("Unauthorized");
  }

  await db
    .update(schema.userCards)
    .set({
      anniversaryDate: date,
      anniversarySource: "user_provided",
    })
    .where(eq(schema.userCards.id, userCardId));

  // Initialize benefit usage records with the anniversary date
  await initializeBenefitUsage(user.id!, userCard.cardId, date);

  return { success: true };
}
