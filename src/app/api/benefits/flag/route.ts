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

    const { transactionId, benefitId, benefitUsageId, flagType, reason } =
      await request.json();

    if (!transactionId || !benefitId || !flagType) {
      return NextResponse.json(
        { error: "transactionId, benefitId, and flagType are required" },
        { status: 400 }
      );
    }

    if (flagType !== "removed" && flagType !== "added" && flagType !== "skipped") {
      return NextResponse.json(
        { error: "flagType must be 'removed', 'added', or 'skipped'" },
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

    const flagId = crypto.randomUUID();

    if (flagType === "skipped") {
      // Mark transaction as skipped — no credit applied, no matchedTx created
      await db
        .update(schema.transactions)
        .set({ matchedStatus: "skipped" })
        .where(eq(schema.transactions.id, transactionId));

      // Upsert flag (delete any stale flag from prior attempts, then insert)
      await db
        .delete(schema.transactionFlags)
        .where(
          and(
            eq(schema.transactionFlags.userId, session.user.id),
            eq(schema.transactionFlags.transactionId, transactionId),
            eq(schema.transactionFlags.benefitId, benefitId)
          )
        );
      await db.insert(schema.transactionFlags).values({
        id: flagId,
        userId: session.user.id,
        transactionId,
        benefitId,
        flagType: "skipped",
        reason: reason || null,
        originalMatch: false,
      });

      return NextResponse.json({ flag: { id: flagId }, creditApplied: 0 });
    }

    if (flagType === "removed") {
      let creditApplied = 0;

      // Find the matchedTx record (may already be deleted by a prior partial attempt)
      const matchedRecord = benefitUsageId
        ? await db.query.matchedTx.findFirst({
            where: and(
              eq(schema.matchedTx.transactionId, transactionId),
              eq(schema.matchedTx.benefitUsageId, benefitUsageId)
            ),
          })
        : null;

      if (matchedRecord) {
        creditApplied = matchedRecord.creditApplied;

        // Get the benefitUsage record
        const usage = await db.query.benefitUsage.findFirst({
          where: eq(schema.benefitUsage.id, matchedRecord.benefitUsageId),
        });

        // Delete the matchedTx record
        await db
          .delete(schema.matchedTx)
          .where(eq(schema.matchedTx.id, matchedRecord.id));

        // Recalculate benefitUsage
        if (usage) {
          const newUsed = Math.max(0, usage.amountUsed - creditApplied);
          const totalCredit = usage.amountUsed + usage.amountRemaining;
          await db
            .update(schema.benefitUsage)
            .set({
              amountUsed: newUsed,
              amountRemaining: totalCredit - newUsed,
              isFullyUsed: false,
              updatedAt: new Date(),
            })
            .where(eq(schema.benefitUsage.id, usage.id));
        }
      }

      // Update transaction status
      await db
        .update(schema.transactions)
        .set({ matchedStatus: "unmatched" })
        .where(eq(schema.transactions.id, transactionId));

      // Upsert flag (delete any stale flag from prior attempts, then insert)
      await db
        .delete(schema.transactionFlags)
        .where(
          and(
            eq(schema.transactionFlags.userId, session.user.id),
            eq(schema.transactionFlags.transactionId, transactionId),
            eq(schema.transactionFlags.benefitId, benefitId)
          )
        );
      await db.insert(schema.transactionFlags).values({
        id: flagId,
        userId: session.user.id,
        transactionId,
        benefitId,
        flagType: "removed",
        reason: reason || null,
        originalMatch: true,
      });

      return NextResponse.json({ flag: { id: flagId }, creditApplied });
    }

    // flagType === "added"
    // Find the benefitUsage record for current period
    const usageRecords = await db.query.benefitUsage.findMany({
      where: and(
        eq(schema.benefitUsage.userId, session.user.id),
        eq(schema.benefitUsage.benefitId, benefitId)
      ),
    });

    // Find the current-period usage (most recent by cycleEnd that hasn't ended,
    // or the latest one if all have ended)
    const now = new Date();
    const currentUsage =
      usageRecords.find(
        (u) => new Date(u.cycleStart) <= now && new Date(u.cycleEnd) >= now
      ) || usageRecords[0];

    if (!currentUsage) {
      return NextResponse.json(
        { error: "No benefit usage record found for current period" },
        { status: 404 }
      );
    }

    // Calculate creditApplied
    const creditApplied = Math.min(tx.amount, currentUsage.amountRemaining);

    // Create matchedTx record
    await db.insert(schema.matchedTx).values({
      transactionId,
      benefitUsageId: currentUsage.id,
      creditApplied,
      matchMethod: "manual",
      matchConfidence: "high",
    });

    // Update benefitUsage
    const newUsed = currentUsage.amountUsed + creditApplied;
    const totalCredit = currentUsage.amountUsed + currentUsage.amountRemaining;
    await db
      .update(schema.benefitUsage)
      .set({
        amountUsed: newUsed,
        amountRemaining: Math.max(0, totalCredit - newUsed),
        isFullyUsed: newUsed >= totalCredit,
        updatedAt: new Date(),
      })
      .where(eq(schema.benefitUsage.id, currentUsage.id));

    // Update transaction status
    await db
      .update(schema.transactions)
      .set({ matchedStatus: "matched" })
      .where(eq(schema.transactions.id, transactionId));

    // Upsert flag (delete any stale flag from prior attempts, then insert)
    await db
      .delete(schema.transactionFlags)
      .where(
        and(
          eq(schema.transactionFlags.userId, session.user.id),
          eq(schema.transactionFlags.transactionId, transactionId),
          eq(schema.transactionFlags.benefitId, benefitId)
        )
      );
    await db.insert(schema.transactionFlags).values({
      id: flagId,
      userId: session.user.id,
      transactionId,
      benefitId,
      flagType: "added",
      reason: null,
      originalMatch: false,
    });

    return NextResponse.json({ flag: { id: flagId }, creditApplied });
  } catch (error: any) {
    console.error("Error creating flag:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create flag" },
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

    const { flagId } = await request.json();

    if (!flagId) {
      return NextResponse.json(
        { error: "flagId is required" },
        { status: 400 }
      );
    }

    // Get the flag
    const flag = await db.query.transactionFlags.findFirst({
      where: and(
        eq(schema.transactionFlags.id, flagId),
        eq(schema.transactionFlags.userId, session.user.id)
      ),
    });

    if (!flag) {
      return NextResponse.json({ error: "Flag not found" }, { status: 404 });
    }

    if (flag.flagType === "skipped") {
      // Undo skip: revert transaction to ambiguous
      await db
        .update(schema.transactions)
        .set({ matchedStatus: "ambiguous" })
        .where(eq(schema.transactions.id, flag.transactionId));
    } else if (flag.flagType === "removed") {
      // Re-create the matchedTx: find the current-period usage for this benefit
      const usageRecords = await db.query.benefitUsage.findMany({
        where: and(
          eq(schema.benefitUsage.userId, session.user.id),
          eq(schema.benefitUsage.benefitId, flag.benefitId)
        ),
      });

      const now = new Date();
      const currentUsage =
        usageRecords.find(
          (u) => new Date(u.cycleStart) <= now && new Date(u.cycleEnd) >= now
        ) || usageRecords[0];

      if (!currentUsage) {
        return NextResponse.json(
          { error: "No benefit usage record found" },
          { status: 404 }
        );
      }

      const tx = await db.query.transactions.findFirst({
        where: eq(schema.transactions.id, flag.transactionId),
      });

      if (!tx) {
        return NextResponse.json(
          { error: "Transaction not found" },
          { status: 404 }
        );
      }

      const creditApplied = Math.min(tx.amount, currentUsage.amountRemaining);

      // Re-create the match
      await db.insert(schema.matchedTx).values({
        transactionId: flag.transactionId,
        benefitUsageId: currentUsage.id,
        creditApplied,
        matchMethod: "manual",
        matchConfidence: "high",
      });

      // Update benefitUsage
      const newUsed = currentUsage.amountUsed + creditApplied;
      const totalCredit =
        currentUsage.amountUsed + currentUsage.amountRemaining;
      await db
        .update(schema.benefitUsage)
        .set({
          amountUsed: newUsed,
          amountRemaining: Math.max(0, totalCredit - newUsed),
          isFullyUsed: newUsed >= totalCredit,
          updatedAt: new Date(),
        })
        .where(eq(schema.benefitUsage.id, currentUsage.id));

      // Update transaction status
      await db
        .update(schema.transactions)
        .set({ matchedStatus: "matched" })
        .where(eq(schema.transactions.id, flag.transactionId));
    } else {
      // flag.flagType === "added" — undo: delete the matchedTx, update usage
      // Find the benefitUsage for this benefit to locate the exact matchedTx
      const usageRecords = await db.query.benefitUsage.findMany({
        where: and(
          eq(schema.benefitUsage.userId, session.user.id),
          eq(schema.benefitUsage.benefitId, flag.benefitId)
        ),
      });

      for (const usage of usageRecords) {
        const matchedRecord = await db.query.matchedTx.findFirst({
          where: and(
            eq(schema.matchedTx.transactionId, flag.transactionId),
            eq(schema.matchedTx.benefitUsageId, usage.id)
          ),
        });

        if (matchedRecord) {
          const creditApplied = matchedRecord.creditApplied;

          // Delete the match
          await db
            .delete(schema.matchedTx)
            .where(eq(schema.matchedTx.id, matchedRecord.id));

          // Update benefitUsage
          const newUsed = Math.max(0, usage.amountUsed - creditApplied);
          const totalCredit = usage.amountUsed + usage.amountRemaining;
          await db
            .update(schema.benefitUsage)
            .set({
              amountUsed: newUsed,
              amountRemaining: totalCredit - newUsed,
              isFullyUsed: false,
              updatedAt: new Date(),
            })
            .where(eq(schema.benefitUsage.id, usage.id));

          // Update transaction status
          await db
            .update(schema.transactions)
            .set({ matchedStatus: "unmatched" })
            .where(eq(schema.transactions.id, flag.transactionId));

          break;
        }
      }
    }

    // Delete the flag
    await db
      .delete(schema.transactionFlags)
      .where(eq(schema.transactionFlags.id, flagId));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error undoing flag:", error);
    return NextResponse.json(
      { error: "Failed to undo flag" },
      { status: 500 }
    );
  }
}
