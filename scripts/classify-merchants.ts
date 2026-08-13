/**
 * Tier L backfill + model eval. Spec: docs/engines/llm-classification-tier.md
 *
 * Backfill (classifies every candidate with the default model, upserts):
 *   npx tsx scripts/classify-merchants.ts
 *
 * Model eval gate (spec §7 — no writes; compares Haiku vs Sonnet on the
 * top-spend candidates and prints the disagreement table):
 *   npx tsx scripts/classify-merchants.ts --eval [count]
 *
 * Requires DATABASE_URL and ANTHROPIC_API_KEY in .env.local.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

async function main() {
  const {
    collectClassificationCandidates,
    getMerchantClassificationsMap,
    classifyMerchantBatch,
    classifyAndPersist,
    llmClassifierEnabled,
    LLM_CLASSIFIER_MODEL,
  } = await import("../src/lib/points/llm-classifier");
  const { db } = await import("../src/db");
  const { and, eq } = await import("drizzle-orm");
  const schema = await import("../src/db/schema");
  const { categoryNotExcluded } = await import("../src/lib/points/tx-filter");

  if (!llmClassifierEnabled()) {
    throw new Error("ANTHROPIC_API_KEY is required (put it in .env.local)");
  }

  const txs = await db.query.transactions.findMany({
    where: and(
      eq(schema.transactions.pending, false),
      eq(schema.transactions.isAnnualFee, false),
      categoryNotExcluded()
    ),
    columns: {
      merchantName: true,
      merchantEntityId: true,
      amount: true,
      plaidCategoryPrimary: true,
      plaidCategoryDetailed: true,
      paymentChannel: true,
    },
  });

  const existing = await getMerchantClassificationsMap();
  const candidates = collectClassificationCandidates(txs, existing);
  console.log(
    `${candidates.length} candidate merchants (${existing.size} already cached)`
  );
  if (candidates.length === 0) return;

  const evalIdx = process.argv.indexOf("--eval");
  if (evalIdx !== -1) {
    const count = parseInt(process.argv[evalIdx + 1] ?? "100", 10) || 100;
    const sample = candidates.slice(0, count);
    const models = ["claude-haiku-4-5", "claude-sonnet-5"] as const;

    const answers = new Map<string, Map<string, string>>();
    for (const model of models) {
      const results = new Map<string, string>();
      for (let i = 0; i < sample.length; i += 50) {
        for (const [k, v] of await classifyMerchantBatch(
          sample.slice(i, i + 50),
          model
        )) {
          results.set(k, v);
        }
      }
      answers.set(model, results);
      console.log(`${model}: ${results.size}/${sample.length} classified`);
    }

    const [haiku, sonnet] = models.map((m) => answers.get(m)!);
    let agree = 0;
    const disagreements: string[] = [];
    for (const c of sample) {
      const h = haiku.get(c.key) ?? "(missing)";
      const s = sonnet.get(c.key) ?? "(missing)";
      if (h === s) {
        agree++;
      } else {
        disagreements.push(
          `  ${c.merchant.padEnd(36)} haiku=${h.padEnd(16)} sonnet=${s}`
        );
      }
    }
    console.log(
      `\nAgreement: ${agree}/${sample.length} (${((agree / sample.length) * 100).toFixed(1)}%)`
    );
    console.log(`\nDisagreements (${disagreements.length}):`);
    for (const line of disagreements) console.log(line);
    console.log(
      "\nNo rows were written. Per spec §7: record the result in " +
        "docs/engines/llm-classification-tier.md, then run the backfill."
    );
    return;
  }

  console.log(`Backfilling with ${LLM_CLASSIFIER_MODEL}...`);
  const persisted = await classifyAndPersist(candidates);
  console.log(
    `Persisted ${persisted}/${candidates.length}. ` +
      "Run scripts/refresh-simulations.ts (or wait for next syncs) to apply, " +
      "then scripts/classification-report.ts to measure."
  );
}

main().then(() => process.exit(0));
