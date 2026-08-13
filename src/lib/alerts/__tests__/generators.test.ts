import { describe, it, expect } from "vitest";
import {
  generateCreditExpiryAlerts,
  generateRenewalVerdictAlert,
  generateConnectionAlerts,
} from "../generators";
import type { CreditGroupState } from "../types";

const NOW = new Date(Date.UTC(2026, 7, 13)); // Aug 13, 2026

function daysFromNow(n: number): Date {
  return new Date(NOW.getTime() + n * 24 * 60 * 60 * 1000);
}

function makeGroup(overrides: Partial<CreditGroupState> = {}): CreditGroupState {
  return {
    key: "csr_doordash",
    name: "DoorDash",
    cycle: "monthly",
    periodKey: "2026-08",
    remaining: 19,
    cycleEnd: daysFromNow(8),
    recentFullUse: [],
    ...overrides,
  };
}

describe("generateCreditExpiryAlerts", () => {
  it("fires a monthly alert inside the 10-day lead window", () => {
    const alerts = generateCreditExpiryAlerts("cp1", [makeGroup()], NOW);
    expect(alerts).toHaveLength(1);
    expect(alerts[0].dedupKey).toBe("credit_expiring:cp1:csr_doordash:2026-08");
    expect(alerts[0].severity).toBe("action");
    expect(alerts[0].payload.daysLeft).toBe(8);
  });

  it("stays quiet outside the lead window", () => {
    const alerts = generateCreditExpiryAlerts(
      "cp1",
      [makeGroup({ cycleEnd: daysFromNow(15) })],
      NOW
    );
    expect(alerts).toHaveLength(0);
  });

  it("ignores small remainders", () => {
    const alerts = generateCreditExpiryAlerts(
      "cp1",
      [makeGroup({ remaining: 6 })],
      NOW
    );
    expect(alerts).toHaveLength(0);
  });

  it("suppresses monthly nudges for habitual maxers", () => {
    const habitual = makeGroup({ recentFullUse: [true, true, true, false] });
    expect(generateCreditExpiryAlerts("cp1", [habitual], NOW)).toHaveLength(0);

    // A broken streak un-suppresses
    const lapsed = makeGroup({ recentFullUse: [false, true, true, true] });
    expect(generateCreditExpiryAlerts("cp1", [lapsed], NOW)).toHaveLength(1);
  });

  it("does not habit-suppress longer cycles", () => {
    const annual = makeGroup({
      cycle: "annual_anniversary",
      periodKey: "2026-ANN",
      remaining: 150,
      cycleEnd: daysFromNow(25),
      recentFullUse: [true, true, true],
    });
    const alerts = generateCreditExpiryAlerts("cp1", [annual], NOW);
    expect(alerts).toHaveLength(1);
  });

  it("applies the ladder per cycle class", () => {
    const cases: Array<[CreditGroupState["cycle"], number, boolean]> = [
      ["monthly", 11, false],
      ["monthly", 10, true],
      ["quarterly_q3", 22, false],
      ["quarterly_q3", 21, true],
      ["annual_anniversary", 31, false],
      ["annual_anniversary", 30, true],
      ["quadrennial", 91, false],
      ["quadrennial", 90, true],
    ];
    for (const [cycle, days, expected] of cases) {
      const alerts = generateCreditExpiryAlerts(
        "cp1",
        [makeGroup({ cycle, cycleEnd: daysFromNow(days), remaining: 100 })],
        NOW
      );
      expect(alerts.length === 1, `${cycle} at ${days}d`).toBe(expected);
    }
  });

  it("marks the escalated stage inside the escalation window", () => {
    const annual = makeGroup({
      cycle: "annual_anniversary",
      remaining: 150,
      cycleEnd: daysFromNow(6),
    });
    const alerts = generateCreditExpiryAlerts("cp1", [annual], NOW);
    expect(alerts[0].payload.stage).toBe("escalated");

    const monthly = makeGroup({ cycleEnd: daysFromNow(6) });
    const mAlerts = generateCreditExpiryAlerts("cp1", [monthly], NOW);
    expect(mAlerts[0].payload.stage).toBe("initial"); // monthly never escalates
  });

  it("skips subscription benefits", () => {
    const sub = makeGroup({ cycle: "subscription", cycleEnd: daysFromNow(5) });
    expect(generateCreditExpiryAlerts("cp1", [sub], NOW)).toHaveLength(0);
  });
});

describe("generateRenewalVerdictAlert", () => {
  const base = {
    renewsAt: daysFromNow(23).toISOString(),
    daysUntil: 23,
    annualFee: 795,
    creditsCaptured: 1886,
    pointsValue: 1600,
    netSoFar: 2691,
  };

  it("fires KEEP inside the T-30 window when clearly ahead", () => {
    const alert = generateRenewalVerdictAlert("cp1", "Chase Sapphire Reserve", base, NOW)!;
    expect(alert.payload.verdict).toBe("keep");
    expect(alert.title).toContain("KEEP");
    expect(alert.dedupKey).toBe(`renewal_verdict:cp1:2026`);
  });

  it("stays quiet outside the window", () => {
    expect(
      generateRenewalVerdictAlert("cp1", "CSR", { ...base, daysUntil: 45 }, NOW)
    ).toBeNull();
  });

  it("calls the tie band a close call", () => {
    // total 850 vs fee 795 → inside max(100, 5%) band
    const alert = generateRenewalVerdictAlert(
      "cp1",
      "CSR",
      { ...base, creditsCaptured: 500, pointsValue: 350, netSoFar: 55 },
      NOW
    )!;
    expect(alert.payload.verdict).toBe("close_call");
  });

  it("says RECONSIDER when clearly behind", () => {
    const alert = generateRenewalVerdictAlert(
      "cp1",
      "CSR",
      { ...base, creditsCaptured: 100, pointsValue: 150, netSoFar: -545 },
      NOW
    )!;
    expect(alert.payload.verdict).toBe("reconsider");
    expect(alert.body).toContain("downgrade");
  });

  it("escalates at T-7", () => {
    const alert = generateRenewalVerdictAlert(
      "cp1",
      "CSR",
      { ...base, daysUntil: 6 },
      NOW
    )!;
    expect(alert.payload.stage).toBe("escalated");
  });
});

describe("generateConnectionAlerts", () => {
  it("alerts on broken connections only", () => {
    const alerts = generateConnectionAlerts(
      [
        { id: "c1", institutionName: "Chase", status: "active" },
        { id: "c2", institutionName: "Chime", status: "needs_reauth" },
        { id: "c3", institutionName: null, status: "disconnected" },
      ],
      NOW
    );
    expect(alerts).toHaveLength(2);
    expect(alerts[0].dedupKey).toBe("connection_broken:c2");
    expect(alerts[0].title).toContain("Chime");
    expect(alerts[1].title).toContain("Your bank");
    expect(alerts.every((a) => a.severity === "action")).toBe(true);
  });
});
