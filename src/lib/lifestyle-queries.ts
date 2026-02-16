import "server-only";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import * as schema from "@/db/schema";

// Legacy keys that were split into more specific options.
// Expand old DB values so existing users keep their selections working.
const LEGACY_KEY_MAP: Record<string, string[]> = {
  streaming: ["disney_plus", "youtube_premium", "peacock", "paramount_plus", "nyt", "wsj"],
  resy: ["fine_dining"],
  dining_portal: ["grubhub", "cheesecake_factory", "fine_dining"],
};

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

  const keys = new Set<string>();
  for (const r of rows) {
    const expanded = LEGACY_KEY_MAP[r.lifestyleKey];
    if (expanded) {
      for (const k of expanded) keys.add(k);
    } else {
      keys.add(r.lifestyleKey);
    }
  }
  return [...keys];
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
