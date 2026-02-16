import type { MerchantTemplate } from "../types";

export const travelPortalTemplates: MerchantTemplate[] = [
  {
    merchantKey: "chase_travel",
    plaidMerchantName: null,
    nameVariants: [
      "CHASE TRAVEL",
      "ULTIMATE REWARDS TRAVEL",
      "CHASE ULTIMATE REWARDS",
    ],
    normalizedResult: "chase travel",
    expectedEarnCategory: "travel_portal",
    plaidCategoryPrimary: "TRAVEL",
    plaidCategoryDetailed: "TRAVEL_LODGING",
    matchesBenefitPatterns: ["chase travel", "chase dining"],
    amountRange: { min: 150, max: 2000 },
  },

  {
    merchantKey: "amex_travel",
    plaidMerchantName: null,
    nameVariants: ["AMEX TRAVEL", "AMEXTRAVEL.COM"],
    normalizedResult: "amex travel",
    expectedEarnCategory: "travel_portal",
    plaidCategoryPrimary: "TRAVEL",
    plaidCategoryDetailed: "TRAVEL_LODGING",
    matchesBenefitPatterns: [
      "amextravel",
      "amex travel",
      "fine hotels",
      "hotel collection",
    ],
    amountRange: { min: 200, max: 3000 },
  },

  {
    merchantKey: "citi_travel",
    plaidMerchantName: null,
    nameVariants: ["CITI TRAVEL", "CITITRAVEL"],
    normalizedResult: "citi travel",
    expectedEarnCategory: "travel_portal",
    plaidCategoryPrimary: "TRAVEL",
    plaidCategoryDetailed: "TRAVEL_LODGING",
    matchesBenefitPatterns: [],
    amountRange: { min: 150, max: 2000 },
  },

  {
    merchantKey: "capital_one_travel",
    plaidMerchantName: null,
    nameVariants: ["CAPITAL ONE TRAVEL", "CAPITALONETRAVE"],
    normalizedResult: "capital one travel",
    expectedEarnCategory: "travel_portal",
    plaidCategoryPrimary: "TRAVEL",
    plaidCategoryDetailed: "TRAVEL_LODGING",
    matchesBenefitPatterns: ["capital one travel", "capitalone travel"],
    amountRange: { min: 150, max: 2000 },
  },

  {
    merchantKey: "bilt_travel",
    plaidMerchantName: null,
    nameVariants: ["BILT TRAVEL"],
    normalizedResult: "bilt travel",
    expectedEarnCategory: "travel_portal",
    plaidCategoryPrimary: "TRAVEL",
    plaidCategoryDetailed: "TRAVEL_LODGING",
    matchesBenefitPatterns: ["bilt travel"],
    amountRange: { min: 200, max: 2000 },
  },
];
