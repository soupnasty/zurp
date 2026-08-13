import { describe, it, expect } from "vitest";
import { computeCaptureRate } from "../capture-rate";

const NOW = new Date(Date.UTC(2026, 7, 13)); // Aug 13, 2026

function daysAgo(n: number): Date {
  return new Date(NOW.getTime() - n * 24 * 60 * 60 * 1000);
}

describe("computeCaptureRate", () => {
  it("computes rate over completed periods in the trailing year", () => {
    const rows = [
      { amountUsed: 25, amountRemaining: 0, cycleEnd: daysAgo(30) }, // maxed
      { amountUsed: 10, amountRemaining: 15, cycleEnd: daysAgo(60) }, // partial
      { amountUsed: 0, amountRemaining: 25, cycleEnd: daysAgo(90) }, // missed
    ];

    const result = computeCaptureRate(rows, NOW)!;
    expect(result.captured).toBe(35);
    expect(result.available).toBe(75);
    expect(result.leftOnTable).toBe(40);
    expect(result.pct).toBe(47); // 35/75
    expect(result.completedPeriods).toBe(3);
  });

  it("excludes periods still in flight", () => {
    const rows = [
      { amountUsed: 25, amountRemaining: 0, cycleEnd: daysAgo(30) },
      // Current month — ends in the future, not "left on the table" yet
      { amountUsed: 5, amountRemaining: 20, cycleEnd: daysAgo(-10) },
    ];

    const result = computeCaptureRate(rows, NOW)!;
    expect(result.captured).toBe(25);
    expect(result.available).toBe(25);
    expect(result.pct).toBe(100);
    expect(result.completedPeriods).toBe(1);
  });

  it("excludes periods that ended before the window", () => {
    const rows = [
      { amountUsed: 0, amountRemaining: 300, cycleEnd: daysAgo(400) }, // too old
      { amountUsed: 300, amountRemaining: 0, cycleEnd: daysAgo(100) },
    ];

    const result = computeCaptureRate(rows, NOW)!;
    expect(result.pct).toBe(100);
    expect(result.completedPeriods).toBe(1);
  });

  it("returns null when nothing has completed yet (fresh account)", () => {
    const rows = [
      { amountUsed: 5, amountRemaining: 20, cycleEnd: daysAgo(-10) },
    ];
    expect(computeCaptureRate(rows, NOW)).toBeNull();
    expect(computeCaptureRate([], NOW)).toBeNull();
  });

  it("ignores zero-value periods", () => {
    const rows = [
      { amountUsed: 0, amountRemaining: 0, cycleEnd: daysAgo(30) },
      { amountUsed: 50, amountRemaining: 50, cycleEnd: daysAgo(40) },
    ];
    const result = computeCaptureRate(rows, NOW)!;
    expect(result.completedPeriods).toBe(1);
    expect(result.pct).toBe(50);
  });
});
