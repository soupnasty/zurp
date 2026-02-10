import { normalizeMerchantName } from "@/lib/engine/normalize";
import type {
  EarnConfig,
  EarnCategory,
  BonusCategory,
  CapState,
  TransactionEarnResult,
  CategoryConfidence,
} from "./types";

interface CalculatorTransaction {
  id: string;
  merchantName: string | null;
  amount: number;
  category: EarnCategory;
  confidence: CategoryConfidence;
}

/**
 * Check if a bonus category's conditions match a transaction.
 */
function matchesConditions(
  bonus: BonusCategory,
  normalizedMerchant: string,
  amount: number
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
  amount: number
): { earnRate: number; bonusLabel: string | null } {
  for (const bonus of config.bonusCategories) {
    if (!bonus.categories.includes(category)) continue;
    if (!matchesConditions(bonus, normalizedMerchant, amount)) continue;
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
    absAmount
  );

  const cap = findCap(config, tx.category);

  // No cap applicable — straightforward calculation
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
    capState[cap.capId] = { spendToDate: 0, maxSpend: cap.maxSpend };
  }
  const state = capState[cap.capId];

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
    // Cap already hit — earn at base rate
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
