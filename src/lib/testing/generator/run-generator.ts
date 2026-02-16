/**
 * Standalone Generator Runner
 *
 * Run with: npx ts-node --project tsconfig.test.json src/lib/testing/generator/run-generator.ts
 *
 * Generates fixtures for all 5 starter cards, validates them,
 * and prints summary statistics.
 */

import { generateTransactions } from "./generator";
import { validateFixture } from "./validation";
import { ALL_PERSONAS } from "./personas";

function run() {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("  Transaction Generator — Fixture Generation Report");
  console.log("═══════════════════════════════════════════════════════════\n");

  let totalPassed = 0;
  let totalFailed = 0;
  let totalWarnings = 0;
  let totalTransactions = 0;

  for (const [cardType, personas] of Object.entries(ALL_PERSONAS)) {
    console.log(`\n── ${cardType} ──`);

    for (const persona of personas) {
      const label = `  ${persona.personaName}`;

      try {
        const transactions = generateTransactions(persona);
        const result = validateFixture(transactions, persona);

        totalTransactions += transactions.length;

        if (result.passed) {
          totalPassed++;
          console.log(
            `${label}: ✓ ${transactions.length} transactions generated`,
          );

          // Print compact stats
          const cats = Object.entries(result.stats.categoryCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([cat, count]) => `${cat}:${count}`)
            .join(", ");
          console.log(`    Categories: ${cats}`);

          const benefits = Object.entries(result.stats.benefitTargetCounts);
          if (benefits.length > 0) {
            const benefitStr = benefits
              .map(([b, c]) => `${b}:${c}`)
              .join(", ");
            console.log(`    Benefits targeted: ${benefitStr}`);
          }

          if (result.stats.competitorTransactions > 0) {
            console.log(
              `    Competitor txs: ${result.stats.competitorTransactions}`,
            );
          }

          const edgeCases = Object.entries(result.stats.edgeCaseCounts);
          if (edgeCases.length > 0) {
            const ecStr = edgeCases
              .map(([ec, c]) => `${ec}:${c}`)
              .join(", ");
            console.log(`    Edge cases: ${ecStr}`);
          }

          if (result.warnings.length > 0) {
            totalWarnings += result.warnings.length;
            for (const w of result.warnings) {
              console.log(`    ⚠ [${w.check}] ${w.details}`);
            }
          }

          console.log(
            `    Date range: ${result.stats.dateRange.earliest} → ${result.stats.dateRange.latest}`,
          );
          console.log(
            `    Unique merchants: ${result.stats.uniqueMerchants}`,
          );
        } else {
          totalFailed++;
          console.log(`${label}: ✗ VALIDATION FAILED`);
          for (const e of result.errors) {
            console.log(`    ✗ [${e.check}] ${e.details}`);
          }
          for (const w of result.warnings) {
            totalWarnings++;
            console.log(`    ⚠ [${w.check}] ${w.details}`);
          }
        }
      } catch (err) {
        totalFailed++;
        console.log(
          `${label}: ✗ ERROR: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }
  }

  console.log("\n═══════════════════════════════════════════════════════════");
  console.log(
    `  Results: ${totalPassed} passed, ${totalFailed} failed, ${totalWarnings} warnings`,
  );
  console.log(`  Total transactions generated: ${totalTransactions}`);
  console.log("═══════════════════════════════════════════════════════════");

  if (totalFailed > 0) {
    process.exit(1);
  }
}

run();
