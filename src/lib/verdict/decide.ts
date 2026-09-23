import { tieThreshold } from "@/lib/points/tie-band";
import type {
  BenefitAssumptionMode,
  CardSimulation,
  ValuationMode,
} from "@/lib/points/types";

export type VerdictState = "keep" | "switch" | "toss_up";

/** What the page shows: a real verdict, or "not_yet" while data is thin. */
export type VerdictDisplay = VerdictState | "not_yet";

/** Below this much spending history, no verdict is shown — only a lean. */
export const MIN_MONTHS_FOR_VERDICT = 6;

export interface VerdictCard {
  cardId: string;
  cardName: string;
  annualFee: number;
  points: number;
  benefits: number;
  net: number;
  /** 1-based, by net under the chosen assumptions. */
  rank: number;
}

export interface Verdict {
  state: VerdictDisplay;
  /** The verdict the numbers give, even while `state` is "not_yet". */
  raw: VerdictState;
  yours: VerdictCard;
  /** Highest-net alternative. */
  best: VerdictCard;
  /** Alternatives effectively tied with `best` (includes `best`). */
  tied: VerdictCard[];
  /**
   * The card the page compares against: `best` when keeping, otherwise the
   * lowest-fee card among `tied` — on a tie, the cheaper card is the safer
   * recommendation.
   */
  compareTo: VerdictCard;
  /** compareTo.net − yours.net: positive means the alternative is ahead. */
  gap: number;
  /** Every card, best first. */
  ranked: VerdictCard[];
}

const POINTS_BY_MODE: Record<ValuationMode, keyof CardSimulation> = {
  conservative: "pointsValueConservative",
  realistic: "pointsValueRealistic",
  upside: "pointsValueUpside",
};

export function rankCards(
  cards: CardSimulation[],
  vMode: ValuationMode,
  bMode: BenefitAssumptionMode
): VerdictCard[] {
  return cards
    .map((c) => ({
      cardId: c.cardId,
      cardName: c.cardName,
      annualFee: c.annualFee,
      points: c[POINTS_BY_MODE[vMode]] as number,
      benefits: c.benefitsByMode[bMode],
      net: c.netByMode[vMode][bMode],
      rank: 0,
    }))
    .sort((a, b) => b.net - a.net)
    .map((c, i) => ({ ...c, rank: i + 1 }));
}

/**
 * Keep, switch or toss-up for the user's card, measured against the best
 * alternative. A gap inside the tie band (the larger of $100 or 5%) is
 * noise, so it's a toss-up in either direction. Returns null when the
 * user's card or any alternative is missing from the simulations.
 */
export function decideVerdict(
  cards: CardSimulation[],
  usersCardId: string,
  vMode: ValuationMode,
  bMode: BenefitAssumptionMode,
  monthCount: number
): Verdict | null {
  const ranked = rankCards(cards, vMode, bMode);
  const yours = ranked.find((c) => c.cardId === usersCardId);
  const alternatives = ranked.filter((c) => c.cardId !== usersCardId);
  if (!yours || alternatives.length === 0) return null;

  const best = alternatives[0];
  const lead = best.net - yours.net;
  const band = tieThreshold(best.net, yours.net);
  const raw: VerdictState = lead >= band ? "switch" : lead <= -band ? "keep" : "toss_up";

  const tied = alternatives.filter(
    (c) => best.net - c.net < tieThreshold(best.net, c.net)
  );
  const cheapestTied = [...tied].sort(
    (a, b) => a.annualFee - b.annualFee || b.net - a.net
  )[0];
  const compareTo = raw === "keep" ? best : cheapestTied;

  return {
    state: monthCount < MIN_MONTHS_FOR_VERDICT ? "not_yet" : raw,
    raw,
    yours,
    best,
    tied,
    compareTo,
    gap: compareTo.net - yours.net,
    ranked,
  };
}
