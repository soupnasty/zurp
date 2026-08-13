import { describe, it, expect } from "vitest";
import { classifyForPoints } from "../categories";
import { calculatePointsForTransaction } from "../calculator";
import { getEarnConfig } from "../earn-configs";
import type { CapState, EarnCategory, CategoryConfidence } from "../types";

/**
 * These tests verify the aggregation logic used by computeAndPersistPointsSummary
 * without requiring a database connection. They test the same classify → calculate
 * pipeline that the persistence module uses.
 */
describe("Points aggregation pipeline", () => {
  it("correctly classifies and calculates points for CSR dining", () => {
    const config = getEarnConfig("chase_sapphire_reserve")!;
    const capState: CapState = {};

    const classification = classifyForPoints(
      "Chipotle",
      "FOOD_AND_DRINK",
      "FOOD_AND_DRINK_RESTAURANTS"
    );
    expect(classification.category).toBe("dining");

    const result = calculatePointsForTransaction(
      {
        id: "tx-1",
        merchantName: "Chipotle",
        amount: 15,
        category: classification.category,
        confidence: classification.confidence,
      },
      config,
      capState
    );

    // CSR: 3x dining
    expect(result.earnRate).toBe(3);
    expect(result.points).toBe(45);
  });

  it("handles refunds by subtracting points", () => {
    const config = getEarnConfig("chase_sapphire_reserve")!;
    const capState: CapState = {};

    // First a charge
    const charge = calculatePointsForTransaction(
      {
        id: "tx-1",
        merchantName: "Restaurant",
        amount: 50,
        category: "dining" as EarnCategory,
        confidence: "high" as CategoryConfidence,
      },
      config,
      capState
    );

    // Then a refund (negative amount in persistence means we pass positive amount with negative result)
    const refund = calculatePointsForTransaction(
      {
        id: "tx-2",
        merchantName: "Restaurant",
        amount: -20,
        category: "dining" as EarnCategory,
        confidence: "high" as CategoryConfidence,
      },
      config,
      capState
    );

    expect(charge.points).toBe(150); // 50 * 3
    expect(refund.points).toBe(-60); // -20 * 3
    expect(charge.points + refund.points).toBe(90); // net
  });

  it("correctly aggregates across categories", () => {
    const config = getEarnConfig("chase_sapphire_reserve")!;
    const capState: CapState = {};

    const txs = [
      { id: "tx-1", merchantName: "Chipotle", category: "dining" as EarnCategory, amount: 20 },
      { id: "tx-2", merchantName: "Whole Foods", category: "groceries" as EarnCategory, amount: 100 },
      { id: "tx-3", merchantName: "Amazon", category: "other" as EarnCategory, amount: 50 },
    ];

    let totalPoints = 0;
    const categoryAccum = new Map<EarnCategory, { spend: number; points: number }>();

    for (const tx of txs) {
      const result = calculatePointsForTransaction(
        {
          id: tx.id,
          merchantName: tx.merchantName,
          amount: tx.amount,
          category: tx.category,
          confidence: "high" as CategoryConfidence,
        },
        config,
        capState
      );

      totalPoints += result.points;
      const accum = categoryAccum.get(tx.category) ?? { spend: 0, points: 0 };
      accum.spend += tx.amount;
      accum.points += result.points;
      categoryAccum.set(tx.category, accum);
    }

    // CSR: dining 3x, groceries 1x (base), other 1x (base)
    expect(totalPoints).toBe(60 + 100 + 50); // 210
    expect(categoryAccum.get("dining")!.points).toBe(60);
    expect(categoryAccum.get("groceries")!.points).toBe(100);
    expect(categoryAccum.get("other")!.points).toBe(50);
  });

  it("has no anniversary bonus after the June 2026 CSP refresh", () => {
    const config = getEarnConfig("chase_sapphire_preferred")!;
    expect(config.anniversaryBonus).toBeUndefined();
  });

  it("applies caps for Amex Gold grocery", () => {
    const config = getEarnConfig("amex_gold")!;
    const capState: CapState = {};

    // Amex Gold: 4x grocery up to $25,000/yr
    // Simulate $24,990 already spent
    const cap = config.caps.find((c) => c.categories.includes("groceries"));
    expect(cap).toBeDefined();

    // Pre-fill cap state near limit
    capState[cap!.capId] = { spendToDate: 24990, maxSpend: cap!.maxSpend };

    const result = calculatePointsForTransaction(
      {
        id: "tx-1",
        merchantName: "Whole Foods",
        amount: 20,
        category: "groceries" as EarnCategory,
        confidence: "high" as CategoryConfidence,
      },
      config,
      capState
    );

    // $10 at 4x + $10 at 1x = 50 points
    expect(result.capApplied).toBe(true);
    expect(result.points).toBe(50);
  });

  it("computes conservative and upside values", () => {
    const config = getEarnConfig("chase_sapphire_reserve")!;
    const totalPoints = 10000;

    const valueConservative = Math.round(
      (totalPoints * config.valuation.conservativeCpp) / 100
    );
    const valueUpside = Math.round(
      (totalPoints * config.valuation.upsideCpp) / 100
    );

    expect(config.valuation.conservativeCpp).toBe(1.0);
    expect(valueConservative).toBe(100);
    expect(valueUpside).toBeGreaterThan(valueConservative);
  });

  it("builds category breakdown sorted by spend desc", () => {
    const categories = [
      { category: "other", spend: 50, points: 50 },
      { category: "dining", spend: 200, points: 600 },
      { category: "groceries", spend: 100, points: 100 },
    ];

    const sorted = categories
      .filter((c) => c.spend > 0)
      .sort((a, b) => b.spend - a.spend);

    expect(sorted[0].category).toBe("dining");
    expect(sorted[1].category).toBe("groceries");
    expect(sorted[2].category).toBe("other");
  });
});
