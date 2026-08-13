import type { BenefitCycle } from "@/lib/types";
import type { RenewalStatus } from "@/lib/home/queries";
import { isEffectivelyTied } from "@/lib/points/tie-band";
import type {
  AlertCandidate,
  CreditGroupState,
  ConnectionState,
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
    if (!rule) continue;
    if (g.remaining < rule.minRemaining) continue;

    const days = daysUntil(now, g.cycleEnd);
    if (days < 0 || days > rule.leadDays) continue;

    // Habit suppression: the user demonstrably doesn't need this nudge.
    if (
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
      },
      effectiveAt: new Date(g.cycleEnd.getTime() - rule.leadDays * DAY_MS),
      expiresAt: g.cycleEnd,
      cardProfileId,
    });
  }

  return out;
}

export type RenewalVerdict = "keep" | "close_call" | "reconsider";

/**
 * renewal_verdict — fires inside the T−30 window before the fee posts.
 * Verdict reuses the tie band: a net inside the band is a close call,
 * not a win or loss.
 */
export function generateRenewalVerdictAlert(
  cardProfileId: string,
  cardName: string,
  renewal: Pick<
    RenewalStatus,
    "renewsAt" | "daysUntil" | "annualFee" | "creditsCaptured" | "pointsValue" | "netSoFar"
  >,
  now: Date = new Date()
): AlertCandidate | null {
  if (renewal.daysUntil > 30) return null;

  const renewsAt = new Date(renewal.renewsAt);
  const totalValue = renewal.creditsCaptured + renewal.pointsValue;

  let verdict: RenewalVerdict;
  if (isEffectivelyTied(totalValue, renewal.annualFee)) {
    verdict = "close_call";
  } else if (renewal.netSoFar > 0) {
    verdict = "keep";
  } else {
    verdict = "reconsider";
  }

  const verdictLabel: Record<RenewalVerdict, string> = {
    keep: "KEEP",
    close_call: "CLOSE CALL",
    reconsider: "RECONSIDER",
  };

  const bodyByVerdict: Record<RenewalVerdict, string> = {
    keep: `~$${totalValue.toLocaleString()} captured vs the $${renewal.annualFee.toLocaleString()} fee. Call for a retention offer anyway — they work on keepers too.`,
    close_call: `~$${totalValue.toLocaleString()} captured vs the $${renewal.annualFee.toLocaleString()} fee — inside the noise band. Call for a retention offer before deciding.`,
    reconsider: `~$${totalValue.toLocaleString()} captured vs the $${renewal.annualFee.toLocaleString()} fee. Call retention first; if no offer, a downgrade keeps your points alive.`,
  };

  return {
    type: "renewal_verdict",
    dedupKey: `renewal_verdict:${cardProfileId}:${renewsAt.getUTCFullYear()}`,
    severity: "action",
    title: `Renewal verdict: ${verdictLabel[verdict]} — ${cardName}`,
    body: `Fee renews ${fmtDate(renewsAt)} (${renewal.daysUntil}d). ${bodyByVerdict[verdict]}`,
    payload: {
      verdict,
      netSoFar: renewal.netSoFar,
      creditsCaptured: renewal.creditsCaptured,
      pointsValue: renewal.pointsValue,
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
