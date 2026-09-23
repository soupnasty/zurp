import { describe, it, expect } from "vitest";
import { getCardYear } from "../card-year";
import { computeEarnedCredits } from "../earned";
import { computeUnclaimed } from "../unclaimed";
import { computeExpired } from "../expired";
import type { RewardsBenefit, UsageRow } from "../types";

const d = (s: string) => new Date(`${s}T00:00:00.000Z`);
const end = (s: string) => new Date(`${s}T23:59:59.999Z`);

function benefit(overrides: Partial<RewardsBenefit> & Pick<RewardsBenefit, "id" | "cycle">): RewardsBenefit {
  return {
    name: overrides.id,
    type: "credit",
    creditAmount: 10,
    sunsetDate: null,
    displayGroup: null,
    displayGroupName: null,
    autoMatchable: true,
    requiresActivation: false,
    ...overrides,
  };
}

function row(
  benefitId: string,
  periodKey: string,
  cycleStart: string,
  cycleEnd: string,
  amountUsed: number,
  amountRemaining: number,
  updatedAt = cycleStart
): UsageRow {
  return {
    benefitId,
    periodKey,
    cycleStart: d(cycleStart),
    cycleEnd: end(cycleEnd),
    amountUsed,
    amountRemaining,
    updatedAt: d(updatedAt),
  };
}

// Card year Mar 3, 2026 → Mar 2, 2027; "now" is Sep 22, 2026.
const ANNIV = d("2025-03-03");
const NOW = new Date("2026-09-22T12:00:00.000Z");
const YEAR = getCardYear(ANNIV, NOW);

const LYFT = benefit({ id: "lyft", name: "Lyft Credit", cycle: "monthly", creditAmount: 10 });
const STUB_H1 = benefit({ id: "stub_h1", name: "StubHub Credit", cycle: "biannual_h1", creditAmount: 150, autoMatchable: false, requiresActivation: true });
const STUB_H2 = benefit({ id: "stub_h2", name: "StubHub Credit", cycle: "biannual_h2", creditAmount: 150, autoMatchable: false, requiresActivation: true });
const TRAVEL = benefit({ id: "travel", name: "Travel Credit", cycle: "annual_anniversary", creditAmount: 300 });
const GE = benefit({ id: "ge", name: "Global Entry", cycle: "quadrennial", creditAmount: 120 });
const DEC_ONLY = benefit({ id: "uber_dec", name: "Uber Cash", cycle: "monthly", creditAmount: 35, activeMonths: [11] });
const SUNSETTING = benefit({ id: "sunset", name: "Sunsetting", cycle: "monthly", creditAmount: 5, sunsetDate: "2026-12-31" });
const DD_A = benefit({ id: "dd_a", name: "DoorDash $5", cycle: "monthly", creditAmount: 5, displayGroup: "dd", displayGroupName: "DoorDash Credits" });
const DD_B = benefit({ id: "dd_b", name: "DoorDash $10", cycle: "monthly", creditAmount: 10, displayGroup: "dd", displayGroupName: "DoorDash Credits" });
const APPLE = benefit({ id: "apple", name: "Apple TV+", type: "subscription", cycle: "subscription", creditAmount: 10 });

describe("getCardYear", () => {
  it("runs anniversary to the day before the next one", () => {
    expect(YEAR.start).toEqual(d("2026-03-03"));
    expect(YEAR.end).toEqual(end("2027-03-02"));
    expect(YEAR.estimated).toBe(false);
  });

  it("falls back to the calendar year without an anniversary", () => {
    const y = getCardYear(null, NOW);
    expect(y.start).toEqual(d("2026-01-01"));
    expect(y.end).toEqual(end("2026-12-31"));
    expect(y.estimated).toBe(true);
  });
});

describe("computeUnclaimed", () => {
  const rows = [
    row("lyft", "2026-09", "2026-09-01", "2026-09-30", 0, 10),
    row("stub_h2", "2026-H2", "2026-07-01", "2026-12-31", 0, 150),
    row("travel", "2026-ANN", "2026-03-03", "2027-03-02", 180, 120),
    row("ge", "2024-Q4", "2024-01-01", "2027-12-31", 0, 120),
  ];
  const all = [LYFT, STUB_H1, STUB_H2, TRAVEL, GE, DEC_ONLY, SUNSETTING, APPLE];
  const byKey = (key: string) =>
    computeUnclaimed(all, rows, YEAR, ANNIV, NOW).find((c) => c.key === key);

  it("counts the running month plus every month left in the card year", () => {
    // Sep (from row) + Oct..Feb + Mar 1–2 (Mar period starts inside the card year)
    const lyft = byKey("Lyft Credit")!;
    expect(lyft.thisCycle).toBe(10);
    expect(lyft.restOfYear).toBe(10 + 6 * 10);
    expect(lyft.daysLeft).toBe(9);
    expect(lyft.currentBenefitIds).toEqual(["lyft"]);
  });

  it("merges half-year variants and includes the next half that starts in the card year", () => {
    const stub = byKey("StubHub Credit")!;
    expect(stub.thisCycle).toBe(150);
    expect(stub.restOfYear).toBe(300);
    expect(stub.thisCycleEnd).toEqual(end("2026-12-31"));
    expect(stub.currentBenefitIds).toEqual(["stub_h2"]);
    expect(stub.autoMatchable).toBe(false);
    expect(stub.requiresActivation).toBe(true);
  });

  it("uses the remaining balance for the running anniversary period", () => {
    const travel = byKey("Travel Credit")!;
    expect(travel.thisCycle).toBe(120);
    expect(travel.restOfYear).toBe(120);
  });

  it("includes an open quadrennial balance", () => {
    expect(byKey("Global Entry")!.restOfYear).toBe(120);
  });

  it("respects activeMonths: a Dec-only credit is future value, not running now", () => {
    const uber = byKey("Uber Cash")!;
    expect(uber.thisCycle).toBe(0);
    expect(uber.thisCycleEnd).toBeNull();
    expect(uber.daysLeft).toBeNull();
    expect(uber.restOfYear).toBe(35);
  });

  it("stops at the sunset date", () => {
    // Sep..Dec only (no row for Sep, so the full credit is assumed left)
    expect(byKey("Sunsetting")!.restOfYear).toBe(4 * 5);
  });

  it("leaves out subscriptions and hidden benefits", () => {
    const list = computeUnclaimed(all, rows, YEAR, ANNIV, NOW, new Set(["lyft"]));
    expect(list.find((c) => c.key === "Apple TV+")).toBeUndefined();
    expect(list.find((c) => c.key === "Lyft Credit")).toBeUndefined();
  });

  it("groups displayGroup sub-credits into one row", () => {
    const list = computeUnclaimed([DD_A, DD_B], [], YEAR, ANNIV, NOW);
    expect(list).toHaveLength(1);
    expect(list[0].name).toBe("DoorDash Credits");
    expect(list[0].thisCycle).toBe(15);
  });

  it("sorts by soonest reset", () => {
    const keys = computeUnclaimed(all, rows, YEAR, ANNIV, NOW).map((c) => c.key);
    expect(keys.indexOf("Lyft Credit")).toBeLessThan(keys.indexOf("StubHub Credit"));
    expect(keys.indexOf("StubHub Credit")).toBeLessThan(keys.indexOf("Travel Credit"));
    expect(keys[keys.length - 1]).toBe("Uber Cash");
  });
});

describe("computeEarnedCredits", () => {
  it("counts usage in periods overlapping the card year so far", () => {
    const rows = [
      row("lyft", "2026-02", "2026-02-01", "2026-02-28", 10, 0), // before card year
      row("lyft", "2026-05", "2026-05-01", "2026-05-31", 10, 0),
      row("lyft", "2026-06", "2026-06-01", "2026-06-30", 7, 3),
      row("travel", "2026-ANN", "2026-03-03", "2027-03-02", 180, 120),
    ];
    const earned = computeEarnedCredits([LYFT, TRAVEL], rows, [], YEAR, NOW);
    expect(earned.total).toBe(197);
    expect(earned.credits).toEqual([
      { key: "Travel Credit", name: "Travel Credit", amount: 180 },
      { key: "Lyft Credit", name: "Lyft Credit", amount: 17 },
    ]);
  });

  it("counts quadrennial usage only when recorded in this card year", () => {
    const old = [row("ge", "2024-Q4", "2024-01-01", "2027-12-31", 120, 0, "2025-06-10")];
    const recent = [row("ge", "2024-Q4", "2024-01-01", "2027-12-31", 120, 0, "2026-04-10")];
    expect(computeEarnedCredits([GE], old, [], YEAR, NOW).total).toBe(0);
    expect(computeEarnedCredits([GE], recent, [], YEAR, NOW).total).toBe(120);
  });

  it("accrues subscriptions monthly from the later of activation and card-year start", () => {
    // Activated Jan 2026 → counts Mar..Sep = 7 months
    const earned = computeEarnedCredits([APPLE], [], [{ benefitId: "apple", activatedAt: d("2026-01-01") }], YEAR, NOW);
    expect(earned.total).toBe(70);
  });

  it("stops subscription accrual at the sunset month", () => {
    const sunsetting = { ...APPLE, sunsetDate: "2026-06-22" };
    const earned = computeEarnedCredits([sunsetting], [], [{ benefitId: "apple", activatedAt: d("2026-05-01") }], YEAR, NOW);
    expect(earned.total).toBe(20); // May + Jun
  });
});

describe("computeExpired", () => {
  const rows = [
    row("lyft", "2026-02", "2026-02-01", "2026-02-28", 0, 10), // before card year
    row("lyft", "2026-04", "2026-04-01", "2026-04-30", 0, 10),
    row("lyft", "2026-05", "2026-05-01", "2026-05-31", 10, 0),
    row("lyft", "2026-09", "2026-09-01", "2026-09-30", 0, 10), // still open
    row("stub_h1", "2026-H1", "2026-01-01", "2026-06-30", 0, 150),
  ];

  it("totals credit left in periods that closed this card year", () => {
    const s = computeExpired([LYFT, STUB_H1], rows, YEAR, null, NOW);
    expect(s.total).toBe(160);
    expect(s.credits.map((c) => [c.name, c.amount])).toEqual([
      ["StubHub Credit", 150],
      ["Lyft Credit", 10],
    ]);
    expect(s.capture).toEqual({ pct: 6, captured: 10, available: 170 });
  });

  it("splits out periods that closed before the user joined", () => {
    const s = computeExpired([LYFT, STUB_H1], rows, YEAR, d("2026-05-01"), NOW);
    expect(s.beforeJoined).toBe(10); // April's Lyft credit
  });

  it("drops hidden credits from the total and the capture rate", () => {
    const s = computeExpired([LYFT, STUB_H1], rows, YEAR, null, NOW, new Set(["stub_h1"]));
    expect(s.total).toBe(10);
    expect(s.capture).toEqual({ pct: 50, captured: 10, available: 20 });
  });

  it("returns a null capture rate before any period has closed", () => {
    expect(computeExpired([LYFT], [], YEAR, null, NOW).capture).toBeNull();
  });
});

describe("every registered card", () => {
  it("computes unclaimed credits for all 30 cards, with and without an anniversary", async () => {
    const { getAllCardDefinitions } = await import("@/lib/cards");
    for (const card of getAllCardDefinitions()) {
      for (const anniv of [ANNIV, null]) {
        const year = getCardYear(anniv, NOW);
        const list = computeUnclaimed(card.benefits, [], year, anniv, NOW);
        for (const c of list) {
          expect(c.restOfYear).toBeGreaterThan(0);
          expect(c.restOfYear).toBeGreaterThanOrEqual(c.thisCycle);
        }
      }
    }
  });
});
