import type { EarnConfig } from "../types";
import { csrEarnConfig } from "./chase-sapphire-reserve";
import { cspEarnConfig } from "./chase-sapphire-preferred";
import { cffEarnConfig } from "./chase-freedom-flex";
import { cfuEarnConfig } from "./chase-freedom-unlimited";
import { amexGoldEarnConfig } from "./amex-gold";
import { amexPlatinumEarnConfig } from "./amex-platinum";
import { citiStrataEliteEarnConfig } from "./citi-strata-elite";
import { citiStrataPremierEarnConfig } from "./citi-strata-premier";
import { ventureXEarnConfig } from "./capital-one-venture-x";
import { capitalOneVentureEarnConfig } from "./capital-one-venture";
import { robinhoodGoldEarnConfig } from "./robinhood-gold";
import { biltPalladiumEarnConfig } from "./bilt-palladium";

const allConfigs: EarnConfig[] = [
  csrEarnConfig,
  cspEarnConfig,
  cffEarnConfig,
  cfuEarnConfig,
  amexGoldEarnConfig,
  amexPlatinumEarnConfig,
  citiStrataEliteEarnConfig,
  citiStrataPremierEarnConfig,
  ventureXEarnConfig,
  capitalOneVentureEarnConfig,
  robinhoodGoldEarnConfig,
  biltPalladiumEarnConfig,
];

export function getAllEarnConfigs(): EarnConfig[] {
  return allConfigs;
}

export function getEarnConfig(cardId: string): EarnConfig | undefined {
  return allConfigs.find((c) => c.cardId === cardId);
}
