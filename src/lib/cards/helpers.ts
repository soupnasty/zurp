import type { BenefitCycle, BenefitDefinition } from "@/lib/types";

/** Fields that `defineBenefit` provides sensible defaults for. */
type DefaultedFields =
  | "cardId"
  | "carriesOver"
  | "maxCarryoverPeriods"
  | "maxAccrued"
  | "plaidCategories"
  | "sourceUrl"
  | "displayGroup"
  | "displayGroupName"
  | "displayGroupIcon"
  | "notes"
  | "sunsetDate"
  | "details";

/** Benefit config with defaults pre-filled for common null/false/[] fields. */
export type BenefitInput = Omit<BenefitDefinition, DefaultedFields> &
  Partial<Pick<BenefitDefinition, DefaultedFields>>;

/** Create a fully-populated BenefitDefinition, filling in common defaults. */
export function defineBenefit(
  cardId: string,
  input: BenefitInput,
): BenefitDefinition {
  return {
    carriesOver: false,
    maxCarryoverPeriods: null,
    maxAccrued: null,
    plaidCategories: [],
    sourceUrl: null,
    displayGroup: null,
    displayGroupName: null,
    displayGroupIcon: null,
    notes: null,
    sunsetDate: null,
    details: null,
    ...input,
    cardId,
  };
}

/** Override fields per cycle variant. */
export interface CycleVariant {
  id: string;
  cycle: BenefitCycle;
  description: string;
  name?: string;
  notes?: string | null;
}

/**
 * Expand one base config into N BenefitDefinitions, one per cycle variant.
 * The base must not include `id`, `cycle`, or `description` — those come from each variant.
 */
export function expandCycles(
  cardId: string,
  base: Omit<BenefitInput, "id" | "cycle" | "description">,
  variants: CycleVariant[],
): BenefitDefinition[] {
  return variants.map((v) =>
    defineBenefit(cardId, {
      ...base,
      id: v.id,
      cycle: v.cycle,
      description: v.description,
      ...(v.name !== undefined && { name: v.name }),
      ...(v.notes !== undefined && { notes: v.notes }),
    }),
  );
}
