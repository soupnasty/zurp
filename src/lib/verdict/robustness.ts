import type {
  BenefitAssumptionMode,
  CardSimulation,
  ValuationMode,
} from "@/lib/points/types";
import { decideVerdict, type VerdictState } from "./decide";

const V_MODES: ValuationMode[] = ["conservative", "realistic", "upside"];
const B_MODES: BenefitAssumptionMode[] = ["proven", "my_picks", "all_credits"];

export interface Robustness {
  /** Assumption settings that give the same verdict as the chosen one. */
  holds: number;
  total: number;
  /** Settings that give a different verdict. */
  flips: { vMode: ValuationMode; bMode: BenefitAssumptionMode; state: VerdictState }[];
}

/**
 * How sensitive the verdict is to the assumptions: re-decide under every
 * valuation × benefit setting and count the ones that agree.
 */
export function verdictRobustness(
  cards: CardSimulation[],
  usersCardId: string,
  vMode: ValuationMode,
  bMode: BenefitAssumptionMode,
  monthCount: number
): Robustness | null {
  const chosen = decideVerdict(cards, usersCardId, vMode, bMode, monthCount);
  if (!chosen) return null;

  const flips: Robustness["flips"] = [];
  for (const v of V_MODES) {
    for (const b of B_MODES) {
      const state = decideVerdict(cards, usersCardId, v, b, monthCount)!.raw;
      if (state !== chosen.raw) flips.push({ vMode: v, bMode: b, state });
    }
  }
  const total = V_MODES.length * B_MODES.length;
  return { holds: total - flips.length, total, flips };
}
