import type { MerchantTemplate } from "../types";

export const transitTemplates: MerchantTemplate[] = [
  {
    merchantKey: "mta_nyc",
    plaidMerchantName: null,
    nameVariants: ["MTA*NYCT PAYGO", "MTA BRIDGES TUNNELS"],
    normalizedResult: "mta nyct paygo",
    expectedEarnCategory: "transit",
    plaidCategoryPrimary: "TRANSPORTATION",
    plaidCategoryDetailed: "TRANSPORTATION_PUBLIC_TRANSIT",
    matchesBenefitPatterns: ["e z pass", "e-zpass", "ezpass", "toll"],
    amountRange: { min: 2.9, max: 6.5 },
  },

  {
    merchantKey: "bart_sf",
    plaidMerchantName: null,
    nameVariants: ["BART-SFO", "BART-CLIPPER"],
    normalizedResult: "bart-sfo",
    expectedEarnCategory: "transit",
    plaidCategoryPrimary: "TRANSPORTATION",
    plaidCategoryDetailed: "TRANSPORTATION_PUBLIC_TRANSIT",
    matchesBenefitPatterns: [],
    amountRange: { min: 2.5, max: 12.0 },
  },

  {
    merchantKey: "generic_transit",
    plaidMerchantName: null,
    nameVariants: ["METRO TRANSIT", "CTA VENTRA"],
    normalizedResult: "metro transit",
    expectedEarnCategory: "transit",
    plaidCategoryPrimary: "TRANSPORTATION",
    plaidCategoryDetailed: "TRANSPORTATION_PUBLIC_TRANSIT",
    matchesBenefitPatterns: ["parking", "metro", "transit", "ferry", "amtrak"],
    amountRange: { min: 2.0, max: 5.0 },
  },
];
