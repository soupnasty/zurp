/**
 * P2 scenario configurations for missed bonus opportunity detection.
 * Extracted from p2-missed-bonus.ts so new scenarios can be added without code changes to the generator.
 */

export interface P2Scenario {
  id: string;
  cardTypes: string[];
  type: "rideshare" | "portal";
  merchantPattern?: string;
  spendCategory?: string;
  redirectTo: string;
  bonusRate: number;
  baseRate: number;
  templateKey: string;
}

export const P2_SCENARIOS: P2Scenario[] = [
  // ── Chase ──
  {
    id: "uber_to_lyft",
    cardTypes: ["chase_sapphire_reserve", "chase_sapphire_preferred"],
    type: "rideshare",
    merchantPattern: "uber",
    redirectTo: "Lyft",
    bonusRate: 10, // Lyft 10x for CSR
    baseRate: 3,
    templateKey: "p2_rideshare",
  },
  {
    id: "hotels_to_chase_portal",
    cardTypes: ["chase_sapphire_reserve"],
    type: "portal",
    spendCategory: "travel_hotels",
    redirectTo: "Chase Travel Portal",
    bonusRate: 10,
    baseRate: 3,
    templateKey: "p2_portal",
  },

  // ── Amex ──
  {
    id: "hotels_to_amex_portal",
    cardTypes: ["amex_platinum"],
    type: "portal",
    spendCategory: "travel_hotels",
    redirectTo: "Amex Travel Portal",
    bonusRate: 5,
    baseRate: 1,
    templateKey: "p2_portal",
  },
  {
    id: "flights_to_amex_plat_portal",
    cardTypes: ["amex_platinum"],
    type: "portal",
    spendCategory: "travel_flights",
    redirectTo: "Amex Travel Portal",
    bonusRate: 5,
    baseRate: 1,
    templateKey: "p2_portal",
  },
  {
    id: "flights_to_amex_gold_portal",
    cardTypes: ["amex_gold"],
    type: "portal",
    spendCategory: "travel_flights",
    redirectTo: "Amex Travel Portal",
    bonusRate: 3,
    baseRate: 1,
    templateKey: "p2_portal",
  },

  // ── Capital One ──
  {
    id: "hotels_to_cap1_vx_portal",
    cardTypes: ["capital_one_venture_x"],
    type: "portal",
    spendCategory: "travel_hotels",
    redirectTo: "Capital One Travel Portal",
    bonusRate: 10,
    baseRate: 2,
    templateKey: "p2_portal",
  },
  {
    id: "hotels_to_cap1_v_portal",
    cardTypes: ["capital_one_venture"],
    type: "portal",
    spendCategory: "travel_hotels",
    redirectTo: "Capital One Travel Portal",
    bonusRate: 5,
    baseRate: 2,
    templateKey: "p2_portal",
  },
  {
    id: "cars_to_cap1_portal",
    cardTypes: ["capital_one_venture_x", "capital_one_venture"],
    type: "portal",
    spendCategory: "travel_car_rental",
    redirectTo: "Capital One Travel Portal",
    bonusRate: 5,
    baseRate: 2,
    templateKey: "p2_portal",
  },

  // ── Citi ──
  {
    id: "hotels_to_citi_elite_portal",
    cardTypes: ["citi_strata_elite"],
    type: "portal",
    spendCategory: "travel_hotels",
    redirectTo: "Citi Travel Portal",
    bonusRate: 10,
    baseRate: 1,
    templateKey: "p2_portal",
  },
  {
    id: "hotels_to_citi_premier_portal",
    cardTypes: ["citi_strata_premier"],
    type: "portal",
    spendCategory: "travel_hotels",
    redirectTo: "Citi Travel Portal",
    bonusRate: 10,
    baseRate: 3,
    templateKey: "p2_portal",
  },

  // ── Bilt ──
  {
    id: "hotels_to_bilt_portal",
    cardTypes: ["bilt_palladium"],
    type: "portal",
    spendCategory: "travel_hotels",
    redirectTo: "Bilt Travel Portal",
    bonusRate: 5,
    baseRate: 2,
    templateKey: "p2_portal",
  },
];
