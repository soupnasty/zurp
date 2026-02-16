import type { MerchantTemplate } from "../types";

export const gasTemplates: MerchantTemplate[] = [
  {
    merchantKey: "shell",
    plaidMerchantName: "Shell",
    nameVariants: ["SHELL OIL 57444", "SHELL SERVICE STATION"],
    normalizedResult: "shell",
    expectedEarnCategory: "gas_stations",
    plaidCategoryPrimary: "TRANSPORTATION",
    plaidCategoryDetailed: "TRANSPORTATION_GAS",
    matchesBenefitPatterns: [],
    amountRange: { min: 20, max: 80 },
    edgeCases: [
      {
        rawName: "SHELL OIL 57444",
        normalizedOutput: "shell oil",
        description:
          "5-digit trailing ID (57444) stripped by normalizer's 3+-digit regex; result is 'shell oil' (not just 'shell'). The word 'oil' is preserved.",
      },
    ],
  },

  {
    merchantKey: "chevron",
    plaidMerchantName: "Chevron",
    nameVariants: ["CHEVRON 12345", "CHEVRON STATION"],
    normalizedResult: "chevron",
    expectedEarnCategory: "gas_stations",
    plaidCategoryPrimary: "TRANSPORTATION",
    plaidCategoryDetailed: "TRANSPORTATION_GAS",
    matchesBenefitPatterns: [],
    amountRange: { min: 25, max: 85 },
  },

  {
    merchantKey: "exxon_mobil",
    plaidMerchantName: "Exxon",
    nameVariants: ["EXXONMOBIL", "EXXON MOBIL"],
    normalizedResult: "exxon",
    expectedEarnCategory: "gas_stations",
    plaidCategoryPrimary: "TRANSPORTATION",
    plaidCategoryDetailed: "TRANSPORTATION_GAS",
    matchesBenefitPatterns: ["exxon", "mobil"],
    amountRange: { min: 20, max: 90 },
  },
];
