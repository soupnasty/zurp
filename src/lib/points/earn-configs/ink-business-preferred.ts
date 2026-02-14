import type { EarnConfig } from "../types";

export const inkBusinessPreferredEarnConfig: EarnConfig = {
  cardId: "ink_business_preferred",
  cardName: "Chase Ink Business Preferred",
  pointsCurrency: "chase_ur",
  baseRate: 1,
  // NOTE: Shipping (UPS, FedEx, USPS) and advertising/marketing (Google Ads,
  // Facebook Ads, etc.) also earn 3x but do not map cleanly to our earn
  // category taxonomy. The $150,000/year combined cap applies across ALL 3x
  // categories (travel + shipping + internet/phone + advertising).
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
    // 3x on shipping (matched by merchant name since no "shipping" earn category)
    {
      categories: ["other"],
      earnRate: 3,
      label: "Shipping (UPS, FedEx, USPS, DHL)",
      conditions: {
        merchant_match: ["ups", "fedex", "usps", "dhl", "united parcel"],
      },
    },
    // 3x on advertising (matched by merchant name since no "advertising" earn category)
    {
      categories: ["other"],
      earnRate: 3,
      label: "Advertising & marketing",
      conditions: {
        merchant_match: ["google ads", "facebook ads", "meta ads", "linkedin ads", "bing ads", "twitter ads", "tiktok ads"],
      },
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
        "other", // includes shipping & advertising via merchant_match
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
