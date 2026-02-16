import type { MerchantTemplate } from "../types";

export const airlineTemplates: MerchantTemplate[] = [
  {
    merchantKey: "united_airlines",
    plaidMerchantName: "United Airlines",
    nameVariants: [
      "UNITED AIR 0162399023825",
      "UNITED AIRLINES",
      "UNITED AIR LINES INC",
    ],
    normalizedResult: "united airlines",
    expectedEarnCategory: "travel_flights",
    plaidCategoryPrimary: "TRAVEL",
    plaidCategoryDetailed: "TRANSPORTATION_AIRLINES_AND_AVIATION_SERVICES",
    matchesBenefitPatterns: ["united", "united airlines", "united air"],
    amountRange: { min: 150, max: 800 },
    edgeCases: [
      {
        rawName: "UNITED AIR 0162399023825",
        normalizedOutput: "united air",
        description:
          "Long trailing numeric ID (0162399023825) stripped as 3+ digit ID; result 'united air' still matches benefit pattern lookup",
      },
    ],
  },

  {
    merchantKey: "delta_airlines",
    plaidMerchantName: "Delta Air Lines",
    nameVariants: ["DELTA AIR LINES", "DELTA AIR 0062399"],
    normalizedResult: "delta air lines",
    expectedEarnCategory: "travel_flights",
    plaidCategoryPrimary: "TRAVEL",
    plaidCategoryDetailed: "TRANSPORTATION_AIRLINES_AND_AVIATION_SERVICES",
    matchesBenefitPatterns: ["delta", "delta air lines"],
    amountRange: { min: 150, max: 700 },
  },

  {
    merchantKey: "southwest_airlines",
    plaidMerchantName: "Southwest Airlines",
    nameVariants: ["SOUTHWEST AIR", "SOUTHWEST AIRLINES"],
    normalizedResult: "southwest airlines",
    expectedEarnCategory: "travel_flights",
    plaidCategoryPrimary: "TRAVEL",
    plaidCategoryDetailed: "TRANSPORTATION_AIRLINES_AND_AVIATION_SERVICES",
    matchesBenefitPatterns: ["southwest", "southwest airlines"],
    amountRange: { min: 100, max: 500 },
  },

  {
    merchantKey: "american_airlines",
    plaidMerchantName: "American Airlines",
    nameVariants: ["AMERICAN AIR 0012399", "AMERICAN AIRLINES"],
    normalizedResult: "american airlines",
    expectedEarnCategory: "travel_flights",
    plaidCategoryPrimary: "TRAVEL",
    plaidCategoryDetailed: "TRANSPORTATION_AIRLINES_AND_AVIATION_SERVICES",
    matchesBenefitPatterns: ["american air", "american airlines"],
    amountRange: { min: 150, max: 750 },
  },

  {
    merchantKey: "jetblue",
    plaidMerchantName: "JetBlue",
    nameVariants: ["JETBLUE AIRWAYS", "JETBLUE AIR 123456"],
    normalizedResult: "jetblue",
    expectedEarnCategory: "travel_flights",
    plaidCategoryPrimary: "TRAVEL",
    plaidCategoryDetailed: "TRANSPORTATION_AIRLINES_AND_AVIATION_SERVICES",
    matchesBenefitPatterns: ["jetblue"],
    amountRange: { min: 80, max: 400 },
  },

  {
    merchantKey: "alaska_airlines",
    plaidMerchantName: "Alaska Airlines",
    nameVariants: ["ALASKA AIR #1234", "ALASKA AIRLINES"],
    normalizedResult: "alaska airlines",
    expectedEarnCategory: "travel_flights",
    plaidCategoryPrimary: "TRAVEL",
    plaidCategoryDetailed: "TRANSPORTATION_AIRLINES_AND_AVIATION_SERVICES",
    matchesBenefitPatterns: ["alaska air", "alaska airlines", "airline"],
    amountRange: { min: 100, max: 500 },
  },

  {
    merchantKey: "spirit_airlines",
    plaidMerchantName: "Spirit Airlines",
    nameVariants: ["SPIRIT AIR #1234", "SPIRIT AIRLINES"],
    normalizedResult: "spirit airlines",
    expectedEarnCategory: "travel_flights",
    plaidCategoryPrimary: "TRAVEL",
    plaidCategoryDetailed: "TRANSPORTATION_AIRLINES_AND_AVIATION_SERVICES",
    matchesBenefitPatterns: ["spirit", "spirit airlines", "airline"],
    amountRange: { min: 75, max: 400 },
  },

  {
    merchantKey: "frontier_airlines",
    plaidMerchantName: "Frontier Airlines",
    nameVariants: ["FRONTIER AIR #1234", "FRONTIER AIRLINES"],
    normalizedResult: "frontier airlines",
    expectedEarnCategory: "travel_flights",
    plaidCategoryPrimary: "TRAVEL",
    plaidCategoryDetailed: "TRANSPORTATION_AIRLINES_AND_AVIATION_SERVICES",
    matchesBenefitPatterns: ["frontier", "frontier airlines", "airline"],
    amountRange: { min: 80, max: 450 },
  },
];
