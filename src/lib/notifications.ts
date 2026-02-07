import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";

export type AlertType = "stale" | "needs_reauth" | "disconnected";

export interface ConnectionAlert {
  connectionId: string;
  institutionName: string;
  type: AlertType;
  message: string;
}

const STALE_THRESHOLD_HOURS = 24;

export async function getConnectionAlerts(
  userId: string
): Promise<ConnectionAlert[]> {
  const connections = await db.query.plaidConnections.findMany({
    where: eq(schema.plaidConnections.userId, userId),
  });

  const alerts: ConnectionAlert[] = [];
  const now = Date.now();

  for (const conn of connections) {
    if (conn.status === "needs_reauth") {
      alerts.push({
        connectionId: conn.id,
        institutionName: conn.institutionName,
        type: "needs_reauth",
        message: `Your ${conn.institutionName} connection needs to be re-authenticated.`,
      });
    } else if (conn.status === "disconnected") {
      alerts.push({
        connectionId: conn.id,
        institutionName: conn.institutionName,
        type: "disconnected",
        message: `Your ${conn.institutionName} connection has been disconnected. Please re-link your account.`,
      });
    } else if (
      conn.status === "active" &&
      conn.lastSyncedAt &&
      now - conn.lastSyncedAt.getTime() > STALE_THRESHOLD_HOURS * 60 * 60 * 1000
    ) {
      alerts.push({
        connectionId: conn.id,
        institutionName: conn.institutionName,
        type: "stale",
        message: `Your ${conn.institutionName} data hasn't synced in over 24 hours.`,
      });
    }
  }

  return alerts;
}
