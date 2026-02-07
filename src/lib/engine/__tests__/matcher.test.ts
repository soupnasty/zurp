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
  usageEntries: Record<string, { amountUsed: number; creditAmount: number }> = {}
): MatcherConfig {
  const usageMap = new Map(Object.entries(usageEntries));
  return {
    benefits,
    usageMap,
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
      test_benefit: { amountUsed: 20, creditAmount: 25 },
    });

    const result = runMatcher([tx], config);

    expect(result.matches[0].creditApplied).toBe(5); // Only 5 remaining
  });

  it("skips benefit when fully used", () => {
    const benefit = makeBenefit({ creditAmount: 25 });
    const tx = makeTx({ amount: 20 });
    const config = makeConfig([benefit], {
      test_benefit: { amountUsed: 25, creditAmount: 25 },
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
    // Should also flag as ambiguous since non-auto could have matched
    expect(result.ambiguousTransactions).toContain("tx_1");
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
});
