import { describe, it, expect } from "vitest";
import {
  getCurrentCycleBounds,
  getPreviousCycleBounds,
  daysRemainingInCycle,
  isDateInCycle,
} from "../cycle-utils";

describe("getCurrentCycleBounds", () => {
  describe("monthly", () => {
    it("returns correct bounds for January 2026", () => {
      const ref = new Date(2026, 0, 15); // Jan 15, 2026
      const result = getCurrentCycleBounds("monthly", ref);
      expect(result.periodKey).toBe("2026-01");
      expect(result.cycleStart).toEqual(new Date(2026, 0, 1));
      expect(result.cycleEnd.getFullYear()).toBe(2026);
      expect(result.cycleEnd.getMonth()).toBe(0);
      expect(result.cycleEnd.getDate()).toBe(31);
    });

    it("returns correct bounds for February (28 days)", () => {
      const ref = new Date(2026, 1, 10);
      const result = getCurrentCycleBounds("monthly", ref);
      expect(result.periodKey).toBe("2026-02");
      expect(result.cycleEnd.getDate()).toBe(28);
    });

    it("returns correct bounds for December", () => {
      const ref = new Date(2026, 11, 25);
      const result = getCurrentCycleBounds("monthly", ref);
      expect(result.periodKey).toBe("2026-12");
      expect(result.cycleStart).toEqual(new Date(2026, 11, 1));
      expect(result.cycleEnd.getDate()).toBe(31);
    });
  });

  describe("biannual_h1", () => {
    it("returns correct H1 bounds", () => {
      const ref = new Date(2026, 3, 15);
      const result = getCurrentCycleBounds("biannual_h1", ref);
      expect(result.periodKey).toBe("2026-H1");
      expect(result.cycleStart).toEqual(new Date(2026, 0, 1));
      expect(result.cycleEnd.getMonth()).toBe(5); // June
      expect(result.cycleEnd.getDate()).toBe(30);
    });
  });

  describe("biannual_h2", () => {
    it("returns correct H2 bounds", () => {
      const ref = new Date(2026, 9, 15);
      const result = getCurrentCycleBounds("biannual_h2", ref);
      expect(result.periodKey).toBe("2026-H2");
      expect(result.cycleStart).toEqual(new Date(2026, 6, 1));
      expect(result.cycleEnd.getMonth()).toBe(11); // December
      expect(result.cycleEnd.getDate()).toBe(31);
    });
  });

  describe("annual_calendar", () => {
    it("returns full year bounds", () => {
      const ref = new Date(2026, 6, 1);
      const result = getCurrentCycleBounds("annual_calendar", ref);
      expect(result.periodKey).toBe("2026");
      expect(result.cycleStart).toEqual(new Date(2026, 0, 1));
      expect(result.cycleEnd.getMonth()).toBe(11);
      expect(result.cycleEnd.getDate()).toBe(31);
    });
  });

  describe("annual_anniversary", () => {
    it("returns anniversary-based bounds", () => {
      const ref = new Date(2026, 5, 15); // June 15
      const anniversary = new Date(2024, 2, 10); // March 10 original
      const result = getCurrentCycleBounds("annual_anniversary", ref, anniversary);

      expect(result.periodKey).toBe("2026-ANN");
      expect(result.cycleStart.getMonth()).toBe(2); // March
      expect(result.cycleStart.getDate()).toBe(10);
      expect(result.cycleEnd.getFullYear()).toBe(2027);
      expect(result.cycleEnd.getMonth()).toBe(2); // March
      expect(result.cycleEnd.getDate()).toBe(9);
    });

    it("handles when reference date is before anniversary in current year", () => {
      const ref = new Date(2026, 0, 15); // Jan 15
      const anniversary = new Date(2024, 5, 20); // June 20
      const result = getCurrentCycleBounds("annual_anniversary", ref, anniversary);

      // Should use the previous year's anniversary as cycle start
      expect(result.cycleStart.getFullYear()).toBe(2025);
      expect(result.cycleStart.getMonth()).toBe(5);
      expect(result.cycleStart.getDate()).toBe(20);
    });

    it("falls back to calendar year when no anniversary date", () => {
      const ref = new Date(2026, 6, 15);
      const result = getCurrentCycleBounds("annual_anniversary", ref, null);
      expect(result.periodKey).toBe("2026-ANN");
      expect(result.cycleStart).toEqual(new Date(2026, 0, 1));
    });
  });

  describe("quarterly_q1", () => {
    it("returns Q1 bounds (Jan-Mar)", () => {
      const ref = new Date(2026, 1, 15); // Feb 15
      const result = getCurrentCycleBounds("quarterly_q1", ref);
      expect(result.periodKey).toBe("2026-Q1");
      expect(result.cycleStart).toEqual(new Date(2026, 0, 1));
      expect(result.cycleEnd.getMonth()).toBe(2); // March
      expect(result.cycleEnd.getDate()).toBe(31);
    });
  });

  describe("quarterly_q2", () => {
    it("returns Q2 bounds (Apr-Jun)", () => {
      const ref = new Date(2026, 4, 10); // May 10
      const result = getCurrentCycleBounds("quarterly_q2", ref);
      expect(result.periodKey).toBe("2026-Q2");
      expect(result.cycleStart).toEqual(new Date(2026, 3, 1));
      expect(result.cycleEnd.getMonth()).toBe(5); // June
      expect(result.cycleEnd.getDate()).toBe(30);
    });
  });

  describe("quarterly_q3", () => {
    it("returns Q3 bounds (Jul-Sep)", () => {
      const ref = new Date(2026, 7, 20); // Aug 20
      const result = getCurrentCycleBounds("quarterly_q3", ref);
      expect(result.periodKey).toBe("2026-Q3");
      expect(result.cycleStart).toEqual(new Date(2026, 6, 1));
      expect(result.cycleEnd.getMonth()).toBe(8); // September
      expect(result.cycleEnd.getDate()).toBe(30);
    });
  });

  describe("quarterly_q4", () => {
    it("returns Q4 bounds (Oct-Dec)", () => {
      const ref = new Date(2026, 10, 5); // Nov 5
      const result = getCurrentCycleBounds("quarterly_q4", ref);
      expect(result.periodKey).toBe("2026-Q4");
      expect(result.cycleStart).toEqual(new Date(2026, 9, 1));
      expect(result.cycleEnd.getMonth()).toBe(11); // December
      expect(result.cycleEnd.getDate()).toBe(31);
    });
  });

  describe("quadrennial", () => {
    it("returns 4-year bounds", () => {
      const ref = new Date(2026, 0, 1);
      const result = getCurrentCycleBounds("quadrennial", ref);
      expect(result.periodKey).toBe("2024-Q4");
      expect(result.cycleStart).toEqual(new Date(2024, 0, 1));
      expect(result.cycleEnd.getFullYear()).toBe(2027);
    });

    it("handles year at boundary", () => {
      const ref = new Date(2028, 6, 1);
      const result = getCurrentCycleBounds("quadrennial", ref);
      expect(result.periodKey).toBe("2028-Q4");
      expect(result.cycleStart).toEqual(new Date(2028, 0, 1));
    });
  });

  describe("subscription", () => {
    it("returns a wide range", () => {
      const result = getCurrentCycleBounds("subscription");
      expect(result.periodKey).toBe("SUB");
      expect(result.cycleStart.getFullYear()).toBe(2000);
      expect(result.cycleEnd.getFullYear()).toBe(2099);
    });
  });
});

describe("getPreviousCycleBounds", () => {
  it("returns previous month for monthly cycle", () => {
    const ref = new Date(2026, 2, 15); // March
    const result = getPreviousCycleBounds("monthly", ref);
    expect(result.periodKey).toBe("2026-02");
  });

  it("wraps to previous year for January", () => {
    const ref = new Date(2026, 0, 15);
    const result = getPreviousCycleBounds("monthly", ref);
    expect(result.periodKey).toBe("2025-12");
  });

  it("returns H2 of previous year for biannual_h1", () => {
    const ref = new Date(2026, 3, 1);
    const result = getPreviousCycleBounds("biannual_h1", ref);
    expect(result.periodKey).toBe("2025-H2");
  });

  it("returns H1 of same year for biannual_h2", () => {
    const ref = new Date(2026, 9, 1);
    const result = getPreviousCycleBounds("biannual_h2", ref);
    expect(result.periodKey).toBe("2026-H1");
  });

  it("returns Q4 of prior year for quarterly_q1", () => {
    const ref = new Date(2026, 1, 15);
    const result = getPreviousCycleBounds("quarterly_q1", ref);
    expect(result.periodKey).toBe("2025-Q4");
  });

  it("returns Q1 of same year for quarterly_q2", () => {
    const ref = new Date(2026, 4, 15);
    const result = getPreviousCycleBounds("quarterly_q2", ref);
    expect(result.periodKey).toBe("2026-Q1");
  });

  it("returns Q2 of same year for quarterly_q3", () => {
    const ref = new Date(2026, 7, 15);
    const result = getPreviousCycleBounds("quarterly_q3", ref);
    expect(result.periodKey).toBe("2026-Q2");
  });

  it("returns Q3 of same year for quarterly_q4", () => {
    const ref = new Date(2026, 10, 15);
    const result = getPreviousCycleBounds("quarterly_q4", ref);
    expect(result.periodKey).toBe("2026-Q3");
  });
});

describe("daysRemainingInCycle", () => {
  it("returns correct days for monthly cycle", () => {
    const ref = new Date(2026, 0, 1); // Jan 1
    const days = daysRemainingInCycle("monthly", ref);
    expect(days).toBe(31); // 31 days in January, including Jan 1 to end
  });

  it("returns 0 at end of cycle", () => {
    const ref = new Date(2026, 0, 31, 23, 59, 59, 999);
    const days = daysRemainingInCycle("monthly", ref);
    expect(days).toBe(0);
  });
});

describe("isDateInCycle", () => {
  it("returns true for date within monthly cycle", () => {
    const date = new Date(2026, 0, 15);
    const ref = new Date(2026, 0, 1);
    expect(isDateInCycle(date, "monthly", ref)).toBe(true);
  });

  it("returns false for date outside monthly cycle", () => {
    const date = new Date(2026, 1, 1);
    const ref = new Date(2026, 0, 1);
    expect(isDateInCycle(date, "monthly", ref)).toBe(false);
  });

  it("returns true for date at cycle start", () => {
    const date = new Date(2026, 0, 1);
    const ref = new Date(2026, 0, 15);
    expect(isDateInCycle(date, "monthly", ref)).toBe(true);
  });

  it("returns true for Q1 date in Q1 cycle", () => {
    const date = new Date(2026, 1, 15); // Feb 15
    const ref = new Date(2026, 1, 15);
    expect(isDateInCycle(date, "quarterly_q1", ref)).toBe(true);
  });

  it("returns false for Q2 date in Q1 cycle", () => {
    const date = new Date(2026, 4, 1); // May 1
    const ref = new Date(2026, 1, 15); // Feb 15
    expect(isDateInCycle(date, "quarterly_q1", ref)).toBe(false);
  });
});
