import type { EarnConfig } from "../types";
import { csrEarnConfig } from "./chase-sapphire-reserve";
import { cspEarnConfig } from "./chase-sapphire-preferred";
import { amexGoldEarnConfig } from "./amex-gold";

const allConfigs: EarnConfig[] = [
  csrEarnConfig,
  cspEarnConfig,
  amexGoldEarnConfig,
];

export function getAllEarnConfigs(): EarnConfig[] {
  return allConfigs;
}

export function getEarnConfig(cardId: string): EarnConfig | undefined {
  return allConfigs.find((c) => c.cardId === cardId);
}
