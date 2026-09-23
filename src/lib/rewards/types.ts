import type { BenefitDefinition } from "@/lib/types";

/** The benefit fields the rewards math needs (a subset of BenefitDefinition). */
export type RewardsBenefit = Pick<
  BenefitDefinition,
  | "id"
  | "name"
  | "type"
  | "creditAmount"
  | "cycle"
  | "sunsetDate"
  | "displayGroup"
  | "displayGroupName"
  | "activeMonths"
  | "autoMatchable"
  | "requiresActivation"
>;

/** One benefit_usage row. */
export interface UsageRow {
  benefitId: string;
  periodKey: string;
  cycleStart: Date;
  cycleEnd: Date;
  amountUsed: number;
  amountRemaining: number;
  updatedAt: Date;
}

/** A subscription benefit the user activated (benefit_overrides ACTIVATED:MM-YYYY). */
export interface Activation {
  benefitId: string;
  /** First day of the activation month, UTC. */
  activatedAt: Date;
}

export interface CardYear {
  start: Date;
  end: Date;
  /** True when no anniversary date is known and the calendar year stands in. */
  estimated: boolean;
}

/**
 * Credits shown as one row: DoorDash's sub-credits share a displayGroup,
 * and expandCycles variants (StubHub H1/H2) share a name.
 */
export function creditKey(b: RewardsBenefit): string {
  return b.displayGroup ?? b.name;
}

export function creditName(b: RewardsBenefit): string {
  return b.displayGroupName ?? b.name;
}

/** Whether a benefit still exists on `date` (sunsetDate is its last day). */
export function isLiveOn(b: RewardsBenefit, date: Date): boolean {
  if (!b.sunsetDate) return true;
  return date.getTime() <= Date.parse(`${b.sunsetDate}T23:59:59.999Z`);
}

export const round2 = (n: number) => Math.round(n * 100) / 100;
