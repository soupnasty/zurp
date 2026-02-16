import { getCardDefinition } from "@/lib/cards";
import type { BenefitCycle } from "@/lib/types";

/**
 * Compute benefit value under "My Picks" mode.
 *
 * For each benefit on the card:
 *   - If the user selected the matching lifestyle key, use the full annualized
 *     value (or matched if higher).
 *   - If not selected, fall back to the matched amount. No matches = $0.
 */
export function computeLifestyleBenefits(
  cardId: string,
  matchedPerBenefit: Record<string, number>,
  selectedKeys: Set<string>
): number {
  const cardDef = getCardDefinition(cardId);
  if (!cardDef) return 0;

  let total = 0;

  for (const benefit of cardDef.benefits) {
    if (benefit.creditAmount <= 0) continue;

    const matched = matchedPerBenefit[benefit.id] ?? 0;

    if (benefit.lifestyleKey && selectedKeys.has(benefit.lifestyleKey)) {
      const multiplier = getCycleMultiplier(benefit.cycle as BenefitCycle);
      const annualized = benefit.creditAmount * multiplier;
      total += Math.max(matched, annualized);
    } else {
      total += matched;
    }
  }

  return Math.round(total * 100) / 100;
}

function getCycleMultiplier(cycle: BenefitCycle): number {
  switch (cycle) {
    case "monthly":
      return 12;
    case "biannual_h1":
    case "biannual_h2":
      return 1;
    case "quarterly_q1":
    case "quarterly_q2":
    case "quarterly_q3":
    case "quarterly_q4":
      return 1;
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
