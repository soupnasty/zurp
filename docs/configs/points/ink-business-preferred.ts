import type { EarnConfig } from "./types";

export const inkBusinessPreferredEarnConfig: EarnConfig = {
  cardId: "ink_business_preferred",
  cardName: "Chase Ink Business Preferred",
  pointsCurrency: "chase_ur",
  baseRate: 1,
  // NOTE: Shipping (UPS, FedEx, USPS) and advertising/marketing (Google Ads,
  // Facebook Ads, etc.) also earn 3x but do not map cleanly to our earn
  // category taxonomy. The engine should detect these merchants via Plaid
  // MCC codes and apply 3x accordingly.
  //
  // The $150,000/year combined cap applies across ALL 3x categories
  // (travel + shipping + internet/phone + advertising). Modeled below as
  // calendar_year with maxSpend $150,000.
  bonusCategories: [
    // 5x on Lyft (through September 2027)
    {
      categories: ["rideshare"],
      earnRate: 5,
      label: "Lyft (through Sep 2027)",
      conditions: {
        merchant_match: ["lyft"],
      },
    },
    // 3x on travel
    {
      categories: [
        "travel_flights",
        "travel_hotels",
        "travel_other",
        "car_rentals",
        "parking",
        "transit",
      ],
      earnRate: 3,
      label: "Travel",
    },
    // 3x on internet & phone services
    {
      categories: ["phone_services"],
      earnRate: 3,
      label: "Internet, cable & phone services",
    },
  ],
  caps: [
    {
      capId: "ink_3x_150k",
      categories: [
        "travel_flights",
        "travel_hotels",
        "travel_other",
        "car_rentals",
        "parking",
        "transit",
        "phone_services",
      ],
      maxSpend: 150000,
      period: "calendar_year",
    },
  ],
  annualFee: 95,
  valuation: {
    conservativeCpp: 1.0,
    upsideCpp: 2.0,
    upsideLabel: "Transfer partners (Hyatt, United, Southwest)",
  },
};
