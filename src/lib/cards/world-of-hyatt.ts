import type { CardDefinition } from "../types";

export const worldOfHyatt: CardDefinition = {
  id: "world_of_hyatt",
  name: "World of Hyatt Chase",
  issuer: "chase",
  network: "visa",
  annualFee: 95,
  feeDescriptor: "annual membership fee",
  imageUrl: null,
  isActive: true,
  // Both benefits are Free Night Certificates (not auto-matchable).
  // Tracked in perk matrix only.
  benefits: [],
};
