import type { CardDefinition } from "@/lib/types";
import { chaseSapphireReserve } from "./chase-sapphire-reserve";
import { chaseSapphirePreferred } from "./chase-sapphire-preferred";
import { chaseFreedomFlex } from "./chase-freedom-flex";
import { chaseFreedomUnlimited } from "./chase-freedom-unlimited";
import { amexGold } from "./amex-gold";
import { amexBlueCashPreferred } from "./amex-blue-cash-preferred";
import { amexBlueCashEveryday } from "./amex-blue-cash-everyday";
import { amexPlatinum } from "./amex-platinum";
import { citiStrataElite } from "./citi-strata-elite";
import { citiStrataPremier } from "./citi-strata-premier";
import { citiCustomCash } from "./citi-custom-cash";
import { citiDoubleCash } from "./citi-double-cash";
import { capitalOneVentureX } from "./capital-one-venture-x";
import { capitalOneVenture } from "./capital-one-venture";
import { robinhoodGold } from "./robinhood-gold";
import { biltPalladium } from "./bilt-palladium";
import { discoverItCashBack } from "./discover-it-cash-back";
import { usBankAltitudeConnect } from "./us-bank-altitude-connect";
import { wellsFargoActiveCash } from "./wells-fargo-active-cash";
import { wellsFargoAutographJourney } from "./wells-fargo-autograph-journey";
import { amexBusinessPlatinum } from "./amex-business-platinum";
import { appleCard } from "./apple-card";
import { capitalOneSavor } from "./capital-one-savor";
import { deltaPlatinum } from "./delta-platinum";
import { hiltonAspire } from "./hilton-aspire";
import { ihgPremier } from "./ihg-premier";
import { inkBusinessPreferred } from "./ink-business-preferred";
import { southwestPriority } from "./southwest-priority";
import { unitedExplorer } from "./united-explorer";
import { worldOfHyatt } from "./world-of-hyatt";

export const cardRegistry: CardDefinition[] = [
  chaseSapphireReserve,
  chaseSapphirePreferred,
  chaseFreedomFlex,
  chaseFreedomUnlimited,
  amexGold,
  amexBlueCashPreferred,
  amexBlueCashEveryday,
  amexPlatinum,
  citiStrataElite,
  citiStrataPremier,
  citiCustomCash,
  citiDoubleCash,
  capitalOneVentureX,
  capitalOneVenture,
  robinhoodGold,
  biltPalladium,
  discoverItCashBack,
  usBankAltitudeConnect,
  wellsFargoActiveCash,
  wellsFargoAutographJourney,
  amexBusinessPlatinum,
  appleCard,
  capitalOneSavor,
  deltaPlatinum,
  hiltonAspire,
  ihgPremier,
  inkBusinessPreferred,
  southwestPriority,
  unitedExplorer,
  worldOfHyatt,
];

export function getCardDefinition(cardId: string): CardDefinition | undefined {
  return cardRegistry.find((c) => c.id === cardId);
}

export function getAllCardDefinitions(): CardDefinition[] {
  return cardRegistry;
}

export function getCardsByIssuer(issuer: string): CardDefinition[] {
  const normalized = issuer.toLowerCase();
  return cardRegistry.filter((c) => c.issuer.toLowerCase() === normalized);
}
