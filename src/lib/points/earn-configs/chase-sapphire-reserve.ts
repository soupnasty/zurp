import type { EarnConfig } from "../types";

export const csrEarnConfig: EarnConfig = {
  cardId: "chase_sapphire_reserve",
  cardName: "Chase Sapphire Reserve",
  pointsCurrency: "chase_ur",
  baseRate: 1,
  bonusCategories: [
    {
      categories: ["dining", "coffee", "food_delivery"],
      earnRate: 3,
      label: "Dining",
    },
    {
      // 4x applies ONLY to flights and hotels booked directly with the
      // airline/hotel. Car rentals, transit, and other travel earn 1x base.
      categories: ["travel_flights", "travel_hotels"],
      earnRate: 4,
      label: "Direct flights & hotels",
    },
    {
      categories: ["travel_portal"],
      earnRate: 8,
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
      earnRate: 10,
      label: "Peloton equipment",
      conditions: { merchant_match: ["peloton"], amount_gte: 150 },
    },
    {
      categories: ["fitness"],
      earnRate: 1,
      label: "Peloton subscription",
      conditions: { merchant_match: ["peloton"], amount_lt: 150 },
    },
  ],
  caps: [
    {
      // Peloton 10x is capped at $5,000 in purchases (50K points) total
      // through 12/31/2027. Actual cap is a program-lifetime total;
      // calendar_year is the closest supported period. Only kicks in for
      // the 10x row — other fitness spend earns base rate and is uncapped.
      capId: "csr_peloton_10x",
      categories: ["fitness"],
      maxSpend: 5000,
      period: "calendar_year",
    },
  ],
  annualFee: 795,
  valuation: {
    // Chase Travel portal baseline is 1.0cpp; "Points Boost" offers up to
    // 2.0cpp on select bookings (the flat 1.25cpp portal era is over).
    conservativeCpp: 1.0,
    upsideCpp: 2.0,
    upsideLabel: "With Points Boost or transfer partners (Hyatt, United)",
  },
};
