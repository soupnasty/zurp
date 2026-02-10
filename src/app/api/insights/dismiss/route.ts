import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { insightId } = await request.json();

    if (!insightId) {
      return NextResponse.json(
        { error: "insightId is required" },
        { status: 400 }
      );
    }

    // Verify the insight belongs to this user and is active
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

    if (insight.state !== "pending" && insight.state !== "shown") {
      return NextResponse.json(
        { error: "Insight is not active" },
        { status: 400 }
      );
    }

    // Mark as dismissed
    await db
      .update(schema.insights)
      .set({ state: "dismissed", resolvedAt: new Date() })
      .where(eq(schema.insights.id, insightId));

    // Record dismissal impression
    await db.insert(schema.insightImpressions).values({
      insightId,
      surface: "dismissed",
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error dismissing insight:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to dismiss insight" },
      { status: 500 }
    );
  }
}
