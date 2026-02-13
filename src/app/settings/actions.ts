"use server";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth-helpers";
import { decrypt } from "@/lib/encryption";
import { plaidClient } from "@/lib/plaid";
import { revalidatePath } from "next/cache";
import { reprocessAllTransactions } from "@/lib/engine/orchestrator";

export async function updateAnniversaryDate(
  cardProfileId: string,
  month: number,
  year: number
) {
  const user = await requireAuth();

  const cardProfile = await db.query.cardProfiles.findFirst({
    where: eq(schema.cardProfiles.id, cardProfileId),
  });

  if (!cardProfile || cardProfile.userId !== user.id!) {
    throw new Error("Unauthorized");
  }

  const date = new Date(Date.UTC(year, month - 1, 1));

  await db
    .update(schema.cardProfiles)
    .set({
      anniversaryDate: date,
      anniversarySource: "user_provided",
    })
    .where(eq(schema.cardProfiles.id, cardProfileId));

  // Reprocess: clears old usage/matches, re-initializes benefit cycles
  // with the new anniversary date, re-matches all transactions
  await reprocessAllTransactions(cardProfileId);

  revalidatePath("/settings");
  revalidatePath("/dashboard");
}

export async function unlinkConnection(connectionId: string) {
  const user = await requireAuth();

  const connection = await db.query.plaidConnections.findFirst({
    where: eq(schema.plaidConnections.id, connectionId),
  });

  if (!connection || connection.userId !== user.id!) {
    throw new Error("Unauthorized");
  }

  // Revoke access token on Plaid's side
  const accessToken = decrypt(connection.plaidAccessToken);
  await plaidClient.itemRemove({ access_token: accessToken });

  // Delete the connection row (cascades to transactions)
  await db
    .delete(schema.plaidConnections)
    .where(eq(schema.plaidConnections.id, connectionId));

  revalidatePath("/settings");
}
