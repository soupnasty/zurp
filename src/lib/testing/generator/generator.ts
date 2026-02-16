/**
 * Transaction Generator
 *
 * Pure-function engine that composes realistic transaction histories from:
 * - A Persona definition (spending profile + benefit engagement)
 * - The Merchant Template Registry (deterministic merchant data)
 *
 * No LLM calls — fully deterministic. The LLM's role (future) would be
 * composing more nuanced personas, not generating merchant names.
 */

import type { Persona, GeneratedTransaction, EdgeCaseSpec } from "./types";
import type { MerchantTemplate } from "../merchants/types";
import { getMerchantByKey } from "../merchants";

// ─── Seeded Random ─────────────────────────────────────────────────
// Deterministic random for reproducible fixture generation.
// Uses a simple mulberry32 PRNG seeded from persona name.

function createRng(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i);
  }
  // mulberry32
  return () => {
    h |= 0;
    h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomInRange(rng: () => number, min: number, max: number): number {
  return Math.round((min + rng() * (max - min)) * 100) / 100;
}

function randomInt(rng: () => number, min: number, max: number): number {
  return Math.floor(min + rng() * (max - min + 1));
}

function pickRandom<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

// ─── Date Utilities ────────────────────────────────────────────────

function getMonthsInRange(
  start: string,
  end: string,
): { year: number; month: number }[] {
  const months: { year: number; month: number }[] = [];
  const startDate = new Date(start);
  const endDate = new Date(end);

  let year = startDate.getFullYear();
  let month = startDate.getMonth();

  while (year < endDate.getFullYear() || (year === endDate.getFullYear() && month <= endDate.getMonth())) {
    months.push({ year, month });
    month++;
    if (month > 11) {
      month = 0;
      year++;
    }
  }

  return months;
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function randomDateInMonth(
  rng: () => number,
  year: number,
  month: number,
): string {
  const maxDay = daysInMonth(year, month);
  const day = randomInt(rng, 1, maxDay);
  return formatDate(year, month, day);
}

// ─── Core Generator ────────────────────────────────────────────────

export interface GeneratorOptions {
  /** Override seed for reproducibility testing */
  seed?: string;
}

/**
 * Generate a full transaction history for a persona.
 *
 * 1. Generates monthly "regular" spending from the persona's spending profile
 * 2. Generates benefit-targeting transactions for "always_use" and "partial_use" benefits
 * 3. Generates competitor spending transactions
 * 4. Injects edge case transactions
 * 5. Sorts by date
 */
export function generateTransactions(
  persona: Persona,
  options: GeneratorOptions = {},
): GeneratedTransaction[] {
  const seed =
    options.seed ?? `${persona.cardType}_${persona.personaName}`;
  const rng = createRng(seed);
  const transactions: GeneratedTransaction[] = [];
  let seq = 0;

  const months = getMonthsInRange(
    persona.generationWindow.start,
    persona.generationWindow.end,
  );

  // ── Step 1: Regular spending from monthly profiles ──
  for (const { year, month } of months) {
    for (const profile of persona.monthlySpend) {
      // Fractional transactionsPerMonth: e.g., 0.5 = every other month
      const txCount =
        profile.transactionsPerMonth < 1
          ? rng() < profile.transactionsPerMonth
            ? 1
            : 0
          : Math.round(
              profile.transactionsPerMonth * (1 + (rng() - 0.5) * 0.3),
            );

      for (let i = 0; i < txCount; i++) {
        const merchantKey = pickRandom(rng, profile.merchantKeys);
        const template = getMerchantByKey(merchantKey);
        if (!template) continue;

        const varianceMultiplier =
          1 + (rng() - 0.5) * 2 * profile.variance;
        const avgPerTx =
          profile.avgAmount / Math.max(profile.transactionsPerMonth, 1);
        const amount = Math.max(
          template.amountRange.min,
          Math.min(
            template.amountRange.max,
            Math.round(avgPerTx * varianceMultiplier * 100) / 100,
          ),
        );

        const tx = buildTransaction(
          rng,
          template,
          randomDateInMonth(rng, year, month),
          seq++,
          persona,
          {
            intendedBenefit: null,
            intendedCategory: profile.category,
            edgeCaseTag: null,
            isCompetitorSpend: false,
            competitorBenefitKey: null,
            recurringGroupId: null,
          },
          amount,
        );
        transactions.push(tx);
      }
    }
  }

  // ── Step 2: Benefit-targeting transactions ──
  for (const bb of persona.benefitBehavior) {
    if (bb.behavior === "never_use") continue;

    // Find a suitable merchant for this benefit
    const benefitTxs = generateBenefitTransactions(
      rng,
      persona,
      bb,
      months,
      seq,
    );
    seq += benefitTxs.length;
    transactions.push(...benefitTxs);
  }

  // ── Step 3: Competitor spending ──
  for (const comp of persona.competitorSpend) {
    const template = getMerchantByKey(comp.merchantKey);
    if (!template) continue;

    if (comp.recurring) {
      // Generate monthly charges for A2 detection (need 3+ with ~30-day spacing)
      for (const { year, month } of months) {
        const amount = randomInRange(
          rng,
          comp.monthlyAmount * 0.8,
          comp.monthlyAmount * 1.2,
        );
        const tx = buildTransaction(
          rng,
          template,
          randomDateInMonth(rng, year, month),
          seq++,
          persona,
          {
            intendedBenefit: null,
            intendedCategory: template.expectedEarnCategory,
            edgeCaseTag: null,
            isCompetitorSpend: true,
            competitorBenefitKey: null,
            recurringGroupId: `recurring_${comp.merchantKey}`,
          },
          amount,
        );
        transactions.push(tx);
      }
    } else {
      // One-time competitor spend for A1 (generate 2-3 instances)
      const count = randomInt(rng, 2, 3);
      for (let i = 0; i < count; i++) {
        const { year, month } = pickRandom(rng, months);
        const amount = randomInRange(
          rng,
          comp.monthlyAmount * 0.5,
          comp.monthlyAmount * 1.5,
        );
        const tx = buildTransaction(
          rng,
          template,
          randomDateInMonth(rng, year, month),
          seq++,
          persona,
          {
            intendedBenefit: null,
            intendedCategory: template.expectedEarnCategory,
            edgeCaseTag: null,
            isCompetitorSpend: true,
            competitorBenefitKey: null,
            recurringGroupId: null,
          },
          amount,
        );
        transactions.push(tx);
      }
    }
  }

  // ── Step 4: Edge cases ──
  for (const edgeCase of persona.edgeCases) {
    const edgeTxs = generateEdgeCaseTransactions(
      rng,
      persona,
      edgeCase,
      seq,
    );
    seq += edgeTxs.length;
    transactions.push(...edgeTxs);
  }

  // ── Step 5: Sort by date ──
  transactions.sort((a, b) => a.date.localeCompare(b.date));

  return transactions;
}

// ─── Benefit Transaction Generation ────────────────────────────────

/**
 * For benefits with "always_use", "partial_use", or "over_use" behavior,
 * generate transactions that will trigger the benefit in appropriate cycles.
 */
function generateBenefitTransactions(
  rng: () => number,
  persona: Persona,
  bb: { benefitId: string; behavior: string; targetUsagePercent?: number },
  months: { year: number; month: number }[],
  startSeq: number,
): GeneratedTransaction[] {
  const transactions: GeneratedTransaction[] = [];
  let seq = startSeq;

  // Determine which months this benefit is active based on cycle type
  // We infer cycle from the benefit ID naming convention
  const cycleMonths = getBenefitCycleMonths(bb.benefitId, months);

  for (const { year, month } of cycleMonths) {
    // Look up a merchant that matches this benefit
    const template = findMerchantForBenefit(rng, bb.benefitId);
    if (!template) continue;

    // Determine amount based on behavior
    const amount = getAmountForBehavior(rng, template, bb);
    if (amount <= 0) continue;

    const tx = buildTransaction(
      rng,
      template,
      randomDateInMonth(rng, year, month),
      seq++,
      persona,
      {
        intendedBenefit: bb.benefitId,
        intendedCategory: template.expectedEarnCategory,
        edgeCaseTag: null,
        isCompetitorSpend: false,
        competitorBenefitKey: null,
        recurringGroupId: null,
      },
      amount,
    );
    transactions.push(tx);
  }

  return transactions;
}

/**
 * Determine which months a benefit should generate transactions in,
 * based on the cycle type inferred from the benefit ID.
 */
function getBenefitCycleMonths(
  benefitId: string,
  allMonths: { year: number; month: number }[],
): { year: number; month: number }[] {
  // Quarterly benefits
  if (benefitId.includes("_q1")) {
    return allMonths.filter((m) => m.month >= 0 && m.month <= 2);
  }
  if (benefitId.includes("_q2")) {
    return allMonths.filter((m) => m.month >= 3 && m.month <= 5);
  }
  if (benefitId.includes("_q3")) {
    return allMonths.filter((m) => m.month >= 6 && m.month <= 8);
  }
  if (benefitId.includes("_q4")) {
    return allMonths.filter((m) => m.month >= 9 && m.month <= 11);
  }

  // Semi-annual
  if (benefitId.includes("_h1")) {
    return allMonths.filter((m) => m.month >= 0 && m.month <= 5);
  }
  if (benefitId.includes("_h2")) {
    return allMonths.filter((m) => m.month >= 6 && m.month <= 11);
  }

  // December-only (Uber Cash Dec)
  if (benefitId.includes("_dec")) {
    return allMonths.filter((m) => m.month === 11);
  }

  // Monthly or annual — pick one month per cycle
  // For monthly benefits, return all months
  // For annual/quadrennial, return just 1 month
  if (
    benefitId.includes("global_entry") ||
    benefitId.includes("_credit") && !benefitId.includes("_q") && !benefitId.includes("_h")
  ) {
    // Annual: pick one representative month
    return allMonths.length > 0 ? [allMonths[Math.floor(allMonths.length / 2)]] : [];
  }

  // Default: monthly — return all months
  return allMonths;
}

// ─── Benefit → Merchant Mapping ────────────────────────────────────

/**
 * Map a benefit ID to a suitable merchant template from the registry.
 */
function findMerchantForBenefit(
  rng: () => number,
  benefitId: string,
): MerchantTemplate | undefined {
  // Mapping from benefit ID patterns to merchant keys.
  // Keys must match merchantKey values in the merchant template registry.
  const BENEFIT_MERCHANT_MAP: Record<string, string[]> = {
    // CSR benefits
    doordash: ["doordash_order"],
    lyft: ["lyft_ride"],
    peloton: ["peloton"],
    travel: ["united_airlines", "delta_airlines", "hyatt_hotel", "marriott_hotel"],
    stubhub: ["entertainment"],
    edit: ["the_edit"],
    select_hotel: ["generic_hotel"],
    dining: ["resy_restaurant", "cheesecake_factory"],
    global_entry: ["global_entry"],
    apple_tv: ["apple_services"],
    apple_music: ["apple_services"],
    dashpass: ["doordash_order"],

    // Amex Platinum benefits
    resy: ["resy_restaurant"],
    lululemon: ["lululemon_store"],
    uber_cash: ["uber_ride", "uber_eats"],
    uber_one: ["uber_ride"],
    digital_entertainment: ["hulu", "disney_plus", "peacock", "nytimes"],
    walmart_plus: ["walmart_plus"],
    hotel_credit: ["generic_hotel"],
    saks: ["saks_store"],
    airline_fee: ["united_airlines", "delta_airlines"],
    equinox: ["equinox"],
    clear: ["clear_membership"],
    oura: ["oura_ring"],

    // Amex BCP benefits
    disney_bundle: ["disney_plus", "hulu"],
  };

  // Find the best match from the benefit ID
  for (const [pattern, merchantKeys] of Object.entries(BENEFIT_MERCHANT_MAP)) {
    if (benefitId.includes(pattern)) {
      const key = pickRandom(rng, merchantKeys);
      return getMerchantByKey(key);
    }
  }

  return undefined;
}

function getAmountForBehavior(
  rng: () => number,
  template: MerchantTemplate,
  bb: { behavior: string; targetUsagePercent?: number },
): number {
  const { min, max } = template.amountRange;

  switch (bb.behavior) {
    case "always_use":
      // Generate amount within the normal range
      return randomInRange(rng, min, max);

    case "partial_use": {
      // Scale down to target percentage
      const pct = (bb.targetUsagePercent ?? 50) / 100;
      const scaledMax = min + (max - min) * pct;
      return randomInRange(rng, min, Math.max(min, scaledMax));
    }

    case "over_use":
      // Generate amount above max range
      return randomInRange(rng, max, max * 1.5);

    default:
      return 0;
  }
}

// ─── Edge Case Generation ──────────────────────────────────────────

function generateEdgeCaseTransactions(
  rng: () => number,
  persona: Persona,
  edgeCase: EdgeCaseSpec,
  startSeq: number,
): GeneratedTransaction[] {
  const transactions: GeneratedTransaction[] = [];
  let seq = startSeq;

  switch (edgeCase.type) {
    case "fee_charge": {
      const month = (edgeCase.details.month as number) - 1; // 1-indexed to 0-indexed
      const amount = edgeCase.details.amount as number;
      const year = parseInt(persona.generationWindow.start);

      // Annual fee charges appear as the card issuer's fee descriptor
      const feeTemplate = getMerchantByKey("chase_annual_fee") ??
        getMerchantByKey("amex_annual_fee");

      if (feeTemplate) {
        const tx = buildTransaction(
          rng,
          feeTemplate,
          formatDate(year, month, 15),
          seq++,
          persona,
          {
            intendedBenefit: null,
            intendedCategory: "other",
            edgeCaseTag: "fee_charge",
            isCompetitorSpend: false,
            competitorBenefitKey: null,
            recurringGroupId: null,
          },
          amount,
        );
        transactions.push(tx);
      }
      break;
    }

    case "month_boundary": {
      const merchantKey = (edgeCase.details.merchantKey as string) ??
        "doordash";
      const template = getMerchantByKey(merchantKey);
      if (template) {
        // Transaction on last day of a month
        const year = parseInt(persona.generationWindow.start);
        const month = 5; // June (arbitrary)
        const lastDay = daysInMonth(year, month);
        const tx = buildTransaction(
          rng,
          template,
          formatDate(year, month, lastDay),
          seq++,
          persona,
          {
            intendedBenefit: edgeCase.details.benefitId as string ?? null,
            intendedCategory: template.expectedEarnCategory,
            edgeCaseTag: "month_boundary",
            isCompetitorSpend: false,
            competitorBenefitKey: null,
            recurringGroupId: null,
          },
          randomInRange(rng, template.amountRange.min, template.amountRange.max),
        );
        transactions.push(tx);
      }
      break;
    }

    case "duplicate_merchant": {
      const merchantKey = edgeCase.details.merchantKey as string;
      const template = getMerchantByKey(merchantKey);
      if (template) {
        const year = parseInt(persona.generationWindow.start);
        const date = formatDate(year, 3, 15); // April 15
        const amount = randomInRange(
          rng,
          template.amountRange.min,
          template.amountRange.max,
        );

        // Two transactions, same merchant, same day, same amount
        for (let i = 0; i < 2; i++) {
          const tx = buildTransaction(
            rng,
            template,
            date,
            seq++,
            persona,
            {
              intendedBenefit: null,
              intendedCategory: template.expectedEarnCategory,
              edgeCaseTag: "duplicate_merchant",
              isCompetitorSpend: false,
              competitorBenefitKey: null,
              recurringGroupId: null,
            },
            amount,
          );
          transactions.push(tx);
        }
      }
      break;
    }

    case "activeMonths_boundary": {
      const benefitId = edgeCase.details.benefitId as string;
      const template = findMerchantForBenefit(rng, benefitId);
      if (template) {
        const year = parseInt(persona.generationWindow.start);

        // For December boundary: Dec 31 at 11:55 PM
        if (benefitId.includes("dec")) {
          const tx = buildTransaction(
            rng,
            template,
            formatDate(year, 11, 31), // Dec 31
            seq++,
            persona,
            {
              intendedBenefit: benefitId,
              intendedCategory: template.expectedEarnCategory,
              edgeCaseTag: "activeMonths_boundary",
              isCompetitorSpend: false,
              competitorBenefitKey: null,
              recurringGroupId: null,
            },
            randomInRange(rng, template.amountRange.min, template.amountRange.max),
          );
          // Add datetime for time-sensitive matching
          tx.datetime = `${year}-12-31T23:55:00-05:00`;
          transactions.push(tx);
        } else {
          // Jan 1 boundary
          const tx = buildTransaction(
            rng,
            template,
            formatDate(year, 0, 1), // Jan 1
            seq++,
            persona,
            {
              intendedBenefit: benefitId,
              intendedCategory: template.expectedEarnCategory,
              edgeCaseTag: "activeMonths_boundary",
              isCompetitorSpend: false,
              competitorBenefitKey: null,
              recurringGroupId: null,
            },
            randomInRange(rng, template.amountRange.min, template.amountRange.max),
          );
          transactions.push(tx);
        }
      }
      break;
    }

    case "quarter_boundary": {
      const benefitId = edgeCase.details.benefitId as string;
      const template = findMerchantForBenefit(rng, benefitId);
      if (template) {
        const year = parseInt(persona.generationWindow.start);
        // Q1 ends March 31
        const tx = buildTransaction(
          rng,
          template,
          formatDate(year, 2, 31), // March 31
          seq++,
          persona,
          {
            intendedBenefit: benefitId,
            intendedCategory: template.expectedEarnCategory,
            edgeCaseTag: "quarter_boundary",
            isCompetitorSpend: false,
            competitorBenefitKey: null,
            recurringGroupId: null,
          },
          randomInRange(rng, template.amountRange.min, template.amountRange.max),
        );
        transactions.push(tx);
      }
      break;
    }

    // Other edge cases can be added as needed
    case "near_cap":
    case "exceed_cap":
    case "cross_midnight":
    case "anniversary_boundary":
    case "pending_to_posted":
    case "refund":
    case "zero_amount":
      // These edge cases modify the spending profile amounts
      // rather than generating standalone transactions.
      // They're handled at a higher level by the runner.
      break;
  }

  return transactions;
}

// ─── Transaction Builder ───────────────────────────────────────────

function buildTransaction(
  rng: () => number,
  template: MerchantTemplate,
  date: string,
  seq: number,
  persona: Persona,
  meta: GeneratedTransaction["_meta"],
  amount: number,
): GeneratedTransaction {
  // Pick a name variant
  const rawName = pickRandom(rng, template.nameVariants);

  // Plaid enrichment: use plaidMerchantName if available, else fall back to raw
  const merchantName = template.plaidMerchantName ?? rawName;

  return {
    id: `tx_${persona.cardType}_${persona.personaName}_${seq}`,
    date,
    merchantName,
    merchantNameRaw: rawName,
    amount: Math.max(0.01, amount),
    plaidCategoryPrimary: template.plaidCategoryPrimary,
    plaidCategoryDetailed: template.plaidCategoryDetailed,
    pending: false,
    matchedStatus: "unmatched",
    datetime: null,
    _meta: meta,
  };
}
