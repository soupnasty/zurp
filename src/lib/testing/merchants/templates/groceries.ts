import type { MerchantTemplate } from "../types";

export const groceriesTemplates: MerchantTemplate[] = [
  {
    merchantKey: "whole_foods",
    plaidMerchantName: "Whole Foods Market",
    nameVariants: [
      "WHOLE FOODS MKT #10421",
      "WFM *WHOLE FOODS 365",
      "WHOLE FOODS MARKET",
      "WHOLEFDS MKT #04217",
    ],
    normalizedResult: "whole foods market",
    expectedEarnCategory: "groceries",
    plaidCategoryPrimary: "FOOD_AND_DRINK",
    plaidCategoryDetailed: "FOOD_AND_DRINK_GROCERIES",
    matchesBenefitPatterns: [],
    amountRange: { min: 15, max: 185 },
    edgeCases: [
      {
        rawName: "WHOLEFDS MKT #04217",
        normalizedOutput: "wholefds market",
        description:
          "Abbreviated form 'wholefds' with 'mkt' expanded to 'market' by MERCHANT_ALIASES; normalized result contains 'market' which matches 'whole foods market' Plaid enrichment via substring matching.",
      },
      {
        rawName: "WFM *WHOLE FOODS 365",
        normalizedOutput: "wfm whole foods",
        description:
          "WFM prefix not in POS strip list (wf IS but wfm is not); normalizer converts asterisk to space but preserves 'wfm'. The '365' (3 digits) gets stripped as trailing numeric ID. Result: 'wfm whole foods'",
      },
    ],
  },

  {
    merchantKey: "trader_joes",
    plaidMerchantName: "Trader Joe's",
    nameVariants: [
      "TRADER JOE'S #247",
      "TRADER JOES #247",
      "TRADER JOE S",
    ],
    normalizedResult: "trader joe's",
    expectedEarnCategory: "groceries",
    plaidCategoryPrimary: "FOOD_AND_DRINK",
    plaidCategoryDetailed: "FOOD_AND_DRINK_GROCERIES",
    matchesBenefitPatterns: [],
    amountRange: { min: 20, max: 95 },
    edgeCases: [
      {
        rawName: "TRADER JOE S",
        normalizedOutput: "trader joe s",
        description:
          "Apostrophe stripped by bank creates 'trader joe s' with dangling 's'; benefit matching would need fuzzy match or Plaid enrichment fallback.",
      },
      {
        rawName: "TRADER JOE'S #247",
        normalizedOutput: "trader joe's",
        description:
          "Apostrophe is preserved by normalizer (not stripped); number #247 is removed as trailing numeric ID",
      },
      {
        rawName: "TRADER JOES #247",
        normalizedOutput: "trader joes",
        description:
          "No apostrophe in raw variant; normalizes without apostrophe. Plaid enrichment (plaidMerchantName) needed for canonical form.",
      },
    ],
  },

  {
    merchantKey: "kroger",
    plaidMerchantName: "Kroger",
    nameVariants: [
      "KROGER #531",
      "KROGER FUEL CENTER",
      "KROGER MARKETPLACE",
    ],
    normalizedResult: "kroger",
    expectedEarnCategory: "groceries",
    plaidCategoryPrimary: "FOOD_AND_DRINK",
    plaidCategoryDetailed: "FOOD_AND_DRINK_GROCERIES",
    matchesBenefitPatterns: [],
    amountRange: { min: 25, max: 150 },
    edgeCases: [
      {
        rawName: "KROGER FUEL CENTER",
        normalizedOutput: "kroger fuel center",
        description:
          "Kroger gas station charges: contains 'kroger' so matches groceries merchant, but semantically is gas. Plaid category would need to override if categorized as TRANSPORTATION_GAS.",
        expectedCategoryOverride: "gas_stations",
      },
    ],
  },

  {
    merchantKey: "safeway",
    plaidMerchantName: "Safeway",
    nameVariants: ["SAFEWAY #1234", "SAFEWAY STORE"],
    normalizedResult: "safeway",
    expectedEarnCategory: "groceries",
    plaidCategoryPrimary: "FOOD_AND_DRINK",
    plaidCategoryDetailed: "FOOD_AND_DRINK_GROCERIES",
    matchesBenefitPatterns: [],
    amountRange: { min: 20, max: 120 },
  },

  {
    merchantKey: "costco",
    plaidMerchantName: "Costco",
    nameVariants: ["COSTCO WHSE #1234", "COSTCO.COM"],
    normalizedResult: "costco",
    expectedEarnCategory: "wholesale_clubs",
    plaidCategoryPrimary: "FOOD_AND_DRINK",
    plaidCategoryDetailed: "FOOD_AND_DRINK_GROCERIES",
    matchesBenefitPatterns: [],
    amountRange: { min: 50, max: 350 },
  },
];
