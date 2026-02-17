import type { EarnConfig } from "../types";

export const usBankAltitudeConnectEarnConfig: EarnConfig = {
  cardId: "us_bank_altitude_connect",
  cardName: "US Bank Altitude Connect",
  pointsCurrency: "usb_points",
  baseRate: 1,
  bonusCategories: [
    // 5x on prepaid hotels & rental cars booked through US Bank Rewards Center
    {
      categories: ["travel_portal"],
      earnRate: 5,
      label: "US Bank Rewards Center prepaid hotels & cars",
    },
    // 4x on direct travel (flights, hotels, car rentals, other travel)
    {
      categories: ["travel_flights", "travel_hotels", "travel_other", "car_rentals"],
      earnRate: 4,
      label: "Travel",
    },
    // 4x on gas stations & EV charging ($1,000/quarter cap → $4,000/year)
    // NOTE: EV charging stations share the cap with gas; our taxonomy
    // groups both under gas_stations.
    {
      categories: ["gas_stations"],
      earnRate: 4,
      label: "Gas stations & EV charging",
    },
    // 2x on dining, groceries, and streaming
    // Grocery excludes supercenters/warehouse clubs (wholesale_clubs)
    {
      categories: ["dining", "coffee", "food_delivery", "groceries", "streaming"],
      earnRate: 2,
      label: "Dining, groceries & streaming",
    },
  ],
  caps: [
    {
      capId: "usb_gas_4k",
      categories: ["gas_stations"],
      // $1,000/quarter cap; modeled as $4,000/year since period is calendar_year
      maxSpend: 4000,
      period: "calendar_year",
    },
  ],
  annualFee: 0,
  valuation: {
    conservativeCpp: 1.0,
    upsideCpp: 1.0,
    upsideLabel: "Travel portal / bank deposit (no transfer partners)",
  },
};
