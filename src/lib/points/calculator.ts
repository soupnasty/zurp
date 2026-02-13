import { normalizeMerchantName } from "@/lib/engine/normalize";
import type {
  EarnConfig,
  EarnCategory,
  BonusCategory,
  CapState,
  TransactionEarnResult,
  CategoryConfidence,
  TimeWindow,
} from "./types";

interface CalculatorTransaction {
  id: string;
  merchantName: string | null;
  amount: number;
  category: EarnCategory;
  confidence: CategoryConfidence;
  date?: Date;
  datetime?: Date | null;
}

/**
 * Extract day-of-week (0=Sun..6=Sat) and hour (0-23) in a given IANA timezone.
 */
export function getDatePartsInTimezone(
  date: Date,
  timezone: string
): { dayOfWeek: number; hour: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
    hour: "numeric",
    hour12: false,
  }).formatToParts(date);

  const weekdayStr = parts.find((p) => p.type === "weekday")?.value ?? "";
  const hourStr = parts.find((p) => p.type === "hour")?.value ?? "0";

  const dayMap: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  };

  return {
    dayOfWeek: dayMap[weekdayStr] ?? 0,
    hour: parseInt(hourStr, 10) % 24, // "24" can appear for midnight in some locales
  };
}

/**
 * Check if a given day+hour falls within a time window.
 * Handles overnight windows where startHour >= endHour.
 */
export function matchesTimeWindow(
  day: number,
  hour: number,
  tw: TimeWindow
): boolean {
  const isOvernight = tw.startHour >= tw.endHour;

  for (const startDay of tw.days) {
    if (isOvernight) {
      // Window spans: startDay@startHour -> (startDay+1)@endHour
      const nextDay = (startDay + 1) % 7;
      if (day === startDay && hour >= tw.startHour) return true;
      if (day === nextDay && hour < tw.endHour) return true;
    } else {
      // Same-day window: startDay@startHour -> startDay@endHour
      if (day === startDay && hour >= tw.startHour && hour < tw.endHour) return true;
    }
  }

  return false;
}

/**
 * Check if a bonus category's conditions match a transaction.
 */
function matchesConditions(
  bonus: BonusCategory,
  normalizedMerchant: string,
  amount: number,
  date?: Date,
  datetime?: Date | null
): boolean {
  const cond = bonus.conditions;
  if (!cond) return true;

  if (cond.merchant_match) {
    const matches = cond.merchant_match.some((p) =>
      normalizedMerchant.includes(p)
    );
    if (!matches) return false;
  }

  if (cond.merchant_exclude) {
    const excluded = cond.merchant_exclude.some((p) =>
      normalizedMerchant.includes(p)
    );
    if (excluded) return false;
  }

  if (cond.amount_gte !== undefined && amount < cond.amount_gte) return false;
  if (cond.amount_lt !== undefined && amount >= cond.amount_lt) return false;

  if (cond.date_range) {
    // Check if transaction falls within the date range (e.g., CFF rotating quarter)
    const txDate = (datetime ?? date);
    if (txDate) {
      const txDateStr = txDate.toISOString().split("T")[0]; // "YYYY-MM-DD"
      if (txDateStr < cond.date_range.start || txDateStr > cond.date_range.end) return false;
    }
    // If no date available, skip check (backward compat)
  }

  if (cond.time_window) {
    const tw = cond.time_window;
    if (datetime) {
      // Exact check: convert to target timezone, check day + hour
      const { dayOfWeek, hour } = getDatePartsInTimezone(datetime, tw.timezone);
      if (!matchesTimeWindow(dayOfWeek, hour, tw)) return false;
    } else if (date) {
      // Fallback: day-of-week only from date (can't check hour).
      // Use local day: neon-http returns timestamp dates at UTC midnight of
      // the NEXT day, so getUTCDay() is shifted +1. getDay() matches the
      // correct calendar day-of-week.
      const dayOfWeek = date.getDay();
      // Check if this day is a start day for the window
      if (tw.days.includes(dayOfWeek)) return true;
      // For overnight windows, also match the NEXT day (the endHour portion)
      if (tw.startHour >= tw.endHour) {
        const prevDay = (dayOfWeek + 6) % 7;
        if (tw.days.includes(prevDay)) return true;
      }
      // Day doesn't match any window
      return false;
    }
    // If neither date nor datetime available, skip check (backward compat)
  }

  return true;
}

/**
 * Find the applicable earn rate for a transaction given a card config.
 * Checks bonus categories in order, falling back to base rate.
 */
function findEarnRate(
  config: EarnConfig,
  category: EarnCategory,
  normalizedMerchant: string,
  amount: number,
  date?: Date,
  datetime?: Date | null
): { earnRate: number; bonusLabel: string | null } {
  for (const bonus of config.bonusCategories) {
    if (!bonus.categories.includes(category)) continue;
    if (!matchesConditions(bonus, normalizedMerchant, amount, date, datetime)) continue;
    return { earnRate: bonus.earnRate, bonusLabel: bonus.label };
  }
  return { earnRate: config.baseRate, bonusLabel: null };
}

/**
 * Find the applicable cap for a category, if any.
 */
function findCap(config: EarnConfig, category: EarnCategory) {
  return config.caps.find((cap) => cap.categories.includes(category));
}

/**
 * Calculate points earned on a single transaction for a given card config.
 * Handles cap tracking for capped categories (e.g., Gold grocery $25K).
 */
export function calculatePointsForTransaction(
  tx: CalculatorTransaction,
  config: EarnConfig,
  capState: CapState
): TransactionEarnResult {
  const normalizedMerchant = normalizeMerchantName(tx.merchantName);
  const absAmount = Math.abs(tx.amount);
  const isRefund = tx.amount < 0;

  const { earnRate: bonusRate, bonusLabel } = findEarnRate(
    config,
    tx.category,
    normalizedMerchant,
    absAmount,
    tx.date,
    tx.datetime
  );

  const cap = findCap(config, tx.category);

  // No cap applicable -- straightforward calculation
  if (!cap || bonusRate === config.baseRate) {
    const points = isRefund
      ? -Math.round(absAmount * bonusRate)
      : Math.round(absAmount * bonusRate);
    return {
      transactionId: tx.id,
      category: tx.category,
      confidence: tx.confidence,
      amount: tx.amount,
      earnRate: bonusRate,
      points,
      bonusLabel,
      capApplied: false,
    };
  }

  // Cap tracking
  if (!capState[cap.capId]) {
    capState[cap.capId] = {
      spendToDate: 0,
      maxSpend: cap.maxSpend,
      currentYear: tx.date?.getFullYear(),
    };
  }
  const state = capState[cap.capId];

  // Calendar year cap reset: if transaction is in a new year, reset accumulator.
  // Caps with period "calendar_year" reset each Jan 1 (e.g., Gold $25K grocery).
  const txYear = tx.date?.getFullYear();
  if (txYear && state.currentYear !== undefined && state.currentYear !== txYear) {
    state.spendToDate = 0;
    state.currentYear = txYear;
  }

  if (isRefund) {
    // Refunds reduce spend toward cap and subtract bonus points
    state.spendToDate = Math.max(0, state.spendToDate - absAmount);
    const points = -Math.round(absAmount * bonusRate);
    return {
      transactionId: tx.id,
      category: tx.category,
      confidence: tx.confidence,
      amount: tx.amount,
      earnRate: bonusRate,
      points,
      bonusLabel,
      capApplied: false,
    };
  }

  if (state.spendToDate >= state.maxSpend) {
    // Cap already hit -- earn at base rate
    const points = Math.round(absAmount * config.baseRate);
    return {
      transactionId: tx.id,
      category: tx.category,
      confidence: tx.confidence,
      amount: tx.amount,
      earnRate: config.baseRate,
      points,
      bonusLabel: null,
      capApplied: true,
    };
  }

  const remaining = state.maxSpend - state.spendToDate;

  if (absAmount <= remaining) {
    // Fully within cap
    state.spendToDate += absAmount;
    const points = Math.round(absAmount * bonusRate);
    return {
      transactionId: tx.id,
      category: tx.category,
      confidence: tx.confidence,
      amount: tx.amount,
      earnRate: bonusRate,
      points,
      bonusLabel,
      capApplied: false,
    };
  }

  // Split: partial bonus + partial base
  const bonusPortion = remaining;
  const basePortion = absAmount - remaining;
  state.spendToDate = state.maxSpend;
  const points = Math.round(bonusPortion * bonusRate + basePortion * config.baseRate);

  // Effective rate for the whole transaction
  const effectiveRate = points / absAmount;

  return {
    transactionId: tx.id,
    category: tx.category,
    confidence: tx.confidence,
    amount: tx.amount,
    earnRate: Math.round(effectiveRate * 100) / 100,
    points,
    bonusLabel,
    capApplied: true,
  };
}
