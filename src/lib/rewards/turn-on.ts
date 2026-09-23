import type { UnclaimedCredit } from "./unclaimed";
import {
  creditKey,
  creditName,
  isLiveOn,
  round2,
  type Activation,
  type CardYear,
  type RewardsBenefit,
} from "./types";

export interface TurnOnItem {
  key: string;
  name: string;
  /** Subscriptions activate through /api/benefits/activate; credits through preferences. */
  kind: "subscription" | "activation";
  benefitIds: string[];
  /** Value from now to the end of the card year once it's on. */
  value: number;
  /** Monthly value, for subscriptions. */
  monthly: number | null;
  on: boolean;
}

function monthIndex(d: Date): number {
  return d.getUTCFullYear() * 12 + d.getUTCMonth();
}

/**
 * One-time setup that unlocks value: subscriptions (Apple, DashPass) and
 * credits that must be activated before they pay out (StubHub). Items
 * already on are kept so the user can undo.
 */
export function buildTurnOn(
  benefits: RewardsBenefit[],
  unclaimed: UnclaimedCredit[],
  subscriptionActivations: Activation[],
  activatedBenefitIds: ReadonlySet<string>,
  cardYear: CardYear,
  now: Date = new Date(),
  hiddenBenefitIds: ReadonlySet<string> = new Set()
): TurnOnItem[] {
  const items: TurnOnItem[] = [];
  const activeSubs = new Set(subscriptionActivations.map((a) => a.benefitId));

  for (const b of benefits) {
    if (b.type !== "subscription" || hiddenBenefitIds.has(b.id) || !isLiveOn(b, now)) continue;
    let last = monthIndex(cardYear.end);
    while (last >= monthIndex(now) && !isLiveOn(b, new Date(Date.UTC(Math.floor(last / 12), last % 12, 1)))) {
      last--;
    }
    const months = Math.max(0, last - monthIndex(now) + 1);
    items.push({
      key: creditKey(b),
      name: creditName(b),
      kind: "subscription",
      benefitIds: [b.id],
      value: round2(months * b.creditAmount),
      monthly: b.creditAmount,
      on: activeSubs.has(b.id),
    });
  }

  for (const u of unclaimed) {
    if (!u.requiresActivation) continue;
    const members = benefits.filter(
      (b) => b.type !== "subscription" && b.requiresActivation && creditKey(b) === u.key
    );
    items.push({
      key: u.key,
      name: u.name,
      kind: "activation",
      benefitIds: members.map((b) => b.id),
      value: u.restOfYear,
      monthly: null,
      // Activation is per benefit, not per period: any member on means on.
      on: members.some((b) => activatedBenefitIds.has(b.id)),
    });
  }

  // Not-yet-on first, then most valuable.
  return items.sort((a, b) => Number(a.on) - Number(b.on) || b.value - a.value);
}
