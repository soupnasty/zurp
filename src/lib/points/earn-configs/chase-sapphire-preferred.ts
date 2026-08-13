import type { EarnConfig } from "../types";

export const cspEarnConfig: EarnConfig = {
  cardId: "chase_sapphire_preferred",
  cardName: "Chase Sapphire Preferred",
  pointsCurrency: "chase_ur",
  baseRate: 1,
  bonusCategories: [
    {
      categories: ["dining", "coffee", "food_delivery"],
      earnRate: 3,
      label: "Dining",
    },
    {
      categories: ["streaming"],
      earnRate: 3,
      label: "Streaming",
    },
    {
      categories: ["grocery_online"],
      earnRate: 3,
      label: "Online grocery",
    },
    {
      categories: ["gas_stations"],
      earnRate: 3,
      label: "Gas & EV charging",
    },
    {
      // June 2026 refresh: vacation home rentals earn 3x (up from 2x general
      // travel). Must precede the Direct travel row — first match wins.
      categories: ["travel_hotels", "travel_other"],
      earnRate: 3,
      label: "Vacation home rentals",
      conditions: { merchant_match: ["airbnb", "vrbo"] },
    },
    {
      categories: ["travel_flights", "travel_hotels", "travel_other", "car_rentals", "transit"],
      earnRate: 2,
      label: "Direct travel",
    },
    {
      categories: ["travel_portal"],
      earnRate: 5,
      label: "Chase Travel portal",
    },
    {
      categories: ["rideshare"],
      earnRate: 5,
      label: "Lyft",
      conditions: { merchant_match: ["lyft"] },
    },
    {
      categories: ["rideshare"],
      earnRate: 1,
      label: "Other rideshare",
      conditions: { merchant_exclude: ["lyft"] },
    },
    {
      categories: ["fitness"],
      earnRate: 5,
      label: "Peloton equipment",
      conditions: { merchant_match: ["peloton"], amount_gte: 200 },
    },
    {
      categories: ["fitness"],
      earnRate: 1,
      label: "Peloton subscription",
      conditions: { merchant_match: ["peloton"], amount_lt: 200 },
    },
  ],
  caps: [],
  annualFee: 95,
  // Note: the 10% anniversary points bonus was eliminated in the June 2026
  // refresh (final bonus posts Jan 2027).
  valuation: {
    // Chase Travel portal baseline is 1.0cpp; Points Boost offers up to
    // 1.5cpp (1.75cpp premium cabins) on select bookings — the flat 1.25cpp
    // portal era is over. Upside lowered from 2.0: Hyatt transfers devalue
    // to 4:3 for CSP effective Oct 1, 2026 (CSR keeps 1:1).
    conservativeCpp: 1.0,
    upsideCpp: 1.8,
    upsideLabel: "With transfer partners (United; Hyatt at 4:3)",
  },
};
