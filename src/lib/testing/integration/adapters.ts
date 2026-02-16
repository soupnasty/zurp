/**
 * Type Adapters
 *
 * Convert GeneratedTransaction into the shapes each production engine expects.
 */

import type { GeneratedTransaction } from "../generator/types";
import type { Persona } from "../generator/types";
import type {
  MatcherTransaction,
  MatcherConfig,
  CardDefinition,
} from "../../types";
import type {
  EarnCategory,
  CategoryConfidence,
  CategoryAssignment,
  EarnConfig,
  CapState,
} from "../../points/types";

// CalculatorTransaction is not exported from calculator.ts — redefine here
export interface CalculatorTransaction {
  id: string;
  merchantName: string | null;
  amount: number;
  category: EarnCategory;
  confidence: CategoryConfidence;
  date?: Date;
  datetime?: Date | null;
}

/** Parse "YYYY-MM-DD" to a local-time Date (avoids UTC midnight timezone shift) */
function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Convert GeneratedTransaction → MatcherTransaction.
 * Key conversion: date string → Date object.
 */
export function toMatcherTx(tx: GeneratedTransaction): MatcherTransaction {
  return {
    id: tx.id,
    date: parseLocalDate(tx.date),
    merchantName: tx.merchantName,
    merchantNameRaw: tx.merchantNameRaw,
    amount: tx.amount,
    plaidCategoryPrimary: tx.plaidCategoryPrimary,
    plaidCategoryDetailed: tx.plaidCategoryDetailed,
    pending: tx.pending,
    matchedStatus: "unmatched",
  };
}

/**
 * Convert GeneratedTransaction + CategoryAssignment → CalculatorTransaction.
 */
export function toCalculatorTx(
  tx: GeneratedTransaction,
  assignment: CategoryAssignment,
): CalculatorTransaction {
  return {
    id: tx.id,
    merchantName: tx.merchantName,
    amount: tx.amount,
    category: assignment.category,
    confidence: assignment.confidence,
    date: parseLocalDate(tx.date),
    datetime: tx.datetime ? new Date(tx.datetime) : null,
  };
}

/**
 * Build MatcherConfig from card definition and persona.
 */
export function buildMatcherConfig(
  cardDef: CardDefinition,
  persona: Persona,
): MatcherConfig {
  return {
    benefits: cardDef.benefits,
    usageMap: new Map<string, number>(),
    anniversaryDate: persona.anniversaryDate
      ? (() => {
          const [y, m, d] = persona.anniversaryDate!.split("-").map(Number);
          return new Date(y, m - 1, d);
        })()
      : null,
    referenceDate: new Date(2025, 6, 1), // Mid-year reference (July 1)
  };
}

/**
 * Build initial CapState from an EarnConfig (all caps start at 0 spend).
 */
export function buildCapState(earnConfig: EarnConfig): CapState {
  const state: CapState = {};
  for (const cap of earnConfig.caps) {
    state[cap.capId] = {
      spendToDate: 0,
      maxSpend: cap.maxSpend,
      currentYear: 2025,
    };
  }
  return state;
}
