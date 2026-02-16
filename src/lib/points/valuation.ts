import type { EarnConfig } from "./types";
import { getAllCardDefinitions } from "@/lib/cards";
import type { BenefitCycle } from "@/lib/types";

/**
 * Convert points to dollar values using a card's valuation rates.
 * Returns three tiers:
 *   conservative — cash-out / portal floor (guaranteed value)
 *   realistic    — midpoint (informed user who occasionally transfers)
 *   upside       — strategic transfer partner maximizer
 */
export function valuatePoints(
  points: number,
  config: EarnConfig
): { conservative: number; realistic: number; upside: number } {
  const { conservativeCpp, upsideCpp } = config.valuation;
  const realisticCpp = (conservativeCpp + upsideCpp) / 2;
  return {
    conservative: Math.round(points * conservativeCpp) / 100,
    realistic: Math.round(points * realisticCpp) / 100,
    upside: Math.round(points * upsideCpp) / 100,
  };
}

/**
 * Compute the total annualized benefit value from a card's benefit catalog.
 * Monthly credits × 12, biannual × 2, annual × 1, quadrennial ÷ 4, subscription × 12.
 */
export function computeBenefitsValue(cardId: string): number {
  const cardDef = getAllCardDefinitions().find((c) => c.id === cardId);
  if (!cardDef) return 0;

  let total = 0;
  for (const benefit of cardDef.benefits) {
    if (benefit.creditAmount <= 0) continue;

    const multiplier = getCycleMultiplier(benefit.cycle as BenefitCycle);
    total += benefit.creditAmount * multiplier;
  }

  return Math.round(total * 100) / 100;
}

function getCycleMultiplier(cycle: BenefitCycle): number {
  switch (cycle) {
    case "monthly":
      return 12;
    case "biannual_h1":
    case "biannual_h2":
      return 1; // Each half appears once per year
    case "quarterly_q1":
    case "quarterly_q2":
    case "quarterly_q3":
    case "quarterly_q4":
      return 1; // Each quarter is a separate benefit, 4 benefits × 1 = annualized
    case "annual_calendar":
    case "annual_anniversary":
      return 1;
    case "quadrennial":
      return 0.25;
    case "subscription":
      return 12;
    default:
      return 1;
  }
}
