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

    const { transactionId, benefitId, benefitUsageId } = await request.json();

    if (!transactionId || !benefitUsageId) {
      return NextResponse.json(
        { error: "transactionId and benefitUsageId are required" },
        { status: 400 }
      );
    }

    // Verify the transaction belongs to this user
    const tx = await db.query.transactions.findFirst({
      where: and(
        eq(schema.transactions.id, transactionId),
        eq(schema.transactions.userId, session.user.id)
      ),
    });

    if (!tx) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Get the benefit usage record
    const usage = await db.query.benefitUsage.findFirst({
      where: and(
        eq(schema.benefitUsage.id, benefitUsageId),
        eq(schema.benefitUsage.userId, session.user.id)
      ),
    });

    if (!usage) {
      return NextResponse.json(
        { error: "Benefit usage record not found" },
        { status: 404 }
      );
    }

    const creditApplied = Math.min(tx.amount, usage.amountRemaining);

    // Create manual match
    await db.insert(schema.matchedTx).values({
      transactionId,
      benefitUsageId,
      creditApplied,
      matchMethod: "manual",
      matchConfidence: "high",
    });

    // Update usage
    const newUsed = usage.amountUsed + creditApplied;
    await db
      .update(schema.benefitUsage)
      .set({
        amountUsed: newUsed,
        amountRemaining: Math.max(0, usage.amountRemaining - creditApplied),
        isFullyUsed: newUsed >= (usage.amountRemaining + usage.amountUsed),
        updatedAt: new Date(),
      })
      .where(eq(schema.benefitUsage.id, benefitUsageId));

    // Update transaction status
    await db
      .update(schema.transactions)
      .set({ matchedStatus: "matched" })
      .where(eq(schema.transactions.id, transactionId));

    return NextResponse.json({ creditApplied });
  } catch (error: any) {
    console.error("Error confirming benefit:", error);
    return NextResponse.json(
      { error: "Failed to confirm benefit" },
      { status: 500 }
    );
  }
}
