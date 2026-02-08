import { describe, it, expect } from "vitest";
import { generateInsights } from "../insights";
import type { CategorizedTransaction } from "../types";
import type { BenefitUsageSummary } from "@/lib/types";

function makeTx(
  overrides: Partial<CategorizedTransaction> = {}
): CategorizedTransaction {
  return {
    id: "tx_1",
    date: "2026-02-01T00:00:00.000Z",
    merchantName: "Test Merchant",
    amount: 50,
    category: "other",
    plaidCategoryPrimary: null,
    plaidCategoryDetailed: null,
    ...overrides,
  };
}

function makeUsage(
  overrides: Partial<BenefitUsageSummary> = {}
): BenefitUsageSummary {
  return {
    benefitId: "csr_test",
    benefitName: "Test Credit",
    icon: "Star",
    category: "travel",
    type: "credit",
    cycle: "monthly",
    creditAmount: 100,
    amountUsed: 0,
    amountRemaining: 100,
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
    periodKey: "2026-02",
    cycleStart: new Date("2026-02-01"),
    cycleEnd: new Date("2026-03-01"),
    ...overrides,
  };
}

describe("generateInsights", () => {
  it("returns empty array when no transactions or usages", () => {
    expect(generateInsights([], [], 2)).toEqual([]);
  });

  it("detects missed platform — competitor spending with unused credit", () => {
    const transactions = [
      makeTx({ merchantName: "Ticketmaster", amount: 95, category: "entertainment" }),
    ];
    const usages = [
      makeUsage({
        benefitId: "csr_stubhub_h1",
        benefitName: "StubHub Credit (H1)",
        creditAmount: 150,
        amountUsed: 0,
        amountRemaining: 150,
      }),
    ];

    const insights = generateInsights(transactions, usages, 5);
    const missed = insights.find((i) => i.type === "missed_platform");
    expect(missed).toBeDefined();
    expect(missed!.title).toContain("Ticketmaster");
    expect(missed!.body).toContain("StubHub");
    expect(missed!.actionability).toBe(1);
  });

  it("detects unused credit — $0 used, cycle >50% elapsed", () => {
    const now = Date.now();
    const cycleStart = new Date(now - 20 * 24 * 60 * 60 * 1000); // 20 days ago
    const cycleEnd = new Date(now + 10 * 24 * 60 * 60 * 1000); // 10 days from now

    const usages = [
      makeUsage({
        benefitId: "csr_lyft",
        benefitName: "Lyft Credit",
        creditAmount: 10,
        amountUsed: 0,
        amountRemaining: 10,
        daysRemaining: 10,
        cycleStart,
        cycleEnd,
      }),
    ];

    const insights = generateInsights([], usages, 5);
    const unused = insights.find((i) => i.type === "unused_credit");
    expect(unused).toBeDefined();
    expect(unused!.title).toContain("Lyft Credit");
    expect(unused!.dollarImpact).toBe(10);
  });

  it("does not flag unused credit when cycle is <50% elapsed", () => {
    const now = Date.now();
    const cycleStart = new Date(now - 5 * 24 * 60 * 60 * 1000); // 5 days ago
    const cycleEnd = new Date(now + 25 * 24 * 60 * 60 * 1000); // 25 days from now

    const usages = [
      makeUsage({
        creditAmount: 10,
        amountUsed: 0,
        amountRemaining: 10,
        daysRemaining: 25,
        cycleStart,
        cycleEnd,
      }),
    ];

    const insights = generateInsights([], usages, 5);
    const unused = insights.find((i) => i.type === "unused_credit");
    expect(unused).toBeUndefined();
  });

  it("detects underused credit", () => {
    const usages = [
      makeUsage({
        benefitName: "Travel Credit",
        creditAmount: 300,
        amountUsed: 100,
        amountRemaining: 200,
        isFullyUsed: false,
        daysRemaining: 30,
      }),
    ];

    const insights = generateInsights([], usages, 5);
    const underused = insights.find((i) => i.type === "underused_credit");
    expect(underused).toBeDefined();
    expect(underused!.body).toContain("$100");
    expect(underused!.body).toContain("$300");
  });

  it("detects positive reinforcement for fully used benefits", () => {
    const usages = [
      makeUsage({
        benefitName: "Lyft Credit",
        creditAmount: 10,
        amountUsed: 10,
        amountRemaining: 0,
        isFullyUsed: true,
      }),
    ];

    const insights = generateInsights([], usages, 5);
    const positive = insights.find((i) => i.type === "positive_reinforcement");
    expect(positive).toBeDefined();
    expect(positive!.title).toContain("maxed out");
  });

  it("limits results to max parameter", () => {
    const now = Date.now();
    const cycleStart = new Date(now - 20 * 24 * 60 * 60 * 1000);
    const cycleEnd = new Date(now + 10 * 24 * 60 * 60 * 1000);

    const usages = [
      makeUsage({ benefitId: "a", benefitName: "Credit A", amountUsed: 50, amountRemaining: 50, creditAmount: 100, daysRemaining: 5 }),
      makeUsage({ benefitId: "b", benefitName: "Credit B", amountUsed: 0, amountRemaining: 200, creditAmount: 200, daysRemaining: 10, cycleStart, cycleEnd }),
      makeUsage({ benefitId: "c", benefitName: "Credit C", amountUsed: 30, amountRemaining: 30, creditAmount: 30, isFullyUsed: true }),
    ];

    const insights = generateInsights([], usages, 2);
    expect(insights.length).toBeLessThanOrEqual(2);
  });

  it("prioritizes by dollar impact", () => {
    const now = Date.now();
    const cycleStart = new Date(now - 20 * 24 * 60 * 60 * 1000);
    const cycleEnd = new Date(now + 10 * 24 * 60 * 60 * 1000);

    const usages = [
      makeUsage({
        benefitId: "small",
        benefitName: "Small Credit",
        creditAmount: 10,
        amountUsed: 5,
        amountRemaining: 5,
        daysRemaining: 5,
      }),
      makeUsage({
        benefitId: "big",
        benefitName: "Big Credit",
        creditAmount: 300,
        amountUsed: 0,
        amountRemaining: 300,
        daysRemaining: 5,
        cycleStart,
        cycleEnd,
      }),
    ];

    const insights = generateInsights([], usages, 5);
    expect(insights.length).toBeGreaterThanOrEqual(2);
    // The $300 insight should come before the $5 one
    expect(insights[0].dollarImpact).toBeGreaterThanOrEqual(insights[1].dollarImpact);
  });
});
