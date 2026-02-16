import type { Persona } from "../types";

import { csrPersonas } from "./chase-sapphire-reserve";
import { platPersonas } from "./amex-platinum";
import { bcpPersonas } from "./amex-blue-cash-preferred";
import { cffPersonas } from "./chase-freedom-flex";
import { hyattPersonas } from "./world-of-hyatt";

/** All personas grouped by card type */
export const ALL_PERSONAS: Record<string, Persona[]> = {
  chase_sapphire_reserve: csrPersonas,
  amex_platinum: platPersonas,
  amex_blue_cash_preferred: bcpPersonas,
  chase_freedom_flex: cffPersonas,
  world_of_hyatt: hyattPersonas,
};

/** Get all personas for a specific card type */
export function getPersonasForCard(cardType: string): Persona[] {
  return ALL_PERSONAS[cardType] ?? [];
}

/** Get a specific persona by card type + persona name */
export function getPersona(
  cardType: string,
  personaName: string,
): Persona | undefined {
  return ALL_PERSONAS[cardType]?.find((p) => p.personaName === personaName);
}

/** Get all card types that have personas defined */
export function getCardTypesWithPersonas(): string[] {
  return Object.keys(ALL_PERSONAS);
}

/** Total persona count */
export function getPersonaCount(): number {
  return Object.values(ALL_PERSONAS).reduce(
    (sum, personas) => sum + personas.length,
    0,
  );
}
