import type { MerchantTemplate } from "./types";
export type { MerchantTemplate, MerchantEdgeCase } from "./types";
export type { EarnCategory } from "./types";

// ── Template imports ──
import { foodDeliveryTemplates } from "./templates/food-delivery";
import { rideshareTemplates } from "./templates/rideshare";
import { streamingTemplates } from "./templates/streaming";
import { diningTemplates } from "./templates/dining";
import { groceriesTemplates } from "./templates/groceries";
import { shoppingTemplates } from "./templates/shopping";
import { hotelTemplates } from "./templates/hotels";
import { travelPortalTemplates } from "./templates/travel-portals";
import { airlineTemplates } from "./templates/airlines";
import { gasTemplates } from "./templates/gas";
import { fitnessTemplates } from "./templates/fitness";
import { transitTemplates } from "./templates/transit";
import { genericTemplates } from "./templates/generic";
import { annualFeeTemplates } from "./templates/annual-fees";
import { travelPerkTemplates } from "./templates/travel-perks";

// ── Registry: grouped by category ──

export const MERCHANT_REGISTRY: Record<string, MerchantTemplate[]> = {
  food_delivery: foodDeliveryTemplates,
  rideshare: rideshareTemplates,
  streaming: streamingTemplates,
  dining: diningTemplates,
  groceries: groceriesTemplates,
  shopping: shoppingTemplates,
  hotels: hotelTemplates,
  travel_portals: travelPortalTemplates,
  airlines: airlineTemplates,
  gas: gasTemplates,
  fitness: fitnessTemplates,
  transit: transitTemplates,
  generic: genericTemplates,
  annual_fees: annualFeeTemplates,
  travel_perks: travelPerkTemplates,
};

// ── Utility functions ──

/** Flat list of all merchant templates across all categories. */
export function getAllMerchants(): MerchantTemplate[] {
  return Object.values(MERCHANT_REGISTRY).flat();
}

/** Look up a single template by its merchantKey. */
export function getMerchantByKey(key: string): MerchantTemplate | undefined {
  return getAllMerchants().find((t) => t.merchantKey === key);
}

/** Find all templates whose matchesBenefitPatterns contain the given pattern. */
export function getMerchantsByBenefitPattern(
  pattern: string
): MerchantTemplate[] {
  const lower = pattern.toLowerCase();
  return getAllMerchants().filter((t) =>
    t.matchesBenefitPatterns.some((p) => p.toLowerCase() === lower)
  );
}

/** Find all templates in a specific earn category. */
export function getMerchantsByCategory(
  category: string
): MerchantTemplate[] {
  return getAllMerchants().filter(
    (t) => t.expectedEarnCategory === category
  );
}

/** Get total count of all merchant templates in the registry. */
export function getRegistryStats(): {
  totalTemplates: number;
  totalVariants: number;
  totalEdgeCases: number;
  categories: number;
} {
  const all = getAllMerchants();
  return {
    totalTemplates: all.length,
    totalVariants: all.reduce((sum, t) => sum + t.nameVariants.length, 0),
    totalEdgeCases: all.reduce(
      (sum, t) => sum + (t.edgeCases?.length ?? 0),
      0
    ),
    categories: Object.keys(MERCHANT_REGISTRY).length,
  };
}
