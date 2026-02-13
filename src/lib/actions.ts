"use server";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";
import { reprocessAllTransactions } from "@/lib/engine/orchestrator";
import { getCardDefinition } from "@/lib/cards";
import { isValidCardType } from "@/lib/validation";

export async function removeCardProfile(cardProfileId: string) {
  const user = await requireAuth();

  const cardProfile = await db.query.cardProfiles.findFirst({
    where: eq(schema.cardProfiles.id, cardProfileId),
  });

  if (!cardProfile || cardProfile.userId !== user.id!) {
    throw new Error("Unauthorized");
  }

  // Delete the plaid connection — cascades to card profiles, transactions,
  // matched_tx, benefit_usage, and transaction_flags for this connection
  await db
    .delete(schema.plaidConnections)
    .where(eq(schema.plaidConnections.id, cardProfile.plaidConnectionId));

  revalidatePath("/settings");
  revalidatePath("/dashboard");
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

  // Validate card type against registry before proceeding
  if (!isValidCardType(newCardType)) {
    throw new Error("Invalid card type");
  }

  // Ensure the new card and its benefits exist in the DB (FK target for benefit_usage)
  await ensureCardSeeded(newCardType);

  // Update card type
  await db
    .update(schema.cardProfiles)
    .set({ cardType: newCardType })
    .where(eq(schema.cardProfiles.id, cardProfileId));

  // Reprocess: clears old usage/matches, re-matches transactions, regenerates insights
  await reprocessAllTransactions(cardProfileId);

  revalidatePath("/settings");
  revalidatePath("/dashboard");
}

/**
 * Ensure a card and its benefits exist in the DB.
 * Prevents FK violations when benefit_usage references benefits that haven't been seeded.
 */
async function ensureCardSeeded(cardType: string) {
  const cardDef = getCardDefinition(cardType);
  if (!cardDef) return;

  // Upsert card
  await db
    .insert(schema.cards)
    .values({
      id: cardDef.id,
      name: cardDef.name,
      issuer: cardDef.issuer,
      network: cardDef.network,
      annualFee: cardDef.annualFee,
      feeDescriptor: cardDef.feeDescriptor,
      imageUrl: cardDef.imageUrl,
      isActive: cardDef.isActive,
    })
    .onConflictDoUpdate({
      target: schema.cards.id,
      set: {
        name: cardDef.name,
        annualFee: cardDef.annualFee,
        isActive: cardDef.isActive,
      },
    });

  // Upsert benefits
  for (const benefit of cardDef.benefits) {
    await db
      .insert(schema.benefits)
      .values({
        id: benefit.id,
        cardId: benefit.cardId,
        name: benefit.name,
        icon: benefit.icon,
        category: benefit.category,
        type: benefit.type,
        creditAmount: benefit.creditAmount,
        cycle: benefit.cycle,
        carriesOver: benefit.carriesOver,
        maxCarryoverPeriods: benefit.maxCarryoverPeriods,
        maxAccrued: benefit.maxAccrued,
        merchantPatterns: benefit.merchantPatterns,
        plaidCategories: benefit.plaidCategories,
        autoMatchable: benefit.autoMatchable,
        requiresActivation: benefit.requiresActivation,
        priority: benefit.priority,
        description: benefit.description,
        notes: benefit.notes,
        sunsetDate: benefit.sunsetDate,
        sourceUrl: benefit.sourceUrl,
        displayGroup: benefit.displayGroup,
        displayGroupName: benefit.displayGroupName,
        displayGroupIcon: benefit.displayGroupIcon,
      })
      .onConflictDoUpdate({
        target: schema.benefits.id,
        set: {
          name: benefit.name,
          creditAmount: benefit.creditAmount,
          cycle: benefit.cycle,
          merchantPatterns: benefit.merchantPatterns,
          autoMatchable: benefit.autoMatchable,
          requiresActivation: benefit.requiresActivation,
          priority: benefit.priority,
          description: benefit.description,
        },
      });
  }
}
