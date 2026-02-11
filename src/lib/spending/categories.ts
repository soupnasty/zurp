import type { SpendingCategory } from "./types";

interface CategoryMapping {
  category: SpendingCategory;
  label: string;
  plaidPrimary: string[];
  plaidDetailedInclude?: string[];
  plaidDetailedExclude?: string[];
}

const CATEGORY_MAPPINGS: CategoryMapping[] = [
  {
    category: "groceries",
    label: "Groceries",
    plaidPrimary: [],
    plaidDetailedInclude: [
      "FOOD_AND_DRINK_GROCERIES",
      "FOOD_AND_DRINK_SUPERCENTER",
      "GENERAL_MERCHANDISE_SUPERSTORES",
    ],
  },
  {
    category: "dining",
    label: "Dining",
    plaidPrimary: ["FOOD_AND_DRINK"],
    plaidDetailedExclude: [
      "FOOD_AND_DRINK_GROCERIES",
      "FOOD_AND_DRINK_SUPERCENTER",
    ],
  },
  {
    category: "travel",
    label: "Travel",
    plaidPrimary: ["TRAVEL"],
  },
  {
    category: "transportation",
    label: "Transportation",
    plaidPrimary: ["TRANSPORTATION"],
  },
  {
    category: "entertainment",
    label: "Entertainment",
    plaidPrimary: ["ENTERTAINMENT", "RECREATION"],
  },
  {
    category: "subscriptions",
    label: "Subscriptions",
    plaidPrimary: [],
    plaidDetailedInclude: [
      "GENERAL_MERCHANDISE_STREAMING",
      "GENERAL_MERCHANDISE_ONLINE_MARKETPLACES_STREAMING",
      "RENT_AND_UTILITIES_INTERNET_AND_CABLE",
      "GENERAL_SERVICES_SUBSCRIPTION",
      "GENERAL_SERVICES_CONSULTING_AND_LEGAL",
    ],
  },
  {
    category: "shopping",
    label: "Shopping",
    plaidPrimary: ["GENERAL_MERCHANDISE", "GENERAL_SERVICES"],
    plaidDetailedExclude: [
      "GENERAL_MERCHANDISE_STREAMING",
      "GENERAL_MERCHANDISE_ONLINE_MARKETPLACES_STREAMING",
      "GENERAL_MERCHANDISE_SUPERSTORES",
      "GENERAL_SERVICES_SUBSCRIPTION",
      "GENERAL_SERVICES_CONSULTING_AND_LEGAL",
    ],
  },
];

/**
 * Map Plaid personal_finance_category to a zurp spending category.
 * Checks detailed-include arrays first (overrides primary),
 * then primary arrays with detailed-exclude.
 */
export function classifyTransaction(
  primary: string | null,
  detailed: string | null
): SpendingCategory {
  if (!primary) return "other";

  // Pass 1: detailed-include overrides
  for (const mapping of CATEGORY_MAPPINGS) {
    if (
      mapping.plaidDetailedInclude &&
      detailed &&
      mapping.plaidDetailedInclude.includes(detailed)
    ) {
      return mapping.category;
    }
  }

  // Pass 2: primary match with detailed-exclude
  for (const mapping of CATEGORY_MAPPINGS) {
    if (mapping.plaidPrimary.includes(primary)) {
      if (
        mapping.plaidDetailedExclude &&
        detailed &&
        mapping.plaidDetailedExclude.includes(detailed)
      ) {
        continue;
      }
      return mapping.category;
    }
  }

  return "other";
}

export const CATEGORY_LABELS: Record<SpendingCategory, string> = {
  dining: "Dining",
  travel: "Travel",
  groceries: "Groceries",
  shopping: "Shopping",
  transportation: "Transportation",
  entertainment: "Entertainment",
  subscriptions: "Subscriptions",
  other: "Other",
};
