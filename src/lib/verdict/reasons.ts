import type { CardSimulation } from "@/lib/points/types";
import type { VerdictCard } from "./decide";

/** Differences smaller than this aren't worth a line. */
const MIN_REASON_DOLLARS = 10;

export type Reason =
  | { kind: "points"; favors: "yours" | "alternative"; amount: number }
  | { kind: "benefits"; favors: "yours" | "alternative"; amount: number }
  | { kind: "fee"; favors: "yours" | "alternative"; amount: number }
  | {
      kind: "category";
      favors: "yours" | "alternative";
      label: string;
      spend: number;
      yourRate: number;
      theirRate: number;
    };

/**
 * Why one card beats the other, as structured facts the page turns into
 * copy. Built from the same numbers as the verdict, so the reasons always
 * match the card being compared under the current assumptions.
 */
export function verdictReasons(
  yours: VerdictCard,
  other: VerdictCard,
  yourSim: CardSimulation,
  otherSim: CardSimulation
): Reason[] {
  const reasons: Reason[] = [];
  const side = (d: number): "yours" | "alternative" => (d > 0 ? "alternative" : "yours");

  const dPoints = other.points - yours.points;
  if (Math.abs(dPoints) >= MIN_REASON_DOLLARS) {
    reasons.push({ kind: "points", favors: side(dPoints), amount: Math.abs(dPoints) });
    // The category that drives the points gap most, in the gap's direction.
    const theirs = new Map(otherSim.categories.map((c) => [c.category, c]));
    let top: { label: string; spend: number; yourRate: number; theirRate: number; diff: number } | null = null;
    for (const mine of yourSim.categories) {
      const t = theirs.get(mine.category);
      if (!t) continue;
      const diff = (t.valueConservative - mine.valueConservative) * Math.sign(dPoints);
      if (diff > 0 && t.earnRate !== mine.earnRate && (!top || diff > top.diff)) {
        top = { label: mine.label, spend: mine.totalSpend, yourRate: mine.earnRate, theirRate: t.earnRate, diff };
      }
    }
    if (top && top.diff >= MIN_REASON_DOLLARS) {
      const { label, spend, yourRate, theirRate } = top;
      reasons.push({ kind: "category", favors: side(dPoints), label, spend, yourRate, theirRate });
    }
  }

  const dBenefits = other.benefits - yours.benefits;
  if (Math.abs(dBenefits) >= MIN_REASON_DOLLARS) {
    reasons.push({ kind: "benefits", favors: side(dBenefits), amount: Math.abs(dBenefits) });
  }

  // A lower fee favors that card.
  const dFee = yours.annualFee - other.annualFee;
  if (Math.abs(dFee) >= MIN_REASON_DOLLARS) {
    reasons.push({ kind: "fee", favors: side(dFee), amount: Math.abs(dFee) });
  }

  return reasons;
}
