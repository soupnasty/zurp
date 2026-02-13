import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * POST /api/insights/impression
 * Record a client-side impression when an insight scrolls into view.
 * Called via Intersection Observer from the InsightCard component.
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { insightId, surface } = await request.json();

    if (!insightId || !surface) {
      return NextResponse.json(
        { error: "insightId and surface are required" },
        { status: 400 }
      );
    }

    // Verify the insight belongs to this user
    const insight = await db.query.insights.findFirst({
      where: and(
        eq(schema.insights.id, insightId),
        eq(schema.insights.userId, session.user.id)
      ),
    });

    if (!insight) {
      return NextResponse.json(
        { error: "Insight not found" },
        { status: 404 }
      );
    }

    // Record the impression
    await db.insert(schema.insightImpressions).values({
      insightId,
      surface,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error recording impression:", error);
    return NextResponse.json(
      { error: "Failed to record impression" },
      { status: 500 }
    );
  }
}
