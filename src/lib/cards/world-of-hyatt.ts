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
  lastVerifiedAt: "2026-08-13",
  // Non-tracked benefits (certificates, tracked in perk matrix only):
  // - Category 1-4 Free Night Certificate (automatic, each cardmember anniversary)
  // - Additional Category 1-4 Free Night Certificate (after $15K calendar-year spend)
  benefits: [],
};
