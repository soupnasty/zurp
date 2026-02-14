import type { EarnConfig } from "../types";

export const citiStrataEliteEarnConfig: EarnConfig = {
  cardId: "citi_strata_elite",
  cardName: "Citi Strata Elite",
  pointsCurrency: "citi_tp",
  baseRate: 1.5,
  bonusCategories: [
    // Citi Nights: 6x dining Thu-Sun 5PM-11:59PM ET
    // NOTE: Thursday-Sunday covers Thu(4), Fri(5), Sat(6), Sun(0).
    // endHour: 24 means the window includes hours [17, 18, ..., 23] (up to 11:59 PM).
    // Plaid returns UTC timestamps; for production accuracy, timezone conversion
    // to America/New_York is applied at calculation time in the time_window matcher.
    {
      categories: ["dining", "coffee", "food_delivery"],
      earnRate: 6,
      label: "Citi Nights (Thu-Sun 5PM\u201311:59PM ET)",
      conditions: {
        time_window: {
          timezone: "America/New_York",
          days: [4, 5, 6, 0], // Thu, Fri, Sat, Sun
          startHour: 17,
          endHour: 24, // inclusive of hour 23 (11:59 PM)
        },
      },
    },
    // Regular dining: 3x (all other times)
    {
      categories: ["dining", "coffee", "food_delivery"],
      earnRate: 3,
      label: "Dining",
    },
    // Portal flights: 6x (match airline merchants)
    {
      categories: ["travel_portal"],
      earnRate: 6,
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
    // Portal hotels/other: 12x (everything else through portal)
    {
      categories: ["travel_portal"],
      earnRate: 12,
      label: "Citi Travel hotels & more",
    },
    // Direct travel: 1.5x (base rate, no bonus)
  ],
  caps: [],
  annualFee: 595,
  valuation: {
    conservativeCpp: 1.0,
    upsideCpp: 1.9,
    upsideLabel: "Transfer partners (AA, Choice 1:2)",
  },
};
