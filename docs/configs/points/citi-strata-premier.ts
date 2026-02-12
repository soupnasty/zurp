import type { EarnConfig } from "./types";

export const citiStrataPremierEarnConfig: EarnConfig = {
  cardId: "citi_strata_premier",
  cardName: "Citi Strata Premier",
  pointsCurrency: "citi_tp",
  baseRate: 1,
  bonusCategories: [
    // Portal flights: 3x (same as direct flights)
    {
      categories: ["travel_portal"],
      earnRate: 3,
      label: "Citi Travel flights",
      conditions: {
        merchant_match: [
          "united",
          "delta",
          "american air",
          "southwest",
          "jetblue",
          "alaska air",
          "spirit",
          "frontier",
          "air france",
          "british air",
          "emirates",
          "singapore air",
        ],
      },
    },
    // Portal hotels/cars/attractions: 10x (everything else through portal)
    {
      categories: ["travel_portal"],
      earnRate: 10,
      label: "Citi Travel hotels, cars & attractions",
    },
    {
      categories: ["travel_flights"],
      earnRate: 3,
      label: "Flights",
    },
    {
      categories: ["dining", "coffee", "food_delivery"],
      earnRate: 3,
      label: "Restaurants",
    },
    {
      categories: ["groceries", "grocery_online"],
      earnRate: 3,
      label: "Supermarkets",
    },
    {
      categories: ["gas_stations"],
      earnRate: 3,
      label: "Gas stations",
    },
  ],
  caps: [],
  annualFee: 95,
  valuation: {
    conservativeCpp: 1.0,
    upsideCpp: 1.9,
    upsideLabel: "Transfer partners (AA, Choice 1:2)",
  },
};
