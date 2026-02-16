/**
 * Standalone validation script for the merchant registry.
 * Runs normalization and classification checks against all templates.
 */
import { normalizeMerchantName } from "@/lib/engine/normalize";
import { classifyForPoints } from "@/lib/points/categories";
import { getAllMerchants, getRegistryStats } from "@/lib/testing/merchants";
import { cardRegistry } from "@/lib/cards";

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    passed++;
  } else {
    failed++;
    console.error(`  FAIL: ${msg}`);
  }
}

const allMerchants = getAllMerchants();
const stats = getRegistryStats();
console.log(`\nRegistry: ${stats.totalTemplates} templates, ${stats.totalVariants} variants, ${stats.totalEdgeCases} edge cases\n`);

// ── Normalization ──
console.log("=== Normalization ===");
for (const t of allMerchants) {
  if (t.plaidMerchantName) {
    const normalized = normalizeMerchantName(t.plaidMerchantName);
    assert(
      normalized.includes(t.normalizedResult),
      `[${t.merchantKey}] normalize("${t.plaidMerchantName}") = "${normalized}" does not contain "${t.normalizedResult}"`
    );
  }
  for (const variant of t.nameVariants) {
    const normalized = normalizeMerchantName(variant);
    assert(normalized !== "", `[${t.merchantKey}] variant "${variant}" → empty`);
  }
  if (t.edgeCases) {
    for (const ec of t.edgeCases) {
      const normalized = normalizeMerchantName(ec.rawName);
      assert(normalized === ec.normalizedOutput, `[${t.merchantKey}] edge "${ec.rawName}" → "${normalized}" (expected "${ec.normalizedOutput}")`);
    }
  }
}

// ── Classification (simulating zurp's merchant_name || name fallback) ──
console.log("\n=== Classification ===");
for (const t of allMerchants) {
  // In production: merchantName = tx.merchant_name || tx.name
  // plaidMerchantName = Plaid's enriched merchant_name (can be null)
  // nameVariants[0] = realistic raw bank name (Plaid's name field)
  const effectiveName = t.plaidMerchantName ?? t.nameVariants[0] ?? null;
  const assignment = classifyForPoints(effectiveName, t.plaidCategoryPrimary, t.plaidCategoryDetailed);
  assert(
    assignment.category === t.expectedEarnCategory,
    `[${t.merchantKey}] classified as "${assignment.category}" (expected "${t.expectedEarnCategory}") via ${assignment.matchSource}="${assignment.matchedValue}" (input="${effectiveName}")`
  );
}

// ── Coverage ──
console.log("\n=== Coverage ===");
const allPatterns = new Set<string>();
for (const card of cardRegistry) {
  for (const benefit of card.benefits) {
    for (const pattern of benefit.merchantPatterns) allPatterns.add(pattern.toLowerCase());
  }
}
const covered = new Set<string>();
for (const m of allMerchants) {
  for (const p of m.matchesBenefitPatterns) covered.add(p.toLowerCase());
}
const uncovered = [...allPatterns].filter((p) => !covered.has(p));
const pct = ((allPatterns.size - uncovered.length) / allPatterns.size) * 100;
console.log(`Coverage: ${pct.toFixed(1)}% (${allPatterns.size - uncovered.length}/${allPatterns.size})`);
if (uncovered.length > 0) {
  console.log("Uncovered:", uncovered.sort().join(", "));
}
assert(pct >= 80, `Coverage ${pct.toFixed(1)}% < 80%`);

// ── Summary ──
console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
process.exit(failed > 0 ? 1 : 0);
