/**
 * Chase Freedom Flex rotating 5% quarterly categories.
 *
 * Chase publishes these in advance each quarter. Each quarter has a $1,500
 * spending cap at 5x. After that, purchases in the rotating categories
 * earn at the CFF base rate (1x).
 *
 * To add a new quarter: append an entry to CFF_ROTATING_QUARTERS with the
 * quarter key, date range, and categories. Categories should map to the
 * 26-category EarnCategory taxonomy.
 */

import type { BonusCategory, EarnCap, EarnCategory } from "./types";

export interface RotatingQuarterEntry {
  quarter: string; // e.g. "2024_Q1"
  startDate: string; // ISO "YYYY-MM-DD"
  endDate: string; // ISO "YYYY-MM-DD"
  categories: EarnCategory[];
  label: string; // Human-readable, e.g. "Grocery stores"
}

/**
 * Historical and current CFF rotating categories.
 * Sources: Chase Freedom calendar announcements.
 */
const CFF_ROTATING_QUARTERS: RotatingQuarterEntry[] = [
  // ── 2024 ──
  {
    quarter: "2024_Q1",
    startDate: "2024-01-01",
    endDate: "2024-03-31",
    categories: ["groceries", "grocery_online"],
    label: "Grocery stores",
  },
  {
    quarter: "2024_Q2",
    startDate: "2024-04-01",
    endDate: "2024-06-30",
    categories: ["gas_stations", "home_improvement"],
    label: "Gas stations & home improvement",
  },
  {
    quarter: "2024_Q3",
    startDate: "2024-07-01",
    endDate: "2024-09-30",
    categories: ["dining", "coffee", "food_delivery"],
    label: "Restaurants & dining",
  },
  {
    quarter: "2024_Q4",
    startDate: "2024-10-01",
    endDate: "2024-12-31",
    categories: ["wholesale_clubs", "shopping_online"],
    label: "Wholesale clubs & select online",
  },

  // ── 2025 ──
  {
    quarter: "2025_Q1",
    startDate: "2025-01-01",
    endDate: "2025-03-31",
    categories: ["groceries", "grocery_online"],
    label: "Grocery stores",
  },
  {
    quarter: "2025_Q2",
    startDate: "2025-04-01",
    endDate: "2025-06-30",
    categories: ["gas_stations", "home_improvement"],
    label: "Gas stations & home improvement",
  },
  {
    quarter: "2025_Q3",
    startDate: "2025-07-01",
    endDate: "2025-09-30",
    categories: ["dining", "coffee", "food_delivery"],
    label: "Restaurants & dining",
  },
  {
    quarter: "2025_Q4",
    startDate: "2025-10-01",
    endDate: "2025-12-31",
    categories: ["wholesale_clubs", "shopping_online"],
    label: "Wholesale clubs & select online",
  },

  // ── 2026 ──
  {
    quarter: "2026_Q1",
    startDate: "2026-01-01",
    endDate: "2026-03-31",
    categories: ["groceries", "grocery_online"],
    label: "Grocery stores",
  },
];

/**
 * Build BonusCategory + EarnCap entries for CFF rotating categories.
 *
 * Each quarter produces:
 * - A BonusCategory at 5x with a date_range condition
 * - An EarnCap with $1,500 max spend and a unique capId per quarter
 *
 * The unique capId per quarter ensures cap tracking is independent across
 * quarters. The date_range condition ensures only transactions within that
 * quarter match the bonus, so cap accumulation is naturally scoped.
 */
export function buildCFFRotatingBonuses(): {
  bonuses: BonusCategory[];
  caps: EarnCap[];
} {
  const bonuses: BonusCategory[] = [];
  const caps: EarnCap[] = [];

  for (const entry of CFF_ROTATING_QUARTERS) {
    bonuses.push({
      categories: entry.categories,
      earnRate: 5,
      label: `5% Rotating \u2014 ${entry.label}`,
      conditions: {
        date_range: {
          start: entry.startDate,
          end: entry.endDate,
        },
      },
    });

    caps.push({
      capId: `cff_rotating_${entry.quarter}`,
      categories: entry.categories,
      maxSpend: 1500,
      period: "calendar_year", // Tracked per-quarter via unique capId
    });
  }

  return { bonuses, caps };
}
