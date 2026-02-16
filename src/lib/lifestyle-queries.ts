import "server-only";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import * as schema from "@/db/schema";

/**
 * Get all lifestyle keys selected by a user.
 */
export async function getLifestyleSelections(
  userId: string
): Promise<string[]> {
  const rows = await db
    .select({ lifestyleKey: schema.lifestyleSelections.lifestyleKey })
    .from(schema.lifestyleSelections)
    .where(eq(schema.lifestyleSelections.userId, userId));

  return rows.map((r) => r.lifestyleKey);
}

/**
 * Replace all lifestyle selections for a user.
 * Deletes existing then inserts new ones (neon-http doesn't support transactions).
 */
export async function setLifestyleSelections(
  userId: string,
  keys: string[]
): Promise<void> {
  await db
    .delete(schema.lifestyleSelections)
    .where(eq(schema.lifestyleSelections.userId, userId));

  if (keys.length > 0) {
    await db.insert(schema.lifestyleSelections).values(
      keys.map((k) => ({
        userId,
        lifestyleKey: k,
      }))
    );
  }
}
