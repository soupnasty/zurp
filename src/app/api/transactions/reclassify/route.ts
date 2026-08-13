import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { isEarnCategory } from "@/lib/points/overrides";
import { recomputeSummaries } from "@/lib/engine/orchestrator";

/**
 * Save (or clear) a user's category correction for a merchant, then
 * refresh the precomputed summaries so Compare/Track reflect it
 * immediately instead of waiting for the next sync.
 *
 * Body: { merchant: string (normalized name), category: EarnCategory | null }
 * category null clears an existing override.
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { merchant, category } = await request.json();

    if (typeof merchant !== "string" || !merchant.trim() || merchant.length > 200) {
      return NextResponse.json({ error: "merchant is required" }, { status: 400 });
    }
    if (category !== null && (typeof category !== "string" || !isEarnCategory(category))) {
      return NextResponse.json({ error: "invalid category" }, { status: 400 });
    }

    const normalizedMerchant = merchant.trim().toLowerCase();

    if (category === null) {
      await db
        .delete(schema.categoryOverrides)
        .where(
          and(
            eq(schema.categoryOverrides.userId, userId),
            eq(schema.categoryOverrides.normalizedMerchant, normalizedMerchant)
          )
        );
    } else {
      await db
        .insert(schema.categoryOverrides)
        .values({ userId, normalizedMerchant, category })
        .onConflictDoUpdate({
          target: [
            schema.categoryOverrides.userId,
            schema.categoryOverrides.normalizedMerchant,
          ],
          set: { category, updatedAt: new Date() },
        });
    }

    // Refresh precomputed summaries so the change is visible immediately.
    const profiles = await db.query.cardProfiles.findMany({
      where: eq(schema.cardProfiles.userId, userId),
      columns: {
        id: true,
        cardType: true,
        anniversaryDate: true,
        plaidConnectionId: true,
      },
    });
    for (const profile of profiles) {
      await recomputeSummaries(userId, profile, profile.plaidConnectionId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reclassifying merchant:", error);
    return NextResponse.json({ error: "Failed to reclassify" }, { status: 500 });
  }
}
