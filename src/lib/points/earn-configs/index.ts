import type { EarnConfig } from "../types";
import { csrEarnConfig } from "./chase-sapphire-reserve";
import { cspEarnConfig } from "./chase-sapphire-preferred";
import { amexGoldEarnConfig } from "./amex-gold";
import { amexPlatinumEarnConfig } from "./amex-platinum";
import { citiStrataEliteEarnConfig } from "./citi-strata-elite";
import { ventureXEarnConfig } from "./capital-one-venture-x";
import { capitalOneVentureEarnConfig } from "./capital-one-venture";
import { robinhoodGoldEarnConfig } from "./robinhood-gold";
import { biltPalladiumEarnConfig } from "./bilt-palladium";

const allConfigs: EarnConfig[] = [
  csrEarnConfig,
  cspEarnConfig,
  amexGoldEarnConfig,
  amexPlatinumEarnConfig,
  citiStrataEliteEarnConfig,
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
