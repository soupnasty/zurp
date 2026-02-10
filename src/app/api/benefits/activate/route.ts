import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCardDefinition } from "@/lib/cards";
import { generateAndPersistInsights } from "@/lib/insights/orchestrator";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { benefitId, activatedMonth } = await request.json();

    if (!benefitId || !activatedMonth) {
      return NextResponse.json(
        { error: "benefitId and activatedMonth are required" },
        { status: 400 }
      );
    }

    // Validate activatedMonth format (MM-YYYY)
    const match = activatedMonth.match(/^(\d{2})-(\d{4})$/);
    if (!match) {
      return NextResponse.json(
        { error: "activatedMonth must be MM-YYYY format" },
        { status: 400 }
      );
    }

    const month = parseInt(match[1], 10);
    const year = parseInt(match[2], 10);
    if (month < 1 || month > 12) {
      return NextResponse.json(
        { error: "Invalid month" },
        { status: 400 }
      );
    }

    // No future months
    const now = new Date();
    const activationDate = new Date(Date.UTC(year, month - 1, 1));
    if (activationDate > now) {
      return NextResponse.json(
        { error: "Cannot activate in the future" },
        { status: 400 }
      );
    }

    // Get user's active card profile
    const cardProfile = await db.query.cardProfiles.findFirst({
      where: and(
        eq(schema.cardProfiles.userId, session.user.id),
        eq(schema.cardProfiles.isActive, true)
      ),
    });

    if (!cardProfile) {
      return NextResponse.json(
        { error: "No card found" },
        { status: 404 }
      );
    }

    const cardDef = getCardDefinition(cardProfile.cardType);
    const benefitDef = cardDef?.benefits.find((b) => b.id === benefitId);

    if (!benefitDef || benefitDef.type !== "subscription") {
      return NextResponse.json(
        { error: "Only subscription benefits can be activated" },
        { status: 400 }
      );
    }

    // Remove any existing activation for this benefit before inserting
    const existing = await db.query.benefitOverrides.findMany({
      where: and(
        eq(schema.benefitOverrides.userId, session.user.id),
        eq(schema.benefitOverrides.benefitId, benefitId),
        eq(schema.benefitOverrides.overrideType, "activated")
      ),
    });
    for (const row of existing) {
      await db
        .delete(schema.benefitOverrides)
        .where(eq(schema.benefitOverrides.id, row.id));
    }

    await db.insert(schema.benefitOverrides).values({
      userId: session.user.id,
      cardProfileId: cardProfile.id,
      benefitId,
      periodKey: `ACTIVATED:${activatedMonth}`,
      overrideType: "activated",
    });

    // Refresh insights
    try {
      await generateAndPersistInsights(session.user.id);
    } catch (e) {
      console.error("Non-fatal: insight refresh failed after activation", e);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error activating subscription:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to activate subscription" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { benefitId } = await request.json();

    if (!benefitId) {
      return NextResponse.json(
        { error: "benefitId is required" },
        { status: 400 }
      );
    }

    // Delete any activation override for this benefit
    // periodKey starts with "ACTIVATED:" so we need to find and delete it
    const overrides = await db.query.benefitOverrides.findMany({
      where: and(
        eq(schema.benefitOverrides.userId, session.user.id),
        eq(schema.benefitOverrides.benefitId, benefitId),
        eq(schema.benefitOverrides.overrideType, "activated")
      ),
    });

    for (const override of overrides) {
      await db
        .delete(schema.benefitOverrides)
        .where(eq(schema.benefitOverrides.id, override.id));
    }

    // Refresh insights
    try {
      await generateAndPersistInsights(session.user.id);
    } catch (e) {
      console.error("Non-fatal: insight refresh failed after deactivation", e);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deactivating subscription:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to deactivate subscription" },
      { status: 500 }
    );
  }
}
