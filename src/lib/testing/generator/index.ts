/**
 * Transaction Generator — Public API
 *
 * Generates deterministic, realistic transaction histories for testing
 * the matching engine, points simulator, and insights generators.
 *
 * Usage:
 *   import { generateFixtureSet, generateAllFixtures } from "@/lib/testing/generator";
 *   const fixture = generateFixtureSet("chase_sapphire_reserve", "maximizer");
 *   console.log(fixture.transactions.length); // ~200-400 transactions
 */

export { generateTransactions } from "./generator";
export type { GeneratorOptions } from "./generator";
export { validateFixture } from "./validation";
export type { ValidationResult, ValidationStats } from "./validation";
export {
  ALL_PERSONAS,
  getPersonasForCard,
  getPersona,
  getCardTypesWithPersonas,
  getPersonaCount,
} from "./personas";

export type {
  Persona,
  GeneratedTransaction,
  FixtureSet,
  ExpectedOutcomes,
  TransactionMeta,
  EdgeCaseSpec,
  EdgeCaseType,
  MonthlySpendProfile,
  BenefitBehavior,
  CompetitorSpendSpec,
} from "./types";

import { generateTransactions } from "./generator";
import { validateFixture } from "./validation";
import { getPersona, getPersonasForCard, getCardTypesWithPersonas } from "./personas";
import type { FixtureSet } from "./types";

/**
 * Generate a complete fixture set for a specific card + persona combination.
 * Runs validation automatically and throws on hard errors.
 */
export function generateFixtureSet(
  cardType: string,
  personaName: string,
): FixtureSet {
  const persona = getPersona(cardType, personaName);
  if (!persona) {
    throw new Error(
      `Persona "${personaName}" not found for card "${cardType}"`,
    );
  }

  const transactions = generateTransactions(persona);
  const validation = validateFixture(transactions, persona);

  if (!validation.passed) {
    const errorSummary = validation.errors
      .map((e) => `  [${e.check}] ${e.details}`)
      .join("\n");
    throw new Error(
      `Fixture validation failed for ${cardType}/${personaName}:\n${errorSummary}`,
    );
  }

  return {
    persona,
    transactions,
    generatedAt: new Date().toISOString(),
    inputHash: "", // TODO: compute from card def + earn config file hashes
  };
}

/**
 * Generate fixture sets for all personas of a given card type.
 */
export function generateFixturesForCard(
  cardType: string,
): FixtureSet[] {
  const personas = getPersonasForCard(cardType);
  return personas.map((p) => generateFixtureSet(cardType, p.personaName));
}

/**
 * Generate fixture sets for ALL cards and personas.
 * Returns a map of cardType → personaName → FixtureSet.
 */
export function generateAllFixtures(): Record<
  string,
  Record<string, FixtureSet>
> {
  const results: Record<string, Record<string, FixtureSet>> = {};

  for (const cardType of getCardTypesWithPersonas()) {
    results[cardType] = {};
    for (const persona of getPersonasForCard(cardType)) {
      results[cardType][persona.personaName] = generateFixtureSet(
        cardType,
        persona.personaName,
      );
    }
  }

  return results;
}
