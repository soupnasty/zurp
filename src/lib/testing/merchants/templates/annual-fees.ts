import type { MerchantTemplate } from "../types";

export const annualFeeTemplates: MerchantTemplate[] = [
  {
    merchantKey: "chase_annual_fee",
    plaidMerchantName: null,
    nameVariants: ["ANNUAL MEMBERSHIP FEE", "ANNUAL FEE"],
    normalizedResult: "annual membership fee",
    expectedEarnCategory: "other",
    plaidCategoryPrimary: "BANK_FEES",
    plaidCategoryDetailed: "BANK_FEES_ATM_FEES",
    matchesBenefitPatterns: [],
    amountRange: { min: 95, max: 550 },
  },

  {
    merchantKey: "amex_annual_fee",
    plaidMerchantName: null,
    nameVariants: ["ANNUAL MEMBERSHIP FEE", "CARD MEMBERSHIP FEE"],
    normalizedResult: "annual membership fee",
    expectedEarnCategory: "other",
    plaidCategoryPrimary: "BANK_FEES",
    plaidCategoryDetailed: "BANK_FEES_ATM_FEES",
    matchesBenefitPatterns: [],
    amountRange: { min: 95, max: 895 },
  },
];
