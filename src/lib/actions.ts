"use server";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";
import { reprocessAllTransactions } from "@/lib/engine/orchestrator";

export async function removeCardProfile(cardProfileId: string) {
  const user = await requireAuth();

  const cardProfile = await db.query.cardProfiles.findFirst({
    where: eq(schema.cardProfiles.id, cardProfileId),
  });

  if (!cardProfile || cardProfile.userId !== user.id!) {
    throw new Error("Unauthorized");
  }

  await db.delete(schema.cardProfiles).where(eq(schema.cardProfiles.id, cardProfileId));

  revalidatePath("/settings");
}

export async function updateCardType(cardProfileId: string, newCardType: string) {
  const user = await requireAuth();

  const cardProfile = await db.query.cardProfiles.findFirst({
    where: eq(schema.cardProfiles.id, cardProfileId),
  });

  if (!cardProfile || cardProfile.userId !== user.id!) {
    throw new Error("Unauthorized");
  }

  if (cardProfile.cardType === newCardType) return;

  // Update card type
  await db
    .update(schema.cardProfiles)
    .set({ cardType: newCardType })
    .where(eq(schema.cardProfiles.id, cardProfileId));

  // Reprocess: clears old usage/matches, re-matches transactions, regenerates insights
  await reprocessAllTransactions(cardProfileId);

  revalidatePath("/settings");
  revalidatePath("/benefits");
  revalidatePath("/spending");
}
