import type { MerchantTemplate } from "../types";

export const streamingTemplates: MerchantTemplate[] = [
  {
    merchantKey: "hulu",
    plaidMerchantName: "Hulu",
    nameVariants: ["HULU 73281954", "HULU, LLC", "HULU *SUBSCRIPTION"],
    normalizedResult: "hulu",
    expectedEarnCategory: "streaming",
    plaidCategoryPrimary: "ENTERTAINMENT",
    plaidCategoryDetailed: "ENTERTAINMENT_TV_AND_MOVIES",
    matchesBenefitPatterns: ["hulu"],
    amountRange: { min: 7.99, max: 17.99 },
  },

  {
    merchantKey: "disney_plus",
    plaidMerchantName: "Disney Plus",
    nameVariants: ["DISNEYPLUS*", "DISNEY PLUS", "WALT DISNEY*DISNEYPLUS"],
    normalizedResult: "disney plus",
    expectedEarnCategory: "streaming",
    plaidCategoryPrimary: "ENTERTAINMENT",
    plaidCategoryDetailed: "ENTERTAINMENT_TV_AND_MOVIES",
    matchesBenefitPatterns: ["disney+", "disneyplus", "disney"],
    amountRange: { min: 7.99, max: 13.99 },
    edgeCases: [
      {
        rawName: "DISNEYPLUS*",
        normalizedOutput: "disneyplus",
        description:
          "Normalized 'disneyplus' (no space) does NOT match benefit pattern 'disney+' via substring; depends on exact pattern list including 'disneyplus' or 'disney'",
      },
    ],
  },

  {
    merchantKey: "netflix",
    plaidMerchantName: "Netflix",
    nameVariants: ["NETFLIX.COM", "NETFLIX INC"],
    normalizedResult: "netflix",
    expectedEarnCategory: "streaming",
    plaidCategoryPrimary: "ENTERTAINMENT",
    plaidCategoryDetailed: "ENTERTAINMENT_TV_AND_MOVIES",
    matchesBenefitPatterns: [],
    amountRange: { min: 6.99, max: 22.99 },
  },

  {
    merchantKey: "youtube_premium",
    plaidMerchantName: "YouTube",
    nameVariants: [
      "YOUTUBE PREMIUM",
      "GOOGLE *YOUTUBE PREMIUM",
      "YOUTUBE MUSIC",
    ],
    normalizedResult: "youtube",
    expectedEarnCategory: "streaming",
    plaidCategoryPrimary: "ENTERTAINMENT",
    plaidCategoryDetailed: "ENTERTAINMENT_MUSIC",
    matchesBenefitPatterns: ["youtube premium", "youtube music", "youtube tv"],
    amountRange: { min: 10.99, max: 13.99 },
    edgeCases: [
      {
        rawName: "GOOGLE *YOUTUBE PREMIUM",
        normalizedOutput: "google youtube premium",
        description:
          "Google prefix preserved after normalization (not in POS strip list); merchant-map uses 'youtube' contains-match to classify correctly despite 'google' prefix",
      },
    ],
  },

  {
    merchantKey: "peacock",
    plaidMerchantName: "Peacock",
    nameVariants: ["PEACOCK TV", "PEACOCK PREMIUM"],
    normalizedResult: "peacock",
    expectedEarnCategory: "streaming",
    plaidCategoryPrimary: "ENTERTAINMENT",
    plaidCategoryDetailed: "ENTERTAINMENT_TV_AND_MOVIES",
    matchesBenefitPatterns: ["peacock"],
    amountRange: { min: 5.99, max: 13.99 },
  },

  {
    merchantKey: "paramount_plus",
    plaidMerchantName: "Paramount Plus",
    nameVariants: ["PARAMOUNT+ PREMIUM", "PARAMOUNT PLUS", "PARAMOUNTPLUS"],
    normalizedResult: "paramount plus",
    expectedEarnCategory: "streaming",
    plaidCategoryPrimary: "ENTERTAINMENT",
    plaidCategoryDetailed: "ENTERTAINMENT_TV_AND_MOVIES",
    matchesBenefitPatterns: ["paramount+", "paramount plus", "paramountplus"],
    amountRange: { min: 5.99, max: 12.99 },
  },

  {
    merchantKey: "nytimes",
    plaidMerchantName: "The New York Times",
    nameVariants: [
      "NYT*NYTIMES DIGITAL",
      "NYTIMES.COM",
      "NEW YORK TIMES DIGITAL",
    ],
    normalizedResult: "the new york times",
    expectedEarnCategory: "streaming",
    plaidCategoryPrimary: "ENTERTAINMENT",
    plaidCategoryDetailed: "ENTERTAINMENT_TV_AND_MOVIES",
    matchesBenefitPatterns: ["new york times", "nytimes"],
    amountRange: { min: 4.25, max: 17.0 },
    edgeCases: [
      {
        rawName: "NYT*NYTIMES DIGITAL",
        normalizedOutput: "nyt nytimes digital",
        description:
          "NYT prefix is NOT in the POS strip list (sq, tst, pp, cke, sp, wf, ck, par); normalizer converts asterisk to space but preserves 'nyt'. Contains 'nytimes' for benefit matching.",
      },
    ],
  },

  {
    merchantKey: "wsj",
    plaidMerchantName: "Wall Street Journal",
    nameVariants: [
      "WSJ.COM",
      "WSJ*DIGITAL",
      "WALL STREET JOURNAL DIGITAL",
    ],
    normalizedResult: "wall street journal",
    expectedEarnCategory: "streaming",
    plaidCategoryPrimary: "ENTERTAINMENT",
    plaidCategoryDetailed: "ENTERTAINMENT_TV_AND_MOVIES",
    matchesBenefitPatterns: ["wall street journal", "wsj"],
    amountRange: { min: 4.0, max: 12.99 },
  },

  {
    merchantKey: "apple_services",
    plaidMerchantName: "Apple",
    nameVariants: ["APPLE MUSIC", "APPLE TV PLUS", "APPLE.COM/BILL"],
    normalizedResult: "apple",
    expectedEarnCategory: "streaming",
    plaidCategoryPrimary: "ENTERTAINMENT",
    plaidCategoryDetailed: "ENTERTAINMENT_MUSIC",
    matchesBenefitPatterns: ["apple music", "apple tv", "apple.com/bill"],
    amountRange: { min: 4.99, max: 19.99 },
  },

  {
    merchantKey: "espn_plus",
    plaidMerchantName: "ESPN Plus",
    nameVariants: ["ESPN+", "ESPNPLUS"],
    normalizedResult: "espn plus",
    expectedEarnCategory: "streaming",
    plaidCategoryPrimary: "ENTERTAINMENT",
    plaidCategoryDetailed: "ENTERTAINMENT_SPORTS",
    matchesBenefitPatterns: ["espn+", "espnplus"],
    amountRange: { min: 10.99, max: 14.99 },
  },
];
