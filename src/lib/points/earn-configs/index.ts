import type { EarnConfig } from "../types";
import { csrEarnConfig } from "./chase-sapphire-reserve";
import { cspEarnConfig } from "./chase-sapphire-preferred";
import { cffEarnConfig } from "./chase-freedom-flex";
import { cfuEarnConfig } from "./chase-freedom-unlimited";
import { amexGoldEarnConfig } from "./amex-gold";
import { amexBcpEarnConfig } from "./amex-blue-cash-preferred";
import { amexBceEarnConfig } from "./amex-blue-cash-everyday";
import { amexPlatinumEarnConfig } from "./amex-platinum";
import { citiStrataEliteEarnConfig } from "./citi-strata-elite";
import { citiStrataPremierEarnConfig } from "./citi-strata-premier";
import { citiCustomCashEarnConfig } from "./citi-custom-cash";
import { citiDoubleCashEarnConfig } from "./citi-double-cash";
import { ventureXEarnConfig } from "./capital-one-venture-x";
import { capitalOneVentureEarnConfig } from "./capital-one-venture";
import { robinhoodGoldEarnConfig } from "./robinhood-gold";
import { biltPalladiumEarnConfig } from "./bilt-palladium";
import { discoverItCashBackEarnConfig } from "./discover-it-cash-back";
import { usBankAltitudeConnectEarnConfig } from "./us-bank-altitude-connect";
import { wellsFargoActiveCashEarnConfig } from "./wells-fargo-active-cash";
import { wellsFargoAutographJourneyEarnConfig } from "./wells-fargo-autograph-journey";
import { amexBusinessPlatinumEarnConfig } from "./amex-business-platinum";
import { appleCardEarnConfig } from "./apple-card";
import { capitalOneSavorEarnConfig } from "./capital-one-savor";
import { deltaPlatinumEarnConfig } from "./delta-platinum";
import { hiltonAspireEarnConfig } from "./hilton-aspire";
import { ihgPremierEarnConfig } from "./ihg-premier";
import { inkBusinessPreferredEarnConfig } from "./ink-business-preferred";
import { southwestPriorityEarnConfig } from "./southwest-priority";
import { unitedExplorerEarnConfig } from "./united-explorer";
import { worldOfHyattEarnConfig } from "./world-of-hyatt";

const allConfigs: EarnConfig[] = [
  csrEarnConfig,
  cspEarnConfig,
  cffEarnConfig,
  cfuEarnConfig,
  amexGoldEarnConfig,
  amexBcpEarnConfig,
  amexBceEarnConfig,
  amexPlatinumEarnConfig,
  citiStrataEliteEarnConfig,
  citiStrataPremierEarnConfig,
  citiCustomCashEarnConfig,
  citiDoubleCashEarnConfig,
  ventureXEarnConfig,
  capitalOneVentureEarnConfig,
  robinhoodGoldEarnConfig,
  biltPalladiumEarnConfig,
  discoverItCashBackEarnConfig,
  usBankAltitudeConnectEarnConfig,
  wellsFargoActiveCashEarnConfig,
  wellsFargoAutographJourneyEarnConfig,
  amexBusinessPlatinumEarnConfig,
  appleCardEarnConfig,
  capitalOneSavorEarnConfig,
  deltaPlatinumEarnConfig,
  hiltonAspireEarnConfig,
  ihgPremierEarnConfig,
  inkBusinessPreferredEarnConfig,
  southwestPriorityEarnConfig,
  unitedExplorerEarnConfig,
  worldOfHyattEarnConfig,
];

export function getAllEarnConfigs(): EarnConfig[] {
  return allConfigs;
}

export function getEarnConfig(cardId: string): EarnConfig | undefined {
  return allConfigs.find((c) => c.cardId === cardId);
}
