"use server";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth-helpers";
import { initializeBenefitUsage } from "@/lib/engine/orchestrator";

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
