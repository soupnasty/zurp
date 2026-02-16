import type { MerchantTemplate } from "../types";

export const fitnessTemplates: MerchantTemplate[] = [
  {
    merchantKey: "equinox",
    plaidMerchantName: "Equinox",
    nameVariants: [
      "EQUINOX FITNESS",
      "EQUINOX MEMBERSHIP",
      "EQUINOX #1234",
    ],
    normalizedResult: "equinox",
    expectedEarnCategory: "fitness",
    plaidCategoryPrimary: "RECREATION",
    plaidCategoryDetailed: "RECREATION_FITNESS_AND_SPORTS",
    matchesBenefitPatterns: ["equinox"],
    amountRange: { min: 200, max: 300 },
  },

  {
    merchantKey: "peloton",
    plaidMerchantName: "Peloton",
    nameVariants: ["PELOTON INTERACTIVE", "PELOTON *SUBSCRIPTION"],
    normalizedResult: "peloton",
    expectedEarnCategory: "fitness",
    plaidCategoryPrimary: "RECREATION",
    plaidCategoryDetailed: "RECREATION_FITNESS_AND_SPORTS",
    matchesBenefitPatterns: ["peloton"],
    amountRange: { min: 12.99, max: 44.0 },
  },

  {
    merchantKey: "future_fitness",
    plaidMerchantName: "Future",
    nameVariants: ["FUTURE PERSONAL TRAINING", "FUTURE FITNESS"],
    normalizedResult: "future",
    expectedEarnCategory: "fitness",
    plaidCategoryPrimary: "RECREATION",
    plaidCategoryDetailed: "RECREATION_FITNESS_AND_SPORTS",
    matchesBenefitPatterns: ["future personal training"],
    amountRange: { min: 15, max: 200 },
  },

  {
    merchantKey: "oura_ring",
    plaidMerchantName: "Oura",
    nameVariants: ["OURA RING", "OURA HEALTH"],
    normalizedResult: "oura",
    expectedEarnCategory: "fitness",
    plaidCategoryPrimary: "RECREATION",
    plaidCategoryDetailed: "RECREATION_FITNESS_AND_SPORTS",
    matchesBenefitPatterns: ["oura"],
    amountRange: { min: 5.99, max: 99.0 },
  },
];
