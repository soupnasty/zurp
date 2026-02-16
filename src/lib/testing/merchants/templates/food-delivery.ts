import type { MerchantTemplate } from "../types";

export const foodDeliveryTemplates: MerchantTemplate[] = [
  {
    merchantKey: "doordash_order",
    plaidMerchantName: "DoorDash",
    nameVariants: [
      "DOORDASH*SWEETGREEN",
      "DOORDASH*CHIPOTLE ORDER",
      "DD *DOORDASH THAI BASIL",
      "DOORDASH*ORDER #4582",
      "DOORDASH INC",
    ],
    normalizedResult: "doordash",
    expectedEarnCategory: "food_delivery",
    plaidCategoryPrimary: "FOOD_AND_DRINK",
    plaidCategoryDetailed: "FOOD_AND_DRINK_DELIVERY",
    matchesBenefitPatterns: ["doordash", "dashpass"],
    amountRange: { min: 8, max: 55 },
    edgeCases: [
      {
        rawName: "DD *DOORDASH THAI BASIL",
        normalizedOutput: "dd doordash thai basil",
        description:
          "DD prefix is not in the POS strip list (sq, tst, pp, cke, sp, wf, ck, par); normalizer preserves 'dd' but still matches 'doordash' via substring",
      },
    ],
  },

  {
    merchantKey: "uber_eats",
    plaidMerchantName: "Uber Eats",
    nameVariants: [
      "UBER *EATS",
      "UBEREATS *ORDER",
      "UBER EATS HELP.UBER.COM",
      "UBER *EATS ORDER",
    ],
    normalizedResult: "uber eats",
    expectedEarnCategory: "food_delivery",
    plaidCategoryPrimary: "FOOD_AND_DRINK",
    plaidCategoryDetailed: "FOOD_AND_DRINK_DELIVERY",
    matchesBenefitPatterns: ["uber eats", "uber"],
    amountRange: { min: 12, max: 65 },
    edgeCases: [
      {
        rawName: "UBEREATS *ORDER",
        normalizedOutput: "ubereats order",
        description:
          "No-space 'ubereats' form: normalizer doesn't split compound words. Contains 'uber' but not 'uber eats'; merchant-map disambiguates via priority (uber eats=20 > uber=10)",
      },
    ],
  },

  {
    merchantKey: "grubhub_order",
    plaidMerchantName: "Grubhub",
    nameVariants: [
      "GRUBHUB*BURGER KING",
      "GRUBHUB DELIVERY",
      "GRUBHUB INC",
    ],
    normalizedResult: "grubhub",
    expectedEarnCategory: "food_delivery",
    plaidCategoryPrimary: "FOOD_AND_DRINK",
    plaidCategoryDetailed: "FOOD_AND_DRINK_DELIVERY",
    matchesBenefitPatterns: ["grubhub"],
    amountRange: { min: 10, max: 52 },
  },

  {
    merchantKey: "home_chef",
    plaidMerchantName: "Home Chef",
    nameVariants: ["HOME CHEF", "HOMECHEF"],
    normalizedResult: "home chef",
    expectedEarnCategory: "food_delivery",
    plaidCategoryPrimary: "FOOD_AND_DRINK",
    plaidCategoryDetailed: "FOOD_AND_DRINK_DELIVERY",
    matchesBenefitPatterns: ["home chef", "homechef"],
    amountRange: { min: 20, max: 150 },
  },
];
