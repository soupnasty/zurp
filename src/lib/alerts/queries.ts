import "server-only";
import { db } from "@/db";
import { eq, and, isNull, inArray, desc } from "drizzle-orm";
import * as schema from "@/db/schema";
import { getCardDefinition } from "@/lib/cards";

export type AlertRow = typeof schema.alerts.$inferSelect;

/** Active alerts, renewal verdict first, then soonest-expiring. */
export async function getActiveAlerts(userId: string): Promise<AlertRow[]> {
  const rows = await db.query.alerts.findMany({
    where: and(
      eq(schema.alerts.userId, userId),
      eq(schema.alerts.state, "active")
    ),
  });

  return rows.sort((a, b) => {
    if (a.type === "renewal_verdict" !== (b.type === "renewal_verdict")) {
      return a.type === "renewal_verdict" ? -1 : 1;
    }
    const aEnd = a.expiresAt?.getTime() ?? Infinity;
    const bEnd = b.expiresAt?.getTime() ?? Infinity;
    return aEnd - bEnd;
  });
}

/** Recently resolved/expired alerts for the history section. */
export async function getRecentClosedAlerts(
  userId: string,
  limit = 5
): Promise<AlertRow[]> {
  return db.query.alerts.findMany({
    where: and(
      eq(schema.alerts.userId, userId),
      inArray(schema.alerts.state, ["resolved", "expired"])
    ),
    orderBy: [desc(schema.alerts.updatedAt)],
    limit,
  });
}

/** Unread action alerts — drives the nav badge. Reports never badge. */
export async function getUnreadAlertCount(userId: string): Promise<number> {
  const rows = await db.query.alerts.findMany({
    where: and(
      eq(schema.alerts.userId, userId),
      eq(schema.alerts.state, "active"),
      eq(schema.alerts.severity, "action"),
      isNull(schema.alerts.readAt)
    ),
    columns: { id: true },
  });
  return rows.length;
}

/** Mark every unread alert read (called when the Alerts page renders). */
export async function markAllAlertsRead(userId: string) {
  await db
    .update(schema.alerts)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(schema.alerts.userId, userId),
        eq(schema.alerts.state, "active"),
        isNull(schema.alerts.readAt)
      )
    );
}

/** Dismiss one alert. Ownership enforced by the userId predicate. */
export async function dismissAlert(userId: string, alertId: string) {
  await db
    .update(schema.alerts)
    .set({ state: "dismissed", updatedAt: new Date() })
    .where(
      and(eq(schema.alerts.id, alertId), eq(schema.alerts.userId, userId))
    );
}

export interface RenewalStatus {
  /** ISO date of the next fee renewal. */
  renewsAt: string;
  daysUntil: number;
  annualFee: number;
}

/**
 * When a fee card's annual fee next posts. Null when the card has no fee
 * or no anniversary date yet.
 */
export async function getRenewalStatus(
  userId: string,
  cardProfileId: string
): Promise<RenewalStatus | null> {
  const profile = await db.query.cardProfiles.findFirst({
    where: and(eq(schema.cardProfiles.userId, userId), eq(schema.cardProfiles.id, cardProfileId)),
  });
  if (!profile || !profile.anniversaryDate) return null;

  const cardDef = getCardDefinition(profile.cardType);
  if (!cardDef || cardDef.annualFee <= 0) return null;

  // Next renewal: anniversary advanced year by year until it's in the future
  const now = new Date();
  const renewal = new Date(profile.anniversaryDate);
  while (renewal <= now) {
    renewal.setUTCFullYear(renewal.getUTCFullYear() + 1);
  }
  return {
    renewsAt: renewal.toISOString(),
    daysUntil: Math.ceil((renewal.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)),
    annualFee: cardDef.annualFee,
  };
}
