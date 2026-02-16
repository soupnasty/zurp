import type { MerchantTemplate } from "../types";

export const shoppingTemplates: MerchantTemplate[] = [
  {
    merchantKey: "saks_store",
    plaidMerchantName: "Saks Fifth Avenue",
    nameVariants: [
      "SAKS FIFTH AVENUE #611",
      "SAKS FIFTH AVE NYC",
      "SAKS.COM",
      "SAKS DIRECT",
      "SAKSFIFTHAVE.COM",
    ],
    normalizedResult: "saks fifth avenue",
    expectedEarnCategory: "shopping_instore",
    plaidCategoryPrimary: "SHOPS",
    plaidCategoryDetailed: "SHOPS_CLOTHING_AND_ACCESSORIES",
    matchesBenefitPatterns: ["saks fifth avenue", "saks", "saks.com"],
    amountRange: { min: 25, max: 200 },
    edgeCases: [
      {
        rawName: "SAKSFIFTHAVE.COM",
        normalizedOutput: "saksfifthave.com",
        description:
          "Normalized form 'saksfifthave.com' contains 'saks' but not full 'saks fifth avenue'; benefit matcher should use contains-based lookup",
      },
    ],
  },

  {
    merchantKey: "lululemon_store",
    plaidMerchantName: "lululemon",
    nameVariants: ["LULULEMON #04521", "LULULEMON ATHLETICA", "LULULEMON.COM"],
    normalizedResult: "lululemon",
    expectedEarnCategory: "shopping_instore",
    plaidCategoryPrimary: "SHOPS",
    plaidCategoryDetailed: "SHOPS_CLOTHING_AND_ACCESSORIES",
    matchesBenefitPatterns: ["lululemon"],
    amountRange: { min: 28, max: 198 },
  },

  {
    merchantKey: "walmart_plus",
    plaidMerchantName: "Walmart",
    nameVariants: ["WALMART+ MEMBERSHIP", "WALMART.COM W+", "WAL-MART *PLUS"],
    normalizedResult: "walmart",
    expectedEarnCategory: "shopping_instore",
    plaidCategoryPrimary: "SHOPS",
    plaidCategoryDetailed: "SHOPS_DISCOUNT_STORES",
    matchesBenefitPatterns: ["walmart+", "walmart plus", "walmart"],
    amountRange: { min: 12.95, max: 12.95 },
    edgeCases: [
      {
        rawName: "WALMART+ MEMBERSHIP",
        normalizedOutput: "walmart",
        description:
          "Walmart+ alias matches and converts to 'walmart'; 'membership' suffix then stripped",
      },
      {
        rawName: "WALMART.COM W+",
        normalizedOutput: "walmart",
        description:
          "Walmart.com alias matches and converts to 'walmart'; 'w+' suffix then stripped",
      },
      {
        rawName: "WAL-MART *PLUS",
        normalizedOutput: "wal-mart plus",
        description:
          "Hyphenated form 'wal-mart' normalized preserves hyphen (not 'walmart'); does NOT match walmart alias; asterisk becomes space. 'plus' is NOT stripped (removed from suffix list to preserve 'Disney Plus'). Benefit patterns include 'walmart plus' for matching",
      },
    ],
  },

  {
    merchantKey: "amazon_order",
    plaidMerchantName: "Amazon",
    nameVariants: [
      "AMAZON.COM*123ABC",
      "AMZN MKTP US*AB1CD2",
      "AMAZON PRIME*123ABC",
    ],
    normalizedResult: "amazon",
    expectedEarnCategory: "shopping_online",
    plaidCategoryPrimary: "SHOPS",
    plaidCategoryDetailed: "SHOPS_DIGITAL_PURCHASE",
    matchesBenefitPatterns: [],
    amountRange: { min: 10, max: 200 },
  },

  {
    merchantKey: "target_store",
    plaidMerchantName: "Target",
    nameVariants: ["TARGET #1234", "TARGET.COM"],
    normalizedResult: "target",
    expectedEarnCategory: "shopping_instore",
    plaidCategoryPrimary: "SHOPS",
    plaidCategoryDetailed: "SHOPS_DEPARTMENT_STORES",
    matchesBenefitPatterns: [],
    amountRange: { min: 15, max: 150 },
  },

  {
    merchantKey: "1stdibs",
    plaidMerchantName: "1stDibs",
    nameVariants: ["1STDIBS", "1STDIBS.COM"],
    normalizedResult: "1stdibs",
    expectedEarnCategory: "shopping_online",
    plaidCategoryPrimary: "SHOPS",
    plaidCategoryDetailed: "SHOPS_DIGITAL_PURCHASE",
    matchesBenefitPatterns: ["1stdibs"],
    amountRange: { min: 50, max: 500 },
  },

  {
    merchantKey: "wine_shop",
    plaidMerchantName: "Wine.com",
    nameVariants: ["WINE.COM", "WINE SHOP ONLINE"],
    normalizedResult: "wine.com",
    expectedEarnCategory: "shopping_online",
    plaidCategoryPrimary: "SHOPS",
    plaidCategoryDetailed: "SHOPS_DIGITAL_PURCHASE",
    matchesBenefitPatterns: ["wine.com"],
    amountRange: { min: 30, max: 300 },
  },

  {
    merchantKey: "the_edit",
    plaidMerchantName: "The Edit",
    nameVariants: ["THE EDIT", "THEEDIT.COM"],
    normalizedResult: "the edit",
    expectedEarnCategory: "shopping_online",
    plaidCategoryPrimary: "SHOPS",
    plaidCategoryDetailed: "SHOPS_DIGITAL_PURCHASE",
    matchesBenefitPatterns: ["the edit"],
    amountRange: { min: 50, max: 400 },
    edgeCases: [
      {
        rawName: "THEEDIT.COM",
        normalizedOutput: "the edit",
        description:
          "TheEdit alias (applied before .com stripping) converts to 'the edit'; leading 'the' is then preserved by the negative lookahead in the stripping rule",
      },
    ],
  },
];
