import { describe, it, expect } from "vitest";
import { decideVerdict } from "../decide";
import { verdictRobustness } from "../robustness";
import { verdictReasons } from "../reasons";
import type {
  BenefitAssumptionMode,
  CardSimulation,
  CategoryEarnSummary,
  ValuationMode,
} from "@/lib/points/types";

function sim(
  cardId: string,
  annualFee: number,
  pts: [number, number, number],
  ben: [number, number, number],
  categories: Partial<CategoryEarnSummary>[] = []
): CardSimulation {
  const [c, r, u] = pts;
  const benefitsByMode = { proven: ben[0], my_picks: ben[1], all_credits: ben[2] };
  const net = (p: number) =>
    Object.fromEntries(
      (Object.keys(benefitsByMode) as BenefitAssumptionMode[]).map((b) => [b, p + benefitsByMode[b] - annualFee])
    ) as Record<BenefitAssumptionMode, number>;
  return {
    cardId,
    cardName: cardId,
    isUsersCard: false,
    annualFee,
    totalPoints: 0,
    bonusPoints: 0,
    pointsValueConservative: c,
    pointsValueRealistic: r,
    pointsValueUpside: u,
    benefitsValue: ben[0],
    benefitsCaptured: null,
    benefitsSimulated: null,
    matchedPerBenefit: {},
    benefitsByMode,
    netFloor: 0,
    netCeiling: 0,
    netActual: 0,
    netByMode: { conservative: net(c), realistic: net(r), upside: net(u) } as Record<ValuationMode, Record<BenefitAssumptionMode, number>>,
    rank: 0,
    categories: categories.map((cat) => ({
      category: "other",
      label: "",
      icon: "",
      totalSpend: 0,
      transactionCount: 0,
      earnRate: 1,
      points: 0,
      valueConservative: 0,
      capNote: null,
      ...cat,
    })) as CategoryEarnSummary[],
  };
}

// The mockup's "switch" scenario: the Reserve trails Gold and Active Cash,
// which are within the tie band of each other.
const CSR = sim("csr", 795, [320, 480, 640], [560, 560, 1650], [
  { category: "dining", label: "Dining", totalSpend: 6900, earnRate: 3, valueConservative: 207 },
]);
const GOLD = sim("gold", 325, [370, 610, 820], [220, 220, 424], [
  { category: "dining", label: "Dining", totalSpend: 6900, earnRate: 4, valueConservative: 276 },
]);
const WFAC = sim("wfac", 0, [480, 480, 480], [0, 0, 0]);
const CSP = sim("csp", 95, [270, 400, 540], [60, 60, 110]);
const SWITCH_CARDS = [CSR, GOLD, WFAC, CSP];

describe("decideVerdict", () => {
  it("says switch when the best alternative is ahead by more than the tie band", () => {
    const v = decideVerdict(SWITCH_CARDS, "csr", "realistic", "proven", 12)!;
    expect(v.state).toBe("switch");
    expect(v.yours.net).toBe(245);
    expect(v.best.cardId).toBe("gold");
    expect(v.best.net).toBe(505);
  });

  it("recommends the lowest-fee card among those tied with the best", () => {
    const v = decideVerdict(SWITCH_CARDS, "csr", "realistic", "proven", 12)!;
    expect(v.tied.map((c) => c.cardId)).toEqual(["gold", "wfac"]);
    expect(v.compareTo.cardId).toBe("wfac");
    expect(v.gap).toBe(235);
  });

  it("says keep, compared against the best alternative, when the user's card leads by more than the band", () => {
    const v = decideVerdict(SWITCH_CARDS, "csr", "realistic", "all_credits", 12)!;
    expect(v.state).toBe("keep");
    expect(v.compareTo.cardId).toBe(v.best.cardId);
    expect(v.gap).toBeLessThan(0);
  });

  it("calls a gap inside the band a toss-up in either direction", () => {
    const behind = decideVerdict([sim("mine", 795, [540, 540, 540], [700, 700, 700]), sim("alt", 0, [460, 460, 460], [0, 0, 0])], "mine", "realistic", "proven", 12)!;
    expect(behind.yours.net).toBe(445);
    expect(behind.state).toBe("toss_up");
    const ahead = decideVerdict([sim("mine", 0, [500, 500, 500], [0, 0, 0]), sim("alt", 0, [450, 450, 450], [0, 0, 0])], "mine", "realistic", "proven", 12)!;
    expect(ahead.state).toBe("toss_up");
  });

  it("widens the band to 5% for large nets", () => {
    // Nets 3000 vs 3140: gap 140 < 5% of 3140 (157) → toss-up
    const v = decideVerdict([sim("mine", 0, [3000, 3000, 3000], [0, 0, 0]), sim("alt", 0, [3140, 3140, 3140], [0, 0, 0])], "mine", "realistic", "proven", 12)!;
    expect(v.state).toBe("toss_up");
  });

  it("shows not_yet under 6 months but keeps the raw lean", () => {
    const v = decideVerdict(SWITCH_CARDS, "csr", "realistic", "proven", 5)!;
    expect(v.state).toBe("not_yet");
    expect(v.raw).toBe("switch");
    expect(decideVerdict(SWITCH_CARDS, "csr", "realistic", "all_credits", 5)!.state).toBe("not_yet");
  });

  it("returns null without the user's card or any alternative", () => {
    expect(decideVerdict(SWITCH_CARDS, "missing", "realistic", "proven", 12)).toBeNull();
    expect(decideVerdict([CSR], "csr", "realistic", "proven", 12)).toBeNull();
  });

  it("ranks every card by net", () => {
    const v = decideVerdict(SWITCH_CARDS, "csr", "realistic", "proven", 12)!;
    expect(v.ranked.map((c) => [c.cardId, c.rank])).toEqual([
      ["gold", 1],
      ["wfac", 2],
      ["csp", 3],
      ["csr", 4],
    ]);
  });
});

describe("verdictRobustness", () => {
  it("counts the assumption settings that agree with the chosen one", () => {
    const r = verdictRobustness(SWITCH_CARDS, "csr", "realistic", "proven", 12)!;
    // Assuming every credit is fully used flips it to keep at all three valuations.
    expect(r.total).toBe(9);
    expect(r.holds).toBe(6);
    expect(r.flips.every((f) => f.bMode === "all_credits" && f.state === "keep")).toBe(true);
  });
});

describe("verdictReasons", () => {
  it("lists credits for the user's card and the fee for a no-fee alternative", () => {
    const v = decideVerdict(SWITCH_CARDS, "csr", "realistic", "proven", 12)!;
    const reasons = verdictReasons(v.yours, v.compareTo, CSR, WFAC);
    expect(reasons).toEqual([
      { kind: "benefits", favors: "yours", amount: 560 },
      { kind: "fee", favors: "alternative", amount: 795 },
    ]);
  });

  it("names the category that drives a points gap", () => {
    const v = decideVerdict(SWITCH_CARDS, "csr", "realistic", "proven", 12)!;
    const reasons = verdictReasons(v.yours, v.best, CSR, GOLD);
    expect(reasons).toContainEqual({ kind: "points", favors: "alternative", amount: 130 });
    expect(reasons).toContainEqual({
      kind: "category",
      favors: "alternative",
      label: "Dining",
      spend: 6900,
      yourRate: 3,
      theirRate: 4,
    });
  });
});
