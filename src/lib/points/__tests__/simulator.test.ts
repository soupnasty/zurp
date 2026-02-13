import { describe, it, expect } from "vitest";
import { runSimulation } from "../simulator";
import { csrEarnConfig } from "../earn-configs/chase-sapphire-reserve";
import { cspEarnConfig } from "../earn-configs/chase-sapphire-preferred";
import { cffEarnConfig } from "../earn-configs/chase-freedom-flex";
import { amexGoldEarnConfig } from "../earn-configs/amex-gold";
import { citiStrataEliteEarnConfig } from "../earn-configs/citi-strata-elite";
import { ventureXEarnConfig } from "../earn-configs/capital-one-venture-x";
import { biltPalladiumEarnConfig } from "../earn-configs/bilt-palladium";
import type { CategoryAssignment } from "../types";

function makeTx(
  id: string,
  date: string,
  merchant: string,
  amount: number,
  category: string,
  confidence: "high" | "medium" | "low" = "high",
  datetime: Date | null = null
) {
  return {
    id,
    date: new Date(date),
    datetime,
    merchantName: merchant,
    merchantNameRaw: merchant,
    amount,
    plaidCategoryPrimary: null as string | null,
    plaidCategoryDetailed: null as string | null,
    assignment: {
      category,
      confidence,
      matchSource: "merchant_name" as const,
      matchedValue: merchant.toLowerCase(),
    } as CategoryAssignment,
  };
}

/** Helper: assert non-null and return typed result */
function assertResult(result: ReturnType<typeof runSimulation>) {
  expect(result).not.toBeNull();
  return result!;
}

describe("runSimulation", () => {
  const period = {
    start: new Date("2025-01-01"),
    end: new Date("2025-12-31"),
  };

  it("simulates 3 cards and produces rankings", () => {
    const transactions = [
      makeTx("t1", "2025-01-15", "CHIPOTLE", 15, "dining"),
      makeTx("t2", "2025-02-01", "WHOLE FOODS", 200, "groceries"),
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
    })!;

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
    })!;

    const csp = result.cards[0];
    // 100 * 3 = 300 points + 10% = 30 bonus = 330 total
    expect(csp.totalPoints).toBe(330);
    expect(csp.bonusPoints).toBe(30);
  });

  it("tracks Gold grocery cap across transactions", () => {
    const transactions = [];
    for (let i = 0; i < 10; i++) {
      transactions.push(
        makeTx(`g${i}`, `2025-${String(i + 1).padStart(2, "0")}-01`, "WHOLE FOODS", 2600, "groceries")
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
    })!;

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
    })!;

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
    })!;

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
    })!;

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
    })!;

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

  describe("portal mode", () => {
    it("reclassifies travel categories as travel_portal", () => {
      const transactions = [
        makeTx("t1", "2025-03-01", "MARRIOTT", 500, "travel_hotels"),
        makeTx("t2", "2025-03-15", "UNITED AIR", 300, "travel_flights"),
      ];

      const resultDirect = runSimulation({
        transactions,
        configs: [csrEarnConfig],
        usersCardId: "chase_sapphire_reserve",
        benefitsCaptured: 0,
        period,
        monthCount: 12,
        portalMode: false,
      })!;

      const resultPortal = runSimulation({
        transactions,
        configs: [csrEarnConfig],
        usersCardId: "chase_sapphire_reserve",
        benefitsCaptured: 0,
        period,
        monthCount: 12,
        portalMode: true,
      })!;

      // CSR: 4x direct travel vs 8x portal
      const csrDirect = resultDirect.cards[0];
      const csrPortal = resultPortal.cards[0];
      expect(csrPortal.totalPoints).toBeGreaterThan(csrDirect.totalPoints);

      // Portal: (500+300) * 8 = 6400 vs Direct: (500+300) * 4 = 3200
      expect(csrDirect.totalPoints).toBe(3200);
      expect(csrPortal.totalPoints).toBe(6400);
    });

    it("sets portalMode flag in output", () => {
      const transactions = [makeTx("t1", "2025-01-01", "RANDOM", 100, "other")];

      const result = runSimulation({
        transactions,
        configs: [csrEarnConfig],
        usersCardId: "chase_sapphire_reserve",
        benefitsCaptured: 0,
        period,
        monthCount: 12,
        portalMode: true,
      })!;

      expect(result.portalMode).toBe(true);
    });

    it("Citi earns 12x portal hotels vs 1.5x direct", () => {
      const transactions = [
        makeTx("t1", "2025-03-01", "MARRIOTT", 1000, "travel_hotels"),
      ];

      const direct = runSimulation({
        transactions,
        configs: [citiStrataEliteEarnConfig],
        usersCardId: "citi_strata_elite",
        benefitsCaptured: null,
        period,
        monthCount: 12,
        portalMode: false,
      })!;

      const portal = runSimulation({
        transactions,
        configs: [citiStrataEliteEarnConfig],
        usersCardId: "citi_strata_elite",
        benefitsCaptured: null,
        period,
        monthCount: 12,
        portalMode: true,
      })!;

      // Direct: 1000 * 1.5 = 1500 (base rate, no travel bonus)
      expect(direct.cards[0].totalPoints).toBe(1500);
      // Portal: 1000 * 12 = 12000 (MARRIOTT isn't an airline, so matches hotel catch-all)
      expect(portal.cards[0].totalPoints).toBe(12000);
    });

    it("Citi earns 6x portal flights via merchant match", () => {
      const transactions = [
        makeTx("t1", "2025-03-01", "UNITED AIRLINES", 1000, "travel_flights"),
      ];

      const portal = runSimulation({
        transactions,
        configs: [citiStrataEliteEarnConfig],
        usersCardId: "citi_strata_elite",
        benefitsCaptured: null,
        period,
        monthCount: 12,
        portalMode: true,
      })!;

      // Portal flight: "united" matches merchant_match -> 6x
      expect(portal.cards[0].totalPoints).toBe(6000);
    });
  });

  describe("Venture X portal mode", () => {
    it("earns 10x on portal hotels in portal mode", () => {
      const transactions = [
        makeTx("t1", "2025-03-01", "MARRIOTT", 1000, "travel_hotels"),
      ];

      const portal = runSimulation({
        transactions,
        configs: [ventureXEarnConfig],
        usersCardId: "capital_one_venture_x",
        benefitsCaptured: null,
        period,
        monthCount: 12,
        portalMode: true,
      })!;

      // Portal: 1000 * 10 = 10000 (MARRIOTT isn't an airline, so matches hotel catch-all)
      expect(portal.cards[0].totalPoints).toBe(10000);
    });

    it("earns 5x on portal flights in portal mode", () => {
      const transactions = [
        makeTx("t1", "2025-03-01", "UNITED AIRLINES", 1000, "travel_flights"),
      ];

      const portal = runSimulation({
        transactions,
        configs: [ventureXEarnConfig],
        usersCardId: "capital_one_venture_x",
        benefitsCaptured: null,
        period,
        monthCount: 12,
        portalMode: true,
      })!;

      // Portal flight: "united" matches merchant_match -> 5x
      expect(portal.cards[0].totalPoints).toBe(5000);
    });

    it("earns 2x on non-travel (base rate)", () => {
      const transactions = [
        makeTx("t1", "2025-01-01", "RANDOM STORE", 1000, "other"),
      ];

      const result = runSimulation({
        transactions,
        configs: [ventureXEarnConfig],
        usersCardId: "capital_one_venture_x",
        benefitsCaptured: null,
        period,
        monthCount: 12,
      })!;

      // 1000 * 2 = 2000 (base rate)
      expect(result.cards[0].totalPoints).toBe(2000);
    });
  });

  describe("Citi Nights time-window", () => {
    it("earns 6x dining on Friday 8PM ET with datetime", () => {
      // Friday Jan 3, 2025 at 8PM ET = 2025-01-04 01:00:00 UTC
      const fridayNight = new Date("2025-01-04T01:00:00Z");
      const transactions = [
        makeTx("t1", "2025-01-03", "CHIPOTLE", 50, "dining", "high", fridayNight),
      ];

      const result = runSimulation({
        transactions,
        configs: [citiStrataEliteEarnConfig],
        usersCardId: "citi_strata_elite",
        benefitsCaptured: null,
        period,
        monthCount: 12,
      })!;

      // 50 * 6 = 300 (Citi Nights)
      expect(result.cards[0].totalPoints).toBe(300);
    });

    it("earns 3x dining on Wednesday with datetime", () => {
      // Wednesday Jan 1, 2025 at 8PM ET = 2025-01-02 01:00:00 UTC
      const wedNight = new Date("2025-01-02T01:00:00Z");
      const transactions = [
        makeTx("t1", "2025-01-01", "CHIPOTLE", 50, "dining", "high", wedNight),
      ];

      const result = runSimulation({
        transactions,
        configs: [citiStrataEliteEarnConfig],
        usersCardId: "citi_strata_elite",
        benefitsCaptured: null,
        period,
        monthCount: 12,
      })!;

      // 50 * 3 = 150 (regular dining, not Citi Nights)
      expect(result.cards[0].totalPoints).toBe(150);
    });
  });

  // ── Fix #2: Refund detection in simulator ──
  describe("refund handling (Fix #2)", () => {
    it("refunds reduce total points and are not counted as spend", () => {
      const transactions = [
        makeTx("t1", "2025-01-01", "WHOLE FOODS", 200, "groceries"),
        makeTx("t2", "2025-01-10", "WHOLE FOODS", -50, "groceries"), // refund
        makeTx("t3", "2025-02-01", "CHIPOTLE", 100, "dining"),
      ];

      const result = runSimulation({
        transactions,
        configs: [csrEarnConfig],
        usersCardId: "chase_sapphire_reserve",
        benefitsCaptured: 0,
        period,
        monthCount: 12,
      })!;

      const csr = result.cards[0];
      // Grocery: 200*1 - 50*1 = 150 (CSR 1x on grocery)
      // Dining: 100*3 = 300
      // Total: 450
      expect(csr.totalPoints).toBe(450);

      // Total spend should be |200| + |-50| + |100| = 350
      expect(result.totalSpend).toBe(350);
    });
  });

  // ── Fix #3: Portal mode car_rentals ──
  describe("portal mode car_rentals (Fix #3)", () => {
    it("reclassifies car_rentals to travel_portal in portal mode", () => {
      const transactions = [
        makeTx("t1", "2025-03-01", "HERTZ RENTAL", 150, "car_rentals"),
      ];

      const direct = runSimulation({
        transactions,
        configs: [csrEarnConfig],
        usersCardId: "chase_sapphire_reserve",
        benefitsCaptured: 0,
        period,
        monthCount: 12,
        portalMode: false,
      })!;

      const portal = runSimulation({
        transactions,
        configs: [csrEarnConfig],
        usersCardId: "chase_sapphire_reserve",
        benefitsCaptured: 0,
        period,
        monthCount: 12,
        portalMode: true,
      })!;

      // Direct: car_rentals earns at CSR's travel rate (4x) → 600
      expect(direct.cards[0].totalPoints).toBe(600);
      // Portal: car_rentals → travel_portal earns 8x → 1200
      expect(portal.cards[0].totalPoints).toBe(1200);
    });

    it("car_rentals shows as travel_portal category in portal mode output", () => {
      const transactions = [
        makeTx("t1", "2025-06-01", "ENTERPRISE", 200, "car_rentals"),
      ];

      const result = runSimulation({
        transactions,
        configs: [csrEarnConfig],
        usersCardId: "chase_sapphire_reserve",
        benefitsCaptured: 0,
        period,
        monthCount: 12,
        portalMode: true,
      })!;

      const portalCat = result.categoryBreakdown.find(
        (c) => c.category === "travel_portal"
      );
      expect(portalCat).toBeDefined();
      expect(portalCat!.totalSpend).toBe(200);

      // car_rentals category should not appear separately
      const carCat = result.categoryBreakdown.find(
        (c) => c.category === "car_rentals"
      );
      expect(carCat).toBeUndefined();
    });
  });

  // ── Fix #4: Bilt parallel earnings ──
  describe("Bilt parallel earnings (Fix #4)", () => {
    it("includes parallelValue for Bilt Palladium", () => {
      const transactions = [
        makeTx("t1", "2025-01-01", "CHIPOTLE", 5000, "dining"),
        makeTx("t2", "2025-02-01", "WHOLE FOODS", 5000, "groceries"),
      ];

      const result = runSimulation({
        transactions,
        configs: [biltPalladiumEarnConfig],
        usersCardId: "bilt_palladium",
        benefitsCaptured: null,
        period,
        monthCount: 12,
      })!;

      const bilt = result.cards[0];
      // $10K total spend * 4% = $400 parallel value
      expect(bilt.parallelValue).toBe(400);
    });

    it("parallelValue is included in netCeiling", () => {
      const transactions = [
        makeTx("t1", "2025-01-01", "RANDOM STORE", 10000, "other"),
      ];

      const result = runSimulation({
        transactions,
        configs: [biltPalladiumEarnConfig],
        usersCardId: "bilt_palladium",
        benefitsCaptured: null,
        period,
        monthCount: 12,
      })!;

      const bilt = result.cards[0];
      // Points: 10000 * 2 = 20000 pts * 1.5cpp = $300
      // Parallel: 10000 * 4% = $400
      // Benefits value: some amount
      // netCeiling = pointsValue + benefitsValue + parallelValue - annualFee
      const expectedCeiling = Math.round(
        (bilt.pointsValueConservative + bilt.benefitsValue + bilt.parallelValue - bilt.annualFee) * 100
      ) / 100;
      expect(bilt.netCeiling).toBe(expectedCeiling);
      expect(bilt.parallelValue).toBe(400);
    });

    it("non-Bilt cards have zero parallelValue", () => {
      const transactions = [
        makeTx("t1", "2025-01-01", "RANDOM STORE", 10000, "other"),
      ];

      const result = runSimulation({
        transactions,
        configs: [csrEarnConfig],
        usersCardId: "chase_sapphire_reserve",
        benefitsCaptured: 0,
        period,
        monthCount: 12,
      })!;

      expect(result.cards[0].parallelValue).toBe(0);
    });
  });

  // ── Fix #6: Defensive null check ──
  describe("defensive null check (Fix #6)", () => {
    it("returns null when usersCardId is not in configs", () => {
      const transactions = [
        makeTx("t1", "2025-01-01", "CHIPOTLE", 50, "dining"),
      ];

      const result = runSimulation({
        transactions,
        configs: [csrEarnConfig, cspEarnConfig],
        usersCardId: "nonexistent_card_id",
        benefitsCaptured: 0,
        period,
        monthCount: 12,
      });

      expect(result).toBeNull();
    });
  });

  // ── Fix #5: CFF rotating categories in simulation ──
  describe("CFF rotating categories in simulation (Fix #5)", () => {
    it("earns 5x on Q1 grocery with CFF", () => {
      const transactions = [
        makeTx("t1", "2025-02-15", "WHOLE FOODS", 500, "groceries"),
      ];

      const result = runSimulation({
        transactions,
        configs: [cffEarnConfig],
        usersCardId: "chase_freedom_flex",
        benefitsCaptured: null,
        period,
        monthCount: 12,
      })!;

      const cff = result.cards[0];
      // 500 * 5 = 2500 (Q1 rotating grocery)
      expect(cff.totalPoints).toBe(2500);
    });

    it("CFF beats CFU on Q1 groceries due to 5% rotating", () => {
      const transactions = [
        makeTx("t1", "2025-01-15", "WHOLE FOODS", 1000, "groceries"),
      ];

      const result = runSimulation({
        transactions,
        configs: [cffEarnConfig, csrEarnConfig],
        usersCardId: "chase_freedom_flex",
        benefitsCaptured: null,
        period,
        monthCount: 12,
      })!;

      const cff = result.cards.find((c) => c.cardId === "chase_freedom_flex");
      const csr = result.cards.find((c) => c.cardId === "chase_sapphire_reserve");

      // CFF: 1000 * 5 = 5000 pts * 1.0cpp = $50
      // CSR: 1000 * 1 = 1000 pts * 1.25cpp = $12.50
      expect(cff!.totalPoints).toBe(5000);
      expect(csr!.totalPoints).toBe(1000);
    });
  });

  // ── totalCards field ──
  describe("totalCards field", () => {
    it("includes totalCards in output", () => {
      const transactions = [
        makeTx("t1", "2025-01-01", "CHIPOTLE", 50, "dining"),
      ];

      const result = runSimulation({
        transactions,
        configs: [csrEarnConfig, cspEarnConfig, amexGoldEarnConfig],
        usersCardId: "chase_sapphire_reserve",
        benefitsCaptured: 0,
        period,
        monthCount: 12,
      })!;

      expect(result.totalCards).toBe(3);
    });
  });
});
