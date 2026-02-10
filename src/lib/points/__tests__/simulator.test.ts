import { describe, it, expect } from "vitest";
import { runSimulation } from "../simulator";
import { csrEarnConfig } from "../earn-configs/chase-sapphire-reserve";
import { cspEarnConfig } from "../earn-configs/chase-sapphire-preferred";
import { amexGoldEarnConfig } from "../earn-configs/amex-gold";
import type { CategoryAssignment } from "../types";

function makeTx(
  id: string,
  date: string,
  merchant: string,
  amount: number,
  category: string,
  confidence: "high" | "medium" | "low" = "high"
) {
  return {
    id,
    date: new Date(date),
    merchantName: merchant,
    amount,
    assignment: {
      category,
      confidence,
      matchSource: "merchant_name" as const,
      matchedValue: merchant.toLowerCase(),
    } as CategoryAssignment,
  };
}

describe("runSimulation", () => {
  const period = {
    start: new Date("2025-01-01"),
    end: new Date("2025-12-31"),
  };

  it("simulates 3 cards and produces rankings", () => {
    const transactions = [
      makeTx("t1", "2025-01-15", "CHIPOTLE", 15, "dining"),
      makeTx("t2", "2025-02-01", "WHOLE FOODS", 200, "grocery"),
      makeTx("t3", "2025-03-01", "UNITED AIR", 500, "travel_flights"),
      makeTx("t4", "2025-04-01", "NETFLIX", 15.99, "streaming"),
      makeTx("t5", "2025-05-01", "LYFT RIDE", 25, "rideshare"),
    ];

    const result = runSimulation({
      transactions,
      configs: [csrEarnConfig, cspEarnConfig, amexGoldEarnConfig],
      usersCardId: "chase_sapphire_reserve",
      benefitsCaptured: 1500,
      period,
      monthCount: 12,
    });

    expect(result.cards).toHaveLength(3);
    expect(result.totalTransactions).toBe(5);

    // User's card should be first
    expect(result.cards[0].isUsersCard).toBe(true);
    expect(result.cards[0].cardId).toBe("chase_sapphire_reserve");

    // Should have category breakdown
    expect(result.categoryBreakdown.length).toBeGreaterThan(0);

    // Should have headline
    expect(result.headline).toBeDefined();
    expect(["win", "lose", "close"]).toContain(result.headline.type);
  });

  it("applies CSP 10% anniversary bonus", () => {
    const transactions = [
      makeTx("t1", "2025-06-01", "CHIPOTLE", 100, "dining"),
    ];

    const result = runSimulation({
      transactions,
      configs: [cspEarnConfig],
      usersCardId: "chase_sapphire_preferred",
      benefitsCaptured: null,
      period,
      monthCount: 12,
    });

    const csp = result.cards[0];
    // 100 * 3 = 300 points + 10% = 30 bonus = 330 total
    expect(csp.totalPoints).toBe(330);
    expect(csp.bonusPoints).toBe(30);
  });

  it("tracks Gold grocery cap across transactions", () => {
    const transactions = [];
    for (let i = 0; i < 10; i++) {
      transactions.push(
        makeTx(`g${i}`, `2025-${String(i + 1).padStart(2, "0")}-01`, "WHOLE FOODS", 2600, "grocery")
      );
    }
    // Total grocery: $26,000 → $25K at 4x, $1K at 1x

    const result = runSimulation({
      transactions,
      configs: [amexGoldEarnConfig],
      usersCardId: "amex_gold",
      benefitsCaptured: null,
      period,
      monthCount: 12,
    });

    const gold = result.cards[0];
    expect(gold.totalPoints).toBe(101000);
  });

  it("handles refunds correctly", () => {
    const transactions = [
      makeTx("t1", "2025-01-01", "CHIPOTLE", 50, "dining"),
      makeTx("t2", "2025-01-15", "CHIPOTLE", -10, "dining"),
    ];

    const result = runSimulation({
      transactions,
      configs: [csrEarnConfig],
      usersCardId: "chase_sapphire_reserve",
      benefitsCaptured: 0,
      period,
      monthCount: 12,
    });

    const csr = result.cards[0];
    expect(csr.totalPoints).toBe(120);
  });

  it("determines winner per category", () => {
    const transactions = [
      makeTx("t1", "2025-01-01", "CHIPOTLE", 1000, "dining"),
    ];

    const result = runSimulation({
      transactions,
      configs: [csrEarnConfig, cspEarnConfig, amexGoldEarnConfig],
      usersCardId: "chase_sapphire_reserve",
      benefitsCaptured: 0,
      period,
      monthCount: 12,
    });

    const diningCategory = result.categoryBreakdown.find(
      (c) => c.category === "dining"
    );
    expect(diningCategory).toBeDefined();

    const goldEntry = diningCategory!.cards.find(
      (c) => c.cardId === "amex_gold"
    );
    expect(goldEntry?.isWinner).toBe(true);
  });

  it("computes netFloor, netCeiling, and netActual correctly", () => {
    const transactions = [
      makeTx("t1", "2025-01-01", "CHIPOTLE", 1000, "dining"),
    ];

    const result = runSimulation({
      transactions,
      configs: [csrEarnConfig],
      usersCardId: "chase_sapphire_reserve",
      benefitsCaptured: 500,
      period,
      monthCount: 12,
    });

    const csr = result.cards[0];
    // 1000 * 3 = 3000 pts * 1.25cpp = $37.50
    const pointsValue = 37.5;
    expect(csr.pointsValueConservative).toBe(pointsValue);

    // netFloor = points - fee (no benefits)
    expect(csr.netFloor).toBe(pointsValue - 795);

    // netCeiling = points + full benefits - fee
    expect(csr.netCeiling).toBe(Math.round((pointsValue + csr.benefitsValue - 795) * 100) / 100);

    // netActual = points + captured($500) - fee
    expect(csr.netActual).toBe(Math.round((pointsValue + 500 - 795) * 100) / 100);

    // For user's card: floor < actual < ceiling
    expect(csr.netFloor).toBeLessThan(csr.netActual);
    expect(csr.netActual).toBeLessThan(csr.netCeiling);
  });

  it("ranks and headlines by netFloor (points only)", () => {
    const transactions = [
      makeTx("t1", "2025-01-01", "CHIPOTLE", 1000, "dining"),
    ];

    const result = runSimulation({
      transactions,
      configs: [csrEarnConfig, cspEarnConfig, amexGoldEarnConfig],
      usersCardId: "chase_sapphire_reserve",
      benefitsCaptured: 2000,
      period,
      monthCount: 12,
    });

    // CSR: 3000pts * 1.25cpp = $37.50 - $795 = -$757.50 floor
    // CSP: 3300pts(+10%) * 1.25cpp = $41.25 - $95 = -$53.75 floor
    // Gold: 4000pts * 1.0cpp = $40.00 - $325 = -$285 floor
    // CSP has highest floor → rank 1
    const csp = result.cards.find((c) => c.cardId === "chase_sapphire_preferred");
    expect(csp?.rank).toBe(1);

    // Headline should compare using floor values, not netValue with mixed benefits
    expect(result.headline.type).toBe("lose");
    expect(result.headline.bestAlternativeName).toBe("Chase Sapphire Preferred");
  });
});
