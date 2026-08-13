/**
 * Tier L — LLM merchant-classification cache.
 * Spec: docs/engines/llm-classification-tier.md
 *
 * One classification per unique merchant, cached globally in the
 * merchant_classifications table. The classifier itself (classifyForPoints)
 * only ever reads the cache via ClassifyContext — all network I/O lives
 * here, off the request path, and never blocks or fails a sync.
 */
import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { classifyForPoints } from "./categories";
import { isEarnCategory } from "./category-labels";
import { isPaymentTransaction } from "./calculator";
import { normalizeMerchantName } from "@/lib/engine/normalize";
import { EARN_CATEGORY_LABELS } from "./category-labels";
import type { EarnCategory } from "./types";

/** Default model. Tunable per spec §0; the eval gate is spec §7. */
export const LLM_CLASSIFIER_MODEL = "claude-sonnet-5";

/** Bound per-sync cost/latency; the backlog is handled by the backfill script. */
const MAX_MERCHANTS_PER_RUN = 200;
const BATCH_SIZE = 50;

export interface ClassifiableTx {
  merchantName: string | null;
  merchantEntityId: string | null;
  amount: number;
  plaidCategoryPrimary: string | null;
  plaidCategoryDetailed: string | null;
  paymentChannel: string | null;
}

/** Tier L cache key: stable Plaid entity ID when present, else normalized name. */
export function merchantKeyFor(
  merchantEntityId: string | null,
  merchantName: string | null
): string | null {
  if (merchantEntityId) return `ent:${merchantEntityId}`;
  const normalized = normalizeMerchantName(merchantName);
  return normalized || null;
}

/** Load the global cache as a lookup map for ClassifyContext. */
export async function getMerchantClassificationsMap(): Promise<
  Map<string, EarnCategory>
> {
  const rows = await db.query.merchantClassifications.findMany({
    columns: { merchantKey: true, category: true },
  });
  const map = new Map<string, EarnCategory>();
  for (const row of rows) {
    if (isEarnCategory(row.category)) map.set(row.merchantKey, row.category);
  }
  return map;
}

export interface ClassificationCandidate {
  key: string;
  /** Most frequent display string among the key's transactions. */
  merchant: string;
  plaidHint: string | null;
}

/**
 * Collect merchants worth sending to the LLM: purchases whose classification
 * lands in the fallback tier or the coarse Plaid-primary tier (which the LLM
 * may refine), excluding keys already in the cache — including "other" rows,
 * which are recorded abstentions, not gaps.
 *
 * User overrides are deliberately not consulted: the cache is global.
 */
export function collectClassificationCandidates(
  txs: ClassifiableTx[],
  existing: ReadonlyMap<string, EarnCategory>
): ClassificationCandidate[] {
  const groups = new Map<
    string,
    { names: Map<string, number>; hint: string | null; spend: number }
  >();

  for (const tx of txs) {
    if (tx.amount <= 0 || isPaymentTransaction(tx)) continue;

    const key = merchantKeyFor(tx.merchantEntityId, tx.merchantName);
    if (!key || existing.has(key)) continue;

    const assignment = classifyForPoints(
      tx.merchantName,
      tx.plaidCategoryPrimary,
      tx.plaidCategoryDetailed,
      {
        paymentChannel: tx.paymentChannel,
        merchantEntityId: tx.merchantEntityId,
        llmClassifications: existing,
      }
    );
    const isGap =
      assignment.matchSource === "fallback" ||
      (assignment.matchSource === "plaid_category" &&
        assignment.confidence === "low");
    if (!isGap) continue;

    const group = groups.get(key) ?? { names: new Map(), hint: null, spend: 0 };
    const display = tx.merchantName ?? key;
    group.names.set(display, (group.names.get(display) ?? 0) + 1);
    group.hint ??= tx.plaidCategoryDetailed ?? tx.plaidCategoryPrimary;
    group.spend += tx.amount;
    groups.set(key, group);
  }

  // Highest-spend merchants first, so a capped run classifies what matters.
  return [...groups.entries()]
    .sort((a, b) => b[1].spend - a[1].spend)
    .map(([key, g]) => ({
      key,
      merchant:
        [...g.names.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? key,
      plaidHint: g.hint,
    }));
}

const TAXONOMY = Object.entries(EARN_CATEGORY_LABELS)
  .map(([key, label]) => `- ${key}: ${label}`)
  .join("\n");

const SYSTEM_PROMPT = `You classify US credit-card merchant descriptors into spending categories for a card-rewards simulator.

For each input merchant, pick exactly one category key from this taxonomy:
${TAXONOMY}

Rules:
- The errors are asymmetric: a wrong bonus category silently inflates a card's simulated earnings, while "other" (not bonus-eligible spend) safely earns base rate. When you are not confident what a merchant is, answer "other".
- "other" is also the correct answer for spend that earns no card bonus: rent, government fees, tuition, professional services, credit bureaus, software subscriptions, liquor stores, car dealerships, donations, financial services.
- plaid_hint is Plaid's category guess for one of this merchant's transactions — useful context, but it can be wrong or overly generic; you may contradict it.
- Echo each input's "key" unchanged.`;

const RESULT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["classifications"],
  properties: {
    classifications: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["key", "category"],
        properties: {
          key: { type: "string" },
          category: { enum: Object.keys(EARN_CATEGORY_LABELS) },
        },
      },
    },
  },
} as const;

/**
 * Classify one batch of candidates. Returns validated results only —
 * unknown keys or invalid categories from the model are dropped.
 */
export async function classifyMerchantBatch(
  candidates: ClassificationCandidate[],
  model: string = LLM_CLASSIFIER_MODEL
): Promise<Map<string, EarnCategory>> {
  const client = new Anthropic();
  const sentKeys = new Set(candidates.map((c) => c.key));

  const response = await client.messages.create({
    model,
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    output_config: { format: { type: "json_schema", schema: RESULT_SCHEMA } },
    messages: [
      {
        role: "user",
        content: JSON.stringify(
          candidates.map((c) => ({
            key: c.key,
            merchant: c.merchant,
            plaid_hint: c.plaidHint,
          }))
        ),
      },
    ],
  });

  const results = new Map<string, EarnCategory>();
  if (response.stop_reason === "refusal") return results;

  const text = response.content.find((b) => b.type === "text")?.text;
  if (!text) return results;

  const parsed = JSON.parse(text) as {
    classifications: { key: string; category: string }[];
  };
  for (const item of parsed.classifications) {
    if (sentKeys.has(item.key) && isEarnCategory(item.category)) {
      results.set(item.key, item.category);
    }
  }
  return results;
}

export function llmClassifierEnabled(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

let disabledLogged = false;

/**
 * The post-sync hook: collect unclassified merchants from the given
 * transactions, classify them in batches, and upsert the cache. Errors are
 * logged and swallowed — a failed run just retries the same merchants on a
 * later sync, because they remain absent from the cache.
 */
export async function runLlmClassification(txs: ClassifiableTx[]): Promise<void> {
  if (!llmClassifierEnabled()) {
    if (!disabledLogged) {
      console.log("[llm-classifier] ANTHROPIC_API_KEY not set — Tier L disabled");
      disabledLogged = true;
    }
    return;
  }

  const existing = await getMerchantClassificationsMap();
  const candidates = collectClassificationCandidates(txs, existing).slice(
    0,
    MAX_MERCHANTS_PER_RUN
  );
  if (candidates.length === 0) return;

  console.log(`[llm-classifier] classifying ${candidates.length} merchants`);
  await classifyAndPersist(candidates);
}

/**
 * Classify candidates in batches and upsert the cache. Per-batch failures
 * are logged and skipped. Returns the number of rows persisted.
 */
export async function classifyAndPersist(
  candidates: ClassificationCandidate[],
  model: string = LLM_CLASSIFIER_MODEL
): Promise<number> {
  let persisted = 0;
  for (let i = 0; i < candidates.length; i += BATCH_SIZE) {
    const batch = candidates.slice(i, i + BATCH_SIZE);
    try {
      const results = await classifyMerchantBatch(batch, model);
      const hintsByKey = new Map(batch.map((c) => [c.key, c.plaidHint]));
      for (const [merchantKey, category] of results) {
        await db
          .insert(schema.merchantClassifications)
          .values({
            merchantKey,
            category,
            plaidHint: hintsByKey.get(merchantKey) ?? null,
            model,
          })
          .onConflictDoUpdate({
            target: schema.merchantClassifications.merchantKey,
            set: { category, model, classifiedAt: new Date() },
          });
        persisted++;
      }
    } catch (err) {
      console.error("[llm-classifier] batch failed (will retry next sync):", err);
    }
  }
  return persisted;
}
