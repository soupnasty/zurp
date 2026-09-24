import { getCurrentCycleBounds } from "@/lib/engine/cycle-utils";
import type { CycleBounds } from "@/lib/types";
import {
  creditKey,
  creditName,
  isLiveOn,
  round2,
  type CardYear,
  type RewardsBenefit,
  type UsageRow,
} from "./types";

export interface UnclaimedCredit {
  key: string;
  name: string;
  /** Left in the period running right now (0 when none is running). */
  thisCycle: number;
  /** When the running period ends; null when none is running. */
  thisCycleEnd: Date | null;
  daysLeft: number | null;
  /** thisCycle plus every future period that starts before the card year ends. */
  restOfYear: number;
  /** Benefits with credit left in the running period (targets for "I used it"). */
  currentBenefitIds: string[];
  /** True when every benefit in the row is matched automatically. */
  autoMatchable: boolean;
  requiresActivation: boolean;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Periods of `b` that are still open or yet to start, and begin before the
 * card year ends. One reference date per month is enough to hit every
 * period: the shortest cycle is monthly.
 */
function openPeriods(
  b: RewardsBenefit,
  cardYear: CardYear,
  anniversaryDate: Date | null,
  now: Date
): CycleBounds[] {
  const seen = new Map<string, CycleBounds>();
  const refs = [now];
  for (
    let m = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
    m <= cardYear.end;
    m = new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth() + 1, 1))
  ) {
    refs.push(m);
  }

  for (const ref of refs) {
    const bounds = getCurrentCycleBounds(b.cycle, ref, anniversaryDate);
    if (seen.has(bounds.periodKey)) continue;
    if (bounds.cycleEnd < now || bounds.cycleStart > cardYear.end) continue;
    if (b.activeMonths && !b.activeMonths.includes(bounds.cycleStart.getUTCMonth())) continue;
    if (!isLiveOn(b, bounds.cycleStart)) continue;
    seen.set(bounds.periodKey, bounds);
  }
  return Array.from(seen.values());
}

/**
 * Credit still available between now and the end of the card year,
 * grouped into display rows. Subscriptions are excluded: they are
 * switched on once, not used per period.
 */
export function computeUnclaimed(
  benefits: RewardsBenefit[],
  rows: UsageRow[],
  cardYear: CardYear,
  anniversaryDate: Date | null,
  now: Date = new Date(),
  hiddenBenefitIds: ReadonlySet<string> = new Set()
): UnclaimedCredit[] {
  const rowByPeriod = new Map(rows.map((r) => [`${r.benefitId}:${r.periodKey}`, r]));
  const groups = new Map<string, UnclaimedCredit>();

  for (const b of benefits) {
    if (b.type === "subscription" || hiddenBenefitIds.has(b.id)) continue;

    let thisCycle = 0;
    let thisCycleEnd: Date | null = null;
    let restOfYear = 0;
    for (const p of openPeriods(b, cardYear, anniversaryDate, now)) {
      if (p.cycleStart <= now) {
        const left = rowByPeriod.get(`${b.id}:${p.periodKey}`)?.amountRemaining ?? b.creditAmount;
        thisCycle += left;
        restOfYear += left;
        if (left > 0) thisCycleEnd = p.cycleEnd;
      } else {
        restOfYear += b.creditAmount;
      }
    }
    if (restOfYear <= 0) continue;

    const key = creditKey(b);
    const g = groups.get(key) ?? {
      key,
      name: creditName(b),
      thisCycle: 0,
      thisCycleEnd: null,
      daysLeft: null,
      restOfYear: 0,
      currentBenefitIds: [],
      autoMatchable: true,
      requiresActivation: false,
    };
    g.thisCycle += thisCycle;
    g.restOfYear += restOfYear;
    if (thisCycleEnd && (!g.thisCycleEnd || thisCycleEnd < g.thisCycleEnd)) {
      g.thisCycleEnd = thisCycleEnd;
    }
    if (thisCycle > 0) g.currentBenefitIds.push(b.id);
    g.autoMatchable = g.autoMatchable && b.autoMatchable;
    g.requiresActivation = g.requiresActivation || b.requiresActivation;
    groups.set(key, g);
  }

  return Array.from(groups.values())
    .map((g) => ({
      ...g,
      thisCycle: round2(g.thisCycle),
      restOfYear: round2(g.restOfYear),
      daysLeft: g.thisCycleEnd
        ? Math.max(0, Math.ceil((g.thisCycleEnd.getTime() - now.getTime()) / DAY_MS))
        : null,
    }))
    .sort(
      (a, b) =>
        (a.daysLeft ?? Infinity) - (b.daysLeft ?? Infinity) || b.restOfYear - a.restOfYear
    );
}
