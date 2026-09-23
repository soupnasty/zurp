import "server-only";
import { db } from "@/db";
import { and, eq, inArray, sql } from "drizzle-orm";
import * as schema from "@/db/schema";
import { getCardDefinition } from "@/lib/cards";
import { getEarnConfig } from "@/lib/points/earn-configs";
import { valuatePoints } from "@/lib/points/valuation";
import { EARN_CATEGORY_LABELS, isEarnCategory } from "@/lib/points/category-labels";
import { getCurrentCycleBounds } from "@/lib/engine/cycle-utils";
import { getPointsEarningSummary } from "@/lib/points/queries";
import { getCardYear } from "./card-year";
import { computeEarnedCredits, type EarnedCredit } from "./earned";
import { computeUnclaimed, type UnclaimedCredit } from "./unclaimed";
import { computeExpired, type ExpiredSummary } from "./expired";
import { buildTurnOn, type TurnOnItem } from "./turn-on";
import { creditKey, type Activation } from "./types";
import type { ReminderMode } from "./preferences";

export interface RewardsCredit extends Omit<UnclaimedCredit, "thisCycleEnd"> {
  thisCycleEnd: string | null;
  /** Every benefit in the row, for hide / reminder writes. */
  benefitIds: string[];
  /** Benefits the user marked used this period (drives Undo). */
  redeemedBenefitIds: string[];
  howTo: string | null;
  /** A suggestion drawn from the user's own transactions, when one exists. */
  fromSpending: string | null;
  reminder: { mode: ReminderMode; leadDays: number | null };
  /** An active credit_expiring alert covers this row. */
  alerted: boolean;
}

export interface RewardsView {
  cardYear: { start: string; end: string; estimated: boolean; day: number; days: number };
  earned: {
    total: number;
    credits: EarnedCredit[];
    creditsTotal: number;
    points: {
      total: number;
      value: number;
      cpp: number;
      categories: { label: string; rate: number; spend: number; points: number }[];
    } | null;
  };
  credits: RewardsCredit[];
  hidden: { key: string; name: string; benefitIds: string[] }[];
  turnOn: (TurnOnItem & { howTo: string | null })[];
  pointTips: { id: string; title: string; body: string; extraPoints: number; extraValue: number }[];
  expired: ExpiredSummary;
  notUsingTotal: number;
  soonTotal: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Everything the Rewards page shows for one card profile. */
export async function getRewardsView(
  userId: string,
  cardProfileId: string,
  now: Date = new Date()
): Promise<RewardsView | null> {
  const profile = await db.query.cardProfiles.findFirst({
    where: and(eq(schema.cardProfiles.id, cardProfileId), eq(schema.cardProfiles.userId, userId)),
  });
  const cardDef = profile ? getCardDefinition(profile.cardType) : undefined;
  if (!profile || !cardDef) return null;

  const [usage, overrides, prefs, insightRows, alertRows, pointsSummary] = await Promise.all([
    db.query.benefitUsage.findMany({
      where: and(eq(schema.benefitUsage.userId, userId), eq(schema.benefitUsage.cardProfileId, profile.id)),
    }),
    db.query.benefitOverrides.findMany({
      where: and(eq(schema.benefitOverrides.userId, userId), eq(schema.benefitOverrides.cardProfileId, profile.id)),
    }),
    db.query.benefitPreferences.findMany({
      where: and(eq(schema.benefitPreferences.userId, userId), eq(schema.benefitPreferences.cardProfileId, profile.id)),
    }),
    db.query.insights.findMany({
      where: and(
        eq(schema.insights.userId, userId),
        inArray(schema.insights.category, ["A1", "A2", "P2"]),
        sql`${schema.insights.state} IN ('pending', 'shown')`
      ),
    }),
    db.query.alerts.findMany({
      where: and(
        eq(schema.alerts.userId, userId),
        eq(schema.alerts.cardProfileId, profile.id),
        eq(schema.alerts.type, "credit_expiring"),
        eq(schema.alerts.state, "active")
      ),
    }),
    getPointsEarningSummary(userId, profile.id),
  ]);

  const benefits = cardDef.benefits;
  const byId = new Map(benefits.map((b) => [b.id, b]));
  const cardYear = getCardYear(profile.anniversaryDate, now);
  const hiddenIds = new Set(prefs.filter((p) => p.hidden).map((p) => p.benefitId));
  const prefById = new Map(prefs.map((p) => [p.benefitId, p]));
  // A credit is on if the user said so, or if it has ever paid out.
  const activatedIds = new Set([
    ...prefs.filter((p) => p.activatedAt).map((p) => p.benefitId),
    ...usage.filter((u) => u.amountUsed > 0).map((u) => u.benefitId),
  ]);

  // Subscription activations are stored as ACTIVATED:MM-YYYY overrides.
  const activations: Activation[] = overrides.flatMap((o) => {
    const m = /^ACTIVATED:(\d{2})-(\d{4})$/.exec(o.periodKey);
    return m ? [{ benefitId: o.benefitId, activatedAt: new Date(Date.UTC(Number(m[2]), Number(m[1]) - 1, 1)) }] : [];
  });

  const earnedCredits = computeEarnedCredits(benefits, usage, activations, cardYear, now);
  const unclaimed = computeUnclaimed(benefits, usage, cardYear, profile.anniversaryDate, now, hiddenIds);
  const expired = computeExpired(benefits, usage, cardYear, profile.createdAt, now, hiddenIds);
  const turnOn = buildTurnOn(benefits, unclaimed, activations, activatedIds, cardYear, now, hiddenIds);

  const membersOf = (key: string) => benefits.filter((b) => creditKey(b) === key);
  const howTo = (key: string): string | null => {
    const b = membersOf(key)[0];
    return b?.details?.howToUse?.[0] ?? b?.notes ?? null;
  };

  // A1/A2 insights point at the credit the user's own spending could have used.
  const spendingHint = new Map<string, string>();
  for (const i of insightRows) {
    const b = i.benefitId ? byId.get(i.benefitId) : undefined;
    if (b && (i.category === "A1" || i.category === "A2") && !spendingHint.has(creditKey(b))) {
      spendingHint.set(creditKey(b), i.renderedBody);
    }
  }

  // Alerts are keyed by displayGroup ?? benefitId; credit rows by displayGroup ?? name.
  const alertedKeys = new Set<string>();
  for (const a of alertRows) {
    const alertKey = String(a.payload.benefitKey ?? "");
    const b = byId.get(alertKey) ?? benefits.find((x) => x.displayGroup === alertKey);
    if (b) alertedKeys.add(creditKey(b));
  }

  const redeemedThisPeriod = (benefitId: string) => {
    const b = byId.get(benefitId);
    if (!b) return false;
    const { periodKey } = getCurrentCycleBounds(b.cycle, now, profile.anniversaryDate);
    return usage.some((u) => u.benefitId === benefitId && u.periodKey === periodKey && u.manualOverride && u.amountUsed > 0);
  };

  const credits: RewardsCredit[] = unclaimed.map((u) => {
    const members = membersOf(u.key).filter((b) => b.type !== "subscription");
    const memberPrefs = members.map((b) => prefById.get(b.id));
    const custom = memberPrefs.find((p) => p?.reminderMode === "custom");
    const off = memberPrefs.some((p) => p?.reminderMode === "off");
    return {
      ...u,
      thisCycleEnd: u.thisCycleEnd?.toISOString() ?? null,
      benefitIds: members.map((b) => b.id),
      redeemedBenefitIds: members.filter((b) => redeemedThisPeriod(b.id)).map((b) => b.id),
      howTo: howTo(u.key),
      fromSpending: spendingHint.get(u.key) ?? null,
      reminder: off
        ? { mode: "off", leadDays: null }
        : custom
          ? { mode: "custom", leadDays: custom.reminderLeadDays }
          : { mode: "auto", leadDays: null },
      alerted: alertedKeys.has(u.key),
    };
  });

  const hidden = Array.from(
    new Map(
      benefits
        .filter((b) => hiddenIds.has(b.id))
        .map((b) => [creditKey(b), { key: creditKey(b), name: b.displayGroupName ?? b.name, benefitIds: membersOf(creditKey(b)).map((m) => m.id) }])
    ).values()
  );

  const earnConfig = getEarnConfig(profile.cardType);
  const points =
    pointsSummary && earnConfig
      ? {
          total: pointsSummary.totalPoints,
          value: valuatePoints(pointsSummary.totalPoints, earnConfig).realistic,
          cpp: (earnConfig.valuation.conservativeCpp + earnConfig.valuation.upsideCpp) / 2,
          categories: pointsSummary.categoryBreakdown
            .filter((c) => c.points > 0)
            .sort((a, b) => b.points - a.points)
            .map((c) => ({
              label: isEarnCategory(c.category) ? EARN_CATEGORY_LABELS[c.category] : c.category,
              rate: c.earnRate,
              spend: c.spend,
              points: c.points,
            })),
        }
      : null;

  // Newest P2 per template (dedup keys are monthly).
  const tips = new Map<string, (typeof insightRows)[number]>();
  for (const i of insightRows.filter((r) => r.category === "P2")) {
    const prev = tips.get(i.templateKey);
    if (!prev || i.generatedAt > prev.generatedAt) tips.set(i.templateKey, i);
  }

  const notUsingTotal =
    credits.reduce((s, c) => s + c.restOfYear, 0) +
    turnOn.filter((t) => !t.on && t.kind === "subscription").reduce((s, t) => s + t.value, 0);

  return {
    cardYear: {
      start: cardYear.start.toISOString(),
      end: cardYear.end.toISOString(),
      estimated: cardYear.estimated,
      day: Math.floor((now.getTime() - cardYear.start.getTime()) / DAY_MS) + 1,
      days: Math.round((cardYear.end.getTime() - cardYear.start.getTime()) / DAY_MS),
    },
    earned: {
      total: Math.round((earnedCredits.total + (points?.value ?? 0)) * 100) / 100,
      credits: earnedCredits.credits,
      creditsTotal: earnedCredits.total,
      points,
    },
    credits,
    hidden,
    // Items switched on by use (not by the user) need no action and no Undo.
    turnOn: turnOn
      .filter((t) => !t.on || t.kind === "subscription" || t.benefitIds.some((id) => prefById.get(id)?.activatedAt))
      .map((t) => ({ ...t, howTo: howTo(t.key) })),
    pointTips: Array.from(tips.values()).map((i) => ({
      id: i.id,
      title: i.renderedTitle,
      body: i.renderedBody,
      extraPoints: Number(i.templateVars.extra_points ?? 0),
      extraValue: Number(i.templateVars.extra_value ?? 0),
    })),
    expired,
    notUsingTotal: Math.round(notUsingTotal * 100) / 100,
    soonTotal:
      Math.round(credits.filter((c) => c.daysLeft !== null && c.daysLeft <= 14).reduce((s, c) => s + c.thisCycle, 0) * 100) / 100,
  };
}
