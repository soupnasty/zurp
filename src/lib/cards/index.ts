import type { CardDefinition } from "@/lib/types";
import { chaseSapphireReserve } from "./chase-sapphire-reserve";
import { chaseSapphirePreferred } from "./chase-sapphire-preferred";
import { amexGold } from "./amex-gold";

export const cardRegistry: CardDefinition[] = [
  chaseSapphireReserve,
  chaseSapphirePreferred,
  amexGold,
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
