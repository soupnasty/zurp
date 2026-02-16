/**
 * Dump All Unique Bug Patterns
 *
 * Similar to run-integration.ts but outputs ALL unique mismatches grouped by layer,
 * sorted by count descending, with full detail for each.
 *
 * Run: npx ts-node --project tsconfig.test.json -r tsconfig-paths/register dump-bugs.ts
 */

import { generateTransactions } from "./src/lib/testing/generator/generator";
import { ALL_PERSONAS } from "./src/lib/testing/generator/personas";
import { getCardDefinition } from "./src/lib/cards";
import { getEarnConfig } from "./src/lib/points/earn-configs";
import { testClassification } from "./src/lib/testing/integration/classification-layer";
import { testNormalization } from "./src/lib/testing/integration/normalization-layer";
import { testMatching } from "./src/lib/testing/integration/matching-layer";
import { testCalculation } from "./src/lib/testing/integration/calculation-layer";
import type { Mismatch } from "./src/lib/testing/integration/types";

interface BugGroup {
  layer: string;
  key: string;
  mismatches: Mismatch[];
  count: number;
}

function run() {
  console.log(
    "═══════════════════════════════════════════════════════════",
  );
  console.log(
    "  Full Bug Dump — All Unique Patterns",
  );
  console.log(
    "═══════════════════════════════════════════════════════════\n",
  );

  let totalTransactions = 0;
  let totalPersonas = 0;
  const allBugs: Mismatch[] = [];

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

        // Collect only bugs (severity === "bug")
        const bugs = [
          ...classResult.mismatches,
          ...normResult.mismatches,
          ...matchResult.mismatches,
          ...calcResult.mismatches,
        ].filter(m => m.severity === "bug");

        allBugs.push(...bugs);

        const totalFailed = bugs.length;

        if (totalFailed === 0) {
          console.log(
            `  ${label}: ✓ ${transactions.length} txs`,
          );
        } else {
          console.log(
            `  ${label}: ⚠ ${transactions.length} txs | ${totalFailed} bugs`,
          );
        }
      } catch (err) {
        console.log(
          `  ${label}: ✗ ERROR: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }
  }

  // Group bugs by layer + key (expected + actual)
  const bugsByLayer = new Map<string, BugGroup[]>();

  for (const bug of allBugs) {
    const key = `${bug.expected}|${bug.actual}`;
    const groupKey = `${bug.layer}`;

    if (!bugsByLayer.has(groupKey)) {
      bugsByLayer.set(groupKey, []);
    }

    const groups = bugsByLayer.get(groupKey)!;
    const existing = groups.find(g => g.key === key);

    if (existing) {
      existing.mismatches.push(bug);
      existing.count++;
    } else {
      groups.push({
        layer: bug.layer,
        key,
        mismatches: [bug],
        count: 1,
      });
    }
  }

  // Print results by layer
  console.log(
    "\n═══════════════════════════════════════════════════════════",
  );
  console.log(
    `  ${totalTransactions.toLocaleString()} transactions across ${totalPersonas} personas`,
  );
  console.log(
    `  Total Bugs: ${allBugs.length}`,
  );

  if (allBugs.length > 0) {
    // Print each layer separately
    const layers = ["classification", "normalization", "matching", "calculation"];

    for (const layerName of layers) {
      const groups = bugsByLayer.get(layerName) ?? [];
      if (groups.length === 0) continue;

      // Sort by count descending
      groups.sort((a, b) => b.count - a.count);

      console.log(`\n  ── ${layerName.toUpperCase()} (${groups.length} unique patterns, ${groups.reduce((sum, g) => sum + g.count, 0)} total) ──`);

      for (const group of groups) {
        const example = group.mismatches[0];
        const countStr = group.count > 1 ? ` (×${group.count})` : "";
        console.log(`\n    Pattern${countStr}:`);
        console.log(`      Expected: ${group.key.split("|")[0]}`);
        console.log(`      Actual:   ${group.key.split("|")[1]}`);
        console.log(`      Detail:   ${example.detail}`);
        console.log(`      Example:  TX=${example.txId}, Merchant="${example.merchant}", Card=${example.card}, Persona=${example.persona}`);

        // Show up to 3 more example IDs if count > 1
        if (group.count > 1 && group.mismatches.length > 1) {
          const extraExamples = group.mismatches.slice(1, 4);
          for (const extra of extraExamples) {
            console.log(`                TX=${extra.txId}, Merchant="${extra.merchant}"`);
          }
          if (group.count > 4) {
            console.log(`                ... and ${group.count - 4} more`);
          }
        }
      }
    }
  }

  console.log(
    "\n═══════════════════════════════════════════════════════════",
  );
}

run();
