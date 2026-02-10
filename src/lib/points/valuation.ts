import type { EarnConfig } from "./types";
import { getAllCardDefinitions } from "@/lib/cards";
import type { BenefitCycle } from "@/lib/types";

/**
 * Convert points to dollar values using a card's valuation rates.
 */
export function valuatePoints(
  points: number,
  config: EarnConfig
): { conservative: number; upside: number } {
  return {
    conservative: Math.round(points * config.valuation.conservativeCpp) / 100,
    upside: Math.round(points * config.valuation.upsideCpp) / 100,
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
