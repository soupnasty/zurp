import { describe, it, expect } from "vitest";
import { calculatePointsForTransaction } from "../calculator";
import { csrEarnConfig } from "../earn-configs/chase-sapphire-reserve";
import { cspEarnConfig } from "../earn-configs/chase-sapphire-preferred";
import { amexGoldEarnConfig } from "../earn-configs/amex-gold";
import type { CapState } from "../types";

describe("calculatePointsForTransaction", () => {
  describe("CSR earn rates", () => {
    it("earns 3x on dining", () => {
      const capState: CapState = {};
      const result = calculatePointsForTransaction(
        {
          id: "tx1",
          merchantName: "CHIPOTLE MEXICAN GRILL",
          amount: 15,
          category: "dining",
          confidence: "high",
        },
        csrEarnConfig,
        capState
      );
      expect(result.earnRate).toBe(3);
      expect(result.points).toBe(45);
      expect(result.bonusLabel).toBe("Dining");
    });

    it("earns 5x on Lyft rideshare", () => {
      const capState: CapState = {};
      const result = calculatePointsForTransaction(
        {
          id: "tx2",
          merchantName: "LYFT *RIDE",
          amount: 25,
          category: "rideshare",
          confidence: "high",
        },
        csrEarnConfig,
        capState
      );
      expect(result.earnRate).toBe(5);
      expect(result.points).toBe(125);
    });

    it("earns 1x on Uber (non-Lyft) rideshare", () => {
      const capState: CapState = {};
      const result = calculatePointsForTransaction(
        {
          id: "tx3",
          merchantName: "UBER* TRIP",
          amount: 30,
          category: "rideshare",
          confidence: "high",
        },
        csrEarnConfig,
        capState
      );
      expect(result.earnRate).toBe(1);
      expect(result.points).toBe(30);
    });

    it("earns 10x on Peloton equipment (>= $200)", () => {
      const capState: CapState = {};
      const result = calculatePointsForTransaction(
        {
          id: "tx4",
          merchantName: "PELOTON INTERACTIVE",
          amount: 1495,
          category: "fitness",
          confidence: "high",
        },
        csrEarnConfig,
        capState
      );
      expect(result.earnRate).toBe(10);
      expect(result.points).toBe(14950);
    });

    it("earns 1x on Peloton subscription (< $200)", () => {
      const capState: CapState = {};
      const result = calculatePointsForTransaction(
        {
          id: "tx5",
          merchantName: "PELOTON INTERACTIVE",
          amount: 44,
          category: "fitness",
          confidence: "high",
        },
        csrEarnConfig,
        capState
      );
      expect(result.earnRate).toBe(1);
      expect(result.points).toBe(44);
    });

    it("earns 1x base rate on uncategorized spending", () => {
      const capState: CapState = {};
      const result = calculatePointsForTransaction(
        {
          id: "tx6",
          merchantName: "RANDOM STORE",
          amount: 100,
          category: "other",
          confidence: "low",
        },
        csrEarnConfig,
        capState
      );
      expect(result.earnRate).toBe(1);
      expect(result.points).toBe(100);
    });

    it("earns 4x on direct travel", () => {
      const capState: CapState = {};
      const result = calculatePointsForTransaction(
        {
          id: "tx7",
          merchantName: "UNITED AIRLINES",
          amount: 500,
          category: "travel_flights",
          confidence: "high",
        },
        csrEarnConfig,
        capState
      );
      expect(result.earnRate).toBe(4);
      expect(result.points).toBe(2000);
    });
  });

  describe("Amex Gold grocery cap ($25K)", () => {
    it("earns 4x within cap", () => {
      const capState: CapState = {};
      const result = calculatePointsForTransaction(
        {
          id: "tx1",
          merchantName: "WHOLE FOODS",
          amount: 150,
          category: "grocery",
          confidence: "high",
        },
        amexGoldEarnConfig,
        capState
      );
      expect(result.earnRate).toBe(4);
      expect(result.points).toBe(600);
      expect(result.capApplied).toBe(false);
    });

    it("splits transaction at cap boundary", () => {
      const capState: CapState = {
        gold_grocery_25k: { spendToDate: 24900, maxSpend: 25000 },
      };
      const result = calculatePointsForTransaction(
        {
          id: "tx2",
          merchantName: "WHOLE FOODS",
          amount: 200,
          category: "grocery",
          confidence: "high",
        },
        amexGoldEarnConfig,
        capState
      );
      // $100 at 4x (400) + $100 at 1x (100) = 500
      expect(result.points).toBe(500);
      expect(result.capApplied).toBe(true);
      expect(capState.gold_grocery_25k.spendToDate).toBe(25000);
    });

    it("earns 1x when cap is already exceeded", () => {
      const capState: CapState = {
        gold_grocery_25k: { spendToDate: 25000, maxSpend: 25000 },
      };
      const result = calculatePointsForTransaction(
        {
          id: "tx3",
          merchantName: "WHOLE FOODS",
          amount: 100,
          category: "grocery",
          confidence: "high",
        },
        amexGoldEarnConfig,
        capState
      );
      expect(result.earnRate).toBe(1);
      expect(result.points).toBe(100);
      expect(result.capApplied).toBe(true);
    });
  });

  describe("Refund handling", () => {
    it("subtracts points for refunds", () => {
      const capState: CapState = {};
      const result = calculatePointsForTransaction(
        {
          id: "tx_refund",
          merchantName: "CHIPOTLE",
          amount: -15, // negative = refund
          category: "dining",
          confidence: "high",
        },
        csrEarnConfig,
        capState
      );
      expect(result.points).toBe(-45);
    });
  });

  describe("CSP earn rates", () => {
    it("earns 3x on streaming", () => {
      const capState: CapState = {};
      const result = calculatePointsForTransaction(
        {
          id: "tx_stream",
          merchantName: "NETFLIX",
          amount: 15.99,
          category: "streaming",
          confidence: "high",
        },
        cspEarnConfig,
        capState
      );
      expect(result.earnRate).toBe(3);
      expect(result.points).toBe(48); // 15.99 * 3 rounded
    });

    it("earns 3x on online grocery", () => {
      const capState: CapState = {};
      const result = calculatePointsForTransaction(
        {
          id: "tx_og",
          merchantName: "INSTACART",
          amount: 85,
          category: "grocery_online",
          confidence: "high",
        },
        cspEarnConfig,
        capState
      );
      expect(result.earnRate).toBe(3);
      expect(result.points).toBe(255);
    });

    it("earns 5x on Peloton equipment", () => {
      const capState: CapState = {};
      const result = calculatePointsForTransaction(
        {
          id: "tx_pel",
          merchantName: "PELOTON INTERACTIVE",
          amount: 1495,
          category: "fitness",
          confidence: "high",
        },
        cspEarnConfig,
        capState
      );
      expect(result.earnRate).toBe(5);
      expect(result.points).toBe(7475);
    });
  });
});
