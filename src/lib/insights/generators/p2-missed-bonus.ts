import type { InsightCandidate } from "../types";
import type { GeneratorContext } from "./types";
import { normalizeMerchantName } from "@/lib/engine/normalize";

interface P2Scenario {
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

const SCENARIOS: P2Scenario[] = [
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
  {
    id: "hotels_to_cap1_portal",
    cardTypes: ["capital_one_venture_x"],
    type: "portal",
    spendCategory: "travel_hotels",
    redirectTo: "Capital One Travel Portal",
    bonusRate: 10,
    baseRate: 2,
    templateKey: "p2_portal",
  },
  {
    id: "hotels_to_citi_portal",
    cardTypes: ["citi_strata_elite"],
    type: "portal",
    spendCategory: "travel_hotels",
    redirectTo: "Citi Travel Portal",
    bonusRate: 10,
    baseRate: 1,
    templateKey: "p2_portal",
  },
  {
    id: "flights_to_amex_portal",
    cardTypes: ["amex_gold"],
    type: "portal",
    spendCategory: "travel_flights",
    redirectTo: "Amex Travel Portal",
    bonusRate: 3,
    baseRate: 1,
    templateKey: "p2_portal",
  },
];

/**
 * P2: Missed Bonus Opportunity (Group A — Redirect)
 * Detects spending that could earn more through a different channel.
 */
export function generateP2(ctx: GeneratorContext): InsightCandidate[] {
  const { cardType, transactions, pointsData } = ctx;
  if (!pointsData) return [];

  const insights: InsightCandidate[] = [];
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  for (const scenario of SCENARIOS) {
    if (!scenario.cardTypes.includes(cardType)) continue;

    let spend = 0;

    if (scenario.type === "rideshare" && scenario.merchantPattern) {
      // Match by merchant name in transactions
      for (const tx of transactions) {
        const normalized = normalizeMerchantName(tx.merchantName);
        if (normalized.includes(scenario.merchantPattern)) {
          spend += tx.amount;
        }
      }
    } else if (scenario.type === "portal" && scenario.spendCategory) {
      // Use points category data for direct bookings (non-portal)
      const cat = pointsData.categories.find(
        (c) => c.category === scenario.spendCategory
      );
      if (cat) {
        spend = cat.spend;
      }
    }

    if (spend < 50) continue; // Only surface for meaningful amounts

    const currentPoints = Math.round(spend * scenario.baseRate);
    const potentialPoints = Math.round(spend * scenario.bonusRate);
    const extraPoints = potentialPoints - currentPoints;
    const extraValue = Math.round(
      (extraPoints * pointsData.conservativeCpp) / 100
    );

    if (extraValue < 10) continue;

    const dedupKey = `p2:${cardType}:${scenario.id}:${month}`;

    insights.push({
      category: "P2",
      benefitId: null,
      templateKey: scenario.templateKey,
      templateVars: {
        spend: Math.round(spend),
        redirect_to: scenario.redirectTo,
        current_rate: scenario.baseRate,
        bonus_rate: scenario.bonusRate,
        extra_value: extraValue,
        extra_points: extraPoints,
        merchant: scenario.type === "rideshare" ? "Uber" : scenario.spendCategory === "travel_hotels" ? "hotels" : "flights",
      },
      dedupKey,
      triggeredByTransactionId: null,
      periodStart: null,
      periodEnd: null,
      dollarAmount: extraValue,
      daysRemaining: null,
      actionability: "switch_platform",
      confidence: "category_match",
    });
  }

  return insights;
}
