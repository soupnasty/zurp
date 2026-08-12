import { describe, it, expect } from "vitest";
import { runMatcher } from "../matcher";
import type {
  BenefitDefinition,
  MatcherConfig,
  MatcherTransaction,
} from "@/lib/types";

function makeBenefit(
  overrides: Partial<BenefitDefinition> = {}
): BenefitDefinition {
  return {
    id: "test_benefit",
    cardId: "test_card",
    name: "Test Benefit",
    icon: "Star",
    category: "dining",
    type: "credit",
    creditAmount: 25,
    cycle: "monthly",
    carriesOver: false,
    maxCarryoverPeriods: null,
    maxAccrued: null,
    merchantPatterns: ["testmerchant"],
    plaidCategories: [],
    autoMatchable: true,
    requiresActivation: false,
    priority: 20,
    description: "Test benefit",
    notes: null,
    sunsetDate: null,
    sourceUrl: null,
    displayGroup: null,
    displayGroupName: null,
    displayGroupIcon: null,
    details: null,
    ...overrides,
  };
}

function makeTx(
  overrides: Partial<MatcherTransaction> = {}
): MatcherTransaction {
  return {
    id: "tx_1",
    date: new Date(2026, 0, 15),
    merchantName: "TESTMERCHANT",
    merchantNameRaw: "TESTMERCHANT",
    amount: 20,
    plaidCategoryPrimary: null,
    plaidCategoryDetailed: null,
    pending: false,
    matchedStatus: "unmatched",
    ...overrides,
  };
}

function makeConfig(
  benefits: BenefitDefinition[],
  usageEntries: Record<string, number> = {}
): MatcherConfig {
  return {
    benefits,
    usageMap: new Map(Object.entries(usageEntries)),
    anniversaryDate: null,
    referenceDate: new Date(2026, 0, 15),
  };
}

describe("runMatcher", () => {
  it("matches a transaction to the correct benefit", () => {
    const benefit = makeBenefit();
    const tx = makeTx();
    const config = makeConfig([benefit]);

    const result = runMatcher([tx], config);

    expect(result.matches).toHaveLength(1);
    expect(result.matches[0].transactionId).toBe("tx_1");
    expect(result.matches[0].benefitId).toBe("test_benefit");
    expect(result.matches[0].creditApplied).toBe(20);
    expect(result.matches[0].matchMethod).toBe("auto");
  });

  it("skips pending transactions", () => {
    const benefit = makeBenefit();
    const tx = makeTx({ pending: true });
    const config = makeConfig([benefit]);

    const result = runMatcher([tx], config);

    expect(result.matches).toHaveLength(0);
  });

  it("skips already-matched transactions", () => {
    const benefit = makeBenefit();
    const tx = makeTx({ matchedStatus: "matched" });
    const config = makeConfig([benefit]);

    const result = runMatcher([tx], config);

    expect(result.matches).toHaveLength(0);
  });

  it("assigns credit as min(tx.amount, remaining)", () => {
    const benefit = makeBenefit({ creditAmount: 10 });
    const tx = makeTx({ amount: 25 });
    const config = makeConfig([benefit]);

    const result = runMatcher([tx], config);

    expect(result.matches[0].creditApplied).toBe(10);
  });

  it("respects existing usage", () => {
    const benefit = makeBenefit({ creditAmount: 25 });
    const tx = makeTx({ amount: 20 });
    const config = makeConfig([benefit], {
      "test_benefit:2026-01": 20,
    });

    const result = runMatcher([tx], config);

    expect(result.matches[0].creditApplied).toBe(5); // Only 5 remaining
  });

  it("skips benefit when fully used", () => {
    const benefit = makeBenefit({ creditAmount: 25 });
    const tx = makeTx({ amount: 20 });
    const config = makeConfig([benefit], {
      "test_benefit:2026-01": 25,
    });

    const result = runMatcher([tx], config);

    expect(result.matches).toHaveLength(0);
    expect(result.unmatchedTransactionIds).toContain("tx_1");
  });

  it("matches by priority order (lower number = higher priority)", () => {
    const highPriority = makeBenefit({
      id: "high",
      priority: 5,
      merchantPatterns: ["testmerchant"],
    });
    const lowPriority = makeBenefit({
      id: "low",
      priority: 30,
      merchantPatterns: ["testmerchant"],
    });
    const tx = makeTx();
    const config = makeConfig([lowPriority, highPriority]);

    const result = runMatcher([tx], config);

    expect(result.matches).toHaveLength(1);
    expect(result.matches[0].benefitId).toBe("high");
  });

  it("depletes benefits across multiple transactions", () => {
    const benefit = makeBenefit({ creditAmount: 25 });
    const tx1 = makeTx({ id: "tx_1", amount: 15 });
    const tx2 = makeTx({ id: "tx_2", amount: 15 });
    const config = makeConfig([benefit]);

    const result = runMatcher([tx1, tx2], config);

    expect(result.matches).toHaveLength(2);
    expect(result.matches[0].creditApplied).toBe(15);
    expect(result.matches[1].creditApplied).toBe(10); // Only 10 remaining
  });

  it("flags non-auto-matchable benefits as ambiguous", () => {
    const benefit = makeBenefit({ autoMatchable: false });
    const tx = makeTx();
    const config = makeConfig([benefit]);

    const result = runMatcher([tx], config);

    expect(result.matches).toHaveLength(0);
    expect(result.ambiguousTransactions).toContain("tx_1");
  });

  it("prefers auto-matchable over non-auto when both match", () => {
    const nonAuto = makeBenefit({
      id: "non_auto",
      autoMatchable: false,
      priority: 5,
      merchantPatterns: ["testmerchant"],
    });
    const auto = makeBenefit({
      id: "auto",
      autoMatchable: true,
      priority: 20,
      merchantPatterns: ["testmerchant"],
    });
    const tx = makeTx();
    const config = makeConfig([nonAuto, auto]);

    const result = runMatcher([tx], config);

    expect(result.matches).toHaveLength(1);
    expect(result.matches[0].benefitId).toBe("auto");
    // A matched transaction must NOT also be flagged ambiguous — the two
    // states collide downstream (credit applied while shown as "needs
    // review"). Users can reassign via the flag endpoints.
    expect(result.ambiguousTransactions).not.toContain("tx_1");
  });

  it("handles DoorDash combined credits (multiple benefits same merchant)", () => {
    const doordash1 = makeBenefit({
      id: "dd_restaurant",
      creditAmount: 5,
      priority: 20,
      merchantPatterns: ["doordash"],
    });
    const doordash2 = makeBenefit({
      id: "dd_nonrestaurant_1",
      creditAmount: 10,
      priority: 21,
      merchantPatterns: ["doordash"],
    });
    const doordash3 = makeBenefit({
      id: "dd_nonrestaurant_2",
      creditAmount: 10,
      priority: 22,
      merchantPatterns: ["doordash"],
    });

    const tx = makeTx({
      merchantName: "DOORDASH",
      amount: 30,
    });

    const config = makeConfig([doordash1, doordash2, doordash3]);

    const result = runMatcher([tx], config);

    // Should match to highest priority (restaurant credit first)
    expect(result.matches).toHaveLength(1);
    expect(result.matches[0].benefitId).toBe("dd_restaurant");
    expect(result.matches[0].creditApplied).toBe(5); // Min of tx amount and credit
  });

  it("determines confidence levels correctly", () => {
    // High: merchant + category match
    const benefit = makeBenefit({
      merchantPatterns: ["doordash"],
      plaidCategories: ["FOOD_AND_DRINK"],
    });
    const tx = makeTx({
      merchantName: "DOORDASH",
      plaidCategoryPrimary: "FOOD_AND_DRINK",
    });
    const config = makeConfig([benefit]);

    const result = runMatcher([tx], config);
    expect(result.matches[0].matchConfidence).toBe("high");
  });

  it("assigns medium confidence for merchant-only match", () => {
    const benefit = makeBenefit({
      merchantPatterns: ["doordash"],
      plaidCategories: ["FOOD_AND_DRINK"],
    });
    const tx = makeTx({
      merchantName: "DOORDASH",
      plaidCategoryPrimary: null,
    });
    const config = makeConfig([benefit]);

    const result = runMatcher([tx], config);
    expect(result.matches[0].matchConfidence).toBe("medium");
  });

  it("returns unmatched for transactions with no matching benefit", () => {
    const benefit = makeBenefit({ merchantPatterns: ["doordash"] });
    const tx = makeTx({ merchantName: "STARBUCKS" });
    const config = makeConfig([benefit]);

    const result = runMatcher([tx], config);

    expect(result.matches).toHaveLength(0);
    expect(result.unmatchedTransactionIds).toContain("tx_1");
  });

  it("matches transaction in Q1 to quarterly_q1 benefit, skips quarterly_q2", () => {
    const q1Benefit = makeBenefit({
      id: "plat_resy_q1",
      cycle: "quarterly_q1",
      merchantPatterns: ["resy"],
    });
    const q2Benefit = makeBenefit({
      id: "plat_resy_q2",
      cycle: "quarterly_q2",
      merchantPatterns: ["resy"],
    });
    const tx = makeTx({
      date: new Date(2026, 1, 15), // Feb 15 — Q1
      merchantName: "RESY",
    });
    const config = makeConfig([q1Benefit, q2Benefit]);

    const result = runMatcher([tx], config);

    expect(result.matches).toHaveLength(1);
    expect(result.matches[0].benefitId).toBe("plat_resy_q1");
  });

  it("skips benefit when activeMonths excludes transaction month", () => {
    const janNovBenefit = makeBenefit({
      id: "plat_uber_cash",
      activeMonths: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      merchantPatterns: ["uber"],
    });
    const tx = makeTx({
      date: new Date(2026, 11, 15), // December
      merchantName: "UBER",
    });
    const config = makeConfig([janNovBenefit]);

    const result = runMatcher([tx], config);

    expect(result.matches).toHaveLength(0);
    expect(result.unmatchedTransactionIds).toContain("tx_1");
  });

  it("matches December-only benefit in December", () => {
    const decBenefit = makeBenefit({
      id: "plat_uber_cash_dec",
      activeMonths: [11],
      creditAmount: 35,
      merchantPatterns: ["uber"],
    });
    const tx = makeTx({
      date: new Date(2026, 11, 15), // December
      merchantName: "UBER",
      amount: 30,
    });
    const config = makeConfig([decBenefit]);

    const result = runMatcher([tx], config);

    expect(result.matches).toHaveLength(1);
    expect(result.matches[0].benefitId).toBe("plat_uber_cash_dec");
    expect(result.matches[0].creditApplied).toBe(30);
  });

  it("matches Jan-Nov benefit in January, skips December benefit", () => {
    const janNov = makeBenefit({
      id: "plat_uber_cash",
      activeMonths: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      creditAmount: 15,
      merchantPatterns: ["uber"],
      priority: 20,
    });
    const dec = makeBenefit({
      id: "plat_uber_cash_dec",
      activeMonths: [11],
      creditAmount: 35,
      merchantPatterns: ["uber"],
      priority: 19,
    });
    const tx = makeTx({
      date: new Date(2026, 0, 15), // January
      merchantName: "UBER",
      amount: 10,
    });
    const config = makeConfig([janNov, dec]);

    const result = runMatcher([tx], config);

    expect(result.matches).toHaveLength(1);
    expect(result.matches[0].benefitId).toBe("plat_uber_cash");
  });

  it("handles max_accrued for carryover benefits", () => {
    const benefit = makeBenefit({
      creditAmount: 5,
      carriesOver: true,
      maxAccrued: 15,
    });
    const tx = makeTx({ amount: 12 });
    const config = makeConfig([benefit]);

    const result = runMatcher([tx], config);

    expect(result.matches[0].creditApplied).toBe(12); // Up to maxAccrued (15)
  });

  it("category fallback yields to merchant-specific benefit", () => {
    const travelCredit = makeBenefit({
      id: "travel",
      priority: 30,
      isCategoryFallback: true,
      merchantPatterns: ["airline", "hotel"],
      plaidCategories: ["TRAVEL"],
    });
    const globalEntry = makeBenefit({
      id: "global_entry",
      priority: 20,
      creditAmount: 120,
      merchantPatterns: ["global entry", "tsa"],
    });
    const tx = makeTx({
      merchantName: "GLOBAL ENTRY FEE",
      amount: 120,
      plaidCategoryPrimary: "TRAVEL",
    });
    const config = makeConfig([travelCredit, globalEntry]);

    const result = runMatcher([tx], config);

    expect(result.matches).toHaveLength(1);
    expect(result.matches[0].benefitId).toBe("global_entry");
  });

  it("category fallback still matches when no specific benefit competes", () => {
    const travelCredit = makeBenefit({
      id: "travel",
      priority: 30,
      isCategoryFallback: true,
      merchantPatterns: ["airline", "hotel"],
      plaidCategories: ["TRAVEL"],
    });
    const tx = makeTx({
      merchantName: "RANDOM TRAVEL AGENCY",
      amount: 50,
      plaidCategoryPrimary: "TRAVEL",
    });
    const config = makeConfig([travelCredit]);

    const result = runMatcher([tx], config);

    expect(result.matches).toHaveLength(1);
    expect(result.matches[0].benefitId).toBe("travel");
  });

  it("non-fallback benefits compete normally by priority", () => {
    const specific = makeBenefit({
      id: "specific",
      priority: 10,
      merchantPatterns: ["doordash"],
    });
    const general = makeBenefit({
      id: "general",
      priority: 20,
      merchantPatterns: ["doordash"],
    });
    const tx = makeTx({ merchantName: "DOORDASH" });
    const config = makeConfig([specific, general]);

    const result = runMatcher([tx], config);

    expect(result.matches).toHaveLength(1);
    expect(result.matches[0].benefitId).toBe("specific");
  });

  it("skips benefit when transaction is after sunsetDate", () => {
    const benefit = makeBenefit({
      sunsetDate: "2025-12-31",
      merchantPatterns: ["doordash"],
    });
    const tx = makeTx({
      date: new Date(2026, 0, 15), // Jan 15, 2026 — after sunset
      merchantName: "DOORDASH",
    });
    const config = makeConfig([benefit]);

    const result = runMatcher([tx], config);

    expect(result.matches).toHaveLength(0);
    expect(result.unmatchedTransactionIds).toContain("tx_1");
  });

  it("matches benefit when transaction is before sunsetDate", () => {
    const benefit = makeBenefit({
      sunsetDate: "2027-12-31",
      merchantPatterns: ["doordash"],
    });
    const tx = makeTx({
      date: new Date(2026, 0, 15), // Jan 15, 2026 — before sunset
      merchantName: "DOORDASH",
    });
    const config = makeConfig([benefit]);

    const result = runMatcher([tx], config);

    expect(result.matches).toHaveLength(1);
    expect(result.matches[0].benefitId).toBe("test_benefit");
  });

  it("matches benefit with null sunsetDate regardless of date", () => {
    const benefit = makeBenefit({
      sunsetDate: null,
      merchantPatterns: ["doordash"],
    });
    const tx = makeTx({
      date: new Date(2030, 5, 1), // Far future
      merchantName: "DOORDASH",
    });
    const config = makeConfig([benefit]);

    const result = runMatcher([tx], config);

    expect(result.matches).toHaveLength(1);
  });

  describe("refunds", () => {
    it("releases credit from usage in the refund's period", () => {
      const benefit = makeBenefit({ creditAmount: 25 });
      const config = makeConfig([benefit], { "test_benefit:2026-01": 20 });
      const refund = makeTx({ id: "tx_r", amount: -15 });

      const result = runMatcher([refund], config);

      expect(result.matches).toHaveLength(1);
      expect(result.matches[0].creditApplied).toBe(-15);
      expect(result.usageUpdates.get("test_benefit:2026-01")).toBe(-15);
    });

    it("floors the release at existing usage", () => {
      const benefit = makeBenefit({ creditAmount: 25 });
      const config = makeConfig([benefit], { "test_benefit:2026-01": 10 });
      const refund = makeTx({ id: "tx_r", amount: -40 });

      const result = runMatcher([refund], config);

      expect(result.matches).toHaveLength(1);
      expect(result.matches[0].creditApplied).toBe(-10);
    });

    it("leaves refunds unmatched when there is no usage to release", () => {
      const benefit = makeBenefit({ creditAmount: 25 });
      const config = makeConfig([benefit]); // no usage
      const refund = makeTx({ id: "tx_r", amount: -15 });

      const result = runMatcher([refund], config);

      expect(result.matches).toHaveLength(0);
      expect(result.unmatchedTransactionIds).toContain("tx_r");
      expect(result.ambiguousTransactions).toHaveLength(0);
    });

    it("nets a same-batch purchase and refund", () => {
      const benefit = makeBenefit({ creditAmount: 25 });
      const config = makeConfig([benefit]);
      const purchase = makeTx({ id: "tx_p", amount: 20, date: new Date(2026, 0, 10) });
      const refund = makeTx({ id: "tx_r", amount: -20, date: new Date(2026, 0, 15) });

      const result = runMatcher([purchase, refund], config);

      expect(result.matches).toHaveLength(2);
      expect(result.usageUpdates.get("test_benefit:2026-01")).toBe(0);
    });

    it("refund against a maxed benefit frees credit for later purchases", () => {
      const benefit = makeBenefit({ creditAmount: 25 });
      // Benefit already fully used this period
      const config = makeConfig([benefit], { "test_benefit:2026-01": 25 });
      const refund = makeTx({ id: "tx_r", amount: -25, date: new Date(2026, 0, 10) });
      const purchase = makeTx({ id: "tx_p", amount: 25, date: new Date(2026, 0, 15) });

      const result = runMatcher([refund, purchase], config);

      expect(result.matches).toHaveLength(2);
      // Refund releases the full $25, purchase re-consumes it
      expect(result.matches[0].creditApplied).toBe(-25);
      expect(result.matches[1].creditApplied).toBe(25);
    });

    it("refunds never mark transactions ambiguous for non-auto benefits", () => {
      const benefit = makeBenefit({ autoMatchable: false, creditAmount: 25 });
      const config = makeConfig([benefit], { "test_benefit:2026-01": 20 });
      const refund = makeTx({ id: "tx_r", amount: -15 });

      const result = runMatcher([refund], config);

      expect(result.matches).toHaveLength(0);
      expect(result.ambiguousTransactions).toHaveLength(0);
      expect(result.unmatchedTransactionIds).toContain("tx_r");
    });
  });

  describe("cent rounding", () => {
    it("keeps accumulated usage on the cent grid", () => {
      const benefit = makeBenefit({ creditAmount: 30 });
      // Three amounts that sum to 30 exactly but drift in float arithmetic
      // (0.1 + 0.2 !== 0.3)
      const txs = [
        makeTx({ id: "t1", amount: 10.1 }),
        makeTx({ id: "t2", amount: 10.2 }),
        makeTx({ id: "t3", amount: 9.7 }),
      ];
      const config = makeConfig([benefit]);

      const result = runMatcher(txs, config);

      expect(result.matches).toHaveLength(3);
      const total = result.usageUpdates.get("test_benefit:2026-01");
      expect(total).toBe(30); // exactly, not 29.999999999999996
    });
  });
});
