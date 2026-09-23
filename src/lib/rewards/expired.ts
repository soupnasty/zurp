import {
  creditKey,
  creditName,
  round2,
  type CardYear,
  type RewardsBenefit,
  type UsageRow,
} from "./types";

export interface ExpiredCredit {
  key: string;
  name: string;
  amount: number;
  /** Portion from periods that closed before the user joined zurp. */
  beforeJoined: number;
}

export interface ExpiredSummary {
  total: number;
  beforeJoined: number;
  /** Largest first. */
  credits: ExpiredCredit[];
  /** Share of credit captured across periods that closed this card year; null before any closed. */
  capture: { pct: number; captured: number; available: number } | null;
}

/**
 * Credit that expired unused in periods that closed this card year, plus
 * the capture rate over those same periods. Hidden ("not for me") credits
 * are left out of both, so hiding a credit stops it counting against you.
 */
export function computeExpired(
  benefits: RewardsBenefit[],
  rows: UsageRow[],
  cardYear: CardYear,
  joinedAt: Date | null,
  now: Date = new Date(),
  hiddenBenefitIds: ReadonlySet<string> = new Set()
): ExpiredSummary {
  const byId = new Map(benefits.map((b) => [b.id, b]));
  const groups = new Map<string, ExpiredCredit>();
  let captured = 0;
  let available = 0;

  for (const row of rows) {
    const b = byId.get(row.benefitId);
    if (!b || b.type === "subscription" || hiddenBenefitIds.has(b.id)) continue;
    if (row.cycleEnd >= now || row.cycleEnd < cardYear.start) continue;

    captured += row.amountUsed;
    available += row.amountUsed + row.amountRemaining;
    if (row.amountRemaining <= 0) continue;

    const key = creditKey(b);
    const g = groups.get(key) ?? { key, name: creditName(b), amount: 0, beforeJoined: 0 };
    g.amount += row.amountRemaining;
    if (joinedAt && row.cycleEnd < joinedAt) g.beforeJoined += row.amountRemaining;
    groups.set(key, g);
  }

  const credits = Array.from(groups.values())
    .map((g) => ({ ...g, amount: round2(g.amount), beforeJoined: round2(g.beforeJoined) }))
    .sort((a, b) => b.amount - a.amount);

  return {
    total: round2(credits.reduce((s, c) => s + c.amount, 0)),
    beforeJoined: round2(credits.reduce((s, c) => s + c.beforeJoined, 0)),
    credits,
    capture:
      available > 0
        ? {
            pct: Math.round((captured / available) * 100),
            captured: round2(captured),
            available: round2(available),
          }
        : null,
  };
}
