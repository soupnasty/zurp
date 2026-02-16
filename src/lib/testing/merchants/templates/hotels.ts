import type { MerchantTemplate } from "../types";

export const hotelTemplates: MerchantTemplate[] = [
  {
    merchantKey: "hyatt_hotel",
    plaidMerchantName: "Hyatt",
    nameVariants: [
      "HYATT REGENCY SAN FRANCISCO",
      "PARK HYATT NEW YORK",
      "HYATT PLACE DFW AIRPORT",
      "HYATT HOUSE SEATTLE",
    ],
    normalizedResult: "hyatt",
    expectedEarnCategory: "travel_hotels",
    plaidCategoryPrimary: "TRAVEL",
    plaidCategoryDetailed: "TRAVEL_LODGING",
    matchesBenefitPatterns: ["hyatt", "fairmont", "four seasons", "pendry", "nomad", "united hotels", "montage"],
    amountRange: { min: 150, max: 800 },
    edgeCases: [
      {
        rawName: "PARK HYATT NEW YORK",
        normalizedOutput: "park hyatt new york",
        description:
          "Hyatt sub-brand normalizes to full name (no alias); benefit matcher uses contains-match on 'hyatt' which matches the normalized output",
      },
      {
        rawName: "HYATT REGENCY SAN FRANCISCO",
        normalizedOutput: "hyatt regency san francisco",
        description:
          "Sub-brand contains 'hyatt'; benefit matcher can use substring matching",
      },
    ],
  },

  {
    merchantKey: "hyatt_subbrand",
    plaidMerchantName: null,
    nameVariants: [
      "ANDAZ FIFTH AVENUE NYC",
      "THOMPSON HOTEL NASHVILLE",
      "ALILA VENTANA BIG SUR",
    ],
    normalizedResult: "andaz fifth avenue nyc",
    expectedEarnCategory: "travel_hotels",
    plaidCategoryPrimary: "TRAVEL",
    plaidCategoryDetailed: "TRAVEL_LODGING",
    matchesBenefitPatterns: [],
    amountRange: { min: 200, max: 1200 },
    edgeCases: [
      {
        rawName: "ANDAZ FIFTH AVENUE NYC",
        normalizedOutput: "andaz fifth avenue nyc",
        description:
          "Hyatt sub-brand (Andaz) normalized does not contain 'hyatt'; requires Plaid enrichment (plaidMerchantName='Hyatt') to match hyatt benefit patterns; without enrichment, falls to plaid category fallback",
      },
    ],
  },

  {
    merchantKey: "marriott_hotel",
    plaidMerchantName: "Marriott",
    nameVariants: ["MARRIOTT HOTELS", "MARRIOTT INTL"],
    normalizedResult: "marriott",
    expectedEarnCategory: "travel_hotels",
    plaidCategoryPrimary: "TRAVEL",
    plaidCategoryDetailed: "TRAVEL_LODGING",
    matchesBenefitPatterns: ["marriott", "ritz-carlton"],
    amountRange: { min: 120, max: 500 },
    edgeCases: [
      {
        rawName: "MARRIOTT INTL",
        normalizedOutput: "marriott",
        description:
          "'intl' (international) corporate suffix is stripped by normalizer; result is 'marriott'",
      },
    ],
  },

  {
    merchantKey: "hilton_hotel",
    plaidMerchantName: "Hilton",
    nameVariants: ["HILTON HOTELS", "HILTON GARDEN INN"],
    normalizedResult: "hilton",
    expectedEarnCategory: "travel_hotels",
    plaidCategoryPrimary: "TRAVEL",
    plaidCategoryDetailed: "TRAVEL_LODGING",
    matchesBenefitPatterns: [
      "hilton",
      "hilton garden inn",
      "canopy by hilton",
      "curio collection",
      "hampton by hilton",
      "home2 suites",
      "homewood suites",
      "lxr",
      "motto by hilton",
      "signia",
      "spark by hilton",
      "tapestry collection",
      "tempo by hilton",
      "tru by hilton",
      "graduate hotel",
    ],
    amountRange: { min: 100, max: 400 },
    edgeCases: [
      {
        rawName: "HILTON GARDEN INN",
        normalizedOutput: "hilton garden inn",
        description:
          "Sub-brand 'hilton garden inn' contains 'hilton' for benefit matching",
      },
    ],
  },

  {
    merchantKey: "hilton_subbrand",
    plaidMerchantName: null,
    nameVariants: [
      "WALDORF ASTORIA NYC",
      "CONRAD HOTELS",
      "DOUBLETREE BY HILTON",
      "EMBASSY SUITES",
      "HAMPTON INN",
    ],
    normalizedResult: "waldorf astoria nyc",
    expectedEarnCategory: "travel_hotels",
    plaidCategoryPrimary: "TRAVEL",
    plaidCategoryDetailed: "TRAVEL_LODGING",
    matchesBenefitPatterns: [
      "waldorf",
      "conrad",
      "doubletree",
      "embassy suites",
      "hampton inn",
    ],
    amountRange: { min: 80, max: 600 },
  },

  {
    merchantKey: "ihg_hotel",
    plaidMerchantName: "IHG",
    nameVariants: [
      "HOLIDAY INN EXPRESS",
      "INTERCONTINENTAL HOTEL",
      "IHG HOTELS",
    ],
    normalizedResult: "ihg",
    expectedEarnCategory: "travel_hotels",
    plaidCategoryPrimary: "TRAVEL",
    plaidCategoryDetailed: "TRAVEL_LODGING",
    matchesBenefitPatterns: ["ihg", "holiday inn", "intercontinental", "kimpton"],
    amountRange: { min: 80, max: 350 },
  },

  {
    merchantKey: "generic_hotel",
    plaidMerchantName: null,
    nameVariants: [
      "BEST WESTERN",
      "CHOICE HOTELS",
      "RADISSON",
      "WYNDHAM HOTEL",
      "LA QUINTA INN",
    ],
    normalizedResult: "best western",
    expectedEarnCategory: "travel_hotels",
    plaidCategoryPrimary: "TRAVEL",
    plaidCategoryDetailed: "TRAVEL_LODGING",
    matchesBenefitPatterns: [
      "hotel",
      "best western",
      "choice hotels",
      "radisson",
      "wyndham",
      "omni hotel",
      "la quinta",
      "minor hotel",
      "pan pacific",
      "virgin hotel",
    ],
    amountRange: { min: 80, max: 600 },
  },
];
