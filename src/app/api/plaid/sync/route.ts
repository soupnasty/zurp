import { NextResponse } from "next/server";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { triggerSync } from "@/lib/plaid-sync";
import { createRateLimiter } from "@/lib/rate-limiter";

// 10 sync requests per minute per user
const syncLimiter = createRateLimiter(60_000, 10);

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit sync requests per user
    const { allowed, retryAfterMs } = syncLimiter(session.user.id);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many sync requests. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil((retryAfterMs || 60000) / 1000)) },
        }
      );
    }

    const { connectionId } = await request.json();

    if (!connectionId) {
      return NextResponse.json(
        { error: "connectionId is required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const connection = await db.query.plaidConnections.findFirst({
      where: eq(schema.plaidConnections.id, connectionId),
    });

    if (!connection || connection.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Connection not found" },
        { status: 404 }
      );
    }

    // 24-hour cooldown between manual syncs (per connection)
    const SYNC_COOLDOWN_MS = 24 * 60 * 60 * 1000;
    if (connection.lastSyncedAt) {
      const elapsed = Date.now() - new Date(connection.lastSyncedAt).getTime();
      if (elapsed < SYNC_COOLDOWN_MS) {
        const hoursLeft = Math.ceil((SYNC_COOLDOWN_MS - elapsed) / (60 * 60 * 1000));
        return NextResponse.json(
          { error: `Sync available in ${hoursLeft}h. Data refreshes automatically.` },
          { status: 429 }
        );
      }
    }

    const result = await triggerSync(connectionId);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error syncing transactions:", error);
    return NextResponse.json(
      { error: "Failed to sync transactions" },
      { status: 500 }
    );
  }
}
