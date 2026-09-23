import {
  creditKey,
  creditName,
  isLiveOn,
  round2,
  type Activation,
  type CardYear,
  type RewardsBenefit,
  type UsageRow,
} from "./types";

export interface EarnedCredit {
  key: string;
  name: string;
  amount: number;
}

export interface EarnedCredits {
  total: number;
  /** Largest first. */
  credits: EarnedCredit[];
}

function monthIndex(d: Date): number {
  return d.getUTCFullYear() * 12 + d.getUTCMonth();
}

/**
 * Credits used so far this card year.
 *
 * A usage row counts when its period overlaps the card year up to now.
 * Quadrennial periods span several card years, so those count only when
 * the usage was recorded (updatedAt) inside this card year. Subscriptions
 * accrue their monthly value for each month active in the card year.
 */
export function computeEarnedCredits(
  benefits: RewardsBenefit[],
  rows: UsageRow[],
  activations: Activation[],
  cardYear: CardYear,
  now: Date = new Date()
): EarnedCredits {
  const byId = new Map(benefits.map((b) => [b.id, b]));
  const upTo = Math.min(now.getTime(), cardYear.end.getTime());
  const totals = new Map<string, EarnedCredit>();

  const add = (b: RewardsBenefit, amount: number) => {
    if (amount <= 0) return;
    const key = creditKey(b);
    const existing = totals.get(key);
    if (existing) existing.amount += amount;
    else totals.set(key, { key, name: creditName(b), amount });
  };

  for (const row of rows) {
    const b = byId.get(row.benefitId);
    if (!b || row.amountUsed <= 0) continue;
    const inYear =
      b.cycle === "quadrennial"
        ? row.updatedAt >= cardYear.start && row.updatedAt.getTime() <= upTo
        : row.cycleEnd >= cardYear.start && row.cycleStart.getTime() <= upTo;
    if (inYear) add(b, row.amountUsed);
  }

  for (const a of activations) {
    const b = byId.get(a.benefitId);
    if (!b || b.type !== "subscription") continue;
    const from = Math.max(monthIndex(a.activatedAt), monthIndex(cardYear.start));
    let to = monthIndex(new Date(upTo));
    // Stop at the sunset month when the subscription perk has ended.
    while (to >= from && !isLiveOn(b, new Date(Date.UTC(Math.floor(to / 12), to % 12, 1)))) {
      to--;
    }
    const months = to - from + 1;
    if (months > 0) add(b, months * b.creditAmount);
  }

  const credits = Array.from(totals.values())
    .map((c) => ({ ...c, amount: round2(c.amount) }))
    .sort((a, b) => b.amount - a.amount);
  return {
    total: round2(credits.reduce((s, c) => s + c.amount, 0)),
    credits,
  };
}
