import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCardDefinition } from "@/lib/cards";
import { getCurrentCycleBounds } from "@/lib/engine/cycle-utils";
import { generateAndPersistInsights } from "@/lib/insights/orchestrator";
import type { BenefitCycle } from "@/lib/types";

export async function POST(request: Request) {
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

    // Get user's card to determine anniversary date and card definition
    const userCard = await db.query.userCards.findFirst({
      where: eq(schema.userCards.userId, session.user.id),
    });

    if (!userCard) {
      return NextResponse.json(
        { error: "No card found" },
        { status: 404 }
      );
    }

    const cardDef = getCardDefinition(userCard.cardId);
    const benefitDef = cardDef?.benefits.find((b) => b.id === benefitId);

    if (!benefitDef) {
      return NextResponse.json(
        { error: "Benefit not found" },
        { status: 404 }
      );
    }

    const now = new Date();
    const bounds = getCurrentCycleBounds(
      benefitDef.cycle as BenefitCycle,
      now,
      userCard.anniversaryDate
    );

    // Find current-period usage
    const usage = await db.query.benefitUsage.findFirst({
      where: and(
        eq(schema.benefitUsage.userId, session.user.id),
        eq(schema.benefitUsage.benefitId, benefitId),
        eq(schema.benefitUsage.periodKey, bounds.periodKey)
      ),
    });

    if (usage?.isFullyUsed) {
      return NextResponse.json(
        { error: "Benefit is already fully used" },
        { status: 400 }
      );
    }

    // Store original values for undo
    const originalNote = JSON.stringify({
      amountUsed: usage?.amountUsed ?? 0,
      amountRemaining: usage?.amountRemaining ?? benefitDef.creditAmount,
      isFullyUsed: false,
    });

    if (usage) {
      // Update existing record
      await db
        .update(schema.benefitUsage)
        .set({
          amountUsed: benefitDef.creditAmount,
          amountRemaining: 0,
          isFullyUsed: true,
          manualOverride: true,
          overrideNote: originalNote,
          updatedAt: new Date(),
        })
        .where(eq(schema.benefitUsage.id, usage.id));
    } else {
      // Create new usage record (benefit not yet tracked this period)
      await db.insert(schema.benefitUsage).values({
        userId: session.user.id,
        benefitId,
        cardId: userCard.cardId,
        periodKey: bounds.periodKey,
        cycleStart: bounds.cycleStart,
        cycleEnd: bounds.cycleEnd,
        amountUsed: benefitDef.creditAmount,
        amountRemaining: 0,
        isFullyUsed: true,
        manualOverride: true,
        overrideNote: originalNote,
      });
    }

    // Refresh insights after manual redeem
    try {
      await generateAndPersistInsights(session.user.id);
    } catch (e) {
      console.error("Non-fatal: insight refresh failed after redeem", e);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error redeeming benefit:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to redeem benefit" },
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

    const { benefitId, reset } = await request.json();

    if (!benefitId) {
      return NextResponse.json(
        { error: "benefitId is required" },
        { status: 400 }
      );
    }

    // Get user's card to determine cycle bounds
    const userCard = await db.query.userCards.findFirst({
      where: eq(schema.userCards.userId, session.user.id),
    });

    if (!userCard) {
      return NextResponse.json(
        { error: "No card found" },
        { status: 404 }
      );
    }

    const cardDef = getCardDefinition(userCard.cardId);
    const benefitDef = cardDef?.benefits.find((b) => b.id === benefitId);

    if (!benefitDef) {
      return NextResponse.json(
        { error: "Benefit not found" },
        { status: 404 }
      );
    }

    const now = new Date();
    const bounds = getCurrentCycleBounds(
      benefitDef.cycle as BenefitCycle,
      now,
      userCard.anniversaryDate
    );

    if (reset) {
      // Reset a fully-used benefit that has no linked transactions
      const usage = await db.query.benefitUsage.findFirst({
        where: and(
          eq(schema.benefitUsage.userId, session.user.id),
          eq(schema.benefitUsage.benefitId, benefitId),
          eq(schema.benefitUsage.periodKey, bounds.periodKey),
          eq(schema.benefitUsage.isFullyUsed, true)
        ),
        with: { matches: true },
      });

      if (!usage) {
        return NextResponse.json(
          { error: "No fully-used benefit found to reset" },
          { status: 404 }
        );
      }

      if (usage.matches.length > 0) {
        return NextResponse.json(
          { error: "Cannot reset — benefit has linked transactions" },
          { status: 400 }
        );
      }

      await db
        .update(schema.benefitUsage)
        .set({
          amountUsed: 0,
          amountRemaining: benefitDef.creditAmount,
          isFullyUsed: false,
          manualOverride: false,
          overrideNote: null,
          updatedAt: new Date(),
        })
        .where(eq(schema.benefitUsage.id, usage.id));
    } else {
      // Undo a manual redemption
      const usage = await db.query.benefitUsage.findFirst({
        where: and(
          eq(schema.benefitUsage.userId, session.user.id),
          eq(schema.benefitUsage.benefitId, benefitId),
          eq(schema.benefitUsage.periodKey, bounds.periodKey),
          eq(schema.benefitUsage.manualOverride, true)
        ),
      });

      if (!usage) {
        return NextResponse.json(
          { error: "No manual redemption found to undo" },
          { status: 404 }
        );
      }

      // Restore original values from overrideNote
      const original = JSON.parse(usage.overrideNote || "{}");

      await db
        .update(schema.benefitUsage)
        .set({
          amountUsed: original.amountUsed ?? 0,
          amountRemaining: original.amountRemaining ?? benefitDef.creditAmount,
          isFullyUsed: original.isFullyUsed ?? false,
          manualOverride: false,
          overrideNote: null,
          updatedAt: new Date(),
        })
        .where(eq(schema.benefitUsage.id, usage.id));
    }

    // Refresh insights after undo/reset
    try {
      await generateAndPersistInsights(session.user.id);
    } catch (e) {
      console.error("Non-fatal: insight refresh failed after undo/reset", e);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error undoing redemption:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to undo redemption" },
      { status: 500 }
    );
  }
}
