import { NextResponse } from "next/server";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";

/**
 * GET /api/plaid/sync-status
 * Returns the sync status for the user's active card connection.
 * Used by the compare page to poll for data readiness after onboarding.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cardProfile = await db.query.cardProfiles.findFirst({
    where: and(
      eq(schema.cardProfiles.userId, session.user.id),
      eq(schema.cardProfiles.isActive, true)
    ),
    with: { plaidConnection: true },
  });

  if (!cardProfile?.plaidConnection) {
    return NextResponse.json({ syncStatus: "pending" });
  }

  return NextResponse.json({
    syncStatus: cardProfile.plaidConnection.syncStatus ?? "pending",
  });
}
