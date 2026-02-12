import type { CardDefinition } from "@/lib/types";
import { chaseSapphireReserve } from "./chase-sapphire-reserve";
import { chaseSapphirePreferred } from "./chase-sapphire-preferred";
import { amexGold } from "./amex-gold";
import { amexPlatinum } from "./amex-platinum";
import { citiStrataElite } from "./citi-strata-elite";
import { capitalOneVentureX } from "./capital-one-venture-x";
import { robinhoodGold } from "./robinhood-gold";
import { biltPalladium } from "./bilt-palladium";

export const cardRegistry: CardDefinition[] = [
  chaseSapphireReserve,
  chaseSapphirePreferred,
  amexGold,
  amexPlatinum,
  citiStrataElite,
  capitalOneVentureX,
  robinhoodGold,
  biltPalladium,
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
