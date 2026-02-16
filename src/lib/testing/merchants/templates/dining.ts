import type { MerchantTemplate } from "../types";

export const diningTemplates: MerchantTemplate[] = [
  {
    merchantKey: "resy_restaurant",
    plaidMerchantName: null,
    nameVariants: [
      "RESY - THE GRILL NYC",
      "RESY*ATOMIX",
      "RESY*RESERVATION",
      "RESY INC",
      "RESY - ELEVEN MADISON PARK",
    ],
    normalizedResult: "resy",
    expectedEarnCategory: "dining",
    plaidCategoryPrimary: "FOOD_AND_DRINK",
    plaidCategoryDetailed: "FOOD_AND_DRINK_RESTAURANTS",
    matchesBenefitPatterns: ["resy"],
    amountRange: { min: 50, max: 400 },
    edgeCases: [
      {
        rawName: "RESY - THE GRILL NYC",
        normalizedOutput: "resy - the grill nyc",
        description:
          "Resy prepends restaurant name with dash separator; normalizer does not strip dash prefix (only strips ' - ORDER' suffix). plaidMerchantName is null so classification relies on raw name matching.",
      },
    ],
  },

  {
    merchantKey: "cheesecake_factory",
    plaidMerchantName: "Cheesecake Factory",
    nameVariants: [
      "CHEESECAKE FACTORY #1234",
      "THE CHEESECAKE FACTORY",
    ],
    normalizedResult: "cheesecake factory",
    expectedEarnCategory: "dining",
    plaidCategoryPrimary: "FOOD_AND_DRINK",
    plaidCategoryDetailed: "FOOD_AND_DRINK_RESTAURANTS",
    matchesBenefitPatterns: ["cheesecake factory"],
    amountRange: { min: 25, max: 80 },
  },

  {
    merchantKey: "dunkin",
    plaidMerchantName: "Dunkin'",
    nameVariants: ["DUNKIN #12847", "DUNKIN DONUTS"],
    normalizedResult: "dunkin",
    expectedEarnCategory: "coffee",
    plaidCategoryPrimary: "FOOD_AND_DRINK",
    plaidCategoryDetailed: "FOOD_AND_DRINK_COFFEE_SHOPS",
    matchesBenefitPatterns: ["dunkin"],
    amountRange: { min: 3, max: 12 },
  },

  {
    merchantKey: "goldbelly",
    plaidMerchantName: "Goldbelly",
    nameVariants: ["GOLDBELLY INC", "GOLDBELLY.COM"],
    normalizedResult: "goldbelly",
    expectedEarnCategory: "dining",
    plaidCategoryPrimary: "FOOD_AND_DRINK",
    plaidCategoryDetailed: "FOOD_AND_DRINK_RESTAURANTS",
    matchesBenefitPatterns: ["goldbelly"],
    amountRange: { min: 50, max: 200 },
  },
];
