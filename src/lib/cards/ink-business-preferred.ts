import type { CardDefinition } from "../types";

export const inkBusinessPreferred: CardDefinition = {
  id: "ink_business_preferred",
  name: "Chase Ink Business Preferred Credit Card",
  issuer: "chase",
  network: "visa",
  annualFee: 95,
  feeDescriptor: "annual membership fee",
  imageUrl: null,
  isActive: true,
  // Ink Business Preferred is primarily an earning card (3x travel/shipping/internet/phone/advertising).
  // No trackable statement credits.
  benefits: [],
};
