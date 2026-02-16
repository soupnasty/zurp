import type { MerchantTemplate } from "../types";

export const travelPerkTemplates: MerchantTemplate[] = [
  {
    merchantKey: "clear_membership",
    plaidMerchantName: "CLEAR",
    nameVariants: ["CLEARME.COM", "CLEAR ME INC", "CLEAR PLUS"],
    normalizedResult: "clear",
    expectedEarnCategory: "other",
    plaidCategoryPrimary: "SERVICE",
    plaidCategoryDetailed: "SERVICE_OTHER",
    matchesBenefitPatterns: ["clear", "clearme"],
    amountRange: { min: 189, max: 209 },
  },

  {
    merchantKey: "global_entry",
    plaidMerchantName: null,
    nameVariants: ["GLOBAL ENTRY FEE", "TSA PRECHECK", "GOES TRUSTED TRAVELER"],
    normalizedResult: "global entry fee",
    expectedEarnCategory: "other",
    plaidCategoryPrimary: "GOVERNMENT_AND_NON_PROFIT",
    plaidCategoryDetailed: "GOVERNMENT_AND_NON_PROFIT_OTHER",
    matchesBenefitPatterns: [
      "global entry",
      "tsa precheck",
      "tsa pre",
      "tsa",
      "goes",
      "trusted traveler",
      "nexus",
    ],
    amountRange: { min: 78, max: 120 },
  },
];
