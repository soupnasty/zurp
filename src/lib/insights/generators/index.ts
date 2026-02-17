import type { InsightCandidate } from "../types";
import type { GeneratorContext, InsightGenerator } from "./types";
import { generateA1 } from "./a1-competitor-redirect";
import { generateA2 } from "./a2-subscription-swap";
import { generateB1 } from "./b1-unused-credit";
import { generateB2 } from "./b2-nearly-maxed";
import { generateB3 } from "./b3-underused-credit";
import { generateB4 } from "./b4-benefit-renewal";
import { generateC0 } from "./c0-value-snapshot";
import { generateC1 } from "./c1-benefit-maxed";
import { generateC2 } from "./c2-roi-milestone";
import { generateP1 } from "./p1-points-highlight";
import { generateP2 } from "./p2-missed-bonus";
import { generateA3 } from "./a3-wrong-card";

const generators: InsightGenerator[] = [
  generateA1,
  generateA2,
  generateP2,
  generateA3,
  generateB1,
  generateB2,
  generateB3,
  generateB4,
  generateC0,
  generateC1,
  generateC2,
  generateP1,
];

/**
 * Run all registered generators and return combined candidates.
 */
export function runAllGenerators(ctx: GeneratorContext): InsightCandidate[] {
  const candidates: InsightCandidate[] = [];
  for (const gen of generators) {
    candidates.push(...gen(ctx));
  }
  return candidates;
}

/** Register a new generator (used by C0 in Phase 5). */
export function registerGenerator(gen: InsightGenerator) {
  generators.push(gen);
}
