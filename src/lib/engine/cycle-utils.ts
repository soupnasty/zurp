import type { BenefitCycle, CycleBounds } from "@/lib/types";

/** Fixed-range cycles: extract year, return a constant month range. */
const FIXED_RANGES: Partial<
  Record<
    BenefitCycle,
    { suffix: string; startMonth: number; endMonth: number; endDay: number }
  >
> = {
  biannual_h1: { suffix: "-H1", startMonth: 0, endMonth: 5, endDay: 30 },
  biannual_h2: { suffix: "-H2", startMonth: 6, endMonth: 11, endDay: 31 },
  quarterly_q1: { suffix: "-Q1", startMonth: 0, endMonth: 2, endDay: 31 },
  quarterly_q2: { suffix: "-Q2", startMonth: 3, endMonth: 5, endDay: 30 },
  quarterly_q3: { suffix: "-Q3", startMonth: 6, endMonth: 8, endDay: 30 },
  quarterly_q4: { suffix: "-Q4", startMonth: 9, endMonth: 11, endDay: 31 },
  annual_calendar: { suffix: "", startMonth: 0, endMonth: 11, endDay: 31 },
};

/** Previous-cycle mapping: which cycle to query and at what reference date. */
const PREV_CYCLE_MAP: Partial<
  Record<
    BenefitCycle,
    { prevCycle: BenefitCycle; getRef: (r: Date) => Date }
  >
> = {
  monthly: {
    prevCycle: "monthly",
    getRef: (r) => new Date(r.getFullYear(), r.getMonth() - 1, 1),
  },
  biannual_h1: {
    prevCycle: "biannual_h2",
    getRef: (r) => new Date(r.getFullYear() - 1, 7, 1),
  },
  biannual_h2: {
    prevCycle: "biannual_h1",
    getRef: (r) => new Date(r.getFullYear(), 1, 1),
  },
  quarterly_q1: {
    prevCycle: "quarterly_q4",
    getRef: (r) => new Date(r.getFullYear() - 1, 10, 1),
  },
  quarterly_q2: {
    prevCycle: "quarterly_q1",
    getRef: (r) => new Date(r.getFullYear(), 1, 1),
  },
  quarterly_q3: {
    prevCycle: "quarterly_q2",
    getRef: (r) => new Date(r.getFullYear(), 4, 1),
  },
  quarterly_q4: {
    prevCycle: "quarterly_q3",
    getRef: (r) => new Date(r.getFullYear(), 7, 1),
  },
  annual_calendar: {
    prevCycle: "annual_calendar",
    getRef: (r) => new Date(r.getFullYear() - 1, 6, 1),
  },
};

/**
 * Get the current cycle bounds for a benefit.
 *
 * @param cycle - The benefit's cycle type
 * @param referenceDate - The date to compute the cycle for (defaults to now)
 * @param anniversaryDate - Required for "annual_anniversary" cycle
 * @returns CycleBounds with periodKey, cycleStart, cycleEnd
 */
export function getCurrentCycleBounds(
  cycle: BenefitCycle,
  referenceDate: Date = new Date(),
  anniversaryDate?: Date | null
): CycleBounds {
  const ref = new Date(referenceDate);

  // Handle the 7 fixed-range cycles via lookup
  const fixed = FIXED_RANGES[cycle];
  if (fixed) {
    const year = ref.getFullYear();
    return {
      periodKey: `${year}${fixed.suffix}`,
      cycleStart: new Date(year, fixed.startMonth, 1),
      cycleEnd: new Date(
        year,
        fixed.endMonth,
        fixed.endDay,
        23,
        59,
        59,
        999
      ),
    };
  }

  // Special cases with unique logic
  switch (cycle) {
    case "monthly": {
      const year = ref.getFullYear();
      const month = ref.getMonth();
      const cycleStart = new Date(year, month, 1);
      const cycleEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);
      const periodKey = `${year}-${String(month + 1).padStart(2, "0")}`;
      return { periodKey, cycleStart, cycleEnd };
    }

    case "annual_anniversary": {
      if (!anniversaryDate) {
        // Fallback to calendar year if no anniversary date
        const year = ref.getFullYear();
        return {
          periodKey: `${year}-ANN`,
          cycleStart: new Date(year, 0, 1),
          cycleEnd: new Date(year, 11, 31, 23, 59, 59, 999),
        };
      }

      const annMonth = anniversaryDate.getMonth();
      const annDay = anniversaryDate.getDate();

      // Find the most recent anniversary date relative to referenceDate
      let cycleStartYear = ref.getFullYear();
      let cycleStart = new Date(cycleStartYear, annMonth, annDay);

      if (cycleStart > ref) {
        cycleStartYear--;
        cycleStart = new Date(cycleStartYear, annMonth, annDay);
      }

      const cycleEnd = new Date(
        cycleStartYear + 1,
        annMonth,
        annDay - 1,
        23,
        59,
        59,
        999
      );

      return {
        periodKey: `${cycleStartYear}-ANN`,
        cycleStart,
        cycleEnd,
      };
    }

    case "quadrennial": {
      // 4-year cycle starting from the calendar year
      const year = ref.getFullYear();
      const cycleStartYear = year - (year % 4);
      return {
        periodKey: `${cycleStartYear}-Q4`,
        cycleStart: new Date(cycleStartYear, 0, 1),
        cycleEnd: new Date(
          cycleStartYear + 3,
          11,
          31,
          23,
          59,
          59,
          999
        ),
      };
    }

    case "subscription": {
      // Subscriptions don't have cycles in the traditional sense
      // Return a wide range
      return {
        periodKey: "SUB",
        cycleStart: new Date(2000, 0, 1),
        cycleEnd: new Date(2099, 11, 31, 23, 59, 59, 999),
      };
    }

    default:
      throw new Error(`Unknown cycle type: ${cycle}`);
  }
}

/**
 * Get the previous cycle bounds (for carryover calculations).
 */
export function getPreviousCycleBounds(
  cycle: BenefitCycle,
  referenceDate: Date = new Date(),
  anniversaryDate?: Date | null
): CycleBounds {
  const ref = new Date(referenceDate);

  // Handle the 8 simple delegate cases via lookup
  const mapping = PREV_CYCLE_MAP[cycle];
  if (mapping) {
    return getCurrentCycleBounds(mapping.prevCycle, mapping.getRef(ref), anniversaryDate);
  }

  // Special cases with unique logic
  switch (cycle) {
    case "annual_anniversary": {
      if (!anniversaryDate) {
        const prevRef = new Date(ref.getFullYear() - 1, 6, 1);
        return getCurrentCycleBounds(cycle, prevRef);
      }
      const current = getCurrentCycleBounds(cycle, ref, anniversaryDate);
      const prevRef = new Date(current.cycleStart);
      prevRef.setDate(prevRef.getDate() - 1);
      return getCurrentCycleBounds(cycle, prevRef, anniversaryDate);
    }

    case "quadrennial": {
      const current = getCurrentCycleBounds(cycle, ref);
      const prevRef = new Date(current.cycleStart);
      prevRef.setFullYear(prevRef.getFullYear() - 1);
      return getCurrentCycleBounds(cycle, prevRef);
    }

    case "subscription":
      return getCurrentCycleBounds(cycle, ref);

    default:
      throw new Error(`Unknown cycle type: ${cycle}`);
  }
}

/**
 * Days remaining in the current cycle.
 */
export function daysRemainingInCycle(
  cycle: BenefitCycle,
  referenceDate: Date = new Date(),
  anniversaryDate?: Date | null
): number {
  const { cycleEnd } = getCurrentCycleBounds(cycle, referenceDate, anniversaryDate);
  const ref = new Date(referenceDate);
  const diffMs = cycleEnd.getTime() - ref.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

/**
 * Check if a date falls within a cycle's bounds.
 */
export function isDateInCycle(
  date: Date,
  cycle: BenefitCycle,
  referenceDate: Date = new Date(),
  anniversaryDate?: Date | null
): boolean {
  const { cycleStart, cycleEnd } = getCurrentCycleBounds(
    cycle,
    referenceDate,
    anniversaryDate
  );
  return date >= cycleStart && date <= cycleEnd;
}
