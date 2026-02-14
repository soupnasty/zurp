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
  // Non-tracked benefits (certificates, tracked in perk matrix only):
  // - Category 1-4 Free Night Certificate (annual, after $15K spend)
  // - Category 1-7 Free Night Certificate (annual, automatic)
  benefits: [],
};
