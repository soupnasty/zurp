import type { CardDefinition } from "../types";

export const appleCard: CardDefinition = {
  id: "apple_card",
  name: "Apple Card",
  // Chase acquisition confirmed Jan 2026, but the migration runs ~24 months and
  // Goldman Sachs still services accounts. Keep "goldman_sachs" until the
  // transition completes.
  issuer: "goldman_sachs",
  network: "mastercard",
  annualFee: 0,
  feeDescriptor: "no annual fee",
  imageUrl: null,
  isActive: true,
  lastVerifiedAt: "2026-08-13",
  // Daily Cash is the earning structure (modeled in earn config).
  // Savings account and interest-free financing are not trackable card benefits.
  benefits: [],
};
