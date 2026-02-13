import { describe, it, expect } from "vitest";
import { calculatePointsForTransaction, getDatePartsInTimezone, matchesTimeWindow } from "../calculator";
import { csrEarnConfig } from "../earn-configs/chase-sapphire-reserve";
import { cspEarnConfig } from "../earn-configs/chase-sapphire-preferred";
import { cffEarnConfig } from "../earn-configs/chase-freedom-flex";
import { amexGoldEarnConfig } from "../earn-configs/amex-gold";
import { amexBcpEarnConfig } from "../earn-configs/amex-blue-cash-preferred";
import { citiStrataEliteEarnConfig } from "../earn-configs/citi-strata-elite";
import { ventureXEarnConfig } from "../earn-configs/capital-one-venture-x";
import { robinhoodGoldEarnConfig } from "../earn-configs/robinhood-gold";
import { amexBceEarnConfig } from "../earn-configs/amex-blue-cash-everyday";
import { usBankAltitudeConnectEarnConfig } from "../earn-configs/us-bank-altitude-connect";
import { wellsFargoAutographJourneyEarnConfig } from "../earn-configs/wells-fargo-autograph-journey";
import { wellsFargoActiveCashEarnConfig } from "../earn-configs/wells-fargo-active-cash";
import { citiDoubleCashEarnConfig } from "../earn-configs/citi-double-cash";
import { citiCustomCashEarnConfig } from "../earn-configs/citi-custom-cash";
import { discoverItCashBackEarnConfig } from "../earn-configs/discover-it-cash-back";
import { amexBusinessPlatinumEarnConfig } from "../earn-configs/amex-business-platinum";
import { appleCardEarnConfig } from "../earn-configs/apple-card";
import { capitalOneSavorEarnConfig } from "../earn-configs/capital-one-savor";
import { deltaPlatinumEarnConfig } from "../earn-configs/delta-platinum";
import { hiltonAspireEarnConfig } from "../earn-configs/hilton-aspire";
import { ihgPremierEarnConfig } from "../earn-configs/ihg-premier";
import { inkBusinessPreferredEarnConfig } from "../earn-configs/ink-business-preferred";
import { southwestPriorityEarnConfig } from "../earn-configs/southwest-priority";
import { unitedExplorerEarnConfig } from "../earn-configs/united-explorer";
import { worldOfHyattEarnConfig } from "../earn-configs/world-of-hyatt";
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
          category: "groceries",
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
          category: "groceries",
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
          category: "groceries",
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
      // Use local-midnight constructor to match DB behavior (neon-http returns
      // dates where getDay() gives the correct calendar day-of-week).
      const result = calculatePointsForTransaction(
        {
          id: "tw5",
          merchantName: "CHIPOTLE",
          amount: 50,
          category: "dining",
          confidence: "high",
          date: new Date(2025, 0, 3),
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

  describe("Venture X earn rates", () => {
    it("earns 2x on dining (base rate)", () => {
      const capState: CapState = {};
      const result = calculatePointsForTransaction(
        {
          id: "vx1",
          merchantName: "CHIPOTLE",
          amount: 15,
          category: "dining",
          confidence: "high",
        },
        ventureXEarnConfig,
        capState
      );
      expect(result.earnRate).toBe(2);
      expect(result.points).toBe(30);
    });

    it("earns 2x on groceries (base rate)", () => {
      const capState: CapState = {};
      const result = calculatePointsForTransaction(
        {
          id: "vx2",
          merchantName: "WHOLE FOODS",
          amount: 200,
          category: "groceries",
          confidence: "high",
        },
        ventureXEarnConfig,
        capState
      );
      expect(result.earnRate).toBe(2);
      expect(result.points).toBe(400);
    });

    it("earns 2x on everything else (base rate)", () => {
      const capState: CapState = {};
      const result = calculatePointsForTransaction(
        {
          id: "vx3",
          merchantName: "RANDOM STORE",
          amount: 100,
          category: "other",
          confidence: "low",
        },
        ventureXEarnConfig,
        capState
      );
      expect(result.earnRate).toBe(2);
      expect(result.points).toBe(200);
    });

    it("earns 10x on portal hotels", () => {
      const capState: CapState = {};
      const result = calculatePointsForTransaction(
        {
          id: "vx4",
          merchantName: "MARRIOTT",
          amount: 500,
          category: "travel_portal",
          confidence: "high",
        },
        ventureXEarnConfig,
        capState
      );
      expect(result.earnRate).toBe(10);
      expect(result.points).toBe(5000);
      expect(result.bonusLabel).toBe("Capital One Travel hotels & rentals");
    });

    it("earns 5x on portal flights (airline merchant match)", () => {
      const capState: CapState = {};
      const result = calculatePointsForTransaction(
        {
          id: "vx5",
          merchantName: "UNITED AIRLINES",
          amount: 300,
          category: "travel_portal",
          confidence: "high",
        },
        ventureXEarnConfig,
        capState
      );
      expect(result.earnRate).toBe(5);
      expect(result.points).toBe(1500);
      expect(result.bonusLabel).toBe("Capital One Travel flights");
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

// ── Fix #1: Calendar year cap reset ──
describe("calendar year cap reset", () => {
  it("resets Amex Gold grocery cap at year boundary", () => {
    const capState: CapState = {};

    // Spend $15K in 2024 (within $25K cap)
    const result2024 = calculatePointsForTransaction(
      {
        id: "yr1",
        merchantName: "WHOLE FOODS",
        amount: 15000,
        category: "groceries",
        confidence: "high",
        date: new Date("2024-06-15"),
      },
      amexGoldEarnConfig,
      capState
    );
    expect(result2024.earnRate).toBe(4);
    expect(result2024.points).toBe(60000);
    expect(result2024.capApplied).toBe(false);
    expect(capState.gold_grocery_25k.spendToDate).toBe(15000);

    // Spend $15K in 2025 — should reset cap, still earn 4x
    const result2025 = calculatePointsForTransaction(
      {
        id: "yr2",
        merchantName: "WHOLE FOODS",
        amount: 15000,
        category: "groceries",
        confidence: "high",
        date: new Date("2025-02-01"),
      },
      amexGoldEarnConfig,
      capState
    );
    expect(result2025.earnRate).toBe(4);
    expect(result2025.points).toBe(60000);
    expect(result2025.capApplied).toBe(false);
    // Cap should be tracking 2025 now
    expect(capState.gold_grocery_25k.spendToDate).toBe(15000);
    expect(capState.gold_grocery_25k.currentYear).toBe(2025);
  });

  it("resets BCP grocery cap at year boundary", () => {
    const capState: CapState = {};

    // Spend $5K in 2024 (within $6K cap)
    calculatePointsForTransaction(
      {
        id: "bcp1",
        merchantName: "TRADER JOES",
        amount: 5000,
        category: "groceries",
        confidence: "high",
        date: new Date("2024-11-01"),
      },
      amexBcpEarnConfig,
      capState
    );
    expect(capState.bcp_grocery_6k.spendToDate).toBe(5000);

    // Spend $5K in 2025 — cap resets, should still earn 6x
    const result = calculatePointsForTransaction(
      {
        id: "bcp2",
        merchantName: "TRADER JOES",
        amount: 5000,
        category: "groceries",
        confidence: "high",
        date: new Date("2025-01-15"),
      },
      amexBcpEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(6);
    expect(result.points).toBe(30000);
    expect(result.capApplied).toBe(false);
    expect(capState.bcp_grocery_6k.currentYear).toBe(2025);
  });

  it("resets Robinhood portal cap at year boundary", () => {
    const capState: CapState = {};

    // Hit the $3,500 cap in 2024
    calculatePointsForTransaction(
      {
        id: "rh1",
        merchantName: "MARRIOTT",
        amount: 3500,
        category: "travel_portal",
        confidence: "high",
        date: new Date("2024-09-01"),
      },
      robinhoodGoldEarnConfig,
      capState
    );
    expect(capState.rh_travel_portal_3500.spendToDate).toBe(3500);

    // Over-cap in 2024
    const overCap = calculatePointsForTransaction(
      {
        id: "rh2",
        merchantName: "HILTON",
        amount: 500,
        category: "travel_portal",
        confidence: "high",
        date: new Date("2024-10-01"),
      },
      robinhoodGoldEarnConfig,
      capState
    );
    expect(overCap.earnRate).toBe(3); // Falls to base rate
    expect(overCap.capApplied).toBe(true);

    // 2025: cap resets, back to 5x
    const fresh = calculatePointsForTransaction(
      {
        id: "rh3",
        merchantName: "MARRIOTT",
        amount: 1000,
        category: "travel_portal",
        confidence: "high",
        date: new Date("2025-01-15"),
      },
      robinhoodGoldEarnConfig,
      capState
    );
    expect(fresh.earnRate).toBe(5);
    expect(fresh.points).toBe(5000);
    expect(fresh.capApplied).toBe(false);
    expect(capState.rh_travel_portal_3500.currentYear).toBe(2025);
  });
});

// ── Fix #5: CFF rotating quarterly categories ──
describe("CFF rotating quarterly categories", () => {
  it("earns 5x on Q1 grocery (rotating match)", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "cff_q1",
        merchantName: "WHOLE FOODS",
        amount: 100,
        category: "groceries",
        confidence: "high",
        date: new Date("2025-02-15"),
      },
      cffEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(5);
    expect(result.points).toBe(500);
    expect(result.bonusLabel).toContain("Rotating");
  });

  it("earns 1x on Q2 grocery (no rotating match, not in permanent bonus)", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "cff_q2_groc",
        merchantName: "WHOLE FOODS",
        amount: 100,
        category: "groceries",
        confidence: "high",
        date: new Date("2025-05-15"),
      },
      cffEarnConfig,
      capState
    );
    // Grocery is not in CFF's permanent bonus categories — only in Q1 rotating
    expect(result.earnRate).toBe(1);
    expect(result.points).toBe(100);
  });

  it("earns 5x on Q3 dining (rotating beats permanent 3x)", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "cff_q3_dine",
        merchantName: "CHIPOTLE",
        amount: 50,
        category: "dining",
        confidence: "high",
        date: new Date("2025-08-15"),
      },
      cffEarnConfig,
      capState
    );
    // Q3 has dining as rotating → 5x (first-match-wins over permanent 3x)
    expect(result.earnRate).toBe(5);
    expect(result.points).toBe(250);
  });

  it("earns 3x on non-Q3 dining (permanent bonus)", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "cff_dine_perm",
        merchantName: "CHIPOTLE",
        amount: 50,
        category: "dining",
        confidence: "high",
        date: new Date("2025-02-15"),
      },
      cffEarnConfig,
      capState
    );
    // Q1 rotating is groceries not dining, so falls through to permanent 3x dining
    expect(result.earnRate).toBe(3);
    expect(result.points).toBe(150);
  });

  it("caps Q1 rotating at $1,500 spend", () => {
    const capState: CapState = {};

    // First $1,500 at 5x
    const first = calculatePointsForTransaction(
      {
        id: "cff_cap1",
        merchantName: "WHOLE FOODS",
        amount: 1500,
        category: "groceries",
        confidence: "high",
        date: new Date("2025-01-10"),
      },
      cffEarnConfig,
      capState
    );
    expect(first.earnRate).toBe(5);
    expect(first.points).toBe(7500);
    expect(first.capApplied).toBe(false);

    // Next $100 — cap hit, falls to 1x base
    const over = calculatePointsForTransaction(
      {
        id: "cff_cap2",
        merchantName: "WHOLE FOODS",
        amount: 100,
        category: "groceries",
        confidence: "high",
        date: new Date("2025-02-01"),
      },
      cffEarnConfig,
      capState
    );
    expect(over.earnRate).toBe(1);
    expect(over.points).toBe(100);
    expect(over.capApplied).toBe(true);
  });

  it("splits transaction at Q1 cap boundary", () => {
    const capState: CapState = {};

    // $1,600 grocery in Q1: first $1,500 at 5x, last $100 at 1x
    const result = calculatePointsForTransaction(
      {
        id: "cff_split",
        merchantName: "COSTCO",
        amount: 1600,
        category: "groceries",
        confidence: "high",
        date: new Date("2025-03-01"),
      },
      cffEarnConfig,
      capState
    );
    // $1,500 * 5 = 7,500 + $100 * 1 = 100 = 7,600
    expect(result.points).toBe(7600);
    expect(result.capApplied).toBe(true);
  });

  it("tracks Q1 and Q2 caps independently", () => {
    const capState: CapState = {};

    // Max out Q1 grocery cap
    calculatePointsForTransaction(
      {
        id: "cff_ind1",
        merchantName: "WHOLE FOODS",
        amount: 1500,
        category: "groceries",
        confidence: "high",
        date: new Date("2025-02-01"),
      },
      cffEarnConfig,
      capState
    );

    // Q2 gas station — should have fresh $1,500 cap
    const q2 = calculatePointsForTransaction(
      {
        id: "cff_ind2",
        merchantName: "SHELL",
        amount: 200,
        category: "gas_stations",
        confidence: "high",
        date: new Date("2025-05-01"),
      },
      cffEarnConfig,
      capState
    );
    expect(q2.earnRate).toBe(5);
    expect(q2.points).toBe(1000);
    expect(q2.capApplied).toBe(false);
  });
});

// ── Amex Blue Cash Everyday (Tier 2) ──
describe("Amex Blue Cash Everyday earn rates", () => {
  it("earns 3x on groceries", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "bce1",
        merchantName: "WHOLE FOODS",
        amount: 100,
        category: "groceries",
        confidence: "high",
      },
      amexBceEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(3);
    expect(result.points).toBe(300);
    expect(result.bonusLabel).toBe("US supermarkets");
  });

  it("earns 3x on gas stations", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "bce2",
        merchantName: "SHELL",
        amount: 50,
        category: "gas_stations",
        confidence: "high",
      },
      amexBceEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(3);
    expect(result.points).toBe(150);
    expect(result.bonusLabel).toBe("US gas stations");
  });

  it("earns 3x on online retail", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "bce3",
        merchantName: "AMAZON",
        amount: 75,
        category: "shopping_online",
        confidence: "high",
      },
      amexBceEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(3);
    expect(result.points).toBe(225);
    expect(result.bonusLabel).toBe("US online retail");
  });

  it("earns 1x on dining (non-bonus category)", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "bce4",
        merchantName: "CHIPOTLE",
        amount: 15,
        category: "dining",
        confidence: "high",
      },
      amexBceEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(1);
    expect(result.points).toBe(15);
    expect(result.bonusLabel).toBeNull();
  });

  it("enforces $6K grocery cap", () => {
    const capState: CapState = {
      bce_grocery_6k: { spendToDate: 5900, maxSpend: 6000 },
    };
    const result = calculatePointsForTransaction(
      {
        id: "bce5",
        merchantName: "WHOLE FOODS",
        amount: 200,
        category: "groceries",
        confidence: "high",
      },
      amexBceEarnConfig,
      capState
    );
    // $100 at 3x (300) + $100 at 1x (100) = 400
    expect(result.points).toBe(400);
    expect(result.capApplied).toBe(true);
  });

  it("enforces $6K gas cap", () => {
    const capState: CapState = {
      bce_gas_6k: { spendToDate: 6000, maxSpend: 6000 },
    };
    const result = calculatePointsForTransaction(
      {
        id: "bce6",
        merchantName: "SHELL",
        amount: 100,
        category: "gas_stations",
        confidence: "high",
      },
      amexBceEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(1);
    expect(result.points).toBe(100);
    expect(result.capApplied).toBe(true);
  });

  it("enforces $6K online retail cap", () => {
    const capState: CapState = {
      bce_online_retail_6k: { spendToDate: 5500, maxSpend: 6000 },
    };
    const result = calculatePointsForTransaction(
      {
        id: "bce7",
        merchantName: "AMAZON",
        amount: 600,
        category: "shopping_online",
        confidence: "high",
      },
      amexBceEarnConfig,
      capState
    );
    // $500 at 3x (1500) + $100 at 1x (100) = 1600
    expect(result.points).toBe(1600);
    expect(result.capApplied).toBe(true);
  });
});

// ── US Bank Altitude Connect (Tier 2) ──
describe("US Bank Altitude Connect earn rates", () => {
  it("earns 5x on travel portal", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "usbc1",
        merchantName: "MARRIOTT",
        amount: 300,
        category: "travel_portal",
        confidence: "high",
      },
      usBankAltitudeConnectEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(5);
    expect(result.points).toBe(1500);
    expect(result.bonusLabel).toBe("US Bank Rewards Center prepaid hotels & cars");
  });

  it("earns 4x on travel flights", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "usbc2",
        merchantName: "UNITED AIRLINES",
        amount: 250,
        category: "travel_flights",
        confidence: "high",
      },
      usBankAltitudeConnectEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(4);
    expect(result.points).toBe(1000);
    expect(result.bonusLabel).toBe("Travel");
  });

  it("earns 4x on travel hotels (direct)", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "usbc3",
        merchantName: "HYATT",
        amount: 400,
        category: "travel_hotels",
        confidence: "high",
      },
      usBankAltitudeConnectEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(4);
    expect(result.points).toBe(1600);
  });

  it("earns 4x on gas stations", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "usbc4",
        merchantName: "CHEVRON",
        amount: 50,
        category: "gas_stations",
        confidence: "high",
      },
      usBankAltitudeConnectEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(4);
    expect(result.points).toBe(200);
  });

  it("earns 2x on dining", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "usbc5",
        merchantName: "CHIPOTLE",
        amount: 20,
        category: "dining",
        confidence: "high",
      },
      usBankAltitudeConnectEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(2);
    expect(result.points).toBe(40);
  });

  it("earns 2x on groceries", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "usbc6",
        merchantName: "KROGER",
        amount: 80,
        category: "groceries",
        confidence: "high",
      },
      usBankAltitudeConnectEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(2);
    expect(result.points).toBe(160);
    expect(result.bonusLabel).toBe("Dining, groceries & streaming");
  });

  it("earns 2x on streaming", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "usbc7",
        merchantName: "NETFLIX",
        amount: 15,
        category: "streaming",
        confidence: "high",
      },
      usBankAltitudeConnectEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(2);
    expect(result.points).toBe(30);
  });

  it("earns 1x base rate on other categories", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "usbc8",
        merchantName: "RANDOM STORE",
        amount: 100,
        category: "other",
        confidence: "low",
      },
      usBankAltitudeConnectEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(1);
    expect(result.points).toBe(100);
  });

  it("enforces $4K gas cap", () => {
    const capState: CapState = {
      usb_gas_4k: { spendToDate: 3900, maxSpend: 4000 },
    };
    const result = calculatePointsForTransaction(
      {
        id: "usbc9",
        merchantName: "SHELL",
        amount: 200,
        category: "gas_stations",
        confidence: "high",
      },
      usBankAltitudeConnectEarnConfig,
      capState
    );
    // $100 at 4x (400) + $100 at 1x (100) = 500
    expect(result.points).toBe(500);
    expect(result.capApplied).toBe(true);
  });
});

// ── Wells Fargo Autograph Journey (Tier 2) ──
describe("Wells Fargo Autograph Journey earn rates", () => {
  it("earns 5x on hotels", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "wfaj1",
        merchantName: "MARRIOTT",
        amount: 200,
        category: "travel_hotels",
        confidence: "high",
      },
      wellsFargoAutographJourneyEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(5);
    expect(result.points).toBe(1000);
    expect(result.bonusLabel).toBe("Hotels");
  });

  it("earns 4x on flights", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "wfaj2",
        merchantName: "DELTA",
        amount: 300,
        category: "travel_flights",
        confidence: "high",
      },
      wellsFargoAutographJourneyEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(4);
    expect(result.points).toBe(1200);
    expect(result.bonusLabel).toBe("Airlines");
  });

  it("earns 4x on rental cars", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "wfaj3",
        merchantName: "HERTZ",
        amount: 150,
        category: "car_rentals",
        confidence: "high",
      },
      wellsFargoAutographJourneyEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(4);
    expect(result.points).toBe(600);
    expect(result.bonusLabel).toBe("Rental cars");
  });

  it("earns 4x on dining", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "wfaj4",
        merchantName: "NOBU",
        amount: 80,
        category: "dining",
        confidence: "high",
      },
      wellsFargoAutographJourneyEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(4);
    expect(result.points).toBe(320);
    expect(result.bonusLabel).toBe("Dining");
  });

  it("earns 3x on gas stations", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "wfaj5",
        merchantName: "CHEVRON",
        amount: 60,
        category: "gas_stations",
        confidence: "high",
      },
      wellsFargoAutographJourneyEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(3);
    expect(result.points).toBe(180);
  });

  it("earns 3x on streaming", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "wfaj6",
        merchantName: "HBO MAX",
        amount: 15.99,
        category: "streaming",
        confidence: "high",
      },
      wellsFargoAutographJourneyEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(3);
    expect(result.points).toBe(48);
  });

  it("earns 3x on phone services", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "wfaj7",
        merchantName: "VERIZON WIRELESS",
        amount: 75,
        category: "phone_services",
        confidence: "high",
      },
      wellsFargoAutographJourneyEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(3);
    expect(result.points).toBe(225);
    expect(result.bonusLabel).toContain("phone");
  });

  it("earns 1x base rate on other categories", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "wfaj8",
        merchantName: "RANDOM STORE",
        amount: 100,
        category: "other",
        confidence: "low",
      },
      wellsFargoAutographJourneyEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(1);
    expect(result.points).toBe(100);
  });
});

// ── Wells Fargo Active Cash (Tier 2) ──
describe("Wells Fargo Active Cash earn rates", () => {
  it("earns 2x on all categories (dining)", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "wfac1",
        merchantName: "CHIPOTLE",
        amount: 15,
        category: "dining",
        confidence: "high",
      },
      wellsFargoActiveCashEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(2);
    expect(result.points).toBe(30);
    expect(result.bonusLabel).toBeNull();
  });

  it("earns 2x on all categories (groceries)", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "wfac2",
        merchantName: "WHOLE FOODS",
        amount: 100,
        category: "groceries",
        confidence: "high",
      },
      wellsFargoActiveCashEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(2);
    expect(result.points).toBe(200);
  });

  it("earns 2x on all categories (travel)", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "wfac3",
        merchantName: "MARRIOTT",
        amount: 500,
        category: "travel_hotels",
        confidence: "high",
      },
      wellsFargoActiveCashEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(2);
    expect(result.points).toBe(1000);
  });

  it("earns 2x on other categories", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "wfac4",
        merchantName: "RANDOM STORE",
        amount: 75,
        category: "other",
        confidence: "low",
      },
      wellsFargoActiveCashEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(2);
    expect(result.points).toBe(150);
  });
});

// ── Citi Double Cash (Tier 2) ──
describe("Citi Double Cash earn rates", () => {
  it("earns 2x on all categories (dining)", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "cdc1",
        merchantName: "CHIPOTLE",
        amount: 20,
        category: "dining",
        confidence: "high",
      },
      citiDoubleCashEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(2);
    expect(result.points).toBe(40);
    expect(result.bonusLabel).toBeNull();
  });

  it("earns 2x on all categories (groceries)", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "cdc2",
        merchantName: "KROGER",
        amount: 150,
        category: "groceries",
        confidence: "high",
      },
      citiDoubleCashEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(2);
    expect(result.points).toBe(300);
  });

  it("earns 2x on all categories (travel)", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "cdc3",
        merchantName: "UNITED AIRLINES",
        amount: 400,
        category: "travel_flights",
        confidence: "high",
      },
      citiDoubleCashEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(2);
    expect(result.points).toBe(800);
  });

  it("earns 2x on other categories", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "cdc4",
        merchantName: "RANDOM STORE",
        amount: 50,
        category: "other",
        confidence: "low",
      },
      citiDoubleCashEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(2);
    expect(result.points).toBe(100);
  });
});

// ── Citi Custom Cash (Tier 2) ──
describe("Citi Custom Cash earn rates", () => {
  it("earns 1x on all categories (dining)", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "ccc1",
        merchantName: "CHIPOTLE",
        amount: 30,
        category: "dining",
        confidence: "high",
      },
      citiCustomCashEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(1);
    expect(result.points).toBe(30);
    expect(result.bonusLabel).toBeNull();
  });

  it("earns 1x on all categories (groceries)", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "ccc2",
        merchantName: "TRADER JOES",
        amount: 85,
        category: "groceries",
        confidence: "high",
      },
      citiCustomCashEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(1);
    expect(result.points).toBe(85);
  });

  it("earns 1x on all categories (travel)", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "ccc3",
        merchantName: "HYATT",
        amount: 250,
        category: "travel_hotels",
        confidence: "high",
      },
      citiCustomCashEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(1);
    expect(result.points).toBe(250);
  });

  it("earns 1x on other categories", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "ccc4",
        merchantName: "RANDOM STORE",
        amount: 120,
        category: "other",
        confidence: "low",
      },
      citiCustomCashEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(1);
    expect(result.points).toBe(120);
  });
});

// ── Discover it Cash Back (Tier 2) ──
describe("Discover it Cash Back earn rates", () => {
  it("earns 1x on all categories (dining)", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "dicb1",
        merchantName: "OLIVE GARDEN",
        amount: 35,
        category: "dining",
        confidence: "high",
      },
      discoverItCashBackEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(1);
    expect(result.points).toBe(35);
    expect(result.bonusLabel).toBeNull();
  });

  it("earns 1x on all categories (groceries)", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "dicb2",
        merchantName: "SAFEWAY",
        amount: 125,
        category: "groceries",
        confidence: "high",
      },
      discoverItCashBackEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(1);
    expect(result.points).toBe(125);
  });

  it("earns 1x on all categories (travel)", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "dicb3",
        merchantName: "SOUTHWEST AIRLINES",
        amount: 350,
        category: "travel_flights",
        confidence: "high",
      },
      discoverItCashBackEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(1);
    expect(result.points).toBe(350);
  });

  it("earns 1x on other categories", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "dicb4",
        merchantName: "ELECTRONICS STORE",
        amount: 200,
        category: "other",
        confidence: "low",
      },
      discoverItCashBackEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(1);
    expect(result.points).toBe(200);
  });
});

// ── Amex Business Platinum (Tier 3) ──
describe("Amex Business Platinum earn rates", () => {
  it("earns 1x base rate on other categories", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "abp1",
        merchantName: "RANDOM STORE",
        amount: 100,
        category: "other",
        confidence: "low",
      },
      amexBusinessPlatinumEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(1);
    expect(result.points).toBe(100);
  });

  it("earns 5x on travel portal", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "abp2",
        merchantName: "AMEX TRAVEL",
        amount: 500,
        category: "travel_portal",
        confidence: "high",
      },
      amexBusinessPlatinumEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(5);
    expect(result.points).toBe(2500);
    expect(result.bonusLabel).toBe("Amex Travel flights & prepaid hotels");
  });
});

// ── Apple Card (Tier 3) ──
describe("Apple Card earn rates", () => {
  it("earns 1x base rate on other categories", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "ac1",
        merchantName: "RANDOM STORE",
        amount: 100,
        category: "other",
        confidence: "low",
      },
      appleCardEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(1);
    expect(result.points).toBe(100);
  });

  it("earns 3x on Apple merchant match", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "ac2",
        merchantName: "APPLE STORE FIFTH AVENUE",
        amount: 50,
        category: "shopping_instore",
        confidence: "high",
      },
      appleCardEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(3);
    expect(result.points).toBe(150);
    expect(result.bonusLabel).toBe("Apple stores & Apple.com");
  });

  it("earns 3x on Uber merchant match", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "ac3",
        merchantName: "UBER* TRIP",
        amount: 35,
        category: "rideshare",
        confidence: "high",
      },
      appleCardEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(3);
    expect(result.points).toBe(105);
    expect(result.bonusLabel).toBe("Uber & Uber Eats");
  });

  it("earns 3x on Nike merchant match", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "ac4",
        merchantName: "NIKE STORE",
        amount: 120,
        category: "shopping_instore",
        confidence: "high",
      },
      appleCardEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(3);
    expect(result.points).toBe(360);
    expect(result.bonusLabel).toBe("Nike");
  });

  it("earns 3x on Exxon Mobil gas merchant match", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "ac5",
        merchantName: "EXXON MOBIL",
        amount: 60,
        category: "gas_stations",
        confidence: "high",
      },
      appleCardEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(3);
    expect(result.points).toBe(180);
    expect(result.bonusLabel).toBe("Exxon & Mobil");
  });

  it("earns 3x on Walgreens merchant match", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "ac6",
        merchantName: "WALGREENS 4567",
        amount: 30,
        category: "drugstores",
        confidence: "high",
      },
      appleCardEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(3);
    expect(result.points).toBe(90);
    expect(result.bonusLabel).toBe("Walgreens & Duane Reade");
  });

  it("earns 3x on Ace Hardware merchant match", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "ac7",
        merchantName: "ACE HARDWARE",
        amount: 80,
        category: "home_improvement",
        confidence: "high",
      },
      appleCardEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(3);
    expect(result.points).toBe(240);
    expect(result.bonusLabel).toBe("Ace Hardware");
  });

  it("earns 3x on Booking.com merchant match", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "ac8",
        merchantName: "BOOKING.COM",
        amount: 250,
        category: "travel_hotels",
        confidence: "high",
      },
      appleCardEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(3);
    expect(result.points).toBe(750);
    expect(result.bonusLabel).toBe("Booking.com");
  });
});

// ── Capital One SavorOne (Tier 3) ──
describe("Capital One SavorOne earn rates", () => {
  it("earns 1x base rate on other categories", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "cos1",
        merchantName: "RANDOM STORE",
        amount: 100,
        category: "other",
        confidence: "low",
      },
      capitalOneSavorEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(1);
    expect(result.points).toBe(100);
  });

  it("earns 8x on Capital One Entertainment portal merchant match", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "cos2",
        merchantName: "CAPITAL ONE ENTERTAINMENT",
        amount: 75,
        category: "entertainment",
        confidence: "high",
      },
      capitalOneSavorEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(8);
    expect(result.points).toBe(600);
    expect(result.bonusLabel).toBe("Capital One Entertainment purchases");
  });

  it("earns 5x on travel portal", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "cos3",
        merchantName: "MARRIOTT",
        amount: 300,
        category: "travel_portal",
        confidence: "high",
      },
      capitalOneSavorEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(5);
    expect(result.points).toBe(1500);
    expect(result.bonusLabel).toBe("Capital One Travel hotels & rental cars");
  });

  it("earns 3x on dining", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "cos4",
        merchantName: "CHIPOTLE",
        amount: 20,
        category: "dining",
        confidence: "high",
      },
      capitalOneSavorEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(3);
    expect(result.points).toBe(60);
    expect(result.bonusLabel).toBe("Dining");
  });

  it("earns 3x on streaming", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "cos5",
        merchantName: "NETFLIX",
        amount: 15,
        category: "streaming",
        confidence: "high",
      },
      capitalOneSavorEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(3);
    expect(result.points).toBe(45);
    expect(result.bonusLabel).toBe("Streaming services");
  });

  it("earns 3x on groceries", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "cos6",
        merchantName: "WHOLE FOODS",
        amount: 100,
        category: "groceries",
        confidence: "high",
      },
      capitalOneSavorEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(3);
    expect(result.points).toBe(300);
    expect(result.bonusLabel).toBe("Grocery stores");
  });
});

// ── Delta SkyMiles Platinum (Tier 3) ──
describe("Delta SkyMiles Platinum earn rates", () => {
  it("earns 1x base rate on other categories", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "dp1",
        merchantName: "RANDOM STORE",
        amount: 100,
        category: "other",
        confidence: "low",
      },
      deltaPlatinumEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(1);
    expect(result.points).toBe(100);
  });

  it("earns 3x on Delta flights merchant match", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "dp2",
        merchantName: "DELTA AIRLINES",
        amount: 400,
        category: "travel_flights",
        confidence: "high",
      },
      deltaPlatinumEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(3);
    expect(result.points).toBe(1200);
    expect(result.bonusLabel).toBe("Delta flights");
  });

  it("earns 3x on hotels", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "dp3",
        merchantName: "MARRIOTT",
        amount: 200,
        category: "travel_hotels",
        confidence: "high",
      },
      deltaPlatinumEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(3);
    expect(result.points).toBe(600);
    expect(result.bonusLabel).toBe("Hotels");
  });

  it("earns 2x on dining", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "dp4",
        merchantName: "CHIPOTLE",
        amount: 25,
        category: "dining",
        confidence: "high",
      },
      deltaPlatinumEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(2);
    expect(result.points).toBe(50);
    expect(result.bonusLabel).toBe("Restaurants");
  });

  it("earns 2x on groceries", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "dp5",
        merchantName: "KROGER",
        amount: 85,
        category: "groceries",
        confidence: "high",
      },
      deltaPlatinumEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(2);
    expect(result.points).toBe(170);
    expect(result.bonusLabel).toBe("Supermarkets");
  });
});

// ── Hilton Honors Amex Aspire (Tier 3) ──
describe("Hilton Honors Amex Aspire earn rates", () => {
  it("earns 3x base rate on other categories", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "hha1",
        merchantName: "RANDOM STORE",
        amount: 100,
        category: "other",
        confidence: "low",
      },
      hiltonAspireEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(3);
    expect(result.points).toBe(300);
  });

  it("earns 14x on Hilton hotel merchant match", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "hha2",
        merchantName: "HILTON WAIKIKI",
        amount: 250,
        category: "travel_hotels",
        confidence: "high",
      },
      hiltonAspireEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(14);
    expect(result.points).toBe(3500);
    expect(result.bonusLabel).toBe("Hilton hotels & resorts");
  });

  it("earns 14x on Conrad hotel (Hilton brand) merchant match", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "hha3",
        merchantName: "CONRAD BALI",
        amount: 300,
        category: "travel_hotels",
        confidence: "high",
      },
      hiltonAspireEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(14);
    expect(result.points).toBe(4200);
    expect(result.bonusLabel).toBe("Hilton hotels & resorts");
  });

  it("earns 7x on airlines", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "hha4",
        merchantName: "UNITED AIRLINES",
        amount: 350,
        category: "travel_flights",
        confidence: "high",
      },
      hiltonAspireEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(7);
    expect(result.points).toBe(2450);
    expect(result.bonusLabel).toBe("Airlines");
  });

  it("earns 7x on dining", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "hha5",
        merchantName: "NOBU",
        amount: 80,
        category: "dining",
        confidence: "high",
      },
      hiltonAspireEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(7);
    expect(result.points).toBe(560);
    expect(result.bonusLabel).toBe("Restaurants (non-Hilton)");
  });

  it("earns 7x on car rentals", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "hha6",
        merchantName: "HERTZ",
        amount: 120,
        category: "car_rentals",
        confidence: "high",
      },
      hiltonAspireEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(7);
    expect(result.points).toBe(840);
    expect(result.bonusLabel).toBe("Car rentals");
  });
});

// ── IHG One Rewards Premier (Tier 3) ──
describe("IHG One Rewards Premier earn rates", () => {
  it("earns 3x base rate on other categories", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "ihg1",
        merchantName: "RANDOM STORE",
        amount: 100,
        category: "other",
        confidence: "low",
      },
      ihgPremierEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(3);
    expect(result.points).toBe(300);
  });

  it("earns 10x on IHG hotel merchant match", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "ihg2",
        merchantName: "INTERCONTINENTAL TOKYO",
        amount: 200,
        category: "travel_hotels",
        confidence: "high",
      },
      ihgPremierEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(10);
    expect(result.points).toBe(2000);
    expect(result.bonusLabel).toBe("IHG hotels");
  });

  it("earns 10x on Kimpton hotel (IHG brand) merchant match", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "ihg3",
        merchantName: "KIMPTON HOTEL SAN DIEGO",
        amount: 250,
        category: "travel_hotels",
        confidence: "high",
      },
      ihgPremierEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(10);
    expect(result.points).toBe(2500);
    expect(result.bonusLabel).toBe("IHG hotels");
  });

  it("earns 5x on airlines", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "ihg4",
        merchantName: "DELTA",
        amount: 300,
        category: "travel_flights",
        confidence: "high",
      },
      ihgPremierEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(5);
    expect(result.points).toBe(1500);
    expect(result.bonusLabel).toBe("Airlines");
  });

  it("earns 5x on car rentals", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "ihg5",
        merchantName: "AVIS",
        amount: 150,
        category: "car_rentals",
        confidence: "high",
      },
      ihgPremierEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(5);
    expect(result.points).toBe(750);
    expect(result.bonusLabel).toBe("Car rentals");
  });

  it("earns 5x on dining", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "ihg6",
        merchantName: "RESTAURANT NOMA",
        amount: 120,
        category: "dining",
        confidence: "high",
      },
      ihgPremierEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(5);
    expect(result.points).toBe(600);
    expect(result.bonusLabel).toBe("Dining");
  });
});

// ── Chase Ink Business Preferred (Tier 3) ──
describe("Chase Ink Business Preferred earn rates", () => {
  it("earns 1x base rate on other categories", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "ibp1",
        merchantName: "RANDOM STORE",
        amount: 100,
        category: "other",
        confidence: "low",
      },
      inkBusinessPreferredEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(1);
    expect(result.points).toBe(100);
  });

  it("earns 5x on Lyft merchant match", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "ibp2",
        merchantName: "LYFT *RIDE",
        amount: 50,
        category: "rideshare",
        confidence: "high",
      },
      inkBusinessPreferredEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(5);
    expect(result.points).toBe(250);
    expect(result.bonusLabel).toContain("Lyft");
  });

  it("earns 3x on travel flights (under cap)", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "ibp3",
        merchantName: "UNITED AIRLINES",
        amount: 300,
        category: "travel_flights",
        confidence: "high",
      },
      inkBusinessPreferredEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(3);
    expect(result.points).toBe(900);
    expect(result.bonusLabel).toBe("Travel");
  });

  it("earns 3x on phone services (under cap)", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "ibp4",
        merchantName: "VERIZON WIRELESS",
        amount: 75,
        category: "phone_services",
        confidence: "high",
      },
      inkBusinessPreferredEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(3);
    expect(result.points).toBe(225);
    expect(result.bonusLabel).toBe("Internet, cable & phone services");
  });

  it("enforces $150K annual cap on 3x categories", () => {
    const capState: CapState = {
      ink_3x_150k: { spendToDate: 149900, maxSpend: 150000 },
    };
    const result = calculatePointsForTransaction(
      {
        id: "ibp5",
        merchantName: "UNITED AIRLINES",
        amount: 200,
        category: "travel_flights",
        confidence: "high",
      },
      inkBusinessPreferredEarnConfig,
      capState
    );
    // $100 at 3x (300) + $100 at 1x (100) = 400
    expect(result.points).toBe(400);
    expect(result.capApplied).toBe(true);
    expect(capState.ink_3x_150k.spendToDate).toBe(150000);
  });

  it("falls back to 1x when $150K cap is already hit", () => {
    const capState: CapState = {
      ink_3x_150k: { spendToDate: 150000, maxSpend: 150000 },
    };
    const result = calculatePointsForTransaction(
      {
        id: "ibp6",
        merchantName: "UNITED AIRLINES",
        amount: 100,
        category: "travel_flights",
        confidence: "high",
      },
      inkBusinessPreferredEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(1);
    expect(result.points).toBe(100);
    expect(result.capApplied).toBe(true);
  });
});

// ── Southwest Rapid Rewards Priority (Tier 3) ──
describe("Southwest Rapid Rewards Priority earn rates", () => {
  it("earns 1x base rate on other categories", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "swp1",
        merchantName: "RANDOM STORE",
        amount: 100,
        category: "other",
        confidence: "low",
      },
      southwestPriorityEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(1);
    expect(result.points).toBe(100);
  });

  it("earns 2x on Southwest flights merchant match", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "swp2",
        merchantName: "SOUTHWEST AIRLINES",
        amount: 250,
        category: "travel_flights",
        confidence: "high",
      },
      southwestPriorityEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(2);
    expect(result.points).toBe(500);
    expect(result.bonusLabel).toBe("Southwest flights");
  });

  it("earns 2x on dining", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "swp3",
        merchantName: "CHIPOTLE",
        amount: 30,
        category: "dining",
        confidence: "high",
      },
      southwestPriorityEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(2);
    expect(result.points).toBe(60);
    expect(result.bonusLabel).toBe("Dining");
  });
});

// ── United Explorer Chase (Tier 3) ──
describe("United Explorer Chase earn rates", () => {
  it("earns 1x base rate on other categories", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "uc1",
        merchantName: "RANDOM STORE",
        amount: 100,
        category: "other",
        confidence: "low",
      },
      unitedExplorerEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(1);
    expect(result.points).toBe(100);
  });

  it("earns 5x on United flights merchant match", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "uc2",
        merchantName: "UNITED AIRLINES",
        amount: 300,
        category: "travel_flights",
        confidence: "high",
      },
      unitedExplorerEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(5);
    expect(result.points).toBe(1500);
    expect(result.bonusLabel).toBe("United flights");
  });

  it("earns 2x on dining", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "uc3",
        merchantName: "NOBU",
        amount: 60,
        category: "dining",
        confidence: "high",
      },
      unitedExplorerEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(2);
    expect(result.points).toBe(120);
    expect(result.bonusLabel).toBe("Dining");
  });

  it("earns 2x on hotels", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "uc4",
        merchantName: "MARRIOTT",
        amount: 250,
        category: "travel_hotels",
        confidence: "high",
      },
      unitedExplorerEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(2);
    expect(result.points).toBe(500);
    expect(result.bonusLabel).toBe("Hotels");
  });
});

// ── World of Hyatt Chase (Tier 3) ──
describe("World of Hyatt Chase earn rates", () => {
  it("earns 1x base rate on other categories", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "wh1",
        merchantName: "RANDOM STORE",
        amount: 100,
        category: "other",
        confidence: "low",
      },
      worldOfHyattEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(1);
    expect(result.points).toBe(100);
  });

  it("earns 4x on Hyatt hotel merchant match", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "wh2",
        merchantName: "HYATT REGENCY MAUI",
        amount: 300,
        category: "travel_hotels",
        confidence: "high",
      },
      worldOfHyattEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(4);
    expect(result.points).toBe(1200);
    expect(result.bonusLabel).toBe("Hyatt hotels");
  });

  it("earns 4x on Park Hyatt (Hyatt brand) merchant match", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "wh3",
        merchantName: "PARK HYATT TOKYO",
        amount: 400,
        category: "travel_hotels",
        confidence: "high",
      },
      worldOfHyattEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(4);
    expect(result.points).toBe(1600);
    expect(result.bonusLabel).toBe("Hyatt hotels");
  });

  it("earns 2x on dining", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "wh4",
        merchantName: "CHIPOTLE",
        amount: 25,
        category: "dining",
        confidence: "high",
      },
      worldOfHyattEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(2);
    expect(result.points).toBe(50);
    expect(result.bonusLabel).toBe("Dining");
  });

  it("earns 2x on airlines", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "wh5",
        merchantName: "DELTA",
        amount: 200,
        category: "travel_flights",
        confidence: "high",
      },
      worldOfHyattEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(2);
    expect(result.points).toBe(400);
    expect(result.bonusLabel).toBe("Airlines");
  });

  it("earns 2x on car rentals", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "wh6",
        merchantName: "HERTZ",
        amount: 120,
        category: "car_rentals",
        confidence: "high",
      },
      worldOfHyattEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(2);
    expect(result.points).toBe(240);
    expect(result.bonusLabel).toBe("Car rentals");
  });

  it("earns 2x on transit", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "wh7",
        merchantName: "METRO TRANSIT",
        amount: 40,
        category: "transit",
        confidence: "high",
      },
      worldOfHyattEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(2);
    expect(result.points).toBe(80);
    expect(result.bonusLabel).toBe("Transit & rideshare");
  });

  it("earns 2x on fitness memberships", () => {
    const capState: CapState = {};
    const result = calculatePointsForTransaction(
      {
        id: "wh8",
        merchantName: "PELOTON DIGITAL",
        amount: 15,
        category: "fitness",
        confidence: "high",
      },
      worldOfHyattEarnConfig,
      capState
    );
    expect(result.earnRate).toBe(2);
    expect(result.points).toBe(30);
    expect(result.bonusLabel).toBe("Gym & fitness memberships");
  });
});
