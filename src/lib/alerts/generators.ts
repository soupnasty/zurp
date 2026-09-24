import type { BenefitCycle } from "@/lib/types";
import type { RenewalStatus } from "./queries";
import type { VerdictDisplay } from "@/lib/verdict/decide";
import type {
  AlertCandidate,
  BenefitPreference,
  CreditGroupState,
  ConnectionState,
  ReminderPreference,
} from "./types";

/**
 * Pure alert generators — no DB access. The lead-time ladder, habit
 * suppression, and verdict logic live here so they are unit-testable.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

interface ExpiryRule {
  /** Days before cycleEnd at which the alert becomes effective. */
  leadDays: number;
  /** Days at which the alert escalates (re-badges). Null = never. */
  escalateDays: number | null;
  /** Minimum remaining dollars to bother alerting. */
  minRemaining: number;
  /** Suppress when the user maxed this many recent periods in a row. */
  habitStreak: number | null;
}

function expiryRule(cycle: BenefitCycle): ExpiryRule | null {
  switch (cycle) {
    case "monthly":
      return { leadDays: 10, escalateDays: null, minRemaining: 10, habitStreak: 3 };
    case "quarterly_q1":
    case "quarterly_q2":
    case "quarterly_q3":
    case "quarterly_q4":
    case "biannual_h1":
    case "biannual_h2":
      return { leadDays: 21, escalateDays: 7, minRemaining: 10, habitStreak: null };
    case "annual_calendar":
    case "annual_anniversary":
      return { leadDays: 30, escalateDays: 7, minRemaining: 10, habitStreak: null };
    case "quadrennial":
      return { leadDays: 90, escalateDays: null, minRemaining: 10, habitStreak: null };
    case "subscription":
      return null;
    default:
      return null;
  }
}

const SHORT_MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function fmtDate(d: Date): string {
  return `${SHORT_MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

function daysUntil(now: Date, then: Date): number {
  return Math.ceil((then.getTime() - now.getTime()) / DAY_MS);
}

/**
 * One reminder setting for an alert group from its members' preferences.
 * Hidden or off on any member silences the group; otherwise the shortest
 * custom lead time wins; otherwise auto.
 */
export function resolveReminder(prefs: (BenefitPreference | undefined)[]): ReminderPreference {
  const set = prefs.filter((p): p is BenefitPreference => !!p);
  if (set.some((p) => p.hidden || p.reminderMode === "off")) return { mode: "off", leadDays: null };
  const leads = set
    .filter((p) => p.reminderMode === "custom" && p.reminderLeadDays !== null)
    .map((p) => p.reminderLeadDays as number);
  return leads.length > 0 ? { mode: "custom", leadDays: Math.min(...leads) } : { mode: "auto", leadDays: null };
}

/**
 * credit_expiring — a credit with remaining balance approaching its
 * period end, per the lead-time ladder.
 */
export function generateCreditExpiryAlerts(
  cardProfileId: string,
  groups: CreditGroupState[],
  now: Date = new Date()
): AlertCandidate[] {
  const out: AlertCandidate[] = [];

  for (const g of groups) {
    const rule = expiryRule(g.cycle);
    if (!rule || g.reminder?.mode === "off") continue;

    // A reminder the user set replaces the ladder's lead time, and is
    // never filtered by the minimum or by habit suppression.
    const customLead =
      g.reminder?.mode === "custom" && g.reminder.leadDays !== null
        ? g.reminder.leadDays
        : null;
    const leadDays = customLead ?? rule.leadDays;
    if (g.remaining <= 0) continue;
    if (customLead === null && g.remaining < rule.minRemaining) continue;

    const days = daysUntil(now, g.cycleEnd);
    if (days < 0 || days > leadDays) continue;

    // Habit suppression: the user demonstrably doesn't need this nudge.
    if (
      customLead === null &&
      rule.habitStreak !== null &&
      g.recentFullUse.length >= rule.habitStreak &&
      g.recentFullUse.slice(0, rule.habitStreak).every(Boolean)
    ) {
      continue;
    }

    const escalated =
      rule.escalateDays !== null && days <= rule.escalateDays;
    const remaining = Math.round(g.remaining);

    out.push({
      type: "credit_expiring",
      dedupKey: `credit_expiring:${cardProfileId}:${g.key}:${g.periodKey}`,
      severity: "action",
      title: `${g.name} — $${remaining.toLocaleString()} unused`,
      body: `Resets ${fmtDate(g.cycleEnd)} (${Math.max(0, days)}d). Spend it or it's forfeit.`,
      payload: {
        benefitKey: g.key,
        periodKey: g.periodKey,
        remaining: g.remaining,
        daysLeft: Math.max(0, days),
        stage: escalated ? "escalated" : "initial",
        userReminder: customLead !== null,
      },
      effectiveAt: new Date(g.cycleEnd.getTime() - leadDays * DAY_MS),
      expiresAt: g.cycleEnd,
      cardProfileId,
    });
  }

  return out;
}

export interface RenewalVerdictInput {
  state: VerdictDisplay;
  /** The card the verdict compares against. */
  compareToName: string;
  /** compareTo.net − yours.net under the default assumptions. */
  gap: number;
  /** The user's card under the default assumptions. */
  points: number;
  benefits: number;
}

const VERDICT_LABEL: Record<VerdictDisplay, string> = {
  keep: "KEEP",
  switch: "SWITCH",
  toss_up: "TOSS-UP",
  not_yet: "NOT YET",
};

/**
 * renewal_verdict — fires inside the T−30 window before the fee posts.
 * Carries the same verdict as the Verdict page (best alternative, tie
 * band), so the alert and the page never disagree.
 */
export function generateRenewalVerdictAlert(
  cardProfileId: string,
  cardName: string,
  renewal: Pick<RenewalStatus, "renewsAt" | "daysUntil" | "annualFee">,
  verdict: RenewalVerdictInput
): AlertCandidate | null {
  if (renewal.daysUntil > 30) return null;

  const renewsAt = new Date(renewal.renewsAt);
  const gap = `~$${Math.abs(Math.round(verdict.gap)).toLocaleString()}/yr`;
  const bodyByVerdict: Record<VerdictDisplay, string> = {
    keep: `Your card nets ${gap} more than the best alternative, ${verdict.compareToName}. Nothing to do.`,
    switch: `${verdict.compareToName} would net you ${gap} more. Ask for a retention offer first, then decide before the fee posts.`,
    toss_up: `Within ${gap} of ${verdict.compareToName}, too close to call. Ask for a retention offer before deciding.`,
    not_yet: `Not enough spending history for a verdict yet.`,
  };

  return {
    type: "renewal_verdict",
    dedupKey: `renewal_verdict:${cardProfileId}:${renewsAt.getUTCFullYear()}`,
    severity: "action",
    title: `Renewal verdict: ${VERDICT_LABEL[verdict.state]} — ${cardName}`,
    body: `Fee renews ${fmtDate(renewsAt)} (${renewal.daysUntil}d). ${bodyByVerdict[verdict.state]}`,
    payload: {
      verdict: verdict.state,
      compareTo: verdict.compareToName,
      gap: verdict.gap,
      creditsCaptured: verdict.benefits,
      pointsValue: verdict.points,
      annualFee: renewal.annualFee,
      renewsAt: renewal.renewsAt,
      daysUntil: renewal.daysUntil,
      stage: renewal.daysUntil <= 7 ? "escalated" : "initial",
    },
    effectiveAt: new Date(renewsAt.getTime() - 30 * DAY_MS),
    expiresAt: renewsAt,
    cardProfileId,
  };
}

/**
 * connection_broken — a Plaid connection that stopped delivering data.
 * The one alert the user must act on to keep everything else accurate.
 */
export function generateConnectionAlerts(
  connections: ConnectionState[],
  now: Date = new Date()
): AlertCandidate[] {
  const out: AlertCandidate[] = [];

  for (const c of connections) {
    if (c.status !== "needs_reauth" && c.status !== "disconnected") continue;

    const institution = c.institutionName ?? "Your bank";
    const needsReauth = c.status === "needs_reauth";

    out.push({
      type: "connection_broken",
      dedupKey: `connection_broken:${c.id}`,
      severity: "action",
      title: `${institution} connection ${needsReauth ? "needs re-authentication" : "is disconnected"}`,
      body: needsReauth
        ? "Your bank requires a fresh sign-in. Until then, no new transactions flow in and every number here slowly goes stale."
        : "This connection stopped working. Reconnect it to resume tracking.",
      payload: { connectionId: c.id, status: c.status },
      effectiveAt: now,
      expiresAt: null,
      cardProfileId: null,
    });
  }

  return out;
}
