"use server";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";

export async function removeUserCard(userCardId: string) {
  const user = await requireAuth();

  const userCard = await db.query.userCards.findFirst({
    where: eq(schema.userCards.id, userCardId),
  });

  if (!userCard || userCard.userId !== user.id!) {
    throw new Error("Unauthorized");
  }

  await db.delete(schema.userCards).where(eq(schema.userCards.id, userCardId));

  revalidatePath("/cards");
}
