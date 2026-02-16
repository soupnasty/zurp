/**
 * Integration Test Runner
 *
 * Feeds ~20K generated fixture transactions through 4 production engine layers:
 *   1. Classification (classifyForPoints)
 *   2. Normalization (normalizeMerchantName)
 *   3. Matching (runMatcher)
 *   4. Calculation (calculatePointsForTransaction)
 *
 * Compares results against _meta oracle values and reports mismatches
 * categorized by severity: bug | gap | oracle_error.
 *
 * Run: npx ts-node --project tsconfig.test.json src/lib/testing/integration/run-integration.ts
 */

import { generateTransactions } from "../generator/generator";
import { ALL_PERSONAS } from "../generator/personas";
import { getCardDefinition } from "../../cards";
import { getEarnConfig } from "../../points/earn-configs";
import { testClassification } from "./classification-layer";
import { testNormalization } from "./normalization-layer";
import { testMatching } from "./matching-layer";
import { testCalculation } from "./calculation-layer";
import type { LayerResult, Mismatch } from "./types";

interface Summary {
  bugs: Mismatch[];
  gaps: Mismatch[];
  oracleErrors: Mismatch[];
}

function formatLayerCompact(r: LayerResult): string {
  const total = r.passed + r.failed;
  if (total === 0) return `${r.layer.slice(0, 5)}: -`;

  const tag = r.layer.slice(0, 5);
  if (r.failed === 0) {
    return `${tag}: ${r.passed}/${total}`;
  }

  // Summarize failure types
  const bugs = r.mismatches.filter((m) => m.severity === "bug").length;
  const gaps = r.mismatches.filter((m) => m.severity === "gap").length;
  const oracle = r.mismatches.filter((m) => m.severity === "oracle_error").length;
  const parts: string[] = [];
  if (bugs > 0) parts.push(`${bugs}b`);
  if (gaps > 0) parts.push(`${gaps}g`);
  if (oracle > 0) parts.push(`${oracle}o`);

  return `${tag}: ${r.passed}/${total} [${parts.join(",")}]`;
}

function run() {
  console.log(
    "═══════════════════════════════════════════════════════════",
  );
  console.log(
    "  Integration Test — Fixtures × 4 Engine Layers",
  );
  console.log(
    "═══════════════════════════════════════════════════════════\n",
  );

  let totalTransactions = 0;
  let totalPersonas = 0;
  const allMismatches: Mismatch[] = [];

  for (const [cardType, personas] of Object.entries(ALL_PERSONAS)) {
    console.log(`\n── ${cardType} ──`);

    const cardDef = getCardDefinition(cardType);
    const earnConfig = getEarnConfig(cardType);

    if (!cardDef) {
      console.log(`  ✗ Card definition not found for "${cardType}"`);
      continue;
    }

    for (const persona of personas) {
      totalPersonas++;
      const label = persona.personaName;

      try {
        // Generate transactions
        const transactions = generateTransactions(persona);
        totalTransactions += transactions.length;

        // Run all 4 layers
        const classResult = testClassification(
          transactions,
          cardType,
          label,
        );
        const normResult = testNormalization(
          transactions,
          cardType,
          label,
        );
        const matchResult = testMatching(
          transactions,
          cardDef,
          persona,
          cardType,
          label,
        );
        const calcResult = testCalculation(
          transactions,
          earnConfig,
          cardType,
          label,
        );

        // Collect all mismatches
        const personaMismatches = [
          ...classResult.mismatches,
          ...normResult.mismatches,
          ...matchResult.mismatches,
          ...calcResult.mismatches,
        ];
        allMismatches.push(...personaMismatches);

        // Format output
        const totalFailed =
          classResult.failed +
          normResult.failed +
          matchResult.failed +
          calcResult.failed;

        const layers = [classResult, normResult, matchResult, calcResult]
          .map(formatLayerCompact)
          .join(" | ");

        if (totalFailed === 0) {
          console.log(
            `  ${label}: ✓ ${transactions.length} txs | ${layers}`,
          );
        } else {
          console.log(
            `  ${label}: ⚠ ${transactions.length} txs | ${layers}`,
          );
        }
      } catch (err) {
        console.log(
          `  ${label}: ✗ ERROR: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }
  }

  // ── Final Summary ──
  const summary: Summary = {
    bugs: allMismatches.filter((m) => m.severity === "bug"),
    gaps: allMismatches.filter((m) => m.severity === "gap"),
    oracleErrors: allMismatches.filter((m) => m.severity === "oracle_error"),
  };

  console.log(
    "\n═══════════════════════════════════════════════════════════",
  );
  console.log(
    `  ${totalTransactions.toLocaleString()} transactions across ${totalPersonas} personas`,
  );
  console.log(
    `  Bugs: ${summary.bugs.length} | Gaps: ${summary.gaps.length} | Oracle errors: ${summary.oracleErrors.length}`,
  );

  // Print bugs (production issues that need fixing)
  if (summary.bugs.length > 0) {
    console.log(`\n  PRODUCTION BUGS (${summary.bugs.length}):`);

    // Deduplicate by detail to avoid repetitive output
    const uniqueBugs = new Map<string, { mismatch: Mismatch; count: number }>();
    for (const m of summary.bugs) {
      // Group by layer + expected + actual for dedup
      const key = `${m.layer}|${m.expected}|${m.actual}`;
      const existing = uniqueBugs.get(key);
      if (existing) {
        existing.count++;
      } else {
        uniqueBugs.set(key, { mismatch: m, count: 1 });
      }
    }

    const sorted = [...uniqueBugs.values()].sort(
      (a, b) => b.count - a.count,
    );

    for (const { mismatch: m, count } of sorted.slice(0, 15)) {
      const countStr = count > 1 ? ` (×${count})` : "";
      console.log(
        `    [${m.layer}] ${m.detail}${countStr}`,
      );
    }

    if (sorted.length > 15) {
      console.log(
        `    ... and ${sorted.length - 15} more unique bug patterns`,
      );
    }
  }

  // Print oracle errors
  if (summary.oracleErrors.length > 0) {
    console.log(`\n  ORACLE ERRORS (${summary.oracleErrors.length}):`);
    const unique = new Map<string, { m: Mismatch; count: number }>();
    for (const m of summary.oracleErrors) {
      const key = `${m.layer}|${m.expected}`;
      const existing = unique.get(key);
      if (existing) existing.count++;
      else unique.set(key, { m, count: 1 });
    }
    for (const { m, count } of [...unique.values()].slice(0, 10)) {
      const countStr = count > 1 ? ` (×${count})` : "";
      console.log(`    [${m.layer}] ${m.detail}${countStr}`);
    }
  }

  // Print gap summary (compact, not actionable yet)
  if (summary.gaps.length > 0) {
    // Group gaps by layer
    const gapsByLayer = new Map<string, number>();
    for (const m of summary.gaps) {
      gapsByLayer.set(m.layer, (gapsByLayer.get(m.layer) ?? 0) + 1);
    }
    const gapParts = [...gapsByLayer.entries()]
      .map(([layer, count]) => `${layer}: ${count}`)
      .join(", ");
    console.log(`\n  GAPS (${summary.gaps.length}): ${gapParts}`);
  }

  console.log(
    "═══════════════════════════════════════════════════════════",
  );

  // Exit with error only if there are production bugs
  if (summary.bugs.length > 0) {
    process.exit(1);
  }
}

run();
