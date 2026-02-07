import { NextResponse } from "next/server";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, lt, and } from "drizzle-orm";
import { triggerSync } from "@/lib/plaid-sync";

const STALE_THRESHOLD_HOURS = 6;

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const staleThreshold = new Date(
    Date.now() - STALE_THRESHOLD_HOURS * 60 * 60 * 1000
  );

  // Find active connections that haven't synced recently
  const staleConnections = await db.query.plaidConnections.findMany({
    where: and(
      eq(schema.plaidConnections.status, "active"),
      lt(schema.plaidConnections.lastSyncedAt, staleThreshold)
    ),
  });

  const results: { connectionId: string; success: boolean; error?: string }[] =
    [];

  for (const connection of staleConnections) {
    try {
      await triggerSync(connection.id);
      results.push({ connectionId: connection.id, success: true });
    } catch (err: any) {
      console.error(
        `Cron sync failed for ${connection.id}:`,
        err?.message || err
      );
      results.push({
        connectionId: connection.id,
        success: false,
        error: err?.message,
      });
    }
  }

  return NextResponse.json({
    synced: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
    total: staleConnections.length,
    results,
  });
}
