import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCardDefinition } from "@/lib/cards";
import { generateAndPersistAlerts } from "@/lib/alerts/orchestrator";
import { parsePreferenceUpdate } from "@/lib/rewards/preferences";
import { createRateLimiter } from "@/lib/rate-limiter";

const preferencesLimiter = createRateLimiter(60_000, 30);

/**
 * Set per-credit preferences: hide a credit ("not for me") and/or choose
 * its reminder (auto / custom lead days / off). A grouped Rewards row
 * sends all of its benefit IDs.
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { allowed, retryAfterMs } = preferencesLimiter(userId);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil((retryAfterMs || 60000) / 1000)) } }
      );
    }

    const cardProfile = await db.query.cardProfiles.findFirst({
      where: and(
        eq(schema.cardProfiles.userId, userId),
        eq(schema.cardProfiles.isActive, true)
      ),
    });
    const cardDef = cardProfile ? getCardDefinition(cardProfile.cardType) : undefined;
    if (!cardProfile || !cardDef) {
      return NextResponse.json({ error: "No card found" }, { status: 404 });
    }

    const parsed = parsePreferenceUpdate(
      await request.json().catch(() => null),
      new Set(cardDef.benefits.map((b) => b.id))
    );
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const { benefitIds, ...fields } = parsed.update;

    for (const benefitId of benefitIds) {
      await db
        .insert(schema.benefitPreferences)
        .values({ userId, cardProfileId: cardProfile.id, benefitId, ...fields })
        .onConflictDoUpdate({
          target: [
            schema.benefitPreferences.userId,
            schema.benefitPreferences.cardProfileId,
            schema.benefitPreferences.benefitId,
          ],
          set: { ...fields, updatedAt: new Date() },
        });
    }

    // Reminders changed: regenerate so the alert stream reflects them now.
    try {
      await generateAndPersistAlerts(userId);
    } catch (e) {
      console.error("Non-fatal: alert refresh failed after preference change", e);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving benefit preferences:", error);
    return NextResponse.json({ error: "Failed to save preferences" }, { status: 500 });
  }
}
