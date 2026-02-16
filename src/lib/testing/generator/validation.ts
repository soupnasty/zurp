/**
 * Post-Generation Validation
 *
 * Validates generated transaction fixtures against the persona spec
 * and the actual normalization/classification engine. Catches issues
 * before fixtures are written.
 */

import type { Persona, GeneratedTransaction } from "./types";
import type { MerchantTemplate } from "../merchants/types";
import { getMerchantByKey } from "../merchants";

export interface ValidationResult {
  passed: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  stats: ValidationStats;
}

export interface ValidationError {
  txId: string;
  check: string;
  details: string;
}

export interface ValidationWarning {
  txId: string;
  check: string;
  details: string;
}

export interface ValidationStats {
  totalTransactions: number;
  uniqueMerchants: number;
  dateRange: { earliest: string; latest: string };
  categoryCounts: Record<string, number>;
  benefitTargetCounts: Record<string, number>;
  edgeCaseCounts: Record<string, number>;
  competitorTransactions: number;
}

/**
 * Validate a generated transaction set against the persona and schema.
 */
export function validateFixture(
  transactions: GeneratedTransaction[],
  persona: Persona,
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // ── 1. Schema validation ──
  for (const tx of transactions) {
    if (!tx.id) {
      errors.push({ txId: tx.id ?? "unknown", check: "missing_id", details: "Transaction missing ID" });
    }
    if (!tx.date || !/^\d{4}-\d{2}-\d{2}$/.test(tx.date)) {
      errors.push({ txId: tx.id, check: "invalid_date", details: `Invalid date format: "${tx.date}"` });
    }
    if (tx.amount === undefined || tx.amount < 0) {
      errors.push({ txId: tx.id, check: "invalid_amount", details: `Invalid amount: ${tx.amount}` });
    }
    if (tx.merchantName === null && tx.merchantNameRaw === null) {
      errors.push({ txId: tx.id, check: "no_merchant", details: "Both merchantName and merchantNameRaw are null" });
    }
  }

  // ── 2. Date range validation ──
  const windowStart = persona.generationWindow.start;
  const windowEnd = persona.generationWindow.end;
  for (const tx of transactions) {
    if (tx.date < windowStart || tx.date > windowEnd) {
      errors.push({
        txId: tx.id,
        check: "out_of_range",
        details: `Date ${tx.date} outside window [${windowStart}, ${windowEnd}]`,
      });
    }
  }

  // ── 3. Unique IDs ──
  const ids = new Set<string>();
  for (const tx of transactions) {
    if (ids.has(tx.id)) {
      errors.push({ txId: tx.id, check: "duplicate_id", details: "Duplicate transaction ID" });
    }
    ids.add(tx.id);
  }

  // ── 4. Benefit coverage ──
  const targetedBenefits = new Set(
    transactions
      .map((tx) => tx._meta.intendedBenefit)
      .filter(Boolean) as string[],
  );

  for (const bb of persona.benefitBehavior) {
    if (bb.behavior === "never_use" || bb.behavior === "passive") continue;
    if (!targetedBenefits.has(bb.benefitId)) {
      errors.push({
        txId: "N/A",
        check: "missing_benefit_coverage",
        details: `Benefit "${bb.benefitId}" has behavior "${bb.behavior}" but no transactions target it`,
      });
    }
  }

  // ── 5. Competitor coverage ──
  const competitorTxs = transactions.filter((tx) => tx._meta.isCompetitorSpend);
  for (const comp of persona.competitorSpend) {
    const matching = competitorTxs.filter((tx) =>
      tx._meta.recurringGroupId === `recurring_${comp.merchantKey}` ||
      tx._meta.competitorBenefitKey === comp.merchantKey ||
      tx.merchantName?.toLowerCase().includes(comp.competitorMerchant.toLowerCase()),
    );

    if (comp.recurring && matching.length < 3) {
      warnings.push({
        txId: "N/A",
        check: "insufficient_recurring",
        details: `Recurring competitor "${comp.competitorMerchant}" has ${matching.length} transactions (need 3+ for A2)`,
      });
    }

    if (!comp.recurring && matching.length === 0) {
      warnings.push({
        txId: "N/A",
        check: "missing_competitor",
        details: `One-time competitor "${comp.competitorMerchant}" has no transactions`,
      });
    }
  }

  // ── 6. Edge case coverage ──
  const edgeCaseTags = new Set(
    transactions
      .map((tx) => tx._meta.edgeCaseTag)
      .filter(Boolean) as string[],
  );

  for (const ec of persona.edgeCases) {
    // Some edge cases (near_cap, exceed_cap) don't generate standalone transactions
    const nonStandalone = ["near_cap", "exceed_cap", "cross_midnight", "pending_to_posted", "refund", "zero_amount"];
    if (nonStandalone.includes(ec.type)) continue;

    if (!edgeCaseTags.has(ec.type)) {
      warnings.push({
        txId: "N/A",
        check: "missing_edge_case",
        details: `Edge case "${ec.type}" not found in generated transactions`,
      });
    }
  }

  // ── 7. Monthly distribution check ──
  // Warn if any month has 0 transactions (possible gap)
  const monthCounts = new Map<string, number>();
  for (const tx of transactions) {
    const monthKey = tx.date.slice(0, 7); // "2025-03"
    monthCounts.set(monthKey, (monthCounts.get(monthKey) ?? 0) + 1);
  }

  const months = getMonthsInWindow(persona.generationWindow.start, persona.generationWindow.end);
  for (const m of months) {
    if (!monthCounts.has(m)) {
      warnings.push({
        txId: "N/A",
        check: "empty_month",
        details: `No transactions generated for month ${m}`,
      });
    }
  }

  // ── Stats ──
  const categoryCounts: Record<string, number> = {};
  const benefitTargetCounts: Record<string, number> = {};
  const edgeCaseCounts: Record<string, number> = {};
  const merchants = new Set<string>();

  for (const tx of transactions) {
    const cat = tx._meta.intendedCategory;
    categoryCounts[cat] = (categoryCounts[cat] ?? 0) + 1;

    if (tx._meta.intendedBenefit) {
      benefitTargetCounts[tx._meta.intendedBenefit] =
        (benefitTargetCounts[tx._meta.intendedBenefit] ?? 0) + 1;
    }

    if (tx._meta.edgeCaseTag) {
      edgeCaseCounts[tx._meta.edgeCaseTag] =
        (edgeCaseCounts[tx._meta.edgeCaseTag] ?? 0) + 1;
    }

    if (tx.merchantName) merchants.add(tx.merchantName);
  }

  const dates = transactions.map((tx) => tx.date).sort();

  return {
    passed: errors.length === 0,
    errors,
    warnings,
    stats: {
      totalTransactions: transactions.length,
      uniqueMerchants: merchants.size,
      dateRange: {
        earliest: dates[0] ?? "",
        latest: dates[dates.length - 1] ?? "",
      },
      categoryCounts,
      benefitTargetCounts,
      edgeCaseCounts,
      competitorTransactions: competitorTxs.length,
    },
  };
}

function getMonthsInWindow(start: string, end: string): string[] {
  const months: string[] = [];
  // Parse YYYY-MM-DD strings directly to avoid timezone issues
  // (new Date("2025-01-01") parses as UTC midnight, which is Dec 31 in US timezones)
  const [startYear, startMonth] = start.split("-").map(Number);
  const [endYear, endMonth] = end.split("-").map(Number);

  let year = startYear;
  let month = startMonth - 1; // Convert 1-indexed to 0-indexed

  while (year < endYear || (year === endYear && month <= endMonth - 1)) {
    months.push(`${year}-${String(month + 1).padStart(2, "0")}`);
    month++;
    if (month > 11) {
      month = 0;
      year++;
    }
  }

  return months;
}
