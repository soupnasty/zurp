# LLM Classification Tier (Tier L)

Status: **spec — not yet implemented**
Owner surface: `src/lib/points/` (classification), `src/db/schema.ts` (storage)
Related: `docs/engines/points-engine.md` (classification §4 is partially stale; where
they conflict, code + this doc win)

## 0. Drift policy for this document

This spec defines **contracts and invariants** — table shapes, tier ordering,
failure semantics, and the asymmetric-error principle. It deliberately does NOT
pin tunables: the exact model ID, prompt wording, batch size, and retry counts
live in code and may change without a spec edit. If code and spec disagree on a
contract, that is a bug in one of them; if they disagree on a tunable, the code
is right.

## 1. Problem

After the static tiers run (user overrides, merchant map, Plaid detailed, Plaid
primary), the remaining unclassified spend is dominated by long-tail merchants
no hand-maintained list can cover: independent restaurants, regional gyms,
small e-commerce, ambiguous descriptors. Measured on production data
(2026-08-13): 84% of gross purchase spend classified overall, but individual
users range 60–100%, and the tail is exactly where category-card bonus
multipliers are won or lost. Misclassifying tail spend as `other` biases the
Compare leaderboard toward flat-rate cards.

## 2. Core design decision: classify the merchant, not the transaction

Classification is a function of the merchant identity, not the transaction.
One LLM call per **unique merchant key**, ever, cached globally (not per-user).
At current scale (~1–2K unique unclassified merchants, tokens measured in the
low hundreds of thousands) the total cost of classifying the entire backlog is
under a dollar on any current model; the recurring cost is a trickle of new
merchants per sync.

**Merchant key**: `merchant_entity_id` when Plaid provides one (stable across
descriptor variants), else `normalizeMerchantName(merchantName)`. Both key
kinds live in the same table; entity-ID keys are prefixed `ent:` to avoid
collisions with name keys.

## 3. Data model

```
merchant_classifications
  merchant_key   text PK      -- "ent:<plaid entity id>" or normalized name
  category       text NOT NULL -- EarnCategory (26-value taxonomy), "other" allowed
  plaid_hint     text          -- the Plaid detailed/primary category given as context
  model          text NOT NULL -- exact model ID that produced this row
  classified_at  timestamp NOT NULL
```

- **Global table** — no `userId`. A merchant's category is not user-specific;
  per-user disagreement is what `category_overrides` (Tier 0) is for.
- `category = "other"` is a **meaningful negative result** ("not bonus-eligible
  spend"), not a failure. It prevents re-submitting the merchant on every sync.
- The `model` column exists so the cache can be selectively re-run when the
  prompt or model improves: delete/re-classify `WHERE model = '<old>'`.
- Schema is applied with `npm run db:push` (see `drizzle/README.md` — this
  project does not run migrations).

## 4. Tier ordering (contract)

`classifyForPoints` resolution order after this feature:

| Tier | Source | Confidence | matchSource |
|---|---|---|---|
| 0 | `category_overrides` (user) | high | `user_override` |
| 1 | merchant map (static) | high | `merchant_name` |
| 2 | Plaid detailed category | medium | `plaid_category` |
| **L** | **`merchant_classifications` (LLM cache)** | **medium** | **`llm`** |
| 2b | Plaid primary category | low | `plaid_category` |
| 3 | fallback `other` | low | `fallback` |

Rationale for the position: Plaid detailed reflects an *observation* about the
actual transaction (MCC/entity data) and outranks an inference from the name;
the LLM's inference outranks the coarse primary-category guess. A cached LLM
`"other"` does NOT shadow Tier 2b — if the LLM said `other` but Plaid primary
maps to a category, Tier 2b still applies (the LLM abstained; the coarse
signal is better than nothing).

`MatchSource` gains an `"llm"` member. Like the overrides map, the cache is
loaded once per classification run and passed via `ClassifyContext` — 
`classifyForPoints` stays pure and synchronous; **no network I/O in the
classifier, ever**.

## 5. Write path (when entries get created)

1. **Hook**: at the end of `recomputeSummaries` (post-sync, same place the
   summaries persist), collect merchant keys whose final assignment is
   `other`/`fallback` **or** Tier 2b (low-confidence primary — the LLM may
   refine these), excluding keys already present in `merchant_classifications`.
2. **Call**: batch up to ~50 merchants per request. Each item carries the raw
   merchant string and its Plaid category hint. Structured outputs
   (`output_config.format` with the taxonomy as an enum) guarantee
   schema-valid responses — no parsing, no invalid categories.
3. **Persist**: upsert rows keyed by merchant key with the responding model ID.
4. **Effect**: entries apply on the *next* classification pass (next page load
   / next sync). The write path never blocks or fails a sync: any API error is
   logged and skipped; unclassified merchants are simply retried on a later
   sync because they remain absent from the cache.

The initial backlog (~1–2K merchants) is a one-time script
(`scripts/classify-merchants.ts`) using the same batch function; the Message
Batches API (50% price) is optional given the total is sub-dollar either way.

## 6. Prompt contract (invariants, not wording)

- The model chooses **exactly one** of the 26 `EarnCategory` values or `other`.
- The prompt must state the **error asymmetry**: a wrong bonus category
  inflates simulated card earnings (bad); `other` merely earns base rate
  (safe). Instruct: *when not confident, answer `other`.*
- The Plaid hint is provided as context but the model may contradict it
  (that's the point — e.g. `GENERAL_SERVICES_*` merchants that are actually
  fitness).
- US-market framing (the merchant strings are US card descriptors).

## 7. Model policy

- **Default: `claude-sonnet-5`** — this task is knowledge recall on obscure
  merchant names, where model capability visibly matters, and the total spend
  is a rounding error at this scale. Haiku's price advantage is meaningless
  here; Opus/Fable's reasoning advantage is wasted here.
- Before first production run, execute the **model eval**: classify the same
  ~100 real unclassified merchants (from `scripts/classification-report.ts`
  output) with `claude-haiku-4-5` and `claude-sonnet-5`; diff. If Haiku agrees
  ≥95% and disagreements are mostly `other`-calls, Haiku is acceptable.
  Record the result in this file when run.
- `ANTHROPIC_API_KEY` is required in the server environment (`.env.local` /
  Vercel env); absence disables the tier silently (log once per sync) — the
  app must function without it.

## 8. Interaction with overrides & error correction

- Tier 0 always wins: a user correction outranks the cache with no special
  logic.
- A user override that **contradicts** an existing cache row for the same key
  is the error signal for this tier. No automated action initially; the
  contradiction count is queryable (join overrides against
  `merchant_classifications`) and informs prompt/model revisions.
- Manual correction of a globally-wrong entry: update/delete the row directly
  (it's data, not code).

## 9. Observability

`scripts/classification-report.ts` gains a `tierL` line in the by-tier
breakdown (matchSource `llm`) so the tier's coverage contribution is visible,
and the top-unclassified list naturally shrinks to merchants the LLM also
abstained on — which is the residual worklist for the merchant map.

## 10. Non-goals

- No per-transaction LLM calls, no LLM in the request path of any page.
- No embeddings/fuzzy-similarity tier (revisit only if the cache approach
  plateaus).
- No automatic cache invalidation on model releases — re-runs are deliberate,
  via the `model` column.
- Not a replacement for the merchant map: high-frequency national merchants
  still belong in Tier 1 where they're free and deterministic.
