import { describe, it, expect } from "vitest";
import { runAllGenerators } from "../generators";
import { generateA1 } from "../generators/a1-competitor-redirect";
import { generateA2 } from "../generators/a2-subscription-swap";
import { generateB1 } from "../generators/b1-unused-credit";
import { generateB3 } from "../generators/b3-underused-credit";
import { generateC1 } from "../generators/c1-benefit-maxed";
import { generateC0 } from "../generators/c0-value-snapshot";
import { generateC2 } from "../generators/c2-roi-milestone";
import { generateP1 } from "../generators/p1-points-highlight";
import { generateP2 } from "../generators/p2-missed-bonus";
import { generateB4 } from "../generators/b4-benefit-renewal";
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
    expect(results[0].dollarAmount).toBe(10); // capped at remaining credit (min of 30, 10)
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
    expect(results[0].dollarAmount).toBe(10); // capped at remaining credit (min of 35, 10)
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

describe("C2: ROI Milestone with Points", () => {
  it("includes points in total value for milestone calculation", () => {
    const ctx = makeCtx({
      annualFee: 550,
      cardType: "amex_platinum",
      totalBenefitsCaptured: 200,
      // Pre-fill lower milestones so it reaches the 100% check
      existingMilestoneKeys: [
        "c2:amex_platinum:50pct",
        "c2:amex_platinum:75pct",
      ],
      pointsData: {
        totalPoints: 20000,
        valueConservative: 400,
        conservativeCpp: 2.0,
        cardId: "amex_platinum",
        baseRate: 1,
        categories: [],
      },
    });

    // total = 200 + 400 = 600, fee = 550 → 109% → break even
    const results = generateC2(ctx);
    expect(results.length).toBe(1);
    expect(results[0].templateKey).toBe("c2_break_even_with_points");
    expect(results[0].templateVars.credits).toBe(200);
    expect(results[0].templateVars.points_value).toBe(400);
  });

  it("uses card-specific dedup keys", () => {
    const ctx = makeCtx({
      annualFee: 400,
      cardType: "citi_strata_elite",
      totalBenefitsCaptured: 250,
      existingMilestoneKeys: [],
      pointsData: null,
    });

    const results = generateC2(ctx);
    expect(results.length).toBe(1);
    expect(results[0].dedupKey).toBe("c2:citi_strata_elite:50pct");
  });

  it("falls back to credit-only when no points data", () => {
    const ctx = makeCtx({
      annualFee: 550,
      cardType: "amex_gold",
      totalBenefitsCaptured: 550,
      existingMilestoneKeys: [
        "c2:amex_gold:50pct",
        "c2:amex_gold:75pct",
      ],
    });

    const results = generateC2(ctx);
    expect(results.length).toBe(1);
    expect(results[0].templateKey).toBe("c2_break_even");
  });
});

describe("C0: Value Snapshot with Points", () => {
  it("uses points_dominant template when points >> credits", () => {
    const ctx = makeCtx({
      annualFee: 550,
      totalBenefitsCaptured: 50,
      benefitUsages: [makeUsage({ periodKey: "2025-01" })],
      pointsData: {
        totalPoints: 15000,
        valueConservative: 300,
        conservativeCpp: 2.0,
        cardId: "amex_platinum",
        baseRate: 1,
        categories: [],
      },
    });

    const results = generateC0(ctx);
    expect(results.length).toBe(1);
    expect(results[0].templateKey).toBe("c0_points_dominant");
    expect(results[0].templateVars.points_value).toBe(300);
  });

  it("uses _with_points suffix when points present but not dominant", () => {
    const ctx = makeCtx({
      annualFee: 550,
      totalBenefitsCaptured: 300,
      benefitUsages: [
        makeUsage({ periodKey: "2025-01" }),
        makeUsage({ periodKey: "2025-02" }),
        makeUsage({ periodKey: "2025-03" }),
      ],
      pointsData: {
        totalPoints: 5000,
        valueConservative: 100,
        conservativeCpp: 2.0,
        cardId: "amex_platinum",
        baseRate: 1,
        categories: [],
      },
    });

    const results = generateC0(ctx);
    expect(results.length).toBe(1);
    expect(results[0].templateKey).toBe("c0_strong_with_points");
    expect(results[0].templateVars.total).toBe(400);
  });
});

describe("P1: Points Earning Highlight", () => {
  it("generates for bonus category with extra value >= $50", () => {
    const ctx = makeCtx({
      cardType: "chase_sapphire_reserve",
      pointsData: {
        totalPoints: 10000,
        valueConservative: 200,
        conservativeCpp: 2.0,
        cardId: "chase_sapphire_reserve",
        baseRate: 1,
        categories: [
          { category: "dining", spend: 2000, points: 6000, earnRate: 3, valueConservative: 120 },
          { category: "other", spend: 1000, points: 1000, earnRate: 1, valueConservative: 20 },
        ],
      },
    });

    const results = generateP1(ctx);
    expect(results.length).toBe(1);
    expect(results[0].category).toBe("P1");
    // Extra: 6000 - (2000*1) = 4000 pts → $80 at 2cpp
    expect(results[0].templateVars.extra_value).toBe(80);
    expect(results[0].templateKey).toBe("p1_standard");
  });

  it("skips categories at base rate", () => {
    const ctx = makeCtx({
      pointsData: {
        totalPoints: 1000,
        valueConservative: 20,
        conservativeCpp: 2.0,
        cardId: "csr",
        baseRate: 1,
        categories: [
          { category: "other", spend: 1000, points: 1000, earnRate: 1, valueConservative: 20 },
        ],
      },
    });

    expect(generateP1(ctx)).toHaveLength(0);
  });

  it("uses high_value template for >= $200 extra", () => {
    const ctx = makeCtx({
      cardType: "chase_sapphire_reserve",
      pointsData: {
        totalPoints: 30000,
        valueConservative: 600,
        conservativeCpp: 2.0,
        cardId: "chase_sapphire_reserve",
        baseRate: 1,
        categories: [
          { category: "dining", spend: 8000, points: 24000, earnRate: 3, valueConservative: 480 },
        ],
      },
    });

    const results = generateP1(ctx);
    expect(results.length).toBe(1);
    // Extra: 24000 - 8000 = 16000 pts → $320
    expect(results[0].templateKey).toBe("p1_high_value");
  });

  it("returns empty when no points data", () => {
    const ctx = makeCtx({ pointsData: null });
    expect(generateP1(ctx)).toHaveLength(0);
  });
});

describe("P2: Missed Bonus Opportunity", () => {
  it("generates for Uber spending on CSR (rideshare scenario)", () => {
    const ctx = makeCtx({
      cardType: "chase_sapphire_reserve",
      transactions: [
        makeTx({ id: "tx-1", merchantName: "Uber", amount: 80 }),
        makeTx({ id: "tx-2", merchantName: "UBER *EATS", amount: 30 }),
      ],
      pointsData: {
        totalPoints: 5000,
        valueConservative: 100,
        conservativeCpp: 2.0,
        cardId: "chase_sapphire_reserve",
        baseRate: 1,
        categories: [],
      },
    });

    const results = generateP2(ctx);
    expect(results.length).toBe(1);
    expect(results[0].category).toBe("P2");
    expect(results[0].templateKey).toBe("p2_rideshare");
    expect(results[0].templateVars.redirect_to).toBe("Lyft");
  });

  it("generates portal redirect for hotels on CSR", () => {
    const ctx = makeCtx({
      cardType: "chase_sapphire_reserve",
      transactions: [],
      pointsData: {
        totalPoints: 5000,
        valueConservative: 100,
        conservativeCpp: 2.0,
        cardId: "chase_sapphire_reserve",
        baseRate: 1,
        categories: [
          { category: "travel_hotels", spend: 500, points: 1500, earnRate: 3, valueConservative: 30 },
        ],
      },
    });

    const results = generateP2(ctx);
    expect(results.length).toBe(1);
    expect(results[0].templateKey).toBe("p2_portal");
    expect(results[0].templateVars.redirect_to).toBe("Chase Travel Portal");
  });

  it("skips when no points data", () => {
    const ctx = makeCtx({ cardType: "chase_sapphire_reserve" });
    expect(generateP2(ctx)).toHaveLength(0);
  });

  it("skips when spend is below $50 threshold", () => {
    const ctx = makeCtx({
      cardType: "chase_sapphire_reserve",
      transactions: [makeTx({ merchantName: "Uber", amount: 20 })],
      pointsData: {
        totalPoints: 1000,
        valueConservative: 20,
        conservativeCpp: 2.0,
        cardId: "chase_sapphire_reserve",
        baseRate: 1,
        categories: [],
      },
    });

    expect(generateP2(ctx)).toHaveLength(0);
  });
});

describe("B4: Benefit Renewal", () => {
  it("generates for high-value credit renewing within 7 days with >= 50% usage", () => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 25);
    const end = new Date(now);
    end.setDate(end.getDate() + 5);

    const ctx = makeCtx({
      benefitUsages: [
        makeUsage({
          benefitId: "plat_hotel",
          benefitName: "Hotel Credit",
          type: "credit",
          creditAmount: 200,
          amountUsed: 150,
          amountRemaining: 50,
          isFullyUsed: false,
          daysRemaining: 5,
          cycleStart: start,
          cycleEnd: end,
          periodKey: "2026-H1",
        }),
      ],
    });

    const results = generateB4(ctx);
    expect(results.length).toBe(1);
    expect(results[0].category).toBe("B4");
    expect(results[0].templateKey).toBe("b4_renewing");
    expect(results[0].templateVars.benefit).toBe("Hotel Credit");
    expect(results[0].templateVars.credit).toBe(200);
    expect(results[0].templateVars.days).toBe(5);
    expect(results[0].templateVars.used).toBe(150);
  });

  it("uses b4_maxed_renewing for fully used benefits", () => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 25);
    const end = new Date(now);
    end.setDate(end.getDate() + 3);

    const ctx = makeCtx({
      benefitUsages: [
        makeUsage({
          benefitId: "plat_hotel",
          benefitName: "Hotel Credit",
          type: "credit",
          creditAmount: 200,
          amountUsed: 200,
          amountRemaining: 0,
          isFullyUsed: true,
          daysRemaining: 3,
          cycleStart: start,
          cycleEnd: end,
          periodKey: "2026-H1",
        }),
      ],
    });

    const results = generateB4(ctx);
    expect(results.length).toBe(1);
    expect(results[0].templateKey).toBe("b4_maxed_renewing");
  });

  it("skips low-value credits (< $50)", () => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 25);
    const end = new Date(now);
    end.setDate(end.getDate() + 3);

    const ctx = makeCtx({
      benefitUsages: [
        makeUsage({
          creditAmount: 10,
          amountUsed: 8,
          daysRemaining: 3,
          cycleStart: start,
          cycleEnd: end,
        }),
      ],
    });

    expect(generateB4(ctx)).toHaveLength(0);
  });

  it("skips benefits with > 7 days remaining", () => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 15);
    const end = new Date(now);
    end.setDate(end.getDate() + 15);

    const ctx = makeCtx({
      benefitUsages: [
        makeUsage({
          creditAmount: 200,
          amountUsed: 150,
          daysRemaining: 15,
          cycleStart: start,
          cycleEnd: end,
        }),
      ],
    });

    expect(generateB4(ctx)).toHaveLength(0);
  });

  it("skips benefits with < 50% usage (B1 handles those)", () => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 25);
    const end = new Date(now);
    end.setDate(end.getDate() + 5);

    const ctx = makeCtx({
      benefitUsages: [
        makeUsage({
          creditAmount: 200,
          amountUsed: 50, // 25% usage
          daysRemaining: 5,
          cycleStart: start,
          cycleEnd: end,
        }),
      ],
    });

    expect(generateB4(ctx)).toHaveLength(0);
  });
});

describe("C2: Highest Milestone Selection", () => {
  it("emits highest reached milestone when multiple are reached at once", () => {
    const ctx = makeCtx({
      annualFee: 200,
      cardType: "test_card",
      totalBenefitsCaptured: 350, // 175% of $200 fee
      existingMilestoneKeys: [],
      pointsData: null,
    });

    const results = generateC2(ctx);
    expect(results.length).toBe(1);
    // Should pick 150% (not 50% or 75% or 100%)
    expect(results[0].dedupKey).toBe("c2:test_card:150pct");
    expect(results[0].templateKey).toBe("c2_profitable");
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
