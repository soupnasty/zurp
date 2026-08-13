import type { EarnConfig } from "../types";

export const citiStrataEliteEarnConfig: EarnConfig = {
  cardId: "citi_strata_elite",
  cardName: "Citi Strata Elite",
  pointsCurrency: "citi_tp",
  baseRate: 1.5,
  bonusCategories: [
    // Citi Nights: 6x dining Friday-Saturday 6PM-6AM ET (verified 2026-08-13)
    // NOTE: The window spans midnight \u2014 Fri 6PM\u2192Sat 6AM and Sat 6PM\u2192Sun 6AM.
    // days lists the days the window STARTS: Fri(5), Sat(6). endHour < startHour
    // signals an overnight wrap in the time_window matcher.
    // Plaid returns UTC timestamps; for production accuracy, timezone conversion
    // to America/New_York is applied at calculation time in the time_window matcher.
    {
      categories: ["dining", "coffee", "food_delivery"],
      earnRate: 6,
      label: "Citi Nights (Fri\u2013Sat 6PM\u20136AM ET)",
      conditions: {
        time_window: {
          timezone: "America/New_York",
          days: [5, 6], // Fri, Sat (days the window starts)
          startHour: 18,
          endHour: 6, // wraps overnight to 6AM the next morning
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
