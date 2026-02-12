import type { EarnConfig } from "./types";

export const wellsFargoAutographJourneyEarnConfig: EarnConfig = {
  cardId: "wf_autograph_journey",
  cardName: "Wells Fargo Autograph Journey",
  pointsCurrency: "wf_points",
  baseRate: 1,
  bonusCategories: [
    {
      categories: ["travel_hotels"],
      earnRate: 5,
      label: "Hotels",
    },
    {
      categories: ["travel_flights"],
      earnRate: 4,
      label: "Airlines",
    },
    {
      categories: ["car_rentals"],
      earnRate: 4,
      label: "Rental cars",
    },
    {
      categories: ["dining", "coffee", "food_delivery"],
      earnRate: 4,
      label: "Dining",
    },
    {
      categories: [
        "gas_stations",
        "parking",
        "transit",
        "rideshare",
        "streaming",
        "phone_services",
      ],
      earnRate: 3,
      label: "Gas, parking, transit, rideshare, streaming & phone",
    },
  ],
  caps: [],
  annualFee: 95,
  valuation: {
    conservativeCpp: 1.0,
    upsideCpp: 1.5,
    upsideLabel: "Transfer partners (Flying Blue, Avianca, BA at 1:1)",
  },
};
