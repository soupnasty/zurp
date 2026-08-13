import { db } from "@/db";
import { eq, and, inArray } from "drizzle-orm";
import * as schema from "@/db/schema";
import { getCardDefinition } from "@/lib/cards";
import { getRenewalStatus } from "@/lib/home/queries";
import {
  generateCreditExpiryAlerts,
  generateRenewalVerdictAlert,
  generateConnectionAlerts,
} from "./generators";
import type { AlertCandidate, CreditGroupState } from "./types";

/**
 * Generate and persist alerts for a user. Runs after every sync (and,
 * later, on the daily cron tick). Idempotent: candidates upsert by
 * (userId, dedupKey); active alerts whose condition cleared are
 * auto-resolved; past-window alerts expire.
 */
export async function generateAndPersistAlerts(userId: string) {
  const now = new Date();

  const [profiles, connections] = await Promise.all([
    db.query.cardProfiles.findMany({
      where: eq(schema.cardProfiles.userId, userId),
    }),
    db.query.plaidConnections.findMany({
      where: eq(schema.plaidConnections.userId, userId),
      columns: { id: true, institutionName: true, status: true },
    }),
  ]);

  const candidates: AlertCandidate[] = [];

  // ── credit_expiring + renewal_verdict per card profile ──
  for (const profile of profiles) {
    const cardDef = getCardDefinition(profile.cardType);
    if (!cardDef) continue;

    const usage = await db.query.benefitUsage.findMany({
      where: and(
        eq(schema.benefitUsage.userId, userId),
        eq(schema.benefitUsage.cardProfileId, profile.id)
      ),
      columns: {
        benefitId: true,
        periodKey: true,
        amountUsed: true,
        amountRemaining: true,
        cycleEnd: true,
      },
    });

    candidates.push(
      ...generateCreditExpiryAlerts(
        profile.id,
        buildCreditGroups(cardDef, usage, now),
        now
      )
    );

    const renewal = await getRenewalStatus(userId, profile.id);
    if (renewal) {
      const alert = generateRenewalVerdictAlert(
        profile.id,
        profile.cardLabel ?? cardDef.name,
        renewal,
        now
      );
      if (alert) candidates.push(alert);
    }
  }

  // ── connection_broken ──
  candidates.push(...generateConnectionAlerts(connections, now));

  // ── upsert candidates ──
  const existing = await db.query.alerts.findMany({
    where: eq(schema.alerts.userId, userId),
  });
  const existingByKey = new Map(existing.map((a) => [a.dedupKey, a]));

  for (const c of candidates) {
    const prev = existingByKey.get(c.dedupKey);

    if (!prev) {
      await db.insert(schema.alerts).values({
        userId,
        cardProfileId: c.cardProfileId,
        type: c.type,
        dedupKey: c.dedupKey,
        severity: c.severity,
        title: c.title,
        body: c.body,
        payload: c.payload,
        effectiveAt: c.effectiveAt,
        expiresAt: c.expiresAt,
        state: "active",
      });
      continue;
    }

    // A dismissal is a user decision — never resurrect over it.
    if (prev.state === "dismissed") continue;

    const prevStage = (prev.payload as Record<string, unknown>)?.stage;
    const nextStage = c.payload.stage;
    const escalating = prevStage !== nextStage;
    const reactivating = prev.state !== "active";

    await db
      .update(schema.alerts)
      .set({
        title: c.title,
        body: c.body,
        payload: c.payload,
        severity: c.severity,
        expiresAt: c.expiresAt,
        state: "active",
        // Re-badge on escalation or reactivation, otherwise keep read state
        readAt: escalating || reactivating ? null : prev.readAt,
        resolvedAt: null,
        updatedAt: now,
      })
      .where(eq(schema.alerts.id, prev.id));
  }

  // ── auto-resolve/expire active alerts whose condition cleared ──
  const candidateKeys = new Set(candidates.map((c) => c.dedupKey));
  const toClose = existing.filter(
    (a) => a.state === "active" && !candidateKeys.has(a.dedupKey)
  );

  const expireIds = toClose
    .filter((a) => a.expiresAt !== null && a.expiresAt < now)
    .map((a) => a.id);
  const resolveIds = toClose
    .filter((a) => a.expiresAt === null || a.expiresAt >= now)
    .map((a) => a.id);

  if (expireIds.length > 0) {
    await db
      .update(schema.alerts)
      .set({ state: "expired", updatedAt: now })
      .where(inArray(schema.alerts.id, expireIds));
  }
  if (resolveIds.length > 0) {
    await db
      .update(schema.alerts)
      .set({ state: "resolved", resolvedAt: now, updatedAt: now })
      .where(inArray(schema.alerts.id, resolveIds));
  }
}

/**
 * Collapse benefit usage rows into per-group current-period state plus
 * a recent full-use history for habit suppression.
 */
function buildCreditGroups(
  cardDef: NonNullable<ReturnType<typeof getCardDefinition>>,
  usage: Array<{
    benefitId: string;
    periodKey: string;
    amountUsed: number;
    amountRemaining: number;
    cycleEnd: Date;
  }>,
  now: Date
): CreditGroupState[] {
  const benefitById = new Map(cardDef.benefits.map((b) => [b.id, b]));

  // group key → periodKey → { remaining, used, cycleEnd }
  const byGroupPeriod = new Map<
    string,
    Map<string, { remaining: number; used: number; cycleEnd: Date }>
  >();
  const groupMeta = new Map<string, { name: string; cycle: string }>();

  for (const row of usage) {
    const benefit = benefitById.get(row.benefitId);
    if (!benefit || benefit.type !== "credit") continue;

    const key = benefit.displayGroup ?? benefit.id;
    if (!groupMeta.has(key)) {
      groupMeta.set(key, {
        name: benefit.displayGroupName ?? benefit.name,
        cycle: benefit.cycle,
      });
    }

    let periods = byGroupPeriod.get(key);
    if (!periods) {
      periods = new Map();
      byGroupPeriod.set(key, periods);
    }
    const agg = periods.get(row.periodKey) ?? {
      remaining: 0,
      used: 0,
      cycleEnd: row.cycleEnd,
    };
    agg.remaining += row.amountRemaining;
    agg.used += row.amountUsed;
    if (row.cycleEnd > agg.cycleEnd) agg.cycleEnd = row.cycleEnd;
    periods.set(row.periodKey, agg);
  }

  const groups: CreditGroupState[] = [];
  for (const [key, periods] of byGroupPeriod) {
    const meta = groupMeta.get(key)!;
    const all = Array.from(periods.entries()).map(([periodKey, agg]) => ({
      periodKey,
      ...agg,
    }));

    // Current period: the one ending soonest that hasn't ended yet
    const current = all
      .filter((p) => p.cycleEnd >= now)
      .sort((a, b) => a.cycleEnd.getTime() - b.cycleEnd.getTime())[0];
    if (!current) continue;

    // Completed periods, newest first, for habit suppression
    const recentFullUse = all
      .filter((p) => p.cycleEnd < now)
      .sort((a, b) => b.cycleEnd.getTime() - a.cycleEnd.getTime())
      .slice(0, 6)
      .map((p) => p.remaining <= 0.005);

    groups.push({
      key,
      name: meta.name,
      cycle: meta.cycle as CreditGroupState["cycle"],
      periodKey: current.periodKey,
      remaining: Math.round(current.remaining * 100) / 100,
      cycleEnd: current.cycleEnd,
      recentFullUse,
    });
  }

  return groups;
}
