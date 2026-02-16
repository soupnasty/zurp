import type { Persona } from "../types";

// ── Original 5 (Tier 1 / starter cards) ──
import { csrPersonas } from "./chase-sapphire-reserve";
import { platPersonas } from "./amex-platinum";
import { bcpPersonas } from "./amex-blue-cash-preferred";
import { cffPersonas } from "./chase-freedom-flex";
import { hyattPersonas } from "./world-of-hyatt";

// ── Tier 0 (mid-premium) ──
import { cspPersonas } from "./chase-sapphire-preferred";
import { amexGoldPersonas } from "./amex-gold";
import { csePersonas } from "./citi-strata-elite";
import { cspPremierPersonas } from "./citi-strata-premier";
import { cvxPersonas } from "./capital-one-venture-x";
import { cvPersonas } from "./capital-one-venture";
import { rhgPersonas } from "./robinhood-gold";
import { biltPersonas } from "./bilt-palladium";

// ── Tier 2 (no-fee / low-fee) ──
import { cfuPersonas } from "./chase-freedom-unlimited";
import { abcePersonas } from "./amex-blue-cash-everyday";
import { citiCustomCashPersonas } from "./citi-custom-cash";
import { citiDoubleCashPersonas } from "./citi-double-cash";
import { discoverItPersonas } from "./discover-it-cash-back";
import { usbacPersonas } from "./us-bank-altitude-connect";
import { wfacPersonas } from "./wells-fargo-active-cash";
import { wfajPersonas } from "./wells-fargo-autograph-journey";

// ── Tier 3 (co-brand / specialty) ──
import { abpPersonas } from "./amex-business-platinum";
import { applePersonas } from "./apple-card";
import { savorPersonas } from "./capital-one-savor";
import { deltaPersonas } from "./delta-platinum";
import { hiltonPersonas } from "./hilton-aspire";
import { ihgPersonas } from "./ihg-premier";
import { inkPersonas } from "./ink-business-preferred";
import { southwestPersonas } from "./southwest-priority";
import { unitedPersonas } from "./united-explorer";

/** All personas grouped by card type — 30 cards, 60 personas */
export const ALL_PERSONAS: Record<string, Persona[]> = {
  // Tier 1 (premium)
  chase_sapphire_reserve: csrPersonas,
  amex_platinum: platPersonas,

  // Tier 0 (mid-premium)
  chase_sapphire_preferred: cspPersonas,
  amex_gold: amexGoldPersonas,
  amex_blue_cash_preferred: bcpPersonas,
  citi_strata_elite: csePersonas,
  citi_strata_premier: cspPremierPersonas,
  capital_one_venture_x: cvxPersonas,
  capital_one_venture: cvPersonas,
  robinhood_gold: rhgPersonas,
  bilt_palladium: biltPersonas,

  // Tier 2 (no-fee / low-fee)
  chase_freedom_flex: cffPersonas,
  chase_freedom_unlimited: cfuPersonas,
  amex_blue_cash_everyday: abcePersonas,
  citi_custom_cash: citiCustomCashPersonas,
  citi_double_cash: citiDoubleCashPersonas,
  discover_it_cash_back: discoverItPersonas,
  us_bank_altitude_connect: usbacPersonas,
  wells_fargo_active_cash: wfacPersonas,
  wells_fargo_autograph_journey: wfajPersonas,

  // Tier 3 (co-brand / specialty)
  amex_business_platinum: abpPersonas,
  apple_card: applePersonas,
  capital_one_savor: savorPersonas,
  delta_platinum: deltaPersonas,
  hilton_aspire: hiltonPersonas,
  ihg_premier: ihgPersonas,
  ink_business_preferred: inkPersonas,
  southwest_priority: southwestPersonas,
  united_explorer: unitedPersonas,
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
