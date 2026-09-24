import { describe, it, expect } from "vitest";
import {
  generateCreditExpiryAlerts,
  generateRenewalVerdictAlert,
  generateConnectionAlerts,
  resolveReminder,
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

describe("user reminders", () => {
  it("never alerts when reminders are off", () => {
    const g = makeGroup({ reminder: { mode: "off", leadDays: null } });
    expect(generateCreditExpiryAlerts("cp1", [g], NOW)).toHaveLength(0);
  });

  it("uses a custom lead time in place of the ladder", () => {
    // 15 days out: outside the monthly 10-day ladder, inside a 20-day reminder
    const g = makeGroup({ cycleEnd: daysFromNow(15), reminder: { mode: "custom", leadDays: 20 } });
    const [alert] = generateCreditExpiryAlerts("cp1", [g], NOW);
    expect(alert.payload.userReminder).toBe(true);
    expect(alert.effectiveAt).toEqual(daysFromNow(-5));
    // A 3-day reminder stays quiet 8 days out, even though the ladder would fire
    const late = makeGroup({ reminder: { mode: "custom", leadDays: 3 } });
    expect(generateCreditExpiryAlerts("cp1", [late], NOW)).toHaveLength(0);
  });

  it("skips the minimum and habit suppression for a reminder the user set", () => {
    const g = makeGroup({
      remaining: 5,
      recentFullUse: [true, true, true],
      reminder: { mode: "custom", leadDays: 10 },
    });
    expect(generateCreditExpiryAlerts("cp1", [g], NOW)).toHaveLength(1);
    expect(generateCreditExpiryAlerts("cp1", [{ ...g, reminder: undefined }], NOW)).toHaveLength(0);
  });

  it("resolves a group's setting from its members", () => {
    const auto = { hidden: false, reminderMode: "auto", reminderLeadDays: null };
    const custom = (n: number) => ({ hidden: false, reminderMode: "custom", reminderLeadDays: n });
    expect(resolveReminder([undefined, undefined])).toEqual({ mode: "auto", leadDays: null });
    expect(resolveReminder([auto, custom(7), custom(3)])).toEqual({ mode: "custom", leadDays: 3 });
    expect(resolveReminder([custom(7), { ...auto, hidden: true }])).toEqual({ mode: "off", leadDays: null });
    expect(resolveReminder([{ ...auto, reminderMode: "off" }])).toEqual({ mode: "off", leadDays: null });
  });
});

describe("generateRenewalVerdictAlert", () => {
  const renewal = {
    renewsAt: daysFromNow(23).toISOString(),
    daysUntil: 23,
    annualFee: 795,
  };
  const verdict = {
    state: "keep" as const,
    compareToName: "Wells Fargo Active Cash",
    gap: -365,
    points: 640,
    benefits: 1040,
  };

  it("fires KEEP inside the T-30 window, naming the best alternative", () => {
    const alert = generateRenewalVerdictAlert("cp1", "Chase Sapphire Reserve", renewal, verdict)!;
    expect(alert.payload.verdict).toBe("keep");
    expect(alert.title).toContain("KEEP");
    expect(alert.body).toContain("~$365/yr more than the best alternative, Wells Fargo Active Cash");
    expect(alert.dedupKey).toBe(`renewal_verdict:cp1:2026`);
  });

  it("stays quiet outside the window", () => {
    expect(
      generateRenewalVerdictAlert("cp1", "CSR", { ...renewal, daysUntil: 45 }, verdict)
    ).toBeNull();
  });

  it("says SWITCH with the alternative and the gap", () => {
    const alert = generateRenewalVerdictAlert(
      "cp1",
      "CSR",
      renewal,
      { ...verdict, state: "switch", compareToName: "Amex Gold", gap: 260 }
    )!;
    expect(alert.title).toContain("SWITCH");
    expect(alert.body).toContain("Amex Gold would net you ~$260/yr more");
    expect(alert.body).toContain("retention offer");
  });

  it("calls a tie-band gap a TOSS-UP", () => {
    const alert = generateRenewalVerdictAlert("cp1", "CSR", renewal, { ...verdict, state: "toss_up", gap: 15 })!;
    expect(alert.payload.verdict).toBe("toss_up");
    expect(alert.title).toContain("TOSS-UP");
  });

  it("escalates at T-7", () => {
    const alert = generateRenewalVerdictAlert("cp1", "CSR", { ...renewal, daysUntil: 6 }, verdict)!;
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
