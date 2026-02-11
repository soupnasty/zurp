import type { BenefitCycle, CycleBounds } from "@/lib/types";

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

  switch (cycle) {
    case "monthly": {
      const year = ref.getFullYear();
      const month = ref.getMonth();
      const cycleStart = new Date(year, month, 1);
      const cycleEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);
      const periodKey = `${year}-${String(month + 1).padStart(2, "0")}`;
      return { periodKey, cycleStart, cycleEnd };
    }

    case "biannual_h1": {
      const year = ref.getFullYear();
      return {
        periodKey: `${year}-H1`,
        cycleStart: new Date(year, 0, 1),
        cycleEnd: new Date(year, 5, 30, 23, 59, 59, 999),
      };
    }

    case "biannual_h2": {
      const year = ref.getFullYear();
      return {
        periodKey: `${year}-H2`,
        cycleStart: new Date(year, 6, 1),
        cycleEnd: new Date(year, 11, 31, 23, 59, 59, 999),
      };
    }

    case "quarterly_q1": {
      const year = ref.getFullYear();
      return {
        periodKey: `${year}-Q1`,
        cycleStart: new Date(year, 0, 1),
        cycleEnd: new Date(year, 2, 31, 23, 59, 59, 999),
      };
    }

    case "quarterly_q2": {
      const year = ref.getFullYear();
      return {
        periodKey: `${year}-Q2`,
        cycleStart: new Date(year, 3, 1),
        cycleEnd: new Date(year, 5, 30, 23, 59, 59, 999),
      };
    }

    case "quarterly_q3": {
      const year = ref.getFullYear();
      return {
        periodKey: `${year}-Q3`,
        cycleStart: new Date(year, 6, 1),
        cycleEnd: new Date(year, 8, 30, 23, 59, 59, 999),
      };
    }

    case "quarterly_q4": {
      const year = ref.getFullYear();
      return {
        periodKey: `${year}-Q4`,
        cycleStart: new Date(year, 9, 1),
        cycleEnd: new Date(year, 11, 31, 23, 59, 59, 999),
      };
    }

    case "annual_calendar": {
      const year = ref.getFullYear();
      return {
        periodKey: `${year}`,
        cycleStart: new Date(year, 0, 1),
        cycleEnd: new Date(year, 11, 31, 23, 59, 59, 999),
      };
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

  switch (cycle) {
    case "monthly": {
      const prevMonth = new Date(ref.getFullYear(), ref.getMonth() - 1, 1);
      return getCurrentCycleBounds(cycle, prevMonth);
    }

    case "biannual_h1": {
      // Previous is H2 of prior year
      const prevRef = new Date(ref.getFullYear() - 1, 7, 1);
      return getCurrentCycleBounds("biannual_h2", prevRef);
    }

    case "biannual_h2": {
      // Previous is H1 of same year
      const prevRef = new Date(ref.getFullYear(), 1, 1);
      return getCurrentCycleBounds("biannual_h1", prevRef);
    }

    case "quarterly_q1": {
      // Previous is Q4 of prior year
      const prevRef = new Date(ref.getFullYear() - 1, 10, 1);
      return getCurrentCycleBounds("quarterly_q4", prevRef);
    }

    case "quarterly_q2": {
      // Previous is Q1 of same year
      const prevRef = new Date(ref.getFullYear(), 1, 1);
      return getCurrentCycleBounds("quarterly_q1", prevRef);
    }

    case "quarterly_q3": {
      // Previous is Q2 of same year
      const prevRef = new Date(ref.getFullYear(), 4, 1);
      return getCurrentCycleBounds("quarterly_q2", prevRef);
    }

    case "quarterly_q4": {
      // Previous is Q3 of same year
      const prevRef = new Date(ref.getFullYear(), 7, 1);
      return getCurrentCycleBounds("quarterly_q3", prevRef);
    }

    case "annual_calendar": {
      const prevRef = new Date(ref.getFullYear() - 1, 6, 1);
      return getCurrentCycleBounds(cycle, prevRef);
    }

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
