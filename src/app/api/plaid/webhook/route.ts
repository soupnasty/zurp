import { NextResponse } from "next/server";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";
import { triggerSync } from "@/lib/plaid-sync";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { webhook_type, webhook_code, item_id, error } = body;

    console.log(`Plaid webhook: ${webhook_type}.${webhook_code}`, {
      item_id,
      error,
    });

    // Find the connection by Plaid item ID
    const connection = await db.query.plaidConnections.findFirst({
      where: eq(schema.plaidConnections.plaidItemId, item_id),
    });

    if (!connection) {
      console.warn(`Webhook for unknown item: ${item_id}`);
      return NextResponse.json({ received: true });
    }

    // Handle transaction sync updates
    if (
      webhook_type === "TRANSACTIONS" &&
      webhook_code === "SYNC_UPDATES_AVAILABLE"
    ) {
      await triggerSync(connection.id);
      return NextResponse.json({ received: true, synced: true });
    }

    // Handle item errors (needs reauth, disconnected, etc.)
    if (webhook_type === "ITEM") {
      if (webhook_code === "ERROR") {
        const errorCode = error?.error_code;

        if (
          errorCode === "ITEM_LOGIN_REQUIRED" ||
          errorCode === "PENDING_EXPIRATION"
        ) {
          await db
            .update(schema.plaidConnections)
            .set({ status: "needs_reauth" })
            .where(eq(schema.plaidConnections.id, connection.id));
        } else {
          await db
            .update(schema.plaidConnections)
            .set({ status: "disconnected" })
            .where(eq(schema.plaidConnections.id, connection.id));
        }

        return NextResponse.json({ received: true, statusUpdated: true });
      }

      if (webhook_code === "PENDING_EXPIRATION") {
        await db
          .update(schema.plaidConnections)
          .set({ status: "needs_reauth" })
          .where(eq(schema.plaidConnections.id, connection.id));

        return NextResponse.json({ received: true, statusUpdated: true });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook processing error:", err?.message || err);
    // Always return 200 to Plaid so it doesn't retry endlessly
    return NextResponse.json({ received: true, error: "Processing failed" });
  }
}
