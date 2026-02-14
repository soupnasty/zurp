import type { CardDefinition } from "../types";

export const appleCard: CardDefinition = {
  id: "apple_card",
  name: "Apple Card",
  issuer: "chase", // Transitioned from Goldman Sachs to JPMorgan Chase (Jan 2026)
  network: "mastercard",
  annualFee: 0,
  feeDescriptor: "no annual fee",
  imageUrl: null,
  isActive: true,
  // Daily Cash is the earning structure (modeled in earn config).
  // Savings account and interest-free financing are not trackable card benefits.
  benefits: [],
};
