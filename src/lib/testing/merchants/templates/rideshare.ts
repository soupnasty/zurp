import type { MerchantTemplate } from "../types";

export const rideshareTemplates: MerchantTemplate[] = [
  {
    merchantKey: "uber_ride",
    plaidMerchantName: "Uber",
    nameVariants: [
      "UBER *TRIP",
      "UBER *TRIP HELP.UBER.COM",
      "UBER BV TRIP HELP.UBER.COM",
      "UBER *RIDE",
    ],
    normalizedResult: "uber",
    expectedEarnCategory: "rideshare",
    plaidCategoryPrimary: "TRANSPORTATION",
    plaidCategoryDetailed: "TRANSPORTATION_TAXIS_AND_RIDE_SHARES",
    matchesBenefitPatterns: ["uber"],
    amountRange: { min: 8, max: 85 },
    edgeCases: [
      {
        rawName: "UBER *TRIP HELP.UBER.COM",
        normalizedOutput: "uber trip help.uber",
        description:
          "Contains both 'uber' (rideshare match) and URL suffix; .com gets stripped by normalizer; merchant-map uses 'uber trip' prefix match at priority 20 to classify as rideshare over generic 'uber' at priority 10",
      },
    ],
  },

  {
    merchantKey: "lyft_ride",
    plaidMerchantName: "Lyft",
    nameVariants: ["LYFT *RIDE 8472", "LYFT *RIDE", "LYFT INC"],
    normalizedResult: "lyft",
    expectedEarnCategory: "rideshare",
    plaidCategoryPrimary: "TRANSPORTATION",
    plaidCategoryDetailed: "TRANSPORTATION_TAXIS_AND_RIDE_SHARES",
    matchesBenefitPatterns: ["lyft"],
    amountRange: { min: 6, max: 75 },
  },

  {
    merchantKey: "blacklane",
    plaidMerchantName: "Blacklane",
    nameVariants: ["BLACKLANE", "BLACKLANE PREMIUM"],
    normalizedResult: "blacklane",
    expectedEarnCategory: "rideshare",
    plaidCategoryPrimary: "TRANSPORTATION",
    plaidCategoryDetailed: "TRANSPORTATION_TAXIS_AND_RIDE_SHARES",
    matchesBenefitPatterns: ["blacklane"],
    amountRange: { min: 25, max: 200 },
  },

  {
    merchantKey: "turo",
    plaidMerchantName: "Turo",
    nameVariants: ["TURO CAR RENTAL", "TURO"],
    normalizedResult: "turo",
    expectedEarnCategory: "car_rentals",
    plaidCategoryPrimary: "TRANSPORTATION",
    plaidCategoryDetailed: "TRANSPORTATION_CAR_RENTALS",
    matchesBenefitPatterns: ["turo"],
    amountRange: { min: 30, max: 300 },
  },

  {
    merchantKey: "zipcar",
    plaidMerchantName: "Zipcar",
    nameVariants: ["ZIPCAR", "ZIPCAR MEMBERSHIP"],
    normalizedResult: "zipcar",
    expectedEarnCategory: "car_rentals",
    plaidCategoryPrimary: "TRANSPORTATION",
    plaidCategoryDetailed: "TRANSPORTATION_CAR_RENTALS",
    matchesBenefitPatterns: ["zipcar"],
    amountRange: { min: 9, max: 100 },
  },
];
