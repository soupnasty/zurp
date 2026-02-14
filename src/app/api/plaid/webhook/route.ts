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

    // Handle transaction webhooks
    if (webhook_type === "TRANSACTIONS") {
      if (webhook_code === "INITIAL_UPDATE") {
        console.log(`[webhook] INITIAL_UPDATE for ${connection.id}, triggering sync`);
        await db
          .update(schema.plaidConnections)
          .set({ syncStatus: "initial" })
          .where(eq(schema.plaidConnections.id, connection.id));
        await triggerSync(connection.id);
        return NextResponse.json({ received: true, synced: true });
      }

      if (webhook_code === "HISTORICAL_UPDATE") {
        console.log(`[webhook] HISTORICAL_UPDATE for ${connection.id}, triggering sync`);
        await triggerSync(connection.id);
        await db
          .update(schema.plaidConnections)
          .set({ syncStatus: "complete" })
          .where(eq(schema.plaidConnections.id, connection.id));
        return NextResponse.json({ received: true, synced: true });
      }

      if (webhook_code === "SYNC_UPDATES_AVAILABLE") {
        console.log(`[webhook] SYNC_UPDATES_AVAILABLE for ${connection.id}, triggering sync`);
        await triggerSync(connection.id);
        return NextResponse.json({ received: true, synced: true });
      }
    }

    // Handle item webhooks
    if (webhook_type === "ITEM") {
      // New accounts available — trigger sync to pick up new accounts
      if (webhook_code === "NEW_ACCOUNTS_AVAILABLE") {
        console.log(`New accounts available for item ${item_id}, syncing...`);
        await triggerSync(connection.id);
        return NextResponse.json({ received: true, synced: true });
      }

      // Item errors (needs reauth, disconnected, etc.)
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
