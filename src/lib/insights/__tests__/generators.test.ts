import { describe, it, expect } from "vitest";
import { runAllGenerators } from "../generators";
import { generateA1 } from "../generators/a1-competitor-redirect";
import { generateA2 } from "../generators/a2-subscription-swap";
import { generateB1 } from "../generators/b1-unused-credit";
import { generateB3 } from "../generators/b3-underused-credit";
import { generateC1 } from "../generators/c1-benefit-maxed";
import type { GeneratorContext, CompetitorMapEntry } from "../generators/types";
import type { BenefitUsageSummary } from "@/lib/types";
import type { CategorizedTransaction } from "@/lib/spending/types";

function makeCtx(overrides: Partial<GeneratorContext> = {}): GeneratorContext {
  return {
    userId: "user-1",
    transactions: [],
    benefitUsages: [],
    annualFee: 795,
    cardType: "csr",
    competitorEntries: [],
    totalBenefitsCaptured: 0,
    existingMilestoneKeys: [],
    ...overrides,
  };
}

function makeUsage(overrides: Partial<BenefitUsageSummary>): BenefitUsageSummary {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return {
    benefitId: "csr_lyft",
    benefitName: "Lyft Credit",
    icon: "Car",
    category: "transport",
    type: "credit",
    cycle: "monthly",
    creditAmount: 10,
    amountUsed: 0,
    amountRemaining: 10,
    isFullyUsed: false,
    manualOverride: false,
    daysRemaining: 15,
    requiresActivation: false,
    autoMatchable: true,
    sunsetDate: null,
    displayGroup: null,
    displayGroupName: null,
    displayGroupIcon: null,
    details: null,
    periodKey: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
    cycleStart: start,
    cycleEnd: end,
    ...overrides,
  };
}

function makeTx(overrides: Partial<CategorizedTransaction> = {}): CategorizedTransaction {
  return {
    id: "tx-1",
    date: new Date().toISOString(),
    merchantName: "Uber",
    amount: 25,
    category: "transportation",
    plaidCategoryPrimary: "TRANSPORTATION",
    plaidCategoryDetailed: null,
    ...overrides,
  };
}

describe("A1: Competitor Redirect", () => {
  it("generates an insight when user spends at competitor with unused credit", () => {
    const competitors: CompetitorMapEntry[] = [
      {
        benefitKey: "csr_lyft",
        benefitPartner: "Lyft",
        competitorMerchant: "Uber",
        plaidMerchantPattern: "uber",
        category: "rideshare",
        insightType: "A1",
      },
    ];

    const ctx = makeCtx({
      transactions: [makeTx({ merchantName: "Uber", amount: 30 })],
      benefitUsages: [makeUsage({ amountRemaining: 10 })],
      competitorEntries: competitors,
    });

    const results = generateA1(ctx);
    expect(results.length).toBe(1);
    expect(results[0].category).toBe("A1");
    expect(results[0].templateKey).toBe("a1_standard");
    expect(results[0].dollarAmount).toBe(30);
    expect(results[0].dedupKey).toMatch(/^a1:csr_lyft:/);
  });

  it("skips when benefit is fully used", () => {
    const competitors: CompetitorMapEntry[] = [
      {
        benefitKey: "csr_lyft",
        benefitPartner: "Lyft",
        competitorMerchant: "Uber",
        plaidMerchantPattern: "uber",
        category: "rideshare",
        insightType: "A1",
      },
    ];

    const ctx = makeCtx({
      transactions: [makeTx({ merchantName: "Uber", amount: 30 })],
      benefitUsages: [makeUsage({ amountRemaining: 0, isFullyUsed: true })],
      competitorEntries: competitors,
    });

    expect(generateA1(ctx)).toHaveLength(0);
  });

  it("aggregates multiple transactions to same partner", () => {
    const competitors: CompetitorMapEntry[] = [
      {
        benefitKey: "csr_lyft",
        benefitPartner: "Lyft",
        competitorMerchant: "Uber",
        plaidMerchantPattern: "uber",
        category: "rideshare",
        insightType: "A1",
      },
    ];

    const ctx = makeCtx({
      transactions: [
        makeTx({ id: "tx-1", merchantName: "Uber", amount: 15 }),
        makeTx({ id: "tx-2", merchantName: "Uber", amount: 20 }),
      ],
      benefitUsages: [makeUsage({ amountRemaining: 10 })],
      competitorEntries: competitors,
    });

    const results = generateA1(ctx);
    expect(results.length).toBe(1);
    expect(results[0].dollarAmount).toBe(35);
  });
});

describe("B1: Unused Credit", () => {
  it("generates for unused credit past 50% of cycle", () => {
    const now = new Date();
    // Create a cycle that's 75% elapsed
    const start = new Date(now);
    start.setDate(start.getDate() - 22);
    const end = new Date(now);
    end.setDate(end.getDate() + 8);

    const ctx = makeCtx({
      benefitUsages: [
        makeUsage({
          amountUsed: 0,
          amountRemaining: 10,
          cycleStart: start,
          cycleEnd: end,
          daysRemaining: 8,
        }),
      ],
    });

    const results = generateB1(ctx);
    expect(results.length).toBe(1);
    expect(results[0].category).toBe("B1");
    expect(results[0].templateKey).toBe("b1_urgent");
  });

  it("skips when used >= 25%", () => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 22);
    const end = new Date(now);
    end.setDate(end.getDate() + 8);

    const ctx = makeCtx({
      benefitUsages: [
        makeUsage({
          amountUsed: 3,
          amountRemaining: 7,
          cycleStart: start,
          cycleEnd: end,
          daysRemaining: 8,
        }),
      ],
    });

    expect(generateB1(ctx)).toHaveLength(0);
  });

  it("selects b1_very_late for <= 7 days", () => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 25);
    const end = new Date(now);
    end.setDate(end.getDate() + 5);

    const ctx = makeCtx({
      benefitUsages: [
        makeUsage({
          amountUsed: 0,
          cycleStart: start,
          cycleEnd: end,
          daysRemaining: 5,
        }),
      ],
    });

    const results = generateB1(ctx);
    expect(results[0].templateKey).toBe("b1_very_late");
  });
});

describe("B3: Underused Credit", () => {
  it("generates for partially used credit", () => {
    const ctx = makeCtx({
      benefitUsages: [
        makeUsage({
          amountUsed: 3,
          amountRemaining: 7,
          isFullyUsed: false,
        }),
      ],
    });

    const results = generateB3(ctx);
    expect(results.length).toBe(1);
    expect(results[0].category).toBe("B3");
    expect(results[0].dollarAmount).toBe(7);
  });

  it("skips fully used benefits", () => {
    const ctx = makeCtx({
      benefitUsages: [
        makeUsage({ amountUsed: 10, amountRemaining: 0, isFullyUsed: true }),
      ],
    });

    expect(generateB3(ctx)).toHaveLength(0);
  });

  it("skips benefits used >= 75%", () => {
    const ctx = makeCtx({
      benefitUsages: [
        makeUsage({ amountUsed: 8, amountRemaining: 2, creditAmount: 10 }),
      ],
    });

    expect(generateB3(ctx)).toHaveLength(0);
  });
});

describe("A2: Subscription Swap", () => {
  function makeRecurringTxs(merchant: string, amount: number): CategorizedTransaction[] {
    // 4 monthly charges, 30 days apart
    return Array.from({ length: 4 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (i * 30));
      return makeTx({
        id: `tx-${i}`,
        merchantName: merchant,
        amount,
        date: date.toISOString(),
      });
    });
  }

  it("uses a2_free template for subscription benefit type (CSR Apple Music)", () => {
    const competitors: CompetitorMapEntry[] = [
      {
        benefitKey: "csr_apple_music",
        benefitPartner: "Apple Music",
        competitorMerchant: "Spotify",
        plaidMerchantPattern: "spotify",
        category: "streaming",
        insightType: "A2",
      },
    ];

    const ctx = makeCtx({
      transactions: makeRecurringTxs("Spotify", 11),
      competitorEntries: competitors,
      cardType: "chase_sapphire_reserve",
    });

    const results = generateA2(ctx);
    expect(results.length).toBe(1);
    expect(results[0].category).toBe("A2");
    expect(results[0].templateKey).toBe("a2_free");
    expect(results[0].confidence).toBe("exact_confirmed");
    expect(results[0].actionability).toBe("change_recurring");
  });

  it("uses a2_swap template for credit-pool benefit type (Platinum digital entertainment)", () => {
    const competitors: CompetitorMapEntry[] = [
      {
        benefitKey: "plat_digital_entertainment",
        benefitPartner: "Disney+, Hulu, ESPN+, or YouTube Premium",
        competitorMerchant: "Netflix",
        plaidMerchantPattern: "netflix",
        category: "streaming",
        insightType: "A2",
      },
    ];

    const ctx = makeCtx({
      transactions: makeRecurringTxs("Netflix", 16),
      competitorEntries: competitors,
      cardType: "amex_platinum",
    });

    const results = generateA2(ctx);
    expect(results.length).toBe(1);
    expect(results[0].category).toBe("A2");
    expect(results[0].templateKey).toBe("a2_swap");
    expect(results[0].confidence).toBe("category_match");
    expect(results[0].actionability).toBe("plan_future");
    expect(results[0].templateVars.credit_name).toBe("Digital Entertainment Credit");
    expect(results[0].templateVars.credit).toBe(25);
  });

  it("skips non-recurring charges", () => {
    const competitors: CompetitorMapEntry[] = [
      {
        benefitKey: "plat_digital_entertainment",
        benefitPartner: "Disney+",
        competitorMerchant: "Netflix",
        plaidMerchantPattern: "netflix",
        category: "streaming",
        insightType: "A2",
      },
    ];

    const ctx = makeCtx({
      // Only 2 charges — fails recurring heuristic (needs 3+)
      transactions: [
        makeTx({ id: "tx-1", merchantName: "Netflix", amount: 16 }),
        makeTx({ id: "tx-2", merchantName: "Netflix", amount: 16 }),
      ],
      competitorEntries: competitors,
      cardType: "amex_platinum",
    });

    expect(generateA2(ctx)).toHaveLength(0);
  });
});

describe("C1: Benefit Maxed", () => {
  it("generates for fully used credit", () => {
    const ctx = makeCtx({
      benefitUsages: [
        makeUsage({
          amountUsed: 10,
          amountRemaining: 0,
          isFullyUsed: true,
        }),
      ],
    });

    const results = generateC1(ctx);
    expect(results.length).toBe(1);
    expect(results[0].category).toBe("C1");
    expect(results[0].templateKey).toBe("c1_standard");
    expect(results[0].templateVars.benefit).toBe("Lyft Credit");
  });

  it("skips non-credit benefits", () => {
    const ctx = makeCtx({
      benefitUsages: [makeUsage({ type: "subscription", isFullyUsed: true })],
    });

    expect(generateC1(ctx)).toHaveLength(0);
  });
});

describe("runAllGenerators", () => {
  it("runs all registered generators", () => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 22);
    const end = new Date(now);
    end.setDate(end.getDate() + 8);

    const ctx = makeCtx({
      benefitUsages: [
        // B1: unused credit past 50%
        makeUsage({
          benefitId: "csr_stubhub_h1",
          benefitName: "StubHub Credit",
          amountUsed: 0,
          amountRemaining: 150,
          creditAmount: 150,
          cycleStart: start,
          cycleEnd: end,
          daysRemaining: 8,
        }),
        // C1: fully used
        makeUsage({
          benefitId: "csr_lyft",
          benefitName: "Lyft Credit",
          amountUsed: 10,
          amountRemaining: 0,
          isFullyUsed: true,
        }),
      ],
    });

    const results = runAllGenerators(ctx);
    const categories = results.map((r) => r.category);
    expect(categories).toContain("B1");
    expect(categories).toContain("C1");
  });
});
