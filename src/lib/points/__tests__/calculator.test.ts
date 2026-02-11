import { describe, it, expect } from "vitest";
import { calculatePointsForTransaction, getDatePartsInTimezone, matchesTimeWindow } from "../calculator";
import { csrEarnConfig } from "../earn-configs/chase-sapphire-reserve";
import { cspEarnConfig } from "../earn-configs/chase-sapphire-preferred";
import { amexGoldEarnConfig } from "../earn-configs/amex-gold";
import { citiStrataEliteEarnConfig } from "../earn-configs/citi-strata-elite";
import type { CapState, TimeWindow } from "../types";

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

  describe("Citi Nights time-window", () => {
    // Friday Jan 3, 2025 at 8PM ET = 2025-01-04 01:00:00 UTC
    it("earns 6x dining on Friday 8PM ET with datetime", () => {
      const capState: CapState = {};
      const fridayNight = new Date("2025-01-04T01:00:00Z");
      const result = calculatePointsForTransaction(
        {
          id: "tw1",
          merchantName: "CHIPOTLE",
          amount: 50,
          category: "dining",
          confidence: "high",
          date: new Date("2025-01-03"),
          datetime: fridayNight,
        },
        citiStrataEliteEarnConfig,
        capState
      );
      expect(result.earnRate).toBe(6);
      expect(result.points).toBe(300);
      expect(result.bonusLabel).toContain("Citi Nights");
    });

    it("earns 3x dining on Friday 2PM ET (outside window)", () => {
      const capState: CapState = {};
      // Friday Jan 3, 2025 at 2PM ET = 2025-01-03 19:00:00 UTC
      const fridayAfternoon = new Date("2025-01-03T19:00:00Z");
      const result = calculatePointsForTransaction(
        {
          id: "tw2",
          merchantName: "CHIPOTLE",
          amount: 50,
          category: "dining",
          confidence: "high",
          date: new Date("2025-01-03"),
          datetime: fridayAfternoon,
        },
        citiStrataEliteEarnConfig,
        capState
      );
      expect(result.earnRate).toBe(3);
      expect(result.points).toBe(150);
      expect(result.bonusLabel).toBe("Dining");
    });

    it("earns 6x dining on Saturday 1AM ET (overnight portion)", () => {
      const capState: CapState = {};
      // Saturday Jan 4, 2025 at 1AM ET = 2025-01-04 06:00:00 UTC
      const saturdayEarlyMorning = new Date("2025-01-04T06:00:00Z");
      const result = calculatePointsForTransaction(
        {
          id: "tw3",
          merchantName: "CHIPOTLE",
          amount: 50,
          category: "dining",
          confidence: "high",
          date: new Date("2025-01-04"),
          datetime: saturdayEarlyMorning,
        },
        citiStrataEliteEarnConfig,
        capState
      );
      expect(result.earnRate).toBe(6);
      expect(result.points).toBe(300);
    });

    it("earns 3x dining on Wednesday 8PM ET", () => {
      const capState: CapState = {};
      // Wednesday Jan 1, 2025 at 8PM ET = 2025-01-02 01:00:00 UTC
      const wedNight = new Date("2025-01-02T01:00:00Z");
      const result = calculatePointsForTransaction(
        {
          id: "tw4",
          merchantName: "CHIPOTLE",
          amount: 50,
          category: "dining",
          confidence: "high",
          date: new Date("2025-01-01"),
          datetime: wedNight,
        },
        citiStrataEliteEarnConfig,
        capState
      );
      expect(result.earnRate).toBe(3);
      expect(result.points).toBe(150);
    });

    it("earns 6x dining on Friday with only date (day-of-week fallback)", () => {
      const capState: CapState = {};
      // Friday Jan 3, 2025 — no datetime, day-of-week fallback
      const result = calculatePointsForTransaction(
        {
          id: "tw5",
          merchantName: "CHIPOTLE",
          amount: 50,
          category: "dining",
          confidence: "high",
          date: new Date("2025-01-03"),
          datetime: null,
        },
        citiStrataEliteEarnConfig,
        capState
      );
      // Friday is in the time_window days, so fallback matches
      expect(result.earnRate).toBe(6);
      expect(result.points).toBe(300);
    });

    it("skips time-window check when no date or datetime (backward compat)", () => {
      const capState: CapState = {};
      const result = calculatePointsForTransaction(
        {
          id: "tw6",
          merchantName: "CHIPOTLE",
          amount: 50,
          category: "dining",
          confidence: "high",
          // no date, no datetime
        },
        citiStrataEliteEarnConfig,
        capState
      );
      // With no date info, time_window check is skipped, first match (6x) wins
      expect(result.earnRate).toBe(6);
      expect(result.points).toBe(300);
    });
  });
});

describe("getDatePartsInTimezone", () => {
  it("converts UTC to Eastern time correctly", () => {
    // 2025-01-04 01:00:00 UTC = 2025-01-03 20:00:00 ET (Friday 8PM)
    const date = new Date("2025-01-04T01:00:00Z");
    const { dayOfWeek, hour } = getDatePartsInTimezone(date, "America/New_York");
    expect(dayOfWeek).toBe(5); // Friday
    expect(hour).toBe(20); // 8PM
  });

  it("handles midnight correctly", () => {
    // 2025-01-04 05:00:00 UTC = 2025-01-04 00:00:00 ET (Saturday midnight)
    const date = new Date("2025-01-04T05:00:00Z");
    const { dayOfWeek, hour } = getDatePartsInTimezone(date, "America/New_York");
    expect(dayOfWeek).toBe(6); // Saturday
    expect(hour).toBe(0); // midnight
  });
});

describe("matchesTimeWindow", () => {
  const citiNights: TimeWindow = {
    timezone: "America/New_York",
    days: [5, 6], // Fri, Sat
    startHour: 18,
    endHour: 6,
  };

  it("matches Friday 8PM", () => {
    expect(matchesTimeWindow(5, 20, citiNights)).toBe(true);
  });

  it("matches Friday 6PM (start boundary)", () => {
    expect(matchesTimeWindow(5, 18, citiNights)).toBe(true);
  });

  it("matches Saturday 1AM (overnight from Friday)", () => {
    expect(matchesTimeWindow(6, 1, citiNights)).toBe(true);
  });

  it("matches Saturday 10PM", () => {
    expect(matchesTimeWindow(6, 22, citiNights)).toBe(true);
  });

  it("matches Sunday 3AM (overnight from Saturday)", () => {
    expect(matchesTimeWindow(0, 3, citiNights)).toBe(true);
  });

  it("does not match Friday 2PM", () => {
    expect(matchesTimeWindow(5, 14, citiNights)).toBe(false);
  });

  it("does not match Wednesday 8PM", () => {
    expect(matchesTimeWindow(3, 20, citiNights)).toBe(false);
  });

  it("does not match Saturday 6AM (exclusive end boundary)", () => {
    expect(matchesTimeWindow(6, 6, citiNights)).toBe(false);
  });

  it("does not match Monday 1AM (not adjacent to window)", () => {
    expect(matchesTimeWindow(1, 1, citiNights)).toBe(false);
  });
});
